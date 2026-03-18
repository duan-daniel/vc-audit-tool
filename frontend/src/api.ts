import type { ValuationRequest, ValuationResult } from "./types";

const API_BASE = "http://localhost:8000";

export async function createValuation(
  request: ValuationRequest
): Promise<ValuationResult> {
  const resp = await fetch(`${API_BASE}/api/valuations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => null);
    const detail = body?.detail;
    if (typeof detail === "string") {
      throw new Error(detail);
    }
    if (Array.isArray(detail)) {
      throw new Error(detail.map((d: { msg: string }) => d.msg).join("; "));
    }
    throw new Error(`Request failed (${resp.status})`);
  }

  return resp.json();
}
