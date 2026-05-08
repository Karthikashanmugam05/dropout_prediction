from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth_schema import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return TokenResponse(access_token=access_token, role=user.role)


@router.post("/bootstrap")
def bootstrap_users(db: Session = Depends(get_db)):
    users = [
        {"username": "admin", "password": "admin123", "role": "admin"},
        {"username": "faculty", "password": "faculty123", "role": "faculty"},
    ]
    created = []
    for item in users:
        exists = db.query(User).filter(User.username == item["username"]).first()
        if exists:
            continue
        user = User(
            username=item["username"],
            password_hash=get_password_hash(item["password"]),
            role=item["role"],
        )
        db.add(user)
        created.append(item["username"])
    db.commit()
    return {"created_users": created, "message": "Bootstrap completed"}
