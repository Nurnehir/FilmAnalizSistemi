# MARS — Movie Analysis & Recommendation System

Yapay zeka destekli kişiselleştirilmiş film/dizi öneri uygulaması.

Kullanıcı ruh halini doğal dilde yazar → Yapay zeka analiz eder → TMDB'den uygun filmler çeker → her biri için Türkçe gerekçe üretir.

---

## Özellikler

### Yapay Zeka
- Doğal dil ile film/dizi öneri alma (Groq — Llama 3.3 70B) — 2 aşamalı: ruh hali analizi → kişisel gerekçe
- AI zevk profili — puanlanan filmlerden kişilik özeti çıkarır, önerilere dahil eder
- AI film özeti — watchlist'teki her film için spoilersız atmosfer özeti üretir
- Davranış tabanlı kişiselleştirme — arama, tıklama ve görüntüleme geçmişi önerileri şekillendirir
- Film karşılaştırma — iki film seç, AI hangisinin sana uygun olduğunu söyler

### İçerik Keşfi
- Trend filmler/diziler dashboard'u (TMDB canlı veri) — film/dizi toggle
- Vizyondaki filmler (TMDB now_playing)
- Film detay sayfası — oyuncu kadrosu, benzer filmler, fragman izleme (YouTube), yayın platformu ikonları (Netflix, Disney+ vb.)
- Tür filtresi sidebar, yerli/yabancı filtresi
- Navbar arama çubuğu — debounce ile anlık sonuçlar
- Sonsuz kaydırma (IntersectionObserver)

### Kişisel Yönetim
- Çoklu isimlendirilmiş watchlist koleksiyonları (oluştur, yeniden adlandır, sil)
- İzlenecek / İzlendi sekmeleri + 1–5 yıldız puanlama
- Kişisel not alma — her watchlist filmine özel not, otomatik kayıt
- İzleme istatistikleri — tür dağılımı donut, aylık aktivite, puan grafiği (Chart.js)
- Watchlist'te başlık arama ve tür filtresi

### Sosyal
- Kullanıcı takip sistemi + herkese açık profil sayfası (`/user/:username`)
- Ortak izleme listesi — iki kullanıcı aynı listeye birlikte film ekler
- Topluluk yorumları ve puanlama — spoiler uyarısı, anonim seçeneği
- Navbar'da yeni takipçi bildirim rozeti

