from fastapi import APIRouter, HTTPException, Query
from app.services import tmdb_service

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/trending")
async def trending(
    media_type: str = Query("movie", pattern="^(movie|tv)$"),
    page: int = Query(1, ge=1),
):
    try:
        return await tmdb_service.get_trending(media_type, page)
    except Exception:
        raise HTTPException(status_code=503, detail="TMDB servisine ulasilamiyor")


@router.get("/search")
async def search(
    q: str = Query(..., min_length=1),
    media_type: str = Query("movie", pattern="^(movie|tv)$"),
    page: int = Query(1, ge=1),
):
    try:
        return await tmdb_service.search_movies(q, media_type, page)
    except Exception:
        raise HTTPException(status_code=503, detail="TMDB servisine ulasilamiyor")


@router.get("/{tmdb_id}/similar")
async def similar(
    tmdb_id: int,
    media_type: str = Query("movie", pattern="^(movie|tv)$"),
):
    try:
        return await tmdb_service.get_similar(tmdb_id, media_type)
    except Exception:
        raise HTTPException(status_code=503, detail="TMDB servisine ulasilamiyor")


@router.get("/{tmdb_id}")
async def detail(
    tmdb_id: int,
    media_type: str = Query("movie", pattern="^(movie|tv)$"),
):
    try:
        return await tmdb_service.get_movie_detail(tmdb_id, media_type)
    except Exception:
        raise HTTPException(status_code=404, detail="Film bulunamadi")
