"""
Cloud Provider Router — routes LLM requests through available providers
with round-robin key rotation and circuit breaker fallback.

Provider priority order is configured in CLOUD_AI_PROVIDER_ORDER.
Keys are rotated round-robin per provider to distribute load.

IMPORTANT: No provider keys are ever sent to the frontend.
"""

from __future__ import annotations

import asyncio
import time
import uuid
from typing import Optional

import httpx

from app.core.config import get_settings

settings = get_settings()

# Track round-robin index per provider in memory (process-level)
_key_index: dict[str, int] = {}


def _next_key(provider: str) -> Optional[str]:
    keys = settings.get_provider_keys(provider)
    if not keys:
        return None
    idx = _key_index.get(provider, 0)
    key = keys[idx % len(keys)]
    _key_index[provider] = (idx + 1) % len(keys)
    return key


# ─── Provider Implementations ──────────────────────────────────────────────────

async def _call_groq(prompt: str, system: str, api_key: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
                "temperature": 0.3,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "model": data.get("model", "llama-3.1-8b-instant"),
            "tokens_in": data.get("usage", {}).get("prompt_tokens"),
            "tokens_out": data.get("usage", {}).get("completion_tokens"),
        }


async def _call_cerebras(prompt: str, system: str, api_key: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.cerebras.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "llama3.1-8b",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
                "temperature": 0.3,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "model": data.get("model", "llama3.1-8b"),
            "tokens_in": data.get("usage", {}).get("prompt_tokens"),
            "tokens_out": data.get("usage", {}).get("completion_tokens"),
        }


async def _call_gemini(prompt: str, system: str, api_key: str) -> dict:
    model = "gemini-1.5-flash"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{prompt}"}]}],
                "generationConfig": {
                    "maxOutputTokens": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
                    "temperature": 0.3,
                },
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        usage = data.get("usageMetadata", {})
        return {
            "text": text,
            "model": model,
            "tokens_in": usage.get("promptTokenCount"),
            "tokens_out": usage.get("candidatesTokenCount"),
        }


async def _call_openrouter(prompt: str, system: str, api_key: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://lyrahub.aiml",
                "X-Title": "Lyrahub AIDA",
            },
            json={
                "model": "meta-llama/llama-3.1-8b-instruct:free",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "model": data.get("model", "llama-3.1-8b"),
            "tokens_in": data.get("usage", {}).get("prompt_tokens"),
            "tokens_out": data.get("usage", {}).get("completion_tokens"),
        }


async def _call_mistral(prompt: str, system: str, api_key: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "mistral-small-latest",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "model": data.get("model", "mistral-small"),
            "tokens_in": data.get("usage", {}).get("prompt_tokens"),
            "tokens_out": data.get("usage", {}).get("completion_tokens"),
        }


async def _call_sambanova(prompt: str, system: str, api_key: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            "https://api.sambanova.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": "Meta-Llama-3.1-8B-Instruct",
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": settings.CLOUD_AI_MAX_TOKENS_PER_REQUEST,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return {
            "text": data["choices"][0]["message"]["content"],
            "model": data.get("model", "Meta-Llama-3.1-8B-Instruct"),
            "tokens_in": data.get("usage", {}).get("prompt_tokens"),
            "tokens_out": data.get("usage", {}).get("completion_tokens"),
        }


_PROVIDER_FUNCS = {
    "groq": _call_groq,
    "cerebras": _call_cerebras,
    "gemini": _call_gemini,
    "openrouter": _call_openrouter,
    "mistral": _call_mistral,
    "sambanova": _call_sambanova,
}


# ─── Main Router ──────────────────────────────────────────────────────────────

async def route_to_cloud(
    prompt: str,
    system: str = "You are AIDA, the AI & ML Department intelligent assistant at Lyrahub. Be concise and professional.",
) -> dict:
    """
    Try each configured provider in priority order.
    Returns: {text, model, provider, tokens_in, tokens_out, latency_ms}
    Raises: RuntimeError if all providers fail.
    """
    provider_order = [p.strip() for p in settings.CLOUD_AI_PROVIDER_ORDER.split(",") if p.strip()]
    max_retries = settings.CLOUD_AI_MAX_PROVIDER_RETRIES
    attempts = 0
    last_error = None

    for provider in provider_order:
        if attempts >= max_retries + 1:
            break
        api_key = _next_key(provider)
        if not api_key:
            continue
        fn = _PROVIDER_FUNCS.get(provider)
        if not fn:
            continue

        start = time.monotonic()
        try:
            result = await fn(prompt, system, api_key)
            latency_ms = int((time.monotonic() - start) * 1000)
            result["provider"] = provider
            result["latency_ms"] = latency_ms
            return result
        except (httpx.HTTPStatusError, httpx.TimeoutException, httpx.RequestError) as e:
            last_error = e
            attempts += 1
            # 429 = rate limited, try next provider immediately
            # 5xx = server error, try next
            continue

    raise RuntimeError(
        f"All cloud AI providers failed after {attempts} attempt(s). Last error: {last_error}"
    )
