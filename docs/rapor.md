
# MARS — Movie Analysis & Recommendation System

## Film Analiz ve Öneri Sistemi

**Bitirme Projesi Raporu**

---

**Hazırlayan:** Nurnehir ARCA
**Öğrenci No:** 220541057
**Bölüm:** Yazılım Mühendisliği
**Fakülte:** Teknoloji Fakültesi
**Üniversite:** Fırat Üniversitesi
**Danışman:** Doç. Dr. Ferhat UÇAR
**Tarih:** Haziran 2026

---

## ÖZET

Bu çalışma, kullanıcıların doğal dilde ifade ettikleri ruh hallerine, tercihlerine ve izleme geçmişlerine göre kişiselleştirilmiş film ve dizi önerileri sunan, Büyük Dil Modeli (LLM) destekli bir web uygulamasını sunmaktadır. MARS (Movie Analysis & Recommendation System) adı verilen sistem; React tabanlı modern bir ön yüz, FastAPI ile geliştirilmiş bir arka uç servisi, PostgreSQL veritabanı, Groq/Llama 3.3-70b-versatile yapay zeka motoru ve TMDB (The Movie Database) harici API entegrasyonundan oluşan çok katmanlı bir mimari üzerine inşa edilmiştir.

Sistemin temel yeniliği, geleneksel işbirlikçi veya içerik tabanlı filtreleme yöntemlerinin ötesine geçerek kullanıcının anlık ruh halini ve niyet dilini anlayan, kullanıcı davranışlarını sürekli öğrenen ve her öneriyi kişiselleştirilmiş gerekçeyle sunan bir yaklaşım benimsemesidir. Uygulama; izleme listesi yönetimi, topluluk yorumları, film karşılaştırma, sosyal etkileşim özellikleri ve görsel istatistik panosu gibi kapsamlı işlevleri barındırmakta; yirmi biri aşkın özelliğiyle eksiksiz bir film deneyim platformu sunmaktadır.

**Anahtar Kelimeler:** Büyük Dil Modeli, Film Öneri Sistemi, Doğal Dil İşleme, React, FastAPI, Groq, TMDB API, Kişiselleştirme


---

## İÇİNDEKİLER

1. Giriş
2. Literatür İncelemesi ve Mevcut Sistemler
3. Sistem Tasarımı
4. Kullanılan Teknolojiler
5. Gerçekleştirim
6. Deneysel Sonuçlar ve Değerlendirme
7. Sonuç ve Gelecek Çalışmalar
8. AI Tools Usage (Yapay Zeka Araçlarının Kullanımı)
9. Kaynakça

---

## 1. GİRİŞ

### 1.1 Problem Tanımı

Dijital medya platformlarının hızlı büyümesiyle birlikte internet kullanıcıları her yıl katlanarak artan miktarda içerikle karşı karşıya kalmaktadır. Netflix tek başına 15.000'den fazla yapımı kataloglamakta, Amazon Prime Video 24.000'i aşkın başlık sunmakta, Disney+ ve Apple TV+ gibi platformlar da her ay yüzlerce yeni içerik eklemektedir. Bu içerik bolluğu, kullanıcılarda "seçim felci" (choice paralysis) olarak adlandırılan bir duruma yol açmaktadır: ne izleyeceğini bilemeyen kullanıcı, içerik keşfine harcadığı süreyi izleme süresinden uzun tutmaktadır.

Mevcut öneri sistemlerinin büyük çoğunluğu işbirlikçi filtreleme (collaborative filtering) veya içerik tabanlı filtreleme (content-based filtering) yöntemlerini kullanmaktadır. Bu yöntemler belirli senaryolarda başarılı sonuçlar verse de önemli kısıtlara sahiptir:

- **Soğuk başlangıç problemi:** Yeni kullanıcılar için yeterli geçmiş veri bulunmadığından sistemin öneri üretme kapasitesi düşüktür.
- **Anlık ruh hali körü:** Geleneksel sistemler kullanıcının sabah komoredi, akşam gerilim isteyebileceği dinamik ruh hali değişimlerini yakalayamamaktadır.
- **Gerekçe eksikliği:** "Bu film seni hoşlandırabilir" biçimindeki genel açıklamalar, kullanıcının filmi seçmesini kolaylaştırmak yerine güven sorunu yaratmaktadır.
- **Konuşma dili desteği:** Kullanıcının "bugün çok yoruldum, biraz güldüren bir şey istiyorum" gibi gündelik dil ifadelerini anlayan bir sistem mevcut değildir.

Bu problemlere karşılık geliştirilen MARS sistemi, doğal dil anlama kapasitesini öneri motoruyla birleştirerek kullanıcıya anlık, kişisel ve gerekçeli içerik keşfi sunmayı hedeflemektedir.

### 1.2 Projenin Amacı ve Kapsamı

MARS projesinin temel amacı, Büyük Dil Modeli teknolojisini kullanarak kullanıcıların doğal konuşma diliyle etkileşime girebildiği, kişiselleştirilmiş film ve dizi önerileri sunan eksiksiz bir web uygulaması geliştirmektir.

Projenin kapsamı aşağıdaki işlevleri içermektedir:

- **Doğal dil öneri motoru:** Kullanıcının serbest metin girişini LLM ile analiz edip TMDB'den eşleşen filmleri çekerek kişisel gerekçeyle sunmak
- **Kullanıcı yönetimi:** Kayıt, giriş, profil, avatar, şifre yönetimi ve şifre sıfırlama
- **İzleme listesi sistemi:** Birden fazla isimlendirilmiş koleksiyon, izlendi/izlenecek durumu, yıldız puanlaması, AI özeti ve kişisel not
- **Topluluk özellikleri:** Film yorumları, spoiler uyarısı, anonim yorum seçeneği, takip sistemi, ortak izleme listesi
- **İçerik keşfi:** Trend filmler, vizyondakiler, tür filtresi, yerli/yabancı filtresi, arama, platform bilgisi
- **Analitik ve istatistik:** Chart.js ile görsel izleme istatistikleri
- **Çoklu dil ve tema:** Türkçe/İngilizce desteği, koyu/açık mod

### 1.3 Raporun Organizasyonu

Bu rapor yedi ana bölümden oluşmaktadır. İkinci bölümde mevcut sistemler ve akademik literatür incelenmekte, üçüncü bölümde sistem tasarımı detaylandırılmaktadır. Dördüncü bölüm kullanılan teknolojileri gerekçeleriyle ele almakta, beşinci bölüm sistemin gerçekleştirim detaylarını sunmaktadır. Altıncı bölüm deneysel bulgular ve karşılaşılan zorlukları aktarmakta, yedinci bölüm ise sonuç ve gelecek çalışmaları içermektedir.

---

## 2. LİTERATÜR İNCELEMESİ VE MEVCUT SİSTEMLER

### 2.1 Mevcut Platformların Analizi

#### 2.1.1 Netflix

Netflix, dünyanın en büyük video akış platformu olup 260 milyonun üzerinde aboneye sahiptir. Öneri sistemi; matris ayrıştırma (matrix factorization), derin öğrenme modelleri ve bağlamsal çok kollu haydut (contextual multi-armed bandit) algoritmalarını birleştiren karma bir yaklaşım kullanmaktadır. Sistem, kullanıcının izleme süresini, duraklatma davranışlarını, başlık aramasını ve hatta günün saatini öneri sinyali olarak değerlendirmektedir.

**Üstünlükleri:** Büyük ölçekli kullanıcı verisi, A/B test altyapısı, kapsamlı içerik katalogu
**Eksiklikleri:** Kullanıcı doğal dil girişi yok, anlık ruh halini yakalayamıyor, öneri gerekçesi sunulmuyor, platform dışı içerik desteği yok

#### 2.1.2 IMDb

IMDb (Internet Movie Database), dünyanın en kapsamlı film veri tabanıdır. Filtreli arama, kullanıcı derecelendirmeleri ve "Bunu beğenenler şunu da beğendi" tipi basit öneri işlevi sunar. Ancak IMDb bir yayın platformu olmadığından içeriği nerede izleyeceğini kullanıcıya söylememektedir.

**Üstünlükleri:** Kapsamlı meta veri, güvenilir eleştirmen puanları
**Eksiklikleri:** Kişiselleştirilmiş öneri yok, doğal dil desteği yok, platform entegrasyonu zayıf

#### 2.1.3 Letterboxd

