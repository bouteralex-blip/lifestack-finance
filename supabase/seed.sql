-- =========================================================================
-- LifeStack Finance — Seed Data
-- Realistic sample portfolio for development / initial setup.
-- Replace with your actual data or use the holdings ingestion API.
-- All monetary values in GBP.
-- =========================================================================

-- ── Portfolio Config ──────────────────────────────────────────────────────
INSERT INTO portfolio_config (target_allocation, risk_profile, fire_target, annual_spend, currency)
VALUES (
  '{
    "global_equity": 55,
    "uk_equity": 10,
    "bonds": 10,
    "property": 5,
    "crypto": 10,
    "cash": 10
  }',
  'growth',
  2500000,
  75000,
  'GBP'
)
ON CONFLICT DO NOTHING;

-- ── Holdings ─────────────────────────────────────────────────────────────
-- Format: ticker, name, asset_class, wrapper, currency, quantity, cost_basis, current_price, weight

-- ISA — Global Equity Core
INSERT INTO holdings (ticker, name, asset_class, wrapper, currency, quantity, cost_basis, current_price, weight) VALUES
  ('VWRL',  'Vanguard FTSE All-World ETF',    'global_equity', 'ISA', 'GBP', 850,    82.50, 107.20, 18.5),
  ('SWDA',  'iShares Core MSCI World ETF',     'global_equity', 'ISA', 'GBP', 400,    65.00,  84.30,  6.8),
  ('VUSA',  'Vanguard S&P 500 ETF',            'us_equity',     'ISA', 'GBP', 600,    55.00,  72.80,  8.9),
  ('ISF',   'iShares FTSE 100 ETF',            'uk_equity',     'ISA', 'GBP', 1200,   7.40,   8.92,  2.2)
ON CONFLICT DO NOTHING;

-- Pension (SIPP) — Long Duration Growth
INSERT INTO holdings (ticker, name, asset_class, wrapper, currency, quantity, cost_basis, current_price, weight) VALUES
  ('VAGP',  'Vanguard Global Aggregate Bond',  'bonds',         'SIPP','GBP', 3000,   17.00,  16.20,  9.8),
  ('SMH',   'VanEck Semiconductor ETF',        'us_equity',     'SIPP','USD', 180,   195.00, 245.80,  9.0),
  ('EQQQ',  'Invesco NASDAQ-100 ETF',          'us_equity',     'SIPP','GBP', 250,   310.00, 388.50, 19.7)
ON CONFLICT DO NOTHING;

-- GIA — Satellite + Thematic
INSERT INTO holdings (ticker, name, asset_class, wrapper, currency, quantity, cost_basis, current_price, weight) VALUES
  ('IUKD',  'iShares UK Dividend ETF',         'uk_equity',     'GIA', 'GBP', 2000,   9.10,   9.85,  4.0),
  ('INRG',  'iShares Clean Energy ETF',        'thematic',      'GIA', 'GBP', 800,   13.50,  10.20,  1.7),
  ('SGLN',  'iShares Physical Gold ETF',       'commodities',   'GIA', 'GBP', 600,   28.00,  42.10,  5.1)
ON CONFLICT DO NOTHING;

-- Crypto — Exchange Wallet
INSERT INTO holdings (ticker, name, asset_class, wrapper, currency, quantity, cost_basis, current_price, weight) VALUES
  ('BTC',   'Bitcoin',                         'crypto',        'WALLET','GBP', 0.95, 42000, 53800, 10.4),
  ('ETH',   'Ethereum',                        'crypto',        'WALLET','GBP', 4.20,  2200,  1560,  1.3)
ON CONFLICT DO NOTHING;

-- Cash
INSERT INTO holdings (ticker, name, asset_class, wrapper, currency, quantity, cost_basis, current_price, weight) VALUES
  ('CASH',  'Chase Saver (4.3% AER)',          'cash',          'CASH','GBP', 62000, 1.00, 1.00, 12.6)
ON CONFLICT DO NOTHING;

-- ── Net Worth History (last 12 months weekly) ─────────────────────────────
INSERT INTO net_worth_history (snapshot_date, total_assets, total_liabilities, notes)
VALUES
  ('2025-03-28', 395000, 185000, 'Q1 2025'),
  ('2025-04-25', 402000, 183000, NULL),
  ('2025-05-30', 415000, 181000, NULL),
  ('2025-06-27', 428000, 179000, 'Mid-year'),
  ('2025-07-25', 441000, 177000, NULL),
  ('2025-08-29', 452000, 175000, NULL),
  ('2025-09-26', 460000, 173000, 'Q3 2025'),
  ('2025-10-31', 471000, 171000, NULL),
  ('2025-11-28', 482000, 169000, NULL),
  ('2025-12-31', 495000, 167000, 'Year end'),
  ('2026-01-30', 501000, 165000, NULL),
  ('2026-02-27', 508000, 163000, NULL),
  ('2026-03-14', 496000, 161000, 'Latest')
