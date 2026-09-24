---
name: token-context
description: Minimizes tokens in context windows via summarization,
  truncation, sliding windows, and RAG. Use when designing LLM calls
  or agent context.
---

# Context Window Management

## When to use
- Designing any LLM call.
- Managing agent conversation context.
- Handling long documents or chat history.
- Debugging context overflow errors.

## Context Budget Targets

| Call Type | Max Input Tokens | Max Output Tokens |
|-----------|-----------------|-------------------|
| Intent classification | 500 | 50 |
| Text-to-SQL | 2000 | 300 |
| RAG answer | 3000 | 500 |
| Summarization | 4000 | 300 |
| Agent (Antigravity) | 30000 | 2000 |

## Strategies (in order of preference)

### 1. RAG (retrieve only relevant chunks)
Instead of sending full documents, retrieve top-K relevant chunks.
Saves 80–95% of tokens.

### 2. Summarization
After 5 turns, summarize conversation history into 1 paragraph.
Saves 60–80% on long chats.

### 3. Sliding Window
Keep only last N turns + summary of earlier turns.
N = 5 for chatbots, 10 for agents.

### 4. Truncation
If document > limit, truncate with "…" and note truncation.
Last resort — prefer RAG.

### 5. Compression
Remove whitespace, comments, boilerplate from code/JSON.
Saves 10–30%.

## Rules
1. Never send full DB to LLM.
2. Never send full file if only a section is needed.
3. Never repeat system prompt in every turn.
4. Never include unused few-shot examples.
5. Always set `max_tokens` on every call.
6. Always track input + output tokens per call.
7. Flag any call >4000 input tokens for review.
8. Use structured output (JSON schema) to reduce output tokens.

## Anti-Patterns
- ❌ Full context injection
- ❌ No max_tokens limit
- ❌ Repeating system prompt
- ❌ 5+ few-shot examples
- ❌ Sending entire conversation history
