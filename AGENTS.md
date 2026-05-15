# AGENTS.md — Film & Dizi Öneri ve Analiz Sistemi
> Bu dosya projenin teknik anayasasıdır. Codex ve tüm AI araçları bu dosyayı okuyarak geliştirme yapmalıdır.
> **Her yeni oturumda önce bu dosyayı tamamen oku, sonra kod yaz. Hiçbir tasarım kararını bu dosyaya bakmadan alma.**

---

## İÇİNDEKİLER

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Sistem Mimarisi](#2-sistem-mimarisi)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Veritabanı Tasarımı](#4-veritabanı-tasarımı)
5. [API Kontratları](#5-api-kontratları)
6. [Servis Katmanı](#6-servis-katmanı)
7. [Frontend Mimarisi](#7-frontend-mimarisi)
8. [AI Bileşeni — Gemini Entegrasyonu](#8-ai-bileşeni--gemini-entegrasyonu)
9. [Harici API — TMDB Entegrasyonu](#9-harici-api--tmdb-entegrasyonu)
10. [Auth Sistemi](#10-auth-sistemi)
11. [Ortam Değişkenleri](#11-ortam-değişkenleri)
12. [Geliştirme Kuralları](#12-geliştirme-kuralları)
13. [Hata Yönetimi](#13-hata-yönetimi)
14. [Kurulum ve Çalıştırma](#14-kurulum-ve-çalıştırma)
15. [Hocanın Kriterleri Kontrol Listesi](#15-hocanın-kriterleri-kontrol-listesi)
16. [Demo Akışı](#16-demo-akışı)

---

## 1. PROJE GENEL BAKIŞ

### Amaç
Kullanıcıların ruh haline, tercihlerine ve izleme geçmişine göre kişiselleştirilmiş film ve dizi önerileri sunan LLM destekli bir web uygulaması.

Kullanıcı "bugün melankolik ama umut veren bir film izlemek istiyorum" yazar. Sistem:
1. Gemini ile kullanıcının ruh halini ve niyetini analiz eder
2. TMDB API'den uygun kategoride içerik çeker
3. LLM her film için kişiselleştirilmiş gerekçe üretir
4. Sonuçları görsel dashboard'da sunar

### Temel Özellikler
- Doğal dil ile film/dizi öneri alma
- LLM destekli içerik analizi ve öneri gerekçesi
- Kullanıcı kaydı, girişi ve profil yönetimi
- Watchlist (izleme listesi) — ekle/çıkar/görüntüle
- Öneri geçmişi
- Dashboard: trend içerikler + kişisel öneriler

### Teknoloji Yığını

| Katman | Teknoloji | Versiyon | Açıklama |
|---|---|---|---|
| Frontend | React | 18.x | UI framework |
| Frontend Build | Vite | 5.x | Hızlı dev server |
| Frontend Stil | TailwindCSS | 3.x | Utility-first CSS |
| Frontend State | React Context + useState | — | Auth ve global state |
| Frontend Router | React Router DOM | 6.x | Sayfa yönlendirme |
| HTTP Client | Axios | 1.x | API istekleri |
| Backend | FastAPI | 0.110.x | Python web framework |
| ORM | SQLAlchemy | 2.x | DB işlemleri |
| Migration | Alembic | 1.x | DB şema versiyonlama |
| Veritabanı | PostgreSQL | 15.x | Ana veri deposu |
| AI Bileşeni | Gemini API | gemini-1.5-flash | LLM öneri motoru |
| Harici API | TMDB API | v3 | Film/dizi verisi |
| Auth | JWT (python-jose) | 3.x | Token tabanlı auth |
| Şifre Hash | passlib + bcrypt | — | Güvenli şifre saklama |
| Container | Docker + Docker Compose | — | PostgreSQL için |

---

## 2. SİSTEM MİMARİSİ

### Genel Mimari (ASCII)

```
+------------------------------------------------------------------+
|                        KULLANICI TARAYICI                        |
|                                                                   |
|  +----------------------------------------------------------+    |
|  |           REACT FRONTEND (Vite + TailwindCSS)            |    |
|  |                                                           |    |
|  |  +----------+ +----------+ +----------+ +----------+    |    |
|  |  |  Home    | |Recommend | |  Detail  | |Watchlist |    |    |
|  |  |Dashboard | |  (LLM)   | |  (Film)  | |  Listesi |    |    |
|  |  +----------+ +----------+ +----------+ +----------+    |    |
|  |                    AuthContext (JWT)                      |    |
|  +----------------------------+-----------------------------+    |
+-------------------------------|----------------------------------+
                                | HTTP/REST (JSON)
                                | Authorization: Bearer {token}
+-------------------------------|----------------------------------+
|                    FASTAPI BACKEND (:8000)                       |
|                                                                   |
|  +-------------+  +-------------+  +------------------------+   |
|  | /auth       |  | /movies     |  | /recommendations       |   |
|  | router      |  | router      |  | router                 |   |
|  +------+------+  +------+------+  +-----------+------------+   |
|         |                |                      |                |
|  +------+------+  +------+------+  +-----------+------------+   |
|  |auth_service |  |tmdb_service |  |    gemini_service      |   |
|  | (JWT/hash)  |  | (TMDB API)  |  |  (Gemini + logic)     |   |
|  +------+------+  +------+------+  +-----------+------------+   |
|         |                |                      |                |
|  +------+----------------+----------------------+------------+   |
|  |              SQLAlchemy ORM + PostgreSQL                   |   |
|  +------------------------------------------------------------+   |
+---------------------------+------------------+-------------------+
                            |                  |
                +-----------+--+    +----------+-----------+
                | PostgreSQL   |    |   Harici Servisler   |
                | (:5432)      |    |                      |
                |              |    |  TMDB API            |
                | users        |    |  (film verisi)       |
                | watchlist    |    |                      |
                | rec_history  |    |  Gemini API          |
                +--------------+    |  (LLM oneri)         |
                                    +----------------------+
```

### Veri Akış Diyagramı — Öneri İsteği

```
Kullanici
  |
  | "Bugün yorgunum, hafif komedi istiyorum"
  v
React Recommend.jsx
  |
  | POST /recommendations { prompt: "..." }
  | Authorization: Bearer {jwt_token}
  v
FastAPI recommendations router
  |
  | 1. JWT dogrula -> user_id al
  v
gemini_service.analyze_mood(prompt)
  |
  | Gemini'ye gonder -> JSON yanit al
  | { mood: "tired_light", genres: [35], keywords: ["comedy"] }
  v
tmdb_service.discover_movies(genres, keywords)
  |
  | TMDB /discover/movie?with_genres=35&...
  | 20 film listesi doner
  v
gemini_service.generate_recommendations(movies, prompt)
  |
  | Film listesi + kullanici promptu Gemini'ye gonderilir
  | Her film icin gerekcе üretilir
  v
recommendation_history tablosuna kaydet
  |
  v
Response: { analysis, movies: [{tmdb_id, title, poster, reason}] }
  |
  v
React -> Film kartlari render edilir
```

### Request/Response Yasam Dongusu

```
Frontend          Backend           PostgreSQL       Harici API
   |                 |                   |                |
   |-POST /login---> |                   |                |
   |                 |--SELECT user----> |                |
   |                 |<--user row--------|                |
   |                 | verify password   |                |
   |<-{access_token}-|                   |                |
   |                 |                   |                |
   |-GET /trending-> |                   |                |
   |                 |-----------------------------GET--> |
   |                 |<----------------------------list-- |
   |<-[movies]-------|                   |                |
   |                 |                   |                |
   |-POST /recommend>|                   |                |
   |                 |------------------Gemini analyze--> |
   |                 |<-----------------{mood,genres}----|
   |                 |------------------TMDB discover---> |
   |                 |<-----------------[20 movies]-------|
   |                 |------------------Gemini recs-----> |
   |                 |<-----------------{reasons}---------|
   |                 |--INSERT history-> |                |
   |<-{analysis,     |                   |                |
   |   movies}-------|                   |                |
```

---

## 3. KLASÖR YAPISI

```
film-oneri-sistemi/
|
+-- frontend/
|   +-- public/
|   |   +-- favicon.ico
|   +-- src/
|   |   +-- api/                      # Axios ile backend iletisimi
|   |   |   +-- client.js             # Axios instance, interceptors
|   |   |   +-- auth.js               # login, register, me
|   |   |   +-- movies.js             # trending, search, detail
|   |   |   +-- recommendations.js    # oneri al, gecmis
|   |   |   +-- watchlist.js          # ekle, cikar, listele
|   |   |
|   |   +-- components/
|   |   |   +-- MovieCard.jsx         # Film karti (poster, puan, buton)
|   |   |   +-- MovieGrid.jsx         # Film kartlari grid layout
|   |   |   +-- Navbar.jsx            # Ust navigasyon
|   |   |   +-- SearchBar.jsx         # Arama kutusu
|   |   |   +-- WatchlistButton.jsx   # Ekle/cikar toggle butonu
|   |   |   +-- LoadingSpinner.jsx    # Yukleme animasyonu
|   |   |   +-- PrivateRoute.jsx      # Auth korumali route wrapper
|   |   |
|   |   +-- pages/
|   |   |   +-- Home.jsx              # Dashboard
|   |   |   +-- Login.jsx             # Giris formu
|   |   |   +-- Register.jsx          # Kayit formu
|   |   |   +-- Recommend.jsx         # LLM oneri sayfasi (ana ozellik)
|   |   |   +-- MovieDetail.jsx       # Film detay + benzer filmler
|   |   |   +-- Watchlist.jsx         # Kullanici izleme listesi
|   |   |
|   |   +-- context/
|   |   |   +-- AuthContext.jsx       # user, token, login(), logout()
|   |   |
|   |   +-- hooks/
|   |   |   +-- useWatchlist.js       # Watchlist state hook
|   |   |
|   |   +-- App.jsx                   # Router tanimlari
|   |   +-- main.jsx                  # React entry point
|   |
|   +-- index.html
|   +-- package.json
|   +-- vite.config.js
|   +-- tailwind.config.js
|
+-- backend/
|   +-- app/
|   |   +-- main.py                   # FastAPI app, CORS, router kayitlari
|   |   +-- config.py                 # Pydantic Settings, env okuma
|   |   +-- database.py               # SQLAlchemy engine, SessionLocal, Base
|   |   +-- dependencies.py           # get_db, get_current_user
|   |   |
|   |   +-- models/
|   |   |   +-- __init__.py
|   |   |   +-- user.py
|   |   |   +-- watchlist.py
|   |   |   +-- recommendation_history.py
|   |   |
|   |   +-- schemas/
|   |   |   +-- __init__.py
|   |   |   +-- user.py               # UserCreate, UserOut, Token
|   |   |   +-- movie.py              # MovieOut, MovieDetail
|   |   |   +-- recommendation.py     # RecommendRequest, RecommendResponse
|   |   |   +-- watchlist.py          # WatchlistItem, WatchlistOut
|   |   |
|   |   +-- routers/
|   |   |   +-- __init__.py
|   |   |   +-- auth.py               # /auth/register, /login, /me
|   |   |   +-- movies.py             # /movies/trending, /search, /{id}
|   |   |   +-- recommendations.py    # /recommendations
|   |   |   +-- watchlist.py          # /watchlist
|   |   |
|   |   +-- services/
|   |       +-- __init__.py
|   |       +-- auth_service.py       # hash, verify, jwt
|   |       +-- tmdb_service.py       # TMDB API cagirilari
|   |       +-- gemini_service.py     # Gemini API + prompt yonetimi
|   |
|   +-- alembic/
|   +-- alembic.ini
|   +-- requirements.txt
|   +-- .env.example
|
+-- database/
|   +-- init.sql
|
+-- docs/
|   +-- architecture.md
|
+-- docker-compose.yml
+-- .gitignore
+-- README.md
+-- AGENTS.md
```

---

## 4. VERİTABANI TASARIMI

### Entity İlişki Diyagramı (ERD)

```
+----------------------+
|        users         |
+----------------------+
| id         SERIAL PK |<--------------------------+
| email      VARCHAR   |                           |
| username   VARCHAR   |                           |
| password   VARCHAR   |  (bcrypt hash)            |
| created_at TIMESTAMP |                           |
| updated_at TIMESTAMP |                           |
+----------------------+                           |
          |                                        |
          | 1                                      | 1
          |                                        |
          v N                                      v N
+----------------------+       +--------------------------------+
|      watchlist       |       |    recommendation_history     |
+----------------------+       +--------------------------------+
| id         SERIAL PK |       | id           SERIAL PK        |
| user_id    INT  FK   |       | user_id      INT FK           |
| tmdb_id    INT       |       | user_prompt  TEXT             |
| media_type VARCHAR   |       | ai_response  TEXT             |
| title      VARCHAR   |       | tmdb_ids     INTEGER[]        |
| poster_path VARCHAR  |       | created_at   TIMESTAMP        |
| added_at   TIMESTAMP |       +--------------------------------+
| UNIQUE(user_id,      |
|   tmdb_id,           |
|   media_type)        |
+----------------------+

NOT: Film detaylari veritabaninda saklanmaz.
     Filmler her zaman TMDB API'den canli cekilir.
     Sadece user baglantili veriler (watchlist, gecmis) DB'de tutulur.
```

### Tam SQL Şeması

```sql
-- users tablosu
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    username    VARCHAR(100) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- watchlist tablosu
CREATE TABLE watchlist (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tmdb_id     INTEGER NOT NULL,
    media_type  VARCHAR(10) NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title       VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    added_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_media UNIQUE (user_id, tmdb_id, media_type)
);

CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);

-- recommendation_history tablosu
CREATE TABLE recommendation_history (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_prompt  TEXT NOT NULL,
    ai_response  TEXT NOT NULL,
    tmdb_ids     INTEGER[] DEFAULT '{}',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rec_history_user_id ON recommendation_history(user_id);
CREATE INDEX idx_rec_history_created_at ON recommendation_history(created_at DESC);
```

### SQLAlchemy Modelleri

**models/user.py**
```python
from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), unique=True, nullable=False, index=True)
    username   = Column(String(100), unique=True, nullable=False)
    password   = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

**models/watchlist.py**
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, func
from app.database import Base

class Watchlist(Base):
    __tablename__ = "watchlist"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tmdb_id     = Column(Integer, nullable=False)
    media_type  = Column(String(10), nullable=False)
    title       = Column(String(255), nullable=False)
    poster_path = Column(String(255), nullable=True)
    added_at    = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "tmdb_id", "media_type", name="unique_user_media"),
    )
```

**models/recommendation_history.py**
```python
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, ARRAY, func
from app.database import Base

class RecommendationHistory(Base):
    __tablename__ = "recommendation_history"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user_prompt = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    tmdb_ids    = Column(ARRAY(Integer), default=[])
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
```

---

## 5. API KONTRATLAR

### Tam Endpoint Listesi

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| POST | /auth/register | Hayir | Kayit ol |
| POST | /auth/login | Hayir | Giris yap |
| GET | /auth/me | Evet | Aktif kullanici bilgisi |
| GET | /movies/trending | Hayir | Trend filmler |
| GET | /movies/search | Hayir | Film/dizi ara |
| GET | /movies/{tmdb_id} | Hayir | Film detayi |
| GET | /movies/{tmdb_id}/similar | Hayir | Benzer filmler |
| POST | /recommendations | Evet | LLM oneri al |
| GET | /recommendations/history | Evet | Oneri gecmisi |
| GET | /watchlist | Evet | Izleme listesi |
| POST | /watchlist | Evet | Listeye ekle |
| DELETE | /watchlist/{id} | Evet | Listeden cikar |

---

### Auth Endpoints

**POST /auth/register**
```json
// Request Body
{
  "email": "kullanici@email.com",
  "username": "kullanici123",
  "password": "sifre123"
}

// Response 201
{
  "id": 1,
  "email": "kullanici@email.com",
  "username": "kullanici123",
  "created_at": "2026-01-01T10:00:00Z"
}

// Hata 400: email veya username zaten var
{ "detail": "Bu email adresi zaten kullaniliyor" }
```

**POST /auth/login**
```json
// Request Body
{
  "email": "kullanici@email.com",
  "password": "sifre123"
}

// Response 200
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "kullanici@email.com",
    "username": "kullanici123"
  }
}

// Hata 401
{ "detail": "Email veya sifre hatali" }
```

---

### Movie Endpoints

**GET /movies/trending**
```json
// Query params: ?media_type=movie&page=1

// Response 200
{
  "results": [
    {
      "tmdb_id": 12345,
      "title": "Film Adi",
      "overview": "Film aciklamasi...",
      "poster_url": "https://image.tmdb.org/t/p/w500/xxx.jpg",
      "backdrop_url": "https://image.tmdb.org/t/p/w1280/yyy.jpg",
      "vote_average": 7.8,
      "release_date": "2024-03-15",
      "genre_ids": [28, 12],
      "media_type": "movie"
    }
  ],
  "total_pages": 10
}
```

**GET /movies/{tmdb_id}**
```json
// Query params: ?media_type=movie

// Response 200
{
  "tmdb_id": 12345,
  "title": "Film Adi",
  "overview": "...",
  "poster_url": "...",
  "backdrop_url": "...",
  "vote_average": 7.8,
  "vote_count": 15420,
  "release_date": "2024-03-15",
  "runtime": 148,
  "genres": [{ "id": 28, "name": "Aksiyon" }],
  "cast": [{ "name": "Oyuncu", "character": "Karakter", "profile_path": "..." }],
  "media_type": "movie"
}
```

---

### Recommendation Endpoints

**POST /recommendations**
```json
// Header: Authorization: Bearer {token}
// Request Body
{
  "prompt": "Bugün cok yorgunum, hafif güldüren bir sey istiyorum"
}

// Response 200
{
  "analysis": "Yorgun ve hafif eglence arayan kullanici icin komedi...",
  "movies": [
    {
      "tmdb_id": 11111,
      "title": "Film Adi",
      "overview": "...",
      "poster_url": "https://image.tmdb.org/t/p/w500/xxx.jpg",
      "vote_average": 7.5,
      "release_date": "2023-06-01",
      "reason": "Bu filmi onermem sebebi: hafif temposu ve guclu mizahi...",
      "media_type": "movie"
    }
  ],
  "history_id": 42
}
```

**GET /recommendations/history**
```json
// Query params: ?limit=10&offset=0

// Response 200
{
  "history": [
    {
      "id": 42,
      "user_prompt": "Bugün cok yorgunum...",
      "ai_response": "Yorgun ve hafif...",
      "tmdb_ids": [11111, 22222, 33333],
      "created_at": "2026-01-15T14:30:00Z"
    }
  ],
  "total": 5
}
```

---

### Watchlist Endpoints

**POST /watchlist**
```json
// Request Body
{
  "tmdb_id": 12345,
  "media_type": "movie",
  "title": "Film Adi",
  "poster_path": "/xxx.jpg"
}

// Response 201
{
  "id": 1,
  "tmdb_id": 12345,
  "media_type": "movie",
  "title": "Film Adi",
  "added_at": "2026-01-15T10:00:00Z"
}

// Hata 409: Zaten listede
{ "detail": "Bu icerik zaten listenizde" }
```

---

## 6. SERVİS KATMANI

### database.py
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
```

### dependencies.py
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.auth_service import verify_token
from app.models.user import User

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    user_id = verify_token(token)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Kullanici bulunamadi")
    return user
```

### config.py
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24
    TMDB_API_KEY: str
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 7. FRONTEND MİMARİSİ

### Routing Yapısı (App.jsx)

```
/              -> Home.jsx        (public)
/login         -> Login.jsx       (public, redirect if logged in)
/register      -> Register.jsx    (public, redirect if logged in)
/recommend     -> Recommend.jsx   (PRIVATE - auth gerekli)
/movie/:id     -> MovieDetail.jsx (public)
/watchlist     -> Watchlist.jsx   (PRIVATE - auth gerekli)
```

Private route'lar `PrivateRoute.jsx` wrapper'i ile korunur. Auth yoksa `/login`'e yonlendirir.

### AuthContext Yapısı

```javascript
// context/AuthContext.jsx
// State
{
  user: { id, email, username } | null,
  token: "eyJ..." | null,
  isLoading: boolean
}

// Fonksiyonlar
login(email, password)   // API cagrisi -> token kaydet -> user set et
logout()                 // token sil -> user null -> /login'e yonlendir
register(data)           // API cagrisi -> otomatik login

// Token localStorage'da saklanir: key = "access_token"
```

### Axios Client (api/client.js)

```javascript
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,  // Gemini icin 30sn timeout
});

// Her istege token ekle
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 gelirse logout
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
```

### Sayfa Detaylari

**Home.jsx**
- Mount: `GET /movies/trending` cagir
- Auth varsa: `GET /recommendations/history?limit=3` ile son gecmis
- Layout: Hero banner + trend filmler (4 kolonlu grid) + son oneriler

**Recommend.jsx**
- State: `prompt`, `isLoading`, `result`, `error`
- Buyuk textarea
- Tiklanabilir ornek prompt chipler:
  - "Bugün cok yorgunum, hafif bir sey"
  - "Ailemle izleyebilecegim bir sey"
  - "Gerilim dolu, uykumu kaciracak"
  - "90'larda gecen nostaljik bir film"
- Submit -> loading spinner -> film kartlari
- Her kart: poster, baslik, puan, AI gerekcesi, watchlist butonu

**MovieDetail.jsx**
- `useParams()` ile tmdb_id al
- `GET /movies/:id` + `GET /movies/:id/similar` paralel cagir
- Backdrop banner, poster, detaylar, oyuncu kadrosu
- Benzer filmler yatay scroll

### package.json (dependencies)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## 8. AI BİLEŞENİ — GEMİNİ ENTEGRASYONU

### Strateji: 2 Aşamalı LLM Kullanımı

```
Asama 1 — Ruh hali analizi
  Kullanici prompt'u -> Gemini -> { genre_ids, keywords, sort_by }

Asama 2 — Oneri uretimi
  Kullanici prompt'u + TMDB film listesi -> Gemini -> { analysis, reasons[] }
```

### services/gemini_service.py

```python
import google.generativeai as genai
import json
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

# ---- ASAMA 1: Ruh hali analizi ----

MOOD_ANALYSIS_PROMPT = """
Kullanicinin asagidaki mesajini analiz et ve hangi tur filmler onereceğini belirle.

Kullanici mesaji: "{prompt}"

Yanitini SADECE su JSON formatinda ver, baska hicbir sey yazma:
{{
  "mood_summary": "kullanicinin ruh halinin kisa ozeti (Turkce, 1 cumle)",
  "genre_ids": [TMDB tur ID'leri, en fazla 3 tane],
  "keywords": ["arama anahtar kelimeleri", "en fazla 3 tane"],
  "sort_by": "popularity.desc veya vote_average.desc"
}}

TMDB Tur ID Referansi:
28=Aksiyon, 12=Macera, 16=Animasyon, 35=Komedi, 80=Suc, 99=Belgesel,
18=Drama, 10751=Aile, 14=Fantezi, 27=Korku, 9648=Gizem,
10749=Romantik, 878=Bilim Kurgu, 53=Gerilim, 37=Western
"""

async def analyze_mood(prompt: str) -> dict:
    try:
        response = model.generate_content(MOOD_ANALYSIS_PROMPT.format(prompt=prompt))
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {"mood_summary": "Genel oneri", "genre_ids": [18, 35],
                "keywords": [], "sort_by": "popularity.desc"}


# ---- ASAMA 2: Oneri uretimi ----

RECOMMENDATION_PROMPT = """
Kullanici sunu soyluyor: "{prompt}"

Asagidaki film listesinden bu kullaniciya en uygun 5 tanesini sec.
Her biri icin neden onerdgini Turkce, 2-3 cumleyle acikla.

Film Listesi:
{movies_json}

Yanitini SADECE su JSON formatinda ver:
{{
  "analysis": "kullanicinin isteginin kisa analizi (1-2 cumle, Turkce)",
  "recommendations": [
    {{
      "tmdb_id": 12345,
      "reason": "Bu filmi onermem sebebi: ..."
    }}
  ]
}}

Onemli: Sadece yukaridaki listeden sec. Listede olmayan film ekleme.
"""

async def generate_recommendations(prompt: str, movies: list) -> dict:
    movies_simple = [
        {
            "tmdb_id": m.get("id") or m.get("tmdb_id"),
            "title": m.get("title") or m.get("name"),
            "overview": (m.get("overview", "")[:200] + "...") if m.get("overview") else "",
            "vote_average": m.get("vote_average", 0),
            "genre_ids": m.get("genre_ids", [])
        }
        for m in movies[:20]
    ]
    try:
        formatted = RECOMMENDATION_PROMPT.format(
            prompt=prompt,
            movies_json=json.dumps(movies_simple, ensure_ascii=False)
        )
        response = model.generate_content(formatted)
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception:
        return {
            "analysis": "Size populer filmler oneriyorum.",
            "recommendations": [
                {"tmdb_id": m["tmdb_id"], "reason": "Populer ve begenilen bir yapim."}
                for m in movies_simple[:5]
            ]
        }
```

### Gemini API Limitleri (Ucretsiz Tier)
- Dakikada: 15 istek
- Gunde: 1500 istek
- Gelistirme ve demo icin yeterli

---

## 9. HARİCİ API — TMDB ENTEGRASYONU

### API Bilgileri
- Base URL: `https://api.themoviedb.org/3`
- Auth header: `Authorization: Bearer {TMDB_READ_ACCESS_TOKEN}`
- Dil parametresi: `language=tr-TR`
- Poster URL: `https://image.tmdb.org/t/p/w500{poster_path}`
- Backdrop URL: `https://image.tmdb.org/t/p/w1280{backdrop_path}`

### services/tmdb_service.py

```python
import httpx
from app.config import settings

BASE_URL = "https://api.themoviedb.org/3"
IMAGE_BASE = "https://image.tmdb.org/t/p"
HEADERS = {
    "Authorization": f"Bearer {settings.TMDB_API_KEY}",
    "accept": "application/json"
}

def build_poster_url(path: str | None, size: str = "w500") -> str | None:
    return f"{IMAGE_BASE}/{size}{path}" if path else None

async def get_trending(media_type: str = "movie", page: int = 1) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/trending/{media_type}/week",
            headers=HEADERS,
            params={"language": "tr-TR", "page": page}
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
        item["backdrop_url"] = build_poster_url(item.get("backdrop_path"), "w1280")
        item["tmdb_id"] = item.pop("id")
    return data

async def search_movies(query: str, media_type: str = "movie", page: int = 1) -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/search/{media_type}",
            headers=HEADERS,
            params={"query": query, "language": "tr-TR", "page": page}
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
        item["tmdb_id"] = item.pop("id")
    return data

async def get_movie_detail(tmdb_id: int, media_type: str = "movie") -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/{media_type}/{tmdb_id}",
            headers=HEADERS,
            params={"language": "tr-TR", "append_to_response": "credits"}
        )
        r.raise_for_status()
    data = r.json()
    data["poster_url"] = build_poster_url(data.get("poster_path"))
    data["backdrop_url"] = build_poster_url(data.get("backdrop_path"), "w1280")
    data["tmdb_id"] = data.pop("id")
    if "credits" in data:
        data["cast"] = data["credits"]["cast"][:10]
        del data["credits"]
    return data

async def discover_movies(genre_ids: list, sort_by: str = "popularity.desc") -> dict:
    params = {
        "language": "tr-TR",
        "sort_by": sort_by,
        "vote_count.gte": 100,
        "page": 1
    }
    if genre_ids:
        params["with_genres"] = ",".join(map(str, genre_ids))
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/discover/movie",
            headers=HEADERS, params=params
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
    return data

async def get_similar(tmdb_id: int, media_type: str = "movie") -> dict:
    async with httpx.AsyncClient() as client:
        r = await client.get(
            f"{BASE_URL}/{media_type}/{tmdb_id}/similar",
            headers=HEADERS,
            params={"language": "tr-TR"}
        )
        r.raise_for_status()
    data = r.json()
    for item in data.get("results", []):
        item["poster_url"] = build_poster_url(item.get("poster_path"))
    return data
```

---

## 10. AUTH SİSTEMİ

### JWT Akışı
```
Register/Login -> bcrypt hash kontrol -> JWT token uret (24 saat)
              -> Frontend localStorage'a kaydet (key: "access_token")
              -> Her istekte: Authorization: Bearer {token}
              -> Backend verify_token -> user_id cikar -> DB'den user al
```

### services/auth_service.py

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return int(payload.get("sub"))
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecersiz veya suresi dolmus token"
        )
```

---

## 11. ORTAM DEĞİŞKENLERİ

### backend/.env.example
```env
# Veritabani
DATABASE_URL=postgresql://filmuser:filmpass@localhost:5432/filmdb

# JWT
SECRET_KEY=cok-gizli-bir-anahtar-buraya-yaz-en-az-32-karakter
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# TMDB API - https://www.themoviedb.org/settings/api
TMDB_API_KEY=buraya_tmdb_read_access_token_yapistir

# Gemini API - https://aistudio.google.com
GEMINI_API_KEY=buraya_gemini_api_key_yapistir
```

### frontend/.env.example
```env
VITE_API_URL=http://localhost:8000
```

---

## 12. GELİŞTİRME KURALLARI

### Python / FastAPI
- Her endpoint icin Pydantic semasi zorunlu (request ve response ayri)
- Tum DB islemleri `try/except` icinde
- Async endpoint'lerde `async/await` + httpx async client kullan
- HTTPException ile Turkce hata mesajlari don
- CORS middleware main.py'de: `origins=["http://localhost:5173"]`
- `Depends(get_current_user)` auth gerektiren her endpoint'te zorunlu

### React / JavaScript
- Bilesen adlari PascalCase, dosyalar PascalCase.jsx
- Hook'lar camelCase, `use` prefix zorunlu
- API cagrilari her zaman `api/` klasoru uzerinden
- Her async islemde loading + error state yonet

### Veritabani
- Tablo adlari snake_case: `users`, `watchlist`, `recommendation_history`
- Her foreign key icin `ON DELETE CASCADE`
- Sik sorgulanan kolonlara index ekle

### Git
- `.env` dosyasi asla commit edilmez
- `.gitignore`: `*.env`, `__pycache__/`, `node_modules/`, `venv/`
- Commit prefix: `feat:`, `fix:`, `docs:`

---

## 13. HATA YÖNETİMİ

### Backend HTTP Kodlari

| Kod | Durum | Ornek |
|---|---|---|
| 400 | Bad Request | Email formati yanlis |
| 401 | Unauthorized | Token gecersiz/eksik |
| 404 | Not Found | Film bulunamadi |
| 409 | Conflict | Email zaten kayitli |
| 503 | Service Unavailable | Gemini/TMDB erisилemiyor |

### Frontend Pattern
```javascript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await apiCall();
    setResult(data);
  } catch (err) {
    setError(err.response?.data?.detail || "Bir hata olustu");
  } finally {
    setIsLoading(false);
  }
};
```

---

## 14. KURULUM VE ÇALIŞTIRMA

### Gereksinimler
- Python 3.11+
- Node.js 18+
- Docker Desktop

### Adimlar

```bash
# 1. Repo klonla
git clone https://github.com/kullanici/film-oneri-sistemi.git
cd film-oneri-sistemi

# 2. PostgreSQL baslat
docker-compose up -d

# 3. Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # .env dosyasini doldur!
alembic upgrade head
uvicorn app.main:app --reload --port 8000
# API docs: http://localhost:8000/docs

# 4. Frontend (yeni terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
# Uygulama: http://localhost:5173
```

### requirements.txt
```
fastapi==0.110.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.27
alembic==1.13.1
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic-settings==2.2.1
httpx==0.26.0
google-generativeai==0.4.1
python-multipart==0.0.9
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: filmuser
      POSTGRES_PASSWORD: filmpass
      POSTGRES_DB: filmdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U filmuser -d filmdb"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

---

## 15. HOCANIN KRİTERLERİ KONTROL LİSTESİ

| Kriter | Puan | Durumu | Nasil |
|---|---|---|---|
| Problem Tanimi | 10 | Tamamlandi | LLM ile kisisellestirilmis icerik kesfi |
| Sistem Tasarimi | 15 | Tamamlandi | 3 katmanli mimari, ERD, akis diyagramlari |
| Yazilim Mimarisi | 15 | Tamamlandi | Frontend + Backend + DB + AI servisi |
| Yapay Zeka Bileseni | 15 | Tamamlandi | Gemini API — ruh hali analizi + oneri gerekcesi |
| Arayuz Kalitesi | 10 | Tamamlandi | React, dashboard, film posterleri, watchlist |
| API Kullanimi | 10 | Tamamlandi | TMDB API — gercek zamanli film verisi |
| Kod Kalitesi | 10 | Tamamlandi | Moduler yapi, servis katmani, hata yonetimi |
| Rapor | 10 | Tamamlandi | Bu dosya rapor taslagi olarak kullanilabilir |
| Sunum | 5 | Tamamlandi | Demo akisi asagida tanimli |

**Minimum bilesenler:**
- Kullanici arayuzu (React)
- Backend API (FastAPI)
- Veritabani (PostgreSQL)
- Yapay zeka bileseni (Gemini API)
- Harici API entegrasyonu (TMDB API)

---

## 16. DEMO AKIŞI (10-15 dakika)

```
1. [1 dk]  Mimari sema goster
           "3 katmanli sistem: React frontend, FastAPI backend, PostgreSQL"
           "AI: Gemini API | Harici API: TMDB"

2. [1 dk]  Kayit ol + giris yap
           JWT token alindi, dashboard acildi

3. [2 dk]  Dashboard
           Trend filmler TMDB'den canli cekiliyor
           "Bu veriler gercek zamanli TMDB API'den geliyor"

4. [4 dk]  ANA OZELLIK — Recommend sayfasi
           "Bugün cok yorgunum, hafif güldüren bir sey istiyorum" yaz
           -> Gemini analiz ediyor (loading goster)
           -> 5 film karti cikiyor, her birinde AI gerekcesi var
           -> Bir filmi watchlist'e ekle

5. [2 dk]  Film detay sayfasi
           Poster, oyuncular, benzer filmler (TMDB'den)

6. [1 dk]  Watchlist sayfasi
           Eklenen film gorünüyor

7. [2 dk]  DB kayitlarini goster
           pgAdmin veya terminal:
           SELECT * FROM recommendation_history;
           SELECT * FROM watchlist;

8. [1 dk]  Soru-cevap
```

---

---

## 17. GELİŞTİRME FAZLARI VE YAPILMA SIRASI

> Codex ve AI araclari bu siraya kesinlikle uymali. Bir faz tamamlanmadan bir sonrakine gecilmez.
> Her fazin sonunda belirtilen kontrol noktasi calistirilmali ve basarili olmali.

---

### FAZ 0 — Ortam Kurulumu (Baslangic, ~30 dk)

Bu faz elle yapilir, Codex devreye girmez.

```
[ ] 1. GitHub repo olustur: film-oneri-sistemi
[ ] 2. Klasor yapisini olustur (AGENTS.md bolum 3'e gore)
[ ] 3. docker-compose.yml olustur ve PostgreSQL baslat
       -> docker-compose up -d
       -> docker ps  (postgres container calistiyor olmali)
[ ] 4. Python venv olustur ve aktif et
       -> python -m venv venv && source venv/bin/activate
[ ] 5. Node.js kurulu mu kontrol et: node --version (18+ olmali)
[ ] 6. TMDB hesabi ac, API Read Access Token al
[ ] 7. Google AI Studio'dan Gemini API key al
[ ] 8. backend/.env dosyasini olustur ve tum degerleri doldur
[ ] 9. frontend/.env dosyasini olustur
```

**Kontrol:** `docker ps` calisinca postgres gorunmeli.

---

### FAZ 1 — Backend Temeli (Oncelik: En Yuksek)

**Hedef:** FastAPI ayaga kalkar, DB baglanir, tablolar olusur.

**Yapilma sirasi:**

```
1. backend/app/main.py          — FastAPI app, CORS, health check endpoint
2. backend/app/config.py        — Settings, .env okuma
3. backend/app/database.py      — SQLAlchemy engine, SessionLocal, Base
4. backend/app/models/          — Tum ORM modelleri (user, watchlist, rec_history)
5. backend/app/dependencies.py  — get_db, get_current_user
6. alembic init + env.py ayari  — Migration altyapisi
7. alembic revision --autogenerate -m "initial"
8. alembic upgrade head         — Tablolari olustur
9. requirements.txt             — Tum bagimliliklar
```

**Kontrol noktasi:**
```bash
uvicorn app.main:app --reload --port 8000
# http://localhost:8000/health -> {"status": "ok"} donmeli
# http://localhost:8000/docs   -> Swagger UI acilmali
```

---

### FAZ 2 — Auth Sistemi

**Hedef:** Kayit, giris, JWT token sistemi calisir.

**Yapilma sirasi:**

```
1. backend/app/schemas/user.py          — UserCreate, UserOut, Token semalari
2. backend/app/services/auth_service.py — hash_password, verify_password, create_token, verify_token
3. backend/app/routers/auth.py          — POST /auth/register, POST /auth/login, GET /auth/me
4. main.py'e router ekle                — app.include_router(auth_router)
```

**Kontrol noktasi:**
```bash
# Swagger UI uzerinden test:
# POST /auth/register -> 201 donmeli
# POST /auth/login    -> access_token donmeli
# GET  /auth/me       -> token ile kullanici bilgisi donmeli
```

---

### FAZ 3 — TMDB Entegrasyonu

**Hedef:** Film verileri TMDB'den canlı geliyor.

**Yapilma sirasi:**

```
1. backend/app/services/tmdb_service.py  — get_trending, search_movies,
                                           get_movie_detail, discover_movies, get_similar
2. backend/app/schemas/movie.py          — MovieOut, MovieDetail semalari
3. backend/app/routers/movies.py         — GET /movies/trending, /search, /{id}, /{id}/similar
4. main.py'e router ekle
```

**Kontrol noktasi:**
```bash
# GET /movies/trending -> TMDB'den gercek film listesi donmeli
# GET /movies/search?q=inception -> sonuclar gelmeli
```

---

### FAZ 4 — Gemini AI Entegrasyonu

**Hedef:** LLM oneri sistemi calisir.

**Yapilma sirasi:**

```
1. backend/app/services/gemini_service.py  — analyze_mood, generate_recommendations
2. backend/app/schemas/recommendation.py   — RecommendRequest, RecommendResponse
3. backend/app/routers/recommendations.py  — POST /recommendations, GET /history
4. main.py'e router ekle
```

**Dikkat:** Bu faz FAZ 3'ten sonra olmali cunku Gemini'nin sonuclari TMDB'den gelen filmlerle eslesiyor.

**Kontrol noktasi:**
```bash
# POST /recommendations
# Body: {"prompt": "Bugun yorgunum, komedi istiyorum"}
# -> analysis + 5 film + her birine reason donmeli
```

---

### FAZ 5 — Watchlist

**Yapilma sirasi:**

```
1. backend/app/schemas/watchlist.py   — WatchlistItem, WatchlistOut
2. backend/app/routers/watchlist.py   — GET /watchlist, POST /watchlist, DELETE /watchlist/{id}
3. main.py'e router ekle
```

**Kontrol noktasi:**
```bash
# POST /watchlist -> 201
# GET  /watchlist -> liste donmeli
# DELETE /watchlist/1 -> 200
```

---

### FAZ 6 — Backend Tamamlandi Kontrolu

Bu noktada backend tamamen calisir olmali:

```
[ ] GET  /health                    -> {"status": "ok"}
[ ] POST /auth/register             -> 201
[ ] POST /auth/login                -> access_token
[ ] GET  /auth/me                   -> kullanici bilgisi
[ ] GET  /movies/trending           -> film listesi
[ ] GET  /movies/search?q=test      -> sonuclar
[ ] GET  /movies/12345              -> film detayi
[ ] POST /recommendations           -> AI onerisi
[ ] GET  /recommendations/history   -> gecmis
[ ] GET  /watchlist                 -> liste
[ ] POST /watchlist                 -> ekleme
[ ] DELETE /watchlist/1             -> silme
```

---

### FAZ 7 — Frontend Temeli

**Hedef:** React uygulamasi ayaga kalkar, routing calisir.

**Yapilma sirasi:**

```
1. npm create vite@latest frontend -- --template react
2. cd frontend && npm install
3. TailwindCSS kurulumu (tailwind.config.js, postcss.config.js)
4. src/api/client.js             — Axios instance + interceptorlar
5. src/context/AuthContext.jsx   — user, token, login, logout, register
6. src/components/PrivateRoute.jsx
7. src/App.jsx                   — Tum route tanimlari
8. src/pages/Login.jsx           — Giris formu
9. src/pages/Register.jsx        — Kayit formu
```

**Kontrol noktasi:**
```
npm run dev -> http://localhost:5173 acilmali
Kayit ol -> giris yap -> dashboard'a yonlendirmeli
```

---

### FAZ 8 — Frontend Sayfalar

**Yapilma sirasi (bu sirada yap, atlama):**

```
1. src/components/Navbar.jsx          — Navigasyon, logout butonu
2. src/components/MovieCard.jsx       — Poster, baslik, puan, watchlist butonu
3. src/components/MovieGrid.jsx       — Kartlari grid'de goster
4. src/components/LoadingSpinner.jsx  — Yukleme animasyonu
5. src/api/movies.js                  — getTrending, searchMovies, getMovieDetail
6. src/api/recommendations.js         — getRecommendations, getHistory
7. src/api/watchlist.js               — getWatchlist, addToWatchlist, removeFromWatchlist
8. src/pages/Home.jsx                 — Dashboard: trend filmler + son oneriler
9. src/pages/Recommend.jsx            — Ana ozellik: LLM oneri sayfasi
10. src/pages/MovieDetail.jsx         — Film detay + benzer filmler
11. src/hooks/useWatchlist.js         — Watchlist state yonetimi
12. src/components/WatchlistButton.jsx
13. src/pages/Watchlist.jsx           — Kullanicinin izleme listesi
```

**Kontrol noktasi:**
```
[ ] Dashboard'da gercek filmler gorunuyor
[ ] Recommend sayfasinda AI onerisi caliyor
[ ] Film detay sayfasi aciliyor
[ ] Watchlist ekle/cikar caliyor
[ ] Login/logout caliyor
```

---

### FAZ 9 — Entegrasyon Testleri ve Hata Giderme

**Yapilacaklar:**

```
[ ] Tum sayfalarda loading state dogru calisiyor mu?
[ ] Hata mesajlari kullaniciya gosteriliyor mu?
[ ] Token suresi dolunca logout oluyor mu?
[ ] Watchlist butonu anlık guncelleniyor mu?
[ ] CORS hatasi yok mu?
[ ] Poster goruntuleri yuklenmiyor mu? (URL kontrol)
[ ] Gemini timeout durumunda hata mesaji gosteriliyor mu?
[ ] Ayni filmi 2 kez watchlist'e ekleyince 409 hatasi dogru handle ediliyor mu?
```

---

### FAZ 10 — Teslim Hazirligi

**Yapilma sirasi:**

```
1. README.md yaz (AGENTS.md bolum 14'ten al)
2. .gitignore olustur
3. GitHub'a push et
4. Demo videosu cek (AGENTS.md bolum 16'daki akisi izle)
5. Rapor taslagi olustur (Claude ile)
6. docs/architecture.md olustur
```

---

### Genel Kuralklar

```
YASAK: Faz 3 bitmeden Faz 4'e gecme (Gemini TMDB'ye bagimli)
YASAK: Frontend'e gecmeden once backend tum endpointleri calismali
YASAK: .env dosyasini commit etme
ZORUNLU: Her faz sonunda kontrol noktasini calistir
ZORUNLU: Hata alinca duzeltmeden bir sonraki faza gecme
```

---

### Hizli Baslangic Komutu Sirasi

```bash
# Faz 0
git clone ... && cd film-oneri-sistemi
docker-compose up -d

# Faz 1-5 (Backend)
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # DOLDUR!
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Faz 7-8 (Frontend) - ayri terminal
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

*Proje sahibi: [Adiniz Soyadiniz]*
*Danisман: Doc. Dr. Ferhat UCAR — Firat Universitesi Yazilim Muhendisligi*
*Son guncelleme: 2026*
