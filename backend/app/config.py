from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "ProjectFlow API"
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()