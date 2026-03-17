-- =========================================================================
-- LIFESTACK OS — PHASE 1: TRUTH LAYER
-- Migration: Add updated_at columns to all 14 tables for freshness tracking
--
-- Purpose: Every table gets an updated_at timestamp that auto-updates on
-- row modification. The client-side freshness engine (useData.js) uses
-- these timestamps to compute live/stale/fallback status per data source.
-- =========================================================================

-- Helper function: auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- Add updated_at column + trigger to each table
-- Using IF NOT EXISTS pattern so migration is idempotent
-- =========================================================================

-- 1. portfolio_config
ALTER TABLE portfolio_config ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_portfolio_config ON portfolio_config;
CREATE TRIGGER set_updated_at_portfolio_config
  BEFORE UPDATE ON portfolio_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. holdings
ALTER TABLE holdings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_holdings ON holdings;
CREATE TRIGGER set_updated_at_holdings
  BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. net_worth_history
ALTER TABLE net_worth_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_net_worth_history ON net_worth_history;
CREATE TRIGGER set_updated_at_net_worth_history
  BEFORE UPDATE ON net_worth_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. nw_bridge
ALTER TABLE nw_bridge ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_nw_bridge ON nw_bridge;
CREATE TRIGGER set_updated_at_nw_bridge
  BEFORE UPDATE ON nw_bridge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. risk_metrics
ALTER TABLE risk_metrics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_risk_metrics ON risk_metrics;
CREATE TRIGGER set_updated_at_risk_metrics
  BEFORE UPDATE ON risk_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. crypto_metrics
ALTER TABLE crypto_metrics ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_crypto_metrics ON crypto_metrics;
CREATE TRIGGER set_updated_at_crypto_metrics
  BEFORE UPDATE ON crypto_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. opportunities
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_opportunities ON opportunities;
CREATE TRIGGER set_updated_at_opportunities
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. factor_exposures
ALTER TABLE factor_exposures ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_factor_exposures ON factor_exposures;
CREATE TRIGGER set_updated_at_factor_exposures
  BEFORE UPDATE ON factor_exposures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. stress_scenarios
ALTER TABLE stress_scenarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_stress_scenarios ON stress_scenarios;
CREATE TRIGGER set_updated_at_stress_scenarios
  BEFORE UPDATE ON stress_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. bonus_config
ALTER TABLE bonus_config ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_bonus_config ON bonus_config;
CREATE TRIGGER set_updated_at_bonus_config
  BEFORE UPDATE ON bonus_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. bonus_scenarios
ALTER TABLE bonus_scenarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_bonus_scenarios ON bonus_scenarios;
CREATE TRIGGER set_updated_at_bonus_scenarios
  BEFORE UPDATE ON bonus_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. monthly_returns
ALTER TABLE monthly_returns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_monthly_returns ON monthly_returns;
CREATE TRIGGER set_updated_at_monthly_returns
  BEFORE UPDATE ON monthly_returns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. portfolio_scorecard
ALTER TABLE portfolio_scorecard ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_portfolio_scorecard ON portfolio_scorecard;
CREATE TRIGGER set_updated_at_portfolio_scorecard
  BEFORE UPDATE ON portfolio_scorecard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. reference_data
ALTER TABLE reference_data ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
DROP TRIGGER IF EXISTS set_updated_at_reference_data ON reference_data;
CREATE TRIGGER set_updated_at_reference_data
  BEFORE UPDATE ON reference_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================================================
-- Backfill: Set updated_at = created_at for existing rows (if created_at exists)
-- This ensures existing data shows accurate freshness rather than "just now"
-- =========================================================================
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'portfolio_config', 'holdings', 'net_worth_history', 'nw_bridge',
    'risk_metrics', 'crypto_metrics', 'opportunities', 'factor_exposures',
    'stress_scenarios', 'bonus_config', 'bonus_scenarios', 'monthly_returns',
    'portfolio_scorecard', 'reference_data'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    -- Only backfill if created_at column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = tbl AND column_name = 'created_at'
    ) THEN
      EXECUTE format('UPDATE %I SET updated_at = created_at WHERE updated_at IS NULL OR updated_at = NOW()', tbl);
    END IF;
  END LOOP;
END $$;
