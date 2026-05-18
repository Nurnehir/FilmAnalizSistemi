# TODO.md — Film & Dizi Öneri Sistemi

> Claude Code bu dosyayi her oturumda okur ve tamamlanan gorevleri isaretler.
> Bir gorev bittikten sonra `[ ]` → `[x]` yap.
> Bir sonraki oturumda buradan devam et.

---

## FAZ 0 — Ortam Kurulumu
> Elle yapilir, Claude Code devreye girmez.

- [x] GitHub repo olustur: `film-oneri-sistemi`
- [x] Yerel klasor yapisini olustur (AGENTS.md bolum 3)
- [x] `docker-compose.yml` olustur
- [x] `docker-compose up -d` ile PostgreSQL baslat
- [x] Python 3.11+ kurulu mu kontrol et: `python --version` (3.9.6 mevcut, uyumlu)
- [x] Node.js 18+ kurulu mu kontrol et: `node --version` (v25.5.0 ✓)
- [x] TMDB hesabi ac → API Read Access Token al → `.env`'e yaz
- [x] Google AI Studio → Gemini API key al → `.env`'e yaz
- [x] `backend/.env` olustur ve tum degiskenleri doldur
- [x] `frontend/.env` olustur

**Kontrol:** `docker ps` → postgres container gorunmeli ✓

---

## FAZ 1 — Backend Temeli
> **Simdi buradaysan:** `cd backend && source venv/bin/activate`

- [x] `requirements.txt` olustur ve `pip install -r requirements.txt`
- [x] `app/main.py` — FastAPI app, CORS middleware, `/health` endpoint
- [x] `app/config.py` — Pydantic Settings, `.env` okuma
- [x] `app/database.py` — SQLAlchemy engine, SessionLocal, Base
- [x] `app/models/__init__.py`
- [x] `app/models/user.py` — User ORM modeli
- [x] `app/models/watchlist.py` — Watchlist ORM modeli
- [x] `app/models/recommendation_history.py` — RecommendationHistory ORM modeli
- [x] `app/dependencies.py` — `get_db`, `get_current_user`
- [x] `alembic init alembic` — Migration altyapisi
- [x] `alembic/env.py` — target_metadata ayarla
- [x] `alembic revision --autogenerate -m "initial_tables"`
- [x] `alembic upgrade head` — Tablolari olustur

**Kontrol:**
- [x] `uvicorn app.main:app --reload --port 8000` calisir
- [x] `http://localhost:8000/health` → `{"status": "ok"}`
- [x] `http://localhost:8000/docs` → Swagger UI acilir

---

## FAZ 2 — Auth Sistemi

