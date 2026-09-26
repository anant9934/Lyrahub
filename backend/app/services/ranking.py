import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date
from uuid import uuid4

from app.models import Student, StudentResume, RankingCriteria, RankingSnapshot, RankingConfig

def normalize(values: list[float]) -> list[float]:
    """Min-max to [0,1]. If min==max → all 0.5."""
    if not values:
        return []
    min_val = min(values)
    max_val = max(values)
    if min_val == max_val:
        return [0.5 for _ in values]
    return [(v - min_val) / (max_val - min_val) for v in values]

def ahp_weights(pairwise_matrix: list[list[float]]) -> list[float]:
    """Eigenvector method. Consistency ratio (CR < 0.1). Raises ValueError if inconsistent."""
    matrix = np.array(pairwise_matrix)
    n = matrix.shape[0]
    eigenvalues, eigenvectors = np.linalg.eig(matrix)
    max_index = np.argmax(np.real(eigenvalues))
    max_eigenvalue = np.real(eigenvalues[max_index])
    principal_eigenvector = np.real(eigenvectors[:, max_index])
    
    weights = principal_eigenvector / np.sum(principal_eigenvector)
    
    # Consistency Ratio
    ci = (max_eigenvalue - n) / (n - 1) if n > 1 else 0
    ri_dict = {1: 0, 2: 0, 3: 0.58, 4: 0.9, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49}
    ri = ri_dict.get(n, 1.49)
    cr = ci / ri if ri > 0 else 0
    
    if cr > 0.1:
        raise ValueError("Inconsistent pairwise matrix (CR > 0.1)")
        
    return weights.tolist()

def topsis(matrix: list[list[float]], weights: list[float]) -> list[float]:
    """Standard TOPSIS. Returns closeness coefficients."""
    if not matrix or not matrix[0]:
        return []
    n_alternatives = len(matrix)
    n_criteria = len(matrix[0])
    
    # Vector normalization
    matrix_arr = np.array(matrix)
    norm_factors = np.sqrt(np.sum(matrix_arr**2, axis=0))
    # handle 0 division
    norm_factors[norm_factors == 0] = 1
    normalized_matrix = matrix_arr / norm_factors
    
    # Apply weights
    weighted_matrix = normalized_matrix * np.array(weights)
    
    # Ideal best and worst
    ideal_best = np.max(weighted_matrix, axis=0)
    ideal_worst = np.min(weighted_matrix, axis=0)
    
    # Euclidean distances
    dist_best = np.sqrt(np.sum((weighted_matrix - ideal_best)**2, axis=1))
    dist_worst = np.sqrt(np.sum((weighted_matrix - ideal_worst)**2, axis=1))
    
    # Closeness
    denominator = dist_best + dist_worst
    # handle 0 denominator
    denominator[denominator == 0] = 1
    closeness = dist_worst / denominator
    
    return closeness.tolist()

async def calculate_rankings(db: AsyncSession) -> list[dict]:
    # Get active criteria
    criteria_res = await db.execute(select(RankingCriteria).where(RankingCriteria.is_active == True))
    criteria = criteria_res.scalars().all()
    if not criteria:
        return []
        
    weights_dict = {c.code: float(c.weight) for c in criteria}
    ordered_codes = [
        "test_score", "cgpa", "certifications", "projects", 
        "coding_stats", "resume_quality", "internships", "revenue"
    ]
    # filter criteria codes to match what we actually use
    active_codes = [code for code in ordered_codes if code in weights_dict]
    if not active_codes:
        return []
        
    weights = [weights_dict[code] for code in active_codes]
    
    # Get students
    students_res = await db.execute(
        select(Student).where(Student.deleted_at == None)
    )
    students = students_res.scalars().all()
    if not students:
        return []
        
    student_resumes_res = await db.execute(select(StudentResume))
    student_resumes = {r.student_id: r for r in student_resumes_res.scalars().all()}
    
    data_matrix = []
    student_records = []
    
    for student in students:
        resume = student_resumes.get(student.id)
        
        # Collect values
        vals = {
            "test_score": 0.0,
            "cgpa": float(student.cgpa or 0.0),
            "certifications": float(len(resume.parsed_certifications)) if resume and resume.parsed_certifications else 0.0,
            "projects": float(len(resume.parsed_projects)) if resume and resume.parsed_projects else 0.0,
            "coding_stats": float(bool(student.github_url) + bool(student.leetcode_url) + bool(student.hackerrank_url) + bool(student.hackerearth_url)),
            "resume_quality": float((bool(student.bio) + bool(student.linkedin_url) + bool(student.github_url) + bool(resume)) / 4.0),
            "internships": 0.0,
            "revenue": 0.0
        }
        row = [vals[code] for code in active_codes]
        data_matrix.append(row)
        student_records.append({
            "student_id": student.id,
            "cgpa": vals["cgpa"],
            "certifications": vals["certifications"],
            "reg_no": student.reg_no,
            "breakdown": vals
        })
        
    # Column-wise normalization (min-max for interpretability in breakdown)
    # TOPSIS handles vector normalization internally, but we use normalized values for breakdown display
    col_matrix = list(zip(*data_matrix))
    norm_col_matrix = [normalize(list(col)) for col in col_matrix]
    norm_matrix = list(zip(*norm_col_matrix))
    
    for i, record in enumerate(student_records):
        norm_vals = {active_codes[j]: norm_matrix[i][j] for j in range(len(active_codes))}
        record["norm_breakdown"] = norm_vals
        
    # TOPSIS score
    scores = topsis(data_matrix, weights)
    
    for i, record in enumerate(student_records):
        record["score"] = round(scores[i] * 100, 2)
        
    # Sort: score DESC -> cgpa DESC -> certifications DESC -> reg_no ASC
    student_records.sort(key=lambda x: (x["score"], x["cgpa"], x["certifications"]), reverse=True)
    # Tie-break reg_no ASC (requires separating out since reverse=True affects it)
    student_records.sort(key=lambda x: (-x["score"], -x["cgpa"], -x["certifications"], x["reg_no"]))
    
    rankings = []
    for rank, record in enumerate(student_records, 1):
        rankings.append({
            "student_id": record["student_id"],
            "rank": rank,
            "score": record["score"],
            "breakdown": record["breakdown"]
        })
        
    return rankings

async def save_snapshot(db: AsyncSession, rankings: list[dict]):
    today = date.today()
    
    # Insert snapshots
    snapshots = []
    for r in rankings:
        snapshots.append(
            RankingSnapshot(
                id=uuid4(),
                student_id=r["student_id"],
                snapshot_date=today,
                rank=r["rank"],
                score=r["score"],
                breakdown=r["breakdown"]
            )
        )
    db.add_all(snapshots)
    await db.commit()
    
    # Refresh MV
    from sqlalchemy import text
    await db.execute(text("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_current_rankings;"))
    await db.commit()
