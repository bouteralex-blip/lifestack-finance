// =========================================================================
// LIFESTACK OS — DEFAULT / FALLBACK DATA
// Extracted from PortfolioVOS.jsx and MarketsModule.jsx
// These values are used when Supabase data is unavailable or stale.
// Each object mirrors the live Supabase table schema exactly.
// =========================================================================

export const DEFAULT_PORT = {
  date: "7 March 2026", age: 32,
  netWorth: 362072, assets: 375670, debts: 13598,
  nw6moAgo: 397457, nwPeak: 394637,
  grossSalary: 170000, grossBonus: 170000,
  monthlyExpenses: 6000, taxRate: 0.45, niRate: 0.02,
  fireTarget: 1800000,
  amexDebt: 10652, monzoFlex: 2946,
  benchReturn: -0.028, inflation: 0.032,
};

export const DEFAULT_HOLDINGS = [
  { name: "Daiwa Pension", val: 82133, cls: "Pension", geo: "Global", ccy: "GBP", prev: 63851 },
  { name: "Fixed Deposit (5%)", val: 45786, cls: "Cash/FD", geo: "UK", ccy: "GBP", prev: 42631 },
  { name: "JURE.L (US Res Enhanced)", val: 32477, cls: "ETF", geo: "US", ccy: "USD", prev: 29971 },
  { name: "BTC (Bitcoin)", val: 29854, cls: "Crypto", geo: "Global", ccy: "USD", prev: 49310 },
  { name: "ZAR Investment (R450k)", val: 27615, cls: "Investment", geo: "SA", ccy: "ZAR", prev: 22790 },
  { name: "JGEP.L (Global Res Enh)", val: 23220, cls: "ETF", geo: "Global", ccy: "GBP-H", prev: 21579 },
  { name: "JUKC.L (UK Equity Core)", val: 18118, cls: "ETF", geo: "UK", ccy: "GBP", prev: 15604 },
  { name: "Monzo GIA", val: 18085, cls: "Investment", geo: "UK", ccy: "GBP", prev: 16277 },
  { name: "EasyCrypto 10", val: 15845, cls: "Crypto", geo: "Global", ccy: "ZAR", prev: 28508 },
  { name: "Monzo Rainy Day", val: 15752, cls: "Cash", geo: "UK", ccy: "GBP", prev: 33978 },
  { name: "WLDS.L (World Small Cap)", val: 8602, cls: "ETF", geo: "Global", ccy: "USD", prev: 7832 },
  { name: "JERE.L (Europe Res Enh)", val: 7431, cls: "ETF", geo: "Europe", ccy: "EUR", prev: 7383 },
  { name: "JMRE.L (EM Res Enhanced)", val: 6843, cls: "ETF", geo: "EM", ccy: "USD", prev: 9107 },
  { name: "JRAE.L (Asia Pac ex-JP)", val: 4342, cls: "ETF", geo: "Asia", ccy: "USD", prev: 1254 },
  { name: "Satrix Nasdaq 100", val: 4078, cls: "Stock", geo: "US", ccy: "ZAR", prev: 3785 },
  { name: "Satrix S&P 500", val: 4009, cls: "Stock", geo: "US", ccy: "ZAR", prev: 3723 },
  { name: "JRJE.L (Japan Res Enh)", val: 3856, cls: "ETF", geo: "Japan", ccy: "USD", prev: 3551 },
  { name: "ETH (Ethereum)", val: 2986, cls: "Crypto", geo: "Global", ccy: "USD", prev: 6545 },
  { name: "Satrix MSCI World", val: 2826, cls: "Stock", geo: "Global", ccy: "ZAR", prev: 2625 },
  { name: "Satrix MSCI EM", val: 2657, cls: "Stock", geo: "EM", ccy: "ZAR", prev: 2468 },
  { name: "SOL (Solana)", val: 1570, cls: "Crypto", geo: "Global", ccy: "USD", prev: 4318 },
  { name: "Small positions (18)", val: 17562, cls: "Mixed", geo: "Mixed", ccy: "Mixed", prev: 16226 },
];

