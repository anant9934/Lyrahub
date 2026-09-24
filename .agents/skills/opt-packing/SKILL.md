---
name: opt-packing
description: Packs bytes efficiently — model quantization, Docker layers,
  columnar storage, struct packing. Use when size or memory is the
  bottleneck.
---

# Packing Optimization

## When to use
- Docker image >500 MB.
- AI model >10 GB.
- Storage bloat.
- High memory usage.

## AI Model Quantization

| Format | Size (8B) | Quality | Use |
|--------|-----------|---------|-----|
| FP16 | 16 GB | 100% | High-end GPU |
| Q8_0 | 8 GB | 99% | Good GPU |
| Q5_K_M | 5.5 GB | 97% | Balanced |
| **Q4_K_M** | **4.5 GB** | **95%** | **Recommended** |
| Q3_K_M | 3.5 GB | 90% | Low RAM |
| Q2_K | 2.5 GB | 80% | Emergency |

```bash
# Ollama pulls quantized automatically
ollama pull llama3.1:8b-instruct-q4_K_M
```

## Docker Multi-Stage Build
```dockerfile
# Build stage
FROM python:3.11-slim AS builder
COPY requirements.txt .
RUN pip install --user -r requirements.txt

# Runtime stage
FROM python:3.11-slim
COPY --from=builder /root/.local /root/.local
COPY --from=builder /app /app
USER appuser
CMD ["uvicorn", "main:app"]
```

Saves 70–90% of image size.

## Base Image Sizes
| Base | Size |
|------|------|
| python:3.11 | 900 MB |
| python:3.11-slim | 150 MB |
| python:3.11-alpine | 50 MB |
| distroless/python3 | 50 MB |

## .dockerignore
```
node_modules
__pycache__
.git
.env
*.log
tests/
docs/
```

## Columnar Storage (Parquet)
- Export analytics to Parquet nightly.
- Query with DuckDB.
- 10x compression vs CSV.
- 10–100x faster analytics.

## Struct Packing (Python)
```python
class Student:
    __slots__ = ('id', 'name', 'cgpa')  # 50% less memory
```

## NumPy Over Lists
- 4–10x faster.
- 4x less memory.
- Vectorized operations.

## Anti-Patterns
- ❌ Single-stage Docker builds
- ❌ Full-size base images
- ❌ FP16 models on small GPU
- ❌ CSV for analytics
- ❌ Python lists for numeric data
