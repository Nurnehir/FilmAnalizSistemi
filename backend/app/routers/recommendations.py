import json
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist
from app.models.recommendation_history import RecommendationHistory
from app.schemas.recommendation import RecommendRequest, RecommendResponse, HistoryResponse, HistoryItem, RecommendDetail, MovieRecommendation
from app.services import gemini_service, tmdb_service

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendResponse)
async def recommend(
    data: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Zevk profili kullanılacaksa prompt'a ekle
    effective_prompt = data.prompt
    if data.use_taste_profile:
        rated_items = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.user_rating.isnot(None),
        ).all()
        if len(rated_items) >= 3:
            taste_movies = [{"title": i.title, "rating": i.user_rating} for i in rated_items]
            taste_summary = await gemini_service.generate_taste_profile(taste_movies)
            if taste_summary:
                effective_prompt = (
                    f"[Kullanici zevk profili: {taste_summary}]\n\nKullanici istegi: {data.prompt}"
                )

    # Asama 1: Ruh hali analizi
    mood = await gemini_service.analyze_mood(effective_prompt)

    # Asama 2: TMDB'den film listesi cek
    try:
        tmdb_data = await tmdb_service.discover_movies(
            genre_ids=mood.get("genre_ids", []),
            sort_by=mood.get("sort_by", "popularity.desc"),
            exclude_genre_ids=mood.get("exclude_genre_ids", []),
        )
        movies = tmdb_data.get("results", [])
    except Exception:
        raise HTTPException(status_code=503, detail="TMDB servisine ulasilamiyor")

    if not movies:
        raise HTTPException(status_code=404, detail="Uygun film bulunamadi")

    # Asama 3: Gemini ile kisisel oneri uret
    rec_data = await gemini_service.generate_recommendations(effective_prompt, movies)

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

    # DB'ye kaydet (analysis + movies with reasons JSON olarak)
    try:
        history = RecommendationHistory(
            user_id=current_user.id,
            user_prompt=data.prompt,
            ai_response=json.dumps({
                "analysis": rec_data.get("analysis", mood.get("mood_summary", "")),
                "movies": result_movies,
            }, ensure_ascii=False),
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


@router.get("/{rec_id}", response_model=RecommendDetail)
async def get_recommendation_detail(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(RecommendationHistory).filter(
        RecommendationHistory.id == rec_id,
        RecommendationHistory.user_id == current_user.id,
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Kayit bulunamadi")

    # Yeni format: ai_response JSON içerir (analysis + movies)
    analysis = record.ai_response
    movies = []

    try:
        parsed = json.loads(record.ai_response)
        analysis = parsed.get("analysis", record.ai_response)
        movies = parsed.get("movies", [])
    except (json.JSONDecodeError, TypeError):
        pass  # Eski format: düz metin

    # Eski kayıtlar için TMDB'den film detaylarını çek
    if not movies and record.tmdb_ids:
        async def fetch_one(tmdb_id):
            try:
                return await tmdb_service.get_movie_detail(tmdb_id, "movie")
            except Exception:
                return None

        fetched = await asyncio.gather(*[fetch_one(tid) for tid in record.tmdb_ids])
        movies = [m for m in fetched if m]

    return RecommendDetail(
        id=record.id,
        user_prompt=record.user_prompt,
        analysis=analysis,
        created_at=record.created_at.isoformat(),
        movies=[MovieRecommendation(**m) if isinstance(m, dict) else m for m in movies],
    )