export const DEFAULT_NW_WEEKLY = [
  { d: "20 Sep", nw: 397457, a: 400994 }, { d: "27 Sep", nw: 387516, a: 392212 },
  { d: "4 Oct", nw: 394637, a: 399705 }, { d: "18 Oct", nw: 389286, a: 397849 },
  { d: "25 Oct", nw: 389424, a: 397250 }, { d: "1 Nov", nw: 363661, a: 373153 },
  { d: "8 Nov", nw: 375754, a: 385877 }, { d: "15 Nov", nw: 372267, a: 382788 },
  { d: "22 Nov", nw: 368211, a: 378201 }, { d: "29 Nov", nw: 371549, a: 382372 },
  { d: "6 Dec", nw: 369324, a: 380993 }, { d: "13 Dec", nw: 367429, a: 379814 },
  { d: "20 Dec", nw: 366889, a: 378921 }, { d: "27 Dec", nw: 366185, a: 378216 },
  { d: "3 Jan", nw: 368441, a: 380127 }, { d: "10 Jan", nw: 363951, a: 377182 },
  { d: "17 Jan", nw: 371074, a: 384717 }, { d: "24 Jan", nw: 361981, a: 375017 },
  { d: "31 Jan", nw: 354723, a: 367759 }, { d: "7 Feb", nw: 349270, a: 362306 },
  { d: "14 Feb", nw: 347680, a: 360902 }, { d: "21 Feb", nw: 353367, a: 366023 },
  { d: "28 Feb", nw: 350707, a: 363363 }, { d: "7 Mar", nw: 362072, a: 375670 },
];

export const DEFAULT_BRIDGE_ITEMS = [
  { name: "NW 20 Sep 25", delta: 0, type: "anchor" },
  { name: "Salary Savings", delta: 8000, type: "inflow" },
  { name: "Bonus Deploy", delta: 14000, type: "inflow" },
  { name: "Employer Pension", delta: 6800, type: "inflow" },
  { name: "Pension Reval", delta: 16800, type: "market" },
  { name: "Equity ETF Gains", delta: 13600, type: "market" },
  { name: "Crypto Losses", delta: -52200, type: "market" },
  { name: "FX / ZAR Gains", delta: 5700, type: "market" },
  { name: "Interest (FD+Cash)", delta: 3200, type: "market" },
  { name: "Fees & Drag", delta: -2600, type: "drag" },
  { name: "Cash Drawdown", delta: -25900, type: "outflow" },
  { name: "Debt Increase", delta: -10061, type: "debt" },
  { name: "Other / Timing", delta: -12724, type: "drag" },
];

export const DEFAULT_RISK = {
  vol: 22.4, downDev: 16.8, sharpe: 0.42, sortino: 0.58, calmar: 0.34, omega: 1.16,
  maxDD: -14.2, ddDur: 78, ulcer: 8.2, var95: -3.8, cvar95: -6.2, cdar: -12.8,
  tail: 0.96, pain: 4.6, painR: 0.38, gtp: 1.14, burke: 0.32, sterling: 0.26, martin: 0.22,
  csr: 1.09, beta: 0.68, te: 14.8, ir: -0.18, treynor: 5.4, m2: 4.1,
  skew: -0.52, kurt: 5.4, hhi: 0.065, effPos: 15.4, divRatio: 1.52, entropy: 2.68,
};

export const DEFAULT_CRYPTO = {
  btcPrice: 68200, btcATH: 126000, btcDD: -45.9, mvrvZ: 0.49, nupl: 0.10, fear: 18,
  reserves: "2.48M ATL", funding: 0.01, dom: 58.2, rsi: 27.5, sopr: 0.95,
  reserveRisk: 0.001, whale: "270K BTC", etfFlow: "+$500M 5 Mar", ethPrice: 1975, solPrice: 86,
};

