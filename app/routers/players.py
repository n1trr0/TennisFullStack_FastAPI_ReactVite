from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.routers._errors import raise_database_error
from app.schemas.match import MatchResponse
from app.schemas.player import PlayerResponse
from app.schemas.ranking import RankingResponse
from app.services import match_service, player_service, ranking_service

router = APIRouter(prefix="/players", tags=["Players"])


@router.get("", response_model=list[PlayerResponse])
def list_players() -> list[dict]:
    try:
        return player_service.get_players()
    except Exception as error:
        raise_database_error(error)


@router.get("/{player_id:uuid}", response_model=PlayerResponse)
def read_player(player_id: UUID) -> dict:
    try:
        player = player_service.get_player(player_id)
    except Exception as error:
        raise_database_error(error)

    if player is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.get("/{name}", response_model=list[PlayerResponse])
def search_players_by_name(name: str) -> list[dict]:
    try:
        return player_service.search_players_by_name(name)
    except Exception as error:
        raise_database_error(error)


@router.get("/{player_id}/matches", response_model=list[MatchResponse])
def list_player_matches(player_id: UUID) -> list[dict]:
    try:
        return match_service.get_player_matches(player_id)
    except Exception as error:
        raise_database_error(error)


@router.get("/{player_id}/rankings", response_model=list[RankingResponse])
def list_player_rankings(player_id: UUID) -> list[dict]:
    try:
        return ranking_service.get_player_rankings(player_id)
    except Exception as error:
        raise_database_error(error)
