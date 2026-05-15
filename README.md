# Film & Dizi Öneri Sistemi

LLM destekli film/dizi öneri uygulaması. Kullanıcı ruh halini doğal dilde yazar → Gemini analiz eder → TMDB'den film çeker → kişisel öneri üretir.

---

## Portlar (diğer projelerle çakışmaz)

| Servis | Port |
|---|---|
| Frontend | **5174** |
| Backend | **8001** |
| PostgreSQL | **5433** |

---

## Hızlı Başlangıç — `Cmd+Shift+R`

VS Code'da `Cmd+Shift+R` ile her şey otomatik başlar (Docker + Backend + Frontend).

Ya da manuel:

```bash
# Terminal 1 — PostgreSQL
docker-compose up -d

# Terminal 2 — Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8001

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Uygulama: **http://localhost:5174**  
API Docs: **http://localhost:8001/docs**

---

## İlk Kurulum (Bir Kez)

```bash
# 1. PostgreSQL başlat
docker-compose up -d

# 2. Backend kur
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # API keylerini doldur!
alembic upgrade head

# 3. Frontend kur
cd ../frontend
npm install
```

---

## Ortam Değişkenleri (`backend/.env`)

```env
DATABASE_URL=postgresql://filmuser:filmpass@localhost:5433/filmdb
SECRET_KEY=en-az-32-karakter-gizli-anahtar
TMDB_API_KEY=<TMDB Read Access Token (JWT)>
GEMINI_API_KEY=<Google AI Studio API Key>
```

**TMDB:** https://www.themoviedb.org/settings/api → "API Read Access Token" (uzun JWT)  
**Gemini:** https://aistudio.google.com

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI + SQLAlchemy |
| Veritabanı | PostgreSQL 15 (Docker) |
| AI | Gemini 2.0 Flash |
| Film Verisi | TMDB API v3 |
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

**Port zaten kullanımda:** `Cmd+Shift+R` bunu otomatik çözer (eski process'leri öldürür).

**Backend başlamıyor:**
```bash
cd backend && source venv/bin/activate
```

**DB bağlantı hatası:**
```bash
docker-compose up -d && docker ps
```
