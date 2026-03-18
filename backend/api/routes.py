"""API route definitions."""

from fastapi import APIRouter, HTTPException

from data.market_data import MarketDataError
from engine.last_round import LastRoundValuation
from models.requests import ValuationRequest
from models.responses import ValuationResult

router = APIRouter(prefix="/api")

_engine = LastRoundValuation()


@router.post("/valuations", response_model=ValuationResult)
def create_valuation(request: ValuationRequest) -> ValuationResult:
    """Compute a fair-value estimate for a portfolio company.

    Returns a fully-audited valuation result with step-by-step computation trail.
    """
    try:
        return _engine.execute(request)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except MarketDataError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
