# LifeStack OS — Repo-Level Module Analysis and Agent Workflow Blueprint

Date: 15 March 2026  
Basis of review: attached repo snapshot (`content` zip), implementation guides, market research spec, command center blueprint, finance analytics guide, and live shell URL.

## Bottom line

The repo is already **structurally strong**.

The **finance module** is a serious analytical dashboard with real portfolio logic, Supabase wiring, scenario work, and a useful execution layer.

The **market & research module** is visually ambitious and strategically smart, but today it behaves much more like a **static institutional intelligence board** than a true live research operating system. It has excellent topic coverage and framing, but the data layer is still mostly hardcoded rather than genuinely agentic.

The highest-leverage next move is **not** “add even more tabs.” It is to turn the existing modules into a live intelligence loop:

1. ingest portfolio + market data automatically,
2. score regime / risk / opportunity daily,
3. write weekly and event-driven memos automatically,
4. generate action recommendations with decision thresholds,
5. push the cleanest insights back into the dashboards.

That is where the real alpha starts.

---

## What I was able to access

I could not query a live GitHub connector directly in-session.

I **was** able to inspect the attached repo snapshot, which contains the live codebase:

- `components/AppShell.jsx`
- `components/PortfolioVOS.jsx`
- `components/MarketsModule.jsx`
- `lib/useData.js`
- `app/page.js`
- `app/layout.js`
- `public/` backgrounds and assets

So this update is based on the actual module code, not just earlier prompts.

---

## What the live product currently is

## 1) Shell and structure

The app is a simple two-module shell:

- **Wealth Engine**
- **Market & Research**

That is good. The module switcher is clean and keeps the product focused.

## 2) Finance module maturity

The finance module is the stronger of the two from a systems perspective.

It already has:

- 15 tabs
- live Supabase hooks
- hardcoded fallback data
- portfolio decomposition
- performance attribution
- risk engine
- scenario analysis
- cashflow and bonus deployment logic
- tax planning
- long-term wealth projection
- execution / action planning
- a system architecture tab

This is already much closer to a **CIO decision system** than a normal personal finance dashboard.

## 3) Market & research module maturity

The market module is broader and more ambitious.

It includes:

- **16 personal market / portfolio tabs**
- **8 career / infra intelligence tabs**
- 24 tabs total
- market regime framing
- liquidity / rates / credit
- narrative pulse
- global equities / factors
- bonds / duration
- FX / EM / frontier
- commodities / real assets
- property
- crypto intelligence
- flows / positioning
- valuation / factors
- volatility / stress
- alpha frontier
- scenario lab
- cash / defence
- weekly synthesis
- sponsor / infra / Africa / energy transition coverage on the career side

Strategically, that is excellent.

Operationally, the gap is clear:

- the **topic architecture is advanced**,
- the **data plumbing is not yet equally advanced**.

---

## What the modules currently present from an analysis perspective

## Finance module — what it is saying now

From the repo snapshot, the finance module is currently telling a coherent story:

### Current portfolio picture in the module

- Net worth: **~£362k**
- Assets: **~£376k**
- Debts: **~£13.6k**
- Six-month return: **negative**
- Peak-to-current drawdown: **material**
- Savings power: **extremely strong**
- FIRE progress: **real but still early**

### Actual portfolio shape in the code

Approximate asset mix from the repo snapshot:

- ETFs: **27.9%**
- Pension: **21.9%**
- Crypto: **13.4%**
- Cash / fixed deposit / cash sleeve: **16.4%** combined
- Investment / GIA-style holdings: **12.2%**
- Stocks: **3.6%**
- Mixed small positions: **4.7%**

### What that means

This is not a reckless portfolio.

It is actually a **mostly sensible core portfolio** damaged by a few structural inefficiencies:

- too much friction in wrappers,
- too much small-position clutter,
- too much risk concentration from crypto versus its capital weight,
- weak formal rebalancing discipline,
- avoidable debt drag,
- not enough of the exceptional income engine converted into structural wealth compounding.

### The strongest insight in the finance module

The biggest source of future wealth is **not heroic market picking**.

It is:

- wrapper optimisation,
- debt elimination,
- salary sacrifice,
- disciplined deployment of bonus capital,
- keeping the equity sleeve high quality,
- and making crypto a controlled asymmetric sleeve rather than a portfolio dictator.

That is exactly the right frame.

## Market & research module — what it is saying now

The market module presents a clear institutional narrative stack:

### Core regime signal in the repo snapshot

