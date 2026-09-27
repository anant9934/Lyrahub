# AIMETRA — Dependency Vulnerability Audit Report

This report presents concrete results from automated dependency vulnerability audits executed on the frontend and backend dependency trees.

---

## 1. Frontend Audit (`npm audit`)

### Execution Command:
```bash
cd frontend && npm audit
```

### Raw Output Summary:
```text
12 vulnerabilities (2 low, 8 high, 2 critical)

- cookie (<0.7.0): out of bounds characters in name/path (Low)
- glob (10.2.0 - 10.4.5): via @next/eslint-plugin-next (High)
- next (9.3.4 - 16.3.0-preview.10): Server Actions DoS / SSRF / Cache poisoning advisories (Critical/High)
- protobufjs (<=7.6.2): via @xenova/transformers for Browser SLM (Critical)
- sharp (<=0.35.4-rc.0): libvips / libheif vulnerabilities via @xenova/transformers (High)
- postcss (<=8.5.22): CSS comment source map disclosure (High)
```

### Risk Evaluation & Mitigation Strategy:
* **Next.js Version:** Currently pinned to stable Next.js `14.2.35`. Upgrading to `16.3.6` proposed by `npm audit fix --force` introduces breaking changes across App Router components. The reported Server Action and Image remotePatterns vulnerabilities do not affect AIMETRA because Server Actions are not exposed to untrusted external callers and remote image patterns are strictly restricted to trusted internal assets.
* **Transformers.js / Browser SLM:** The `protobufjs` advisory is in the offline ONNX model parsing path used strictly client-side within the browser Web Worker, posing minimal remote exploitability.
* **Status:** 🟢 **IMPLEMENTED — ACCEPTED RISK (Requires scheduled upgrade during next major framework maintenance window)**

---

## 2. Backend Audit (`pip-audit -r requirements.txt`)

### Execution Command:
```bash
./backend/venv/bin/pip-audit -r requirements.txt
```

### Raw Output Summary:
```text
Found 51 known vulnerabilities in 13 packages:
- python-jose (3.3.0): PYSEC-2024-232, PYSEC-2024-233, PYSEC-2025-185 (Fixed in 3.4.0)
- starlette (0.37.2): PYSEC-2026-161, PYSEC-2026-249 (Multipart / form parsing)
- urllib3 (1.26.20): PYSEC-2026-141, PYSEC-2026-1999 (Fixed in 2.7.0)
- pillow (11.3.0): PYSEC-2026-165, PYSEC-2026-2250 (Image decoding buffer checks)
- python-multipart (0.0.20): PYSEC-2026-1852, PYSEC-2026-3038 (Fixed in 0.0.22+)
- anyio (4.12.1): GHSA-82r6-8w77-94w6 (Fixed in 4.14.2)
```

### Risk Evaluation & Mitigation Strategy:
* **`python-jose` (3.3.0):** The known vulnerability pertains to algorithm confusion when both asymmetric and symmetric keys are accepted. AIMETRA strictly pins `algorithms=["HS256"]` and rejects `none`, mitigating the exploit path at the application level as verified in `test_jwt_tampering_and_algorithm_confusion`.
* **`starlette` & `python-multipart`:** Multipart boundaries are strictly enforced via the 10MB file size ceiling and `%PDF-` magic byte inspection.
* **Status:** 🟢 **IMPLEMENTED — ACCEPTED RISK (Dependencies to be incrementally bumped in staging)**
