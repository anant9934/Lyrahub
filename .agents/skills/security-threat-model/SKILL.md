---
name: security-threat-model
description: Proactively identifies threats using STRIDE, attack trees,
  and risk assessment. Use when designing features, reviewing
  architecture, or planning mitigations.
---

# Threat Modeling

## When to use this skill
- Designing a new feature or architecture.
- Reviewing an existing system for threats.
- Preparing for security review.
- Prioritizing security investments.
- Updating the threat model after changes.

## STRIDE Methodology

| Threat | Description | Example | Mitigation |
|--------|-------------|---------|------------|
| **S**poofing | Impersonate user/service | Stolen JWT | MFA, short tokens |
| **T**ampering | Modify data in transit/rest | Change CGPA in DB | Encryption, audit logs |
| **R**epudiation | Deny action | User denies export | Signed audit logs |
| **I**nformation Disclosure | Leak data | Cross-user RAG | Access control, masking |
| **D**enial of Service | Overwhelm system | Spam chatbot | Rate limits, queue |
| **E**levation of Privilege | Gain higher access | IDOR | RBAC, scope checks |

## Threat Modeling Process

### 1. Define Scope
- What system/feature?
- What data is involved?
- Who are the users?
- What are the trust boundaries?

### 2. Diagram the System
- Data flow diagram (DFD).
- Trust boundaries marked.
- External entities identified.
- Data stores identified.

### 3. Identify Threats (STRIDE)
For each component and data flow, ask:
- Can someone spoof this?
- Can someone tamper with this?
- Can someone deny this action?
- Can someone learn from this?
- Can someone overwhelm this?
- Can someone escalate via this?

### 4. Assess Risk
```
Risk = Likelihood × Impact

Likelihood: 1 (low) to 5 (high)
Impact: 1 (low) to 5 (high)
Risk Score: 1–25

Critical: 20–25
High: 12–19
Medium: 6–11
Low: 1–5
```

### 5. Prioritize Mitigations
- Fix Critical first.
- Fix High next cycle.
- Medium backlog.
- Low accept or monitor.

### 6. Document
Maintain `THREAT_MODEL.md` with:
- System overview
- Data flow diagram
- Threat list
- Risk assessment
- Mitigations
- Residual risk

## Attack Trees

Example: Steal student data

```
Goal: Steal student data
├── OR Compromise user account
│   ├── AND Phish credentials
│   ├── OR Brute force password
│   └── OR Steal session token
├── OR Compromise server
│   ├── OR RCE via unpatched dependency
│   └── OR Misconfigured cloud storage
├── OR Exploit API
│   ├── OR IDOR (access other's data)
│   └── OR Missing auth on endpoint
└── OR Insider threat
    ├── OR Rogue admin
    └── OR Compromised faculty account
```

For each leaf, identify mitigations.

## Trust Boundaries (AI/ML Hub)

| Boundary | Between | Threats |
|----------|---------|---------|
| Browser ↔ Cloudflare | Internet | MITM, DDoS |
| Cloudflare ↔ Vercel | CDN | Tampering |
| Vercel ↔ Render | HTTPS | Sniffing |
| Render ↔ Neon | TLS | DB compromise |
| Render ↔ R2 | TLS | File leak |
| Render ↔ Local AI | Tunnel | Model access |
| Admin ↔ DB | VPC | Credential theft |
| User ↔ User | App | IDOR, XSS |

## Risk Register Template

```markdown
| ID | Threat | STRIDE | Likelihood | Impact | Risk | Mitigation | Residual |
|----|--------|--------|------------|--------|------|------------|----------|
| T1 | Stolen JWT | S | 3 | 4 | 12 | Short expiry, rotation | Low |
| T2 | SQL injection | T | 2 | 5 | 10 | ORM, parameterized | Low |
| T3 | Prompt injection | T | 4 | 3 | 12 | Sanitize, delimit | Medium |
| T4 | Cross-user RAG | I | 3 | 4 | 12 | Per-user namespace | Low |
```

## Anti-Patterns (NEVER)

- ❌ No threat model
- ❌ Threat model not updated after changes
- ❌ Ignoring low-likelihood/high-impact threats
- ❌ No risk prioritization
- ❌ Security by obscurity
- ❌ Assuming "it won't happen to us"
- ❌ No residual risk documentation

## Audit Output Format

For each threat:
```
[RISK] STRIDE — Threat Title
Component: Where
Attack: How it works
Likelihood: 1–5
Impact: 1–5
Risk Score: 1–25
Mitigation: Recommended
Residual Risk: After mitigation
```
