# LYRAHUB MASTER OPTIMIZATION & HARDENING REFERENCE

This document serves as the master optimization catalog and reference for Lyrahub.

---

## 1. FRONTEND OPTIMIZATION

### Loading Strategies
1. **Lazy loading** — Load components only when needed (`next/dynamic`, `React.lazy`)
2. **Skeleton screens** — Show placeholder UI while data loads (not spinners)
3. **Progressive loading** — Load critical content first, secondary later
4. **Code splitting** — Split JS bundle per route (automatic in Next.js App Router)
5. **Dynamic imports** — Load heavy components on demand (charts, editors)
6. **Deferred JS** — Load non-critical scripts with `strategy="lazyOnload"`
7. **Route prefetching** — Prefetch likely next pages on hover/visible links
8. **Image lazy loading** — `loading="lazy"` + `next/image` with blur placeholder
9. **Video lazy loading** — `preload="none"` + poster image
10. **Below-fold deferral** — Don't render offscreen content until scrolled

### Bundle Optimization
11. **Tree shaking** — Remove unused code (use named imports, e.g., `lodash-es`)
12. **Bundle analysis** — `@next/bundle-analyzer` to find bloat
13. **Drop heavy libraries** — Replace moment.js with date-fns (~10x smaller)
14. **Vendor splitting** — Separate vendor chunk from app code
15. **Minification** — Automatic in production builds
16. **Compression** — Brotli (5x smaller than raw) + gzip fallback
17. **Font subsetting** — Load only used character sets (`next/font`)
18. **Font display swap** — `font-display: swap` to avoid FOIT
19. **Critical CSS inline** — Inline above-fold CSS, defer rest

### Rendering Optimization
20. **Server Components by default** — Add `'use client'` only when needed
21. **SSR for dashboards** — Fresh data per user
22. **SSG for static pages** — Landing, programs, courses
23. **ISR for semi-static** — Profile pages with revalidation (60s)
24. **Streaming SSR** — Progressive rendering with React Suspense
25. **Memoization** — `useMemo` for expensive computations
26. **Callback memoization** — `useCallback` for stable references
27. **Component memoization** — `React.memo` for pure components
28. **Virtualization** — `react-window` for long lists (render only visible)
29. **Windowing** — Render only what's in viewport + buffer
30. **Debouncing** — Delay search/scroll/resize handlers (300ms)
31. **Throttling** — Limit rate of high-frequency events
32. **Web Workers** — Offload heavy computation from main thread
33. **WebAssembly** — For CPU-intensive tasks (rare use case)

### Core Web Vitals
34. **LCP optimization** — < 2.5s (optimize images, preload critical)
35. **INP optimization** — < 200ms (reduce JS, code split)
36. **CLS optimization** — < 0.1 (reserve space for images/embeds)
37. **TTFB optimization** — < 600ms (edge caching, fast backend)
38. **FCP optimization** — < 1.8s (critical CSS inline)

### Asset Optimization
39. **Image format** — WebP (3x smaller) or AVIF (5x smaller)
40. **Responsive images** — `srcset` with multiple sizes
41. **Image CDN** — Cloudflare Images or Cloudinary
42. **Compression** — 80% quality sweet spot for images
43. **SVG over raster** — For icons and simple graphics
44. **Sprite sheets** — Combine small icons (legacy)
45. **Content hash filenames** — `app.abc123.js` for cache busting
46. **Immutable cache headers** — `max-age=31536000, immutable` for hashed assets

---

## 2. BACKEND OPTIMIZATION

### Request Handling
47. **Async everywhere** — No blocking calls in FastAPI endpoints
48. **Connection pooling** — Reuse DB connections (PgBouncer)
49. **Bulk operations** — Insert 1000 rows in one query, not 1000 queries
50. **Batch processing** — Combine small operations (embeddings, emails)
51. **Pagination** — Never return all rows (cursor-based for large lists)
52. **Field selection** — `?fields=name,cgpa` to reduce payload
53. **Response compression** — gzip/brotli middleware
54. **ETag / If-None-Match** — 304 responses for unchanged data
55. **Streaming responses** — For large exports (CSV, PDF)
56. **Async file uploads** — Presigned URLs, backend never touches bytes
57. **Request coalescing** — Merge similar requests at gateway
58. **Query batching** — DataLoader pattern for GraphQL-style

