---
name: file-storage
description: Manages file uploads to Cloudflare R2 with versioning,
  deduplication, presigned URLs, and access control. Use when
  implementing document uploads, downloads, or file metadata.
---

# File Storage (Cloudflare R2)

## When to use this skill
- Implementing file upload endpoints.
- Building document management features.
- Handling CV, certificate, image, or video uploads.
- Generating presigned URLs for direct upload.

## Core Rules

1. NEVER store files on Render's filesystem (ephemeral).
2. All files go to **Cloudflare R2** via presigned URLs.
3. DB stores metadata only: id, owner_id, type, url, version, content_hash.
4. Deduplicate by **SHA-256 content hash**.
5. Every upload creates a **new version**; old versions retained.
6. Max file size: **50 MB** per file.
7. Validate MIME type **server-side** — never trust client.
8. Never expose R2 credentials to client.
9. Signed URLs expire in **15 minutes**.
10. All uploads logged in audit_logs.

## Supported Formats
PDF, DOCX, XLSX, PPTX, JPG, PNG, MP4, ZIP

## Upload Flow

```
1. Client → Backend: POST /documents/presign
   { filename, content_type, size }
2. Backend validates:
   - MIME type allowed
   - Size <= 50 MB
   - User has upload permission
3. Backend generates presigned URL (15 min expiry)
4. Backend returns: { upload_url, file_id, r2_key }
5. Client → R2: PUT upload_url with file bytes
6. Client → Backend: POST /documents/{file_id}/confirm
   { content_hash }
7. Backend:
   - Verifies file exists in R2
   - Saves metadata in DB
   - Returns file record
```

## Access Control

- Private files: **signed URLs only** (15 min expiry).
- Public files (event photos): R2 public bucket via CDN.
- Role-based: check permission before issuing presigned URL.
- Student can only access own documents unless faculty/HOD.

## Deduplication

```python
existing = await db.query(Document).filter_by(content_hash=hash).first()
if existing:
    # Reuse existing file, create new metadata row pointing to same R2 key
    return existing.r2_key
```

## Versioning

Every upload creates a new row. Old versions retained.
Query `WHERE owner_id = X AND type = 'cv' ORDER BY version DESC LIMIT 1`
for latest.

## Anti-Patterns (NEVER do these)
- ❌ Storing files in DB or on Render disk
- ❌ Trusting client-provided MIME type
- ❌ Long-lived presigned URLs
- ❌ Exposing R2 credentials
- ❌ No file size limit
- ❌ Overwriting files instead of versioning
- ❌ No content hash for deduplication

## Testing
- Unit tests for MIME validation, size check.
- Integration tests for presign → upload → confirm flow.
- Test duplicate upload (dedup).
- Test oversized file rejection.
- Test unauthorized access.

---
