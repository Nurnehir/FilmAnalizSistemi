from typing import Optional, List
from pydantic import BaseModel


class MovieOut(BaseModel):
    tmdb_id: int
    title: Optional[str] = None
    name: Optional[str] = None
    overview: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    vote_average: Optional[float] = None
    release_date: Optional[str] = None
    first_air_date: Optional[str] = None
    genre_ids: Optional[List[int]] = None
    media_type: Optional[str] = None

    class Config:
        from_attributes = True


class CastMember(BaseModel):
    name: str
    character: Optional[str] = None
    profile_path: Optional[str] = None


class Genre(BaseModel):
    id: int
    name: str


class MovieDetail(BaseModel):
    tmdb_id: int
    title: Optional[str] = None
    name: Optional[str] = None
    overview: Optional[str] = None
    poster_url: Optional[str] = None
    backdrop_url: Optional[str] = None
    vote_average: Optional[float] = None
    vote_count: Optional[int] = None
    release_date: Optional[str] = None
    first_air_date: Optional[str] = None
    runtime: Optional[int] = None
    genres: Optional[List[Genre]] = None
    cast: Optional[List[CastMember]] = None
    media_type: Optional[str] = None

    class Config:
        from_attributes = True


class MovieListResponse(BaseModel):
    results: List[MovieOut]
    total_pages: Optional[int] = None
