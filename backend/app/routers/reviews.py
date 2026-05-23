from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.database import SessionLocal
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewOut, ReviewListResponse
from app.services.auth_service import verify_token

router = APIRouter(tags=["reviews"])

security = HTTPBearer(auto_error=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        user_id = verify_token(credentials.credentials)
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def get_required_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Giriş yapmanız gerekiyor")
    try:
        user_id = verify_token(credentials.credentials)
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
        return user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Geçersiz token")


def _build_review_out(review: Review, db: Session, current_user: Optional[User]) -> ReviewOut:
    user = db.query(User).filter(User.id == review.user_id).first()
    display_name = "Anonim" if review.is_anonymous else (user.username if user else "Bilinmiyor")
    is_own = current_user is not None and current_user.id == review.user_id
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        body=review.body,
        has_spoiler=review.has_spoiler,
        is_anonymous=review.is_anonymous,
        created_at=review.created_at,
        updated_at=review.updated_at,
        display_name=display_name,
        is_own=is_own,
    )


@router.get("/{tmdb_id}/reviews", response_model=ReviewListResponse)
async def get_reviews(
    tmdb_id: int,
    media_type: str = Query("movie"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    offset = (page - 1) * limit
    total = db.query(func.count(Review.id)).filter(
        Review.tmdb_id == tmdb_id,
        Review.media_type == media_type,
    ).scalar()

    avg_result = db.query(func.avg(Review.rating)).filter(
        Review.tmdb_id == tmdb_id,
        Review.media_type == media_type,
    ).scalar()
    avg_rating = round(float(avg_result), 1) if avg_result is not None else None

    reviews_db = (
        db.query(Review)
        .filter(Review.tmdb_id == tmdb_id, Review.media_type == media_type)
        .order_by(Review.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    reviews_out = [_build_review_out(r, db, current_user) for r in reviews_db]
    return ReviewListResponse(reviews=reviews_out, total=total, avg_rating=avg_rating)


@router.post("/{tmdb_id}/reviews", response_model=ReviewOut, status_code=201)
async def create_review(
    tmdb_id: int,
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_required_user),
):
    existing = db.query(Review).filter(
        Review.user_id == current_user.id,
        Review.tmdb_id == tmdb_id,
        Review.media_type == data.media_type,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Bu film için zaten yorum yazdınız. Mevcut yorumunuzu düzenleyebilirsiniz.")

    review = Review(
        user_id=current_user.id,
        tmdb_id=tmdb_id,
        media_type=data.media_type,
        rating=data.rating,
        body=data.body,
        has_spoiler=data.has_spoiler,
        is_anonymous=data.is_anonymous,
    )
    db.add(review)
    try:
        db.commit()
        db.refresh(review)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Yorum kaydedilemedi")
    return _build_review_out(review, db, current_user)


@router.put("/reviews/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int,
    data: ReviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_required_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu yorumu düzenleme yetkiniz yok")

    if data.rating is not None:
        review.rating = data.rating
    if data.body is not None:
        review.body = data.body
    if data.has_spoiler is not None:
        review.has_spoiler = data.has_spoiler
    if data.is_anonymous is not None:
        review.is_anonymous = data.is_anonymous

    try:
        db.commit()
        db.refresh(review)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Yorum güncellenemedi")
    return _build_review_out(review, db, current_user)


@router.delete("/reviews/{review_id}", status_code=200)
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_required_user),
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Yorum bulunamadı")
    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu yorumu silme yetkiniz yok")

    try:
        db.delete(review)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Yorum silinemedi")
    return {"detail": "Yorum silindi"}
