from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models import User, UserProblem
from app.schemas import TokenData, UserProblemResponse, UserProblemUpdate
from app.database import get_db
from app.utils.security import get_current_user

router = APIRouter(tags=["User Problems"])


@router.get("/user-problems", response_model=List[UserProblemResponse])
async def get_user_problems(
    token_data: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == token_data.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return db.query(UserProblem).filter(UserProblem.user_id == user.id).all()


@router.patch("/user-problems/{problem_id}", response_model=UserProblemResponse)
async def update_user_problem(
    problem_id: int,
    update_data: UserProblemUpdate,
    token_data: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if problem_id < 1 or problem_id > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid problem ID"
        )

    user = db.query(User).filter(User.username == token_data.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_problem = (
        db.query(UserProblem)
        .filter(UserProblem.user_id == user.id, UserProblem.problem_id == problem_id)
        .first()
    )
    if not user_problem:
        user_problem = UserProblem(user_id=user.id, problem_id=problem_id)
        db.add(user_problem)

    if update_data.is_solved is not None:
        setattr(user_problem, "is_solved", update_data.is_solved)
    if update_data.is_bookmarked is not None:
        setattr(user_problem, "is_bookmarked", update_data.is_bookmarked)
    if update_data.notes is not None:
        setattr(user_problem, "notes", update_data.notes)

    db.commit()
    db.refresh(user_problem)
    return user_problem
