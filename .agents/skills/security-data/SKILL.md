---
name: security-data
description: Protects data at rest, in transit, and in use — encryption,
  PII handling, access control, retention, audit logs, and backups.
  Use when handling student data, files, exports, or backups.
---

# Data Security

## When to use this skill
- Designing or reviewing schema with PII.
- Implementing file upload, download, or export.
- Handling student records, marks, or placement data.
- Auditing access control on data.
- Designing backup, retention, or deletion flows.

## Data Classification

| Class | Examples | Controls |
|-------|----------|----------|
| **Public** | Course catalog, events | No special controls |
| **Internal** | Faculty directory | Auth required |
| **Confidential** | Student CGPA, projects | RBAC + encryption |
| **Restricted** | PII, phone, address, CV | RBAC + encryption + audit |
| **Critical** | Passwords, tokens, keys | Never logged, never exported |

## Encryption

### At Rest
1. Database: AES-256 (Neon default).
2. Files: AES-256 (R2 default).
3. Backups: AES-256 + separate key.
4. Sensitive columns: application-level encryption for phone, address.
5. Encryption keys in Vault or Docker secrets — never in code.

### In Transit
1. TLS 1.3 for all traffic.
2. Certificate pinning for internal services (optional).
3. No unencrypted protocols (no HTTP, no plain Redis).

### In Use
1. PII masked in logs.
2. PII masked in UI for non-owners.
3. Memory zeroing for passwords (where possible).
4. No PII in error messages.

## PII Handling

### What counts as PII
- Name, email, phone, address, DOB, gender
- Reg. no, roll no
- Parent/guardian info
- Photos, signatures
- Academic records (CGPA, marks)
- Financial info (stipends, fees)

### Rules
1. **Data minimization**: collect only what's needed.
2. **Purpose limitation**: use only for stated purpose.
3. **Storage limitation**: delete when no longer needed.
4. **Access control**: role-based, least privilege.
5. **Audit trail**: every access to PII is logged.
6. **Right to access**: user can download own data.
7. **Right to erasure**: user can request deletion.
8. **Right to rectification**: user can correct own data.
9. **No third-party sharing** without explicit consent.
10. **No AI training** on student data without consent.

## Access Control on Data

1. Students see only own data (except public profile fields).
2. Faculty see only mentees' data (scoped).
3. HOD sees department-wide data.
4. Admin sees all, but every access logged.
5. Exports require explicit permission.
6. Exports are watermarked with requester ID.
7. Bulk exports logged and reviewed.
8. Field-level masking for sensitive fields.

## Retention Policy

| Data Type | Retention | After Retention |
|-----------|-----------|-----------------|
| Student profile | 10 years | Archive |
| Faculty profile | 10 years | Archive |
| Audit logs | 7 years | Archive |
| Documents | 5 years | Delete |
| Recordings (AI interview) | 90 days | Delete |
| Session data | 30 days | Delete |
| Analytics | 3 years | Aggregate |
| Backups | 30 days rolling | Delete |

## Backup Security

1. Encrypted at rest (AES-256).
2. Encrypted in transit (TLS).
3. Offsite in different region.
4. Access restricted to admins.
5. Restore tested monthly.
6. Immutable (no deletion without approval).
7. Separate credentials from production.
8. Air-gapped copy for critical data.

## Audit Logs

1. Every data access logged: who, what, when, from where.
2. Every data modification logged with before/after.
3. Every export logged with filters applied.
4. Every deletion logged with reason.
5. Logs are append-only (immutable).
6. Logs stored separately from main DB.
7. Logs encrypted at rest.
8. Log retention: 7 years.
9. Log access restricted to auditors.
10. Log integrity verified via checksums.

## Data Localization

1. All data stored in India (for DPDP compliance).
2. No cross-border transfer without consent.
3. Neon region: ap-south-1 (Mumbai) preferred.
4. R2 region: nearest to India.
5. Document data flows in architecture diagram.

## Anti-Patterns (NEVER)

- ❌ PII in logs
- ❌ PII in URLs or query params
- ❌ Unencrypted backups
- ❌ Shared admin accounts
- ❌ No audit trail
- ❌ Exporting without permission
- ❌ Storing CVs in DB (use R2)
- ❌ Cross-border data transfer without consent
- ❌ Third-party AI processing student data
- ❌ Hardcoded encryption keys

## Audit Output Format

For each finding:
```
[SEVERITY] Category — Title
Data: What data is affected
Issue: Description
Impact: Privacy/legal/compliance impact
Repro: How to verify
Fix: Recommended remediation
```
