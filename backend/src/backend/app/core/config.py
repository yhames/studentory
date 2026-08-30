from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    host: str = "0.0.0.0"
    port: int = 8000
    database_url: str = "sqlite:///./data/studentory.db"
    cors_origins: list[str] = ["*"]

    secret_key: str = ""
    access_token_expire_minutes: int = 10080
    sentry_dsn: str | None = None
    sentry_environment: str = "development"
    sentry_traces_sample_rate: float = 0.0


settings = Settings()
