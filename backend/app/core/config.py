from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./app.db"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key")  # JWT secret key
    ALGORITHM: str = "HS256"  # Default value
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 20  # Default value


settings = Settings()

if settings.SECRET_KEY == "fallback-secret-key":
    print(
        "WARNING: Using fallback SECRET_KEY. This is insecure for production. Ensure SECRET_KEY is set in the .env file or environment variables."
    )
