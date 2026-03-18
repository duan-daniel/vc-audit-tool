import type { ValuationResult as Result } from "../types";

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface Props {
  result: Result;
}

export default function ValuationResult({ result }: Props) {
  const isPositive = result.market_movement_pct >= 0;

  return (
    <div className="result">
      <div className="result-header">
        <h2>{result.company_name}</h2>
        <div className="fair-value">
          <span className="label">Estimated Fair Value</span>
          <span className="value">{formatUSD(result.fair_value_usd)}</span>
        </div>
        <div className="meta">
          <span>Methodology: {result.methodology}</span>
          <span className={isPositive ? "positive" : "negative"}>
            Market Movement: {isPositive ? "+" : ""}
            {result.market_movement_pct.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="section">
        <h3>Explanation</h3>
        <p className="explanation">{result.explanation}</p>
      </div>

      <div className="section">
        <h3>Audit Trail</h3>
        <div className="audit-timeline">
          {result.audit_trail.map((step) => {
            const isFormula = step.step_number === 4 || step.step_number === 5;
            const isMarket = step.step_number === 4;

            return (
              <div key={step.step_number} className="audit-step">
                <div className="step-connector">
                  <span className={`step-badge ${isMarket ? (isPositive ? "step-badge-positive" : "step-badge-negative") : ""}`}>
                    {step.step_number}
                  </span>
                  {step.step_number < result.audit_trail.length && (
                    <div className="step-line" />
                  )}
                </div>
                <div className={`step-content ${isMarket ? (isPositive ? "step-card-positive" : "step-card-negative") : ""}`}>
                  <div className="step-description">{step.description}</div>
                  <div className={`step-value ${isFormula ? "step-formula" : ""}`}>
                    {step.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h3>Data Sources</h3>
        <ul className="sources">
          {result.data_sources.map((source, i) => (
            <li key={i}>
              {source.url ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                  {source.name}
                </a>
              ) : (
                <strong>{source.name}</strong>
              )}
              {" "}&mdash; {source.description}
              <span className="source-date">Accessed: {source.accessed_date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
