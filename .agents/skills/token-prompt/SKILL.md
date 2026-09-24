---
name: token-prompt
description: Reduces prompt token count without losing quality. Use when
  writing or reviewing any prompt for LLM or agent.
---

# Prompt Optimization

## When to use
- Writing new system prompts.
- Reviewing existing prompts.
- A/B testing prompt variants.
- Reducing per-call cost.

## Target Token Counts

| Prompt Type | Target |
|-------------|--------|
| System prompt | <200 tokens |
| Few-shot examples | 1–2, <100 tokens each |
| Task instruction | <100 tokens |
| Full prompt | <500 tokens (excluding context) |

## Techniques

### 1. Remove Redundancy
Before:
```
You are a helpful assistant. You should be helpful. Your job is to help
users. Always be helpful and answer questions helpfully.
```
After:
```
You are a helpful assistant.
```

### 2. Structured Output
Before:
```
Please return the results in JSON format with fields for name, cgpa,
and skills. Make sure it's valid JSON.
```
After:
```
Return JSON: {name, cgpa, skills[]}
```

### 3. Compact Few-Shot
Before: 3 examples × 200 tokens = 600 tokens.
After: 1 example × 100 tokens = 100 tokens. Same quality.

### 4. Delimiters Over Labels
Before:
```
The user's question is: {query}
The context is: {context}
```
After:
```
Q: {query}
C: {context}
```

### 5. Abbreviations (only when unambiguous)
Before: `certifications, projects, achievements`
After: `certs, projs, achievements`

### 6. Remove Politeness
Before: `Please kindly provide...`
After: `Provide...`

## Rules
1. Every token must earn its place.
2. No polite filler.
3. No repetition of instructions.
4. Structured output > verbose description.
5. 1–2 examples, not 5.
6. Test quality after reducing — never assume.

## A/B Testing
Track:
- Quality score (human or LLM-as-judge)
- Token count
- Latency
- Cost

Only adopt shorter prompt if quality drop <5%.

## Anti-Patterns
- ❌ Polite filler
- ❌ Repeating instructions
- ❌ Verbose output format descriptions
- ❌ 5+ few-shot examples
- ❌ Cutting tokens without testing quality
