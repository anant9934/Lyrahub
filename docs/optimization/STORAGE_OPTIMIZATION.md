# Lyrahub Storage Optimization & Asset Architecture Report

**Date**: 2026-09-26  
**Cycle**: Master Optimization & Hardening Cycle  
**Storage Tier**: Cloudflare R2 (S3-compatible, zero egress fees) + Local Storage Fallback  

---

## 1. Executive Summary

Lyrahub stores student resumes, achievement certificates, profile photos, research papers, and course syllabi. In cloud deployments, unoptimized storage can incur unexpected egress fees, slow load times for international users, and create security vulnerabilities via malicious uploads.

This optimization cycle implemented:
1. **Zero-Egress Object Storage (Cloudflare R2)**: Zero-cost data transfer for student resumes, public documents, and project deliverables.
2. **Strict MIME & Magic Byte Validation**: Defense against file extension spoofing and executable uploads.
3. **Cryptographic Deduplication**: SHA-256 hash checks on resumes to eliminate redundant storage consumption.
4. **Asset Compression & Modern Formats**: Automatic conversion and serving of images in WebP format.

---

## 2. Cloudflare R2 Integration Architecture

### Benefits
- **Zero Egress Fees**: Unlike AWS S3 which charges $0.09/GB for data egress, Cloudflare R2 charges $0.00 for egress, keeping recurring infrastructure costs strictly at $0/month on the free tier (10 GB storage, 1M Class A operations, 10M Class B operations).
- **Global CDN Edge Caching**: Resumes, syllabi, and public project assets are automatically distributed across Cloudflare's 330+ global edge locations.

### S3-Compatible Client Pool
In `backend/app/core/storage.py`:
- Async client (`aioboto3`) connection pooling prevents TCP socket leaks during high-frequency upload spikes.
- Signed URLs with 15-minute expirations are generated for private student documents (resumes, certificates).

---

## 3. Upload Security & Validation Hardening

### Multi-Layer Upload Guardrails
1. **Size Limits**:
   - Resumes (PDF, DOCX): **Max 10 MB**
   - Profile Photos (JPEG, PNG, WebP): **Max 5 MB**
   - Project Documents & Code ZIPs: **Max 25 MB**
2. **Magic Byte Inspection**:
   Validates actual file header signatures (e.g., `%PDF-` for PDFs, `\xFF\xD8\xFF` for JPEGs) rather than trusting client-provided `Content-Type` headers or file extensions.
3. **Safe Storage Path Generation**:
   Every uploaded file is stored under a randomized cryptographic identifier:
   `uploads/{resource_type}/{uuid4()}_{timestamp}.{ext}`
   This eliminates directory traversal attacks (`../../`) and prevents filename collision overwrites.

---

## 4. Resume Deduplication & Processing Pipeline

When a student submits a resume for ATS scoring and ranking:
1. **SHA-256 Digest**: The raw file buffer is hashed. If the hash matches an existing resume for the same student, redundant S3 writes and re-embedding calculations are bypassed.
2. **Text Extraction**: Processed via `pypdf` in a background thread to prevent blocking FastAPI's async event loop.
3. **Vector Embedding**: Generated embeddings are written to `resumes.embedding` (pgvector 1536-dim) with HNSW indexing for rapid semantic recruiter search.

---

## 5. Storage Metrics & Cost Projection

| Workload | Projected Volume (1,240 Students) | Baseline S3 Cost | Optimized R2 Cost | Net Savings |
| :--- | :--- | :--- | :--- | :--- |
| **Resumes (PDFs)** | 2.5 GB (~2,000 files) | $0.06/mo + $0.50 egress | **$0.00 / mo** | 100% Free Tier |
| **Project Deliverables** | 4.8 GB (~350 projects) | $0.12/mo + $1.20 egress | **$0.00 / mo** | 100% Free Tier |
| **Profile Photos (WebP)** | 0.8 GB (~1,400 photos) | $0.02/mo + $0.20 egress | **$0.00 / mo** | 100% Free Tier |
| **Total Storage Tier** | **8.1 GB / 10 GB Free Tier** | ~$2.10 / mo | **$0.00 / mo** | **$0.00 Cloud Cost** |
