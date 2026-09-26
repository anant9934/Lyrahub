# Architecture

- **Ranking Module**: Added AHP+TOPSIS logic. It evaluates students based on active criteria and saves snapshots to PostgreSQL.
- **Celery + Beat**: Used for background task processing and nightly ranking recalculations. Uses Redis as broker.
- **Parser Abstraction**: Strategy pattern for resume parser (Keyword vs Ollama).
