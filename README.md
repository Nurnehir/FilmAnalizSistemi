# Film & Dizi Öneri Sistemi

Yapay zeka destekli kişiselleştirilmiş film/dizi öneri uygulaması.

Kullanıcı ruh halini doğal dilde yazar → Yapay zeka analiz eder → TMDB'den uygun filmler çeker → her biri için Türkçe gerekçe üretir.

---

## Özellikler

- Doğal dil ile film/dizi öneri alma (Groq — Llama 3.3 70B)
- Trend içerikler dashboard'u (TMDB canlı veri)
- Film detay sayfası — oyuncu kadrosu, benzer filmler, fragman izleme (YouTube/Vimeo)
- Kullanıcı kaydı, girişi, JWT auth
- Profil sayfası — kullanıcı adı, şifre ve avatar güncelleme
- İzleme listesi (ekle / çıkar / görüntüle)
- Öneri geçmişi

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | FastAPI + SQLAlchemy 2.x |
| Veritabanı | PostgreSQL 15 (Docker) |
| Yapay Zeka | Groq API — Llama 3.3 70B Versatile |
| Film Verisi | TMDB API v3 |
| Auth | JWT — python-jose + bcrypt |
| Container | Docker + Docker Compose |

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

Kök dizinde `.env` dosyası oluştur:

```bash
cp .env.example .env
```

`.env` dosyasını doldur:

```env
DATABASE_URL=postgresql://filmuser:filmpass@db:5432/filmdb
SECRET_KEY=en-az-32-karakter-rastgele-bir-anahtar
TMDB_API_KEY=<TMDB Read Access Token — themoviedb.org/settings/api>
GROQ_API_KEY=<Groq API Key — console.groq.com/keys>
```

> **Not:** Groq API anahtarı ücretsizdir. [console.groq.com](https://console.groq.com) adresinden kayıt olup alabilirsiniz.

### 2. Docker ile Başlatma (Önerilen)

```bash
docker-compose up --build
```

Uygulama: http://localhost:5174  
API Docs: http://localhost:8001/docs

### 3. Manuel Kurulum

```bash
# PostgreSQL
docker-compose up -d db

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
| PUT | /auth/me | ✓ | Kullanıcı adı güncelle |
| PUT | /auth/password | ✓ | Şifre güncelle |
| POST | /auth/avatar | ✓ | Profil resmi güncelle |
| GET | /movies/trending | — | Trend filmler |
| GET | /movies/search?q= | — | Film/dizi ara |
| GET | /movies/{id} | — | Film detayı |
| GET | /movies/{id}/similar | — | Benzer filmler |
| GET | /movies/{id}/videos | — | Fragmanlar |
| POST | /recommendations | ✓ | Yapay zeka önerisi al |
| GET | /recommendations/history | ✓ | Öneri geçmişi |
| GET | /watchlist | ✓ | İzleme listesi |
| POST | /watchlist | ✓ | Listeye ekle |
| DELETE | /watchlist/{id} | ✓ | Listeden çıkar |

---

## Demo Akışı

1. Kayıt ol → giriş yap
2. Dashboard'da trend filmler görüntüle
3. **Öneri** sayfasına git → ruh halini yaz (örn: *"Bugün yorgunum, hafif komedi istiyorum"*)
4. Yapay zeka analiz eder → 5 kişisel öneri + her biri için gerekçe
5. Film detay sayfasında fragmanı izle
6. Beğendiğin filmi izleme listesine ekle

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
│   │   ├── services/  # gemini_service (Groq), tmdb_service, auth_service
│   │   ├── models/    # SQLAlchemy ORM modelleri
│   │   └── schemas/   # Pydantic şemaları
│   └── alembic/       # DB migration'ları
├── docs/              # Mimari dokümantasyon
├── .env.example       # Ortam değişkenleri şablonu
└── docker-compose.yml
```

---

*Danışman: Doç. Dr. Ferhat UÇAR — Fırat Üniversitesi Yazılım Mühendisliği*
