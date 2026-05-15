import json
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

MOOD_ANALYSIS_PROMPT = """
Kullanicinin asagidaki mesajini analiz et ve hangi tur filmler onereceğini belirle.

Kullanici mesaji: "{prompt}"

Yanitini SADECE su JSON formatinda ver, baska hicbir sey yazma:
{{
  "mood_summary": "kullanicinin ruh halinin kisa ozeti (Turkce, 1 cumle)",
  "genre_ids": [TMDB tur ID leri, en fazla 3 tane],
  "keywords": ["arama anahtar kelimeleri", "en fazla 3 tane"],
  "sort_by": "popularity.desc veya vote_average.desc"
}}

TMDB Tur ID Referansi:
28=Aksiyon, 12=Macera, 16=Animasyon, 35=Komedi, 80=Suc, 99=Belgesel,
18=Drama, 10751=Aile, 14=Fantezi, 27=Korku, 9648=Gizem,
10749=Romantik, 878=Bilim Kurgu, 53=Gerilim, 37=Western
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

Onemli: Sadece yukaridaki listeden sec. Listede olmayan film ekleme.
"""


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
        response = model.generate_content(MOOD_ANALYSIS_PROMPT.format(prompt=prompt))
        return json.loads(_extract_json(response.text))
    except Exception:
        return {
            "mood_summary": "Genel oneri",
            "genre_ids": [18, 35],
            "keywords": [],
            "sort_by": "popularity.desc",
        }


async def generate_recommendations(prompt: str, movies: list) -> dict:
    movies_simple = [
        {
            "tmdb_id": m.get("id") or m.get("tmdb_id"),
            "title": m.get("title") or m.get("name"),
            "overview": (m.get("overview", "")[:200] + "...") if m.get("overview") else "",
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
        response = model.generate_content(formatted)
        return json.loads(_extract_json(response.text))
    except Exception:
        return {
            "analysis": "Size populer filmler oneriyorum.",
            "recommendations": [
                {"tmdb_id": m["tmdb_id"], "reason": "Populer ve begenilen bir yapim."}
                for m in movies_simple[:5]
            ],
        }
