---
name: opt-lazy-loading
description: Defers loading anything not immediately needed — components,
  routes, images, DB relations, services. Use when initial load is slow.
---

# Lazy Loading

## When to use
- Slow initial page load.
- Large JS bundle.
- Slow server startup.
- Memory pressure.

## Frontend Lazy Loading

### Components
```tsx
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### Routes
Next.js App Router code-splits per route automatically.

### Images
```tsx
import Image from 'next/image';
<Image src="/hero.jpg" width={800} height={600} loading="lazy" />
```

### Videos
```tsx
<video poster="/poster.jpg" preload="none" controls>
  <source src="/video.mp4" />
</video>
```

## Backend Lazy Loading

### DB Relations
```python
# Eager (bad for large relations)
students = await db.query(Student).all()
for s in students:
    print(s.department.name)  # N+1

# Lazy (better)
students = await db.query(Student).options(
    selectinload(Student.department)
).all()
```

### Service Clients
```python
_redis = None

async def get_redis():
    global _redis
    if _redis is None:
        _redis = await aioredis.from_url(REDIS_URL)
    return _redis
```

### AI Models
Load model on first request, not at startup:
```python
_model = None

def get_model():
    global _model
    if _model is None:
        _model = load_llama_model()
    return _model
```

## Lazy Patterns
- **Proxy**: defer creation until first use.
- **Virtual proxy**: lazy-load expensive objects.
- **Ghost**: partial object, load rest on demand.
- **Value holder**: wrapper that loads on access.

## Anti-Patterns
- ❌ Loading all components upfront
- ❌ Eager loading all DB relations
- ❌ Loading AI model at startup
- ❌ No code splitting
