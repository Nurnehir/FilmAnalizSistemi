from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.recommendation_history import RecommendationHistory
from app.schemas.recommendation import RecommendRequest, RecommendResponse, HistoryResponse, HistoryItem
from app.services import gemini_service, tmdb_service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendResponse)
async def recommend(
    data: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Asama 1: Ruh hali analizi
    mood = await gemini_service.analyze_mood(data.prompt)

    # Asama 2: TMDB'den film listesi cek
    try:
        tmdb_data = await tmdb_service.discover_movies(
            genre_ids=mood.get("genre_ids", []),
            sort_by=mood.get("sort_by", "popularity.desc"),
        )
        movies = tmdb_data.get("results", [])
    except Exception:
        raise HTTPException(status_code=503, detail="TMDB servisine ulasilamiyor")

    if not movies:
        raise HTTPException(status_code=404, detail="Uygun film bulunamadi")

    # Asama 3: Gemini ile kisisel oneri uret
    rec_data = await gemini_service.generate_recommendations(data.prompt, movies)

    # Oneri edilen filmleri TMDB verisinden eslestirir
    movies_by_id = {str(m.get("id") or m.get("tmdb_id")): m for m in movies}
    result_movies = []
    for rec in rec_data.get("recommendations", []):
        movie = movies_by_id.get(str(rec["tmdb_id"]))
        if movie:
            result_movies.append({
                "tmdb_id": rec["tmdb_id"],
                "title": movie.get("title") or movie.get("name"),
                "overview": movie.get("overview"),
                "poster_url": movie.get("poster_url"),
                "vote_average": movie.get("vote_average"),
                "release_date": movie.get("release_date") or movie.get("first_air_date"),
                "reason": rec["reason"],
                "media_type": movie.get("media_type", "movie"),
            })

    # DB'ye kaydet
    try:
        history = RecommendationHistory(
            user_id=current_user.id,
            user_prompt=data.prompt,
            ai_response=rec_data.get("analysis", ""),
            tmdb_ids=[r["tmdb_id"] for r in result_movies],
        )
        db.add(history)
        db.commit()
        db.refresh(history)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Gecmis kaydedilemedi")

    return RecommendResponse(
        analysis=rec_data.get("analysis", mood.get("mood_summary", "")),
        movies=result_movies,
        history_id=history.id,
    )


@router.get("/history", response_model=HistoryResponse)
async def history(
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total = db.query(RecommendationHistory).filter(
        RecommendationHistory.user_id == current_user.id
    ).count()

    rows = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == current_user.id)
        .order_by(RecommendationHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    history_items = [
        HistoryItem(
            id=r.id,
            user_prompt=r.user_prompt,
            ai_response=r.ai_response,
            tmdb_ids=r.tmdb_ids or [],
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]

    return HistoryResponse(history=history_items, total=total)
