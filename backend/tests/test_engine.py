"""Unit tests for valuation engine."""

from datetime import date
from unittest.mock import patch

import pytest

from engine.last_round import LastRoundValuation, _fmt_usd, _fmt_pct
from models.requests import ValuationRequest


@pytest.fixture
def engine():
    return LastRoundValuation()


@pytest.fixture
def sample_request():
    return ValuationRequest(
        company_name="Acme Corp",
        last_post_money_valuation=50_000_000,
        last_round_date=date(2024, 6, 15),
    )


class TestFormatting:
    def test_fmt_usd_millions(self):
        assert _fmt_usd(50_000_000) == "$50.00M"

    def test_fmt_usd_billions(self):
        assert _fmt_usd(1_500_000_000) == "$1.50B"

    def test_fmt_usd_small(self):
        assert _fmt_usd(999_999) == "$999,999.00"

    def test_fmt_pct_positive(self):
        assert _fmt_pct(12.5) == "+12.50%"

    def test_fmt_pct_negative(self):
        assert _fmt_pct(-3.2) == "-3.20%"


class TestLastRoundValuation:
    def test_name(self, engine):
        assert engine.name == "Last Round (Market-Adjusted)"

    def test_future_date_rejected(self, engine):
        req = ValuationRequest(
            company_name="Test",
            last_post_money_valuation=1_000_000,
            last_round_date=date(2099, 1, 1),
        )
        with pytest.raises(ValueError, match="past"):
            engine.validate_input(req)

    @patch("engine.last_round.get_latest_index_price")
    @patch("engine.last_round.get_index_price")
    def test_market_up_increases_valuation(
        self, mock_round, mock_latest, engine, sample_request
    ):
        mock_round.return_value = (15000.0, date(2024, 6, 14))
        mock_latest.return_value = (16500.0, date(2025, 3, 14))

        result = engine.execute(sample_request)

        # 10% increase: 50M * 1.10 = 55M
        assert result.fair_value_usd == 55_000_000.0
        assert result.market_movement_pct == 10.0
        assert result.methodology == "Last Round (Market-Adjusted)"
        assert len(result.audit_trail) == 6
        assert len(result.data_sources) == 2

    @patch("engine.last_round.get_latest_index_price")
    @patch("engine.last_round.get_index_price")
    def test_market_down_decreases_valuation(
        self, mock_round, mock_latest, engine, sample_request
    ):
        mock_round.return_value = (15000.0, date(2024, 6, 14))
        mock_latest.return_value = (12000.0, date(2025, 3, 14))

        result = engine.execute(sample_request)

        # -20% decrease: 50M * 0.80 = 40M
        assert result.fair_value_usd == 40_000_000.0
        assert result.market_movement_pct == -20.0

    @patch("engine.last_round.get_latest_index_price")
    @patch("engine.last_round.get_index_price")
    def test_audit_trail_complete(
        self, mock_round, mock_latest, engine, sample_request
    ):
        mock_round.return_value = (15000.0, date(2024, 6, 14))
        mock_latest.return_value = (15000.0, date(2025, 3, 14))

        result = engine.execute(sample_request)

        steps = result.audit_trail
        assert steps[0].step_number == 1
        assert "Acme Corp" in steps[0].value
        assert steps[1].step_number == 2
        assert "15,000.00" in steps[1].value
        assert steps[5].step_number == 6
        assert result.explanation == steps[5].value
