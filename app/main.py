from fastapi import FastAPI, HTTPException

from app.database import supabase
from app.routers import matches, players, rankings, tournaments, winners

app = FastAPI(title="Tennis API", version="0.1.0")

app.include_router(players.router)
app.include_router(matches.router)
app.include_router(tournaments.router)
app.include_router(rankings.router)
app.include_router(winners.router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Tennis API is running"}


@app.get("/health/supabase")
def supabase_health() -> dict[str, str]:
    try:
        supabase.table("players").select("id").limit(1).execute()
    except Exception as error:
        raise HTTPException(
            status_code=503,
            detail="Supabase is unavailable",
        ) from error

    return {"status": "ok", "service": "supabase"}
