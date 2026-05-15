from typing import Optional
import httpx
from app.config import settings

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p"
HEADERS = {
    "Authorization": f"Bearer {settings.TMDB_API_KEY}",
    "accept": "application/json",
}




def build_poster_url(path: Optional[str], size: str = "w500") -> Optional[str]:
    return f"{IMAGE_BASE}/{size}{path}" if path else None


async def get_trending(media_type: str = "movie", page: int = 1) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/trending/{media_type}/week",
            headers=HEADERS,
            params={"language": "tr-TR", "page": page},
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
        item["backdrop_url"] = build_poster_url(item.get("backdrop_path"), "w1280")
        item["tmdb_id"] = item.pop("id")
        item.setdefault("media_type", media_type)
    return data


async def search_movies(query: str, media_type: str = "movie", page: int = 1) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/search/{media_type}",
            headers=HEADERS,
            params={"query": query, "language": "tr-TR", "page": page},
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
        item["tmdb_id"] = item.pop("id")
        item.setdefault("media_type", media_type)
    return data


async def get_movie_detail(tmdb_id: int, media_type: str = "movie") -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/{media_type}/{tmdb_id}",
            headers=HEADERS,
            params={"language": "tr-TR", "append_to_response": "credits"},
        )
        r.raise_for_status()
    data = r.json()
    data["poster_url"] = build_poster_url(data.get("poster_path"))
    data["backdrop_url"] = build_poster_url(data.get("backdrop_path"), "w1280")
    data["tmdb_id"] = data.pop("id")
    data["media_type"] = media_type
    if "credits" in data:
        data["cast"] = data["credits"]["cast"][:10]
        del data["credits"]
    return data


async def discover_movies(genre_ids: list, sort_by: str = "popularity.desc") -> dict:
    extra = {
        "language": "tr-TR",
        "sort_by": sort_by,
        "vote_count.gte": 100,
        "page": 1,
    }
    if genre_ids:
        extra["with_genres"] = ",".join(map(str, genre_ids))
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/discover/movie",
            headers=HEADERS,
            params=extra,
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
        item.setdefault("media_type", "movie")
    return data


async def get_similar(tmdb_id: int, media_type: str = "movie") -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/{media_type}/{tmdb_id}/similar",
            headers=HEADERS,
            params={"language": "tr-TR"},
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
        item["tmdb_id"] = item.pop("id", item.get("tmdb_id"))
        item.setdefault("media_type", media_type)
    return data
