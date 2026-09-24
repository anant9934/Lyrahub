from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE = os.path.join(os.path.dirname(BASE_DIR), ".env")

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET: str
    JWT_ACCESS_EXPIRY: int = 900
    JWT_REFRESH_EXPIRY: int = 604800
    SUPERADMIN_EMAIL: str
    SUPERADMIN_PASSWORD: str
    
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

@lru_cache
def get_settings():
    return Settings()
