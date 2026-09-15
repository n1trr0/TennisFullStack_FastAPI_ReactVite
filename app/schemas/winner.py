from pydantic import BaseModel, Field


class GrandSlamWinnerResponse(BaseModel):
    nombre: str
    torneo: str
    year: int = Field(serialization_alias="año", validation_alias="año")
    ioc3: str