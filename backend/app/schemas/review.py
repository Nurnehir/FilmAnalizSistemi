from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    tmdb_id: int
    media_type: str = "movie"
    rating: int
    body: str
    has_spoiler: bool = False
    is_anonymous: bool = False

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError("Puan 1-5 arasında olmalıdır")
        return v

    @field_validator("body")
    @classmethod
    def validate_body(cls, v):
        if len(v) < 10:
            raise ValueError("Yorum en az 10 karakter olmalıdır")
        if len(v) > 2000:
            raise ValueError("Yorum en fazla 2000 karakter olabilir")
        return v


class ReviewUpdate(BaseModel):
    rating: Optional[int] = None
    body: Optional[str] = None
    has_spoiler: Optional[bool] = None
    is_anonymous: Optional[bool] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if v is not None and (v < 1 or v > 5):
            raise ValueError("Puan 1-5 arasında olmalıdır")
        return v

    @field_validator("body")
    @classmethod
    def validate_body(cls, v):
        if v is not None:
            if len(v) < 10:
                raise ValueError("Yorum en az 10 karakter olmalıdır")
            if len(v) > 2000:
                raise ValueError("Yorum en fazla 2000 karakter olabilir")
        return v


class ReviewOut(BaseModel):
    id: int
    rating: int
    body: str
    has_spoiler: bool
    is_anonymous: bool
    created_at: datetime
    updated_at: datetime
    display_name: str
    is_own: bool

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    reviews: list[ReviewOut]
    total: int
    avg_rating: Optional[float] = None
