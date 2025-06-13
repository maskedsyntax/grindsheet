from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, user_problems
from app.models import Base
from app.database import engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PATCH, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)

app.include_router(auth.router)
app.include_router(user_problems.router)
