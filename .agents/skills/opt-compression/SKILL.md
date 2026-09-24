---
name: opt-compression
description: Compresses everything on the wire and at rest — HTTP,
  images, PDFs, backups, logs. Use when bandwidth or storage is high.
---

# Compression

## When to use
- High bandwidth.
- Storage bloat.
- Slow transfers.
- Large backups.

## Compression Matrix

| Type | Algorithm | Ratio | Speed |
|------|-----------|-------|-------|
| HTTP text | Brotli | 5x | Fast |
| HTTP text (fallback) | Gzip | 4x | Fast |
| Images | WebP | 3x | Fast |
| Images (best) | AVIF | 5x | Medium |
| PDFs | Ghostscript | 3x | Medium |
| Backups | Zstd | 5x | Fast |
| Logs | Zstd | 5x | Fast |
| Archives | 7z | 10x | Slow |

## HTTP Compression (Caddy)
```
encode zstd gzip
```
Brotli is negotiated automatically via gzip.

## Image Optimization
```bash
# Convert to WebP
cwebp -q 80 input.jpg -o output.webp

# Convert to AVIF
avifenc --min 0 --max 63 input.jpg output.avif
```

## PDF Compression
```bash
gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
   -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH \
   -sOutputFile=output.pdf input.pdf
```

## Backup Compression
```bash
pg_dump db | zstd -19 > backup.sql.zst
```

## Log Compression
```
# In logrotate config
compresscmd /usr/bin/zstd
compressoptions -19
```

## Anti-Patterns
- ❌ No HTTP compression
- ❌ JPEG for images (use WebP/AVIF)
- ❌ Uncompressed backups
- ❌ Uncompressed logs
- ❌ Gzip for static assets (use Brotli)
