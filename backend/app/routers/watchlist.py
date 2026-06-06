from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist
from app.models.watchlist_collection import WatchlistCollection
from app.schemas.watchlist import (
    WatchlistItem, WatchlistOut, WatchlistResponse,
    WatchedUpdate, RatingUpdate, MoveItem, NoteUpdate,
    CollectionCreate, CollectionUpdate, CollectionOut,
)
from app.services import gemini_service
from app.services import tmdb_service

router = APIRouter(prefix="/watchlist", tags=["watchlist"])


# ── Collections ──────────────────────────────────────────────────────────────

@router.get("/collections", response_model=List[CollectionOut])
async def get_collections(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cols = (
        db.query(WatchlistCollection)
        .filter(WatchlistCollection.user_id == current_user.id)
        .order_by(WatchlistCollection.created_at)
        .all()
    )
    result = []
    for col in cols:
        count = db.query(Watchlist).filter(Watchlist.collection_id == col.id).count()
        result.append(CollectionOut(id=col.id, name=col.name, item_count=count, created_at=col.created_at))
    return result


@router.post("/collections", response_model=CollectionOut, status_code=status.HTTP_201_CREATED)
async def create_collection(
    data: CollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        col = WatchlistCollection(user_id=current_user.id, name=data.name.strip())
        db.add(col)
        db.commit()
        db.refresh(col)
        return CollectionOut(id=col.id, name=col.name, item_count=0, created_at=col.created_at)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Liste oluşturulamadı")


@router.put("/collections/{col_id}", response_model=CollectionOut)
async def rename_collection(
    col_id: int,
    data: CollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(WatchlistCollection).filter(
        WatchlistCollection.id == col_id,
        WatchlistCollection.user_id == current_user.id,
    ).first()
    if not col:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    try:
        col.name = data.name.strip()
        db.commit()
        db.refresh(col)
        count = db.query(Watchlist).filter(Watchlist.collection_id == col.id).count()
        return CollectionOut(id=col.id, name=col.name, item_count=count, created_at=col.created_at)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Liste yeniden adlandırılamadı")


@router.delete("/collections/{col_id}", status_code=status.HTTP_200_OK)
async def delete_collection(
    col_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    col = db.query(WatchlistCollection).filter(
        WatchlistCollection.id == col_id,
        WatchlistCollection.user_id == current_user.id,
    ).first()
    if not col:
        raise HTTPException(status_code=404, detail="Liste bulunamadı")
    try:
        db.delete(col)
        db.commit()
        return {"message": "Liste silindi"}
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Liste silinemedi")


# ── Watchlist items ───────────────────────────────────────────────────────────

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

    if data.collection_id is not None:
        col = db.query(WatchlistCollection).filter(
            WatchlistCollection.id == data.collection_id,
            WatchlistCollection.user_id == current_user.id,
        ).first()
        if not col:
            raise HTTPException(status_code=404, detail="Liste bulunamadı")

    try:
        item = Watchlist(
            user_id=current_user.id,
            tmdb_id=data.tmdb_id,
            media_type=data.media_type,
            title=data.title,
            poster_path=data.poster_path,
            collection_id=data.collection_id,
            genre_ids=data.genre_ids or [],
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Listeye eklenemedi")


@router.patch("/{item_id}/move", response_model=WatchlistOut)
async def move_item(
    item_id: int,
    data: MoveItem,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.query(Watchlist).filter(
        Watchlist.id == item_id,
        Watchlist.user_id == current_user.id,
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Liste öğesi bulunamadı")

    if data.collection_id is not None:
        col = db.query(WatchlistCollection).filter(
            WatchlistCollection.id == data.collection_id,
            WatchlistCollection.user_id == current_user.id,
        ).first()
        if not col:
            raise HTTPException(status_code=404, detail="Liste bulunamadı")

    try:
        item.collection_id = data.collection_id
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Taşınamadı")


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


@router.patch("/{item_id}/rating", response_model=WatchlistOut)
async def update_rating(
    item_id: int,
    data: RatingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.rating is not None and not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Puan 1-5 arasinda olmali")
    item = (
        db.query(Watchlist)
        .filter(Watchlist.id == item_id, Watchlist.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Liste ogesi bulunamadi")
    try:
        item.user_rating = data.rating
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Puan kaydedilemedi")


@router.post("/{item_id}/summarize", response_model=WatchlistOut)
async def summarize_movie(
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
        raise HTTPException(status_code=404, detail="Liste öğesi bulunamadı")

    try:
        detail = await tmdb_service.get_movie_detail(item.tmdb_id, item.media_type)
        genres = [g.get("name", "") for g in detail.get("genres", [])]
        overview = detail.get("overview", "")
    except Exception:
        genres = []
        overview = ""

    summary = await gemini_service.generate_movie_summary(
        title=item.title,
        overview=overview,
        genres=genres,
        username=current_user.username,
    )

    try:
        item.ai_summary = summary
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Özet kaydedilemedi")


@router.patch("/{item_id}/note", response_model=WatchlistOut)
async def update_note(
    item_id: int,
    data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = (
        db.query(Watchlist)
        .filter(Watchlist.id == item_id, Watchlist.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Liste öğesi bulunamadı")

    note = data.personal_note
    if note is not None and len(note) > 500:
        raise HTTPException(status_code=422, detail="Not en fazla 500 karakter olabilir")

    try:
        item.personal_note = note if note else None
        db.commit()
        db.refresh(item)
        return item
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Not kaydedilemedi")


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
