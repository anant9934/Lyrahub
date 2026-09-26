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
    
    # AI / LLM API Provider Keys
    MENTOR_MAZE_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEYS: str = ""
    GROQ_API_KEY: str = ""
    GROQ_API_KEYS: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_API_KEYS: str = ""
    CEREBRAS_API_KEY: str = ""
    CEREBRAS_API_KEYS: str = ""
    MISTRAL_API_KEY: str = ""
    MISTRAL_API_KEYS: str = ""
    SAMBANOVA_API_KEY: str = ""
    SAMBANOVA_API_KEYS: str = ""

    def get_provider_keys(self, provider: str) -> list[str]:
        """Returns the list of configured API keys for a given provider for round-robin rotation."""
        provider = provider.upper()
        keys_str = getattr(self, f"{provider}_API_KEYS", "") or getattr(self, f"{provider}_API_KEY", "")
        if not keys_str:
            return []
        return [k.strip() for k in keys_str.split(",") if k.strip()]
    
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

@lru_cache
def get_settings():
    return Settings()