### Caching Layers
59. **Response cache** — Redis for GET endpoints (5 min TTL)
60. **Permission cache** — User roles cached (15 min TTL)
61. **Session cache** — Redis for JWT blacklist
62. **Query cache** — Chatbot SQL results (1 hr TTL)
63. **Embedding cache** — Never re-embed unchanged text
64. **Static cache** — Courses, programs (1 day TTL)
65. **Cache invalidation** — On write, on version bump, on TTL
66. **Cache-aside pattern** — Try cache → miss → fetch → populate
67. **Write-through cache** — Update cache on every write
68. **Read-through cache** — Transparent cache for reads

### Database Optimization
69. **B-tree indexes** — On `email`, `reg_no`, `phone`, `cgpa`
70. **GIN indexes** — On `skills[]`, `tags[]`, JSONB columns
71. **GiST indexes** — For full-text search
72. **HNSW indexes** — For pgvector similarity search
73. **Partial indexes** — `WHERE deleted_at IS NULL`
74. **Composite indexes** — `(department, cgpa DESC)`
75. **Covering indexes** — Include all query columns
76. **Query planning** — `EXPLAIN ANALYZE` before optimizing
77. **N+1 prevention** — Use `selectinload` / `joinedload`
78. **Materialized views** — Pre-computed rankings
79. **Partitioning** — Tables >10M rows
80. **Connection pooling** — PgBouncer transaction mode
81. **Read replicas** — Analytics queries offload
82. **Autovacuum tuning** — Per-table scale factor
83. **Fillfactor** — Reserve space for updates (high-update tables)
84. **TOAST** — Compress large text/JSONB off-page
85. **CLUSTER** — Physically reorder by index (read-heavy tables)
86. **Prepared statements** — For repeated queries
87. **Bulk INSERT** — Multi-value inserts, not loops

### Background Jobs
88. **Celery for async tasks** — Resume parsing, ranking recalc
89. **Task queues** — Separate high/default/low priority
90. **Scheduled jobs** — Celery Beat for nightly tasks
91. **Idempotent tasks** — Safe to retry
92. **Task timeouts** — Prevent stuck jobs
93. **Dead letter queue** — Failed jobs don't disappear
94. **Prefork workers** — For CPU tasks
95. **Gevent workers** — For I/O tasks
96. **Auto-scaling workers** — Based on queue depth

---

## 3. AI / LLM OPTIMIZATION

### Model Optimization
97. **Quantization** — Q4_K_M (4x smaller, 95% quality)
98. **Pruning** — Remove unimportant weights
99. **Distillation** — Train small model from large
100. **LoRA fine-tuning** — Small adapters on frozen base
101. **QLoRA** — Quantized base + LoRA
102. **ONNX Runtime** — 2-3x faster inference
103. **TensorRT** — NVIDIA optimization
104. **Flash Attention** — Faster attention computation

### Inference Optimization
105. **Continuous batching** — Pack multiple requests (vLLM, 24x throughput)
106. **PagedAttention** — KV cache in pages (4x more concurrent users)
107. **KV cache** — Avoid recomputing context
108. **Speculative decoding** — Small model drafts, large verifies
109. **Tensor parallelism** — Split model across GPUs
110. **Multi-query attention** — Reduce KV cache size
111. **Grouped-query attention** — Balance quality/size
112. **Sliding window attention** — Limit context per token

### Prompt Optimization
113. **System prompt <200 tokens** — No fluff
114. **Few-shot 1-2 examples** — Not 5
115. **Structured output** — JSON schema instead of verbose description
116. **Delimiters over labels** — `Q: ...` vs `The question is: ...`
117. **Remove polite filler** — "Please kindly..." → "Provide..."
118. **Abbreviations** — When unambiguous
119. **Conversation summarization** — After 5 turns, summarize history
120. **Prompt caching** — OpenAI/Anthropic 90% discount on repeated prefix

