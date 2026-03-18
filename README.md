# VC Audit Tool

A backend service (Python/FastAPI) with a React frontend that helps auditors estimate fair value of private portfolio companies. Every computation step is fully traceable via an audit trail.

## Approach

**Methodology: Last Round (Market-Adjusted) Valuation**

The tool takes a company's last funding round valuation and adjusts it by the movement of the NASDAQ Composite index between the round date and today. This provides a market-informed fair value estimate grounded in real public market data.

The user provides three inputs:
1. Company name
2. Last post-money valuation (USD)
3. Last round date

The system fetches real NASDAQ Composite prices via `yfinance`, computes the percentage change, and applies it to the valuation. Every step is recorded as a numbered audit step in the response.

## Design Decisions

| Decision | Rationale |
|---|---|
| **Single methodology** | Keeps the interface focused (3 fields) while demonstrating the full computation pipeline |
| **Real market data (yfinance)** | No API key needed; NASDAQ Composite data is freely available; makes the tool genuinely functional |
| **Strategy pattern base class** | `ValuationMethodology` ABC shows extensibility — new methodologies can be added without modifying existing code |
| **AuditStep as first-class field** | Every computation is numbered and traceable, which is the core requirement for auditors |
| **Stateless API, no database** | Sufficient for this scope; keeps deployment simple |
| **Graceful error handling** | Network failures and invalid dates return clear error messages |

## Architecture

```
React/Vite Frontend  -->  FastAPI Backend  -->  Valuation Engine
                                            -->  Market Data (yfinance)
```

### Backend (`backend/`)
- `main.py` — FastAPI app with CORS
- `api/routes.py` — POST `/api/valuations` endpoint
- `models/` — Pydantic request/response schemas
- `engine/base.py` — Abstract `ValuationMethodology` class
- `engine/last_round.py` — Market-adjusted valuation implementation
- `data/market_data.py` — NASDAQ Composite price fetching via yfinance
- `tests/` — Unit tests (engine math) and integration tests (API)

### Frontend (`frontend/`)
- `ValuationForm` — 3-field input form
- `ValuationResult` — Fair value display, explanation, audit trail, data sources

## Setup & Usage

### Backend

```bash
cd backend
pip install -e ".[dev]"
uvicorn main:app --reload
```

The API runs at http://localhost:8000. Swagger docs at http://localhost:8000/docs.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at http://localhost:5173.

### Run Tests

```bash
cd backend
pytest -v
```

## Possible Improvements

- **Additional methodologies** — DCF, comparable companies, weighted average of multiple approaches
- **Configurable market index** — Allow users to choose S&P 500, Russell 2000, or sector-specific indices
- **Discount/premium adjustments** — Apply illiquidity discount, control premium, or stage-based adjustments
- **Persistence** — Save valuations to a database for historical comparison
- **PDF export** — Generate audit-ready PDF reports
- **Authentication** — Role-based access for different auditor teams
