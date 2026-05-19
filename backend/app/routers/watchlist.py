from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist
from app.schemas.watchlist import WatchlistItem, WatchlistOut, WatchlistResponse, WatchedUpdate

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


@router.get("", response_model=WatchlistResponse)
async def get_watchlist(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = (
        db.query(Watchlist)
        .filter(Watchlist.user_id == current_user.id)
        .order_by(Watchlist.added_at.desc())
        .all()
    )
    return WatchlistResponse(items=items, total=len(items))


@router.post("", response_model=WatchlistOut, status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    data: WatchlistItem,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Watchlist)
        .filter(
            Watchlist.user_id == current_user.id,
            Watchlist.tmdb_id == data.tmdb_id,
            Watchlist.media_type == data.media_type,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Bu icerik zaten listenizde")

    try:
        item = Watchlist(
            user_id=current_user.id,
            tmdb_id=data.tmdb_id,
            media_type=data.media_type,
            title=data.title,
            poster_path=data.poster_path,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Listeye eklenemedi")


@router.patch("/{item_id}/watched", response_model=WatchlistOut)
async def update_watched(
    item_id: int,
    data: WatchedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(Watchlist)
        .filter(Watchlist.id == item_id, Watchlist.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Liste ogesi bulunamadi")
    try:
        item.watched = data.watched
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Guncellenemedi")


@router.delete("/{item_id}", status_code=status.HTTP_200_OK)
async def remove_from_watchlist(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(Watchlist)
        .filter(Watchlist.id == item_id, Watchlist.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Liste ogesi bulunamadi")
    try:
        db.delete(item)
        db.commit()
        return {"message": "Listeden kaldirildi"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Listeden kaldirilamadi")
