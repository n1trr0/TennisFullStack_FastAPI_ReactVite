from fastapi import APIRouter

from app.routers._errors import raise_database_error
from app.schemas.winner import GrandSlamWinnerResponse
from app.services import winner_service

router = APIRouter(prefix="/winners", tags=["Winners"])


@router.get("/grandslam", response_model=list[GrandSlamWinnerResponse])
def list_grand_slam_winners() -> list[dict]:
    try:
        return winner_service.get_grand_slam_winners()
    except Exception as error:
        raise_database_error(error)