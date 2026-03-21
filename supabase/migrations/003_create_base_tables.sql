-- =========================================================================
-- LIFESTACK OS — Migration 003
-- Create base tables (idempotent — safe to run if tables already exist)
-- These are the 14 tables that Migration 001 adds updated_at columns to.
-- Run this FIRST if your Supabase project is brand-new.
-- =========================================================================

-- 1. portfolio_config — global portfolio settings
CREATE TABLE IF NOT EXISTS portfolio_config (
  id              BIGSERIAL PRIMARY KEY,
  target_allocation JSONB  DEFAULT '{}',
  risk_profile    TEXT    DEFAULT 'moderate',
  fire_target     NUMERIC DEFAULT 0,
  annual_spend    NUMERIC DEFAULT 0,
  currency        TEXT    DEFAULT 'GBP',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. holdings — individual position rows
CREATE TABLE IF NOT EXISTS holdings (
  id              BIGSERIAL PRIMARY KEY,
  ticker          TEXT    NOT NULL,
  name            TEXT,
  asset_class     TEXT    DEFAULT 'equity',
  wrapper         TEXT    DEFAULT 'GIA',
  currency        TEXT    DEFAULT 'GBP',
  quantity        NUMERIC DEFAULT 0,
  cost_basis      NUMERIC DEFAULT 0,
  current_price   NUMERIC DEFAULT 0,
  market_value    NUMERIC GENERATED ALWAYS AS (quantity * current_price) STORED,
  weight          NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON holdings (ticker);
CREATE INDEX IF NOT EXISTS idx_holdings_wrapper ON holdings (wrapper);
CREATE INDEX IF NOT EXISTS idx_holdings_asset_class ON holdings (asset_class);

-- 3. net_worth_history — weekly NW snapshots for trajectory chart
CREATE TABLE IF NOT EXISTS net_worth_history (
  id              BIGSERIAL PRIMARY KEY,
  snapshot_date   DATE    NOT NULL UNIQUE,
  total_assets    NUMERIC DEFAULT 0,
  total_liabilities NUMERIC DEFAULT 0,
  net_worth       NUMERIC GENERATED ALWAYS AS (total_assets - total_liabilities) STORED,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nw_history_date ON net_worth_history (snapshot_date DESC);

-- 4. nw_bridge — waterfall bridge items for performance attribution
CREATE TABLE IF NOT EXISTS nw_bridge (
  id              BIGSERIAL PRIMARY KEY,
  period_start    DATE    NOT NULL,
  period_end      DATE    NOT NULL,
  category        TEXT    NOT NULL,
  label           TEXT    NOT NULL,
  amount          NUMERIC NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. risk_metrics — portfolio risk calculations
CREATE TABLE IF NOT EXISTS risk_metrics (
  id              BIGSERIAL PRIMARY KEY,
  metric_date     DATE    NOT NULL DEFAULT CURRENT_DATE,
  volatility_1y   NUMERIC,
  sharpe_ratio    NUMERIC,
  max_drawdown    NUMERIC,
  var_95          NUMERIC,
  beta            NUMERIC,
  correlation_spy NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. crypto_metrics — crypto-specific analytics
CREATE TABLE IF NOT EXISTS crypto_metrics (
  id              BIGSERIAL PRIMARY KEY,
  metric_date     DATE    NOT NULL DEFAULT CURRENT_DATE,
  btc_dominance   NUMERIC,
  fear_greed      NUMERIC,
  mvrv_z          NUMERIC,
  nupl            NUMERIC,
  total_crypto_value NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. opportunities — ranked investment opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id              BIGSERIAL PRIMARY KEY,
  ticker          TEXT,
  name            TEXT    NOT NULL,
  category        TEXT    DEFAULT 'equity',
  expected_return NUMERIC,
  probability     NUMERIC,
  impact_score    NUMERIC,
  thesis          TEXT,
  time_horizon    TEXT,
  status          TEXT    DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. factor_exposures — portfolio factor tilts
CREATE TABLE IF NOT EXISTS factor_exposures (
  id              BIGSERIAL PRIMARY KEY,
  factor_date     DATE    NOT NULL DEFAULT CURRENT_DATE,
  value_tilt      NUMERIC,
  quality_tilt    NUMERIC,
  momentum_tilt   NUMERIC,
  small_cap_tilt  NUMERIC,
  low_vol_tilt    NUMERIC,
  growth_tilt     NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. stress_scenarios — scenario outcomes
CREATE TABLE IF NOT EXISTS stress_scenarios (
  id              BIGSERIAL PRIMARY KEY,
  scenario_name   TEXT    NOT NULL,
  shock_type      TEXT    NOT NULL,
  shock_magnitude NUMERIC NOT NULL,
  portfolio_impact NUMERIC,
  recovery_months INTEGER,
  probability     NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. bonus_config — bonus planning parameters
CREATE TABLE IF NOT EXISTS bonus_config (
  id              BIGSERIAL PRIMARY KEY,
  tax_year        TEXT    NOT NULL UNIQUE,
  gross_bonus     NUMERIC DEFAULT 0,
  tax_rate        NUMERIC DEFAULT 0.45,
  ni_rate         NUMERIC DEFAULT 0.02,
  isa_allowance   NUMERIC DEFAULT 20000,
  pension_allowance NUMERIC DEFAULT 60000,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. bonus_scenarios — different bonus deployment options
CREATE TABLE IF NOT EXISTS bonus_scenarios (
  id              BIGSERIAL PRIMARY KEY,
  config_id       BIGINT  REFERENCES bonus_config(id),
  scenario_name   TEXT    NOT NULL,
  isa_amount      NUMERIC DEFAULT 0,
  pension_amount  NUMERIC DEFAULT 0,
  gia_amount      NUMERIC DEFAULT 0,
  cash_amount     NUMERIC DEFAULT 0,
  net_benefit     NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. monthly_returns — monthly P&L history
CREATE TABLE IF NOT EXISTS monthly_returns (
  id              BIGSERIAL PRIMARY KEY,
  year_month      TEXT    NOT NULL UNIQUE, -- e.g. '2026-03'
  portfolio_return NUMERIC,
  benchmark_return NUMERIC,
  alpha           NUMERIC GENERATED ALWAYS AS (portfolio_return - benchmark_return) STORED,
  inflows         NUMERIC DEFAULT 0,
  outflows        NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_returns_ym ON monthly_returns (year_month DESC);

-- 13. portfolio_scorecard — quality metrics
CREATE TABLE IF NOT EXISTS portfolio_scorecard (
  id              BIGSERIAL PRIMARY KEY,
  score_date      DATE    NOT NULL DEFAULT CURRENT_DATE,
  overall_score   NUMERIC,
  diversification_score NUMERIC,
  cost_score      NUMERIC,
  tax_efficiency_score NUMERIC,
  liquidity_score NUMERIC,
  fire_progress   NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. reference_data — benchmark prices, rates, etc.
CREATE TABLE IF NOT EXISTS reference_data (
  id              BIGSERIAL PRIMARY KEY,
  data_key        TEXT    NOT NULL UNIQUE,
  data_value      NUMERIC,
  data_json       JSONB,
  source          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- Row Level Security — restrict to authenticated users
-- =========================================================================
DO $$
DECLARE tbl TEXT;
DECLARE tables TEXT[] := ARRAY[
  'portfolio_config','holdings','net_worth_history','nw_bridge',
  'risk_metrics','crypto_metrics','opportunities','factor_exposures',
  'stress_scenarios','bonus_config','bonus_scenarios','monthly_returns',
  'portfolio_scorecard','reference_data'
];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    -- Allow all access for authenticated users (single-user family office app)
    EXECUTE format(
      'CREATE POLICY IF NOT EXISTS %I ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      'authenticated_access_' || tbl, tbl
    );
    -- Also allow service_role to bypass RLS for migrations/cron
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
  END LOOP;
END $$;
