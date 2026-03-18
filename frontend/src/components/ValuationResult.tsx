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
          <span className={result.market_movement_pct >= 0 ? "positive" : "negative"}>
            Market Movement: {result.market_movement_pct >= 0 ? "+" : ""}
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
        <ol className="audit-trail">
          {result.audit_trail.map((step) => (
            <li key={step.step_number}>
              <strong>{step.description}</strong>
              <span className="step-value">{step.value}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="section">
        <h3>Data Sources</h3>
        <ul className="sources">
          {result.data_sources.map((source, i) => (
            <li key={i}>
              <strong>{source.name}</strong> &mdash; {source.description}
              <span className="source-date">Accessed: {source.accessed_date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
