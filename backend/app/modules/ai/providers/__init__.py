"""providers package — AIDA AI provider abstractions."""
from app.modules.ai.providers.ollama_provider import OllamaProvider, get_ollama_provider

__all__ = ["OllamaProvider", "get_ollama_provider"]