- regime: **late cycle / inflation scare**
- rates volatility elevated
- value and real assets favoured over long-duration growth
- Europe / EM / UK value leadership stronger than US mega-cap growth
- crypto fear extreme but BTC positioning improving
- cash is a real hurdle rate
- gold / hard assets / defence / energy / grid themes matter

### Where the analysis is strongest

The best part of the market module is not raw data.

It is the **decision framing**:

- it forces macro into actionable implications,
- it links regime to portfolio sleeves,
- it explicitly ends tabs with verdicts, implications, and what to monitor,
- it already thinks like a family-office CIO desk rather than a retail dashboard.

That is a major strength.

### Where the analysis is weakest

The market module is still too reliant on:

- static data constants,
- manually refreshed assumptions,
- narrative summaries that look live but are not yet truly live,
- and research panels that are smarter than their plumbing.

In plain English:

**the intelligence architecture is ahead of the data architecture.**

---

## What is genuinely good already

## Finance module strengths

- serious analytical breadth
- good portfolio decomposition
- useful action orientation
- proper scenario thinking
- strong human capital framing
- clear tax and wrapper awareness
- unusually good translation from data to decisions

## Market module strengths

- excellent tab architecture
- strong institutional framing
- good regime language
- good narrative / flows / sentiment concept
- good idea pipeline for alpha themes
- strong linkage between world state and personal portfolio implications

## Product / design strengths

- premium shell already exists
- module separation is clean
- dashboard density is appropriate for a power user
- the design language can absolutely support a top-tier LifeOS

---

## What is missing or underpowered

## 1) True live market intelligence

Right now the market module is not yet a real-time decision engine.

It needs live state objects for:

- macro
- rates
- credit
- ETF flows
- earnings revisions
- factor leadership
- commodity moves
- BTC / ETH / SOL on-chain data
- stablecoin / ETF / futures positioning
- volatility / correlation / drawdown clustering

## 2) True portfolio operating layer

The finance module is analytical, but the operating layer is still thin.

It needs automatic:

- broker / custody ingestion
- holdings normalization
- target-weight drift detection
- rebalance proposals
- tax-lot awareness
- wrapper-aware routing
- debt / cash / ISA / pension decision engine

## 3) Decision memory

The system does not yet appear to maintain a robust:

- investment thesis register
- decision log
- what changed / why changed record
- error review log
- post-mortem archive

That matters because alpha comes from learning, not only from monitoring.

## 4) Priority ranking engine

There are many tiles and many insights.

What still needs sharpening is:

- what matters **today**,
- what matters **this week**,
- what matters **this quarter**,
- what action is highest expected value **per unit of attention**.

---

## My updated portfolio and strategy read

## The portfolio is not broken

It is **under-optimised**, not broken.

The core engine is strong because:

- earnings power is strong,
- savings capacity is very strong,
- core ETF / pension mix is sensible,
- there is room to create structural alpha with almost no extra brilliance.

## Your biggest current drags

### 1) Crypto risk concentration

Crypto is only ~13% of capital but consumes far more of the risk budget.

That is acceptable only if it stays a **controlled asymmetric bet**.

It is not acceptable if it dictates portfolio outcomes.

### 2) Wrapper inefficiency

This is one of the cleanest alpha leaks in the entire system.

A meaningful portion of the portfolio still sits in taxable structures that should be treated as a routing problem, not a permanent condition.

### 3) Small-position clutter

The module itself is right about this.

Too many tiny holdings create:

- noise,
- admin,
- weak conviction expression,
- low signal-to-weight,
- and a fake sense of diversification.

### 4) Expensive debt

A 22% APR balance is not “personal admin.”

It is a guaranteed negative alpha machine.

### 5) Process weakness

The scorecard in the module is right to hit process.

The issue is not that the portfolio lacks ideas.

The issue is that the decision system still needs:

- explicit sizing rules,
- explicit rebalancing rules,
- explicit kill-switches,
- explicit thresholds.

---

## Where alpha should actually come from

## Tier 1 — highest certainty alpha

This is the boring, rich-people-get-richer alpha:

1. **clear expensive debt**
2. **max ISA on time**
3. **optimize pension / salary sacrifice**
4. **tighten wrapper routing every year**
5. **cut position clutter**
6. **rebalance systematically**

This alpha is durable, repeatable, and scalable.

## Tier 2 — strategic allocation alpha

This is where you can outperform without needing heroic single-stock genius.

The best candidates from the repo’s own logic are:

- **Europe / non-US value and quality**
- **selected EM exposure**
- **AI power / grid / utilities / real infrastructure beneficiaries**
- **hard assets / gold / selective commodities as macro ballast**
- **BTC as the main crypto expression**

## Tier 3 — thematic / opportunistic alpha

This is optional and should stay capped.

Best themes already implied in the module:

- AI power demand
- grid bottlenecks
- defence-adjacent industrials
- digital infrastructure
- selective stablecoin / payments infrastructure
- tokenisation watchlist

But this sleeve should stay small and rules-based.

## What I would not chase hard

- overcomplicated altcoin baskets
- broad “AI software” beta without valuation discipline
- long-duration bonds as a default hedge
- random micro-positions for intellectual entertainment
- too much cash beyond a proper buffer and planned deployment pool

---

## Best asset expressions to accelerate growth

This is the part that matters.

If the goal is to accelerate portfolio growth **without turning the system into a casino**, the best mix is:

## Core growth engine

- high-quality global equities
- Europe / EM / non-US value tilts
- pension + ISA funded aggressively
- disciplined monthly / bonus deployment

## Asymmetric growth engine

- **BTC**, not a messy altcoin buffet
- only add ETH / SOL if there is a specific thesis and capped sleeve rule
- crypto should be a **high-conviction satellite**, not a democracy

## Structural macro ballast

- gold / hard-asset hedge
- selective utilities / grid / infrastructure beneficiaries
- dry powder in short-duration cash when hurdle rate is genuinely competitive

## Human-capital accelerator

Still the highest ROI asset in the whole system.

Your career, compensation, deal exposure, and domain edge in infrastructure / energy / digital assets is a bigger compounding machine than most portfolio tweaks.

The market module’s career tabs are actually directionally right here:

the bridge between your job edge and your investable edge is one of the best alpha seams in the entire system.

---

## What the system should tell you every day

The dashboards should reduce to five questions:

1. **What changed?**
2. **Why does it matter?**
3. **What does it mean for my portfolio?**
4. **What should I do now, if anything?**
5. **What do I watch next?**

If a tile cannot answer one of those, it is decoration.

---

## Highest-priority build decisions

## Decision 1 — make market data truly live

Do this before adding more visual complexity.

The research module needs a state pipeline that updates automatically and writes clean JSON / database objects into the app.

## Decision 2 — make portfolio ingestion automatic

The finance module needs a canonical holdings ledger with:

- position
- wrapper
- geography
- currency
- cost / previous value
- target sleeve
- risk bucket
- thesis tag

## Decision 3 — create an action-ranking engine

Every morning the system should rank:

- highest-certainty action
- highest-EV action
- biggest risk
- biggest missed opportunity
- biggest item to ignore

## Decision 4 — build decision memory

Every meaningful investment action should create a record:

- thesis
- trigger
- size
- kill-switch
- review date
- outcome later

## Decision 5 — separate “monitoring” from “decisioning”

The current modules are strong at monitoring.

The next version must become ruthless about decisioning.

---

## The best agentic workflow stack

The right model is:

- **state collectors**
- **analysis agents**
- **decision agents**
- **writer agents**
- **dashboard update agents**
- **alert agents**
- **review / memory agents**

Below is the workflow blueprint.

---

## A. Market intelligence workflows

| Workflow | Trigger | Inputs | Output | Value |
|---|---|---|---|---|
| Macro regime classifier | Daily | rates, CPI, PMI, oil, dollar | regime state | top-down map |
| Central-bank path tracker | Daily | Fed, BoE, ECB, swaps | cut/hike odds | policy edge |
| Inflation shock monitor | Daily | oil, gas, breakevens | shock score | early warning |
| Yield-curve watcher | Daily | 2y, 10y, 30y | steep/flat flag | duration timing |
| Credit stress monitor | Daily | IG, HY, BBB OAS | spread regime | risk-on/off |
| Liquidity divergence engine | Weekly | M2, balance sheets, equities | liquidity score | medium-term bias |
| Narrative pulse engine | Daily | news, NLP, topic clusters | top stories | noise filter |
| Policy surprise detector | Event | govt, CB, sanctions | shock memo | fast response |
| Sector leadership tracker | Daily | sector ETFs, breadth | leadership board | rotation edge |
| Factor rotation engine | Daily | value, growth, quality, momentum | factor score | allocation tilt |
| Earnings revision monitor | Daily | consensus changes | revision heatmap | forward signal |
| ETF flow tracker | Daily | fund flows by asset | flow board | positioning read |
| CFTC positioning engine | Weekly | futures positioning | crowdedness score | contrarian edge |
| Cross-asset stress board | Daily | VIX, MOVE, oil, dollar, spreads | stress state | risk map |
| Correlation drift monitor | Daily | rolling correlations | cluster shifts | diversification truth |
| Gap-risk detector | Daily | event calendar, vol term | gap-risk alerts | hedging timing |
| Commodity shock monitor | Daily | gold, oil, copper, uranium | real-asset state | macro ballast |
| FX regime engine | Daily | DXY, GBPUSD, GBPZAR, EMFX | FX board | base-currency edge |
| Property cycle watcher | Weekly | mortgage rates, REITs, prices | property state | housing timing |
| Weekly synthesis writer | Weekly | all market states | CIO memo | digestible output |

