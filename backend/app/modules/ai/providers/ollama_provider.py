"""
Ollama Provider — local LLM inference via Ollama REST API.

This module provides:
  - OllamaProvider: health check, chat, embeddings
  - Lazy initialization (no startup cost when Ollama is not used)
  - Graceful degradation when Ollama is offline

Usage:
    provider = OllamaProvider()
    if await provider.is_available():
        result = await provider.chat(model_id, messages, system)
"""

from __future__ import annotations

import asyncio
import time
from typing import Optional

import httpx

from app.core.config import get_settings
from app.modules.ai.model_registry import ModelEntry, get_primary_local_llm, get_embedding_model

settings = get_settings()

_OLLAMA_BASE = getattr(settings, "OLLAMA_URL", "http://localhost:11434")
_TIMEOUT = 120          # seconds — local inference can be slow
_EMBED_TIMEOUT = 30


class OllamaProvider:
    """
    Capability-aware Ollama provider.
    Singleton-pattern: instantiate once per application lifecycle.
    """

    def __init__(self, base_url: str | None = None) -> None:
        self._base = (base_url or _OLLAMA_BASE).rstrip("/")
        self._available: Optional[bool] = None  # cached liveness
        self._cached_models: list[str] = []

    # ── Health ─────────────────────────────────────────────────────────────────

    async def is_available(self) -> bool:
        now = time.time()
        if hasattr(self, "_last_checked") and (now - self._last_checked) < 30 and self._available is not None:
            return self._available

        self._last_checked = now
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                resp = await client.get(f"{self._base}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    self._cached_models = [m["name"] for m in data.get("models", [])]
                    self._available = True
                    return True
        except Exception:
            pass
        self._available = False
        return False

    async def list_models(self) -> list[str]:
        """Returns list of locally available model names."""
        if not await self.is_available():
            return []
        return self._cached_models

    async def model_loaded(self, model_id: str) -> bool:
        """Returns True if the model is available locally (downloaded)."""
        models = await self.list_models()
        # Ollama model names may include tags — check prefix match
        return any(m.startswith(model_id.split(":")[0]) for m in models)

    # ── Chat / Generation ─────────────────────────────────────────────────────

    async def chat(
        self,
        model_id: str,
        messages: list[dict],
        system: str | None = None,
        max_tokens: int = 1000,
        temperature: float = 0.1,
        stream: bool = False,
    ) -> dict:
        """
        Chat completions via Ollama /api/chat endpoint.

        Returns: {text, model, tokens_in, tokens_out, latency_ms, provider}
        Raises: RuntimeError on failure.
        """
        payload: dict = {
            "model": model_id,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        if system:
            # Prepend system as first message
            payload["messages"] = [{"role": "system", "content": system}] + messages

        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(f"{self._base}/api/chat", json=payload)
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama HTTP error {e.response.status_code}: {e.response.text[:200]}")
        except httpx.TimeoutException:
            raise RuntimeError(f"Ollama timed out after {_TIMEOUT}s for model {model_id}")
        except httpx.RequestError as e:
            raise RuntimeError(f"Ollama connection failed: {e}")

        latency_ms = int((time.monotonic() - start) * 1000)
        text = data.get("message", {}).get("content", "")
        usage = data.get("prompt_eval_count"), data.get("eval_count")

        return {
            "text": text,
            "model": model_id,
            "provider": "ollama",
            "tokens_in": usage[0],
            "tokens_out": usage[1],
            "latency_ms": latency_ms,
        }

    async def generate(
        self,
        model_id: str,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 1000,
        temperature: float = 0.1,
    ) -> dict:
        """
        Simple generation via /api/generate (no chat format needed).
        Slightly faster for single-turn non-chat prompts.
        """
        payload: dict = {
            "model": model_id,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        if system:
            payload["system"] = system

        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(f"{self._base}/api/generate", json=payload)
                resp.raise_for_status()
                data = resp.json()
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama HTTP error {e.response.status_code}")
        except Exception as e:
            raise RuntimeError(f"Ollama error: {e}")

        latency_ms = int((time.monotonic() - start) * 1000)
        return {
            "text": data.get("response", ""),
            "model": model_id,
            "provider": "ollama",
            "tokens_in": data.get("prompt_eval_count"),
            "tokens_out": data.get("eval_count"),
            "latency_ms": latency_ms,
        }

    # ── Embeddings ─────────────────────────────────────────────────────────────

    async def embed(self, model_id: str, text: str) -> list[float]:
        """
        Generate embedding vector for text via Ollama /api/embeddings.

        Returns: list[float] (dimension depends on model; nomic-embed-text = 768)
        Raises: RuntimeError on failure.
        """
        try:
            async with httpx.AsyncClient(timeout=_EMBED_TIMEOUT) as client:
                resp = await client.post(
                    f"{self._base}/api/embeddings",
                    json={"model": model_id, "prompt": text},
                )
                resp.raise_for_status()
                data = resp.json()
                return data["embedding"]
        except httpx.RequestError as e:
            raise RuntimeError(f"Ollama embed connection failed: {e}")
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Ollama embed HTTP error {e.response.status_code}")

    async def embed_batch(self, model_id: str, texts: list[str]) -> list[list[float]]:
        """Embed multiple texts sequentially (Ollama doesn't support batch natively)."""
        results = []
        for text in texts:
            embedding = await self.embed(model_id, text)
            results.append(embedding)
        return results

    # ── Structured Output ─────────────────────────────────────────────────────

    async def extract_json(
        self,
        model_id: str,
        prompt: str,
        system: str | None = None,
        max_tokens: int = 500,
    ) -> dict:
        """
        Attempt JSON extraction with format enforcement.
        Falls back to raw text parsing if model doesn't support format.
        """
        import json
        full_system = (
            (system + "\n\n" if system else "") +
            "Respond ONLY with valid JSON. No markdown fences. No explanation."
        )
        result = await self.generate(
            model_id, prompt, system=full_system, max_tokens=max_tokens, temperature=0.0
        )
        text = result["text"].strip()
        # Strip markdown fences if model added them
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"raw": text}


# ── Module-level singleton ─────────────────────────────────────────────────────
_ollama_provider: OllamaProvider | None = None


def get_ollama_provider() -> OllamaProvider:
    """Returns the module-level Ollama provider singleton (lazy init)."""
    global _ollama_provider
    if _ollama_provider is None:
        _ollama_provider = OllamaProvider()
    return _ollama_provider
