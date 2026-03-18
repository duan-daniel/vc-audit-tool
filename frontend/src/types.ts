export interface ValuationRequest {
  company_name: string;
  last_post_money_valuation: number;
  last_round_date: string; // ISO date string
}

export interface AuditStep {
  step_number: number;
  description: string;
  value: string;
}

export interface DataSource {
  name: string;
  description: string;
  accessed_date: string;
  url: string | null;
}

export interface ValuationResult {
  company_name: string;
  methodology: string;
  fair_value_usd: number;
  last_post_money_valuation: number;
  last_round_date: string;
  market_movement_pct: number;
  explanation: string;
  audit_trail: AuditStep[];
  data_sources: DataSource[];
}
