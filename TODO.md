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
- [x] Dashboard'da gercek filmler gorunuyor
- [x] Recommend sayfasinda prompt yaz → AI onerisi geliyor
- [x] Film posterler yukleniyor
- [x] MovieDetail sayfasi aciliyor
- [x] Watchlist ekle/cikar anlık calisir
- [x] Loading spinner gorunuyor
- [x] Hata mesajlari kullaniciya gosteriliyor

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

## ARAYÜZ İYİLEŞTİRMELERİ (Tamamlanan)

- [x] Gemini API → Groq/Llama 3.3 migrasyonu (`gemini_service.py`, `config.py`, `requirements.txt`)
- [x] API anahtarları `docker-compose.yml`'den kaldırıldı, `.env` + `env_file` yapısına geçildi
- [x] `.env.example` oluşturuldu, `.gitignore` güncellendi
- [x] Login sayfası split panel tasarımına geçildi (sol: marka, sağ: form)
- [x] Register sayfası aynı split panel tasarımına geçildi
- [x] Navbar yenilendi — avatar harfi, aktif sekme highlight, backdrop-blur
- [x] "AI Öneri" → "Öneri", "AI analiz ediyor" → "Analiz ediliyor" vb. Türkçeleştirmeler
- [x] Recommend sayfası başlığı ve loading metinleri güncellendi
- [x] Home hero butonu güncellendi

---

## YAPILACAKLAR — Yeni Özellikler

### 1. Navbar Avatar Dropdown ✅
- [x] Avatar yuvarlağına tıklayınca dropdown menü açılsın
- [x] Dropdown: kullanıcı adı + email (üst başlık), "Profil" linki, "Ayarlar" linki, "Çıkış Yap" butonu
- [x] Dropdown dışına tıklayınca kapansın (useRef + click outside)
- [ ] Koyu/açık mod + TR/EN uyumlu (5 ve 6. maddeler tamamlanınca)

### 2. Profil Sayfası (`/profile`) ✅
- [x] `src/pages/Profile.jsx` oluştur — PrivateRoute ile korunacak
- [x] App.jsx'e `/profile` route ekle
- [x] Backend: `PUT /auth/me` endpoint — kullanıcı adı güncelleme
- [x] Backend: `PUT /auth/password` endpoint — şifre güncelleme (eski şifre doğrulama zorunlu)
- [x] Backend: `POST /auth/avatar` endpoint — profil resmi yükleme (base64)
- [x] Alembic migration: `avatar_url` kolonu users tablosuna eklendi
- [x] Frontend: profil resmi yükleme + önizleme (avatar placeholder)
- [x] Frontend: kullanıcı adı düzenleme formu
- [x] Frontend: şifre güncelleme formu (eski şifre + yeni şifre + tekrar)
- [x] Koyu/açık mod + TR/EN uyumlu (5 ve 6. maddeler tamamlandı)

### 3. Ayarlar Sayfası (`/settings`)
- [x] `src/pages/Settings.jsx` oluştur — PrivateRoute ile korunacak
- [x] App.jsx'e `/settings` route ekle
- [x] Koyu/Açık mod toggle (ThemeContext ile bağlı)
- [x] Dil seçimi TR/EN (LangContext ile bağlı)
- [x] Tercihler localStorage'a kaydedilsin
- [x] Koyu/açık mod + TR/EN uyumlu

### 4. Şifremi Unuttum ✅
- [x] Backend: `POST /auth/forgot-password` endpoint (Resend ile gerçek e-posta gönderimi)
- [x] Backend: `POST /auth/reset-password` endpoint — token + yeni şifre ile sıfırlama
- [x] `src/pages/ForgotPassword.jsx` — e-posta giriş formu + başarı ekranı
- [x] `src/pages/ResetPassword.jsx` — yeni şifre formu, token URL'den okunur, 2.5sn sonra login'e yönlendirir
- [x] Login sayfasına "Şifremi unuttum" linki ekle
- [x] App.jsx'e `/forgot-password` ve `/reset-password` route eklendi
- [x] Koyu/açık mod + TR/EN uyumlu

### 5. Koyu / Açık Mod
- [x] `tailwind.config.js` — `darkMode: 'class'` aktif et
- [x] `src/context/ThemeContext.jsx` — dark/light state, localStorage'a kaydet
- [x] App.jsx'te `<html>` etiketine `dark` class'ı toggle et
- [x] Navbar'a ikon butonu ekle: koyu moddayken ☀ (açık moda geç), açık moddayken ☽ (koyu moda geç)
- [x] Login, Register, Navbar, Home, Recommend, MovieDetail, Watchlist, Profile, Settings açık mod renkleri ile güncelle

### 6. TR / EN Dil Desteği
- [x] `src/context/LangContext.jsx` — tr/en state, localStorage'a kaydet
- [x] `src/i18n/tr.js` — tüm Türkçe metinler
- [x] `src/i18n/en.js` — tüm İngilizce metinler
- [x] Navbar'a dil seçici ekle (TR / EN)
- [x] Login, Register, Home, Recommend, MovieDetail, Watchlist, Profile, Settings sayfaları dil destekli hale getir
- [x] Navbar linkleri ve dropdown dil destekli hale getir

