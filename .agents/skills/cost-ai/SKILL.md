---
name: cost-ai
description: Ensures AI stack stays at ₹0 via local models, caching,
  batching, and fallbacks. Use when auditing or forecasting AI costs.
---

# AI Cost Management

## When to use
- Auditing AI usage.
- Designing new AI features.
- Planning GPU capacity.
- Reviewing fallback costs.

## Hard Rules
1. All inference runs locally. No cloud LLM by default.
2. Fallback to Groq (free tier) only if local down.
3. Every query cached (Redis, 1-hr TTL).
4. Embeddings batched nightly.
5. Token caps per request.
6. Rate limits per user.

## Cost Model
| Component | Cost |
|-----------|------|
| Ollama (self-hosted) | ₹0 (electricity) |
| BGE embeddings | ₹0 |
| Whisper STT | ₹0 |
| Piper TTS | ₹0 |
| GPU server (one-time) | ₹80K–2L |
| Electricity (monthly) | ₹500–1500 |
| Groq fallback | ₹0 (free tier) |
| **Total** | **₹500–1500/month** |

## GPU Sizing
| Model | VRAM | GPU |
|-------|------|-----|
| Phi-3 Mini | 4 GB | Any modern GPU |
| Llama 3.1 8B Q4 | 6–8 GB | RTX 3060 |
| Llama 3.1 8B FP16 | 16 GB | RTX 4090 |
| Whisper small | 2 GB | CPU ok |

## Anti-Patterns
- ❌ Cloud LLM without approval
- ❌ No caching
- ❌ No token caps
- ❌ Over-provisioned GPU
