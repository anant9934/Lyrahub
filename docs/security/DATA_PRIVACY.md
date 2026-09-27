# AIMETRA — Data Privacy & DPDP Compliance Guide

This document outlines AIMETRA's data protection architecture, PII classification, and alignment with India's Digital Personal Data Protection (DPDP) standards.

---

## 1. Core Privacy Principles

AIMETRA adheres to the following principles:
1. **Data Minimization:** Only data strictly necessary for academic tracking, career intelligence, and departmental mentorship is collected.
2. **Purpose Limitation:** Academic data collected is used solely for department administration, student skill development, and verified opportunity placement.
3. **Storage Limitation:** Inactive or deleted accounts trigger soft deletion immediately and hard purging according to the retention schedule.
4. **Transparency & Consent:** Explicit notice and consent records for data processing upon initial account registration.

---

## 2. Institutional Data Classification Matrix

| Category | Data Elements | Storage Security | Access Boundary | Retention Period |
|---|---|---|---|---|
| **Confidential / Sensitive** | Password hashes, phone numbers, home addresses, CGPA/marks, resume PDFs | Encrypted at rest, Argon2id, R2 private | User (own), Assigned Mentor, HOD, Admin | Active student enrollment + 1 year |
| **Internal Academic** | Registration number, batch, section, enrolled courses, attendance records | PostgreSQL database, SSL connection | Department Faculty, Staff, Leadership | 5 years post-graduation |
| **Public Academic** | Student full name, public GitHub/LinkedIn links, verified project showcases | Publicly indexable frontend routes | Public / Authenticated Users | Indefinite (or until user requests unpublishing) |

---

## 3. Alignment with India's DPDP Framework

### 3.1 Consent Management & Notice
* Users are presented with a clear privacy notice detailing data categories collected, processing purposes, and departmental usage before account onboarding.
* Explicit affirmative consent recorded with timestamp and policy version.

### 3.2 Right to Access & Correction
* Students can view their complete profile data, uploaded documents, and skill scores at any time via `/api/v1/students/me`.
* Inaccurate biographical or portfolio links can be updated directly; academic grade corrections route through faculty verification workflows.

### 3.3 Right to Erasure / Data Deletion
* Students graduating or leaving the institution may initiate an account deletion request.
* Upon confirmation:
  1. Personal identification attributes are anonymized or purged.
  2. Uploaded resume files and private documents in storage are deleted.
  3. Historical audit records retain pseudo-anonymized IDs to maintain institutional audit integrity without preserving identifying personal data.

### 3.4 Data Localization & Sovereign Infrastructure
* Primary database workloads are hosted in Indian cloud regions (e.g., Neon AWS `ap-south-1` Mumbai) to adhere to data localization requirements.
* Edge caching and content distribution nodes maintain strict TLS 1.3 encryption across Indian points of presence.

---

## 4. Log Sanitization & Redaction

Application logs and monitoring payloads automatically mask sensitive attributes using regular expressions:
* Passwords and tokens replaced with `[REDACTED]`
* Email addresses masked: `j***e@institution.edu`
* Phone numbers masked: `+91-XXXXX-XXXXX`
* No raw resume content or student transcripts are ever written to stdout or third-party log collectors.
