# AIMETRA — Search Engine Optimization (SEO) Audit

**Target Brand:** AIMETRA (Department of Artificial Intelligence & Machine Learning)  
**Standard:** Clean semantic HTML, Unique Metadata, OpenGraph & Twitter Cards, Schema.org JSON-LD, Sitemap & Robots Validation  

---

## 1. Metadata Verification Matrix

| Route | Title | Description | Canonical URL | Status |
|---|---|---|---|---|
| `/` | `AIMETRA — AI & ML Education, Talent, Research & Analytics` | The intelligence layer for the AI & ML department... | `https://aimetra.institution.edu` | ✅ VERIFIED |
| `/about` | `About AIMETRA \| Department of Artificial Intelligence...` | Learn about AIMETRA — the institutional intelligence layer... | `https://aimetra.institution.edu/about` | ✅ VERIFIED |
| `/people` | `People & Faculty Directory \| AIMETRA` | Directory of professors, researchers, and academic leaders... | `https://aimetra.institution.edu/people` | ✅ VERIFIED |
| `/programs` | `Degree Programs & Minors \| AIMETRA` | Academic degrees, specializations, and curriculum tracks... | `https://aimetra.institution.edu/programs` | ✅ VERIFIED |
| `/research` | `Research Thrusts & Publications \| AIMETRA` | Advancing the frontiers of machine intelligence... | `https://aimetra.institution.edu/research` | ✅ VERIFIED |
| `/events` | `Events, Seminars & Hackathons \| AIMETRA` | Department calendar of hackathons, workshops, and lectures... | `https://aimetra.institution.edu/events` | ✅ VERIFIED |
| `/contact` | `Contact the Department \| AIMETRA` | Institutional secretariat, academic helpdesks, and campus address... | `https://aimetra.institution.edu/contact` | ✅ VERIFIED |
| `/privacy` | `Institutional Privacy Policy \| AIMETRA` | Data governance, student record privacy, and retention standards... | `https://aimetra.institution.edu/privacy` | ✅ VERIFIED |
| `/terms` | `Terms of Service & Acceptable Use \| AIMETRA` | Academic charter, computational resource quotas, and code of conduct... | `https://aimetra.institution.edu/terms` | ✅ VERIFIED |
| `/security` | `Security Architecture & Compliance \| AIMETRA` | TLS 1.3 transport, AES-256 encryption at rest, and RBAC matrix... | `https://aimetra.institution.edu/security` | ✅ VERIFIED |

---

## 2. Crawler & Discovery Infrastructure

### XML Sitemap (`/sitemap.xml`)
- Generated via dynamic Next.js App Router handler `src/app/sitemap.ts`.
- Exclusively indexes public, canonical, production routes.
- Completely isolates authenticated dashboards (`/dashboard`), internal review paths, and test attempts.
- HTTP Status: `200 OK`.

### Robots Policy (`/robots.txt`)
- Generated via `src/app/robots.ts`.
- Explicitly allows all public landing, departmental, program, and event pages.
- Disallows `/dashboard/`, `/attendance/`, `/ranking/`, `/approvals/`, `/tests/`, `/api/`.
- Links to canonical sitemap at `https://aimetra.institution.edu/sitemap.xml`.
- HTTP Status: `200 OK`.

### LLM Public Specification (`/llms.txt`)
- Created at `public/llms.txt`.
- Provides structured context for AI agents and search summarizers without leaking secrets or private data.
- HTTP Status: `200 OK`.

---

## 3. Structured Data (Schema.org JSON-LD)

Implemented in `src/app/layout.tsx`:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": "https://aimetra.institution.edu/#organization",
      "name": "AIMETRA — Department of Artificial Intelligence & Machine Learning",
      "url": "https://aimetra.institution.edu"
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://aimetra.institution.edu/#application",
      "name": "AIMETRA",
      "applicationCategory": "EducationalApplication"
    }
  ]
}
```
- No fabricated reviews, fake star ratings, or invented customer numbers.
- Fully matches visible on-page content.