### 7. Arama Çubuğu (Navbar) ✅
- [x] **Frontend:** Navbar'a arama ikonu ve tam genişlik arama input modu ekle (searchOpen state, debounce 800ms)
- [x] **Frontend:** `src/pages/SearchResults.jsx` — film + dizi sonuçları grid halinde, Movie/TV sekme toggle, debounce 400ms
- [x] **Frontend:** App.jsx'e `/search` route ekle
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu (search_* i18n anahtarları eklendi)
- [x] **Backend:** `GET /movies/search?q=&media_type=` endpoint zaten mevcut ✓

### 8. Film / Dizi Toggle (Trend Sayfası) ✅
- [x] **Frontend:** Home.jsx'e "Filmler" / "Diziler" sekme toggle eklendi (pill-style seçici)
- [x] **Frontend:** Sekme değişince sadece trend verisi yeniden çekiliyor, geçmiş etkilenmiyor
- [x] **Frontend:** Aktif sekme beyaz/koyu arka plan + shadow ile vurgulu, 150ms geçiş animasyonlu
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu (home_movies / home_series anahtarları kullanıldı)
- [x] **Backend:** `GET /movies/trending?media_type=tv` zaten destekleniyor ✓

### 9. Tür Filtresi Sidebar ✅
- [x] **Frontend:** `src/components/GenreSidebar.jsx` — tür listesi checkbox'lı sidebar
- [x] **Frontend:** Home.jsx'e sidebar entegrasyonu (responsive: mobilde drawer)
- [x] **Frontend:** Seçilen türlere göre `GET /movies/discover?genres=` çağrısı
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu
- [x] **Backend:** `GET /movies/discover` endpoint ekle (tmdb_service.discover_movies sarmalayıcı)
- [x] **Backend:** `app/routers/movies.py` — `GET /movies/discover?genres=&sort_by=` endpoint

### 10. Kullanıcı Profil İstatistikleri ✅
- [x] **DB:** `recommendation_history` ve `watchlist` tablolarından istatistik sorgular yazılacak
- [x] **Backend:** `GET /auth/stats` endpoint — toplam watchlist, öneri sayısı, önerilen film
- [x] **Backend:** `app/routers/auth.py`'e stats endpoint eklendi
- [x] **Backend:** watchlist_count + recommendation_count + movies_recommended (tmdb_ids toplamı)
- [x] **Frontend:** Profile.jsx'e 3 istatistik kartı eklendi (İzleme Listesi / Öneri İsteği / Önerilen Film)
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu

### 11. İzlendi İşareti (Watchlist Sekmeleri) ✅
- [x] **DB:** `watchlist` tablosuna `watched BOOLEAN DEFAULT FALSE` kolonu eklendi
- [x] **DB:** Alembic migration: `c3d4e5f6a7b8_add_watched_column.py` oluşturuldu ve uygulandı
- [x] **Backend:** `PATCH /watchlist/{id}/watched` endpoint eklendi
- [x] **Backend:** `app/schemas/watchlist.py` — `WatchedUpdate` şeması eklendi, `WatchlistOut`'a `watched` alanı eklendi
- [x] **Frontend:** Watchlist.jsx'e "Tümü" / "İzlenecek" / "İzlendi" sekmeleri eklendi (sayaçlı)
- [x] **Frontend:** Film kartına "İzledim ✓" toggle butonu eklendi (izlendi kartı yeşil kenarlıklı)
- [x] **Frontend:** `src/api/watchlist.js` — `markWatched(id, watched)` fonksiyonu eklendi
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu

### 12. Film Puanlama Sistemi (1–5 Yıldız) ✅
- [x] **DB:** `watchlist` tablosuna `user_rating SMALLINT NULL` kolonu eklendi
- [x] **DB:** Alembic migration `d4e5f6a7b8c9` oluşturuldu ve uygulandı
- [x] **Backend:** `PATCH /watchlist/{id}/rating` endpoint eklendi (1-5 validasyon + null)
- [x] **Backend:** `app/schemas/watchlist.py` — `RatingUpdate` şeması + `WatchlistOut`'a `user_rating` eklendi
- [x] **Frontend:** `src/components/StarRating.jsx` — hover efektli 1–5 yıldız bileşeni (aynı yıldıza tıklayınca sıfırlanır)
- [x] **Frontend:** Watchlist kartlarına StarRating bileşeni eklendi (watched toggle üzerinde)
- [x] **Frontend:** `src/api/watchlist.js` — `rateMovie(id, rating)` fonksiyonu eklendi
- [x] **Frontend:** Koyu/açık mod uyumlu (yıldızlar dark: variantlı)

### 13. Kişiselleştirilmiş Öneri (Zevk Profili) ✅
- [x] **Backend:** `GET /auth/taste-profile` endpoint — rated_count, summary, can_use (≥3 şart)
- [x] **Backend:** `generate_taste_profile(rated_movies)` — Groq'a puanlı film listesi gönder → özet üret
- [x] **Backend:** `POST /recommendations` — `use_taste_profile: bool` parametresi, True ise taste_summary prompt'a ekleniyor
- [x] **Frontend:** Recommend.jsx'e checkbox toggle eklendi (aktif/pasif duruma göre farklı stil)
- [x] **Frontend:** Toggle açıkken Groq'tan gelen profil özeti gösteriliyor
- [x] **Frontend:** 3'ten az puanlı film varsa toggle gösterilmiyor, kaç puanlandığı (0/3) gösteriliyor
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu
- [x] **Ön koşul:** 11 ve 12 tamamlandı ✓

