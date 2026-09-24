---
name: chatbot-rag
description: Builds the natural-language chatbot using local Ollama,
  Text-to-SQL, and RAG over pgvector. Use when implementing chatbot
  endpoints, embeddings, query pipelines, or LLM integration.
---

# Chatbot & RAG

## When to use this skill
- Implementing the natural-language chatbot.
- Writing Text-to-SQL logic.
- Building RAG over resumes, projects, or course content.
- Integrating local Ollama models.

## Architecture

```
User query
    ↓
Intent Classifier (regex/keywords first, small LLM fallback)
    ↓
    ├── SQL-able → Text-to-SQL → Validate → Run read-only → Format
    ├── Semantic → RAG (pgvector) → LLM → Format
    └── Hybrid → Both → Merge → LLM → Format
    ↓
Cache in Redis (TTL 1 hour for data queries)
    ↓
Return formatted result
```

## Core Rules

1. Use **local Ollama** (Llama 3.1 8B Q4). No cloud LLM.
2. Use **BGE-small-en-v1.5** for embeddings (768 dims).
3. **Cache responses** in Redis. TTL: 1 hour for data queries, 1 day for static.
4. All SQL runs on **read-only** connection.
5. **Validate SQL** against schema before execution.
6. Reject queries with `DROP`, `DELETE`, `UPDATE`, `INSERT`, `ALTER`, `TRUNCATE`.
7. Timeout: 5 seconds per query.
8. Never expose raw SQL results without formatting.
9. Never send full student data to LLM — send only relevant chunks.
10. Log every query with user_id, timestamp, latency.

## Intent Classifier

Before calling LLM, classify intent with cheap methods:

| Pattern | Intent |
|---------|--------|
| Contains "top N", "rank", "highest" | SQL ranking |
| Contains "filter", "where", "with CGPA >" | SQL filter |
| Contains "summarize", "explain", "describe" | LLM summary |
| Contains "similar to", "like", "related" | RAG |
| Otherwise | Fallback to LLM classification |

## Text-to-SQL

Prompt template:
```
You are a PostgreSQL expert. Given this schema:
{schema_with_columns_and_types}

Convert the user's question into a valid SELECT query.
Rules:
- Only SELECT statements
- Use WHERE deleted_at IS NULL for all tables
- Limit results to 1000 rows unless specified
- Return only the SQL, no explanation

User question: {question}
```

Output validation:
- Parse with `sqlparse`.
- Check only SELECT + WITH.
- Check no subqueries with DML.
- Check all tables/columns exist in schema.
- Run `EXPLAIN` before executing.

## RAG

- Chunk size: **300–500 tokens**, 10% overlap.
- Store embeddings in pgvector (768 dims for BGE-small).
- Hybrid search: **BM25 + vector**, then re-rank top 20 → top 5.
- Cache embeddings — never re-embed unchanged text.
- Use metadata filters (department, year) before vector search.

## Cost Optimization
- Intent classifier: regex/keywords first.
- Small model for SQL generation (Llama 8B).
- Cache by query pattern (hash the normalized query).
- Batch embeddings nightly.
- Fallback to Groq only if Ollama is down.

## Anti-Patterns (NEVER do these)
- ❌ Sending full database to LLM
- ❌ Executing unvalidated SQL
- ❌ Running on write connection
- ❌ No timeout
- ❌ No caching
- ❌ Calling cloud LLM by default
- ❌ Embedding the same text twice

## Testing
- Unit tests for intent classifier.
- Unit tests for SQL validator.
- Integration tests for end-to-end query.
- Test with 20 sample queries and expected SQL.

---