### Context Optimization
121. **RAG over full-context** — Retrieve only relevant chunks
122. **Chunk optimization** — 300-500 tokens, 10% overlap
123. **Top-K reduction** — Retrieve 20, rerank to 5
124. **Hybrid search** — BM25 + vector
125. **Metadata pre-filtering** — Before vector search
126. **Cross-encoder reranking** — Better relevance
127. **Query expansion** — Synonyms for better recall
128. **Embedding cache** — Never re-embed unchanged text

### Cost Optimization
129. **Smaller models first** — Phi-3 Mini for classification
130. **Local models** — Ollama, no cloud billing
131. **Response caching** — Redis, 1 hr TTL
132. **Batch embeddings** — 100 texts per call
133. **Rate limits per user** — 20 queries/min
134. **Token budgets** — Daily cap per user
135. **Kill switches** — Disable AI via env var
136. **Intent classifier** — Regex first, LLM only when needed
137. **SQL cache** — Reuse generated SQL by pattern

---

## 4. NETWORK OPTIMIZATION

### Protocol Optimization
138. **HTTP/2** — Multiplexing over single connection
139. **HTTP/3 (QUIC)** — Faster handshake, no head-of-line blocking
140. **TLS 1.3** — 1-RTT handshake (vs 2-RTT for TLS 1.2)
141. **OCSP stapling** — Faster certificate validation
142. **Session resumption** — Skip full handshake on reconnect
143. **Keepalive connections** — Reuse TCP connections
144. **DNS prefetch** — `<link rel="dns-prefetch">`
145. **Preconnect** — `<link rel="preconnect">` for critical origins
146. **Preload** — `<link rel="preload">` for critical resources

### CDN & Edge
147. **CDN for static assets** — Cloudflare (free)
148. **Tiered caching** — Reduces origin fetches 80%
149. **Edge functions** — Cloudflare Workers for logic at edge
150. **Anycast routing** — Nearest server answers
151. **Cache rules per path** — `/_next/static/*` → 1 year
152. **Cache purge on deploy** — Invalidate stale content
153. **Bypass cache for auth** — Never cache authenticated routes

### Compression
154. **Brotli** — 5x smaller than raw (best for text)
155. **Gzip** — 4x smaller (fallback)
156. **WebP images** — 3x smaller than JPEG
157. **AVIF images** — 5x smaller than JPEG
158. **PDF compression** — Ghostscript `/ebook` setting
159. **Backup compression** — Zstd (5x)
160. **Log compression** — Zstd
161. **Archive compression** — 7z (10x)

---

## 5. SERVER / INFRASTRUCTURE OPTIMIZATION

### Server Tuning
162. **Worker count** — 2 × CPU cores + 1 (Gunicorn rule)
163. **Worker class** — Uvicorn workers for FastAPI
164. **Max requests** — Recycle workers (prevent memory leaks)
165. **Keep-alive** — 5s for HTTP connections
166. **Timeout** — 60s for slow endpoints
167. **Graceful shutdown** — Finish pending requests

### OS Tuning
168. **`net.core.somaxconn`** — 65535
169. **`net.ipv4.tcp_max_syn_backlog`** — 65535
170. **`net.ipv4.tcp_fin_timeout`** — 15s
171. **`net.ipv4.tcp_tw_reuse`** — 1
172. **`vm.swappiness`** — 10 (avoid swapping)
173. **`fs.file-max`** — 1000000

### Container Optimization
174. **Multi-stage Docker builds** — 70-90% size reduction
175. **Alpine/slim base images** — 5MB vs 900MB
176. **Layer ordering** — Dependencies before code (better caching)
177. **.dockerignore** — Exclude node_modules, .git
178. **Non-root user** — Security best practice
179. **Resource limits** — CPU, memory per container
180. **Health checks** — `/live`, `/ready`, `/deep`

### Reverse Proxy
181. **Nginx/Caddy worker processes** — = CPU cores
182. **Worker connections** — 10240
183. **Gzip/Brotli compression** — Enable
184. **Static file caching** — 1 year for hashed assets
185. **Proxy buffering** — For slow backends

---

## 6. CACHING STRATEGIES

### Multi-Layer Cache
186. **L1: Browser cache** — 0ms (static 1 year, API 5 min)
187. **L2: CDN cache** — 10ms (Cloudflare)
188. **L3: Redis cache** — 1ms
189. **L4: Application memory** — 0.1ms
190. **L5: Database** — 50ms

