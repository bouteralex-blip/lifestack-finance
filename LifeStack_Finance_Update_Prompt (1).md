# LIFESTACK FINANCE — LIVE WEB APP UPDATE PROMPT

Paste this entire prompt at the start of any new Claude conversation when you want to update the live dashboard at lifestack-finance.vercel.app.

---

## WHAT THIS IS

I need you to update my live LifeStack Finance web app. This is a production-deployed Next.js dashboard hosted on Vercel, backed by Supabase, with code stored on GitHub. You have the ability to do everything autonomously with my approval at key gates.

## LIVE ARCHITECTURE — DO NOT DEVIATE

The production stack is fully deployed and live. Do not suggest alternative architectures, local development workflows, or manual deployment steps. Work within this stack exactly as described.

**GitHub repo:** `bouteralex-blip/lifestack-finance` (public, `main` branch)
**Vercel project:** `prj_5xoXKPM5DDyiriUC8jgQG5eQTA18`, team `team_yJOnKVnF38JmRAieqsQE3BAs`
**Vercel auto-deploys** from GitHub on every push to `main` — builds in ~25 seconds
**Supabase project:** `ynvfzssakggmmldjkmes` (eu-west-1, PostgreSQL)
**Live URL:** https://lifestack-finance.vercel.app/

## KEY FILES IN THE REPO

The repo contains only these files — do not add new files unless strictly necessary:

- `components/PortfolioVOS.jsx` — the entire 14-tab dashboard component (~2,100 lines)
- `lib/useData.js` — Supabase data hook that maps all 14 tables to component data shapes
- `lib/supabase.js` — Supabase client configuration
- `app/page.js` — Next.js page wrapper
- `app/layout.js` — Next.js layout
- `next.config.js` — Next.js config
- `package.json` — dependencies (react, recharts, @supabase/supabase-js)

## SUPABASE TABLES (14 tables, all with RLS enabled)

portfolio_config (1 row) — PORT object: NW, assets, debts, salary, bonus, expenses, tax rates, FIRE target, benchReturn, inflation
holdings (22 rows) — HOLDINGS array: all positions with value, class, geo, currency, wrapper, previous value
net_worth_history (24 rows) — NW_WEEKLY array: weekly snapshots since Sep 2025
nw_bridge (13 rows) — BRIDGE_ITEMS: NAV waterfall components
risk_metrics (1 row) — RISK object: vol, Sharpe, Sortino, VaR, CVaR, HHI, beta, etc.
crypto_metrics (1 row) — CRYPTO object: BTC price, MVRV, NUPL, Fear/Greed, RSI, SOPR
opportunities (10 rows) — OPPS array: conviction, timing, value, catalysts, kill switches
debts (2 rows) — Amex + Monzo Flex balances
factor_exposures (8 rows) — FACTORS array: factor weights, returns, risk contributions
stress_scenarios (8 rows) — STRESS array: scenario impacts and probabilities
bonus_config (1 row) — gross, tax, NI, post-tax
bonus_scenarios (3 rows) — Defensive, Balanced, Aggressive allocations
monthly_returns (6 rows) — Oct-Mar monthly return percentages + volatility
portfolio_scorecard (1 row) — 7 gauge scores + commentary text

## YOUR AUTONOMOUS DEPLOYMENT WORKFLOW

You MUST follow this workflow for every update. Do not skip steps, do not ask me to do things manually unless a tool genuinely fails after retry.

### Step 1: Clone the repo
```
git clone https://github.com/bouteralex-blip/lifestack-finance.git
```
The repo is public — cloning works without authentication.

### Step 2: Make your code changes
Edit files in the cloned repo using the `str_replace` tool. Key rules:
- **INCREMENTAL ONLY** — add to what exists, never restructure or rewrite entire files
- **Preserve all existing functionality** — Tabs 01-14 must continue working exactly as before unless the update specifically targets them
- **All Sprint 1+ computations go inside T1 (or the relevant tab function)** — this ensures they run after Supabase data overrides apply
- **If adding new Supabase fields**, also update `lib/useData.js` to map them with null-safe fallbacks

