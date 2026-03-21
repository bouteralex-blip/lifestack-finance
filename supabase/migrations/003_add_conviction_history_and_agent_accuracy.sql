-- =========================================================================
-- LIFESTACK OS — Migration 003
-- Add conviction history tracking and agent accuracy metrics
-- =========================================================================

-- 1. Conviction History — track how opportunity conviction changes over time
CREATE TABLE IF NOT EXISTS conviction_history (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  decision_id TEXT,  -- Link to decision_log if executed
  agent_name TEXT NOT NULL,
  
  -- Initial conviction scoring
  initial_conviction FLOAT NOT NULL,  -- 0-100
  initial_impact FLOAT,               -- Expected impact in % or £
  initial_confidence VARCHAR(50),     -- 'HIGH' | 'MEDIUM' | 'LOW'
  initial_rationale TEXT,
  
  -- Updated conviction (after outcome)
  updated_conviction FLOAT,           -- 0-100 after review
  conviction_delta FLOAT,             -- Change in conviction
  
  -- Outcome tracking
  actual_outcome FLOAT,               -- Actual portfolio impact
  outcome_date DATE,
  outcome_status VARCHAR(50),         -- 'SUCCESS' | 'PARTIAL' | 'FAILURE' | 'INCONCLUSIVE'
  outcome_notes TEXT,
  
  -- Agent performance tracking
  agent_accuracy_factor FLOAT DEFAULT 1.0,  -- Bayesian factor for this agent
  
  -- Metadata
  opportunity_type VARCHAR(100),      -- 'rebalance' | 'tax' | 'debt' | 'allocation' | etc.
  market_regime_at_decision VARCHAR(50),  -- Macro regime when opportunity identified
  market_regime_at_outcome VARCHAR(50),   -- Macro regime when outcome assessed
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_decision CHECK (decision_id IS NULL OR decision_id ~ '^dec-')
);

-- Indexes for efficient lookups
CREATE INDEX idx_conviction_agent ON conviction_history (agent_name);
CREATE INDEX idx_conviction_opportunity ON conviction_history (opportunity_id);
CREATE INDEX idx_conviction_decision ON conviction_history (decision_id);
CREATE INDEX idx_conviction_outcome_date ON conviction_history (outcome_date);
CREATE INDEX idx_conviction_agent_accuracy ON conviction_history (agent_name, agent_accuracy_factor DESC);

-- Trigger for updated_at
CREATE TRIGGER conviction_history_updated_at
  BEFORE UPDATE ON conviction_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Agent Performance Summary — aggregate metrics per agent
