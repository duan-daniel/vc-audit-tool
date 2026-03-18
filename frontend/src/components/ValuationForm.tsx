import { useState } from "react";
import type { ValuationRequest } from "../types";

interface Props {
  onSubmit: (request: ValuationRequest) => void;
  loading: boolean;
}

type Unit = "B" | "M" | "$";

const UNIT_MULTIPLIERS: Record<Unit, number> = {
  B: 1_000_000_000,
  M: 1_000_000,
  $: 1,
};

const UNIT_PLACEHOLDERS: Record<Unit, string> = {
  B: "e.g. 1.5",
  M: "e.g. 50",
  $: "e.g. 50,000,000",
};

function formatWithCommas(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
}

function rawValue(display: string): string {
  return display.replace(/,/g, "");
}

export default function ValuationForm({ onSubmit, loading }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [valuation, setValuation] = useState("");
  const [unit, setUnit] = useState<Unit>("M");
  const [roundDate, setRoundDate] = useState("");

  const numericValue = parseFloat(rawValue(valuation)) || 0;
  const absoluteValue = numericValue * UNIT_MULTIPLIERS[unit];

  function handleValuationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/,/g, "");
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      setValuation(formatWithCommas(raw));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      company_name: companyName,
      last_post_money_valuation: absoluteValue,
      last_round_date: roundDate,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label htmlFor="company">Company Name</label>
        <input
          id="company"
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="e.g. Basis AI"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="valuation">Last Post-Money Valuation</label>
        <div className="valuation-input-group">
          <span className="input-prefix">$</span>
          <input
            id="valuation"
            type="text"
            inputMode="decimal"
            value={valuation}
            onChange={handleValuationChange}
            placeholder={UNIT_PLACEHOLDERS[unit]}
            required
            className="valuation-input"
          />
          <div className="unit-toggle">
            {(["B", "M", "$"] as Unit[]).map((u) => (
              <button
                key={u}
                type="button"
                className={`unit-btn ${unit === u ? "unit-btn-active" : ""}`}
                onClick={() => setUnit(u)}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        {numericValue > 0 && (
          <div className="valuation-preview">
            = ${absoluteValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        )}
      </div>
      <div className="field">
        <label htmlFor="date">Last Round Date</label>
        <input
          id="date"
          type="date"
          value={roundDate}
          onChange={(e) => setRoundDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          required
        />
      </div>
      <button type="submit" disabled={loading || numericValue <= 0}>
        {loading ? "Computing..." : "Compute Fair Value"}
      </button>
    </form>
  );
}
