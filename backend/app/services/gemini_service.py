import json
from google import genai
from app.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)
MODEL = "gemini-2.0-flash-lite"

MOOD_PROMPT = """
Kullanicinin asagidaki mesajini analiz et ve hangi tur filmler onereceğini belirle.

Kullanici mesaji: "{prompt}"

Yanitini SADECE su JSON formatinda ver, baska hicbir sey yazma:
{{
  "mood_summary": "kullanicinin ruh halinin kisa ozeti (Turkce, 1 cumle)",
  "genre_ids": [TMDB tur ID leri, en fazla 2 tane],
  "exclude_genre_ids": [kesinlikle istemeyeceği türler, max 3],
  "sort_by": "popularity.desc veya vote_average.desc"
}}

TMDB Tur ID Referansi:
28=Aksiyon, 12=Macera, 16=Animasyon, 35=Komedi, 80=Suc, 99=Belgesel,
18=Drama, 10751=Aile, 14=Fantezi, 27=Korku, 9648=Gizem,
10749=Romantik, 878=Bilim Kurgu, 53=Gerilim, 37=Western

Örnekler:
- "hafif komedi" → genre_ids:[35], exclude_genre_ids:[27,53,18]
- "gerilim" → genre_ids:[53,27], exclude_genre_ids:[35,16]
- "aile filmi" → genre_ids:[10751,35], exclude_genre_ids:[27,53,80]
- "aksiyon macera" → genre_ids:[28,12], exclude_genre_ids:[]
"""

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

Onemli: Sadece yukaridaki listeden sec. Kullanicinin ruh haline uymayan filmleri dahil etme.
"""

KEYWORD_MAP = {
    "komedi":    ([35], [27, 53, 18]),
    "güldüren":  ([35], [27, 53, 18]),
    "gülmek":    ([35], [27, 53, 18]),
    "eğlenceli": ([35], [27, 53]),
    "hafif":     ([35], [27, 53, 18]),
    "neşeli":    ([35], [27, 53, 18]),
    "korku":     ([27], [35, 10751, 16]),
    "korkunç":   ([27], [35, 10751, 16]),
    "gerilim":   ([53], [35, 10751, 16]),
    "aksiyon":   ([28], []),
    "macera":    ([12], []),
    "romantik":  ([10749], [27, 53, 80]),
    "aşk":       ([10749], [27, 53]),
    "aile":      ([10751], [27, 53, 80]),
    "çocuk":     ([10751, 16], [27, 53, 80]),
    "animasyon": ([16], []),
    "bilim":     ([878], []),
    "fantezi":   ([14], []),
    "belgesel":  ([99], []),
    "dram":      ([18], [35]),
    "drama":     ([18], [35]),
    "polisiye":  ([80, 9648], []),
    "suç":       ([80], []),
    "western":   ([37], []),
    "kovboy":    ([37], []),
}


def _fallback_mood(prompt: str) -> dict:
    prompt_lower = prompt.lower()
    genres, excludes = [], []
    for keyword, (g, e) in KEYWORD_MAP.items():
        if keyword in prompt_lower:
            for gid in g:
                if gid not in genres:
                    genres.append(gid)
            for eid in e:
                if eid not in excludes:
                    excludes.append(eid)
    if not genres:
        genres = [35]
        excludes = [27, 53]
    return {
        "mood_summary": "Prompt analizi yapıldı",
        "genre_ids": genres[:2],
        "exclude_genre_ids": excludes[:3],
        "sort_by": "popularity.desc",
    }


def _extract_json(text: str) -> str:
    text = text.strip()
    if "```" in text:
        parts = text.split("```")
        for part in parts:
            part = part.strip()
            if part.startswith("json"):
                part = part[4:].strip()
            if part.startswith("{"):
                return part
    return text


async def analyze_mood(prompt: str) -> dict:
    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=MOOD_PROMPT.format(prompt=prompt),
        )
        print(f"=== GEMINI MOOD: {response.text[:150]} ===", flush=True)
        result = json.loads(_extract_json(response.text))
        if "exclude_genre_ids" not in result:
            result["exclude_genre_ids"] = []
        return result
    except Exception as e:
        print(f"=== GEMINI MOOD HATA: {type(e).__name__}: {str(e)[:200]} ===", flush=True)
        return _fallback_mood(prompt)


async def generate_recommendations(prompt: str, movies: list) -> dict:
    movies_simple = [
        {
            "tmdb_id": m.get("id") or m.get("tmdb_id"),
            "title": m.get("title") or m.get("name"),
            "overview": (m.get("overview", "")[:150] + "...") if m.get("overview") else "",
            "vote_average": m.get("vote_average", 0),
            "genre_ids": m.get("genre_ids", []),
        }
        for m in movies[:20]
    ]
    try:
        formatted = RECOMMENDATION_PROMPT.format(
            prompt=prompt,
            movies_json=json.dumps(movies_simple, ensure_ascii=False),
        )
        response = client.models.generate_content(model=MODEL, contents=formatted)
        print(f"=== GEMINI REC: {response.text[:200]} ===", flush=True)
        return json.loads(_extract_json(response.text))
    except Exception as e:
        print(f"=== GEMINI REC HATA: {type(e).__name__}: {str(e)[:200]} ===", flush=True)
        sorted_movies = sorted(movies_simple, key=lambda m: m.get("vote_average", 0), reverse=True)
        return {
            "analysis": "Yapay zeka şu an yoğun. Size bu türdeki en beğenilen filmler öneriliyor.",
            "recommendations": [
                {
                    "tmdb_id": m["tmdb_id"],
                    "reason": f"Bu alanda {m.get('vote_average', 0):.1f} puanıyla en çok beğenilen yapımlardan biri.",
                }
                for m in sorted_movies[:5]
            ],
        }
