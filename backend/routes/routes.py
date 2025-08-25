from fastapi import APIRouter
from controllers.controllers import (
    get_all_areas,
    get_areas_rental_yield,
    get_vacancy_risk_price_growth,
    get_transactions_total_value,
)

router = APIRouter()


@router.get("/areas")
def fetch_areas(
    offset: int = 0,
    limit: int = 20,
    search: str = None,
):
    return get_all_areas(offset=offset, limit=limit, search=search)


@router.get("/areas-rental-yield")
def fetch_areas_rental_yield(offset: int = 0, limit: int = 5):
    return get_areas_rental_yield(offset=offset, limit=limit)


@router.get("/areas-price-growth-vacancy-risk")
def fetch_areas_price_growth_vacancy_risk(
    offset: int = 0, limit: int = 5, search: str = None
):
    return get_vacancy_risk_price_growth(offset=offset, limit=limit, search=search)


@router.get("/areas-transactions-total-value")
def fetch_areas_transactions_total_value(
    offset: int = 0, limit: int = 20, search: str = None
):
    return get_transactions_total_value(offset=offset, limit=limit, search=search)
