import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

import os
import sys
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_DIR)

sys.path.insert(0, BASE_DIR)
load_dotenv(os.path.join(ROOT_DIR, ".env"))
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv()

# add your model's MetaData object here
# for 'autogenerate' support
from app.models import Base
target_metadata = Base.metadata

db_url = os.environ.get("DATABASE_URL")
if not db_url:
    try:
        from app.core.config import get_settings
        db_url = get_settings().DATABASE_URL
    except Exception:
        pass

if db_url:
    config.set_main_option("sqlalchemy.url", db_url)
else:
    import sys
    print(
        "\n" + "=" * 70 + "\n"
        "ERROR: DATABASE_URL is not configured in the environment!\n"
        "Please add DATABASE_URL in your Render Dashboard -> Environment tab\n"
        "and click 'Save Changes'.\n" + "=" * 70 + "\n",
        file=sys.stderr
    )
    raise RuntimeError("DATABASE_URL environment variable is missing.")

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def include_object(object, name, type_, reflected, compare_to):
    if name and ("casbin_rule" in name or "mv_current_rankings" in name):
        return False
    return True

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, include_object=include_object)

    with context.begin_transaction():
        context.run_migrations()


from sqlalchemy import create_engine

def run_migrations_online() -> None:
    """Run migrations in 'online' mode using synchronous psycopg2 or fallback to asyncpg."""
    db_url = config.get_main_option("sqlalchemy.url") or os.environ.get("DATABASE_URL", "")
    try:
        import psycopg2  # noqa: F401
        sync_url = db_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://").replace("ssl=require", "sslmode=require")
        connectable = create_engine(sync_url, poolclass=pool.NullPool)

        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                include_object=include_object,
                compare_type=True
            )

            with context.begin_transaction():
                context.run_migrations()
    except ImportError:
        import asyncio
        from sqlalchemy.ext.asyncio import create_async_engine

        async def run_async_migrations() -> None:
            async_url = db_url
            if not async_url.startswith("postgresql+asyncpg://"):
                async_url = async_url.replace("postgresql://", "postgresql+asyncpg://")
            async_engine = create_async_engine(async_url, poolclass=pool.NullPool)
            async with async_engine.connect() as async_conn:
                await async_conn.run_sync(do_run_migrations)
            await async_engine.dispose()

        asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

