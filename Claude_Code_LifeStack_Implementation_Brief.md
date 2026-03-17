# Claude Code — LifeStack Finance + Market Module Implementation Brief

You are working on the `lifestack-finance` repo.

## Objective

Turn the current Finance and Market & Research modules from mostly dashboarded analysis into a **live, agentic intelligence system**.

## Non-negotiables

- Preserve existing app architecture.
- Do not break the current shell or tabs.
- Prioritise data quality, state architecture, and automations over surface-level UI flourishes.
- Keep the premium dashboard feel.
- Mark static vs live data honestly.
- Add freshness indicators anywhere data can go stale.

## Current reality

- Finance module is already analytically strong.
- Market module is broad and well-structured but too static.
- Main gap is live state generation and agent workflows.

## Build order

### Phase 1 — Truth layer
- Add clear data freshness and source-state indicators.
- Separate hardcoded fallback data from live data states.
- Create canonical state objects:
  - portfolio_state
  - market_regime_state
  - rates_credit_state
  - flows_positioning_state
  - crypto_state
  - scenario_state
  - capital_efficiency_state
  - action_queue_state
  - watchlist_state
  - decision_log
  - weekly_synthesis_state
  - dashboard_freshness_state

### Phase 2 — Finance operating system
- Automate holdings ingestion.
- Add sleeve, wrapper, currency, concentration, and drift engines.
- Add debt-priority agent.
- Add ISA / pension routing engine.
- Add rebalance proposal engine.

### Phase 3 — Market intelligence layer
- Add macro regime classifier.
- Add ETF flow tracker.
- Add cross-asset stress engine.
- Add sector / factor rotation engine.
- Add BTC cycle state engine.
- Add trigger-based event notes.

### Phase 4 — Research and decisioning
- Add weekly synthesis writer.
- Add opportunity ranker.
- Add decision log and thesis monitor.
- Add “what changed / what matters / what to do / what to watch” summary blocks.

### Phase 5 — UI refinement
- Only after Phases 1–4 are working.
- Increase tile density where helpful.
- Improve cross-linking between tabs.
- Surface top-ranked actions more aggressively.

## Highest-priority workflows to implement first

1. holdings ingestion
2. wrapper exposure engine
3. debt-priority agent
4. ISA / pension routing engine
5. macro regime classifier
6. ETF flow tracker
7. cross-asset stress board
8. BTC cycle state engine
9. weekly synthesis writer
10. tile priority engine
11. decision-log updater
12. monthly operating review

## Output expectations

For each implemented workflow:
- define inputs
- define transformation logic
- define output state object
- define where it renders in UI
- define freshness rule
- define failure / fallback behaviour

## QA expectations

- no broken existing tabs
- all state objects nullable-safe
- all derived metrics recompute from live states where available
- render checks for every updated tab
- explicit stale-data labels where needed

## Product standard

This should feel like a **private family office command system**.

Not crypto-gaming UI.
Not retail investing fluff.
Not fake-live dashboards.

Build for high signal, high clarity, premium aesthetics, and decision usefulness.
