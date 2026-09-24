---
name: token-model-selection
description: Chooses the smallest, cheapest model that meets quality bar.
  Use when adding new AI features or when quality/cost regresses.
---

# Model Selection

## When to use
- Adding a new AI feature.
- Quality regression in existing feature.
- Cost spike.
- Latency complaints.

## Model Comparison Matrix

| Task | Model | Tokens/sec | Quality | VRAM |
|------|-------|-----------|---------|------|
| Intent classification | Phi-3 Mini | Fast | Good | 4 GB |
| Text-to-SQL | Llama 3.1 8B | Medium | Excellent | 6 GB |
| Summarization | Llama 3.1 8B | Medium | Excellent | 6 GB |
| Complex reasoning | Llama 3.1 70B | Slow | Best | 40 GB |
| Embeddings | BGE-small | Very fast | Excellent | 1 GB |
| Embeddings (high quality) | BGE-large | Medium | Best | 3 GB |
| STT (real-time) | Whisper tiny | Real-time | OK | 1 GB |
| STT (quality) | Whisper small | Fast | Good | 2 GB |
| TTS | Piper | Very fast | Good | 500 MB |

## Selection Rules

1. **Start smallest.** Phi-3 Mini for classification, intent, simple tasks.
2. **Escalate only on failure.** Test quality first.
3. **Never use 70B by default.** Only for complex reasoning.
4. **Embeddings: BGE-small.** 95% of BGE-large quality.
5. **STT: Whisper small.** Sweet spot.
6. **TTS: Piper.** Good enough for mock interviews.

## A/B Testing Framework

For each candidate model:
1. Run 50 sample queries.
2. Score quality (human or LLM-as-judge).
3. Measure tokens, latency, cost.
4. Compare quality/token ratio.
5. Adopt smaller model if quality drop <5%.

## Anti-Patterns
- ❌ Defaulting to biggest model
- ❌ No A/B testing
- ❌ Ignoring latency impact
- ❌ Ignoring VRAM constraints