### 14. Öneri Geçmişi Detay Görünümü — ChatGPT Sidebar ✅
> Öneri sayfası sol panel + ana alan şeklinde yeniden tasarlandı.

- [x] **Backend:** `GET /recommendations/{id}` endpoint — tek öneri kaydını getir (user_id korumalı)
- [x] **Backend:** `POST /recommendations` güncellendi — `ai_response` artık full JSON saklar `{analysis, movies}`
- [x] **Backend:** Eski kayıtlar için fallback: `tmdb_ids` ile TMDB'den paralel fetch (`asyncio.gather`)
- [x] **Backend:** `app/schemas/recommendation.py` — `RecommendDetail` şeması eklendi
- [x] **Frontend:** `src/api/recommendations.js` — `getRecommendationById(id)` fonksiyonu eklendi
- [x] **Frontend:** `Recommend.jsx` ChatGPT-style sidebar düzenine geçirildi
  - Sol sidebar: son 10 öneri, truncated prompt, hover'da göz ikonu
  - Aktif öneri mor ile vurgulu
  - "Yeni Öneri" butonu sidebar'ın en üstünde
  - Göz ikonuna basınca: orijinal prompt kutusu + AI analiz + film grid
  - Mobilde hamburger ile açılır sidebar (overlay + backdrop)
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu (rec_new, rec_history_* anahtarları eklendi)

### 15. Uygulama Adı Değişikliği
> "FilmAI" ismi değiştirilecek. Yeni isim belirlendikten sonra tüm görünen yerlerde güncellenecek.

- [ ] **Karar:** Yeni uygulama adını belirle (örn: "CineMatch", "FilmRadar", "MoodCine", "Sinefil" vb.)
- [ ] **Frontend:** `frontend/index.html` — `<title>` etiketi güncelle
- [ ] **Frontend:** `src/components/Navbar.jsx` — logo/marka adı güncelle (sol üst köşe metni)
- [ ] **Frontend:** `src/pages/Login.jsx` — sol panel branding başlığı güncelle (eğer uygulama adı geçiyorsa)
- [ ] **Frontend:** `src/pages/Register.jsx` — sol panel branding güncelle (eğer uygulama adı geçiyorsa)
- [ ] **Frontend:** `src/i18n/tr.js` ve `src/i18n/en.js` — uygulama adı içeren string anahtarları güncelle
- [ ] **Diğer:** `README.md` başlığı ve açıklaması güncelle
- [ ] **Diğer:** `CLAUDE.md` / `AGENTS.md` içinde geçen referanslar güncelle (opsiyonel)

### 16. Şifre Göster / Gizle (Göz İkonu — Password Toggle) ✅
> Login, Register ve Profile sayfalarındaki şifre alanlarının sağında göz ikonu olacak.
> Tıklayınca `type="password"` ↔ `type="text"` toggle olacak.
> Backend değişikliği yok, tamamen frontend UI özelliği.

- [x] **Frontend:** `src/components/PasswordInput.jsx` reusable bileşen oluştur
  - Props: `value`, `onChange`, `placeholder`, `required`, `className`, `name`, `autoComplete`
  - İçinde `show` boolean state tut
  - Sağda toggle butonu: göz açık SVG (gizli modda) ↔ göz kapalı SVG (görünür modda)
  - `type={show ? 'text' : 'password'}` dinamik
  - Göz ikonu: `w-5 h-5`, `text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`
  - Buton `type="button"` + `tabIndex={-1}` (form submit tetiklemesin, tab akışını bozmassın)
- [x] **Frontend:** `src/pages/Login.jsx` — şifre `<input>` → `<PasswordInput autoComplete="current-password">` ile değiştirildi
- [x] **Frontend:** `src/pages/Register.jsx` — şifre `<input>` → `<PasswordInput autoComplete="new-password">` ile değiştirildi
- [x] **Frontend:** `src/pages/Profile.jsx` — 3 şifre alanının hepsi `<PasswordInput>` ile değiştirildi
  - Mevcut Şifre alanı (`autoComplete="current-password"`)
  - Yeni Şifre alanı (`autoComplete="new-password"`)
  - Yeni Şifre (Tekrar) alanı (`autoComplete="new-password"`)
- [x] **Frontend:** Koyu/açık mod uyumlu (göz ikonu renkleri dark: variantlı)
- [x] **Frontend:** TR/EN i18n etkilenmez — bileşen metinsiz, sadece ikon içerir

### 17. Platform / Yayın Servisi Bilgisi (Film Detay Sayfası)
> TMDB Watch Providers API ile filmin hangi platformda yayınlandığını çek.
> Film detay sayfasında "Fragmanı İzle" butonunun sağ tarafında platform ikonlarını göster.
> Ön koşul: yok — bağımsız bir TMDB API çağrısıdır.

