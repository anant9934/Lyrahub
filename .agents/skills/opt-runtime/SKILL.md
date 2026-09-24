---
name: opt-runtime
description: Optimizes application runtime — async, batching, profiling,
  memory. Use when CPU is high or endpoints are slow.
---

# Runtime Performance

## When to use
- High CPU.
- Slow endpoints.
- Memory leaks.
- Latency spikes.

## Async Everywhere
```python
# Bad: blocking
result = requests.get(url)

# Good: async
async with httpx.AsyncClient() as client:
    result = await client.get(url)
```

## Batch DB Writes
```python
# Bad: 100 inserts
for s in students:
    db.add(s)

# Good: bulk insert
db.bulk_insert_mappings(Student, students)
db.commit()
```

## Connection Pooling
```python
engine = create_async_engine(
    DB_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)
```

## Avoid N+1
Use `selectinload` / `joinedload`.

## Memory Optimization
- `__slots__` for high-volume objects.
- Generators over lists.
- Stream large responses.
- Release references after use.

## Profiling
```bash
# CPU profile
python -m cProfile -o profile.out app.py

# Line-by-line
pip install py-spy
py-spy record -o profile.svg -- python app.py

# Memory
pip install memory_profiler
python -m memory_profiler app.py
```

## Hot Path Optimization
- Optimize the 20% that takes 80% of time.
- Use `functools.lru_cache` for pure functions.
- Precompute constants.
- Avoid repeated work.

## GC Tuning
- Reduce object churn.
- Reuse objects (pools).
- `gc.freeze()` after startup.

## Anti-Patterns
- ❌ Blocking calls in async
- ❌ Individual DB writes
- ❌ No profiling
- ❌ Large objects in memory
- ❌ No connection pooling
