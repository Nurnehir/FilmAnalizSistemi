from sqlalchemy import Column, Integer, SmallInteger, String, Boolean, DateTime, ForeignKey, UniqueConstraint, func
from app.database import Base


class Watchlist(Base):
    __tablename__ = "watchlist"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tmdb_id     = Column(Integer, nullable=False)
    media_type  = Column(String(10), nullable=False)
    title       = Column(String(255), nullable=False)
    poster_path = Column(String(255), nullable=True)
    watched     = Column(Boolean, nullable=False, default=False, server_default="false")
    user_rating = Column(SmallInteger, nullable=True)
    added_at    = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "tmdb_id", "media_type", name="unique_user_media"),
    )
