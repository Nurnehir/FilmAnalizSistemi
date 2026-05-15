from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, LoginRequest, Token
from app.services.auth_service import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Bu email adresi zaten kullaniliyor")
    if db.query(User).filter(User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Bu kullanici adi zaten aliandi")
    try:
        user = User(
            email=data.email,
            username=data.username,
            password=hash_password(data.password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Kayit sirasinda hata olustu")


@router.post("/login", response_model=Token)
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Email veya sifre hatali")
    token = create_token(user.id)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserOut.from_orm(user),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return current_user
