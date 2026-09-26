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

    # Comma-separated list of allowed CORS origins (production Vercel URLs)
    # Example: https://lyrahub.vercel.app,https://lyrahub.yourdomain.com
    CORS_ORIGINS: str = ""

    
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

    # ─── AI Gateway Policy Settings ───────────────────────────────────────────
    # Master kill switch — set CLOUD_AI_ENABLED=false to stop ALL cloud AI.
    CLOUD_AI_ENABLED: bool = True

    # Per-role daily limits (0 = no cloud access at all)
    STUDENT_CLOUD_CALLS_PER_DAY: int = 0
    FACULTY_CLOUD_CALLS_PER_DAY: int = 1
    HOD_CLOUD_CALLS_PER_DAY: int = 5
    COS_CLOUD_CALLS_PER_DAY: int = 3
    HOS_CLOUD_CALLS_PER_DAY: int = 3
    HIGHER_AUTHORITY_CLOUD_CALLS_PER_DAY: int = 3
    SUPER_ADMIN_CLOUD_CALLS_PER_DAY: int = 50

    # Global budget safety rails
    CLOUD_AI_GLOBAL_DAILY_LIMIT: int = 25
    CLOUD_AI_GLOBAL_MONTHLY_LIMIT: int = 100

    # Per-request token cap
    CLOUD_AI_MAX_TOKENS_PER_REQUEST: int = 1500

    # Circuit breaker: max fallback retries across providers per request
    CLOUD_AI_MAX_PROVIDER_RETRIES: int = 2

    # Preferred provider order (comma-separated)
    CLOUD_AI_PROVIDER_ORDER: str = "groq,cerebras,gemini,openrouter,mistral,sambanova"

    def get_provider_keys(self, provider: str) -> list[str]:
        """Returns the list of configured API keys for a given provider for round-robin rotation."""
        provider = provider.upper()
        keys_str = getattr(self, f"{provider}_API_KEYS", "") or getattr(self, f"{provider}_API_KEY", "")
        if not keys_str:
            return []
        return [k.strip() for k in keys_str.split(",") if k.strip()]

    def get_role_cloud_limit(self, role: str) -> int:
        """Returns the daily cloud API call limit for a given role name."""
        mapping = {
            "student": self.STUDENT_CLOUD_CALLS_PER_DAY,
            "faculty": self.FACULTY_CLOUD_CALLS_PER_DAY,
            "teacher": self.FACULTY_CLOUD_CALLS_PER_DAY,
            "hod": self.HOD_CLOUD_CALLS_PER_DAY,
            "cos": self.COS_CLOUD_CALLS_PER_DAY,
            "hos": self.HOS_CLOUD_CALLS_PER_DAY,
            "higher_authority": self.HIGHER_AUTHORITY_CLOUD_CALLS_PER_DAY,
            "admin": self.SUPER_ADMIN_CLOUD_CALLS_PER_DAY,
            "super_admin": self.SUPER_ADMIN_CLOUD_CALLS_PER_DAY,
            "alumni": 0,
        }
        return mapping.get(role.lower(), 0)
    
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")

@lru_cache
def get_settings():
    return Settings()