### Cache Patterns
191. **Cache-aside** — General purpose
192. **Write-through** — Data must be fresh
193. **Write-behind** — High write volume
194. **Read-through** — Transparent caching
195. **Refresh-ahead** — Predictable access

### Cache Keys
196. **Include user scope** — `user:{id}:permissions`
197. **Include version** — `sql:{hash(query)}:{schema_version}`
198. **Include model** — `llm:{hash(query)}:{model_name}`
199. **Normalize params** — Lowercase, trim, sort

### TTL Rules
200. **Static assets** — 1 year (immutable)
201. **Public pages** — 1 day
202. **API responses** — 5 min
203. **User data** — 1 min
204. **Permissions** — 15 min
205. **LLM responses** — 1 hr
206. **SQL** — 1 hr
207. **Embeddings** — ∞ (until source changes)
208. **Sessions** — 7 days

---

## 7. FILE & STORAGE OPTIMIZATION

### Upload Optimization
209. **Presigned URLs** — Client uploads directly to storage
210. **Chunked uploads** — For large files (>10 MB)
211. **Resumable uploads** — Resume after network failure
212. **Parallel uploads** — Multiple chunks simultaneously
213. **Client-side compression** — Before upload (images)
214. **Content hash deduplication** — SHA-256, reuse if exists

### Storage Optimization
215. **Deduplication** — 30-50% storage saving
216. **Compression** — 50-70% saving
217. **Tiered storage** — Hot/warm/cold
218. **Lifecycle policies** — Auto-move old files to cold storage
219. **Retention policies** — Auto-delete after N days
220. **CDN delivery** — For public files

### Download Optimization
221. **Range requests** — For video/audio streaming
222. **Signed URLs** — Expiring access
223. **Streaming** — Don't buffer entire file
224. **CDN caching** — For frequently downloaded files

---

## 8. DATABASE-SPECIFIC OPTIMIZATION

### Query Optimization
225. **EXPLAIN ANALYZE** — Profile every slow query
226. **Avoid SELECT *** — Fetch only needed columns
227. **CTEs for complex queries** — Readable, optimized
228. **Window functions** — RANK, ROW_NUMBER, LAG
229. **Prepared statements** — Reuse query plans
230. **Bulk operations** — Multi-value INSERT
231. **UPSERT** — `ON CONFLICT DO UPDATE`
232. **Returning clause** — Get inserted row back

### Schema Optimization
233. **Normalization for OLTP** — 3NF
234. **Denormalization for analytics** — Star schema
235. **Column ordering** — Fixed-length first
236. **NOT NULL where possible** — Smaller, faster
237. **CHECK constraints** — Data integrity
238. **Foreign key indexes** — Automatic in some DBs, manual in Postgres

### Maintenance
239. **VACUUM ANALYZE** — Weekly
240. **REINDEX** — When bloat detected
241. **Auto-vacuum tuning** — Per-table
242. **Statistics target** — Increase for skewed columns
243. **pg_stat_statements** — Query performance tracking

---

## 9. COST OPTIMIZATION

### Infrastructure Cost
244. **Free tier first** — Vercel, Render, Neon, Cloudflare
245. **Reserved instances** — If cloud (40% saving)
246. **Spot instances** — For batch jobs (70% saving)
247. **Right-sizing** — Match resources to load
248. **Auto-scaling** — Scale down during off-hours

### AI Cost
249. **Local models** — Ollama (₹0 billing)
250. **Small models first** — Phi-3 for classification
251. **Prompt caching** — 90% discount on repeated prefix
252. **Response caching** — Redis
253. **Batch API** — 50% cheaper (OpenAI)
254. **Token limits** — Max tokens per request
255. **Cost monitoring** — Track every call

### Storage Cost
256. **Deduplication** — 30-50% saving
257. **Compression** — 50-70% saving
258. **Tiered storage** — Hot/warm/cold
259. **Lifecycle policies** — Auto-archive
260. **Zero egress** — Cloudflare R2

### Bandwidth Cost
261. **CDN** — Reduces origin bandwidth
262. **Compression** — 70% smaller
263. **Image optimization** — 80% smaller
264. **Lazy loading** — Only load what's viewed

