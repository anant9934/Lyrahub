import pytest
from app.services.ranking import normalize, ahp_weights, topsis

def test_normalize():
    assert normalize([1, 2, 3]) == [0.0, 0.5, 1.0]
    assert normalize([5, 5, 5]) == [0.5, 0.5, 0.5]
    assert normalize([]) == []

def test_ahp_weights():
    # 3x3 identity matrix should give equal weights
    matrix = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
    ]
    weights = ahp_weights(matrix)
    assert len(weights) == 3
    assert abs(sum(weights) - 1.0) < 0.001
    assert abs(weights[0] - 1/3) < 0.001
    
    # Inconsistent matrix (e.g. A > B > C > A with huge ratios)
    inconsistent = [
        [1, 9, 1/9],
        [1/9, 1, 9],
        [9, 1/9, 1]
    ]
    with pytest.raises(ValueError, match="Inconsistent pairwise matrix"):
        ahp_weights(inconsistent)

def test_topsis():
    matrix = [
        [0.8, 0.9],
        [0.2, 0.4],
        [0.5, 0.5]
    ]
    weights = [0.5, 0.5]
    scores = topsis(matrix, weights)
    
    assert len(scores) == 3
    # First is best, second is worst, third is middle
    assert scores[0] > scores[2]
    assert scores[2] > scores[1]
