from datetime import date
from uuid import UUID

from pydantic import BaseModel


class TournamentResponse(BaseModel):
    tourney_id: UUID
    tourney_name: str
    level: str | None
    country: str | None
    ioc2: str | None
    surface: str
    prizepool: int | None
    end_date: date | None
    start_date: date | None
    year: int


class TournamentNameLevelResponse(BaseModel):
    tourney_name: str
    level: str | None