### Step 3: Validate syntax
```bash
node -e "const c=require('fs').readFileSync('components/PortfolioVOS.jsx','utf8'); let b=0,p=0,k=0; for(const ch of c){if(ch==='{')b++;if(ch==='}')b--;if(ch==='(')p++;if(ch===')')p--;if(ch==='[')k++;if(ch===']')k--;} console.log('Braces:',b,'Parens:',p,'Brackets:',k);"
```
Expected: Braces 0, Parens 6 (pre-existing offset), Brackets 0. Any deviation = bug introduced.

### Step 4: Update Supabase (if needed)
Use the Supabase MCP connector directly — you have full access:
- `Supabase:execute_sql` for data queries and column additions
- `Supabase:apply_migration` for DDL schema changes
- `Supabase:list_tables` to verify table state

### Step 5: Commit
```bash
cd lifestack-finance
git config user.email "deploy@lifestack.os"
git config user.name "LifeStack Deploy"
git add -A
git commit -m "feat/fix: <descriptive message>"
```

### Step 6: Push to GitHub
You CANNOT push without authentication. Ask me for a temporary GitHub Personal Access Token. The exact phrasing to use:

> "I need a fresh GitHub token to push. 30 seconds on your device:
> 1. github.com/settings/tokens
> 2. Generate new token (classic)
> 3. Name: lifestack-push
> 4. Scope: repo only
> 5. Paste it here"

When I provide the token, push immediately:
```bash
git remote set-url origin https://<TOKEN>@github.com/bouteralex-blip/lifestack-finance.git
git push origin main
```

### Step 7: Verify deployment
Vercel auto-deploys on push. Verify with:
```
Vercel:list_deployments (projectId: prj_5xoXKPM5DDyiriUC8jgQG5eQTA18, teamId: team_yJOnKVnF38JmRAieqsQE3BAs)
```
The latest deployment should show state: READY within 30 seconds. Also fetch the live URL to confirm content has updated.

### Step 8: Remind me to revoke the token
Always say: "Revoke that token now → github.com/settings/tokens"

### Step 9: Full cross-stack audit (MANDATORY — never skip)

After every deployment, run this complete audit and present the results in a structured confirmation. This is not optional.

**9a. GitHub audit**
Verify the commit landed on `main` and check the diff stats:
```bash
cd lifestack-finance
git log --oneline -3
git diff HEAD~1 --stat
```
Confirm: correct commit SHA, correct author ("LifeStack Deploy"), correct number of files changed, no unintended files modified.

**9b. Vercel audit**
Use `Vercel:list_deployments` to confirm the latest build shows state: READY and matches the commit SHA just pushed. Check that no builds are in ERROR state. Fetch `https://lifestack-finance.vercel.app/` via `web_fetch` and verify the page renders with expected content.

**9c. Supabase audit**
Run a row count across all 14 tables to confirm data integrity:
```sql
SELECT 'portfolio_config' as tbl, count(*) as rows FROM portfolio_config
UNION ALL SELECT 'holdings', count(*) FROM holdings
UNION ALL SELECT 'net_worth_history', count(*) FROM net_worth_history
UNION ALL SELECT 'nw_bridge', count(*) FROM nw_bridge
UNION ALL SELECT 'risk_metrics', count(*) FROM risk_metrics
UNION ALL SELECT 'crypto_metrics', count(*) FROM crypto_metrics
UNION ALL SELECT 'opportunities', count(*) FROM opportunities
UNION ALL SELECT 'debts', count(*) FROM debts
UNION ALL SELECT 'factor_exposures', count(*) FROM factor_exposures
UNION ALL SELECT 'stress_scenarios', count(*) FROM stress_scenarios
UNION ALL SELECT 'bonus_config', count(*) FROM bonus_config
UNION ALL SELECT 'bonus_scenarios', count(*) FROM bonus_scenarios
UNION ALL SELECT 'monthly_returns', count(*) FROM monthly_returns
UNION ALL SELECT 'portfolio_scorecard', count(*) FROM portfolio_scorecard
ORDER BY tbl;
```
If any Supabase schema changes were made in this session, verify the new columns exist and contain correct values.

