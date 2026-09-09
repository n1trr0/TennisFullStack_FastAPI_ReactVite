from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.routers._errors import raise_database_error
from app.schemas.tournament import TournamentNameLevelResponse, TournamentResponse
from app.services import tournament_service

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])


@router.get("", response_model=list[TournamentResponse])
def list_tournaments() -> list[dict]:
    try:
        return tournament_service.get_tournaments()
    except Exception as error:
        raise_database_error(error)


@router.get("/name", response_model=list[str])
def list_tournament_names() -> list[str]:
    try:
        return tournament_service.get_tournament_names()
    except Exception as error:
        raise_database_error(error)


@router.get("/name/level", response_model=list[TournamentNameLevelResponse])
def list_tournament_names_and_levels() -> list[dict]:
    try:
        return tournament_service.get_tournament_names_and_levels()
    except Exception as error:
        raise_database_error(error)


@router.get("/{tournament_id}", response_model=TournamentResponse)
def read_tournament(tournament_id: UUID) -> dict:
    try:
        tournament = tournament_service.get_tournament(tournament_id)
    except Exception as error:
        raise_database_error(error)

    if tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament
