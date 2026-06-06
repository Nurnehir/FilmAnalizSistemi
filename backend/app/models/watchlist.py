from sqlalchemy import Column, Integer, SmallInteger, String, Boolean, Text, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY
from app.database import Base


class Watchlist(Base):
    __tablename__ = "watchlist"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tmdb_id       = Column(Integer, nullable=False)
    media_type    = Column(String(10), nullable=False)
    title         = Column(String(255), nullable=False)
    poster_path   = Column(String(255), nullable=True)
    watched       = Column(Boolean, nullable=False, default=False, server_default="false")
    user_rating   = Column(SmallInteger, nullable=True)
    collection_id = Column(Integer, ForeignKey("watchlist_collections.id", ondelete="SET NULL"), nullable=True)
    genre_ids     = Column(ARRAY(Integer), server_default='{}', nullable=True)
    ai_summary    = Column(Text, nullable=True)
    personal_note = Column(Text, nullable=True)
    added_at      = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "tmdb_id", "media_type", name="unique_user_media"),
    )
