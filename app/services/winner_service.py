from app.database import supabase


EUROPEAN_IOC3 = {
    "AUT", "BEL", "BIH", "BLR", "BUL", "CRO", "CYP", "CZE", "DEN",
    "ESP", "EST", "FIN", "FRA", "GBR", "GEO", "GER", "GRE", "HUN",
    "IRL", "ISL", "ITA", "KAZ", "LAT", "LTU", "LUX", "MDA", "MKD",
    "MNE", "NED", "NOR", "POL", "POR", "ROU", "RUS", "SLO", "SRB",
    "SUI", "SVK", "SWE", "TUR", "UKR",
}

SOUTH_AMERICAN_IOC3 = {
    "ARG", "BOL", "BRA", "CHI", "COL", "ECU", "GUY", "PAR", "PER",
    "SUR", "URU", "VEN",
}


def get_region(ioc3: str) -> str:
    if ioc3 == "USA":
        return "USA"
    if ioc3 == "AUS":
        return "Australia"
    if ioc3 in SOUTH_AMERICAN_IOC3:
        return "South America"
    if ioc3 in EUROPEAN_IOC3:
        return "Europe"
    return "Other"


def get_grand_slam_winners() -> list[dict]:
    tournaments = (
        supabase.table("tournaments")
        .select("tourney_id,tourney_name,year")
        .eq("level", "Grand Slam")
        .execute()
        .data
    )
    tournament_by_id = {item["tourney_id"]: item for item in tournaments}
    if not tournament_by_id:
        return []

    finals = (
        supabase.table("matches")
        .select("tourney_id,winner_id")
        .in_("tourney_id", list(tournament_by_id))
        .eq("round", "F")
        .execute()
        .data
    )
    winner_ids = {final["winner_id"] for final in finals if final.get("winner_id")}
    if not winner_ids:
        return []

    players = (
        supabase.table("players")
        .select("id,name_full,ioc3")
        .in_("id", list(winner_ids))
        .execute()
        .data
    )
    player_by_id = {player["id"]: player for player in players}

    winners = []
    for final in finals:
        tournament = tournament_by_id.get(final["tourney_id"])
        player = player_by_id.get(final.get("winner_id"))
        if not tournament or not player:
            continue
        winners.append(
            {
                "nombre": player["name_full"],
                "torneo": tournament["tourney_name"],
                "año": tournament["year"],
                "ioc3": player["ioc3"],
                "region": get_region(player["ioc3"]),
            }
        )

    return sorted(winners, key=lambda winner: winner["año"], reverse=True)