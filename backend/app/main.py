from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, movies, recommendations, watchlist

app = FastAPI(title="Film Öneri Sistemi API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(recommendations.router)
app.include_router(watchlist.router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
