from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hora
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # 7 días

    # AI Services
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Credits
    INITIAL_CREDITS: int = 500

    class Config:
        env_file = ".env"


settings = Settings()
