# AIMETRA — File Storage & Upload Security Policy

This document details the security controls governing the upload, storage, and retrieval of documents, resumes, certificates, and media within AIMETRA.

---

## 1. Attack Vectors & Threat Model for Files

Because AIMETRA handles sensitive student records, resumes, project reports, and certificates, the file storage system faces critical attack vectors:
1. **Malicious Executable Upload:** Disguising `.exe`, `.sh`, or `.php` scripts as PDFs.
2. **Path Traversal:** Crafting keys like `../../etc/passwd` to overwrite or leak arbitrary system files.
3. **MIME Spoofing:** Submitting malicious binaries with a forged `Content-Type: application/pdf` header.
4. **Storage Exhaustion:** Flooding the server with large files to cause denial-of-service.
5. **Direct Object Access:** Publicly accessible storage URLs leaking private student resumes or academic transcripts.

---

## 2. File Ingestion Validation Pipeline

```
Incoming Upload Request
         │
         ▼
1. Authentication & Ownership Check (key starts with verified student_id)
         │
         ▼
2. File Size Enforcement (len(contents) <= 10MB)
         │
         ▼
3. Magic Bytes Inspection (b'%PDF-' verified, not extension alone)
         │
         ▼
4. Path Traversal Defense (os.path.realpath check against storage.root_dir)
         │
         ▼
5. Secure Storage (Hashed filename / UUID, private bucket or partitioned local dir)
```

### 2.1 File Size & Type Controls
* **Maximum File Size:** 10 MB per individual file. Requests exceeding 10MB are rejected with `HTTP 413 Payload Too Large`.
* **Allowed Types:**
  * Documents: PDF (`application/pdf`)
  * Media: PNG (`image/png`), JPEG (`image/jpeg`)
* **Extension & Magic Bytes Validation:**
  * File extension must match the allowlist.
  * File header bytes must match the declared file format (`%PDF-` for PDF, `\x89PNG` for PNG, `\xFF\xD8\xFF` for JPEG).
  * Executable, script (`.sh`, `.bat`, `.py`, `.js`), or unexpected archive extensions are rejected immediately with `HTTP 415 Unsupported Media Type`.

### 2.2 Path Traversal Defense
When saving files to disk or constructing keys:
```python
target_path = os.path.join(storage.root_dir, key)
resolved_path = os.path.realpath(target_path)
if not resolved_path.startswith(os.path.realpath(storage.root_dir)):
    raise HTTPException(status_code=400, detail="Invalid path traversal sequence detected")
```
Original filenames provided by the user client are **never** used directly as filesystem paths. Storage paths use UUIDv4 identifiers.

---

## 3. Storage Architecture & Isolation

### 3.1 Local Development Storage
* Partitioned into isolated subdirectories keyed by user UUID: `uploads/{student_id}/{file_uuid}.pdf`.
* Directory indexing and directory listings are completely disabled.
* Served exclusively via the authenticated download router (`/api/v1/files/download/{key}`) with strict ownership verification.

### 3.2 Production Cloudflare R2 Storage
* **Private Bucket:** Buckets have zero public read or write permissions.
* **Pre-signed URLs:** Time-limited pre-signed PUT and GET URLs generated server-side.
* **Expiry Window:** Pre-signed URLs expire after 300 seconds (5 minutes).
* **Delivery:** Private documents are delivered through authenticated proxy endpoints or pre-signed URLs; no documents are indexed on public search engines.

---

## 4. Privacy & Metadata Scrubbing

* **EXIF Stripping:** Uploaded profile photos and project screenshots are stripped of EXIF metadata (GPS coordinates, camera serial numbers, exposure timestamps) before persisting to storage.
* **Content-Disposition:** Downloaded files include `Content-Disposition: attachment; filename="..."` headers to prevent browsers from automatically executing active HTML/SVG files in the application domain context.
