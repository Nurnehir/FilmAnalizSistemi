from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.database import Base


class WatchlistCollection(Base):
    __tablename__ = "watchlist_collections"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name       = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
