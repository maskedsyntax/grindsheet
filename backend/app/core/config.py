from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./app.db?check_same_thread=False"
    )
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fallback-secret-key")  # JWT secret key
    ALGORITHM: str = "HS256"  # Default value
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # Default value
    SENDGRID_API_KEY: str = os.getenv("SENDGRID_API_KEY", "")


settings = Settings()

if settings.SECRET_KEY == "fallback-secret-key":
    print(
        "WARNING: Using fallback SECRET_KEY. This is insecure for production. Ensure SECRET_KEY is set in the .env file or environment variables."
    )

if not settings.SENDGRID_API_KEY:
    print(
        "WARNING: SENDGRID_API_KEY is not set. Email sending will fail. Set SENDGRID_API_KEY in the .env file or environment variables."
    )
