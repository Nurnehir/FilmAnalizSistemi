from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, LoginRequest, Token, UpdateUsernameRequest, UpdatePasswordRequest, AvatarUpdateRequest
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


@router.put("/me", response_model=UserOut)
async def update_username(
    data: UpdateUsernameRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if db.query(User).filter(User.username == data.username, User.id != current_user.id).first():
        raise HTTPException(status_code=400, detail="Bu kullanici adi zaten aliandi")
    try:
        current_user.username = data.username
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Guncelleme sirasinda hata olustu")


@router.put("/password")
async def update_password(
    data: UpdatePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="Mevcut sifre yanlis")
    try:
        current_user.password = hash_password(data.new_password)
        db.commit()
        return {"detail": "Sifre basariyla guncellendi"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Sifre guncellenirken hata olustu")


@router.post("/avatar", response_model=UserOut)
async def update_avatar(
    data: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        current_user.avatar_url = data.avatar_url
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Avatar guncellenirken hata olustu")


@router.delete("/avatar", response_model=UserOut)
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        current_user.avatar_url = None
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Avatar silinirken hata olustu")
