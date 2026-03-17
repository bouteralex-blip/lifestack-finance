-- =========================================================================
-- LIFESTACK OS — Migration 002
-- Add engine snapshots, decision log, action queue, and market cache tables
-- =========================================================================

-- 1. Engine Snapshots — weekly state for computeWhatChanged()
CREATE TABLE IF NOT EXISTS engine_snapshots (
  id BIGSERIAL PRIMARY KEY,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  snapshot_type TEXT NOT NULL DEFAULT 'weekly', -- weekly | daily | manual
  engine_state JSONB NOT NULL,
  market_state JSONB,
  portfolio_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (snapshot_date, snapshot_type)
);

CREATE INDEX idx_engine_snapshots_date ON engine_snapshots (snapshot_date DESC);

-- 2. Decision Log — trade thesis tracking
CREATE TABLE IF NOT EXISTS decision_log (
  id TEXT PRIMARY KEY, -- dec-{timestamp}
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  thesis JSONB NOT NULL DEFAULT '{}',
  snapshot JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open', -- open | validated | invalidated | expired
  outcome TEXT,
  review_date DATE,
  notes JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_decision_log_status ON decision_log (status);
CREATE INDEX idx_decision_log_review ON decision_log (review_date) WHERE status = 'open';

-- Trigger for updated_at
CREATE TRIGGER decision_log_updated_at
  BEFORE UPDATE ON decision_log
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Action Queue State — persist done/dismissed status
CREATE TABLE IF NOT EXISTS action_queue_state (
  action_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | done | dismissed | snoozed
  completed_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER action_queue_state_updated_at
  BEFORE UPDATE ON action_queue_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Market Data Cache — API-fetched market data with freshness
CREATE TABLE IF NOT EXISTS market_data_cache (
  source TEXT NOT NULL, -- fred | yahoo | coingecko | fmp
  metric_key TEXT NOT NULL,
  value NUMERIC,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '6 hours'),
  PRIMARY KEY (source, metric_key)
);

CREATE INDEX idx_market_cache_expires ON market_data_cache (expires_at);
