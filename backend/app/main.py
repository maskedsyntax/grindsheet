from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, user_problems, pod
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# # Load allowed origins from environment variable or default to local development
# allowed_origins = os.getenv("ALLOWED_ORIGINS", "https://grindsheet.vercel.app").split(
#     ","
# )

# print(allowed_origins)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://grindsheet.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PATCH, etc.)
    allow_headers=["*"],  # Allow all headers (Authorization, Content-Type, etc.)
)


@app.get("/", include_in_schema=False)
async def read_root():
    return {"message": "GrindSheet Backend is running"}


app.include_router(auth.router)
app.include_router(user_problems.router)
app.include_router(pod.router)