ON CONFLICT (snapshot_date) DO NOTHING;

-- ── Monthly Returns ───────────────────────────────────────────────────────
INSERT INTO monthly_returns (year_month, portfolio_return, benchmark_return, inflows, outflows)
VALUES
  ('2025-04', 2.1,  1.8, 2000, 0),
  ('2025-05', 3.4,  2.9, 2000, 0),
  ('2025-06', 1.2,  0.8, 2000, 0),
  ('2025-07', 4.1,  3.5, 2000, 0),
  ('2025-08', 2.8,  2.2, 4000, 0),
  ('2025-09', -1.3,-1.8, 2000, 0),
  ('2025-10', 3.6,  3.1, 2000, 0),
  ('2025-11', 5.2,  4.7, 2000, 0),
  ('2025-12', 2.4,  2.1, 2000, 0),
  ('2026-01', 1.8,  1.5, 2000, 0),
  ('2026-02', 1.1,  0.9, 2000, 0),
  ('2026-03', -2.3,-2.8, 1000, 0)
ON CONFLICT (year_month) DO NOTHING;

-- ── Risk Metrics ──────────────────────────────────────────────────────────
INSERT INTO risk_metrics (metric_date, volatility_1y, sharpe_ratio, max_drawdown, var_95, beta, correlation_spy)
VALUES ('2026-03-14', 14.2, 1.38, -12.4, -2.1, 0.87, 0.82)
ON CONFLICT DO NOTHING;

-- ── Portfolio Scorecard ───────────────────────────────────────────────────
INSERT INTO portfolio_scorecard (score_date, overall_score, diversification_score, cost_score, tax_efficiency_score, liquidity_score, fire_progress)
VALUES ('2026-03-14', 78, 82, 91, 74, 88, 19.8)
ON CONFLICT DO NOTHING;

-- ── Stress Scenarios ─────────────────────────────────────────────────────
INSERT INTO stress_scenarios (scenario_name, shock_type, shock_magnitude, portfolio_impact, recovery_months, probability)
VALUES
  ('2020-style crash',  'equity_selloff', -34, -28.4, 18, 0.12),
  ('UK recession',      'rate_shock',     -18, -14.2, 12, 0.22),
  ('Crypto -60%',       'crypto_crash',   -60,  -6.2,  9, 0.35),
  ('Soft landing',      'positive',       +15, +11.8,  0, 0.31)
ON CONFLICT DO NOTHING;

-- ── Opportunities ────────────────────────────────────────────────────────
INSERT INTO opportunities (ticker, name, category, expected_return, probability, impact_score, thesis, time_horizon, status)
VALUES
  ('VWRL', 'Top up ISA before April deadline',    'allocation', 8.5, 0.85, 9.2, 'Use remaining £8,460 ISA allowance before 5 April 2026 — tax-free growth', '30d',   'active'),
  ('SGLN', 'Increase gold allocation to 7%',      'allocation', 6.2, 0.70, 7.8, 'Gold outperforming in late-cycle; acts as vol hedge vs crypto correlation', '90d',   'active'),
  ('SIPP', 'Max pension contribution £60k',       'tax',        12.4, 0.90, 9.8, '45% tax relief on contributions — highest NPV action available this year', '6m',    'active'),
  ('CASH', 'Deploy excess cash >£50k threshold',  'rebalance',  4.3, 0.80, 8.5, 'Cash earns 4.3% but drags long-term CAGR; target 8% cash, deploy £12k',   '60d',   'active'),
  ('BTC',  'Trim BTC if BTC Dom >60%',            'risk',       0.0, 0.55, 7.1, 'BTC dominance at 58%; at 60% historically precedes altcoin season rotation','trigger','active')
ON CONFLICT DO NOTHING;

-- ── Bonus Config (tax year 2025-26) ──────────────────────────────────────
INSERT INTO bonus_config (tax_year, gross_bonus, tax_rate, ni_rate, isa_allowance, pension_allowance)
VALUES ('2025-26', 45000, 0.45, 0.02, 20000, 60000)
ON CONFLICT (tax_year) DO NOTHING;

-- ── Reference Data ────────────────────────────────────────────────────────
INSERT INTO reference_data (data_key, data_value, source) VALUES
  ('sp500_ytd',     -0.01, 'fred'),
  ('vix_current',   24.5,  'fred'),
  ('gilt_10y',       4.62, 'fred'),
  ('boe_rate',       3.75, 'boe'),
  ('uk_cpi',         3.0,  'ons'),
  ('gbpusd',         1.337,'fred'),
  ('gold_usd',    5280.0,  'yahoo'),
  ('btc_usd',    68200.0,  'coingecko'),
  ('ig_oas',        95.0,  'fred'),
  ('hy_oas',       340.0,  'fred')
ON CONFLICT (data_key) DO NOTHING;