- [x] **Backend:** `app/services/tmdb_service.py` — `get_watch_providers(tmdb_id, media_type)` fonksiyonu ekle
  - TMDB endpoint: `GET /movie/{id}/watch/providers` (veya `/tv/{id}/watch/providers`)
  - `params={"language": "tr-TR"}` — ülke önceliği: `TR`, yoksa `US`
  - Yanıt: `{flatrate: [{provider_name, logo_path}], rent: [...], buy: [...]}` — `flatrate` (abonelik) öncelikli
  - `logo_path` için tam URL: `https://image.tmdb.org/t/p/w45{logo_path}`
  - Sağlanamıyorsa boş liste dön, hata fırlatma
- [x] **Backend:** `app/routers/movies.py` — `GET /movies/{tmdb_id}/providers?media_type=movie` endpoint ekle
  - Response şeması: `{providers: [{name: str, logo_url: str, type: str}]}` — type: "flatrate" | "rent" | "buy"
  - Auth gerekmez (public endpoint)
- [x] **Frontend:** `src/api/movies.js` — `getWatchProviders(tmdb_id, media_type)` fonksiyonu ekle
- [x] **Frontend:** `src/components/WatchProviders.jsx` — platform ikonları bileşeni oluştur
  - Platform logolarını 32x32 yuvarlak ikonlar olarak göster (max 5 ikon yan yana)
  - Her ikonun üzerine gelinince tooltip: platform adı
  - Flatrate (Netflix, Disney+ vb.) ikonları önce; yoksa rent/buy ikonları
  - Provider yoksa bileşen hiçbir şey render etmez
- [x] **Frontend:** `src/pages/MovieDetail.jsx` — "Fragmanı İzle" buton satırının sağına `<WatchProviders>` ekle
  - Layout: `flex items-center justify-between` — sol: fragman butonu, sağ: platform ikonları
  - Platform çekimi MovieDetail'in mount'unda paralel çalışır (`Promise.all` ile `getMovieDetail` + `getWatchProviders` + `getSimilar`)
- [x] **Frontend:** Koyu/açık mod uyumlu (ikon çevresi `bg-gray-100 dark:bg-gray-800`)
- [x] **Frontend:** TR/EN i18n — `providers_watch_on: "İzle:"` / `"Watch on:"` anahtarı ekle

---

### 18. Davranış Tabanlı AI Kişiselleştirme (Arama + Tıklama Geçmişi)
> Kullanıcının watchlist'ine eklediği filmlerin yanı sıra; aradığı kelimeler, tıkladığı filmler ve
> ziyaret ettiği detay sayfaları da AI öneri profiline dahil edilsin.
> Bu veriler `user_behavior` tablosunda tutulur; `GET /auth/taste-profile` bunu hesaba katar.

- [x] **DB:** Yeni tablo `user_behavior` oluştur
- [x] **DB:** Alembic migration `624cce1fa1af_add_user_behavior_table.py` oluşturuldu ve uygulandı
- [x] **Backend:** `app/models/user_behavior.py` — SQLAlchemy ORM modeli oluşturuldu
- [x] **Backend:** `app/schemas/behavior.py` — `BehaviorEvent` Pydantic şeması oluşturuldu
- [x] **Backend:** `app/routers/behavior.py` — `POST /behavior/event` endpoint eklendi (fire-and-forget, hata sessizce yutulur)
- [x] **Backend:** `app/main.py`'e behavior router'ı eklendi
- [x] **Backend:** `app/services/gemini_service.py` — `analyze_mood` ve `generate_recommendations` fonksiyonlarına `behavior_summary` parametresi eklendi
- [x] **Backend:** `app/routers/recommendations.py` — `build_behavior_summary()` fonksiyonu eklendi; son 7 gün / 30 event okunarak özet üretiliyor ve servis çağrılarına iletiliyor
- [x] **Frontend:** `src/api/behavior.js` — `trackEvent(event_type, data)` oluşturuldu (token yoksa veya hata olursa sessizce atlar)
- [x] **Frontend:** `src/pages/MovieDetail.jsx` — mount'ta `trackEvent('view', ...)` çağrısı eklendi
- [x] **Frontend:** `src/pages/SearchResults.jsx` — arama sorgusunda `trackEvent('search', ...)` çağrısı eklendi
- [x] **Frontend:** `src/components/MovieCard.jsx` — kart tıklamasında `trackEvent('click', ...)` çağrısı eklendi
- [x] **Frontend:** `src/pages/Recommend.jsx` — submit anında `trackEvent('recommend_request', ...)` çağrısı eklendi
- [x] **Frontend:** Arka planda çalışır, kullanıcıya görünür UI değişikliği yok

---

### 19. Vizyondaki Filmler Filtresi (Anasayfa)
> Anasayfada "Trend" içeriklerin yanına "Vizyonda" sekmesi eklenecek.
> TMDB'nin `now_playing` endpoint'i kullanılacak (sadece `movie` için geçerlidir, dizilerin vizyonu olmaz).
> "Vizyonda" sekmesi seçiliyken tür sidebar'ı devre dışı bırakılır (vizyondaki filmler zaten filtrelenmiştir).

