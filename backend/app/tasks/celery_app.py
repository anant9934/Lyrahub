from celery import Celery
from celery.schedules import crontab
from app.core.config import get_settings

settings = get_settings()

# Use REDIS_URL from settings, default to localhost if not set
redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "lyrahub_tasks",
    broker=redis_url,
    backend=redis_url,
    include=["app.tasks.ranking_tasks"]
)

celery_app.conf.beat_schedule = {
    'nightly-ranking-recalc': {
        'task': 'app.tasks.ranking_tasks.recalculate_rankings_task',
        'schedule': crontab(hour=2, minute=0),  # 2 AM daily
    },
}

celery_app.conf.timezone = 'UTC'
