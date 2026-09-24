---
name: architecture-ai
description: Designs AI stack — models, serving, RAG, Text-to-SQL,
  fallbacks, and cost controls. Use when designing AI features.
---

# AI/ML Architecture

## When to use
- Designing chatbot, RAG, or AI features.
- Choosing models or serving infrastructure.
- Planning inference pipelines.
- Designing AI cost controls.

## Model Stack
| Task | Model | Runtime |
|------|-------|---------|
| Chatbot | Llama 3.1 8B Q4 | Ollama → vLLM |
| Intent | Phi-3 Mini | Ollama |
| Embeddings | BGE-small | sentence-transformers |
| STT | faster-whisper small | Python |
| TTS | Piper | Python |
| OCR | PyMuPDF + Tesseract | Python |

## Inference Pipeline
```
Query → Intent Classify → 
  SQL path: Text-to-SQL → Validate → Execute read-only
  RAG path: Embed → Vector search → Rerank → LLM
  Hybrid: Both → Merge → LLM
→ Cache → Format → Return
```

## Cost Controls
- All models local (₹0 per query).
- Cache responses (Redis, 1-hr TTL).
- Batch embeddings nightly.
- Token caps per request (4096).
- Rate limits per user.
- Kill switch for AI features.

## Fallback Strategy
- Local AI down → Groq free tier.
- Groq down → cached response or friendly error.
- Never silently fail.

## Anti-Patterns
- ❌ Cloud LLM by default
- ❌ No caching
- ❌ No rate limits
- ❌ No fallback
- ❌ Full DB to LLM
- ❌ No validation of LLM output