- [x] **Backend:** `app/services/tmdb_service.py` — `get_now_playing(page: int = 1)` fonksiyonu eklendi
- [x] **Backend:** `app/routers/movies.py` — `GET /movies/now-playing?page=1` endpoint eklendi
- [x] **Frontend:** `src/api/movies.js` — `getNowPlaying(page)` fonksiyonu eklendi
- [x] **Frontend:** `src/pages/Home.jsx` — `viewMode` state eklendi; `[Trend] [Vizyonda]` chip toggle, Vizyonda'da film/dizi toggle gizlenir
- [x] **Frontend:** `src/pages/Home.jsx` — Vizyonda aktifken `GenreSidebar` ve mobile drawer gizleniyor
- [x] **Frontend:** `src/components/MovieCard.jsx` — opsiyonel `badge` prop eklendi (sol üst köşe rozeti)
- [x] **Frontend:** `src/components/MovieGrid.jsx` — `badge` prop'u MovieCard'a iletiliyor
- [x] **Frontend:** Koyu/açık mod uyumlu
- [x] **Frontend:** TR/EN i18n — `home_now_playing`, `home_now_playing_badge`, `home_trending_chip` anahtarları eklendi

---

### 20. AI Kişisel Konuşma Tonu (Sen Dili + Kullanıcı Adı)
> Yapay zeka öneri ve analiz metinlerinde resmi/soğuk değil; samimi, "sen" diline dayalı,
> kullanıcının adını kullanan bir ton benimsesin.
> "Kullanıcı yorgun görünüyor" yerine "Nurnehir, bugün biraz yorgun hissediyorsun anlaşılan 😊"
> Sadece prompt değişikliği — DB ve API şeması değişmez.

- [x] **Backend:** `MOOD_PROMPT` güncellendi — `username` parametresi, `mood_summary` talimatı "sen" kipi + isimle hitap
- [x] **Backend:** `RECOMMENDATION_PROMPT` güncellendi — hem `analysis` hem `reason` alanları "sen" kipi, isimle hitap, arkadaşça ton
- [x] **Backend:** `analyze_mood(prompt, behavior_summary, username)` imzası güncellendi
- [x] **Backend:** `generate_recommendations(prompt, movies, behavior_summary, username)` imzası güncellendi
- [x] **Backend:** `generate_taste_profile(rated_movies, username)` imzası güncellendi, profil özeti de kişisel ton
- [x] **Backend:** `recommendations.py` — tüm servis çağrılarına `username=current_user.username` iletiliyor
- [x] **Frontend:** Değişiklik gerekmez

---

### 21. AI Platform Farkındalığı (Önerilerde Yayın Platformu Bilgisi)
> Yapay zeka film önerisi yaparken, filmin Türkiye'deki yayın platformunu da söylesin.
> Önce TMDB Watch Providers API'den platform verisi çekilir (17. madde altyapısını kullanır),
> sonra bu veri AI prompt'una eklenerek öneri gerekçesiyle birleştirilir.
> Ön koşul: 17. madde tamamlanmış olmalı (get_watch_providers servisi hazır).

- [x] **Backend:** `recommendations.py` — `asyncio.gather` ile 5 film için paralel `get_watch_providers` çağrısı; `{name, logo_url}` dict listesi olarak `platforms` alanına ekleniyor
- [x] **Backend:** `schemas/recommendation.py` — `MovieRecommendation`'a `platforms: List[Any] = []` eklendi
- [x] **Frontend:** `MovieCard.jsx` — `platforms` prop, `WatchProviders` bileşenini `rec_available_on` etiketiyle gösteriyor
- [x] **Frontend:** `WatchProviders.jsx` — `labelOverride` prop desteği eklendi
- [x] **Frontend:** `Recommend.jsx` — `MovieCard`'a `platforms={movie.platforms}` iletiliyor
- [x] **Frontend:** TR/EN i18n — `rec_available_on` anahtarı eklendi
- [x] **Frontend:** Koyu/açık mod uyumlu (WatchProviders zaten uyumlu)

---

### 22. Çoklu İsimlendirilmiş Watchlist ✅
> Kullanıcı tek bir varsayılan "İzleme Listesi" yerine birden fazla, isimlendirilmiş liste oluşturabilsin.
> Örnek: "Haftasonu Listesi", "Ailecek İzleyeceklerimiz", "Favorilerim"

- [x] **DB:** `watchlist_collections` tablosu oluşturuldu (id, user_id FK CASCADE, name, created_at)
- [x] **DB:** `watchlist` tablosuna `collection_id FK → watchlist_collections ON DELETE SET NULL` eklendi
- [x] **DB:** Alembic migration `e5f6a7b8c9d0_add_watchlist_collections.py` oluşturuldu ve uygulandı
  - Her mevcut kullanıcı için "İzleme Listem" adlı koleksiyon otomatik oluşturuldu
  - Mevcut watchlist öğeleri bu koleksiyona bağlandı (`UPDATE watchlist SET collection_id = ...`)
- [x] **Backend:** `app/models/watchlist_collection.py` — SQLAlchemy ORM modeli oluşturuldu
- [x] **Backend:** `app/schemas/watchlist.py` — `CollectionCreate`, `CollectionUpdate`, `CollectionOut` (item_count dahil), `MoveItem` şemaları eklendi; `WatchlistItem` ve `WatchlistOut`'a `collection_id` eklendi
- [x] **Backend:** `app/routers/watchlist.py` — koleksiyon CRUD endpointleri eklendi
  - `GET /watchlist/collections` — item_count ile birlikte listeler
  - `POST /watchlist/collections` → 201
  - `PUT /watchlist/collections/{col_id}` — yeniden adlandır
  - `DELETE /watchlist/collections/{col_id}` — sil (öğeler NULL kalır)
  - `POST /watchlist` — `collection_id` artık kabul ediliyor
  - `PATCH /watchlist/{id}/move` — filmi başka listeye taşı
