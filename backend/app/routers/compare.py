import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.comparison import Comparison
from app.schemas.comparison import CompareRequest, CompareResponse, CompareHistoryItem
from app.services import tmdb_service, gemini_service
from typing import List

router = APIRouter(prefix="/compare", tags=["compare"])


@router.post("", response_model=CompareResponse)
async def compare(
    body: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.tmdb_id_a == body.tmdb_id_b:
        raise HTTPException(status_code=400, detail="İki farklı film seçmelisiniz")

    try:
        movie_a, movie_b = await tmdb_service.get_movie_detail(body.tmdb_id_a, body.media_type), \
                           await tmdb_service.get_movie_detail(body.tmdb_id_b, body.media_type)
    except Exception:
        raise HTTPException(status_code=404, detail="Film detayları alınamadı")

    result = await gemini_service.compare_movies(movie_a, movie_b, username=current_user.username)

    ai_result_json = json.dumps({
        "title_a": movie_a.get("title") or movie_a.get("name"),
        "title_b": movie_b.get("title") or movie_b.get("name"),
        "poster_a": movie_a.get("poster_url"),
        "poster_b": movie_b.get("poster_url"),
        **result,
    }, ensure_ascii=False)

    try:
        record = Comparison(
            user_id=current_user.id,
            tmdb_id_a=body.tmdb_id_a,
            tmdb_id_b=body.tmdb_id_b,
            media_type=body.media_type,
            ai_result=ai_result_json,
            winner_id=result.get("winner_id"),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Karşılaştırma kaydedilemedi")

    return CompareResponse(
        id=record.id,
        title_a=movie_a.get("title") or movie_a.get("name", ""),
        title_b=movie_b.get("title") or movie_b.get("name", ""),
        poster_a=movie_a.get("poster_url"),
        poster_b=movie_b.get("poster_url"),
        comparison=result.get("comparison", ""),
        winner_id=result.get("winner_id"),
        verdict=result.get("verdict", ""),
        created_at=record.created_at,
    )


@router.get("/history", response_model=List[CompareHistoryItem])
async def history(
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Comparison)
        .filter(Comparison.user_id == current_user.id)
        .order_by(Comparison.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return rows


@router.get("/{comparison_id}")
async def get_comparison(
    comparison_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = db.query(Comparison).filter(
        Comparison.id == comparison_id,
        Comparison.user_id == current_user.id,
    ).first()
    if not row:
        raise HTTPException(status_code=404, detail="Karşılaştırma bulunamadı")
    try:
        data = json.loads(row.ai_result)
    except Exception:
        data = {}
    return {
        "id": row.id,
        "tmdb_id_a": row.tmdb_id_a,
        "tmdb_id_b": row.tmdb_id_b,
        "media_type": row.media_type,
        "winner_id": row.winner_id,
        "created_at": row.created_at,
        **data,
    }
