from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func as sqlfunc
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist
from app.models.recommendation_history import RecommendationHistory
from app.schemas.user import UserCreate, UserOut, LoginRequest, Token, UpdateUsernameRequest, UpdatePasswordRequest, AvatarUpdateRequest
from app.services.auth_service import hash_password, verify_password, create_token, create_reset_token, verify_reset_token, consume_reset_token
from app.config import settings

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


@router.post("/forgot-password")
async def forgot_password(
    data: dict,
    db: Session = Depends(get_db),
):
    email = data.get("email", "").strip().lower()
    user = db.query(User).filter(User.email == email).first()
    # Kullanici bulunamasa bile ayni yanit don (guvenlik)
    if not user:
        return {"detail": "Sifirlama baglantisi email adresinize gonderildi"}

    token = create_reset_token(user.id)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": "FilmAI <onboarding@resend.dev>",
            "to": [user.email],
            "subject": "Şifre Sıfırlama",
            "html": f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
              <h2 style="color:#7c3aed">Şifre Sıfırlama</h2>
              <p>Merhaba <strong>{user.username}</strong>,</p>
              <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
              <a href="{reset_url}"
                 style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;
                        border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
                Şifremi Sıfırla
              </a>
              <p style="color:#6b7280;font-size:13px">Bu bağlantı <strong>1 saat</strong> geçerlidir.</p>
              <p style="color:#6b7280;font-size:13px">Bu isteği siz yapmadıysanız bu e-postayı görmezden gelin.</p>
            </div>
            """,
        })
    except Exception as e:
        print(f"=== RESEND HATA: {e} ===", flush=True)

    return {"detail": "Sifirlama baglantisi email adresinize gonderildi"}


@router.post("/reset-password")
async def reset_password(
    data: dict,
    db: Session = Depends(get_db),
):
    token = data.get("token", "")
    new_password = data.get("new_password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Sifre en az 6 karakter olmali")

    user_id = verify_reset_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanici bulunamadi")

    try:
        user.password = hash_password(new_password)
        db.commit()
        consume_reset_token(token)
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


@router.get("/taste-profile")
async def get_taste_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services import gemini_service
    rated_items = db.query(Watchlist).filter(
        Watchlist.user_id == current_user.id,
        Watchlist.user_rating.isnot(None),
    ).all()
    rated_count = len(rated_items)
    if rated_count < 3:
        return {"rated_count": rated_count, "summary": None, "can_use": False}
    movies = [{"title": item.title, "rating": item.user_rating} for item in rated_items]
    summary = await gemini_service.generate_taste_profile(movies)
    return {"rated_count": rated_count, "summary": summary, "can_use": True}


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    watchlist_count = db.query(sqlfunc.count(Watchlist.id)).filter(
        Watchlist.user_id == current_user.id
    ).scalar() or 0

    recommendation_count = db.query(sqlfunc.count(RecommendationHistory.id)).filter(
        RecommendationHistory.user_id == current_user.id
    ).scalar() or 0

    recs = db.query(RecommendationHistory.tmdb_ids).filter(
        RecommendationHistory.user_id == current_user.id
    ).all()
    movies_recommended = sum(len(r.tmdb_ids or []) for r in recs)

    return {
        "watchlist_count": watchlist_count,
        "recommendation_count": recommendation_count,
        "movies_recommended": movies_recommended,
    }


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
