import { useState } from "react";
import type { ValuationRequest } from "../types";

interface Props {
  onSubmit: (request: ValuationRequest) => void;
  loading: boolean;
}

export default function ValuationForm({ onSubmit, loading }: Props) {
  const [companyName, setCompanyName] = useState("");
  const [valuation, setValuation] = useState("");
  const [roundDate, setRoundDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      company_name: companyName,
      last_post_money_valuation: parseFloat(valuation),
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
        <label htmlFor="valuation">Last Post-Money Valuation (USD)</label>
        <input
          id="valuation"
          type="number"
          value={valuation}
          onChange={(e) => setValuation(e.target.value)}
          placeholder="e.g. 50000000"
          min="1"
          step="any"
          required
        />
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
      <button type="submit" disabled={loading}>
        {loading ? "Computing..." : "Compute Fair Value"}
      </button>
    </form>
  );
}