CREATE TABLE IF NOT EXISTS agent_accuracy_summary (
  id BIGSERIAL PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  
  -- Aggregate metrics
  total_opportunities INT DEFAULT 0,
  successful_count INT DEFAULT 0,
  partial_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  inconclusive_count INT DEFAULT 0,
  
  -- Calculated metrics
  success_rate FLOAT DEFAULT 0.0,       -- % of successful outcomes
  accuracy_factor FLOAT DEFAULT 1.0,    -- Used to weight future opportunities
  average_conviction FLOAT DEFAULT 50.0,  -- Average conviction score
  conviction_calibration FLOAT DEFAULT 1.0,  -- How well conviction matches actual outcomes
  
  -- Time tracking
  first_opportunity_date DATE,
  last_opportunity_date DATE,
  last_reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE TRIGGER agent_accuracy_summary_updated_at
  BEFORE UPDATE ON agent_accuracy_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Conviction Events — audit log of conviction changes
CREATE TABLE IF NOT EXISTS conviction_events (
  id BIGSERIAL PRIMARY KEY,
  conviction_history_id BIGSERIAL NOT NULL REFERENCES conviction_history(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(50) NOT NULL,  -- 'CREATED' | 'UPDATED' | 'OUTCOME_RECORDED' | 'REVIEWED'
  event_description TEXT,
  conviction_before FLOAT,
  conviction_after FLOAT,
  
  -- Change tracking
  changed_by TEXT DEFAULT 'SYSTEM',  -- 'SYSTEM' | 'USER' | 'AGENT'
  change_reason TEXT,
  
  -- Timestamps
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit trails
CREATE INDEX idx_conviction_events_date ON conviction_events (conviction_history_id, event_date DESC);
CREATE INDEX idx_conviction_events_type ON conviction_events (event_type);

-- =========================================================================
-- Migration functions for conviction calculation
-- =========================================================================

-- Function: Calculate agent accuracy factor (Bayesian update)
-- Increases factor if agent predictions are accurate, decreases otherwise
CREATE OR REPLACE FUNCTION calculate_agent_accuracy_factor(agent_name_param TEXT)
RETURNS FLOAT AS $$
DECLARE
  success_count INT;
  total_count INT;
  avg_conviction_vs_outcome FLOAT;
  accuracy_factor FLOAT;
BEGIN
  -- Count successes and totals
  SELECT 
    COUNT(*) FILTER (WHERE outcome_status IN ('SUCCESS', 'PARTIAL')),
    COUNT(*)
  INTO success_count, total_count
  FROM conviction_history
  WHERE agent_name = agent_name_param AND outcome_status IS NOT NULL;
  
  -- Default to 1.0 if no outcomes
  IF total_count = 0 THEN
    RETURN 1.0;
  END IF;
  
  -- Calculate success rate
  accuracy_factor := success_count::FLOAT / total_count::FLOAT;
  
  -- Calibration: Compare conviction to actual success
  SELECT AVG(ABS(initial_conviction - CASE 
    WHEN outcome_status = 'SUCCESS' THEN 100
    WHEN outcome_status = 'PARTIAL' THEN 75
    WHEN outcome_status = 'FAILURE' THEN 0
    ELSE 50
  END)) / 100.0
  INTO avg_conviction_vs_outcome
  FROM conviction_history
  WHERE agent_name = agent_name_param AND outcome_status IS NOT NULL;
  
  -- Calibrate: If conviction well-matched to outcomes, boost factor
  IF avg_conviction_vs_outcome IS NOT NULL THEN
    accuracy_factor := accuracy_factor * (1.0 + (1.0 - avg_conviction_vs_outcome));
  END IF;
  
  -- Clamp between 0.5 and 1.5 (prevent extreme values)
  RETURN GREATEST(0.5, LEAST(1.5, accuracy_factor));
END;
$$ LANGUAGE plpgsql STABLE;

-- Function: Update agent summary statistics
CREATE OR REPLACE FUNCTION update_agent_accuracy_summary(agent_name_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO agent_accuracy_summary (agent_name, total_opportunities, successful_count, partial_count, failed_count, inconclusive_count, success_rate, accuracy_factor, average_conviction, conviction_calibration, first_opportunity_date, last_opportunity_date, last_reviewed_at)
  SELECT
    agent_name_param,
    COUNT(*),
    COUNT(*) FILTER (WHERE outcome_status = 'SUCCESS'),
    COUNT(*) FILTER (WHERE outcome_status = 'PARTIAL'),
    COUNT(*) FILTER (WHERE outcome_status = 'FAILURE'),
    COUNT(*) FILTER (WHERE outcome_status = 'INCONCLUSIVE' OR outcome_status IS NULL),
    (COUNT(*) FILTER (WHERE outcome_status IN ('SUCCESS', 'PARTIAL')))::FLOAT / NULLIF(COUNT(*), 0),
    calculate_agent_accuracy_factor(agent_name_param),
    AVG(initial_conviction),
    1.0,  -- Calibration calculated separately if needed
    MIN(CURRENT_DATE),
    MAX(outcome_date),
    NOW()
  FROM conviction_history
  WHERE agent_name = agent_name_param
  ON CONFLICT (agent_name) DO UPDATE SET
    total_opportunities = EXCLUDED.total_opportunities,
    successful_count = EXCLUDED.successful_count,
    partial_count = EXCLUDED.partial_count,
    failed_count = EXCLUDED.failed_count,
    inconclusive_count = EXCLUDED.inconclusive_count,
    success_rate = EXCLUDED.success_rate,
    accuracy_factor = EXCLUDED.accuracy_factor,
    average_conviction = EXCLUDED.average_conviction,
    last_reviewed_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- Views for convenience queries
-- =========================================================================

-- View: Top performing agents this year
CREATE OR REPLACE VIEW top_agents_this_year AS
SELECT
  agent_name,
  total_opportunities,
  successful_count,
  success_rate,
  accuracy_factor,
  average_conviction
FROM agent_accuracy_summary
WHERE last_opportunity_date >= CURRENT_DATE - INTERVAL '1 year'
ORDER BY success_rate DESC, total_opportunities DESC;

-- View: Recently recorded outcomes
CREATE OR REPLACE VIEW recent_conviction_outcomes AS
SELECT
  h.opportunity_id,
  h.agent_name,
  h.initial_conviction,
  h.actual_outcome,
  h.outcome_status,
  h.updated_conviction,
  h.conviction_delta,
  h.opportunity_type,
  h.outcome_date,
  a.success_rate
FROM conviction_history h
LEFT JOIN agent_accuracy_summary a ON h.agent_name = a.agent_name
WHERE h.outcome_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY h.outcome_date DESC;

-- =========================================================================
-- Sample seed data (optional, for development)
-- =========================================================================

-- Initialize conviction history for existing agents
INSERT INTO agent_accuracy_summary (agent_name, total_opportunities, successful_count, partial_count, failed_count, inconclusive_count, success_rate, accuracy_factor, average_conviction, first_opportunity_date, last_opportunity_date)
VALUES
  ('opportunity-ranker', 0, 0, 0, 0, 0, 0.0, 1.0, 50.0, CURRENT_DATE, CURRENT_DATE),
  ('rebalance-approval', 0, 0, 0, 0, 0, 0.0, 1.0, 50.0, CURRENT_DATE, CURRENT_DATE),
  ('debt-priority', 0, 0, 0, 0, 0, 0.0, 1.0, 50.0, CURRENT_DATE, CURRENT_DATE),
  ('tax-optimizer', 0, 0, 0, 0, 0, 0.0, 1.0, 50.0, CURRENT_DATE, CURRENT_DATE),
  ('macro-regime', 0, 0, 0, 0, 0, 0.0, 1.0, 50.0, CURRENT_DATE, CURRENT_DATE),
  ('btc-cycle', 0, 0, 0, 0, 0, 0.0, 1.0, 50.0, CURRENT_DATE, CURRENT_DATE)
ON CONFLICT (agent_name) DO NOTHING;

-- =========================================================================
-- Grant permissions (adjust roles as needed for your Supabase setup)
-- =========================================================================

-- Grant read access to authenticated users
GRANT SELECT ON conviction_history TO authenticated;
GRANT SELECT ON agent_accuracy_summary TO authenticated;
GRANT SELECT ON conviction_events TO authenticated;
GRANT SELECT ON top_agents_this_year TO authenticated;
GRANT SELECT ON recent_conviction_outcomes TO authenticated;

-- Grant write access to service role (for backend functions)
GRANT INSERT, UPDATE ON conviction_history TO service_role;
GRANT INSERT, UPDATE ON agent_accuracy_summary TO service_role;
GRANT INSERT ON conviction_events TO service_role;

-- =========================================================================
-- NOTES:
-- 1. Conviction factors are calculated using Bayesian logic
-- 2. Success rate is weighted by actual outcome accuracy
-- 3. Conviction calibration improves as agent track record builds
-- 4. All timestamps use TIMESTAMPTZ for proper timezone handling
-- 5. Trigger audit trail via conviction_events table
-- =========================================================================
