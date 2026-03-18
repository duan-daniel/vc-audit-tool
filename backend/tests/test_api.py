"""Integration tests for API endpoints."""

from datetime import date
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


@patch("engine.last_round.get_latest_index_price")
@patch("engine.last_round.get_index_price")
class TestValuationEndpoint:
    def test_successful_valuation(self, mock_round, mock_latest):
        mock_round.return_value = (15000.0, date(2024, 6, 14))
        mock_latest.return_value = (16500.0, date(2025, 3, 14))

        resp = client.post("/api/valuations", json={
            "company_name": "Basis AI",
            "last_post_money_valuation": 50_000_000,
            "last_round_date": "2024-06-15",
        })

        assert resp.status_code == 200
        body = resp.json()
        assert body["company_name"] == "Basis AI"
        assert body["fair_value_usd"] == 55_000_000.0
        assert body["methodology"] == "Last Round (Market-Adjusted)"
        assert len(body["audit_trail"]) == 6
        assert len(body["data_sources"]) == 2

    def test_missing_field(self, mock_round, mock_latest):
        resp = client.post("/api/valuations", json={
            "company_name": "Test",
        })
        assert resp.status_code == 422

    def test_negative_valuation(self, mock_round, mock_latest):
        resp = client.post("/api/valuations", json={
            "company_name": "Test",
            "last_post_money_valuation": -100,
            "last_round_date": "2024-01-01",
        })
        assert resp.status_code == 422

    def test_empty_company_name(self, mock_round, mock_latest):
        resp = client.post("/api/valuations", json={
            "company_name": "",
            "last_post_money_valuation": 1_000_000,
            "last_round_date": "2024-01-01",
        })
        assert resp.status_code == 422

    def test_future_date_rejected(self, mock_round, mock_latest):
        resp = client.post("/api/valuations", json={
            "company_name": "Test",
            "last_post_money_valuation": 1_000_000,
            "last_round_date": "2099-01-01",
        })
        assert resp.status_code == 422
