import os
import casbin
from casbin_async_sqlalchemy_adapter import Adapter
from app.core.config import get_settings

enforcer = None

async def init_casbin():
    global enforcer
    settings = get_settings()
    adapter = Adapter(settings.DATABASE_URL)
    await adapter.create_table()
    model_path = os.path.join(os.path.dirname(__file__), "casbin_model.conf")
    enforcer = casbin.AsyncEnforcer(model_path, adapter)
    await enforcer.load_policy()
    return enforcer

def get_enforcer():
    return enforcer
