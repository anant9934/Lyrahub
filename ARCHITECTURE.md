# Lyrahub Architecture

## Overview
Lyrahub is the AI/ML Department Hub, acting as the single source of truth for student rankings, projects, and placements. It centralizes and evaluates talent to elevate the department's visibility and operational efficiency.

## Tech Stack
*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui.
*   **Backend:** Python FastAPI, SQLAlchemy 2.0 (async), pgvector.
*   **Database:** PostgreSQL (Neon) with pgvector for embeddings.
*   **Caching/State:** Redis (for rate limiting, token blacklisting, and caching).
*   **Authentication:** JWT with asymmetric rotation, role-based access control (RBAC) powered by Casbin.

## Design System (Unidale)
*   **Aesthetic:** Clean, geometric, academic.
*   **Colors:** Sage (`#94BD88`), Amber (`#EE8E1E`), Canvas (`#F2F2F1`), Surface (`#FFFFFF`), Ink (`#1E1E1E`), Border (`#D6D6D6`).
*   **Typography:** Geist Sans & Geist Mono.

## Key Modules
1.  **Auth & Security:** JWT tokens, Casbin permissions, redis token blacklist.
2.  **Student Profiles:** Parsing resumes (Phase 2), managing portfolios and skills.
3.  **Ranking Engine:** AHP/TOPSIS for multi-criteria placement ranking.
4.  **AI Assistant:** RAG-powered natural language querying over pgvector.

## Deployment Strategy
*   **Frontend:** Vercel (Edge network).
*   **Backend:** Render / Railway (Dockerized).
*   **Database:** Neon (Serverless Postgres).
*   **Assets:** Cloudflare R2 / AWS S3.
