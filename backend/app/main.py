from fastapi import FastAPI
from app.routers import auth, user_problems
from app.models import Base
from app.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(user_problems.router)
