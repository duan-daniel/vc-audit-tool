"""Abstract base class for valuation methodologies."""

from abc import ABC, abstractmethod

from models.requests import ValuationRequest
from models.responses import ValuationResult


class ValuationMethodology(ABC):
    """Base class for a valuation methodology.

    Each methodology must validate inputs and execute the valuation,
    recording every computation step in the audit trail.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of this methodology."""

    @abstractmethod
    def validate_input(self, request: ValuationRequest) -> None:
        """Validate that the request is suitable for this methodology.

        Raises:
            ValueError: If inputs are invalid for this methodology.
        """

    @abstractmethod
    def execute(self, request: ValuationRequest) -> ValuationResult:
        """Run the valuation and return a fully-audited result.

        Raises:
            ValueError: If inputs are invalid.
            data.market_data.MarketDataError: If market data cannot be fetched.
        """
