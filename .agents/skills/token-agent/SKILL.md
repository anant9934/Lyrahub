---
name: token-agent
description: Optimizes tokens consumed by Antigravity agents themselves.
  Use when writing AGENTS.md, SKILL.md, or managing dev cycles.
---

# Agent Token Optimization

## When to use
- Writing or editing AGENTS.md.
- Writing or editing SKILL.md files.
- Managing agent conversations.
- Reviewing dev cycle token usage.

## Targets

| File | Target Tokens |
|------|--------------|
| AGENTS.md (total) | <5000 |
| Each SKILL.md | <1500 |
| Each workflow | <300 |
| Agent conversation | <30000 per cycle |

## AGENTS.md Optimization
1. One paragraph per agent (goal + 3–5 responsibilities).
2. No repeated context across agents.
3. No examples inside AGENTS.md (put in SKILL.md).
4. No boilerplate ("You are a helpful...").
5. Reference skills by name only.

## SKILL.md Optimization
1. YAML frontmatter: name + description only.
2. Core rules as bullet list.
3. One example max.
4. Anti-patterns list.
5. No repeated rules across skills.

## Agent Conversation Optimization
1. Use @-mentions instead of full file dumps.
2. Reference skills by name, not content.
3. Summarize after 10 turns.
4. Clear context between unrelated tasks.
5. Use `/plan-only` for scoping before full cycles.

## Lazy Loading
- Skills load only when task matches description.
- Workflows invoked explicitly.
- Agents invoked explicitly via @.
- No auto-loading of all skills.

## Per-Cycle Budget
| Cycle Type | Target Tokens |
|------------|--------------|
| Plan only | <10000 |
| Small feature | <30000 |
| Full phase | <100000 |
| Full SDLC cycle | <500000 |

## Anti-Patterns
- ❌ Bloating AGENTS.md
- ❌ Duplicating rules across skills
- ❌ Full file dumps in prompts
- ❌ No context clearing
- ❌ Never summarizing
