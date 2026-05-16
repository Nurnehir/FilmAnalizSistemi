# Film & Dizi Öneri Sistemi

LLM destekli kişiselleştirilmiş film/dizi öneri uygulaması.

Kullanıcı ruh halini doğal dilde yazar → Gemini analiz eder → TMDB'den uygun filmler çeker → her biri için Türkçe gerekçe üretir.

---

## Özellikler

- Doğal dil ile film/dizi öneri alma (Gemini 2.0 Flash)
- Trend içerikler dashboard'u (TMDB canlı veri)
- Kullanıcı kaydı, girişi, JWT auth
- İzleme listesi (ekle / çıkar / görüntüle)
- Öneri geçmişi
- Film detay sayfası (oyuncu kadrosu, benzer filmler)

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI + SQLAlchemy 2.x |
| Veritabanı | PostgreSQL 15 (Docker) |
| AI | Google Gemini 2.0 Flash |
| Film Verisi | TMDB API v3 |
| Auth | JWT — python-jose + bcrypt |

---

## Portlar

| Servis | Port |
|---|---|
| Frontend | **5174** |
| Backend API | **8001** |
| PostgreSQL | **5433** |

---

## Kurulum

### Gereksinimler
- Docker Desktop
- Python 3.11+
- Node.js 20+

### 1. Ortam Değişkenleri

```bash
cp backend/.env.example backend/.env
```

`backend/.env` dosyasını doldur:

```env
DATABASE_URL=postgresql://filmuser:filmpass@localhost:5433/filmdb
SECRET_KEY=en-az-32-karakter-rastgele-bir-anahtar
TMDB_API_KEY=<TMDB Read Access Token — themoviedb.org/settings/api>
GEMINI_API_KEY=<Google AI Studio API Key — aistudio.google.com>
```

`frontend/.env`:
```env
VITE_API_URL=http://localhost:8001
```

### 2. Docker ile Başlatma (Önerilen)

```bash
docker-compose up --build
```

Uygulama: http://localhost:5174  
API Docs: http://localhost:8001/docs

VS Code kullanıyorsan **Cmd+Shift+R** ile de başlatabilirsin.

### 3. Manuel Kurulum

```bash
# PostgreSQL
docker-compose up -d

# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8001

# Frontend (yeni terminal)
cd frontend
npm install
npm run dev
```

---

## API Endpoint'leri

| Method | Endpoint | Auth | Açıklama |
|---|---|---|---|
| POST | /auth/register | — | Kayıt ol |
| POST | /auth/login | — | Giriş yap |
| GET | /auth/me | ✓ | Aktif kullanıcı |
| GET | /movies/trending | — | Trend filmler |
| GET | /movies/search?q= | — | Film/dizi ara |
| GET | /movies/{id} | — | Film detayı |
| GET | /movies/{id}/similar | — | Benzer filmler |
| POST | /recommendations | ✓ | AI öneri al |
| GET | /recommendations/history | ✓ | Öneri geçmişi |
| GET | /watchlist | ✓ | İzleme listesi |
| POST | /watchlist | ✓ | Listeye ekle |
| DELETE | /watchlist/{id} | ✓ | Listeden çıkar |

---

## Demo Akışı

1. Kayıt ol → giriş yap
2. Dashboard'da trend filmler görüntüle
3. **AI Öneri** sayfasına git → ruh halini yaz (örn: *"Bugün yorgunum, hafif komedi istiyorum"*)
4. Gemini analiz eder → 5 kişisel öneri + her biri için gerekçe
5. Beğendiğin filmi izleme listesine ekle
6. Film detay sayfasında oyuncular ve benzer filmler

---

## Mimari

Detaylı mimari dokümantasyon: [docs/architecture.md](docs/architecture.md)

---

## Proje Yapısı

```
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── routers/   # auth, movies, recommendations, watchlist
│   │   ├── services/  # gemini_service, tmdb_service, auth_service
│   │   ├── models/    # SQLAlchemy ORM modelleri
│   │   └── schemas/   # Pydantic şemaları
│   └── alembic/       # DB migration'ları
├── database/          # init.sql
├── docs/              # Mimari dokümantasyon
└── docker-compose.yml
```

---

*Danışman: Doç. Dr. Ferhat UÇAR — Fırat Üniversitesi Yazılım Mühendisliği*
