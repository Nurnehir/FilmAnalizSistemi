# Film & Dizi Öneri Sistemi

LLM destekli film/dizi öneri uygulaması. Kullanıcı ruh halini doğal dilde yazar → Gemini analiz eder → TMDB'den film çeker → kişisel öneri üretir.

---

## Hızlı Başlangıç (Her Oturumda)

### 1. PostgreSQL Başlat
```bash
docker-compose up -d
```

### 2. Backend Başlat (Terminal 1)
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Başlat (Terminal 2)
```bash
cd frontend
npm run dev
```

Uygulama: **http://localhost:5173**  
API Docs: **http://localhost:8000/docs**

---

## İlk Kurulum (Bir Kez)

### Gereksinimler
- Python 3.9+
- Node.js 18+
- Docker Desktop

### Adımlar

```bash
# 1. PostgreSQL başlat
docker-compose up -d

# 2. Backend kur
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# .env dosyasını oluştur (API keylerini doldur)
cp .env.example .env

# Veritabanı tablolarını oluştur
alembic upgrade head

# Backend başlat
uvicorn app.main:app --reload --port 8000

# 3. Frontend kur (yeni terminal)
cd frontend
npm install
npm run dev
```

---

## Ortam Değişkenleri (`backend/.env`)

```env
DATABASE_URL=postgresql://filmuser:filmpass@localhost:5432/filmdb
SECRET_KEY=en-az-32-karakter-gizli-anahtar
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
TMDB_API_KEY=<TMDB Read Access Token (JWT)>
GEMINI_API_KEY=<Google AI Studio API Key>
```

**TMDB API Key:** https://www.themoviedb.org/settings/api  
→ "API Read Access Token" (uzun JWT) kullan, kısa API Key değil.

**Gemini API Key:** https://aistudio.google.com

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI + SQLAlchemy |
| Veritabanı | PostgreSQL 15 (Docker) |
| AI | Gemini 2.0 Flash |
| Film Verisi | TMDB API |
| Auth | JWT (24 saat) |

---

## API Endpoint'leri

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| POST | /auth/register | — | Kayıt ol |
| POST | /auth/login | — | Giriş yap |
| GET | /auth/me | ✓ | Aktif kullanıcı |
| GET | /movies/trending | — | Trend filmler |
| GET | /movies/search?q= | — | Film ara |
| GET | /movies/{id} | — | Film detayı |
| GET | /movies/{id}/similar | — | Benzer filmler |
| POST | /recommendations | ✓ | AI öneri al |
| GET | /recommendations/history | ✓ | Öneri geçmişi |
| GET | /watchlist | ✓ | İzleme listesi |
| POST | /watchlist | ✓ | Listeye ekle |
| DELETE | /watchlist/{id} | ✓ | Listeden çıkar |

---

## Sorun Giderme

**CORS hatası:** Frontend 5173 dışı bir portta çalışıyordur.
```bash
# Eski Vite process'leri öldür, tekrar başlat
pkill -f vite
cd frontend && npm run dev
```

**Backend başlamıyor:** venv aktif değildir.
```bash
cd backend && source venv/bin/activate
```

**DB bağlantı hatası:** Docker çalışmıyordur.
```bash
docker-compose up -d
docker ps  # postgres görünmeli
```