---

## 10. SECURITY OPTIMIZATION

### Authentication
265. **Short-lived access tokens** — 15 min
266. **Refresh token rotation** — New token on refresh
267. **Token blacklist** — Redis for logout
268. **Argon2id** — Password hashing (not bcrypt)
269. **Rate limiting** — Per IP + per user
270. **Account lockout** — After 5 failed attempts
271. **MFA** — TOTP for admins

### Authorization
272. **RBAC at middleware** — Not in route handler
273. **Scope checks** — own/mentees/section/department/global
274. **Row-level security** — Postgres RLS
275. **Deny overrides allow** — Safer default
276. **Audit every action** — Who, what, when, why

### Input Validation
277. **Pydantic models** — Every request
278. **Zod schemas** — Every form
279. **SQL injection** — Parameterized queries
280. **XSS prevention** — CSP headers, sanitization
281. **CSRF tokens** — State-changing requests
282. **File upload validation** — Magic bytes, not extension

### Encryption
283. **TLS 1.3** — In transit
284. **AES-256** — At rest
285. **Encrypted secrets** — Vault or env vars
286. **Field-level encryption** — For PII (phone, address)
287. **Encrypted backups** — Separate key

---

## 11. PACKING TECHNIQUES

### Model Packing
288. **Quantization** — Q4_K_M (4x smaller)
289. **Weight packing** — Multiple weights per byte
290. **Layer fusion** — Combine operations

### Docker Packing
291. **Multi-stage builds** — Copy only runtime
292. **Layer squashing** — Combine RUN commands
293. **Distroless images** — No shell, no package manager
294. **Alpine base** — 5MB vs 900MB

### Data Packing
295. **Columnar storage** — Parquet (10x compression)
296. **Bit packing** — Flags, permissions
297. **Struct packing** — `__slots__` in Python
298. **Memory-mapped files** — Shared across processes
299. **Arena allocation** — Fast alloc/free

### Network Packing
300. **Request packing** — Multiple requests in one
301. **Response packing** — Batch responses
302. **Multiplexing** — HTTP/2 streams
303. **Protocol buffers** — Binary vs JSON (smaller)

---

## 12. LAZY LOADING TECHNIQUES

### Component Lazy Loading
304. **Dynamic imports** — `next/dynamic`
305. **Route-based splitting** — Automatic in Next.js
306. **Component-based splitting** — For heavy components
307. **Intersection Observer** — Load when visible
308. **Idle callback** — Load during idle time

### Data Lazy Loading
309. **Pagination** — Load 25 at a time
310. **Infinite scroll** — Load more on scroll
311. **Cursor-based pagination** — More efficient than offset
312. **Deferred queries** — React Query `enabled: false`
313. **Prefetch on hover** — Load data before click
314. **Stale-while-revalidate** — Show cached, fetch fresh

### Service Lazy Loading
315. **Lazy Redis client** — Connect on first use
316. **Lazy DB pool** — Create pool on startup
317. **Lazy AI model** — Load on first request
318. **Lazy Ollama client** — Connect on demand
319. **Lazy Celery** — Initialize when tasks scheduled

---

## 13. SKELETON LOADING TECHNIQUES

320. **Skeleton for cards** — Placeholder rectangles
321. **Skeleton for tables** — Rows with shimmer
322. **Skeleton for charts** — Empty chart area
323. **Skeleton for images** — Blur placeholder
324. **Shimmer animation** — Gradient moving across
325. **Suspense boundaries** — React Suspense + skeleton
326. **Loading.tsx** — Next.js convention
327. **Streaming SSR** — Send skeleton first, then content

---

## 14. DATABASE CONNECTION OPTIMIZATION

328. **PgBouncer** — Transaction pooling mode
329. **Pool size** — 20-50 connections per service
330. **Max client connections** — 1000
331. **pool_pre_ping** — Validate before use
332. **pool_recycle** — Recycle every 5 min
333. **pool_timeout** — 30s max wait
334. **Async engine** — Non-blocking DB calls
335. **Read replicas** — Offload analytics
336. **Prepared statements** — Reuse query plans

---

## 15. WRAPPING / PATTERN TECHNIQUES

