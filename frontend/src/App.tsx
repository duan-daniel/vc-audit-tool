import { useState } from "react";
import ValuationForm from "./components/ValuationForm";
import ValuationResultView from "./components/ValuationResult";
import { createValuation } from "./api";
import type { ValuationRequest, ValuationResult } from "./types";
import "./App.css";

function App() {
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(request: ValuationRequest) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await createValuation(request);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>VC Audit Tool</h1>
        <p className="subtitle">
          Estimate fair value of private portfolio companies with full audit trail
        </p>
      </header>
      <main>
        <ValuationForm onSubmit={handleSubmit} loading={loading} />
        {error && <div className="error">{error}</div>}
        {result && <ValuationResultView result={result} />}
      </main>
    </div>
  );
}

export default App;
