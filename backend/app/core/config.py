from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    app_name: str = "Student Dropout Prediction API"
    database_url: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/dropout_db",
        alias="DATABASE_URL",
    )
    allowed_origins: List[str] | str = Field(default=["http://localhost:5173"], alias="ALLOWED_ORIGINS")
    jwt_secret_key: str = Field(default="change-me-in-production", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, value: List[str] | str):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