export const DEFAULT_FACTORS = [
  { f: "Equity Beta", p: 68, b: 100, ret: 4.2, risk: 24, intent: "Yes" },
  { f: "Growth/Tech", p: 30, b: 45, ret: -0.8, risk: 7, intent: "Reduced" },
  { f: "Value/Cyclical", p: 54, b: 35, ret: 3.2, risk: 6, intent: "Accidental OW" },
  { f: "Quality", p: 48, b: 40, ret: 0.4, risk: 4, intent: "Neutral" },
  { f: "Momentum", p: 16, b: 30, ret: -0.5, risk: 2, intent: "Accidental UW" },
  { f: "Crypto Beta", p: 38, b: 0, ret: -8.4, risk: 32, intent: "Intentional" },
  { f: "UK Domestic", p: 52, b: 5, ret: 2.6, risk: 6, intent: "Home bias" },
  { f: "EM/ZAR FX", p: 38, b: 12, ret: 1.6, risk: 8, intent: "Partial" },
];

export const DEFAULT_STRESS = [
  { s: "Equities -20%", impact: -9.8, exp: "£109K equity ETFs", pr: "15%" },
  { s: "Crypto -40%", impact: -5.6, exp: "£50K crypto sleeve", pr: "20%" },
  { s: "BTC -60%", impact: -4.9, exp: "£30K BTC direct", pr: "10%" },
  { s: "GBP/USD -10%", impact: 3.2, exp: "USD assets gain", pr: "25%" },
  { s: "ZAR -20%", impact: -2.0, exp: "£28K ZAR exposure", pr: "20%" },
  { s: "Combined Risk-Off", impact: -16.8, exp: "Eq-20%+Crypto-40%", pr: "5%" },
  { s: "Iran Escalation", impact: -4.2, exp: "Oil $120, rates spike", pr: "20%" },
  { s: "Stagflation (UK)", impact: -8.4, exp: "Rates+4%, FTSE-15%", pr: "10%" },
];

export const DEFAULT_BONUS = {
  gross: 170000, tax: 78200, ni: 3400, postTax: 88400,
  def: { debt: 13598, isa: 20000, pension: 10000, equity: 0, crypto: 0, liq: 34802, travel: 10000, yr1: 3200, yr3: 12400, yr5: 24800 },
  bal: { debt: 13598, isa: 20000, pension: 15000, equity: 10000, crypto: 5000, ai: 5000, liq: 12802, travel: 7000, yr1: 7800, yr3: 32400, yr5: 68200 },
  agg: { debt: 13598, isa: 20000, pension: 15000, equity: 8000, crypto: 10000, ai: 8000, liq: 5802, travel: 8000, yr1: 10200, yr3: 45800, yr5: 98400 },
};

