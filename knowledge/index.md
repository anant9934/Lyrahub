# Lyrahub Department Knowledge Index

This is the OKF (Organized Knowledge Framework) master index.
AIDA uses this to find relevant knowledge before running RAG or calling an LLM.

## Categories

| Category | Description | Documents |
|---|---|---|
| department | Department overview, stats, structure | General info |
| leadership | HOD, COS, HOS profiles | Leadership data |
| programs | Degree programs (B.Tech AI/ML, M.Tech, PhD) | Academic programs |
| courses | Individual course syllabi, outcomes | Course details |
| faculty | Faculty research areas, bios | Faculty info |
| projects | Project descriptions, outcomes | Student projects |
| policies | Academic policies, rules | Regulations |
| events | Past and upcoming events | Events |
| research | Research publications, areas | Research outputs |
| reports | Annual/department reports | Aggregate reports |

## Query Routing Guide

| Query Type | Category | Route |
|---|---|---|
| "Tell me about B.Tech AI/ML" | programs | OKF → programs/ |
| "What courses does the department offer?" | courses | OKF → courses/ or SQL |
| "Who is the HOD?" | leadership | OKF → leadership/ |
| "What research is happening in NLP?" | research, faculty | OKF → research/ + faculty/ |
| "What are the department policies?" | policies | OKF → policies/ |
| "List upcoming events" | events | SQL → events table |
| "How many students?" | department | SQL → students table |
| "Summarize student project on RAG" | projects | RAG → project documents |
