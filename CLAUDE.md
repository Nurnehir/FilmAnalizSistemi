# CLAUDE.md — Film & Dizi Öneri ve Analiz Sistemi

> Her oturumda bu dosyayi ilk oku. Sonra @AGENTS.md oku. Sonra @TODO.md'ye bak ve nereden devam edecegini anla.

---

## PROJE OZETI

LLM destekli film/dizi oneri web uygulamasi.
- Kullanici dogal dilde yazar → Gemini analiz eder → TMDB'den film ceker → kisisel oneri uretir
- Stack: React + FastAPI + PostgreSQL + Gemini API + TMDB API

---

## KLASOR YAPISI (OZET)

```
film-oneri-sistemi/
├── frontend/     → React + Vite + TailwindCSS  (port 5173)
├── backend/      → FastAPI + SQLAlchemy         (port 8000)
├── database/     → init.sql
├── AGENTS.md     → Tam teknik dokuman (mimari, sema, API, servisler)
├── CLAUDE.md     → Bu dosya
└── TODO.md       → Aktif gorev listesi
```

---

## GELISTIRME KURALLARI (HER OTURUMDA GECERLI)

### Python / Backend
- FastAPI async endpoint kullan (`async def`)
- Her endpoint icin Pydantic semasi zorunlu
- DB islemi: `try/except` + rollback
- Hata mesajlari Turkce, HTTPException ile
- Auth gereken endpoint: `Depends(get_current_user)` zorunlu
- CORS origin: `http://localhost:5173`

### JavaScript / Frontend
- Bilesen: PascalCase.jsx
- API cagrisi: her zaman `src/api/` klasoru uzerinden
- Her async islemde: `isLoading` + `error` state zorunlu
- Token: `localStorage.getItem('access_token')`

### Veritabani
- Tablo/kolon: snake_case
- Her FK icin: `ON DELETE CASCADE`
- `.env` asla commit edilmez

### Naming
- Python: snake_case
- JS: camelCase, bilesen PascalCase
- DB: snake_case
- API endpoint: /kebab-case

---

## ONEMLI DOSYALAR VE KOMUTLAR

### Backend baslat
```bash
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Frontend baslat
```bash
cd frontend && npm run dev
```

### PostgreSQL
```bash
docker-compose up -d
```

### Migration
```bash
alembic upgrade head          # mevcut migration uygula
alembic revision --autogenerate -m "aciklama"  # yeni migration olustur
```

### API test
```
http://localhost:8000/docs    → Swagger UI
http://localhost:8000/health  → {"status": "ok"}
```

---

## KRITIK HATIRLATICILAR

- Gemini ve TMDB icin 2 ayri `.env` degiskeni var: `GEMINI_API_KEY`, `TMDB_API_KEY`
- TMDB poster URL: `https://image.tmdb.org/t/p/w500{poster_path}`
- Gemini model: `gemini-1.5-flash` (ucretsiz tier: 15 istek/dakika)
- JWT token suresi: 24 saat
- Watchlist unique constraint: `(user_id, tmdb_id, media_type)`
- Film detaylari DB'de saklanmaz, her seferinde TMDB'den canli cekilir

---

## DETAYLI TEKNIK BILGI

Mimari, ERD, API kontratlari, servis kodlari, prompt yapisi icin:
→ @AGENTS.md

Hangi gorevi yapacagin icin:
→ @TODO.md