337. **Provider pattern** — Swappable services (storage, LLM)
338. **Factory pattern** — `get_storage()`, `get_parser()`
339. **Repository pattern** — Data access abstraction
340. **Service layer** — Business logic isolated
341. **Middleware wrapping** — Request logging, auth, rate limit
342. **Decorator pattern** — `@retry`, `@cache`, `@circuit`
343. **Adapter pattern** — Uniform interface for different backends
344. **Facade pattern** — Simplified interface to complex system
345. **Proxy pattern** — Lazy initialization
346. **Circuit breaker** — Fail fast on repeated errors

---

## 16. QUERY & DATA OPTIMIZATION

347. **Cursor pagination** — More efficient than offset
348. **Keyset pagination** — Use last ID/index
349. **Total count caching** — Don't recount every request
350. **Approximate counts** — `pg_class.reltuples` for large tables
351. **Denormalization** — Duplicate data for read speed
352. **Materialized views** — Precomputed aggregates
353. **Incremental updates** — Only recalc what changed
354. **Change Data Capture** — Debezium for real-time sync

---

## 17. OBSERVABILITY OPTIMIZATION

355. **Prometheus metrics** — p50, p95, p99 latencies
356. **Grafana dashboards** — Visual monitoring
357. **Loki log aggregation** — Centralized logs
358. **OpenTelemetry tracing** — Distributed traces
359. **Sentry error tracking** — Real-time errors
360. **Uptime Kuma** — External monitoring
361. **Alert thresholds** — 80% of target
362. **Anomaly detection** — Spike vs baseline

---

## 18. DEVELOPMENT OPTIMIZATION

363. **Pre-commit hooks** — Lint, format, type-check
364. **CI/CD pipeline** — Automated tests on push
365. **Fast local tests** — pytest with fixtures
366. **Hot reload** — FastAPI `--reload`, Next.js HMR
367. **Seed data** — Realistic test data
368. **Makefile** — Common commands
369. **Docker Compose** — One command to start everything
370. **Prune agent configs** — Fewer files = faster AI responses

---

## 19. SCALING TECHNIQUES

371. **Horizontal scaling** — Add more servers
372. **Vertical scaling** — Bigger server
373. **Read replicas** — Scale reads
374. **Sharding** — Split by key (department, year)
375. **Citus** — Distributed Postgres
376. **Load balancer** — Distribute traffic
377. **Auto-scaling** — Based on CPU/queue depth
378. **Stateless services** — No local state
379. **Sticky sessions** — If stateful (avoid)
380. **Graceful degradation** — Disable features under load

---

## 20. SECURITY-HARDENING OPTIMIZATION

381. **Zero Trust** — Verify every request
382. **mTLS** — Service-to-service
383. **Least privilege** — Minimum permissions
384. **Fail secure** — Deny by default
385. **Secrets rotation** — Every 90 days
386. **Immutable audit logs** — Append-only
387. **Penetration testing** — Regular
388. **Dependency scanning** — Dependabot, Snyk
389. **Container scanning** — Trivy

---

## 21. MOBILE / PWA OPTIMIZATION

390. **PWA** — Service worker, manifest, installable
391. **Offline-first** — Cache critical data
392. **Push notifications** — FCM
393. **Touch optimization** — 44px tap targets
394. **Mobile-first CSS** — Small screens default
395. **Reduced motion** — Respect user preference
396. **Background sync** — Retry failed requests

---

## 22. ACCESSIBILITY OPTIMIZATION

397. **WCAG 2.1 AA** — Minimum standard
398. **Semantic HTML** — Proper landmarks
399. **ARIA labels** — Screen reader support
400. **Keyboard navigation** — Full functionality
401. **Focus indicators** — Visible
402. **Color contrast** — 4.5:1 minimum
403. **Skip links** — Jump to content
404. **Reduced motion** — Disable animations
405. **Alt text** — All images

---

## 23. SEO OPTIMIZATION

406. **Meta tags** — Title, description, OG
407. **Sitemap.xml** — Auto-generated
408. **Robots.txt** — Control indexing
409. **Structured data** — Schema.org JSON-LD
410. **Canonical URLs** — Prevent duplicates
411. **Server-side rendering** — For crawlers
412. **Fast loading** — Core Web Vitals