**9d. Code integrity audit**
Run syntax balance check on the pushed JSX:
```bash
node -e "const c=require('fs').readFileSync('components/PortfolioVOS.jsx','utf8'); let b=0,p=0,k=0; for(const ch of c){if(ch==='{')b++;if(ch==='}')b--;if(ch==='(')p++;if(ch===')')p--;if(ch==='[')k++;if(ch===']')k--;} console.log('Braces:',b,'Parens:',p,'Brackets:',k);"
```
Expected: Braces 0, Parens 6, Brackets 0.

Verify all 14 tab functions exist and their routing is intact:
```bash
for t in T1 T2 T3 T4 T5 T6 T7 T8 T9 T10 T11 T12 T13 T14; do echo -n "$t: line "; grep -n "^const $t " components/PortfolioVOS.jsx | cut -d: -f1; done
grep "case \"exec\"\|case \"struct\"\|case \"perf\"\|case \"risk\"\|case \"stress\"\|case \"cash\"\|case \"bonus\"\|case \"opp\"\|case \"eff\"\|case \"long\"\|case \"crypto\"\|case \"act\"\|case \"tax\"\|case \"gloss\"" components/PortfolioVOS.jsx
```

Verify that tabs NOT targeted by this update were not modified:
```bash
git diff HEAD~1 -- components/PortfolioVOS.jsx | grep "^@@" 
```
Cross-reference the changed line ranges against each tab's starting line to confirm only targeted tabs were touched.

**9e. Supabase ↔ useData.js mapping check**
If any new Supabase columns were added, verify `lib/useData.js` maps them to the component data shape with null-safe fallback defaults. If this mapping is missing, fix it and push a hotfix immediately before completing the audit.

**9f. Bug sweep**
Review the changes for common issues: operator precedence bugs in new calculations, undefined references to variables not yet declared, missing fallbacks when Supabase returns null, and any hardcoded values that should be reading from PORT/HOLDINGS/RISK after Supabase override.

### Step 10: Deliver the audit confirmation

After completing all checks in Step 9, present a structured confirmation to Alex covering:

1. **GitHub** — commit SHA, files changed, diff stats
2. **Vercel** — deployment ID, state (READY/ERROR), build time
3. **Supabase** — 14-table row count confirmation, any schema changes noted
4. **Code integrity** — syntax balance, all 14 tabs present, untouched tabs confirmed
5. **Bugs found** — list any issues discovered and whether they were fixed in a hotfix commit
6. **Final verdict** — one sentence confirming the update is live and fully functional, or flagging any outstanding issues

End with: "Sprint [X] is fully deployed and audited across GitHub, Vercel, Supabase, and the live site. Revoke your token now → github.com/settings/tokens"

## CRITICAL RULES

1. **DO NOT suggest I deploy manually.** You have the tools. Use them. The only thing I do manually is generate a GitHub token when prompted — everything else is your job.

2. **DO NOT restructure the codebase.** The single-file component architecture in PortfolioVOS.jsx is intentional. Do not split it into multiple files, add new pages, or change the routing.

3. **DO NOT modify Tabs you weren't asked to modify.** If the task is "add a chart to Tab 04", touch only T4. Run the audit grep to prove other tabs are unchanged.

4. **ALWAYS complete the full Step 9 audit after pushing.** This is mandatory. Never skip it, never abbreviate it. Run every check (GitHub, Vercel, Supabase, code integrity, useData mapping, bug sweep) and present the Step 10 structured confirmation. If the audit catches bugs, fix them in a hotfix commit and re-run the audit before delivering the confirmation.

5. **Work from the cloned GitHub repo, not from uploaded files.** The repo is the single source of truth. Uploaded files may be from earlier versions.

6. **Supabase data flow:** The component declares hardcoded defaults (`let PORT = {...}`, `let HOLDINGS = [...]`, etc.), then the `useSupabaseData()` hook fetches from all 14 tables and overrides them on mount. Any new computed values must be calculated INSIDE the tab function (after the override), not at module scope.

## WHAT I WILL PROVIDE WITH THIS PROMPT

Below this master prompt I will describe what I want changed. This could be:
- Adding new analysis blocks or charts to specific tabs
- Updating data values in Supabase
- Fixing bugs or visual issues
- Redesigning specific components
- Adding entirely new tabs or features

---

## MY UPDATE REQUEST:

[I will describe what I want here]
