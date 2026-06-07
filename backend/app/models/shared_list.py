from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from app.database import Base


class SharedList(Base):
    __tablename__ = "shared_lists"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False, default="Birlikte İzleyeceklerimiz")
    owner_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SharedListMember(Base):
    __tablename__ = "shared_list_members"

    list_id   = Column(Integer, ForeignKey("shared_lists.id", ondelete="CASCADE"), primary_key=True)
    user_id   = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())


class SharedListItem(Base):
    __tablename__ = "shared_list_items"

    id          = Column(Integer, primary_key=True, index=True)
    list_id     = Column(Integer, ForeignKey("shared_lists.id", ondelete="CASCADE"), nullable=False)
    tmdb_id     = Column(Integer, nullable=False)
    media_type  = Column(String(10), nullable=False, default="movie")
    title       = Column(String(255), nullable=False)
    poster_path = Column(String(255), nullable=True)
    added_by    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    added_at    = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("list_id", "tmdb_id", "media_type", name="unique_shared_item"),
    )
