from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    leetcode_username: Optional[str] = None
    gfg_username: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    leetcode_username: Optional[str]
    gfg_username: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserProblemUpdate(BaseModel):
    is_solved: Optional[bool] = None
    is_bookmarked: Optional[bool] = None
    notes: Optional[str] = None


class UserProblemResponse(BaseModel):
    id: int
    user_id: int
    problem_id: int
    is_solved: bool
    is_bookmarked: bool
    notes: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
