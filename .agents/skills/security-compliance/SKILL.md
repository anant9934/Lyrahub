---
name: security-compliance
description: Ensures compliance with GDPR, DPDP (India), WCAG 2.1 AA,
  and NAAC/NBA data requirements. Use when handling regulations,
  accessibility, consent, or institutional audits.
---

# Compliance & Privacy

## When to use this skill
- Adding a new data type or collection point.
- Integrating a third-party service.
- Designing consent, retention, or deletion flows.
- Preparing for NAAC/NBA audit.
- Reviewing accessibility (WCAG 2.1 AA).
- Writing privacy policy or terms of service.

## Regulations Applicable

| Regulation | Scope | Key Requirements |
|------------|-------|------------------|
| **GDPR** | EU data subjects | Consent, right to access/erasure, DPO |
| **DPDP Act (India)** | Indian residents | Consent, data localization, grievance officer |
| **WCAG 2.1 AA** | Accessibility | Contrast, keyboard, screen reader, alt text |
| **NAAC** | Institutional accreditation | Student data, outcomes, feedback |
| **NBA** | Program accreditation | CO-PO-PSO mapping, placement data |
| **IT Act 2000** | Cyber law | Reasonable security practices |

## GDPR Compliance

1. **Lawful basis**: consent for data collection.
2. **Consent**: explicit, informed, revocable.
3. **Right to access**: user can download own data within 30 days.
4. **Right to erasure**: user can request deletion within 30 days.
5. **Right to rectification**: user can correct own data.
6. **Right to portability**: user can export own data (JSON/CSV).
7. **Data breach notification**: within 72 hours.
8. **DPO**: designate a Data Protection Officer.
9. **Privacy by design**: default to minimum data.
10. **Records of processing**: maintain `PROCESSING_REGISTER.md`.

## DPDP Act (India) Compliance

1. **Consent**: clear, specific, informed, unbundled.
2. **Data localization**: store in India (Neon ap-south-1).
3. **Grievance officer**: designate one.
4. **Data fiduciary**: institution is the fiduciary.
5. **Purpose limitation**: use only for stated purpose.
6. **Storage limitation**: delete when purpose served.
7. **Security safeguards**: encryption, access control.
8. **Breach notification**: to Data Protection Board.
9. **Children's data**: parental consent (if applicable).
10. **Significant data fiduciary**: comply with additional obligations.

## WCAG 2.1 AA

1. **Contrast**: 4.5:1 for text, 3:1 for large text.
2. **Keyboard**: all functionality via keyboard.
3. **Focus visible**: clear focus indicators.
4. **Alt text**: all images have alt attributes.
5. **Semantic HTML**: headings, landmarks, lists.
6. **ARIA**: labels on interactive elements.
7. **Forms**: labels associated with inputs.
8. **Errors**: clearly described, linked to field.
9. **Skip links**: jump to main content.
10. **Reduced motion**: respect `prefers-reduced-motion`.

### WCAG checks in Unidale
- `ink` on `canvas`: 15.8:1 ✅
- `ink-500` on `surface`: 7.2:1 ✅
- `ink-400` on `surface`: 5.1:1 ✅
- `amber` on `surface`: 1.9:1 ❌ (never as text)
- `sage` on `surface`: 2.9:1 ⚠️ (large text only)

## NAAC/NBA Data

1. Student outcomes (placement, higher studies).
2. Faculty achievements (publications, grants).
3. Feedback from students, alumni, employers.
4. CO-PO-PSO mapping.
5. Curriculum review records.
6. Event and activity records.
7. All data must be exportable for audit.

## Consent Management

1. Granular consent per purpose.
2. Consent versioned (v1, v2 with timestamp).
3. Consent revocable at any time.
4. Consent logged with timestamp, IP, user-agent.
5. No bundled consent (each purpose separate).
6. Withdrawal process documented.
7. Consent language: plain, clear, no legalese.
8. Consent for minors: parental.

## Third-Party Integrations

1. Minimal — only essential services.
2. Documented in `THIRD_PARTY_REGISTER.md`.
3. Data sharing agreements in place.
4. No PII shared without consent.
5. Prefer self-hosted alternatives.
6. Regular review of third-party access.
7. No tracking pixels, no analytics that collect PII.
8. No cloud AI services for student data.

## Accessibility Audit Checklist

- [ ] All images have alt text
- [ ] All forms have labels
- [ ] All buttons have accessible names
- [ ] Focus order is logical
- [ ] Focus indicators visible
- [ ] Color contrast meets AA
- [ ] Keyboard navigation works
- [ ] Screen reader tested (NVDA/JAWS)
- [ ] Zoom 200% works
- [ ] Skip links present
- [ ] Reduced motion respected
- [ ] Language declared (`<html lang="en">`)

## Audit Output Format

For each finding:
```
[SEVERITY] Regulation — Title
Requirement: Which regulation/clause
Issue: Description
Impact: Legal/audit impact
Repro: How to verify
Fix: Recommended remediation
```
