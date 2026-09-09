from uuid import UUID

from app.database import supabase

TOURNAMENT_COLUMNS = "tourney_id,tourney_name,level,country,ioc2,surface,prizepool,end_date,start_date,year"


def get_tournaments() -> list[dict]:
    return supabase.table("tournaments").select(TOURNAMENT_COLUMNS).execute().data


def get_tournament_names() -> list[str]:
    data = supabase.table("tournaments").select("tourney_name").execute().data
    names = {item["tourney_name"] for item in data if item.get("tourney_name")}
    return sorted(names)


def get_tournament(tournament_id: UUID) -> dict | None:
    data = (
        supabase.table("tournaments")
        .select(TOURNAMENT_COLUMNS)
        .eq("tourney_id", str(tournament_id))
        .limit(1)
        .execute()
        .data
    )
    return data[0] if data else None