- [x] **Frontend:** `src/api/watchlist.js` — `getCollections`, `createCollection`, `updateCollection`, `deleteCollection`, `moveToCollection` eklendi
- [x] **Frontend:** `src/context/WatchlistContext.jsx` — `collections` state ve `add(movie, collectionId)` güncellendi
- [x] **Frontend:** `src/pages/Watchlist.jsx` — sol sidebar + sağ içerik düzeni
  - Sol sidebar: "Tümü" + koleksiyonlar (item_count rozeti), kalem (mavi) ve çöp (kırmızı) ikonları
  - Yeni liste: "+" butonuyla modal açılır, isim yazılıp kaydedilir
  - Düzenleme: kalem ikonuyla modal açılır, mevcut ad dolu gelir
  - Silme: çöp ikonuyla onay modalı açılır ("emin misiniz?" + açıklama)
  - Sağ alanda film kartlarında çoklu liste varsa koleksiyon taşıma select'i gösterilir
  - Boş liste/filtre için uygun empty state mesajları
  - Mobilde hamburger → overlay sidebar
- [x] **Frontend:** `src/components/WatchlistButton.jsx` — liste seçim modalı; her zaman modal açılır, kullanıcı hangi listeye ekleyeceğini seçer (listesiz ekleme yok)
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu (wl_my_lists, wl_new_list, wl_rename, wl_delete_list, wl_select_list, wl_delete_confirm vb. anahtarlar eklendi)

---

### 23. Topluluk Yorumları ve Puanlama Sistemi ✅
> Kullanıcılar film detay sayfasında herkese açık yorum yazabilsin ve 1-5 yıldız verebilsin.
> Yorumda spoiler uyarısı ve anonim/isimli görünme seçeneği olsun.
> Yorumlar herkes tarafından görülebilir (giriş yapmadan da okunabilir, yazmak için giriş gerekli).

- [x] **DB:** Yeni tablo `reviews` oluştur
  ```sql
  CREATE TABLE reviews (
      id            SERIAL PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      tmdb_id       INTEGER NOT NULL,
      media_type    VARCHAR(10) NOT NULL DEFAULT 'movie',
      rating        SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      body          TEXT NOT NULL CHECK (char_length(body) >= 10 AND char_length(body) <= 2000),
      has_spoiler   BOOLEAN NOT NULL DEFAULT FALSE,
      is_anonymous  BOOLEAN NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT unique_user_review UNIQUE (user_id, tmdb_id, media_type)
  );
  CREATE INDEX idx_reviews_tmdb ON reviews(tmdb_id, media_type);
  CREATE INDEX idx_reviews_user ON reviews(user_id);
  CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
  ```
  - `UNIQUE(user_id, tmdb_id, media_type)` — bir kullanıcı aynı film için tek yorum yazabilir (düzenleyebilir)
- [x] **DB:** Alembic migration `a7b8c9d0e1f2_add_reviews_table.py` oluşturuldu ve uygulandı
- [x] **Backend:** `app/models/review.py` — SQLAlchemy ORM modeli oluşturuldu
- [x] **Backend:** `app/schemas/review.py` — ReviewCreate, ReviewUpdate, ReviewOut (display_name, is_own), ReviewListResponse
- [x] **Backend:** `app/routers/reviews.py` — GET (opsiyonel auth), POST (auth), PUT (auth, 403 if not own), DELETE (auth, 403 if not own)
- [x] **Backend:** `app/main.py`'e `reviews.router` eklendi (`prefix="/movies"`)
- [x] **Frontend:** `src/api/reviews.js` — getReviews, createReview, updateReview, deleteReview
- [x] **Frontend:** `src/components/ReviewCard.jsx` — avatar harf, yıldız görüntüsü, spoiler blur/reveal, devamını oku, düzenle/sil ikonları
- [x] **Frontend:** `src/components/ReviewForm.jsx` — StarRating, textarea + karakter sayacı, spoiler checkbox, anonim checkbox, gönder/iptal
- [x] **Frontend:** `src/pages/MovieDetail.jsx` — reviews bölümü benzer filmlerden önce; ortalama puan + sayaç, "Yorum Yaz" butonu, silme onay modalı, "daha fazla yükle" butonu
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu (review_* anahtarları eklendi)

---

## AKTIF OTURUM NOTU

> Claude Code bu bolumu oku: Simdi hangi fazdasin?
> Yukaridaki listede en son tamamlanmis `[x]` gorevden sonra gelen ilk `[ ]` gorevi yap.
> Bir gorevi bitirince `[x]` isle, sonrakine gec.
> Faz kontrolunu gecmeden bir sonraki faza gecme.

**Son guncelleme:** 22-23-25 tamamlandı. Sıradaki: 15 (Uygulama Adı Değişikliği) veya yeni görev.

---

