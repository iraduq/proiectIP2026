from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:2023/research_resource_manager")
    secret_key: str = Field(default="dev_secret_key_research_resource_manager_2026_super_secure")
    algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60)
    environment: str = Field(default="development")
    cors_origins: list[str] = Field(default=["http://localhost:5173", "http://localhost:3000"])

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
