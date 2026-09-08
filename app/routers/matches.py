from datetime import date
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.routers._errors import raise_database_error
from app.schemas.match import MatchResponse, TodayMatchResponse
from app.services import match_service, player_service, tournament_service

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.get("", response_model=list[MatchResponse])
def list_matches() -> list[dict]:
    try:
        return match_service.get_matches()
    except Exception as error:
        raise_database_error(error)


@router.get("/today", response_model=TodayMatchResponse)
def get_today_game() -> dict:
    today = date.today()

    try:
        matches = match_service.get_matches()
    except Exception as error:
        raise_database_error(error)

    if not matches:
        raise HTTPException(status_code=404, detail="No matches available")

    matches = sorted(matches, key=lambda match: str(match["match_id"]))
    match = matches[today.toordinal() % len(matches)]

    try:
        winner = player_service.get_player(match["winner_id"])
        loser = player_service.get_player(match["loser_id"])
        tournament = tournament_service.get_tournament(match["tourney_id"])
    except Exception as error:
        raise_database_error(error)

    return {
        "winner": winner["name_full"] if winner else None,
        "winner_ioc3": winner["ioc3"] if winner else None,
        "loser": loser["name_full"] if loser else None,
        "loser_ioc3": loser["ioc3"] if loser else None,
        "tournament_name": tournament["tourney_name"] if tournament else None,
        "tournament_level": tournament["level"] if tournament else None,
        "round": match["round"],
        "year": match["tourney_year"],
        "result": match["score"],
        "minutes": match["minutes"],
    }


@router.get("/{match_id}", response_model=MatchResponse)
def read_match(match_id: UUID) -> dict:
    try:
        match = match_service.get_match(match_id)
    except Exception as error:
        raise_database_error(error)

    if match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    return match