---

## 24. BACKUP & RECOVERY OPTIMIZATION

413. **3-2-1 rule** — 3 copies, 2 media, 1 offsite
414. **Daily full backup** — Plus hourly WAL
415. **Point-in-time recovery** — Postgres WAL
416. **Encrypted backups** — AES-256
417. **Offsite replication** — Different region
418. **Restore testing** — Monthly
419. **Automated recovery** — Scripted
420. **RTO/RPO defined** — Documented targets

---

## 25. TOKEN OPTIMIZATION (AI Agents)

421. **Fewer agents** — 5 instead of 56
422. **Fewer skills** — 4 instead of 50
423. **Fewer workflows** — 1 instead of 28
424. **Fresh conversations** — Clear context between tasks
425. **@-mentions over file dumps** — Reference files, don't paste
426. **Lazy skill loading** — Load only when relevant
427. **Context summarization** — After 10+ turns
428. **Clear between unrelated tasks** — New conversation
429. **Per-cycle budget** — Target <100K tokens
430. **Scoped prompts** — Only relevant context

---

## 📊 PRIORITY MATRIX

### 🔴 Critical (Do First)
- Database indexing
- Caching (Redis)
- Pagination
- Lazy loading
- Skeleton screens
- Compression (Brotli)
- Local AI models
- Prompt caching

### 🟠 High (Do Soon)
- CDN for assets
- Image optimization
- Code splitting
- Background jobs (Celery)
- Connection pooling
- Materialized views
- Rate limiting

### 🟡 Medium (Do Later)
- Read replicas
- Partitioning
- Query optimization
- Multi-layer cache
- HTTP/2 + HTTP/3
- Monitoring stack

### 🟢 Low (When Needed)
- Sharding
- Multi-region
- Edge compute
- Advanced AI optimization

---

## 🎯 TOP 15 QUICK WINS

1. **Add Redis caching** for frequent queries
2. **Create proper indexes** on all filter columns
3. **Enable Brotli compression** (5x smaller)
4. **Add pagination** to all list endpoints
5. **Use connection pooling** (PgBouncer)
6. **Move heavy tasks to Celery**
7. **Add CDN** for static assets
8. **Optimize images** (WebP/AVIF)
9. **Cache chatbot responses**
10. **Use read replica** for analytics
11. **Add materialized views** for dashboards
12. **Enable HTTP/2 + TLS 1.3**
13. **Set up monitoring** (Prometheus + Grafana)
14. **Add rate limiting** per role
15. **Schedule nightly maintenance** (VACUUM, recalc)

---

## 🚀 TOP 10 AI-SPECIFIC WINS

1. **Local Ollama models** — ₹0 billing
2. **Model quantization** — Q4_K_M (4x smaller)
3. **Continuous batching** — 24x throughput
4. **Response caching** — Redis
5. **Prompt compression** — <200 tokens system
6. **RAG over full-context** — 80-95% token saving
7. **Embedding cache** — Never re-embed
8. **Provider fallback** — Multi-provider resilience
9. **Key rotation** — 429 → next key
10. **Rate limits per user** — Prevent abuse

---

## 📈 MEASUREMENT TARGETS

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| TTFB | < 600ms |
| API p95 | < 500ms |
| DB p95 | < 100ms |
| Cache hit ratio | > 80% |
| AI tokens/query | < 2000 |
| Resume parse | < 4000 tokens |
| Ranking recalc | < 30s (1000 students) |
| CSV export | < 5s (10K rows) |

---

## 💎 SUMMARY

**Total techniques documented: 430**

Breakdown:
- Frontend: 46
- Backend: 49
- AI/LLM: 44
- Network: 25
- Server: 24
- Caching: 23
- File storage: 16
- Database: 19
- Cost: 21
- Security: 23
- Packing: 16
- Lazy loading: 16
- Skeleton: 8
- DB connections: 9
- Patterns: 10
- Query data: 8
- Observability: 8
- Development: 8
- Scaling: 10
- Security hardening: 9
- Mobile: 7
- Accessibility: 9
- SEO: 7
- Backup: 8
- Token (AI agents): 10

**Every one of these should be applied somewhere in Lyrahub.**
