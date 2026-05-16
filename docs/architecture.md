# Sistem Mimarisi — Film & Dizi Öneri Sistemi

## Genel Bakış

3 katmanlı web uygulaması: React frontend, FastAPI backend, PostgreSQL veritabanı.
Yapay zeka bileşeni olarak Google Gemini API, film verisi için TMDB API kullanılır.

---

## Katmanlar

```
Tarayıcı (React + Vite)
        ↕ HTTP/REST + JWT
FastAPI Backend (Python)
        ↕ SQLAlchemy ORM
PostgreSQL (Docker)

Backend ayrıca dış servislere bağlanır:
  → Gemini API   (ruh hali analizi + öneri gerekçesi)
  → TMDB API v3  (film/dizi verisi, posterler)
```

---

## Veritabanı Şeması

```
users
  id, email (unique), username (unique), password (bcrypt), created_at

watchlist
  id, user_id (FK→users), tmdb_id, media_type, title, poster_path, added_at
  UNIQUE(user_id, tmdb_id, media_type)

recommendation_history
  id, user_id (FK→users), user_prompt, ai_response, tmdb_ids[], created_at
```

Film detayları veritabanında saklanmaz — her seferinde TMDB'den canlı çekilir.

---

## AI Öneri Akışı (2 Aşamalı)

```
Kullanıcı prompt'u
    ↓
[Aşama 1] Gemini → ruh hali analizi
    { genre_ids, sort_by, mood_summary }
    ↓
TMDB /discover/movie → 20 film
    ↓
[Aşama 2] Gemini → kişisel öneri üretimi
    her film için Türkçe gerekçe
    ↓
Sonuç: 5 film + analiz metni
    ↓
recommendation_history tablosuna kaydet
```

---

## Auth Sistemi

- Kayıt: bcrypt ile şifre hash
- Giriş: JWT token üretimi (24 saat geçerli)
- Frontend: token `localStorage`'da, her istekte `Authorization: Bearer` header
- Korumalı route: `PrivateRoute` wrapper + Axios 401 interceptor

---

## Portlar

| Servis     | İç Port | Dış Port |
|------------|---------|----------|
| PostgreSQL | 5432    | 5433     |
| Backend    | 8001    | 8001     |
| Frontend   | 5174    | 5174     |

---

## Teknoloji Versiyonları

| Teknoloji       | Versiyon     |
|-----------------|--------------|
| React           | 18.x         |
| Vite            | 8.x          |
| TailwindCSS     | 3.x          |
| FastAPI         | 0.110        |
| SQLAlchemy      | 2.0          |
| Alembic         | 1.13         |
| PostgreSQL      | 15           |
| Gemini Model    | gemini-2.0-flash |
| TMDB API        | v3           |
| Node.js         | 22 (Docker)  |
| Python          | 3.11         |
