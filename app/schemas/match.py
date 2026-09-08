from uuid import UUID

from pydantic import BaseModel


class MatchResponse(BaseModel):
    match_id: UUID
    tourney_id: UUID | None
    surface: str | None
    tourney_name: str | None
    tourney_year: int | None
    winner_id: UUID | None
    winner_seed: int | None
    winner_entry: str | None
    loser_id: UUID | None
    loser_seed: int | None
    loser_entry: str | None
    score: str | None
    best_of: int | None
    round: str | None
    minutes: int | None
    w_ace: int | None
    w_df: int | None
    w_svpt: int | None
    w_1stIn: int | None
    w_1stWon: int | None
    w_2ndWon: int | None
    w_bpSaved: int | None
    w_bpFaced: float | None
    w_SvGms: int | None
    l_ace: int | None
    l_df: int | None
    l_svpt: int | None
    l_1stIn: int | None
    l_1stWon: int | None
    l_2ndWon: int | None
    l_bpSaved: float | None
    l_bpFaced: int | None
    l_SvGms: int | None
    winner_rank: int | None
    loser_rank: int | None
    winner_rank_points: int | None
    loser_rank_points: int | None


class TodayMatchResponse(BaseModel):
    winner: str | None
    winner_ioc3: str | None
    loser: str | None
    loser_ioc3: str | None
    tournament_name: str | None
    tournament_level: str | None
    round: str | None
    year: int | None
    result: str | None
    minutes: int | None