## B. Portfolio intelligence workflows

| Workflow | Trigger | Inputs | Output | Value |
|---|---|---|---|---|
| Holdings ingestion | Daily | broker / CSV / DB | clean ledger | single truth |
| Position normalizer | Daily | names, tickers, wrappers | mapped holdings | clean analytics |
| Sleeve exposure engine | Daily | ledger | sleeve weights | allocation clarity |
| Wrapper exposure engine | Daily | ledger | tax map | structural alpha |
| Currency exposure engine | Daily | ledger | FX board | hidden risk |
| Concentration engine | Daily | holdings | HHI, top-3, top-5 | crowding alert |
| Drift monitor | Daily | actual vs target | rebalance flags | discipline |
| Risk-budget engine | Daily | vol, beta, factor load | risk share | stop rogue sleeves |
| Contribution attribution | Daily | pnl by holding/sleeve | winners/losers | causal read |
| Performance bridge writer | Weekly | flows + pnl | NAV memo | clean storytelling |
| Drawdown monitor | Daily | portfolio history | drawdown state | damage control |
| Scenario sensitivity engine | Weekly | holdings + stress shocks | impact matrix | pre-mortem |
| Monte Carlo updater | Weekly | returns + save rate | range of outcomes | realism |
| Liquidity ladder engine | Daily | cash, FD, bills | buffer state | avoid cash chaos |
| Debt-priority agent | Daily | balances, APRs | paydown order | guaranteed alpha |
| ISA / pension routing engine | Weekly | allowances, payroll, cash | deploy plan | wrapper alpha |
| Bonus allocation engine | Monthly / event | bonus size, targets | scenario plan | disciplined deploy |
| Capital efficiency scorer | Weekly | cash, tax, debt, drag | scorecard | process pressure |
| Thesis monitor | Weekly | thesis tags + market state | thesis intact / broken | avoid drift |
| Decision-log updater | Event | trades / changes | decision record | learning loop |

## C. Crypto-specific workflows

| Workflow | Trigger | Inputs | Output | Value |
|---|---|---|---|---|
| BTC cycle state engine | Daily | price, MVRV, NUPL, SOPR | cycle score | better timing |
| ETF flow monitor | Daily | spot ETF flows | demand signal | institutional read |
| On-chain stress board | Daily | reserves, whales, dormancy | chain stress | conviction test |
| Funding / basis engine | Daily | perp funding, basis | leverage heat | avoid froth |
| Stablecoin liquidity tracker | Daily | supply, exchange flows | crypto liquidity | leading signal |
| BTC dominance monitor | Daily | BTC dom, alt season data | rotation state | BTC vs alts |
| Altcoin risk cap agent | Daily | sleeve weights | hard cap alerts | stop sprawl |
| Crypto rebalance engine | Weekly | target vs actual | trim / add proposals | discipline |
| Crypto scenario lab | Weekly | BTC / ETH / SOL shocks | downside map | tail awareness |
| Fear / greed divergence | Daily | sentiment vs flows | contrarian score | entry timing |

## D. Research production workflows

| Workflow | Trigger | Inputs | Output | Value |
|---|---|---|---|---|
| Daily market brief | Daily | market states | 1-page brief | fast read |
| Sunday Scaries memo | Weekly | full system | weekly review | executive clarity |
| Theme memo generator | Weekly | chosen theme | deep-dive memo | idea quality |
| Opportunity radar ranker | Weekly | all candidate ideas | ranked list | focus |
| Watchlist updater | Daily | prices, catalysts, news | watchlist changes | action readiness |
| Trigger-based note writer | Event | threshold breach | alert note | immediate context |
| Earnings note generator | Event | results + guidance | one-page note | fast assimilation |
| Policy note generator | Event | CB / govt release | impact summary | macro reaction |
| Monthly portfolio letter | Monthly | finance + market state | investor-style letter | strategic review |
| Decision after-action review | Event / monthly | past calls | hit-rate review | compounding judgement |

