# /context-trim — Trim Context for an LLM Call

1. Invoke @token-context.
2. Input: current context + task.
3. Apply: RAG → Summarize → Sliding window → Truncate.
4. Report tokens before/after.
5. Verify quality retained (sample test).
