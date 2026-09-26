import asyncio
from app.tasks.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.services.ranking import calculate_rankings, save_snapshot

@celery_app.task(name='app.tasks.ranking_tasks.recalculate_rankings_task')
def recalculate_rankings_task():
    """Sync wrapper to run async ranking calculation and save snapshot."""
    async def run_async_calc():
        async with AsyncSessionLocal() as db:
            rankings = await calculate_rankings(db)
            if rankings:
                await save_snapshot(db, rankings)
            return len(rankings)

    return asyncio.run(run_async_calc())
