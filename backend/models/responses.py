from datetime import date

from pydantic import BaseModel


class AuditStep(BaseModel):
    """A single traceable computation step in the valuation."""

    step_number: int
    description: str
    value: str


class DataSource(BaseModel):
    """A data source used in the valuation."""

    name: str
    description: str
    accessed_date: date


class ValuationResult(BaseModel):
    """Complete valuation output with audit trail."""

    company_name: str
    methodology: str
    fair_value_usd: float
    last_post_money_valuation: float
    last_round_date: date
    market_movement_pct: float
    explanation: str
    audit_trail: list[AuditStep]
    data_sources: list[DataSource]
