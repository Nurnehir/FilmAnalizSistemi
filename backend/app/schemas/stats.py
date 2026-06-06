from pydantic import BaseModel
from typing import List, Optional


class GenreStat(BaseModel):
    genre_id: int
    genre_name_tr: str
    genre_name_en: str
    count: int


class MonthActivity(BaseModel):
    month: str   # "YYYY-MM"
    count: int


class RatingStat(BaseModel):
    rating: int
    count: int


class StatsSummary(BaseModel):
    watchlist_count: int
    watched_count: int
    avg_rating: Optional[float]
    recommendation_count: int
    movies_recommended: int


class GenreStatsResponse(BaseModel):
    genres: List[GenreStat]


class ActivityStatsResponse(BaseModel):
    months: List[MonthActivity]


class RatingStatsResponse(BaseModel):
    ratings: List[RatingStat]
