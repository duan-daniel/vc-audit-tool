import type { ValuationResult as Result, DataSource } from "../types";

function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Deduplicate data sources by URL, merging descriptions. */
function deduplicateSources(sources: DataSource[]): DataSource[] {
  const seen = new Map<string, DataSource>();
  for (const s of sources) {
    const key = s.url ?? s.name;
    if (!seen.has(key)) {
      seen.set(key, { ...s });
    } else {
      const existing = seen.get(key)!;
      if (!existing.description.includes(s.description)) {
        existing.description += `; ${s.description}`;
      }
    }
  }
  return [...seen.values()];
}

interface Props {
  result: Result;
}

export default function ValuationResult({ result }: Props) {
  const isPositive = result.market_movement_pct >= 0;
  const uniqueSources = deduplicateSources(result.data_sources);

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
                  <StepValue step={step.step_number} value={step.value} isFormula={isFormula} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h3>Data Sources</h3>
        <ul className="sources">
          {uniqueSources.map((source, i) => (
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

/** Renders step values with structured formatting based on step type. */
function StepValue({ step, value, isFormula }: { step: number; value: string; isFormula: boolean }) {
  // Step 1: key-value pairs separated by commas
  if (step === 1) {
    const pairs = value.split(", ").map((pair) => {
      const [label, ...rest] = pair.split(": ");
      const val = rest.join(": ");
      return { label, val };
    });
    return (
      <div className="step-kv-list">
        {pairs.map((p, i) => (
          <div key={i} className="step-kv">
            <span className="step-kv-label">{p.label}</span>
            <span className="step-kv-val">{p.val}</span>
          </div>
        ))}
      </div>
    );
  }

  // Steps 2 & 3: "NASDAQ Composite on DATE: NUMBER"
  if (step === 2 || step === 3) {
    const match = value.match(/^(.+?):\s*([\d,]+\.?\d*)$/);
    if (match) {
      return (
        <div className="step-value">
          <span className="step-kv-label">{match[1]}</span>
          <span className="step-number">{match[2]}</span>
        </div>
      );
    }
  }

  // Steps 4 & 5: formula
  if (isFormula) {
    return <div className="step-value step-formula">{value}</div>;
  }

  // Step 6 / default
  return <div className="step-value">{value}</div>;
}