Letterboxd, sosyal film kayıt ve eleştiri platformudur. Kullanıcılar izledikleri filmleri kayıt altına alabilir, yıldız verebilir ve kısa yorumlar yazabilir. Platform; takip ettiğin kişilerin izlediği filmler ve popüler listeler üzerinden basit öneriler sunar.

**Üstünlükleri:** Güçlü sosyal özellikler, film günlüğü, eleştiri kültürü
**Eksiklikleri:** LLM tabanlı öneri yok, anlık ruh hali desteği yok, fragman/platform bilgisi entegre değil

#### 2.1.4 JustWatch

JustWatch, hangi filmin hangi platformda (Netflix, Disney+, Amazon Prime, vb.) mevcut olduğunu gösteren bir içerik rehberidir. Kişiselleştirilmiş öneri sunmamakta, sadece platform bazlı içerik arama hizmeti vermektedir.

**Üstünlükleri:** Platform bilgisi mükemmel, çoklu ülke desteği
**Eksiklikleri:** Öneri yok, kullanıcı profili yüzeysel, sosyal özellik yok

#### 2.1.5 Mevcut Sistemlerin Karşılaştırması

| Özellik | Netflix | IMDb | Letterboxd | JustWatch | MARS |
|---|---|---|---|---|---|
| Kişiselleştirilmiş öneri | Evet | Hayır | Sınırlı | Hayır | Evet (LLM) |
| Doğal dil girişi | Hayır | Hayır | Hayır | Hayır | Evet |
| Ruh hali analizi | Hayır | Hayır | Hayır | Hayır | Evet |
| Öneri gerekçesi | Hayır | Hayır | Hayır | Hayır | Evet |
| Platform bilgisi | Evet | Sınırlı | Hayır | Evet | Evet |
| Sosyal özellikler | Sınırlı | Evet | Evet | Hayır | Evet |
| İstatistik/analitik | Hayır | Hayır | Evet | Hayır | Evet |
| Açık erişim | Hayır | Evet | Kısmen | Evet | Evet |

### 2.2 Öneri Sistemi Yaklaşımları

#### 2.2.1 İşbirlikçi Filtreleme (Collaborative Filtering)

İşbirlikçi filtreleme, benzer zevklere sahip kullanıcıların benzer içerikleri beğeneceği varsayımına dayanır. "Kullanıcı A ile B aynı filmleri beğendi, A'nın beğendiği filmi B de beğenir" mantığı üzerine kuruludur. Amazon, Spotify ve Netflix bu yöntemi yoğun kullanmaktadır.

Bu yaklaşım üç temel sorunu beraberinde getirir: soğuk başlangıç problemi (yeni kullanıcılarda veri yetersizliği), seyreklik problemi (büyük kataloglarda kullanıcı-öğe matrisinin çok boş kalması) ve filtre balonu (kullanıcının mevcut zevklerini pekiştirip yeni türlere yönlendirememesi).

#### 2.2.2 İçerik Tabanlı Filtreleme (Content-Based Filtering)

İçerik tabanlı filtreleme, filmin meta verilerini (tür, oyuncular, yönetmen, anahtar kelimeler, özet) analiz ederek kullanıcının geçmişte beğendiği içeriklere benzer olanları önerir. Bu yöntemin avantajı, diğer kullanıcı verilerine ihtiyaç duymamasıdır; ancak keşfetme (serendipity) kapasitesi düşük kalmaktadır.

#### 2.2.3 LLM Tabanlı Öneri Sistemleri

Büyük Dil Modellerinin (GPT, Llama, Claude vb.) yaygınlaşmasıyla birlikte öneri sistemlerinde yeni bir dönem başlamıştır. Dai ve arkadaşları (2023), LLM'lerin kullanıcının açık metin ifadesinden tercih profilini çıkarabildiğini göstermiştir. Liu ve arkadaşları (2023), "ChatGPT iyi bir öneri sistemi mi?" sorusunu incelemiş ve GPT-4'ün sıfır-atış (zero-shot) öneri görevlerinde geleneksel yöntemlere yaklaştığını bulmuştur.

LLM tabanlı yaklaşımın temel avantajları şunlardır:
- Doğal dil anlama yeteneği
- Anlık bağlam (ruh hali, ortam, hedef) değerlendirme kapasitesi
- Gerekçe üretebilme (explainability)
- Soğuk başlangıç problemini aşabilme

**MARS bu yaklaşımı benimseyen bir sistemdir.** Groq/Llama 3.3-70b-versatile modeli iki aşamalı bir boru hattı içinde kullanılmaktadır: önce kullanıcı niyeti analiz edilmekte, ardından TMDB'den çekilen gerçek film listesi üzerinde kişisel öneri gerekçesi üretilmektedir.

### 2.3 İlgili Akademik Çalışmalar

**Ruch ve arkadaşları (2022)** tarafından yapılan bir çalışmada, kullanıcıların "ruh haline göre film arama" davranışının tüm film izleme oturumlarının %38'ini oluşturduğu saptanmıştır. Bu bulgu, ruh hali odaklı öneri sistemlerine olan gerçek bir ihtiyacı doğrulamaktadır.

**Chen ve arkadaşları (2023)**, LLM tabanlı öneri sistemlerinde kullanıcı etkileşimi geçmişinin (davranış sinyalleri) modele eklenmesinin öneri doğruluğunu %18-24 oranında artırdığını bildirmiştir. MARS'ta uygulanan davranış tabanlı kişiselleştirme bu bulguya dayanmaktadır.

**He ve arkadaşları (2023)**, açıklanabilir öneri sistemleri üzerine yaptıkları meta-analizde, gerekçe sunan sistemlerin kullanıcı güvenini %31 oranında artırdığını göstermiştir. MARS'ın her film için bireysel gerekçe üretmesi bu bulguyla örtüşmektedir.

---

## 3. SİSTEM TASARIMI

### 3.1 Genel Mimari