## E. Dashboard and product workflows

| Workflow | Trigger | Inputs | Output | Value |
|---|---|---|---|---|
| Data freshness audit | Daily | all state objects | freshness panel | trust layer |
| Tile priority engine | Daily | alerts + EV ranking | top tile order | signal density |
| Insight callout writer | Daily | states + deltas | plain-English insight | readability |
| What changed engine | Daily | yesterday vs today | delta summary | no scanning waste |
| What matters now engine | Daily | ranked states | priority bar | attention control |
| Ignore list generator | Daily | low-EV noise | ignore panel | sanity |
| UI QA agent | On deploy | screenshots + diff | layout QA | polish |
| Regression checker | On deploy | tab render + data load | fail report | reliability |
| Content drift checker | Weekly | copy vs data state | stale tile flags | honesty |
| Report exporter | Weekly / monthly | summaries | markdown / doc / email | distribution |

## F. Execution and operating system workflows

| Workflow | Trigger | Inputs | Output | Value |
|---|---|---|---|---|
| Morning command center build | Daily | all modules | daily digest | single cockpit |
| Action queue generator | Daily | ranked actions | task queue | execution |
| Calendar-aware deployment agent | Daily | calendar + tasks + market state | best action window | timing |
| Reminder / deadline agent | Daily | ISA, tax, debt, reviews | deadline alerts | zero misses |
| Rebalance approval pack | Weekly / monthly | drift + costs + taxes | approval memo | faster decisions |
| Monthly operating review | Monthly | full system | scorecard review | accountability |
| Quarterly allocation review | Quarterly | returns, risk, thesis | re-underwrite pack | real governance |
| Theme retirement agent | Monthly | stale ideas | archive list | avoid clutter |
| Research backlog manager | Weekly | unanswered questions | ranked backlog | clean pipeline |
| Model / agent evaluation loop | Monthly | forecast vs outcome | agent scorecard | system improvement |

---

## The 12 most valuable workflows to build first

If you want maximum ROI fast, build these first:

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

That gets you from “beautiful dashboard” to “real operating system.”

---

## How the workflows should write to the product

The system should create these core state files / tables:

- `portfolio_state`
- `market_regime_state`
- `rates_credit_state`
- `flows_positioning_state`
- `crypto_state`
- `scenario_state`
- `capital_efficiency_state`
- `action_queue_state`
- `watchlist_state`
- `decision_log`
- `weekly_synthesis_state`
- `dashboard_freshness_state`

Then the dashboards read those states.

That is the clean architecture.

---

## Best next build plan

## Phase 1 — make the intelligence honest

- remove fake-live feel
- mark static vs live clearly
- create data freshness indicators
- wire real data feeds for core states

## Phase 2 — make the portfolio machine real

- automate holdings ingestion
- automate risk / drift / wrapper analysis
- automate action ranking

## Phase 3 — make the research engine compounding

- weekly synthesis
- trigger-based memos
- watchlist / opportunity ranking
- decision memory

## Phase 4 — make the dashboards luxurious

Only after the above.

Then push harder on:

- denser tiles
- better callouts
- better cross-links
- glass polish
- adaptive layouts
- executive command center roll-up

---

## Claude Code handoff — important

Can Claude Code implement this?

**Yes — but only if you give it the right package.**

Do **not** just drop in a vague strategy document and hope it improvises the right system.

Give Claude Code:

1. the repo
2. this analysis / blueprint
3. one implementation brief with strict priorities
4. a defined source of truth for market + portfolio states
5. clear rules on what files it may edit
6. a phased build order

Best prompt shape:

- inspect current repo
- preserve architecture
- build Phase 1 first
- create state objects and loaders
- wire top 12 workflows
- keep UI changes secondary to data / logic quality
- add clear freshness indicators
- produce a deployment / QA checklist

In short:

**yes, Claude Code can implement this — but it needs a repo-level implementation brief, not just inspiration.**

---

## Final verdict

The product already has the bones of something extremely good.

The finance module is already close to a real personal CIO system.

The market module has outstanding conceptual breadth, but it now needs to become a **live, agentic intelligence engine** rather than a mostly static research board.

The biggest unlock is not more design.

It is:

- better state architecture,
- better automations,
- better action ranking,
- and ruthless conversion of insight into decisions.

That is how this becomes genuinely elite.
