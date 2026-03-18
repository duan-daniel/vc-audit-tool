"""Last Round (Market-Adjusted) Valuation methodology."""

from datetime import date

from data.market_data import get_index_price, get_latest_index_price
from engine.base import ValuationMethodology
from models.requests import ValuationRequest
from models.responses import AuditStep, DataSource, ValuationResult


def _fmt_usd(value: float) -> str:
    if value >= 1_000_000_000:
        return f"${value / 1_000_000_000:,.2f}B"
    if value >= 1_000_000:
        return f"${value / 1_000_000:,.2f}M"
    return f"${value:,.2f}"


def _fmt_pct(value: float) -> str:
    return f"{value:+.2f}%"


class LastRoundValuation(ValuationMethodology):
    """Adjusts the last funding round valuation by public market index movement.

    Uses the NASDAQ Composite as a proxy for broad tech-market conditions.
    """

    @property
    def name(self) -> str:
        return "Last Round (Market-Adjusted)"

    def validate_input(self, request: ValuationRequest) -> None:
        if request.last_round_date >= date.today():
            raise ValueError("Last round date must be in the past")

    def execute(self, request: ValuationRequest) -> ValuationResult:
        self.validate_input(request)

        audit: list[AuditStep] = []
        sources: list[DataSource] = []

        # Step 1: Record inputs
        audit.append(AuditStep(
            step_number=1,
            description="Record inputs",
            value=(
                f"Company: {request.company_name}, "
                f"Last post-money valuation: {_fmt_usd(request.last_post_money_valuation)}, "
                f"Last round date: {request.last_round_date.isoformat()}"
            ),
        ))

        # Step 2: Fetch index price at round date
        round_price, round_actual_date = get_index_price(request.last_round_date)
        audit.append(AuditStep(
            step_number=2,
            description="Fetch NASDAQ Composite close price at last round date",
            value=(
                f"NASDAQ Composite on {round_actual_date.isoformat()}: "
                f"{round_price:,.2f}"
            ),
        ))
        sources.append(DataSource(
            name="NASDAQ Composite (^IXIC)",
            description=f"Close price on {round_actual_date.isoformat()} via Yahoo Finance",
            accessed_date=date.today(),
            url="https://finance.yahoo.com/quote/%5EIXIC/history/",
        ))

        # Step 3: Fetch latest index price
        today_price, today_actual_date = get_latest_index_price()
        audit.append(AuditStep(
            step_number=3,
            description="Fetch most recent NASDAQ Composite close price",
            value=(
                f"NASDAQ Composite on {today_actual_date.isoformat()}: "
                f"{today_price:,.2f}"
            ),
        ))
        sources.append(DataSource(
            name="NASDAQ Composite (^IXIC)",
            description=f"Close price on {today_actual_date.isoformat()} via Yahoo Finance",
            accessed_date=date.today(),
            url="https://finance.yahoo.com/quote/%5EIXIC/history/",
        ))

        # Step 4: Compute market movement
        pct_change = (today_price - round_price) / round_price * 100
        audit.append(AuditStep(
            step_number=4,
            description="Compute market movement percentage",
            value=(
                f"({today_price:,.2f} - {round_price:,.2f}) / {round_price:,.2f} "
                f"= {_fmt_pct(pct_change)}"
            ),
        ))

        # Step 5: Apply adjustment
        adjusted_value = request.last_post_money_valuation * (1 + pct_change / 100)
        audit.append(AuditStep(
            step_number=5,
            description="Apply market adjustment to last post-money valuation",
            value=(
                f"{_fmt_usd(request.last_post_money_valuation)} x "
                f"(1 + {pct_change / 100:.4f}) = {_fmt_usd(adjusted_value)}"
            ),
        ))

        # Step 6: Generate explanation
        explanation = (
            f"The NASDAQ Composite moved {_fmt_pct(pct_change)} between "
            f"{round_actual_date.isoformat()} and {today_actual_date.isoformat()}. "
            f"Applying this market adjustment to the "
            f"{_fmt_usd(request.last_post_money_valuation)} post-money valuation "
            f"from {request.company_name}'s last round yields an adjusted "
            f"fair value estimate of {_fmt_usd(adjusted_value)}."
        )
        audit.append(AuditStep(
            step_number=6,
            description="Generate explanation",
            value=explanation,
        ))

        return ValuationResult(
            company_name=request.company_name,
            methodology=self.name,
            fair_value_usd=round(adjusted_value, 2),
            last_post_money_valuation=request.last_post_money_valuation,
            last_round_date=request.last_round_date,
            market_movement_pct=round(pct_change, 4),
            explanation=explanation,
            audit_trail=audit,
            data_sources=sources,
        )