### Hesap & Arayüz
- Kullanıcı kaydı, girişi, JWT auth — şifremi unuttum (Resend e-posta)
- Profil sayfası — kullanıcı adı, şifre, avatar güncelleme + istatistik kartları
- Misafir modu — girişsiz gezinti, aksiyon noktalarında Login Modal
- Öneri geçmişi — ChatGPT tarzı sol sidebar görünümü
- Koyu / Açık mod toggle
- Türkçe / İngilizce dil desteği

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
| E-posta | Resend API |
| Grafik | Chart.js + react-chartjs-2 |
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
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
TMDB_API_KEY=<TMDB Read Access Token — themoviedb.org/settings/api>
GROQ_API_KEY=<Groq API Key — console.groq.com/keys>
RESEND_API_KEY=<Resend API Key — resend.com (şifremi unuttum için)>
FRONTEND_URL=http://localhost:5174
```

> **Not:** Groq API anahtarı ücretsizdir. [console.groq.com](https://console.groq.com) adresinden kayıt olup alabilirsiniz.  
> **Not:** Resend API anahtarı opsiyoneldir — sadece şifremi unuttum özelliği için gereklidir.

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
| GET | /auth/stats | ✓ | Profil istatistikleri |
| GET | /auth/taste-profile | ✓ | AI zevk profili |
| POST | /auth/forgot-password | — | Şifremi unuttum |
| POST | /auth/reset-password | — | Şifre sıfırla |
| GET | /movies/trending | — | Trend filmler |
| GET | /movies/now-playing | — | Vizyondaki filmler |
| GET | /movies/discover | — | Tür/dil filtreyle film bul |
| GET | /movies/search?q= | — | Film/dizi ara |
| GET | /movies/{id} | — | Film detayı |
| GET | /movies/{id}/similar | — | Benzer filmler |
| GET | /movies/{id}/videos | — | Fragmanlar |
| GET | /movies/{id}/providers | — | Yayın platformları |
| GET | /movies/{id}/reviews | — | Topluluk yorumları |
| POST | /movies/{id}/reviews | ✓ | Yorum yaz |
| PUT | /movies/{id}/reviews/{rid} | ✓ | Yorumu düzenle |
| DELETE | /movies/{id}/reviews/{rid} | ✓ | Yorumu sil |
| POST | /recommendations | ✓ | Yapay zeka önerisi al |
| GET | /recommendations/history | ✓ | Öneri geçmişi |
| GET | /recommendations/{id} | ✓ | Öneri detayı |
| GET | /watchlist | ✓ | İzleme listesi |
| POST | /watchlist | ✓ | Listeye ekle |
| DELETE | /watchlist/{id} | ✓ | Listeden çıkar |
| PATCH | /watchlist/{id}/watched | ✓ | İzlendi işaretle |
| PATCH | /watchlist/{id}/rating | ✓ | Puan ver (1-5) |
| POST | /watchlist/{id}/summarize | ✓ | AI özeti oluştur |
| PATCH | /watchlist/{id}/note | ✓ | Kişisel not kaydet |
| PATCH | /watchlist/{id}/move | ✓ | Koleksiyona taşı |
| GET | /watchlist/collections | ✓ | Koleksiyonları listele |
| POST | /watchlist/collections | ✓ | Koleksiyon oluştur |
| PUT | /watchlist/collections/{id} | ✓ | Koleksiyonu yeniden adlandır |
| DELETE | /watchlist/collections/{id} | ✓ | Koleksiyonu sil |
| POST | /compare | ✓ | İki filmi AI ile karşılaştır |
| GET | /compare/history | ✓ | Karşılaştırma geçmişi |
| GET | /stats/genres | ✓ | Tür dağılımı |
| GET | /stats/activity | ✓ | Aylık aktivite |
| GET | /stats/ratings | ✓ | Puan dağılımı |
| GET | /stats/summary | ✓ | Özet istatistikler |
| POST | /social/follow/{user_id} | ✓ | Kullanıcıyı takip et |
| DELETE | /social/follow/{user_id} | ✓ | Takibi bırak |
| GET | /social/following | ✓ | Takip ettiklerim |
| GET | /social/followers | ✓ | Takipçilerim |
| GET | /social/search?q= | — | Kullanıcı ara |
| GET | /social/users/{username} | — | Kullanıcı profili |
| GET | /social/users/{username}/watchlist | — | Herkese açık listeler |
| POST | /shared | ✓ | Ortak liste oluştur |
| GET | /shared | ✓ | Katıldığım ortak listeler |
| GET | /shared/{id} | ✓ | Ortak liste detayı |
| POST | /shared/{id}/invite/{user_id} | ✓ | Üye davet et |
| DELETE | /shared/{id}/leave | ✓ | Listeden ayrıl |
| POST | /shared/{id}/items | ✓ | Ortak listeye film ekle |
| DELETE | /shared/{id}/items/{item_id} | ✓ | Filmi listeden çıkar |
| POST | /behavior/event | ✓ | Kullanıcı davranışı kaydet |

---

## Demo Akışı

1. Kayıt ol → giriş yap
2. Dashboard'da trend filmler görüntüle (film/dizi toggle, tür filtresi, yerli/yabancı)
3. **Öneri** sayfasına git → ruh halini yaz (örn: *"Bugün yorgunum, hafif komedi istiyorum"*)
4. Yapay zeka analiz eder → 5 kişisel öneri + her biri için gerekçe + yayın platformu
5. Film detay sayfasında fragmanı izle, topluluk yorumlarını oku, yorum yaz
6. Beğendiğin filmi izleme listesine ekle → AI özeti oluştur → kişisel not ekle
7. Birkaç filme yıldız ver → Öneri sayfasında "Zevk Profilimi Kullan" toggle'ını aç
8. İki filmi **Karşılaştır** sayfasında kıyasla
9. **İstatistikler** sayfasında izleme alışkanlıklarını grafik olarak gör
10. **Sosyal** sayfasında kullanıcı ara → takip et → ortak izleme listesi oluştur

---

## Mimari

Detaylı mimari dokümantasyon: [docs/architecture.md](docs/architecture.md)

---

## Proje Yapısı

```
├── frontend/                  # React + Vite + TailwindCSS
│   └── src/
│       ├── pages/             # 14 sayfa (Home, Recommend, Compare, Stats, Social...)
│       ├── components/        # 17 bileşen (MovieCard, StarRating, TrailerModal...)
│       ├── context/           # AuthContext, ThemeContext, LangContext, WatchlistContext...
│       ├── api/               # 11 API modülü (movies, recommendations, watchlist...)
│       └── i18n/              # tr.js + en.js (TR/EN dil desteği)
├── backend/                   # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── routers/           # 10 router (auth, movies, recommendations, watchlist, social...)
│   │   ├── services/          # gemini_service (Groq/AI), tmdb_service, auth_service
│   │   ├── models/            # 11 SQLAlchemy ORM modeli
│   │   └── schemas/           # 10 Pydantic şeması
│   └── alembic/               # 13 DB migration dosyası
├── docs/                      # Mimari dokümantasyon
├── .env.example               # Ortam değişkenleri şablonu
└── docker-compose.yml
```

### Veritabanı Tabloları (11 tablo)

| Tablo | İçerik |
|---|---|
| `users` | Kullanıcı hesapları |
| `watchlist` | İzleme listesi öğeleri (puan, not, AI özeti) |
| `watchlist_collections` | İsimlendirilmiş watchlist koleksiyonları |
| `recommendation_history` | AI öneri geçmişi |
| `reviews` | Topluluk yorumları ve puanları |
| `comparisons` | Film karşılaştırma geçmişi |
| `user_behavior` | Arama/tıklama/görüntüleme davranışları |
| `friendships` | Takip ilişkileri |
| `shared_lists` | Ortak izleme listeleri |
| `shared_list_members` | Ortak liste üyelikleri |
| `shared_list_items` | Ortak liste film öğeleri |

---

*Danışman: Doç. Dr. Ferhat UÇAR — Fırat Üniversitesi Yazılım Mühendisliği*
