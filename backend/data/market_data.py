"""Market data provider using yfinance for NASDAQ Composite index prices."""

from datetime import date, timedelta

import yfinance as yf

NASDAQ_COMPOSITE_TICKER = "^IXIC"


class MarketDataError(Exception):
    """Raised when market data cannot be fetched."""


def get_index_price(target_date: date) -> tuple[float, date]:
    """Fetch the NASDAQ Composite close price on or nearest trading day to `target_date`.

    Returns:
        Tuple of (close_price, actual_date) — actual_date may differ from target_date
        if the target fell on a weekend or holiday.

    Raises:
        MarketDataError: If price data cannot be retrieved.
    """
    ticker = yf.Ticker(NASDAQ_COMPOSITE_TICKER)

    # Fetch a window around the target date to handle weekends/holidays
    start = target_date - timedelta(days=10)
    end = target_date + timedelta(days=1)

    try:
        hist = ticker.history(start=start.isoformat(), end=end.isoformat())
    except Exception as e:
        raise MarketDataError(f"Failed to fetch NASDAQ data: {e}") from e

    if hist.empty:
        raise MarketDataError(
            f"No NASDAQ Composite data available near {target_date.isoformat()}"
        )

    # Get the closest trading day on or before the target date
    hist.index = hist.index.tz_localize(None)
    mask = hist.index.date <= target_date
    if not mask.any():
        # Fall back to earliest available date in window
        row = hist.iloc[0]
    else:
        row = hist.loc[mask].iloc[-1]

    actual_date = row.name.date()
    close_price = float(row["Close"])
    return close_price, actual_date


def get_latest_index_price() -> tuple[float, date]:
    """Fetch the most recent NASDAQ Composite close price.

    Returns:
        Tuple of (close_price, date).

    Raises:
        MarketDataError: If price data cannot be retrieved.
    """
    ticker = yf.Ticker(NASDAQ_COMPOSITE_TICKER)

    try:
        hist = ticker.history(period="5d")
    except Exception as e:
        raise MarketDataError(f"Failed to fetch NASDAQ data: {e}") from e

    if hist.empty:
        raise MarketDataError("No recent NASDAQ Composite data available")

    row = hist.iloc[-1]
    hist.index = hist.index.tz_localize(None)
    actual_date = hist.index[-1].date()
    close_price = float(row["Close"])
    return close_price, actual_date