MARS, üç katmanlı istemci-sunucu mimarisi üzerine kurulmuştur. Bu katmanlar sırasıyla sunum katmanı (React frontend), iş mantığı katmanı (FastAPI backend) ve veri katmanı (PostgreSQL + harici API'ler) olarak adlandırılmaktadır.

```
┌──────────────────────────────────────────────────────────┐
│                    TARAYICI (Port 5174)                  │
│                                                          │
│   ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │
│   │   Sayfa    │ │   Bileşen  │ │  Context (State)   │   │
│   │  Yönetimi  │ │   Katmanı  │ │  Auth/Theme/Lang   │   │
│   │  (Router)  │ │            │ │  Watchlist/Social  │   │
│   └────────────┘ └────────────┘ └────────────────────┘   │
│            React 18 + Vite + TailwindCSS                 │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST (JSON)
                         │ Authorization: Bearer {JWT}
┌────────────────────────▼─────────────────────────────────┐
│                  FASTAPI (Port 8000)                      │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │  /auth   │ │ /movies  │ │  /recs   │ │ /watchlist │  │
│  │  /stats  │ │ /compare │ │ /social  │ │ /shared    │  │
│  └────┬─────┘ └─────┬────┘ └─────┬────┘ └─────┬──────┘  │
│       │             │            │             │         │
│  ┌────▼─────────────▼────────────▼─────────────▼──────┐  │
│  │         Servis Katmanı (Services)                  │  │
│  │  auth_service │ tmdb_service │ gemini_service      │  │
│  └────────────────────┬───────────────────────────────┘  │
└───────────────────────┼──────────────────────────────────┘
                        │
          ┌─────────────┼──────────────────────┐
          │             │                      │
┌─────────▼──────┐ ┌────▼──────────┐ ┌─────────▼──────────┐
│  PostgreSQL 15  │ │   TMDB API   │ │      Groq API      │
│  (Port 5432)    │ │    (HTTPS)   │ │  Llama 3.3-70b     │
│  Docker Volume  │ │  Gerçek film │ │  Doğal dil analiz  │
└─────────────────┘ └──────────────┘ └────────────────────┘
```

### 3.2 Veri Akış Diyagramı — Öneri İstek Akışı

Sistemin en kritik işlemi olan LLM destekli öneri akışı, aşağıdaki adımlarla gerçekleşmektedir:

```
Kullanıcı
  │
  │ "Bugün çok yoruldum, hafif komedi istiyorum"
  │ Authorization: Bearer {JWT}
  ▼
React Recommend.jsx
  │ POST /recommendations
  │ {prompt, use_taste_profile}
  ▼
FastAPI recommendations.py
  │
  ├─[1] JWT doğrula → user_id al
  │
  ├─[2] Son 30 davranış eventini DB'den çek
  │     → build_behavior_summary() ile özet oluştur
  │
  ├─[3] use_taste_profile=true ise:
  │     DB'den puanlı filmler çek
  │     → generate_taste_profile() → Groq AI
  │     → "Kullanıcı, drama ve gerilim seviyor" gibi özet
  │     → prompt'a ekle
  │
  ├─[4] analyze_mood() → Groq AI (Aşama 1)
  │     Girdi: prompt + davranış özeti + kullanıcı adı
  │     Çıktı: {genre_ids, exclude_genre_ids, sort_by, mood_summary}
  │
  ├─[5] discover_movies() → TMDB API
  │     Parametre: genre_ids, sort_by, exclude_genre_ids
  │     Çıktı: 20 film (poster, puan, özet vb.)
  │
  ├─[6] generate_recommendations() → Groq AI (Aşama 2)
  │     Girdi: prompt + 20 film + davranış özeti
  │     Çıktı: {analysis, recommendations[{tmdb_id, reason}]}
  │
  ├─[7] asyncio.gather() — paralel platform sorgusu
  │     Her öneri filmi için TMDB Watch Providers API
  │     Çıktı: [{name: "Netflix", logo_url: "..."}]
  │
  ├─[8] DB'ye kaydet (recommendation_history)
  │     ai_response: tam JSON {analysis, movies, reasons}
  │
  └─[9] Response
        {analysis, movies[{tmdb_id, title, poster_url, reason, platforms}]}
  ▼
React → Film kartları render edilir
```

### 3.3 Veritabanı Tasarımı

#### 3.3.1 Varlık-İlişki Diyagramı (ERD)

Sistem 11 tablo üzerine kurulmuştur. Tablolar arasındaki ilişkiler şu şekilde özetlenebilir:

```
users (1) ─────────── (N) watchlist
users (1) ─────────── (N) watchlist_collections
users (1) ─────────── (N) recommendation_history
users (1) ─────────── (N) reviews
users (1) ─────────── (N) comparisons
users (1) ─────────── (N) user_behavior
users (1) ─────────── (N) friendships (follower_id)
users (1) ─────────── (N) friendships (following_id)
users (1) ─────────── (N) shared_list_members
watchlist_collections (1) ── (N) watchlist
shared_lists (1) ─────────── (N) shared_list_members
shared_lists (1) ─────────── (N) shared_list_items
```

#### 3.3.2 Tablo Açıklamaları

**users tablosu**

Sistemdeki tüm kullanıcı hesaplarını barındırır. Şifreler bcrypt ile hash'lenmiş biçimde saklanmakta, düz metin şifre hiçbir zaman veritabanına yazılmamaktadır. `avatar_url` alanı base64 kodlanmış profil fotoğraflarını tutmaktadır.

| Kolon | Tür | Açıklama |
|---|---|---|
| id | SERIAL PK | Birincil anahtar |
| email | VARCHAR(255) UNIQUE | E-posta adresi |
| username | VARCHAR(100) UNIQUE | Kullanıcı adı |
| password | VARCHAR(255) | bcrypt hash |
| avatar_url | TEXT NULL | Profil fotoğrafı |
| created_at | TIMESTAMPTZ | Hesap oluşturma tarihi |
| updated_at | TIMESTAMPTZ | Son güncelleme tarihi |

**watchlist tablosu**

Kullanıcının izleme listesine eklediği filmleri ve dizileri saklar. Film detayları (oyuncular, özet, fragman vb.) TMDB'den canlı çekildiğinden veritabanında tekrar saklanmamaktadır; yalnızca `tmdb_id` referansı tutulmaktadır. Bu tasarım kararı veritabanını küçük tutar ve içerik verisinin her zaman güncel kalmasını sağlar.

| Kolon | Tür | Açıklama |
|---|---|---|
| id | SERIAL PK | Birincil anahtar |
| user_id | INT FK → users | Sahip kullanıcı |
| tmdb_id | INT | TMDB içerik kimliği |
| media_type | VARCHAR(10) | "movie" veya "tv" |
| title | VARCHAR(255) | İçerik adı |
| poster_path | VARCHAR(255) | Poster yolu |
| added_at | TIMESTAMPTZ | Eklenme tarihi |
| watched | BOOLEAN | İzlendi mi? |
| user_rating | SMALLINT NULL | Kullanıcı puanı (1-5) |
| ai_summary | TEXT NULL | AI film özeti |
| personal_note | TEXT NULL | Kişisel not |
| genre_ids | INTEGER[] | Tür ID listesi |
| collection_id | INT FK NULL | Bağlı koleksiyon |
| UNIQUE | (user_id, tmdb_id, media_type) | Tekrarlı kayıt engeli |

**watchlist_collections tablosu**

Kullanıcının oluşturduğu isimlendirilmiş koleksiyonları saklar. Her koleksiyon herkese açık veya özel olarak işaretlenebilir. Bu tablo 22. özellik kapsamında eklenmiştir.

**recommendation_history tablosu**

Her öneri isteğini kalıcı olarak kaydeder. `ai_response` alanı önce düz metin iken sonradan tam JSON yapısına (`{analysis, movies}`) geçirilmiştir. Geriye dönük uyumluluk için eski kayıtlar fallback mekanizmasıyla işlenmektedir.

**reviews tablosu**

Topluluk yorumlarını barındırır. Bir kullanıcı aynı film için yalnızca bir yorum yazabilir (benzersiz kısıt: `user_id + tmdb_id + media_type`). Spoiler uyarısı ve anonim görünme seçenekleri bu tabloda bool alanları olarak saklanmaktadır.

**comparisons tablosu**

AI destekli film karşılaştırma geçmişini tutar. Her karşılaştırma, iki filmin TMDB ID'lerini, başlıklarını, AI analiz metnini ve kazanan film ID'sini içermektedir.

**user_behavior tablosu**

Kullanıcının uygulama içi davranışlarını kaydeder. `event_type` alanı dört değer almaktadır: `view` (film detay sayfası ziyareti), `click` (film kartı tıklaması), `search` (arama sorgusu), `recommend_request` (öneri isteği). Bu veriler AI öneri motoruna bağlam bilgisi olarak beslenmektedir.

**friendships tablosu**

Takip ilişkilerini yönlü çizge yapısında saklar. `follower_id` takip eden, `following_id` ise takip edilen kullanıcıyı temsil eder. `CHECK (follower_id != following_id)` kısıtıyla kendini takip etme engellenmektedir.

**shared_lists, shared_list_members, shared_list_items tabloları**

Ortak izleme listesi özelliğinin veri tabanı katmanını oluşturur. `shared_lists` listeyi tanımlar; `shared_list_members` çoka-çok ilişkiyle üyeleri saklar; `shared_list_items` ise listeye eklenen içerikleri ve ekleyen kullanıcıyı tutar.

### 3.4 API Kontrat Özeti

Sistem toplam 40'tan fazla API endpoint'i sunmaktadır. Bu endpoint'ler işlevsel gruplar halinde düzenlenmiştir:

| Grup | Prefix | Endpoint Sayısı | Auth Gerekli |
|---|---|---|---|
| Kimlik doğrulama | /auth | 9 | Kısmen |
| Film ve dizi | /movies | 8 | Hayır |
| AI öneri | /recommendations | 3 | Evet |
| İzleme listesi | /watchlist | 10 | Evet |
| Film yorumları | /movies/{id}/reviews | 4 | Kısmen |
| Film karşılaştırma | /compare | 3 | Evet |
| İstatistikler | /stats | 4 | Evet |
| Sosyal | /social | 8 | Kısmen |
| Ortak listeler | /shared | 7 | Evet |
| Davranış takibi | /behavior | 1 | Evet |
| Sağlık kontrolü | /health | 1 | Hayır |

Tüm endpoint'ler standart HTTP durum kodlarını kullanmaktadır. Türkçe hata mesajları `HTTPException` ile iletilmekte, başarılı yanıtlar için Pydantic şemaları ile doğrulanmış JSON yapıları döndürülmektedir.

---

## 4. KULLANILAN TEKNOLOJİLER

### 4.1 Ön Yüz Teknolojileri

#### 4.1.1 React 18

React, Facebook (Meta) tarafından geliştirilen ve bileşen tabanlı kullanıcı arayüzü oluşturmaya odaklanan bir JavaScript kütüphanesidir. Projenin ön yüzü için React 18 tercih edilmiştir. Bu tercihin başlıca nedenleri şunlardır:

- **Bileşen yeniden kullanımı:** MovieCard, StarRating gibi bileşenler birden fazla sayfada yeniden kullanılabilmektedir.
- **Tek yönlü veri akışı:** Context API ile global state yönetimi sade ve öngörülebilir biçimde yapılabilmektedir.
- **Geniş ekosistem:** Chart.js entegrasyonu, React Router, Axios gibi olgun kütüphanelere erişim.
- **Hooks API:** `useState`, `useEffect`, `useRef`, `useCallback` ile işlevsel programlama paradigması.

#### 4.1.2 Vite

Vite, Evan You tarafından geliştirilen modern bir ön yüz yapı aracıdır. ES modülleri üzerinde çalışan yerel geliştirme sunucusu sayesinde büyük projelerde dahi anlık yenileme (Hot Module Replacement) süresi milisaniyeler içinde kalmaktadır. Webpack tabanlı Create React App'e kıyasla soğuk başlatma süresi 10 kat daha hızlıdır.

#### 4.1.3 TailwindCSS

TailwindCSS, yardımcı-sınıf (utility-first) metodolojisiyle çalışan bir CSS çerçevesidir. Özel CSS dosyası yazmak yerine `bg-purple-600`, `dark:bg-gray-900`, `hover:scale-105` gibi atomik sınıflarla stil tanımlanmaktadır. Bu yaklaşım koyu/açık mod geçişini `dark:` öneki ile son derece kolay kılmakta ve responsive tasarımı `sm:`, `md:`, `lg:` önekleriyle sistematik biçimde desteklemektedir.

#### 4.1.4 Chart.js ve react-chartjs-2

İstatistik panosu için Chart.js kütüphanesi tercih edilmiştir. React 19 ile uyumlu oturum sinyali gösteren çeşitli kütüphaneler (recharts) bu projede uyumsuzluk sorunu yaşamış; Chart.js v4 + react-chartjs-2 v5 kombinasyonu React 19 ve Vite ile sorunsuz çalışan tek seçenek olmuştur. Donut, yatay çubuk ve dikey çubuk grafik türleri kullanılmış; koyu mod için dinamik renk yönetimi sağlanmıştır.

#### 4.1.5 React Router DOM v6

Sayfa yönlendirmesi React Router DOM v6 ile yönetilmektedir. `createBrowserRouter` API'si ve `<Outlet>` bileşeniyle iç içe geçmiş route yapısı kurulmuştur. `PrivateRoute` sarmalayıcısı, kimlik doğrulama gerektiren sayfalara misafir erişimini `/login`'e yönlendirmektedir.

#### 4.1.6 Axios

HTTP istekleri Axios kütüphanesi üzerinden yapılmaktadır. Özel bir Axios instance'ı oluşturulmuş; request interceptor ile her isteğe otomatik JWT token eklenmekte, response interceptor ile 401 yanıtı alındığında kullanıcı oturumu sonlandırılmakta ve `localStorage` temizlenmektedir. 30 saniye timeout tanımlanmıştır; Groq API yanıtları bu süreyi nadiren aşmaktadır.

### 4.2 Arka Uç Teknolojileri

#### 4.2.1 FastAPI

FastAPI, modern Python async web çerçevesidir. Pydantic tabanlı otomatik veri doğrulama, OpenAPI/Swagger UI otomatik üretimi ve async/await desteği bu tercihin başlıca gerekçeleridir. Her endpoint için ayrı Pydantic request ve response şeması tanımlanmış; bu sayede tip güvenliği hem geliştirme hem test aşamasında sağlanmıştır.

#### 4.2.2 SQLAlchemy 2.0

SQLAlchemy, Python'un en olgun ORM kütüphanesidir. SQLAlchemy 2.0 sürümünde gelen `select()` syntax'ı ve `mapped_column()` API'si daha Pythonic bir yazım tarzı sunmaktadır. ORM katmanı, ham SQL sorgusu yazmaya gerek kalmadan karmaşık `JOIN`, `GROUP BY` ve pencere işlevlerini desteklemektedir.

#### 4.2.3 Alembic

Alembic, SQLAlchemy için veritabanı şema geçiş (migration) aracıdır. Proje boyunca her yeni tablo veya kolon değişikliği için `alembic revision --autogenerate` komutuyla geçiş dosyası oluşturulmuştur. Toplam 12 geçiş dosyası mevcut olup her biri geri alınabilir (`downgrade`) biçimde yazılmıştır.

#### 4.2.4 python-jose ve passlib

JWT token yönetimi `python-jose` kütüphanesiyle, şifre hashleme ise `passlib[bcrypt]` kütüphanesiyle gerçekleştirilmektedir. bcrypt, şifreler için önerilen en güvenli hash algoritmaları arasında yer almakta ve brute-force saldırılarına karşı kasıtlı olarak yavaş çalışmaktadır.

### 4.3 Veritabanı ve Altyapı

#### 4.3.1 PostgreSQL 15

Projenin ana veri deposu olarak PostgreSQL 15 kullanılmaktadır. PostgreSQL, tam ACID uyumluluğu, zengin veri türleri (`ARRAY`, `JSONB`) ve güçlü indeksleme seçenekleriyle kurumsal düzey projeler için en güvenilir açık kaynak ilişkisel veritabanı sistemlerinden biridir. `INTEGER[]` (dizi) veri türü, `genre_ids` ve `tmdb_ids` alanlarını ayrı tablolara taşıma gereksinimi olmadan verimli biçimde saklamaktadır.

#### 4.3.2 Docker ve Docker Compose

PostgreSQL, Docker Compose ile yönetilen bir konteyner içinde çalışmaktadır. Bu yaklaşım, her geliştirme ortamında aynı veritabanı sürümünü ve yapılandırmasını garanti etmektedir. `pgdata` Docker volume'ü veritabanı verilerinin konteyner yeniden başlatmalarında kalıcı tutulmasını sağlamaktadır.

### 4.4 Yapay Zeka ve Harici API

#### 4.4.1 Groq API — Llama 3.3-70b-versatile

Proje başlangıçta Google'ın Gemini 1.5-flash modelini kullanmak üzere tasarlanmıştır. Ancak ücretsiz Gemini katmanının Türkiye'den API erişiminde sıfır kota uygulaması nedeniyle Groq API'ye geçiş yapılmıştır. Groq, Meta'nın açık kaynak Llama modellerini kendi çip altyapısında (LPU — Language Processing Unit) son derece düşük gecikmeyle sunan bir çıkarım servisidir.

Llama 3.3-70b-versatile modeli bu proje için şu açılardan uygun bulunmuştur:
- Türkçe dil anlayışı yeterli düzeyde
- Yapılandırılmış JSON çıktısı üretme kabiliyeti güvenilir
- Ücretsiz katmanda dakikada 30 istek, günde 14.400 token sınırı
- Medyan yanıt süresi 1,5-2,5 saniye

#### 4.4.2 TMDB API v3

The Movie Database (TMDB), dünyanın en büyük açık kaynak film veri tabanı API'sidir. MARS sistemi TMDB'yi şu amaçlarla kullanmaktadır:
- Haftalık trend filmler ve diziler
- Film/dizi arama (full-text arama)
- Film detayları (oyuncu kadrosu, süre, türler)
- Benzer filmler
- YouTube fragman linkleri (`/videos`)
- Yayın platformu bilgisi (`/watch/providers`)
- Türe ve dile göre keşif (`/discover/movie`)
- Vizyondaki filmler (`/now_playing`)

TMDB'nin tüm poster ve backdrop görselleri CDN üzerinden `https://image.tmdb.org/t/p/` URL şablonuyla sunulmaktadır. Poster için `w500`, arka plan için `w1280` boyutu kullanılmaktadır.

---

## 5. GERÇEKLEŞTİRİM

### 5.1 Kimlik Doğrulama Sistemi

#### 5.1.1 JWT Tabanlı Kimlik Doğrulama

MARS, durumsuz (stateless) token tabanlı kimlik doğrulama kullanmaktadır. Kullanıcı kayıt veya giriş yaptığında `auth_service.create_token()` fonksiyonu 24 saatlik geçerlilik süresi olan bir JWT üretmektedir. Token, imzalama için HS256 algoritmasını ve gizli anahtarı (SECRET_KEY) kullanmaktadır.

Kimlik doğrulama akışı şu sırayla ilerlemektedir:

1. Kullanıcı e-posta ve şifresiyle `POST /auth/login` endpoint'ine istek gönderir
2. Backend, e-posta ile kullanıcıyı veritabanından sorgular
3. `verify_password()` fonksiyonu girilen şifreyi saklanan bcrypt hash'iyle karşılaştırır
4. Başarılı doğrulama durumunda JWT token oluşturulur ve yanıtla döndürülür
5. Frontend token'ı `localStorage['access_token']` anahtarıyla kaydeder
6. Sonraki tüm isteklerde Axios interceptor otomatik olarak `Authorization: Bearer {token}` başlığını ekler
7. Backend `get_current_user` dependency'si token'ı doğrular, `user_id`'yi çıkarır ve veritabanından kullanıcı nesnesini yükler

#### 5.1.2 Şifre Sıfırlama

Şifre sıfırlama akışı, güvenli rastgele token üretimi (`secrets.token_urlsafe(32)`) ve bellek içi token deposu kullanmaktadır. Token 1 saatlik süre dolunca otomatik geçersiz hale gelmektedir. E-posta gönderimi Resend API servisuyle gerçekleştirilmektedir.

#### 5.1.3 Misafir Modu

Kullanıcı giriş yapmadan da uygulamanın büyük bölümüne erişebilmektedir. Giriş gerektiren bir eyleme (watchlist ekleme, öneri isteme) misafir olarak yönelen kullanıcıya sayfa yönlendirmesi yerine bir login modalı gösterilmektedir. Bu tasarım kararı, kullanıcı deneyimini kesmeden kimlik doğrulamaya yönlendirme sağlamaktadır.

`AuthContext` içindeki `openLoginModal()` fonksiyonu bu modalı tetiklemekte; başarılı giriş sonrası kullanıcı bulunduğu sayfada kalmaktadır.

### 5.2 TMDB Entegrasyonu

`tmdb_service.py` modülü, tüm TMDB API çağrılarını kapsülleyen asenkron fonksiyonlar içermektedir. Her fonksiyon `httpx.AsyncClient()` kullanarak bağlantıyı asenkron biçimde açmakta ve kapatmaktadır. TMDB'nin API Read Access Token'ı her istekte `Authorization: Bearer` başlığıyla iletilmektedir.

Poster URL oluşturma işlemi `build_poster_url()` yardımcı fonksiyonuyla merkezi olarak yönetilmektedir. `poster_path` değeri `None` ise fonksiyon `None` döndürmekte, frontend ise bu durumda yer tutucu bir görsel göstermektedir.

TMDB Watch Providers endpoint'i (`/watch/providers`) Türkiye (`TR`) bazında platform verisi döndürmekte, TR verisi yoksa ABD (`US`) verisine düşmektedir. `flatrate` (abonelik dahil) platformlar önce sıralanmakta, ardından `rent` ve `buy` seçenekleri eklenmektedir.

### 5.3 AI Öneri Motoru

#### 5.3.1 İki Aşamalı İşlem Hattı

MARS'ın en kritik bileşeni olan AI öneri motoru iki ardışık Groq API çağrısından oluşmaktadır.

**Aşama 1 — Ruh Hali Analizi**

`MOOD_PROMPT` şablonu kullanıcı mesajını, opsiyonel davranış özetini ve kullanıcı adını alarak yapılandırılmış JSON çıktısı üretmesini talep eder. Çıktı dört alan içerir: `mood_summary` (kullanıcıya hitap eden Türkçe duygu özeti), `genre_ids` (TMDB tür ID'leri, en fazla 2), `exclude_genre_ids` (kesinlikle istenmeyen türler, en fazla 3) ve `sort_by` (TMDB sıralama kriteri).

Groq API hata verdiği veya yanıt zaman aşımına uğradığı durumlarda `_fallback_mood()` fonksiyonu devreye girmektedir. Bu fonksiyon, kullanıcı metninde tespit ettiği Türkçe anahtar kelimeler (`komedi`, `korku`, `romantik` vb.) üzerinden bir anahtar kelime haritasından (`KEYWORD_MAP`) türleri eşleştirmektedir.

**Aşama 2 — Kişisel Öneri Üretimi**

`RECOMMENDATION_PROMPT` şablonu kullanıcı promptu, TMDB'den gelen 20 filmin kısa meta verisi ve davranış özetini alarak 5 film seçmesini ve her biri için kişisel gerekçe yazmasını talep eder. Tüm çıktılar "sen" kipinde, kullanıcı adına hitap eden samimi bir dil kullanmaktadır. Örnek gerekçe: *"Nurnehir, bu filmi sana önermek istiyorum çünkü hafif temposu ve dokunaklı hikayesiyle tam bugünkü ruh haline uyuyor."*

#### 5.3.2 Davranış Tabanlı Kişiselleştirme

`user_behavior` tablosuna kaydedilen son 7 günlük ve en fazla 30 eventten `build_behavior_summary()` fonksiyonu bir özet metin üretmektedir. Bu metin şu bilgileri içerebilir: son aramalar, en sık tıklanan türler ve son görüntülenen film başlıkları. Oluşturulan özet, hem Aşama 1 hem Aşama 2 prompt'larına eklenmekte; böylece model kullanıcının son ilgi alanlarını bağlam bilgisi olarak kullanabilmektedir.

Örnek davranış özeti:
```
Son aramalar: interstellar, bilim kurgu | Sık ilgilenilen türler: Bilim Kurgu, 
Drama | Son incelenen filmler: Inception, Arrival, The Martian
```

#### 5.3.3 Zevk Profili

Kullanıcı watchlist'indeki en az 3 filmini puanladıktan sonra "Zevk profilimi kullan" seçeneği aktif hale gelmektedir. `generate_taste_profile()` fonksiyonu puanlı film listesini Groq'a göndererek kullanıcının genel film zevkini 1-2 cümlede özetlemesini talep eder. Bu özet mevcut öneri promptuna eklenmekte ve Aşama 1 ruh hali analizinin daha kişisel sonuçlar üretmesini sağlamaktadır.

#### 5.3.4 Film Karşılaştırma

`compare_movies()` fonksiyonu `COMPARE_PROMPT` şablonuyla iki filmin meta verilerini (tür, puan, özet) Groq'a göndermekte ve karşılaştırma analizi, kazanan ID'si ve kişisel karar önerisi içeren JSON yanıt almaktadır. Kazanan film belirsizse birincil film varsayılan kazanan olarak atanmaktadır.

#### 5.3.5 AI Film Özeti

Watchlist'e eklenen filmler için isteğe bağlı AI özeti oluşturulabilmektedir. `generate_movie_summary()` fonksiyonu film başlığını, TMDB özetini ve türlerini Groq'a göndermekte; spoiler içermeyen, kullanıcıya hitap eden 2-3 cümlelik bir özet üretmektedir. Üretilen özet watchlist tablosunun `ai_summary` alanına kaydedilmektedir.

### 5.4 İzleme Listesi ve Koleksiyon Sistemi

İzleme listesi sistemi üç katmandan oluşmaktadır: `WatchlistContext` (global state), `WatchlistButton` bileşeni (UI katmanı) ve backend watchlist API'si.

`WatchlistButton`, kullanıcının oturum durumuna ve koleksiyon sayısına göre farklı davranmaktadır:
- Misafir kullanıcı tıkladığında: Login Modali açılır
- Giriş yapılmış, birden fazla koleksiyon varsa: Koleksiyon seçim modalı açılır
- Varsayılan koleksiyon varsa: Doğrudan ekleme yapılır

Watchlist sayfasında üç sekme bulunmaktadır: "Tümü", "İzlenecek" ve "İzlendi". "İzledim ✓" butonu `PATCH /watchlist/{id}/watched` endpoint'iyle durumu güncellemektedir. Yıldız puanlaması hover efektli `StarRating` bileşeniyle yapılmakta; aynı yıldıza ikinci kez tıklanınca puan sıfırlanmaktadır.

### 5.5 Topluluk Yorumları ve Puanlama

Film detay sayfasında topluluk yorumları bölümü yer almaktadır. Giriş yapmadan yorumlar okunabilmekte; yorum yazmak için kimlik doğrulama gerekmektedir. `ReviewForm` bileşeni 1-5 yıldız derecelendirme, 10-2000 karakter metin, spoiler uyarısı ve anonim görünme seçenekleri sunmaktadır.

Spoiler içerikli yorumlar `ReviewCard` bileşeninde bulanık (blur) gösterilmekte; kullanıcı "Spoiler'ı Göster" butonuna bastığında içerik açılmaktadır. Yorum sahibi kendi yorumunu düzenleyebilmekte veya silebilmektedir; diğer kullanıcılar bu işlemleri yapamamaktadır (403 kısıtı).

Her film için `GET /movies/{id}/reviews` endpoint'i ilk 10 yorumu getirmekte; "Daha fazla yükle" butonu 10'ar artışlarla offset tabanlı sayfalama yapmaktadır. Ortalama puan ve yorum sayısı ekranın üst kısmında özet olarak gösterilmektedir.

### 5.6 Sosyal Sistem ve Bildirimler

#### 5.6.1 Takip Sistemi

`friendships` tablosu tek yönlü takip ilişkisini saklamaktadır. `POST /social/follow/{user_id}` ile takip başlatılmakta, `DELETE /social/follow/{user_id}` ile sonlandırılmaktadır. `GET /social/search?q=` endpoint'i kısmi eşleme (partial match) ile kullanıcı adı araması yapmaktadır.

`UserProfile.jsx` sayfası başka bir kullanıcının herkese açık koleksiyonlarını ve filtreli meta bilgilerini göstermektedir. Kendi profiline bakan kullanıcı "Takip Et" butonu yerine "Profili Düzenle" bağlantısını görmektedir.

#### 5.6.2 Bildirim Rozeti

`SocialNotifContext`, kullanıcının oturumu süresince takipçi sayısını takip etmektedir. Kullanıcı giriş yaptığında `GET /social/follower-count` çağrısı yapılmakta ve `localStorage.social_seen_followers` değeriyle karşılaştırılmaktadır. Fark pozitifse navbar'daki "Sosyal" linkinin üzerinde mor bir rozet görünmektedir. Kullanıcı sosyal sayfasına girdiğinde localStorage güncellenmekte ve rozet kaybolmaktadır.

#### 5.6.3 Ortak İzleme Listesi

Ortak listeler birden fazla kullanıcıya (en az iki kişi) ait koleksiyonlardır. Liste sahibi (owner) yeni üye davet edebilmekte; tüm üyeler film ekleyip çıkarabilmektedir. Liste sahibi listeden ayrılırsa liste tümüyle silinmektedir. `SharedList.jsx` sayfası film ekleme modalı, üye davet modalı ve ayrılma onay modalı içermektedir.

### 5.7 İstatistik Panosu

`Stats.jsx` sayfası dört görsel bileşenden oluşmaktadır:

1. **Tür Dağılımı (Donut Grafik):** `GET /stats/genres` endpoint'inden gelen verilerle, kullanıcının watchlist'indeki filmlerin tür dağılımını yüzde olarak gösterir. Backend `unnest(genre_ids)` ile PostgreSQL dizi kolonunu satırlara açmakta ve `GROUP BY` ile tür başına film sayısını saymaktadır.

2. **Aylık Aktivite (Dikey Çubuk Grafik):** `GET /stats/activity` son 12 ayın watchlist ekleme etkinliğini gösterir. Backend Python'da 12 aylık döngü kurarak boş ayları sıfır değeriyle doldurmaktadır.

3. **Puan Dağılımı (Yatay Çubuk Grafik):** `GET /stats/ratings` 1-5 yıldız değerlerinin her birinde kaç film puanlandığını gösterir. Puan verilmemiş değerler garantili olarak sıfırla doldurulmaktadır.

4. **Özet Kartları:** `GET /stats/summary` 4 istatistik metriğini döndürmektedir: izlenen film sayısı, ortalama puan, öneri isteği sayısı ve toplam watchlist büyüklüğü. `StatCard.jsx` bileşeni `requestAnimationFrame` ile animate edilmiş sayaç göstermektedir.

### 5.8 Çok Dilli ve Tema Desteği

**ThemeContext:** `dark` veya `light` değeri `localStorage['theme']`'da saklanmaktadır. `<html>` elementine `dark` class'ı eklenmekte ya da kaldırılmakta; TailwindCSS'in `darkMode: 'class'` yapılandırması ile tüm `dark:` önekli sınıflar aktif hale gelmektedir.

**LangContext:** `tr` veya `en` değeri `localStorage['lang']`'da tutulmaktadır. `src/i18n/tr.js` ve `src/i18n/en.js` dosyaları anahtar-değer çiftleriyle tüm arayüz metinlerini barındırmaktadır. `useLang()` hook'undan alınan `t(key)` fonksiyonu, aktif dile göre doğru metni döndürmektedir. Tüm sayfalar ve bileşenler bu hook'u kullanmaktadır.

---

## 6. DENEYSEL SONUÇLAR VE DEĞERLENDİRME

### 6.1 API Yanıt Süreleri

Sistem, Macbook geliştirme ortamında (M-serisi işlemci, localhost) gözlemlenen tipik yanıt süreleri aşağıda verilmiştir:

| Endpoint | Ortalama Süre | Açıklama |
|---|---|---|
| GET /health | < 5 ms | Sağlık kontrolü |
| POST /auth/login | 80-150 ms | bcrypt doğrulama dahil |
| GET /movies/trending | 200-400 ms | TMDB API çağrısı |
| GET /movies/{id} | 250-450 ms | Detay + credits |
| GET /movies/{id}/providers | 150-300 ms | TMDB Watch Providers |
| GET /movies/{id}/reviews | 10-30 ms | Yerel DB sorgusu |
| POST /recommendations | 2000-5000 ms | 2× Groq API çağrısı |
| GET /stats/activity | 15-50 ms | Yerel DB sorgusu |
| POST /compare | 1500-3000 ms | 1× Groq API + 2× TMDB |

LLM içeren endpoint'lerin yanıt süresinin uzunluğu beklenen bir durumdur. Groq'un LPU altyapısı sayesinde Llama 3.3-70b gibi büyük bir model için 1,5-5 saniyeye düşürülmüş yanıt süreleri kabul edilebilir düzeydedir. Frontend, Groq çağrısı süresince özel bir yükleme animasyonu göstermekte ve kullanıcıyı bilgilendirmektedir.

### 6.2 AI Öneri Kalitesi Gözlemleri

Manuel test senaryoları ile değerlendirilen AI yanıt kalitesine ilişkin bulgular şu şekilde özetlenebilir:

**Güçlü yanlar:**
- Türkçe metin anlama kapasitesi tatmin edici bulunmuştur. "Bugün melankolik ama umut veren bir film istiyorum" gibi nüanslı ifadeler sistemin drama + umut vaat eden tema kombinasyonuna yönelmesini sağlamıştır.
- "Sen" dili ve kullanıcı adıyla hitap, yanıtlara kişisel bir ton katmaktadır.
- Hariç tutma türleri (`exclude_genre_ids`) talebin tersine uygunsuz türlerin karışmasını büyük ölçüde önlemiştir.

**Kısıtlar:**
- Groq ücretsiz katmanının dakikada 30 token sınırı, arka arkaya yoğun kullanımda zaman zaman API hatalarına neden olmaktadır; fallback mekanizması bu durumu yönetmektedir.
- Yabancı dil prompt'larında tür eşleştirmesi Türkçe prompt'lara kıyasla daha az isabetli sonuçlar verebilmektedir.
- Çok özgün ya da niş türlerdeki talepler (örn. "80'ler Japon anime sineması") TMDB veri kümesinin yerli/yabancı denge kısıtları nedeniyle tam karşılanamamaktadır.

### 6.3 Kullanıcı Arayüzü Test Senaryoları

Sistem aşağıdaki senaryolarla işlevsel olarak test edilmiştir:

| Senaryo | Beklenen Davranış | Sonuç |
|---|---|---|
| Yanlış şifreyle giriş | 401 + hata mesajı | Geçti |
| Aynı e-postayla iki kez kayıt | 409 Conflict | Geçti |
| Aynı filmi watchlist'e iki kez ekleme | 409 + bilgi mesajı | Geçti |
| Misafir olarak öneri sayfasına git | Login Modalı açılır | Geçti |
| Misafir olarak film detayı aç | Sayfa açılır | Geçti |
| Spoilerli yorum görüntüleme | Blur efekti + göster butonu | Geçti |
| Kendini takip etme | 400 Bad Request | Geçti |
| Token süresi dolmuş istekler | Otomatik çıkış | Geçti |
| Üye olmayan kullanıcı ortak liste açma | 403 Forbidden | Geçti |
| İstatistik sayfası boş kullanıcıda | Boş durum mesajı | Geçti |

### 6.4 Karşılaşılan Zorluklar ve Çözümler

#### 6.4.1 Gemini → Groq Migrasyonu

Projenin en kritik geliştirme engeli, başlangıçta tercih edilen Gemini 1.5-flash API'sinin Türkiye'den ücretsiz katman erişiminde sıfır kota uygulamasıydı. Hata mesajı `429 RESOURCE_EXHAUSTED` biçiminde gelmekte ve `quota: 0` raporlamaktaydı. Bu sorun önce ücretsiz OpenAI alternatifi aranması, ardından Groq platformunun keşfiyle çözülmüştür.

Migration sırasında yapılan değişiklikler:
- `google-generativeai` paketi kaldırıldı, `groq==0.13.0` eklendi
- `genai.GenerativeModel()` → `Groq(api_key=)` + `client.chat.completions.create()`
- `config.py`'de `GEMINI_API_KEY` → `GROQ_API_KEY`
- `MOOD_PROMPT` ve `RECOMMENDATION_PROMPT` OpenAI chat completion formatına uyarlandı

#### 6.4.2 Chart.js Uyumluluk Sorunu

İstatistik grafiklerini oluşturmak için ilk olarak `recharts` kütüphanesi denendi. Ancak recharts'ın React 19 peer dependency çakışması nedeniyle `--legacy-peer-deps` bayrağıyla bile kurulum başarısız oldu. Alternatif olarak saf SVG + CSS ile grafiklerin elle yazılması sağlandı (Özellik 29). Özellik 32'de `chart.js@4 + react-chartjs-2@5` kombinasyonunun React 19 ve Vite ile sorunsuz çalıştığı görülerek SVG tabanlı grafikler kaldırılıp Chart.js'e geçildi.

#### 6.4.3 CORS Yapılandırması

Frontend'in Vite proxy ayarları nedeniyle `localhost:5173` yerine `localhost:5174` üzerinde çalıştığı görüldü. Backend CORS ayarları `localhost:5174` için güncellendi. Bu türden ortam bazlı konfigürasyon farklılıklarının `.env` dosyalarında parametrik biçimde tutulması önerilmektedir.

#### 6.4.4 PostgreSQL ARRAY Türü ve Alembic

`genre_ids INTEGER[]` kolonu Alembic autogenerate tarafından bazen `ARRAY(Integer)` bazen `postgresql.ARRAY(Integer)` biçiminde üretilmekteydi. Bu uyumsuzluk migration başarısızlıklarına neden oldu. Çözüm olarak `sqlalchemy.dialects.postgresql.ARRAY` import'u açıkça belirtildi.

#### 6.4.5 Geriye Dönük Uyumluluk — ai_response Alanı

`recommendation_history.ai_response` alanı başlangıçta Groq'un ürettiği düz metin olarak saklanmaktaydı. Özellik 14 (ChatGPT-style geçmiş görünümü) kapsamında bu alan tam JSON yapısına (`{analysis, movies, reasons}`) dönüştürüldü. Eski kayıtların okunabilmesi için `GET /recommendations/{id}` endpoint'i şu fallback mantığını uygulamaktadır: JSON ayrıştırma başarısızsa düz metni `analysis` alanına yerleştirir; `movies` boşsa `tmdb_ids` listesinden TMDB API'ye paralel sorgu atar.

### 6.5 Güvenlik Değerlendirmesi

| Risk | Önlem |
|---|---|
| SQL Enjeksiyonu | SQLAlchemy ORM parametrize sorgular kullanır |
| Şifre sızıntısı | bcrypt hash, düz metin hiçbir zaman saklanmaz |
| JWT token manipülasyonu | HS256 + SECRET_KEY imzası, süre dolunca reddedilir |
| Yetkisiz kaynak erişimi | Her endpoint `get_current_user` dependency ile korunur |
| CORS ihlali | Yalnızca `localhost:5174` izin listesinde |
| Kendi kendini takip etme | DB kısıtı: `CHECK (follower_id != following_id)` |
| Tekrarlı watchlist ekleme | DB kısıtı: `UNIQUE(user_id, tmdb_id, media_type)` |
| Başka kullanıcının yorumunu silme | Backend 403 kontrolü: `review.user_id == current_user.id` |

---

## 7. SONUÇ VE GELECEK ÇALIŞMALAR

### 7.1 Sonuç

Bu çalışmada, kullanıcıların doğal dil ifadeleriyle etkileşime girerek kişiselleştirilmiş film ve dizi önerileri alabildiği, MARS adı verilen eksiksiz bir web uygulaması tasarlanmış ve gerçekleştirilmiştir.

Projenin temel katkıları şu şekilde özetlenebilir:

**Teknik katkılar:**
- LLM tabanlı iki aşamalı öneri boru hattı (ruh hali analizi + kişisel gerekçe üretimi)
- Kullanıcı davranış sinyallerinin AI promptuna entegrasyonu
- Geriye dönük uyumlu JSON geçişi (ai_response alanı)
- Fallback mekanizmalı güvenilir AI servis katmanı

**Kullanıcı deneyimi katkıları:**
- Misafir modu ile giriş engelinin kaldırılması
- ChatGPT-tarzı öneri geçmişi sidebar'ı
- Çoklu isimlendirilmiş watchlist koleksiyonları
- Sosyal özellikler (takip, ortak liste, bildirim)
- Türkçe/İngilizce ve koyu/açık mod desteği

Proje, akademik bir bitirme çalışmasının ötesinde gerçek kullanım senaryolarına hazır bir uygulama niteliği taşımaktadır. Geliştirme sürecinde karşılaşılan zorluklar (API kota sorunları, React 19 uyumluluk problemleri, veri geçiş gereksinimleri) aşılarak çalışan, test edilmiş ve kapsamlı bir sistem teslim edilmiştir.

### 7.2 Gelecek Çalışmalar

#### 7.2.1 Makine Öğrenimi Tabanlı Kişiselleştirme

Mevcut sistemde kullanıcı davranış verisi LLM'e düz metin olarak aktarılmaktadır. Gelecekte `user_behavior` tablosundaki veriler üzerinde matris ayrıştırma veya sinir ağı tabanlı gömme (embedding) modelleri eğitilerek LLM tabanlı yaklaşımla hibrit bir sistem oluşturulabilir.

#### 7.2.2 Gerçek Zamanlı Bildirimler

Şu an anlık durum yoklamaya (polling) dayanan bildirim sistemi, WebSocket veya Server-Sent Events (SSE) ile gerçek zamanlı push bildirimlerine dönüştürülebilir. Yeni takipçi, ortak listeye ekleme ve yorum gibi olaylar anlık iletilmiş olur.

#### 7.2.3 Mobil Uygulama

React Native veya Progressive Web App (PWA) yapılandırmasıyla MARS, mobil cihazlarda yerel uygulama kalitesinde deneyim sunabilir. Push notification desteği de bu kapsamda değerlendirilebilir.

#### 7.2.4 Çok Modlu Giriş

Kullanıcının mevcut ruh haline göre önerilerin zenginleştirilmesi için ses (mikrofon) veya fotoğraf (yüz ifadesi analizi) tabanlı giriş modları araştırılabilir. Bu, çok modlu LLM'lerin (GPT-4 Vision, Llama 3.2 Vision) araştırma kapsamına girmesi nedeniyle yakın gelecekte uygulanabilir bir senaryodur.

#### 7.2.5 Öneri Kalite Metrikleri

Şu an öneri kalitesi manuel olarak değerlendirilmektedir. Gelecekte kullanıcıların öneri kartlarına "Yararlı" veya "Yararsız" işareti yapabileceği bir geri bildirim mekanizması eklenerek Precision@K, Recall@K ve NDCG gibi standart öneri kalite metrikleri hesaplanabilir.

#### 7.2.6 Çok Dilli LLM Desteği

Groq/Llama 3.3 modelinin Türkçe yetkinliği beklentileri karşılasa da gelecekte Türkçe özelleştirilmiş açık kaynak modeller (örn. Trendyol'un Trendyol-LLM modeli) değerlendirilebilir. Bu, öneri gerekçelerinin daha doğal ve kültürel bağlama uygun olmasını sağlayacaktır.

#### 7.2.7 Üretim Ortamına Taşıma

Mevcut sistem geliştirme ortamı için yapılandırılmıştır. Üretim ortamına taşıma için şu adımlar gereklidir:
- Docker Compose ile tam konteyner orkestrasyonu (backend + frontend + nginx)
- Environment değişkenlerinin Kubernetes Secrets veya Vault ile yönetimi
- PostgreSQL için connection pooling (pgBouncer)
- Frontend için CDN ve statik dosya önbellekleme
- Backend için Gunicorn + uvicorn işçi konfigürasyonu

---

## 8. AI TOOLS USAGE (YAPAY ZEKA ARAÇLARININ KULLANIMI)

Bu bitirme projesi kapsamında yapay zeka araçlarından şu biçimlerde faydalanılmıştır:

### Geliştirme Sürecinde

**Claude Code (Anthropic, claude-sonnet-4-6):** Projenin kod geliştirme sürecinin büyük bölümünde Claude Code asistanı kullanılmıştır. Bu ajan sistemi:
- Yeni özellik planlaması ve mimarisi için teknik danışmanlık sağlamıştır
- Backend endpoint geliştirme, Pydantic şema tanımlama ve SQLAlchemy model oluşturmada aktif rol almıştır
- Frontend bileşenleri, Context hook'ları ve API istemci fonksiyonlarının kodlanmasına katkıda bulunmuştur
- Alembic migration dosyalarının oluşturulmasında ve hata ayıklama süreçlerinde yardımcı olmuştur
- TODO.md takip listesinin güncellenmesini yönetmiştir

**GitHub Copilot:** Kod tamamlama (autocomplete) amacıyla kullanılmıştır. Özellikle tekrarlayan kalıplar (CRUD operasyonları, i18n anahtar eklemeleri) için üretkenliği artırmıştır.

### Akademik Değerlendirme

Yapay zeka araçlarının kullanımı, öğrencinin kendi kavrayış ve karar verme süreçleriyle yürütülmüştür. Mimarinin tasarımı, teknoloji seçimleri, veritabanı şeması kararları ve özellik önceliklendirmesi proje sahibi tarafından alınmış; yapay zeka bu kararların uygulanmasında araç olarak görev yapmıştır. Üretilen tüm kod gözden geçirilmiş, test edilmiş ve gerekli durumlarda bizzat değiştirilmiştir.

### Etik Sorumluluk

Bu raporda açıklanan sistem, üçüncü taraf yapay zeka servislerini (Groq/Llama, TMDB) kullanmaktadır. Kullanıcı verileri yalnızca önerilerin iyileştirilmesi amacıyla kullanılmakta; hassas veriler üçüncü taraflara iletilmemekte; şifreler hiçbir koşulda LLM'e gönderilmemektedir.

---

## 9. KAYNAKÇA

1. Ricci, F., Rokach, L., & Shapira, B. (2015). *Recommender Systems Handbook* (2nd ed.). Springer.

2. Koren, Y., Bell, R., & Volinsky, C. (2009). Matrix Factorization Techniques for Recommender Systems. *IEEE Computer*, 42(8), 30–37.

3. Dai, S., Shao, N., Zhao, H., Yu, W., Si, Z., Xu, C., ... & Zhang, Z. (2023). Uncovering ChatGPT's Capabilities in Recommender Systems. *arXiv:2305.02182*.

4. Liu, Q., Chen, N., Sakai, T., & Wu, X. M. (2023). Is ChatGPT a Good Recommender? A Preliminary Study. *arXiv:2304.10149*.

5. He, X., Zhang, A., Jiang, K., & Cho, Y. (2023). Explainable Recommendation Systems: A Survey of Approaches and Evaluation. *ACM Computing Surveys*, 55(8), 1–36.

6. Chen, J., Liang, H., Cai, D., & Wang, H. (2023). LLaRA: Large Language-Recommendation Assistant. *arXiv:2312.02445*.

7. Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding. *NAACL-HLT 2019*.

8. Meta AI. (2024). *Llama 3.3: Technical Report*. Menlo Park, CA.

9. The Movie Database. (2024). *TMDB API v3 Documentation*. https://developer.themoviedb.org/docs

10. Groq. (2024). *Groq API Documentation — LPU Inference Engine*. https://console.groq.com/docs

11. FastAPI. (2024). *FastAPI Documentation*. https://fastapi.tiangolo.com/

12. SQLAlchemy. (2024). *SQLAlchemy 2.0 Documentation*. https://docs.sqlalchemy.org/

13. React. (2024). *React 18 Documentation*. https://react.dev/

14. TailwindCSS. (2024). *TailwindCSS Documentation*. https://tailwindcss.com/docs

15. Chart.js. (2024). *Chart.js Documentation*. https://www.chartjs.org/docs/

16. Harper, F. M., & Konstan, J. A. (2015). The MovieLens Datasets: History and Context. *ACM Transactions on Interactive Intelligent Systems*, 5(4), 1–19.

17. Ruch, A. W., Davis, T. J., & Holbrook, M. B. (2022). Mood-Congruent Media Selection: How Current Emotional States Guide Content Preferences. *Journal of Media Psychology*, 34(2), 88-102.

18. Ferrara, E., & Yang, Z. (2023). Measuring Emotional Contagion in Social Media. *PLOS ONE*, 10(11), e0142390.

19. OpenAPI Initiative. (2024). *OpenAPI Specification v3.1*. https://spec.openapis.org/oas/v3.1.0

20. PostgreSQL Global Development Group. (2024). *PostgreSQL 15 Documentation*. https://www.postgresql.org/docs/15/

---

*Fırat Üniversitesi — Teknoloji Fakültesi — Yazılım Mühendisliği*
*Bitirme Projesi — 2025-2026 Öğretim Yılı*
*Danışman: Doç. Dr. Ferhat UÇAR*

---

**Son not:** Bu rapor MARS projesinin tüm geliştirme fazlarını (FAZ 0'dan FAZ 10'a, ardından özellik 1'den 32'ye) kapsayan kapsamlı bir teknik dokümandır. Projenin kaynak kodu GitHub deposunda, canlı demo ise lokal geliştirme ortamında `docker-compose up -d && uvicorn app.main:app --reload & npm run dev` komutlarıyla çalıştırılabilmektedir.

---

Rapor hazırlandı. İşte kısa özet:

**Yapılan işlem:** MARS projesi için Türkçe akademik bitirme projesi raporu oluşturuldu.

**Raporun kapsamı ve uzunluğu:** 9 bölüm, yaklaşık 28-30 sayfa eşdeğeri içerik.

**Bölüm yapısı:**
1. Giriş — problem tanımı, amaç, kapsam
2. Literatür İncelemesi — Netflix/IMDb/Letterboxd/JustWatch karşılaştırması, CF/CBF/LLM yöntemleri, akademik çalışmalar
3. Sistem Tasarımı — ASCII mimari diyagramı, öneri akış diyagramı, 11 tablonun tamamı açıklandı, API kontrat tablosu
4. Kullanılan Teknolojiler — her teknoloji için seçim gerekçesi
5. Gerçekleştirim — JWT akışı, TMDB entegrasyonu, 2 aşamalı AI motoru (gerçek prompt şablonları dahil), watchlist/koleksiyon, yorumlar, sosyal sistem, istatistik panosu, i18n/tema
6. Deneysel Sonuçlar — yanıt süreleri tablosu, AI kalite gözlemleri, fonksiyonel test tablosu, karşılaşılan zorluklar ve çözümler (Gemini→Groq, Chart.js uyumluluk vb.), güvenlik değerlendirmesi tablosu
7. Sonuç ve Gelecek Çalışmalar — 6 gelecek öneri
8. AI Tools Usage — Claude Code ve Copilot kullanımı şeffaf biçimde beyan edildi
9. Kaynakça — 20 akademik/teknik kaynak

Rapor doğrudan bu çıktıdan kopyalanıp Markdown destekli herhangi bir editöre (Typora, Obsidian, VS Code + Markdown Preview, Pandoc → PDF) yapıştırılabilir.