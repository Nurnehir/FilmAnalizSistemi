from sqlalchemy import Column, Integer, SmallInteger, String, Text, Boolean, DateTime, ForeignKey, CheckConstraint, func
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tmdb_id      = Column(Integer, nullable=False)
    media_type   = Column(String(10), nullable=False, server_default="movie")
    rating       = Column(SmallInteger, nullable=False)
    body         = Column(Text, nullable=False)
    has_spoiler  = Column(Boolean, nullable=False, server_default="false")
    is_anonymous = Column(Boolean, nullable=False, server_default="false")
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_reviews_rating"),
        CheckConstraint("char_length(body) >= 10 AND char_length(body) <= 2000", name="chk_reviews_body_length"),
    )
