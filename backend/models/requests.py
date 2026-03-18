from datetime import date

from pydantic import BaseModel, Field


class ValuationRequest(BaseModel):
    """Input for a valuation calculation."""

    company_name: str = Field(min_length=1, description="Name of the portfolio company")
    last_post_money_valuation: float = Field(
        gt=0, description="Post-money valuation from the last funding round (USD)"
    )
    last_round_date: date = Field(description="Date of the last funding round")
