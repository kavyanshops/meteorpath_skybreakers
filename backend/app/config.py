from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://meteorpath:password@localhost:5432/meteorpath"
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173"
    DEBUG: bool = True

    @property
    def cors_origins(self) -> List[str]:
        origins = [o.strip() for o in self.BACKEND_CORS_ORIGINS.split(",") if o.strip()]
        defaults = [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*.vercel.app",
        ]
        combined = list(set(origins + defaults))
        combined.append("*")
        return combined

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
