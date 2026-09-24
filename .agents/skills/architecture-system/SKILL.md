---
name: architecture-system
description: Designs overall system structure — services, layers, boundaries,
  deployment topology, and failure modes. Use when designing or reviewing
  system architecture.
---

# System Architecture

## When to use
- Designing a new service or major feature.
- Reviewing scaling decisions.
- Planning deployment topology.
- Evaluating monolith vs microservices.

## Core Rules
1. Bias toward **modular monolith** over microservices at this scale.
2. Clear **domain boundaries** (students, faculty, ranking, chatbot, admin).
3. Every external dependency can fail — design for it.
4. Every service is **stateless** (except data stores).
5. Prefer **async** communication for non-blocking flows.
6. Every service has **health checks** (/live, /ready, /deep).
7. Every service emits **metrics, logs, traces**.
8. Deployment: Docker + Docker Compose → K8s only if needed.
9. Document with **C4 diagrams** (Context, Container, Component, Code).
10. Every significant decision becomes an **ADR**.

## C4 Diagram Levels
- **L1 Context**: system + external actors (users, satellites, cloud).
- **L2 Container**: services, DBs, caches, queues, storage.
- **L3 Component**: modules inside each service.
- **L4 Code**: only for complex components.

## Failure Modes
- Circuit breakers on all external calls.
- Timeouts everywhere (HTTP 5s, DB 10s, AI 30s).
- Retries with exponential backoff.
- Fallbacks (local AI → cloud AI, cache → DB).
- Graceful degradation (AI down → core still works).

## Anti-Patterns
- ❌ Distributed monolith
- ❌ Shared database between services
- ❌ Synchronous chains >3 hops
- ❌ No health checks
- ❌ No observability
- ❌ Premature microservices
