---
name: ranking-engine
description: Implements multi-criteria student ranking using AHP for
  weight determination and TOPSIS for ranking. Use when writing or
  modifying the ranking algorithm, scoring, tie-breaking, or exports.
---

# Student Ranking Engine (AHP + TOPSIS)

## When to use this skill
- Writing or modifying the ranking algorithm.
- Adding new ranking criteria.
- Implementing ranking exports (CSV, PDF, Excel).
- Debugging ranking discrepancies.

## Criteria & Default Weights (configurable by HOD)

| Criterion                | Default Weight |
|--------------------------|----------------|
| AI/ML Knowledge Test     | 25%            |
| CGPA                     | 15%            |
| Certifications           | 15%            |
| Projects                 | 15%            |
| Coding Platform Stats    | 10%            |
| Resume Quality           | 10%            |
| Internships              | 5%             |
| Revenue/Entrepreneurship | 5%             |

Weights MUST sum to 100%. HOD can adjust via admin UI.

## Algorithm Steps

### Step 1: Data Collection
For each student, collect raw values for all 8 criteria.
Missing values are treated as 0 (do not skip the student).

### Step 2: Normalization (Min-Max)
For each criterion:
```
normalized = (value - min) / (max - min)
```
If min == max, all students get 0.5 for that criterion.

### Step 3: AHP Weight Computation (Optional)
If HOD provides pairwise comparison matrix, compute weights:
1. Build pairwise comparison matrix A (n×n).
2. Compute priority vector via eigenvector method.
3. Check consistency ratio (CR < 0.1).
4. If CR >= 0.1, reject and ask HOD to revise.

### Step 4: TOPSIS
1. Build weighted normalized matrix: `V[i][j] = weight[j] * normalized[i][j]`
2. Determine ideal best `V+` and ideal worst `V-` per criterion.
3. Euclidean distance from V+ and V-:
   - `D+[i] = sqrt(sum((V[i][j] - V+[j])^2))`
   - `D-[i] = sqrt(sum((V[i][j] - V-[j])^2))`
4. Closeness coefficient: `Ci[i] = D-[i] / (D+[i] + D-[i])`
5. Rank by Ci descending (higher Ci = better rank).

### Step 5: Tie-Breaking
If two students have identical Ci:
1. Compare CGPA (higher wins).
2. If tied, compare test score (higher wins).
3. If tied, compare certifications count (higher wins).
4. If still tied, sort alphabetically by reg_no.

## Output Format
```json
{
  "student_id": 123,
  "reg_no": "21AIML001",
  "rank": 1,
  "final_score": 95.2,
  "breakdown": {
    "test": 0.92,
    "cgpa": 0.88,
    "certifications": 0.95,
    "projects": 0.90,
    "coding": 0.85,
    "resume": 0.87,
    "internships": 0.80,
    "revenue": 0.75
  }
}
```

## Exports
- CSV: all columns, one row per student.
- PDF: formatted table with header, filters applied, timestamp.
- Excel: multiple sheets (summary + breakdown).
- All exports must be **streamed** — no loading 10K rows in memory.

## Edge Cases
- **Missing data**: treat as 0.
- **All-equal criteria**: uniform ranking (all get same score).
- **Single student**: rank = 1, score = 100.
- **Negative values** (e.g., revenue loss): clamp to 0 before normalization.
- **Outliers**: cap at 99th percentile before normalization.
- **Soft-deleted students**: excluded from rankings.

## Performance
- Precompute normalized scores nightly via Celery.
- Store rankings in a materialized view.
- Refresh materialized view nightly.
- On-demand recompute for HOD only (with progress bar).

## Anti-Patterns (NEVER do these)
- ❌ Ranking in Python without normalization
- ❌ Hardcoded weights — must be configurable
- ❌ Loading all students in memory for exports
- ❌ Ignoring missing data (must treat as 0)
- ❌ Skipping tie-break rules
- ❌ Exposing breakdown to students (HOD/faculty only)

## Testing
- Unit tests for each step (normalize, AHP, TOPSIS, tie-break).
- Fixture with known input → expected rank.
- Test with 0, 1, 10, 1000 students.
- Test with all-equal values.
- Test with missing data.

---