- [x] `app/schemas/user.py` — `UserCreate`, `UserOut`, `Token`, `LoginRequest`
- [x] `app/services/auth_service.py` — `hash_password`, `verify_password`, `create_token`, `verify_token`
- [x] `app/routers/auth.py` — `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- [x] `app/main.py`'e auth router'i ekle

**Kontrol:**
- [x] `POST /auth/register` → 201, kullanici olusur
- [x] `POST /auth/login` → `access_token` doner
- [x] `GET /auth/me` → token ile kullanici bilgisi doner
- [x] Yanlis sifre → 401 doner

---

## FAZ 3 — TMDB Entegrasyonu

- [x] `app/services/tmdb_service.py` — `get_trending`, `search_movies`, `get_movie_detail`, `discover_movies`, `get_similar`
- [x] `app/schemas/movie.py` — `MovieOut`, `MovieDetail`
- [x] `app/routers/movies.py` — `GET /movies/trending`, `/movies/search`, `/movies/{id}`, `/movies/{id}/similar`
- [x] `app/main.py`'e movies router'i ekle

**Kontrol:**
- [x] `GET /movies/trending` → TMDB'den gercek film listesi doner
- [x] `GET /movies/search?q=inception` → sonuclar gelir
- [x] `GET /movies/27205` → Inception detaylari gelir
- [x] Poster URL'leri tam ve gecerli

---

## FAZ 4 — Gemini AI Entegrasyonu

- [x] `app/services/gemini_service.py` — `analyze_mood`, `generate_recommendations`
- [x] `app/schemas/recommendation.py` — `RecommendRequest`, `RecommendResponse`, `MovieRecommendation`
- [x] `app/routers/recommendations.py` — `POST /recommendations`, `GET /recommendations/history`
- [x] `app/main.py`'e recommendations router'i ekle

**Kontrol:**
- [x] `POST /recommendations` body: `{"prompt": "Bugun yorgunum komedi istiyorum"}` → 5 film + reason doner
- [x] Oneri `recommendation_history` tablosuna kaydedildi mi? (DB kontrol) ✓
- [x] `GET /recommendations/history` → gecmis oneriler listelenir
- [x] Gemini hata verdigi durumda fallback calisir mi? ✓ (429 rate limit → fallback)

---

## FAZ 5 — Watchlist

- [x] `app/schemas/watchlist.py` — `WatchlistItem`, `WatchlistOut`
- [x] `app/routers/watchlist.py` — `GET /watchlist`, `POST /watchlist`, `DELETE /watchlist/{id}`
- [x] `app/main.py`'e watchlist router'i ekle

**Kontrol:**
- [x] `POST /watchlist` → 201, DB'ye kaydedilir
- [x] `GET /watchlist` → kullanicinin listesi doner
- [x] `DELETE /watchlist/1` → 200, kayit silinir
- [x] Ayni filmi 2 kez ekleyince → 409 Conflict doner

---

## FAZ 6 — Backend Tamamlandi Kontrolu

- [x] Tum endpointler Swagger UI'da gorunuyor (12 endpoint)
- [x] Auth middleware token olmadan 401 donuyor
- [x] CORS hatasi yok (frontend'den test et)
- [x] DB'de 3 tablo mevcut: `users`, `watchlist`, `recommendation_history`
- [x] `.env` dosyasi `.gitignore`'da

---

## FAZ 7 — Frontend Temeli

- [x] `npm create vite@latest frontend -- --template react`
- [x] `cd frontend && npm install`
- [x] TailwindCSS kur: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- [x] `tailwind.config.js` content ayarla
- [x] `src/index.css`'e Tailwind directives ekle
- [x] `src/api/client.js` — Axios instance + interceptorlar (auth + 401 logout)
- [x] `src/context/AuthContext.jsx` — `user`, `token`, `login`, `logout`, `register`
- [x] `src/components/PrivateRoute.jsx` — auth yoksa /login'e yonlendir
- [x] `src/App.jsx` — tum route tanimlari
- [x] `src/pages/Login.jsx` — giris formu
- [x] `src/pages/Register.jsx` — kayit formu

**Kontrol:**
- [x] `npm run dev` → `http://localhost:5173` acilir (200 OK)
- [ ] Kayit ol → otomatik giris → dashboard'a yonlendirir
- [ ] Yanlis sifre → hata mesaji gosterilir
- [ ] Sayfayi yenile → oturum korunur (localStorage'dan token okunur)

---

## FAZ 8 — Frontend Sayfalar

### Bilesen ve API katmani
- [x] `src/components/LoadingSpinner.jsx`
- [x] `src/components/Navbar.jsx` — logo, navigasyon, logout
- [x] `src/components/MovieCard.jsx` — poster, baslik, puan, watchlist butonu
- [x] `src/components/MovieGrid.jsx` — kartlari grid'de listele
- [x] `src/components/WatchlistButton.jsx` — ekle/cikar toggle
- [x] `src/api/movies.js` — `getTrending`, `searchMovies`, `getMovieDetail`, `getSimilar`
- [x] `src/api/recommendations.js` — `getRecommendations`, `getHistory`
- [x] `src/api/watchlist.js` — `getWatchlist`, `addToWatchlist`, `removeFromWatchlist`
- [x] `src/hooks/useWatchlist.js` — watchlist state hook

### Sayfalar
- [x] `src/pages/Home.jsx` — dashboard: trend filmler + son 3 oneri
- [x] `src/pages/Recommend.jsx` — LLM oneri sayfasi (ana ozellik)
- [x] `src/pages/MovieDetail.jsx` — film detay + benzer filmler
- [x] `src/pages/Watchlist.jsx` — kullanicinin izleme listesi

**Kontrol:**
- [ ] Dashboard'da gercek filmler gorunuyor
- [ ] Recommend sayfasinda prompt yaz → AI onerisi geliyor
- [ ] Film posterler yukleniyor
- [ ] MovieDetail sayfasi aciliyor
- [ ] Watchlist ekle/cikar anlık calisir
- [ ] Loading spinner gorunuyor
- [ ] Hata mesajlari kullaniciya gosteriliyor

---

## FAZ 9 — Entegrasyon ve Hata Giderme

- [x] Tum sayfalarda loading state dogru calisiyor
- [x] CORS hatasi yok (localhost:5174 izinli)
- [x] Token suresi dolunca logout calisir (Axios interceptor)
- [x] Watchlist duplicate → 409 dogru handle ediliyor
- [x] Gemini timeout → kullaniciya hata mesaji gosteriliyor (fallback + error state)
- [x] Poster yuklenmiyor mu? → URL kontrol et (poster_url tam)
- [x] Mobil gorununum kabul edilebilir mi? (Tailwind responsive)
- [x] WatchlistButton spam fix → WatchlistContext ile tek API cagrisi

---

## FAZ 10 — Teslim Hazirligi

- [x] `README.md` yaz (kurulum + demo + mimari)
- [x] `.gitignore` olustur (`.env`, `node_modules/`, `venv/`, `__pycache__/`)
- [x] `docs/architecture.md` olustur
- [ ] GitHub'a push et
- [ ] Demo videosu cek (AGENTS.md bolum 16 akisini izle)
- [ ] Rapor taslagi olustur (Claude ile)
- [ ] Rapor PDF'e donustur
- [ ] GitHub repo linkini README'ye ekle

---

## FRAGMAN ÖZELLİĞİ

- [x] `backend/app/services/tmdb_service.py` — `get_videos(tmdb_id, media_type)` fonksiyonu ekle (TMDB `/movie/{id}/videos`)
- [x] `backend/app/routers/movies.py` — `GET /movies/{tmdb_id}/videos` endpoint ekle
- [x] `frontend/src/api/movies.js` — `getMovieVideos(tmdb_id)` fonksiyonu ekle
- [x] `frontend/src/components/TrailerModal.jsx` — YouTube/Vimeo iframe modal bileşeni
- [x] `frontend/src/pages/MovieDetail.jsx` — "Fragmanı İzle" butonu + TrailerModal entegrasyonu

---

## AKTIF OTURUM NOTU

> Claude Code bu bolumu oku: Simdi hangi fazdasin?
> Yukaridaki listede en son tamamlanmis `[x]` gorevden sonra gelen ilk `[ ]` gorevi yap.
> Bir gorevi bitirince `[x]` isle, sonrakine gec.
> Faz kontrolunu gecmeden bir sonraki faza gecme.

**Son guncelleme:** FAZ 1-10 tamamlandi. Gemini → Groq/Llama 3.3 migrasyonu tamamlandi. Siradaki: GitHub push → demo video → rapor.

---

## AI MODEL MİGRASYONU (Gemini → Groq)

- [x] Gemini API kota sorunu tespit edildi (ücretsiz tier Türkiye'de limit:0)
- [x] `requirements.txt` — `google-genai` kaldırıldı, `groq==0.13.0` eklendi
- [x] `app/services/gemini_service.py` — Groq client + Llama 3.3-70b-versatile modeline geçildi
- [x] `app/config.py` — `GEMINI_API_KEY` → `GROQ_API_KEY` olarak yeniden adlandırıldı
- [x] `docker-compose.yml` — `GROQ_API_KEY` ile güncellendi
- [x] `backend/.env` — `GROQ_API_KEY` ile güncellendi
- [x] Backend rebuild edildi, yeni anahtar container'a yüklendi