### 24. İzleme Listesi — Arama, Tür Filtresi ve Sayfalama ✅
> Watchlist sayfasında kartlar sayfalanır (10'arlı), başlığa göre arama kutusu ve türe göre filtre çipleri eklenir.
> Tür verisi DB'de tutulur; film eklenirken `genre_ids` da kaydedilir.

- [x] **DB:** `watchlist` tablosuna `genre_ids INTEGER[] DEFAULT '{}'` kolonu eklendi
- [x] **DB:** Alembic migration `f6a7b8c9d0e1_add_genre_ids_to_watchlist.py` oluşturuldu ve uygulandı
- [x] **Backend:** `app/models/watchlist.py` — `genre_ids` kolonu eklendi
- [x] **Backend:** `app/schemas/watchlist.py` — `WatchlistItem`'a `genre_ids: Optional[List[int]] = None`, `WatchlistOut`'a `genre_ids: List[int] = []` eklendi
- [x] **Backend:** `POST /watchlist` — `genre_ids` artık kaydediliyor
- [x] **Frontend:** `src/context/WatchlistContext.jsx` — `add()` fonksiyonu `genre_ids: movie.genre_ids || []` geçiyor
- [x] **Frontend:** `src/pages/Watchlist.jsx` — sayfalama eklendi
  - `ITEMS_PER_PAGE = 10`, `page` state
  - Tab / koleksiyon / filtre değişince sayfa 1'e döner
  - "Önceki / Sonraki" + "Sayfa X / Y" göstergesi
- [x] **Frontend:** `src/pages/Watchlist.jsx` — başlık arama kutusu eklendi (anlık, debounce yok)
- [x] **Frontend:** `src/pages/Watchlist.jsx` — tür filtresi çipleri eklendi
  - Aktif koleksiyondaki öğelerden benzersiz türler çıkarılır
  - "Tümü" çipi + her tür için bir çip (yatay kaydırmalı satır)
  - Birden fazla tür seçilebilir (çoklu filtre)
  - Tür adları sabit map üzerinden TR / EN gösterilir
- [x] **Frontend:** Koyu/açık mod + TR/EN uyumlu
  - i18n: `wl_search_placeholder`, `wl_filter_genre`, `wl_filter_all`, `wl_page_of`, `wl_prev`, `wl_next`, `wl_no_results`

---

## AI MODEL MİGRASYONU (Gemini → Groq)

- [x] Gemini API kota sorunu tespit edildi (ücretsiz tier Türkiye'de limit:0)
- [x] `requirements.txt` — `google-genai` kaldırıldı, `groq==0.13.0` eklendi
- [x] `app/services/gemini_service.py` — Groq client + Llama 3.3-70b-versatile modeline geçildi
- [x] `app/config.py` — `GEMINI_API_KEY` → `GROQ_API_KEY` olarak yeniden adlandırıldı
- [x] `docker-compose.yml` — `GROQ_API_KEY` ile güncellendi
- [x] `backend/.env` — `GROQ_API_KEY` ile güncellendi
- [x] Backend rebuild edildi, yeni anahtar container'a yüklendi

---

### 25. Misafir Modu (Login Olmadan Gezinti + Sign In Modal)
> Kullanıcı giriş yapmadan da uygulamayı gezebilsin.
> Giriş gerektiren aksiyonlarda (öneri isteme, watchlist'e ekleme) redirect yerine bir **Login Modal** açılsın.
> Misafir navbar'ında "Giriş Yap" ve "Kayıt Ol" butonları çıksın, profil simgesi olmasın.
> Profil sayfası misafirler için erişilemez (PrivateRoute kalır).
> Ayarlar (TR/EN, koyu/açık mod) misafirler için de erişilebilir.
>
> **Backend/DB değişikliği yok** — tamamen frontend değişikliği.

#### A. LoginModal Bileşeni (YENİ)
- [x] `src/components/LoginModal.jsx` — tam ekranlı overlay üzerinde açılan login formu

#### B. AuthContext Güncellemesi
- [x] `src/context/AuthContext.jsx` — `loginModalOpen`, `openLoginModal`, `closeLoginModal`, `loginSilent` eklendi
- [x] `src/App.jsx` — AppShell pattern + `<LoginModal open={loginModalOpen} onClose={closeLoginModal} />`

#### C. App.jsx Route Değişiklikleri
- [x] `/`, `/recommend`, `/watchlist`, `/settings` → PrivateRoute kaldırıldı; `/profile` → PrivateRoute korundu

#### D. Login Sayfası — "Misafir Olarak Devam Et" Butonu
- [x] `src/pages/Login.jsx` — "Giriş yapmadan devam et →" butonu eklendi

#### E. Navbar — Misafir Durumu
- [x] `src/components/Navbar.jsx` — misafir için "Giriş Yap" + "Kayıt Ol" butonları, nav linkleri herkese görünür

#### F. WatchlistButton — Misafir Durumu
- [x] `src/components/WatchlistButton.jsx` — misafir için buton → `openLoginModal()`

#### G. Recommend Sayfası — Misafir Kısıtlaması
- [x] `src/pages/Recommend.jsx` — sidebar + mobil top bar misafirde gizlendi; handleSubmit'te `openLoginModal()` guard

#### H. Watchlist Sayfası — Misafir Durumu
- [x] `src/pages/Watchlist.jsx` — misafir için kilit ekranı + giriş butonu (hooks sonrası early return)

#### I. i18n Anahtarları
- [x] `src/i18n/tr.js` ve `src/i18n/en.js` — guest_skip, guest_modal_title, guest_nav_signin, guest_nav_signup, guest_rec_hint, guest_wl_empty, guest_wl_signin_btn eklendi

#### J. Kontrol Listesi (Uygulama Sonrası)
- [x] Misafir olarak ana sayfaya gidince trend filmler görünüyor ✓
- [x] Misafir olarak film detay sayfası açılıyor ✓
- [x] Misafir olarak arama çalışıyor ✓
- [x] Misafir olarak tema/dil değişiyor ✓
- [x] Misafir olarak `/profile` → `/login`'e yönlendiriyor ✓
- [x] "İzleme Listesine Ekle" butonuna basınca Login Modal açılıyor ✓
- [x] Recommend sayfasında sidebar yok, öneri butonuna basınca Login Modal açılıyor ✓
- [x] Watchlist sayfasında boş state + giriş yap butonu görünüyor ✓
- [x] Navbar'da "Giriş Yap" + "Kayıt Ol" butonları görünüyor ✓
- [x] Login Modal'da başarılı giriş sonrası sayfa aynı kalıyor ✓
- [x] Login Modal dışına tıklayınca kapanıyor ✓
- [x] Koyu/açık mod + TR/EN uyumlu ✓

---

### 26. Yerli / Yabancı İçerik Filtresi (Anasayfa)
> Anasayfada kullanıcı içeriği menşeine göre filtreleyebilsin: **Tümü / Yerli (TR) / Yabancı**.
> TMDB API'nin `with_original_language` ve `without_original_language` parametreleri kullanılır.
> Filtre aktifken trending yerine discover endpoint'i çağrılır. DB değişikliği yoktur.
>
> **Konum:** Trend/Vizyonda chip toggle'ının hemen yanına "Tümü / Yerli / Yabancı" chip grubu eklenir.
> Vizyonda modunda filtre gizlenir (vizyondaki filtreler TMDB tarafından zaten uygulanmış olur).

#### Veritabanı
- [x] Değişiklik yok — TMDB API `with_original_language=tr` parametresi yeterli.

#### Backend
- [x] `app/services/tmdb_service.py` — `discover_movies`'e `original_language: str = None` parametresi eklendi
  - `original_language` varsa: `params["with_original_language"] = original_language` (yerli için `"tr"`)
  - `original_language` değeri `"!tr"` ise: `params["without_original_language"] = "tr"` (yabancı filtresi)
- [x] `app/routers/movies.py` — `/movies/discover` endpoint'ine `original_language: str = Query("")` query param eklendi; tmdb_service'e iletiliyor

#### Frontend
- [x] `src/api/movies.js` — `discoverMovies(genreIds, sortBy, mediaType, originalLanguage)` imzası genişletildi
- [x] `src/pages/Home.jsx` — `originFilter` state eklendi (`'all' | 'domestic' | 'foreign'`); fetch logic güncellendi:
  - `originFilter = 'all'` + tür yok: `getTrending` (mevcut davranış)
  - `originFilter = 'all'` + tür var: `discoverMovies(genres)` (mevcut davranış)
  - `originFilter = 'domestic'`: `discoverMovies(genres, 'popularity.desc', mediaType, 'tr')`
  - `originFilter = 'foreign'`: `discoverMovies(genres, 'popularity.desc', mediaType, '!tr')`
  - `viewMode = 'now_playing'`: filtre gösterilmez, getNowPlaying çağrısı değişmez
  - `mediaType` veya `originFilter` değişince `selectedGenres` sıfırlanır
- [x] `src/pages/Home.jsx` — "Tümü / Yerli / Yabancı" chip toggle: Film/Dizi toggle'ının sağına eklendi; sadece Trend modunda görünür
- [x] `src/i18n/tr.js` ve `src/i18n/en.js` — `home_origin_all`, `home_origin_domestic`, `home_origin_foreign` anahtarları eklendi

#### Kontrol Listesi
- [x] "Yerli" seçince Türkçe yapım filmler geliyor (original_language=tr) — test: Koğuştaki Mucize, Ayla, Recep İvedik ✓
- [x] "Yabancı" seçince Türk yapımı filmler gelmiyor — test: 20 sonuçta TR dil sayısı: 0 ✓
- [x] "Tümü" seçince eski trending davranışı geri dönüyor — getTrending çağrısına düşüyor ✓
- [x] Tür filtresi + yerli/yabancı filtresi birlikte çalışıyor — test: genres=35 + tr → Recep İvedik, Mucize ✓
- [x] Vizyonda modunda yerli/yabancı toggle gizleniyor — `{!isNowPlaying && (...)}` ile sarılı ✓
- [x] Film/Dizi toggle ile birlikte çalışıyor — test: media_type=tv + tr → Yalı Çapkını, Kuruluş: Osman ✓
- [x] Koyu/açık mod + TR/EN uyumlu — mevcut chip stili (bg-gray-100/dark:bg-gray-800) kullanıldı, i18n anahtarları tr.js ve en.js'e eklendi ✓