export const DEFAULT_OPPS = [
  { t: "Wrapper Optimisation Alpha", c: 10, tm: 10, alpha: "80-120bps/yr", w: "ISA+SIPP", sz: "£35k", cat: "ISA deadline 5 April - 29 days", risks: ["Rule changes"], kill: "None", val: 7500 },
  { t: "AI Infrastructure / Semis", c: 9, tm: 7, alpha: "300-500bps/yr", w: "S&S ISA", sz: "5-8% NAV", cat: "Q2 hyperscaler capex, Blackwell", risks: ["Export controls", "Valuation"], kill: "ASML cancellations >20%", val: 6000 },
  { t: "Quality Global Equities", c: 8, tm: 8, alpha: "150-250bps/yr", w: "ISA/SIPP", sz: "8-12% NAV", cat: "Broadening rotation", risks: ["Recession", "Derating"], kill: "ROIC <12% sustained", val: 5400 },
  { t: "BTC Accumulation", c: 7, tm: 9, alpha: "Asymmetric", w: "GIA (CGT)", sz: "Maintain 8%", cat: "On-chain extreme fear, whale buying", risks: ["Regulatory", "Correlation"], kill: "Below 200-wk MA w/ volume", val: 4800 },
  { t: "Intl Value Tilt", c: 7, tm: 8, alpha: "200-400bps/yr", w: "GIA/ISA", sz: "5-10% NAV", cat: "Value rotation + USD weakness", risks: ["US growth resurgence"], kill: "Growth > Value 3 qtrs", val: 4200 },
  { t: "Salary Sacrifice Optimisation", c: 10, tm: 10, alpha: "600bps effective", w: "SIPP", sz: "£15k/yr", cat: "60% effective rate in £100-125k band", risks: ["Pension rule changes"], kill: "Income drops below £100k", val: 6750 },
  { t: "Bed & ISA Strategy", c: 8, tm: 9, alpha: "100-180bps/yr", w: "ISA", sz: "£3k CGT/yr", cat: "Annual CGT allowance crystallisation", risks: ["Market timing on rebuy"], kill: "None", val: 1800 },
  { t: "UK Infrastructure / Renewables", c: 6, tm: 6, alpha: "150-300bps/yr", w: "ISA", sz: "3-5% NAV", cat: "UK energy transition, grid investment", risks: ["Policy reversal", "Rate sensitivity"], kill: "Gilt yields >5.5%", val: 2400 },
  { t: "EM Small Cap Recovery", c: 5, tm: 5, alpha: "200-400bps/yr", w: "GIA", sz: "2-4% NAV", cat: "EM valuations at 20yr discount to DM", risks: ["China slowdown", "FX"], kill: "EM/DM spread widens >2 std dev", val: 1600 },
  { t: "Gold / Commodities Hedge", c: 5, tm: 7, alpha: "50-100bps/yr", w: "GIA", sz: "2-3% NAV", cat: "Inflation hedge, geopolitical tail risk", risks: ["Disinflation", "Opportunity cost"], kill: "Core CPI <2% sustained", val: 900 },
];

export const DEFAULT_MONTHLY = [
  { m: "Oct", r: -2.1, vol: 18.2 }, { m: "Nov", r: -6.8, vol: 32.4 }, { m: "Dec", r: -1.2, vol: 24.1 },
  { m: "Jan", r: -0.5, vol: 20.8 }, { m: "Feb", r: -4.2, vol: 26.2 }, { m: "Mar", r: 3.2, vol: 19.6 },
];

export const DEFAULT_SCORECARD = {
  overall: 5.2, returns: 3.8, riskMgmt: 5.4, process: 4.2, taxEff: 6.0, diversify: 7.6, capitalEff: 4.4,
  commentary: "Overall 5.2/10 reflects strong diversification (7.6) offset by poor returns (3.8) driven by the crypto correction. Tax efficiency (6.0) is improving but 47% GIA exposure remains a drag. Process (4.2) is weak from missing rebalancing discipline and no IPS.",
};

// Freshness rules — how long before data is considered stale (in hours)
export const FRESHNESS_RULES = {
  portfolio_config: 168,    // 7 days — weekly update cycle
  holdings: 168,            // 7 days — weekly Kubera extract
  net_worth_history: 168,   // 7 days — weekly snapshot
  nw_bridge: 720,           // 30 days — monthly recalculation
  risk_metrics: 168,        // 7 days — recompute weekly
  crypto_metrics: 24,       // 24 hours — crypto moves fast
  opportunities: 168,       // 7 days — weekly review
  factor_exposures: 168,    // 7 days — weekly rebalance check
  stress_scenarios: 720,    // 30 days — monthly stress test
  bonus_config: 2160,       // 90 days — quarterly bonus review
  bonus_scenarios: 2160,    // 90 days — quarterly
  monthly_returns: 720,     // 30 days — monthly update
  portfolio_scorecard: 168, // 7 days — weekly governance
  reference_data: 2160,     // 90 days — rarely changes
};
