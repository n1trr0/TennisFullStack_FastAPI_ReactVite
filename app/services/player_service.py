from uuid import UUID

from app.database import supabase

PLAYER_COLUMNS = "id,name_full,dob,hand,height,name_first,name_last,ioc3,ioc2"


def get_players() -> list[dict]:
    return supabase.table("players").select(PLAYER_COLUMNS).execute().data


def get_player(player_id: UUID) -> dict | None:
    data = (
        supabase.table("players")
        .select(PLAYER_COLUMNS)
        .eq("id", str(player_id))
        .limit(1)
        .execute()
        .data
    )
    return data[0] if data else None


def search_players_by_name(name: str) -> list[dict]:
    return (
        supabase.table("players")
        .select(PLAYER_COLUMNS)
        .ilike("name_full", f"%{name}%")
        .execute()
        .data
    )
