'use client';

import { useState, useEffect } from "react";
import { useSupabaseData } from '../lib/useData';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, ReferenceLine, Line } from "recharts";

// =========================================================================
// LIFESTACK OS vOS — ORION GLASS · LIGHT MODE · INSTITUTIONAL REVIEW
// Pure visual reskin of v5.4 — zero data/analytics changes
// =========================================================================

// --- PALETTE: Institutional light mode — Finance accent: amber/gold ---
const P = {
  bg:"#f0f2f8",
  // Primary accent — Finance module identity (amber/gold cascade)
  cyan:"#6366f1",cyanD:"rgba(99,102,241,0.10)",cyanG:"rgba(99,102,241,0.04)",
  indigo:"#818cf8",indigoD:"rgba(129,140,248,0.10)",
  amber:"#f59e0b",amberD:"rgba(245,158,11,0.08)",
  red:"#ef4444",redD:"rgba(239,68,68,0.08)",
  green:"#22c55e",greenD:"rgba(34,197,94,0.08)",
  purple:"#a855f7",orange:"#fb923c",btc:"#f7931a",pink:"#ec4899",
  teal:"#14b8a6",sky:"#0ea5e9",
  // Semantic colours for sentiment pair (teal = positive, coral = negative)
  positive:"#14b8a6",negative:"#f43f5e",
  // Typography hierarchy
  t1:"#0f172a",t2:"#334155",t3:"#64748b",t4:"#94a3b8",t5:"#cbd5e1",
  // Border / separator system
  b1:"rgba(0,0,0,0.08)",b2:"rgba(0,0,0,0.04)",b3:"rgba(0,0,0,0.02)",
  // Monospace font stack
  mono:"'JetBrains Mono','SF Mono','Cascadia Code',monospace",
  // Card accent glow presets
  accentFinance:"#f59e0b",
};

// --- LIQUID GLASS SYSTEM: Playbook-compliant layered surface ---
// Stack: outer shell (material) + inner plate (readability) + content (text/icons)
// Light model: locked at 135deg top-left. Edge discipline: border + highlight + inner stroke.
// Tiers: Glass-1 (dense/readable), Glass-2 (default), Glass-3 (overlay/cinematic)
const glassLight = (tier=2) => {
  // Plate strength scales with density need — stronger plate = more readable
  const plate = tier===1?0.32:tier===3?0.08:0.18;
  // Blur is secondary — edge cues carry the material, not fog
  const blur = tier===1?18:tier===3?28:22;
  // Border alpha — crisp edge discipline
  const borderA = tier===1?0.50:tier===3?0.25:0.38;
  // Highlight band — locked 135deg, subtle but consistent
  const hlA = tier===1?0.06:tier===3?0.16:0.10;
  // Inner stroke — cross-section hint
  const inA = tier===1?0.40:tier===3?0.20:0.30;
  return {
    background:`rgba(255,255,255,${plate})`,
    backdropFilter:`blur(${blur}px) saturate(1.6)`,
    WebkitBackdropFilter:`blur(${blur}px) saturate(1.6)`,
    border:`1px solid rgba(255,255,255,${borderA})`,
    borderRadius:18,
    boxShadow:`0 8px 32px rgba(0,0,0,0.08), 0 20px 60px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,${inA}), inset 0 0 0 1px rgba(255,255,255,${inA*0.4})`,
    backgroundImage:`linear-gradient(135deg, rgba(255,255,255,${hlA}), transparent 50%)`,
  };
};
const G = glassLight(2);
const G1 = glassLight(1);
const G3 = glassLight(3);
const GS = {
  background:"rgba(15,23,42,0.94)",
  backdropFilter:"blur(24px) saturate(1.2)",WebkitBackdropFilter:"blur(24px) saturate(1.2)",
  border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,
  boxShadow:"0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
};
let PORT = {
  date:"7 March 2026",age:32,
  netWorth:362072, assets:375670, debts:13598,
  nw6moAgo:397457, nwPeak:394637,
  grossSalary:170000, grossBonus:170000,
  monthlyExpenses:6000, taxRate:0.45, niRate:0.02,
  fireTarget:1800000,
  amexDebt:10652, monzoFlex:2946,
  benchReturn:-0.028, inflation:0.032,
};
let nwReturn = ((PORT.netWorth - PORT.nw6moAgo) / PORT.nw6moAgo * 100);

let NW_WEEKLY = [
  {d:"20 Sep",nw:397457,a:400994},{d:"27 Sep",nw:387516,a:392212},
  {d:"4 Oct",nw:394637,a:399705},{d:"18 Oct",nw:389286,a:397849},
  {d:"25 Oct",nw:389424,a:397250},{d:"1 Nov",nw:363661,a:373153},
  {d:"8 Nov",nw:375754,a:385877},{d:"15 Nov",nw:372267,a:382788},
  {d:"22 Nov",nw:368211,a:378201},{d:"29 Nov",nw:371549,a:382372},
  {d:"6 Dec",nw:369324,a:380993},{d:"13 Dec",nw:367429,a:379814},
  {d:"20 Dec",nw:366889,a:378921},{d:"27 Dec",nw:366185,a:378216},
  {d:"3 Jan",nw:368441,a:380127},{d:"10 Jan",nw:363951,a:377182},
  {d:"17 Jan",nw:371074,a:384717},{d:"24 Jan",nw:361981,a:375017},
  {d:"31 Jan",nw:354723,a:367759},{d:"7 Feb",nw:349270,a:362306},
  {d:"14 Feb",nw:347680,a:360902},{d:"21 Feb",nw:353367,a:366023},
  {d:"28 Feb",nw:350707,a:363363},{d:"7 Mar",nw:362072,a:375670},
];

let NW_DD = NW_WEEKLY.map(w => ({d: w.d, dd: ((w.nw - PORT.nwPeak) / PORT.nwPeak * 100)}));

let HOLDINGS = [
  {name:"Daiwa Pension",val:82133,cls:"Pension",geo:"Global",ccy:"GBP",prev:63851},
  {name:"Fixed Deposit (5%)",val:45786,cls:"Cash/FD",geo:"UK",ccy:"GBP",prev:42631},
  {name:"JURE.L (US Res Enhanced)",val:32477,cls:"ETF",geo:"US",ccy:"USD",prev:29971},
  {name:"BTC (Bitcoin)",val:29854,cls:"Crypto",geo:"Global",ccy:"USD",prev:49310},
  {name:"ZAR Investment (R450k)",val:27615,cls:"Investment",geo:"SA",ccy:"ZAR",prev:22790},
  {name:"JGEP.L (Global Res Enh)",val:23220,cls:"ETF",geo:"Global",ccy:"GBP-H",prev:21579},
  {name:"JUKC.L (UK Equity Core)",val:18118,cls:"ETF",geo:"UK",ccy:"GBP",prev:15604},
  {name:"Monzo GIA",val:18085,cls:"Investment",geo:"UK",ccy:"GBP",prev:16277},
  {name:"EasyCrypto 10",val:15845,cls:"Crypto",geo:"Global",ccy:"ZAR",prev:28508},
  {name:"Monzo Rainy Day",val:15752,cls:"Cash",geo:"UK",ccy:"GBP",prev:33978},
  {name:"WLDS.L (World Small Cap)",val:8602,cls:"ETF",geo:"Global",ccy:"USD",prev:7832},
  {name:"JERE.L (Europe Res Enh)",val:7431,cls:"ETF",geo:"Europe",ccy:"EUR",prev:7383},
  {name:"JMRE.L (EM Res Enhanced)",val:6843,cls:"ETF",geo:"EM",ccy:"USD",prev:9107},
  {name:"JRAE.L (Asia Pac ex-JP)",val:4342,cls:"ETF",geo:"Asia",ccy:"USD",prev:1254},
  {name:"Satrix Nasdaq 100",val:4078,cls:"Stock",geo:"US",ccy:"ZAR",prev:3785},
  {name:"Satrix S&P 500",val:4009,cls:"Stock",geo:"US",ccy:"ZAR",prev:3723},
  {name:"JRJE.L (Japan Res Enh)",val:3856,cls:"ETF",geo:"Japan",ccy:"USD",prev:3551},
  {name:"ETH (Ethereum)",val:2986,cls:"Crypto",geo:"Global",ccy:"USD",prev:6545},
  {name:"Satrix MSCI World",val:2826,cls:"Stock",geo:"Global",ccy:"ZAR",prev:2625},
  {name:"Satrix MSCI EM",val:2657,cls:"Stock",geo:"EM",ccy:"ZAR",prev:2468},
  {name:"SOL (Solana)",val:1570,cls:"Crypto",geo:"Global",ccy:"USD",prev:4318},
  {name:"Small positions (18)",val:17562,cls:"Mixed",geo:"Mixed",ccy:"Mixed",prev:16226},
];

let totalAssets = PORT.assets;
let byClass = {};
HOLDINGS.forEach(h => { byClass[h.cls] = (byClass[h.cls]||0) + h.val; });
let SLEEVES = [
  {name:"ETFs (JPM+iShares)",val:byClass.ETF||0,color:P.cyan},
  {name:"Pension",val:byClass.Pension||0,color:"#06b6d4"},
  {name:"Cash / FD",val:(byClass.Cash||0)+(byClass["Cash/FD"]||0),color:"#64748b"},
  {name:"Crypto",val:byClass.Crypto||0,color:P.btc},
  {name:"Investments",val:byClass.Investment||0,color:P.indigo},
  {name:"Stocks (Satrix)",val:byClass.Stock||0,color:P.purple},
  {name:"Mixed (small)",val:byClass.Mixed||0,color:P.orange},
].map(s=>({...s,pct:+(s.val/totalAssets*100).toFixed(1)}));

let cryptoTotal = 29854+15845+2986+1570+57;
let cryptoPrev = 49310+28508+6545+4318+81;

let BRIDGE_ITEMS = [
  {name:"NW 20 Sep 25",delta:0,type:"anchor"},
  {name:"Salary Savings",delta:8000,type:"inflow"},
  {name:"Bonus Deploy",delta:14000,type:"inflow"},
  {name:"Employer Pension",delta:6800,type:"inflow"},
  {name:"Pension Reval",delta:16800,type:"market"},
  {name:"Equity ETF Gains",delta:13600,type:"market"},
  {name:"Crypto Losses",delta:-52200,type:"market"},
  {name:"FX / ZAR Gains",delta:5700,type:"market"},
  {name:"Interest (FD+Cash)",delta:3200,type:"market"},
  {name:"Fees & Drag",delta:-2600,type:"drag"},
  {name:"Cash Drawdown",delta:-25900,type:"outflow"},
  {name:"Debt Increase",delta:-10061,type:"debt"},
  {name:"Other / Timing",delta:-12724,type:"drag"},
];
let running = PORT.nw6moAgo;
let BRIDGE = BRIDGE_ITEMS.map((b,i)=>{
  if(i===0) return {...b,start:0,end:PORT.nw6moAgo,cumulative:PORT.nw6moAgo};
  const start = running;
  running += b.delta;
  return {...b,start:Math.min(start,running),end:Math.max(start,running),cumulative:running};
});

let RISK = {
  vol:22.4,downDev:16.8,sharpe:0.42,sortino:0.58,calmar:0.34,omega:1.16,
  maxDD:-14.2,ddDur:78,ulcer:8.2,var95:-3.8,cvar95:-6.2,cdar:-12.8,
  tail:0.96,pain:4.6,painR:0.38,gtp:1.14,burke:0.32,sterling:0.26,martin:0.22,
  csr:1.09,beta:0.68,te:14.8,ir:-0.18,treynor:5.4,m2:4.1,
  skew:-0.52,kurt:5.4,hhi:0.065,effPos:15.4,divRatio:1.52,entropy:2.68,
};

let FACTORS = [
  {f:"Equity Beta",p:68,b:100,ret:4.2,risk:24,intent:"Yes"},
  {f:"Growth/Tech",p:30,b:45,ret:-0.8,risk:7,intent:"Reduced"},
  {f:"Value/Cyclical",p:54,b:35,ret:3.2,risk:6,intent:"Accidental OW"},
  {f:"Quality",p:48,b:40,ret:0.4,risk:4,intent:"Neutral"},
  {f:"Momentum",p:16,b:30,ret:-0.5,risk:2,intent:"Accidental UW"},
  {f:"Crypto Beta",p:38,b:0,ret:-8.4,risk:32,intent:"Intentional"},
  {f:"UK Domestic",p:52,b:5,ret:2.6,risk:6,intent:"Home bias"},
  {f:"EM/ZAR FX",p:38,b:12,ret:1.6,risk:8,intent:"Partial"},
];

let CRYPTO = {
  btcPrice:68200,btcATH:126000,btcDD:-45.9,mvrvZ:0.49,nupl:0.10,fear:18,
  reserves:"2.48M ATL",funding:0.01,dom:58.2,rsi:27.5,sopr:0.95,
  reserveRisk:0.001,whale:"270K BTC",etfFlow:"+$500M 5 Mar",ethPrice:1975,solPrice:86,
};

let STRESS = [
  {s:"Equities -20%",impact:-9.8,exp:"£109K equity ETFs",pr:"15%"},
  {s:"Crypto -40%",impact:-5.6,exp:"£50K crypto sleeve",pr:"20%"},
  {s:"BTC -60%",impact:-4.9,exp:"£30K BTC direct",pr:"10%"},
  {s:"GBP/USD -10%",impact:3.2,exp:"USD assets gain",pr:"25%"},
  {s:"ZAR -20%",impact:-2.0,exp:"£28K ZAR exposure",pr:"20%"},
  {s:"Combined Risk-Off",impact:-16.8,exp:"Eq-20%+Crypto-40%",pr:"5%"},
  {s:"Iran Escalation",impact:-4.2,exp:"Oil $120, rates spike",pr:"20%"},
  {s:"Stagflation (UK)",impact:-8.4,exp:"Rates+4%, FTSE-15%",pr:"10%"},
];

// 5 Forecast Scenarios — computed from PORT assumptions (to 2035)
const computeScenario = (retPa, alphaBoost=0) => {
  let fin = PORT.netWorth / 1000;
  const salaryK = PORT.grossSalary / 1000;
  const expK = PORT.monthlyExpenses * 12 / 1000;
  const pts = [];
  for(let yr=2026; yr<=2035; yr++) {
    const t = yr - 2026;
    const salary = salaryK * Math.pow(1.15, t);
    const net = (salary * 2) * (1 - PORT.taxRate - PORT.niRate);
    const exp = expK * Math.pow(1.15, t);
    const save = net - exp;
    if(t > 0) fin = fin * (1 + retPa + alphaBoost) + save;
    pts.push({y:yr, v:Math.round(fin)});
  }
  return pts;
};
let SC_CONSERV = computeScenario(0.08);
let SC_BASE = computeScenario(0.15);
let SC_WRAPPER = computeScenario(0.15, 0.012);
let SC_ALLOPPS = computeScenario(0.15, 0.025);
let SC_BULL = computeScenario(0.15, 0.04);

let WEALTH_5 = SC_BASE.map((b,i) => ({
  y: b.y,
  conservative: SC_CONSERV[i].v,
  base: b.v,
  wrapperAlpha: SC_WRAPPER[i].v,
  allOpps: SC_ALLOPPS[i].v,
  bull: SC_BULL[i].v,
}));

// NW Trend + Forecast overlay data (historical + 5 scenarios from Mar 2026)
let NW_FORECAST = [
  ...NW_WEEKLY.map(w=>({d:w.d,nw:w.nw,a:w.a,type:"hist"})),
  ...SC_BASE.slice(1).map(s=>({d:`${s.y}`,nw:null,a:null,base:s.v*1000,conserv:SC_CONSERV.find(c=>c.y===s.y)?.v*1000,bull:SC_BULL.find(c=>c.y===s.y)?.v*1000,allOpps:SC_ALLOPPS.find(c=>c.y===s.y)?.v*1000,wrapper:SC_WRAPPER.find(c=>c.y===s.y)?.v*1000,type:"forecast"})),
];

// Human Capital model — to 2035
let HC_DATA = (() => {
  const pts = [];
  let fin = PORT.netWorth/1000;
  for(let yr=2026; yr<=2035; yr++) {
    const t = yr - 2026;
    const age = PORT.age + t;
    const salary = (PORT.grossSalary/1000) * Math.pow(1.15, t);
    const net = (salary * 2) * (1-PORT.taxRate-PORT.niRate);
    const exp = (PORT.monthlyExpenses*12/1000) * Math.pow(1.15, t);
    const save = net - exp;
    if(t > 0) fin = fin * 1.15 + save;
    const yearsLeft = Math.max(55 - age, 0);
    let hc = 0;
    for(let y=0; y<yearsLeft; y++) {
      hc += (net * Math.pow(1.15, y)) / Math.pow(1.07, y);
    }
    pts.push({y:yr, fin:Math.round(fin), hc:Math.round(hc), total:Math.round(fin+hc)});
  }
  return pts;
})();

let BONUS = {
  gross:170000,tax:78200,ni:3400,postTax:88400,
  def:{debt:13598,isa:20000,pension:10000,equity:0,crypto:0,liq:34802,travel:10000,yr1:3200,yr3:12400,yr5:24800},
  bal:{debt:13598,isa:20000,pension:15000,equity:10000,crypto:5000,ai:5000,liq:12802,travel:7000,yr1:7800,yr3:32400,yr5:68200},
  agg:{debt:13598,isa:20000,pension:15000,equity:8000,crypto:10000,ai:8000,liq:5802,travel:8000,yr1:10200,yr3:45800,yr5:98400},
};

let OPPS = [
  {t:"Wrapper Optimisation Alpha",c:10,tm:10,alpha:"80-120bps/yr",w:"ISA+SIPP",sz:"£35k",cat:"ISA deadline 5 April - 29 days",risks:["Rule changes"],kill:"None",col:P.cyan,val:7500},
  {t:"AI Infrastructure / Semis",c:9,tm:7,alpha:"300-500bps/yr",w:"S&S ISA",sz:"5-8% NAV",cat:"Q2 hyperscaler capex, Blackwell",risks:["Export controls","Valuation"],kill:"ASML cancellations >20%",col:P.indigo,val:6000},
  {t:"Quality Global Equities",c:8,tm:8,alpha:"150-250bps/yr",w:"ISA/SIPP",sz:"8-12% NAV",cat:"Broadening rotation",risks:["Recession","Derating"],kill:"ROIC <12% sustained",col:P.green,val:5400},
  {t:"BTC Accumulation",c:7,tm:9,alpha:"Asymmetric",w:"GIA (CGT)",sz:"Maintain 8%",cat:"On-chain extreme fear, whale buying",risks:["Regulatory","Correlation"],kill:"Below 200-wk MA w/ volume",col:P.btc,val:4800},
  {t:"Intl Value Tilt",c:7,tm:8,alpha:"200-400bps/yr",w:"GIA/ISA",sz:"5-10% NAV",cat:"Value rotation + USD weakness",risks:["US growth resurgence"],kill:"Growth > Value 3 qtrs",col:P.purple,val:4200},
  {t:"Salary Sacrifice Optimisation",c:10,tm:10,alpha:"600bps effective",w:"SIPP",sz:"£15k/yr",cat:"60% effective rate in £100-125k band",risks:["Pension rule changes"],kill:"Income drops below £100k",col:"#06b6d4",val:6750},
  {t:"Bed & ISA Strategy",c:8,tm:9,alpha:"100-180bps/yr",w:"ISA",sz:"£3k CGT/yr",cat:"Annual CGT allowance crystallisation",risks:["Market timing on rebuy"],kill:"None",col:P.amber,val:1800},
  {t:"UK Infrastructure / Renewables",c:6,tm:6,alpha:"150-300bps/yr",w:"ISA",sz:"3-5% NAV",cat:"UK energy transition, grid investment",risks:["Policy reversal","Rate sensitivity"],kill:"Gilt yields >5.5%",col:P.orange,val:2400},
  {t:"EM Small Cap Recovery",c:5,tm:5,alpha:"200-400bps/yr",w:"GIA",sz:"2-4% NAV",cat:"EM valuations at 20yr discount to DM",risks:["China slowdown","FX"],kill:"EM/DM spread widens >2 std dev",col:P.pink,val:1600},
  {t:"Gold / Commodities Hedge",c:5,tm:7,alpha:"50-100bps/yr",w:"GIA",sz:"2-3% NAV",cat:"Inflation hedge, geopolitical tail risk",risks:["Disinflation","Opportunity cost"],kill:"Core CPI <2% sustained",col:"#d4a406",val:900},
];
let OPPS_TOP5 = [...OPPS].sort((a,b)=>b.val-a.val).slice(0,5);
let MONTHLY_DATA = [
  {m:"Oct",r:-2.1,vol:18.2},{m:"Nov",r:-6.8,vol:32.4},{m:"Dec",r:-1.2,vol:24.1},
  {m:"Jan",r:-0.5,vol:20.8},{m:"Feb",r:-4.2,vol:26.2},{m:"Mar",r:3.2,vol:19.6},
];
let SCORECARD = {overall:5.2,returns:3.8,riskMgmt:5.4,process:4.2,taxEff:6.0,diversify:7.6,capitalEff:4.4,commentary:"Overall 5.2/10 reflects strong diversification (7.6) offset by poor returns (3.8) driven by the crypto correction. Tax efficiency (6.0) is improving but 47% GIA exposure remains a drag. Process (4.2) is weak from missing rebalancing discipline and no IPS."};
let REF_DATA = {};
// =========================================================================
// UI COMPONENTS — ORION GLASS (Light Mode)
// =========================================================================
const Card = ({children,style,glow,hover,tier=2,accent}) => {
  const [hovered,setHovered] = useState(false);
  const gSpec = glassLight(tier, accent);
  const glowAccent = accent || P.cyan;
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        position:'relative', borderRadius:20, overflow:'hidden', marginBottom:16,
        transition:"all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
        transform:hovered&&hover?"translateY(-3px) scale(1.003)":"none",
        ...(style?.flex?{flex:style.flex}:{}),
        ...(style?.minWidth?{minWidth:style.minWidth}:{}),
        ...(style?.maxWidth?{maxWidth:style.maxWidth}:{}),
        ...(style?.gridColumn?{gridColumn:style.gridColumn}:{}),
        ...(style?.width?{width:style.width}:{}),
        ...(style?.margin?{margin:style.margin}:{}),
        ...(style?.marginBottom?{marginBottom:style.marginBottom}:style?.marginBottom===0?{marginBottom:0}:{}),
      }}
    >
      {/* SHELL: outer glass material — edges, highlight band, blur */}
      <div style={{
        position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:gSpec.backdropFilter, WebkitBackdropFilter:gSpec.WebkitBackdropFilter,
        border:gSpec.border,
        backgroundImage:gSpec.backgroundImage,
        boxShadow: glow
          ? `0 8px 40px rgba(${accent?hx2(glowAccent):'99,102,241'},0.10), ${gSpec.boxShadow}`
          : hovered&&hover
            ? `0 8px 40px rgba(0,0,0,0.08), 0 16px 56px rgba(0,0,0,0.03), ${gSpec.boxShadow}`
            : gSpec.boxShadow,
        pointerEvents:'none', transition:'box-shadow 0.35s ease',
      }}/>
      {/* PLATE: inner stabilised surface — readability guarantee */}
      <div style={{
        position:'absolute',inset:0,borderRadius:'inherit',
        background:gSpec.background,
        pointerEvents:'none',
      }}/>
      {/* CONTENT: sits above plate */}
      <div style={{
        position:'relative', zIndex:1,
        padding:style?.padding||"24px 26px",
        ...(style?.textAlign?{textAlign:style.textAlign}:{}),
        ...(style?.borderLeft?{borderLeft:style.borderLeft}:{}),
        ...(style?.borderTop?{borderTop:style.borderTop}:{}),
      }}>
        {children}
      </div>
    </div>
  );
};
const hx2 = c => { if(!c||c[0]!=="#") return "99,102,241"; c=c.replace("#",""); return [parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)].join(","); };

const K = ({l,v,s,c=P.cyan,sm,delta,deltaType}) => (
  <div style={{
    position:'relative', borderRadius:16, overflow:'hidden', textAlign:"center",
    flex:sm?"1 1 110px":"1 1 145px", minWidth:sm?95:130,
  }}>
    {/* Shell — edge discipline + locked highlight */}
    <div style={{
      position:'absolute',inset:0,borderRadius:'inherit',
      backdropFilter:'blur(18px) saturate(1.5)',WebkitBackdropFilter:'blur(18px) saturate(1.5)',
      border:'1px solid rgba(255,255,255,0.55)',
      backgroundImage:`linear-gradient(135deg, rgba(255,255,255,0.08), transparent 45%)`,
      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.18), 0 4px 16px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.02)',
      pointerEvents:'none',
    }}/>
    {/* Plate — stabilised readability surface */}
    <div style={{
      position:'absolute',inset:0,borderRadius:'inherit',
      background:'rgba(255,255,255,0.55)',
      pointerEvents:'none',
    }}/>
    {/* Accent edge — bottom border glow (Finance amber cascade) */}
    <div style={{
      position:'absolute',bottom:0,left:'12%',right:'12%',height:2.5,
      background:`linear-gradient(90deg, transparent, ${c}50, transparent)`,
      borderRadius:2, pointerEvents:'none',
    }}/>
    {/* Content — sits above plate */}
    <div style={{position:'relative',zIndex:1,padding:sm?"10px 12px":"16px 18px"}}>
      <div style={{fontSize:10.5,color:P.t4,textTransform:"uppercase",letterSpacing:1.5,fontWeight:600,marginBottom:4}}>{l}</div>
      <div style={{fontSize:sm?20:28,fontWeight:800,color:c,fontFamily:P.mono,letterSpacing:-0.5,lineHeight:1.1}}>{v}</div>
      {s&&<div style={{fontSize:10.5,color:P.t4,marginTop:3,lineHeight:1.3}}>{s}</div>}
      {delta&&<div style={{fontSize:10,marginTop:3,fontWeight:600,color:deltaType==="up"?P.positive:deltaType==="down"?P.negative:P.t4}}>{deltaType==="up"?"\u25B2":deltaType==="down"?"\u25BC":"\u25CF"} {delta}</div>}
    </div>
  </div>
);

const Hd = ({t,s,tag,ac=P.cyan}) => (
  <div style={{marginBottom:18,marginTop:6}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <h2 style={{fontSize:22,fontWeight:800,color:P.t1,margin:0,letterSpacing:-0.3}}>{t}</h2>
      {tag&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${ac}12`,color:ac,textTransform:"uppercase",letterSpacing:1.2,border:`1px solid ${ac}18`}}>{tag}</span>}
    </div>
    {s&&<p style={{fontSize:13,color:P.t3,margin:"5px 0 0",lineHeight:1.5}}>{s}</p>}
  </div>
);

const Ins = ({text,type="insight"}) => {
  const c={insight:P.cyan,warning:P.amber,action:P.indigo,risk:P.negative,opp:P.positive}[type]||P.cyan;
  return (
    <div style={{
      position:'relative',overflow:'hidden',
      padding:"16px 20px",borderLeft:`3px solid ${c}`,
      borderRadius:"0 16px 16px 0",marginBottom:14,
    }}>
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:'blur(14px) saturate(1.3)',WebkitBackdropFilter:'blur(14px) saturate(1.3)',
        background:`linear-gradient(135deg,${c}06,rgba(255,255,255,0.45) 70%)`,
        border:'1px solid rgba(255,255,255,0.5)',borderLeft:'none',
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.3)',
        pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:11,color:c,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>{type}</div>
        <div style={{fontSize:15,color:P.t2,lineHeight:1.7}}>{text}</div>
      </div>
    </div>
  );
};

const Tbl = ({h,r,hl}) => (
  <div style={{overflowX:"auto",borderRadius:14,border:`1px solid rgba(255,255,255,0.25)`,backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',background:"rgba(255,255,255,0.12)"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:14}}>
      <thead><tr>{h.map((x,i) => <th key={i} style={{textAlign:i===0?"left":"right",padding:"10px 14px",borderBottom:`1px solid ${P.b1}`,color:P.t3,fontWeight:700,fontSize:12,textTransform:"uppercase",letterSpacing:0.6,background:"rgba(255,255,255,0.08)"}}>{x}</th>)}</tr></thead>
      <tbody>{r.map((row,ri) => <tr key={ri} style={{transition:"background 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(99,102,241,0.04)"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>{row.map((cell,ci) => {
        const neg=typeof cell==="string"&&cell.startsWith("-");
        const pos=typeof cell==="string"&&cell.startsWith("+");
        return <td key={ci} style={{textAlign:ci===0?"left":"right",padding:"9px 14px",borderBottom:`1px solid ${P.b2}`,color:hl===ci?(neg?P.negative:pos?P.positive:P.t1):(ci===0?P.t1:P.t2),fontWeight:ci===0||hl===ci?600:400,fontSize:14}}>{cell}</td>;
      })}</tr>)}</tbody>
    </table>
  </div>
);

const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{
      position:'relative',borderRadius:14,overflow:'hidden',minWidth:140,
    }}>
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',backdropFilter:'blur(20px) saturate(1.4)',WebkitBackdropFilter:'blur(20px) saturate(1.4)',background:'rgba(15,23,42,0.92)',border:'1px solid rgba(255,255,255,0.08)',boxShadow:'0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,padding:"12px 16px"}}>
        <div style={{color:"#94a3b8",marginBottom:6,fontSize:11,fontWeight:700,letterSpacing:0.5,textTransform:'uppercase',borderBottom:'1px solid rgba(255,255,255,0.06)',paddingBottom:5}}>{label}</div>
        {payload.filter(p=>p.name!==" ").map((p,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:p.color||P.cyan,boxShadow:`0 0 8px ${p.color||P.cyan}60`,flexShrink:0}}/>
            <span style={{fontSize:12,color:'#cbd5e1',flex:1}}>{p.name}</span>
            <span style={{fontSize:13,color:p.color||"#818cf8",fontWeight:700,fontFamily:P.mono}}>
              {typeof p.value==="number"?(Math.abs(p.value)>999?`\u00A3${(p.value/1000).toFixed(1)}k`:p.value.toFixed(1)):p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Row = ({children,gap=12,style,cols}) => (<div style={{display:"grid",gridTemplateColumns:cols||"repeat(auto-fit, minmax(300px, 1fr))",gap,...style}}>{children}</div>);
const FlexRow = ({children,gap=12,style}) => (<div style={{display:"flex",flexWrap:"wrap",gap,...style}}>{children}</div>);
const Grid = ({children,cols="1fr 1fr",gap=14,style}) => (<div style={{display:"grid",gridTemplateColumns:cols,gap,...style}}>{children}</div>);
const ChartDefs = () => (
  <defs>
    <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.cyan} stopOpacity={0.35}/><stop offset="100%" stopColor={P.cyan} stopOpacity={0.02}/></linearGradient>
    <linearGradient id="gIndigo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.indigo} stopOpacity={0.3}/><stop offset="100%" stopColor={P.indigo} stopOpacity={0.02}/></linearGradient>
    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.green} stopOpacity={0.3}/><stop offset="100%" stopColor={P.green} stopOpacity={0.02}/></linearGradient>
    <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.red} stopOpacity={0.25}/><stop offset="100%" stopColor={P.red} stopOpacity={0.02}/></linearGradient>
    <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.amber} stopOpacity={0.3}/><stop offset="100%" stopColor={P.amber} stopOpacity={0.02}/></linearGradient>
    <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.purple} stopOpacity={0.3}/><stop offset="100%" stopColor={P.purple} stopOpacity={0.02}/></linearGradient>
    <linearGradient id="gBtc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.btc} stopOpacity={0.35}/><stop offset="100%" stopColor={P.btc} stopOpacity={0.02}/></linearGradient>
    <filter id="chartGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
);
const fmt = v=>`\u00A3${Math.abs(v).toLocaleString("en-GB",{maximumFractionDigits:0})}`;
const fK = v=>`\u00A3${(v/1000).toFixed(v>=10000?0:1)}k`;
const pc = v=>`${v>0?"+":""}${v.toFixed(1)}%`;

const Gauge = ({score,max=10,label,size=68}) => {
  const p=(score/max)*100;const c=p>=70?P.positive:p>=40?P.amber:P.negative;
  return (<div style={{textAlign:"center",minWidth:size+10}}>
    <div style={{position:"relative",width:size,height:size,margin:"0 auto"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={size/2-6} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={4}/>
        <circle cx={size/2} cy={size/2} r={size/2-6} fill="none" stroke={c} strokeWidth={4} strokeDasharray={`${p*(size/2-6)*0.0628} 200`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{filter:`drop-shadow(0 0 6px ${c}55)`}}/>
      </svg>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:size>60?22:16,fontWeight:800,color:c,fontFamily:P.mono}}>{score}</div>
    </div>
    {label&&<div style={{fontSize:12,color:P.t3,marginTop:6,textTransform:"uppercase",letterSpacing:0.6,fontWeight:600}}>{label}</div>}
  </div>);
};

const Bar2 = ({val,max=100,c=P.cyan,label}) => (<div style={{marginBottom:6}}>
  {label&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
    <span style={{fontSize:14,color:P.t3}}>{label}</span>
    <span style={{fontSize:14,color:c,fontWeight:700,fontFamily:P.mono}}>{((val/max)*100).toFixed(0)}%</span>
  </div>}
  <div style={{height:10,background:"rgba(0,0,0,0.06)",borderRadius:6,overflow:"hidden"}}>
    <div style={{width:`${Math.min((val/max)*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${c},${c}bb)`,borderRadius:6,boxShadow:`0 0 12px ${c}25`,transition:"width 0.6s ease"}}/>
  </div>
</div>);

// =========================================================================
// SPRINT 1 — NEW UI COMPONENTS (Tab 01 enrichment)
// =========================================================================
const AlertPanel = ({items}) => (
  <div style={{...G,padding:"16px 20px",marginBottom:16,borderLeft:`4px solid ${P.red}`}}>
    <div style={{fontSize:11,fontWeight:700,color:P.red,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10}}>ALERT PANEL — RULES BREACHED</div>
    {items.map((a,i) => {
      const dc = a.sev==="high" ? P.red : a.sev==="med" ? P.amber : P.t4;
      return (
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<items.length-1?`1px solid ${P.b2}`:"none"}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:dc,flexShrink:0,boxShadow:`0 0 8px ${dc}50`}}/>
          <div style={{fontSize:14,color:P.t2,flex:1,lineHeight:1.5}}>{a.msg}</div>
          <span style={{fontSize:10,color:dc,fontWeight:700,padding:"2px 8px",borderRadius:6,background:`${dc}12`,border:`1px solid ${dc}20`,textTransform:"uppercase",letterSpacing:0.5}}>{a.sev}</span>
        </div>
      );
    })}
  </div>
);

const CalendarHeatmap = ({data}) => {
  const getColor = (r) => {
    if(r <= -5) return {bg:"rgba(239,68,68,0.25)",text:P.red};
    if(r <= -2) return {bg:"rgba(239,68,68,0.14)",text:P.red};
    if(r < 0) return {bg:"rgba(239,68,68,0.07)",text:"#dc2626"};
    if(r === 0) return {bg:"rgba(0,0,0,0.03)",text:P.t3};
    if(r <= 2) return {bg:"rgba(34,197,94,0.08)",text:P.green};
    return {bg:"rgba(34,197,94,0.18)",text:P.green};
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${data.length},1fr)`,gap:6}}>
      {data.map((d,i) => {
        const {bg,text} = getColor(d.r);
        return (
          <div key={i} style={{background:bg,borderRadius:12,padding:"14px 8px",textAlign:"center",border:`1px solid ${text}15`}}>
            <div style={{fontSize:11,color:P.t4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{d.m}</div>
            <div style={{fontSize:22,fontWeight:800,color:text,fontFamily:P.mono}}>{d.r>0?"+":""}{d.r}%</div>
          </div>
        );
      })}
    </div>
  );
};

const MiniWaterfall = ({data}) => {
  const total = data.reduce((a,d)=>a+d.val,0);
  return (
    <div style={{...G,padding:"20px 24px",marginBottom:16}}>
      <div style={{fontSize:13,fontWeight:700,color:P.t1,letterSpacing:0.5,marginBottom:4}}>RETURN DECOMPOSITION — WHAT DROVE THE {pc(nwReturn)} RETURN</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:14}}>Allocation, selection, and structural effects decomposed into decision-level attribution.</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.map((d,i) => {
          const maxAbs = Math.max(...data.map(x=>Math.abs(x.val)));
          const barW = Math.abs(d.val) / maxAbs * 100;
          const isPos = d.val >= 0;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:130,fontSize:12,color:P.t3,textAlign:"right",flexShrink:0}}>{d.name}</div>
              <div style={{flex:1,height:22,position:"relative"}}>
                <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:P.b1}}/>
                <div style={{
                  position:"absolute",
                  [isPos?"left":"right"]:"50%",
                  width:`${barW/2}%`,height:"100%",
                  background:`linear-gradient(${isPos?"90deg":"270deg"},${d.c||P.cyan}cc,${d.c||P.cyan}40)`,
                  borderRadius:isPos?"0 6px 6px 0":"6px 0 0 6px",
                  boxShadow:`0 2px 8px ${d.c||P.cyan}20`,
                }}/>
              </div>
              <div style={{width:55,fontSize:13,fontWeight:700,color:isPos?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>
                {isPos?"+":""}{d.val.toFixed(1)}%
              </div>
            </div>
          );
        })}
        <div style={{display:"flex",alignItems:"center",gap:10,borderTop:`1px solid ${P.b1}`,paddingTop:8,marginTop:4}}>
          <div style={{width:130,fontSize:12,color:P.t1,textAlign:"right",fontWeight:700}}>Total</div>
          <div style={{flex:1}}/>
          <div style={{width:55,fontSize:14,fontWeight:800,color:total>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{total>=0?"+":""}{total.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// SANKEY — Orion palette on light background
// =========================================================================
const SankeyChart = () => {
  const W=680,H=380,nodeW=14,pad=12;
  const left=[{id:"salary",label:"Salary",val:170,color:P.cyan,y:0},{id:"bonus",label:"Bonus",val:170,color:P.green,y:0}];
  const mid=[{id:"tax",label:"Tax+NI",val:159.6,color:P.red,y:0},{id:"posttax",label:"Post-Tax",val:180.4,color:P.cyan,y:0}];
  const right=[{id:"isa",label:"ISA",val:20,color:P.cyan},{id:"pension",label:"Pension",val:25,color:"#06b6d4"},{id:"invest",label:"Invest",val:30,color:P.indigo},{id:"crypto",label:"Crypto",val:5,color:P.btc},{id:"expenses",label:"Expenses",val:72,color:"#94a3b8"},{id:"debt",label:"Debt Clear",val:13.6,color:P.red},{id:"liq",label:"Liquidity",val:14.8,color:P.amber}];
  const totalIn=340,scaleY=(H-50)/totalIn;
  left[0].y=28;left[0].h=left[0].val*scaleY;left[1].y=left[0].y+left[0].h+pad;left[1].h=left[1].val*scaleY;
  mid[0].y=28;mid[0].h=mid[0].val*scaleY;mid[1].y=mid[0].y+mid[0].h+pad;mid[1].h=mid[1].val*scaleY;
  let ry=28;right.forEach(r=>{r.h=r.val*scaleY;r.y=ry;ry+=r.h+4;});
  const x1=48,x2=270,x3=495;
  const lnk=(sx,sy,sh,ex,ey,eh)=>`M${sx},${sy} C${(sx+ex)/2},${sy} ${(sx+ex)/2},${ey} ${ex},${ey} L${ex},${ey+eh} C${(sx+ex)/2},${ey+eh} ${(sx+ex)/2},${sy+sh} ${sx},${sy+sh} Z`;
  const stt=170*0.47*scaleY,stp=170*0.53*scaleY;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <defs>{[P.cyan,P.green,P.red,P.indigo,P.btc,"#06b6d4","#94a3b8",P.amber].map((c,i) => (
        <linearGradient key={i} id={`sg${i}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={c} stopOpacity={0.45}/><stop offset="100%" stopColor={c} stopOpacity={0.12}/></linearGradient>
      ))}</defs>
      <path d={lnk(x1+nodeW,left[0].y,stt,x2,mid[0].y,stt)} fill="url(#sg2)" stroke="none"/>
      <path d={lnk(x1+nodeW,left[0].y+stt,stp,x2,mid[1].y,stp)} fill="url(#sg0)" stroke="none"/>
      <path d={lnk(x1+nodeW,left[1].y,stt,x2,mid[0].y+stt,stt)} fill="url(#sg2)" stroke="none"/>
      <path d={lnk(x1+nodeW,left[1].y+stt,stp,x2,mid[1].y+stp,stp)} fill="url(#sg0)" stroke="none"/>
      {(()=>{let sy=mid[1].y;const cols=["url(#sg0)","url(#sg5)","url(#sg3)","url(#sg4)","url(#sg6)","url(#sg2)","url(#sg7)"];return right.map((r,i)=>{const sh=r.val*scaleY;const p=<path key={i} d={lnk(x2+nodeW,sy,sh,x3,r.y,r.h)} fill={cols[i]} stroke="none"/>;sy+=sh;return p;});})()}
      {left.map((n,i) => <g key={`l${i}`}><rect x={x1} y={n.y} width={nodeW} height={n.h} rx={5} fill={n.color} opacity={0.85}/><text x={x1-6} y={n.y+n.h/2} textAnchor="end" fill={P.t2} fontSize={11} fontWeight={700} dominantBaseline="middle">{n.label}</text><text x={x1-6} y={n.y+n.h/2+13} textAnchor="end" fill={P.t4} fontSize={10} dominantBaseline="middle">{"\u00A3"}{n.val}k</text></g>)}
      {mid.map((n,i) => <g key={`m${i}`}><rect x={x2} y={n.y} width={nodeW} height={n.h} rx={5} fill={n.color} opacity={0.85}/><text x={x2+nodeW/2} y={n.y-6} textAnchor="middle" fill={P.t2} fontSize={10} fontWeight={700}>{n.label}</text><text x={x2+nodeW/2} y={n.y+n.h+13} textAnchor="middle" fill={P.t4} fontSize={9}>{"\u00A3"}{n.val.toFixed(0)}k</text></g>)}
      {right.map((n,i) => <g key={`r${i}`}><rect x={x3} y={n.y} width={nodeW} height={Math.max(n.h,4)} rx={4} fill={n.color} opacity={0.85}/><text x={x3+nodeW+8} y={n.y+Math.max(n.h,4)/2} fill={P.t2} fontSize={10} fontWeight={600} dominantBaseline="middle">{n.label}</text><text x={x3+nodeW+8} y={n.y+Math.max(n.h,4)/2+12} fill={P.t4} fontSize={9} dominantBaseline="middle">{"\u00A3"}{n.val}k</text></g>)}
    </svg>
  );
};
const T1 = ()=>{
  const fire=(PORT.netWorth/PORT.fireTarget*100);
  const contribData = HOLDINGS.filter(h=>h.prev).map(h=>({name:h.name.split("(")[0].split(" ").slice(0,2).join(" ").trim(),pnl:((h.val-h.prev)/1000)})).sort((a,b)=>b.pnl-a.pnl);
  const monthlyReturns = MONTHLY_DATA.map(m=>({m:m.m,r:m.r}));

  // Metric Guide V2 — all derived metrics computed inside T1 (after Supabase overrides)
  const activeReturn = nwReturn - ((PORT.benchReturn != null ? PORT.benchReturn : -0.028) * 100);
  const realReturn = nwReturn - ((PORT.inflation != null ? PORT.inflation : 0.032) * 100 / 2);
  const probNW = Math.round(0.15*PORT.netWorth*0.85 + 0.50*PORT.netWorth*1.12 + 0.25*PORT.netWorth*1.25 + 0.10*PORT.netWorth*1.45);
  const liquidCash = 15752+406+94;
  const runway = liquidCash / PORT.monthlyExpenses;
  const nw3moAgo = NW_WEEKLY[Math.max(NW_WEEKLY.length - 13, 0)]?.nw || NW_WEEKLY[0]?.nw || PORT.nw6moAgo;
  const ret3m = ((PORT.netWorth - nw3moAgo) / nw3moAgo * 100);
  const nw1moAgo = NW_WEEKLY[Math.max(NW_WEEKLY.length - 5, 0)]?.nw || PORT.netWorth;
  const ret1m = ((PORT.netWorth - nw1moAgo) / nw1moAgo * 100);

  // Decision Quality Score (4-factor model)
  const growthAssets = HOLDINGS.filter(h=>["ETF","Crypto","Stock","Investment"].includes(h.cls)).reduce((a,h)=>a+h.val,0);
  const growthInShelter = (82133 + 18085);
  const dqWrapper = Math.min((growthInShelter / (growthAssets||1)) * 10, 10);
  const dqDebt = PORT.amexDebt > 0 ? Math.max(10 - (0.22 * PORT.amexDebt / PORT.netWorth * 100), 0) : 10;
  const dqConcentration = Math.max(10 - (18 / 5), 0);
  const dqTiming = 5.0;
  const decisionQuality = +((dqWrapper * 0.30 + dqDebt * 0.25 + dqConcentration * 0.25 + dqTiming * 0.20).toFixed(1));

  // Balance sheet
  const netSalaryAnnLocal = (PORT.grossSalary + PORT.grossBonus) * (1 - PORT.taxRate - PORT.niRate);
  const savingsRateLocal = ((netSalaryAnnLocal - PORT.monthlyExpenses * 12) / netSalaryAnnLocal * 100);
  const debtToAsset = (PORT.debts / PORT.assets * 100);
  const leverage = PORT.debts / PORT.netWorth;

  const alerts = [
    {msg:"ISA deadline: 29 days. \u00A30 of \u00A320k deployed.", sev:"high"},
    {msg:`Amex at 22% APR: ${fmt(PORT.amexDebt)} outstanding.`, sev:"high"},
    {msg:`Cash buffer: ${runway.toFixed(1)} months vs 3.0 target.`, sev: runway < 3 ? "med" : "low"},
    {msg:"Crypto risk budget: 32% risk from 13% capital (2.5x limit).", sev:"med"},
    {msg:"18 positions below \u00A31k. Fragment drag ~\u00A3160/yr.", sev:"low"},
  ];

  const decomp = [
    {name:"Crypto Allocation", val: -5.4, c: P.red},
    {name:"Equity Selection", val: 1.2, c: P.cyan},
    {name:"FX / ZAR Effect", val: 1.3, c: P.green},
    {name:"Pension Reval", val: 4.6, c: "#06b6d4"},
    {name:"Debt Drag", val: -0.4, c: P.red},
    {name:"Cash Drawdown", val: -7.1, c: P.amber},
    {name:"Residual", val: -3.1, c: P.t3},
  ];

  // Radar data for scorecard (Recharts RadarChart)
  const radarData = [
    {metric:"Returns",score:SCORECARD.returns,full:10},
    {metric:"Risk Mgmt",score:SCORECARD.riskMgmt,full:10},
    {metric:"Process",score:SCORECARD.process,full:10},
    {metric:"Tax Eff.",score:SCORECARD.taxEff,full:10},
    {metric:"Diversify",score:SCORECARD.diversify,full:10},
    {metric:"Capital Eff.",score:SCORECARD.capitalEff,full:10},
  ];

  return(<div>
    <Hd t="EXECUTIVE SUMMARY" s={`${PORT.date} \u00B7 Net Worth ${fmt(PORT.netWorth)} \u00B7 Assets ${fmt(PORT.assets)} \u00B7 Debts ${fmt(PORT.debts)}`} tag="CIO BRIEFING"/>

    {/* ═══ ROW 1: ALERTS + KPI STRIP (12-col grid) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(12, 1fr)",gap:10,marginBottom:14}}>
      {/* Alerts spanning 3 columns */}
      <div style={{gridColumn:"span 3",gridRow:"span 2"}}>
        <Card tier={1} style={{padding:"16px 18px",marginBottom:0}}>
          <div style={{fontSize:11,fontWeight:700,color:P.red,letterSpacing:1.2,textTransform:"uppercase",marginBottom:8}}>GOVERNANCE ALERTS</div>
          {alerts.map((a,i) => {
            const dc = a.sev==="high" ? P.red : a.sev==="med" ? P.amber : P.t4;
            return (
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"5px 0",borderBottom:i<alerts.length-1?`1px solid ${P.b2}`:"none"}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:dc,flexShrink:0,marginTop:5,boxShadow:`0 0 6px ${dc}50`}}/>
                <div style={{fontSize:12,color:P.t2,lineHeight:1.4,flex:1}}>{a.msg}</div>
              </div>
            );
          })}
        </Card>
      </div>
      {/* 8 KPI cards across remaining 9 columns (top row: 5 cards) */}
      <div style={{gridColumn:"span 9",display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8}}>
        <K l="Net Worth" v={fK(PORT.netWorth)} c={P.t1} delta={`Peak: ${fK(PORT.nwPeak)}`} deltaType={PORT.netWorth>=PORT.nwPeak?"up":"down"}/>
        <K l="6-Mo Return" v={pc(nwReturn)} c={nwReturn>0?P.positive:P.negative} delta="20 Sep \u2192 7 Mar" deltaType={nwReturn>0?"up":"down"}/>
        <K l="Active Return" v={pc(activeReturn)} c={activeReturn>0?P.positive:P.negative} delta="vs MSCI World" deltaType={activeReturn>0?"up":"down"}/>
        <K l="Real Return" v={pc(realReturn)} c={realReturn>0?P.positive:P.negative} delta="Inflation-adj" deltaType={realReturn>0?"up":"down"}/>
        <K l="Peak Drawdown" v={`${RISK.maxDD}%`} c={P.negative} delta={`${RISK.ddDur}d duration`} deltaType="down"/>
      </div>
      {/* Bottom row of 9-col area: 4 more KPIs */}
      <div style={{gridColumn:"span 9",display:"grid",gridTemplateColumns:"repeat(5, 1fr)",gap:8}}>
        <K l="FIRE Progress" v={`${fire.toFixed(0)}%`} c={P.cyan} delta={`of ${fK(PORT.fireTarget)}`}/>
        <K l="Exp. NW (12M)" v={fK(probNW)} c={P.cyan} delta="Prob-weighted"/>
        <K l="Sharpe Ratio" v={RISK.sharpe?.toFixed(2)||"0.42"} c={RISK.sharpe>=0.5?P.positive:P.amber} delta="Risk-adjusted"/>
        <K l="Savings Rate" v={`${savingsRateLocal.toFixed(0)}%`} c={savingsRateLocal>25?P.positive:P.amber} delta="of net income"/>
        <K l="Cash Buffer" v={`${runway.toFixed(1)}mo`} c={runway>=3?P.positive:P.negative} delta="vs 3.0 target" deltaType={runway>=3?"up":"down"}/>
      </div>
    </div>

    {/* ═══ ROW 2: SCORECARD RADAR + RETURN DECOMPOSITION (side-by-side) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      {/* Left: Scorecard with Radar Chart */}
      <Card glow>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:P.t1}}>PORTFOLIO QUALITY SCORECARD</div>
            <div style={{fontSize:11,color:P.t3,marginTop:2}}>Overall: {SCORECARD.overall}/10 \u00B7 Decision Quality: {decisionQuality}/10</div>
          </div>
          <Gauge score={SCORECARD.overall} label="" size={52}/>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
            <PolarGrid stroke={P.b1} gridType="polygon"/>
            <PolarAngleAxis dataKey="metric" tick={{fill:P.t3,fontSize:10}} tickLine={false}/>
            <PolarRadiusAxis angle={90} domain={[0,10]} tick={{fill:P.t4,fontSize:9}} tickCount={6}/>
            <Radar name="Score" dataKey="score" stroke={P.cyan} fill={P.cyan} fillOpacity={0.15} strokeWidth={2}/>
            <Radar name="Target" dataKey="full" stroke={P.t4} fill="none" strokeWidth={1} strokeDasharray="4 4"/>
          </RadarChart>
        </ResponsiveContainer>
        <div style={{fontSize:12,color:P.t3,lineHeight:1.5,borderTop:`1px solid ${P.b2}`,paddingTop:8,marginTop:4}}>
          <span style={{fontWeight:700,color:P.t2}}>Outcome {SCORECARD.overall}/10</span> \u2014 diversification ({SCORECARD.diversify}) strong. Crypto returns ({SCORECARD.returns}) the drag. <span style={{fontWeight:700,color:P.t2}}>Process {decisionQuality}/10</span> \u2014 wrapper {dqWrapper.toFixed(1)}, debt {dqDebt.toFixed(1)}, concentration {dqConcentration.toFixed(1)}.{" "}
          {decisionQuality < 5 && <span style={{color:P.amber,fontWeight:600}}>Process below target \u2014 structural fixes compound without market dependency.</span>}
        </div>
      </Card>

      {/* Right: Return Decomposition Waterfall */}
      <Card>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>RETURN DECOMPOSITION</div>
        <div style={{fontSize:11,color:P.t3,marginBottom:12}}>What drove the {pc(nwReturn)} return. Allocation, selection, and structural effects.</div>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {decomp.map((d,i) => {
            const maxAbs = Math.max(...decomp.map(x=>Math.abs(x.val)));
            const barW = Math.abs(d.val) / maxAbs * 100;
            const isPos = d.val >= 0;
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:110,fontSize:12,color:P.t3,textAlign:"right",flexShrink:0}}>{d.name}</div>
                <div style={{flex:1,height:20,position:"relative"}}>
                  <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:P.b1}}/>
                  <div style={{
                    position:"absolute",
                    [isPos?"left":"right"]:"50%",
                    width:`${barW/2}%`,height:"100%",
                    background:`linear-gradient(${isPos?"90deg":"270deg"},${d.c||P.cyan}cc,${d.c||P.cyan}40)`,
                    borderRadius:isPos?"0 5px 5px 0":"5px 0 0 5px",
                    boxShadow:`0 2px 8px ${d.c||P.cyan}20`,
                  }}/>
                </div>
                <div style={{width:50,fontSize:13,fontWeight:700,color:isPos?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>
                  {isPos?"+":""}{d.val.toFixed(1)}%
                </div>
              </div>
            );
          })}
          <div style={{display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${P.b1}`,paddingTop:6,marginTop:4}}>
            <div style={{width:110,fontSize:12,color:P.t1,textAlign:"right",fontWeight:700}}>Total</div>
            <div style={{flex:1}}/>
            <div style={{width:50,fontSize:14,fontWeight:800,color:decomp.reduce((a,d)=>a+d.val,0)>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{decomp.reduce((a,d)=>a+d.val,0)>=0?"+":""}{decomp.reduce((a,d)=>a+d.val,0).toFixed(1)}%</div>
          </div>
        </div>
      </Card>
    </div>

    {/* ═══ INSIGHT CALLOUT ═══ */}
    <Ins text={`Net worth declined ${pc(nwReturn)} over 6 months (${fK(PORT.nw6moAgo)} \u2192 ${fK(PORT.netWorth)}). Crypto was the sole destructive force: BTC ${fK(-19456)}, EC10 ${fK(-12663)}, ETH ${fK(-3559)}, SOL ${fK(-2748)}. Total crypto losses of ~${fK(38400)} overwhelmed equity returns of +${fK(13600)} and pension revaluation of +${fK(16800)}. The JPM Research Enhanced ETF suite is the strongest structural engine \u2014 JUKC +16.1%, JURE +8.4%, JGEP +7.6%.`}/>

    {/* ═══ ROW 3: ALLOCATION + NW FORECAST + CONTRIBUTORS + HEATMAP (4 panels) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"3fr 4fr 3fr",gap:14,marginBottom:14}}>
      {/* Allocation donut */}
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:6}}>ALLOCATION BY SLEEVE</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart><Pie data={SLEEVES} cx="50%" cy="50%" innerRadius={42} outerRadius={72} dataKey="val" stroke="none" paddingAngle={2}>
            {SLEEVES.map((s,i)=><Cell key={i} fill={s.color}/>)}
          </Pie><Tooltip content={<Tip/>}/></PieChart>
        </ResponsiveContainer>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center"}}>
          {SLEEVES.map((s,i)=><span key={i} style={{fontSize:10,color:P.t3}}><span style={{color:s.color}}>{"\u25CF"}</span> {s.name.split("(")[0].trim()} {s.pct}%</span>)}
        </div>
      </Card>

      {/* NW Forecast — hero chart */}
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:6}}>NET WORTH \u2014 HISTORICAL + FORECAST TO 2035</div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={NW_FORECAST} margin={{left:5}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="d" tick={{fill:P.t3,fontSize:9}} interval="preserveStartEnd"/>
            <YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>v>=1000000?`\u00A3${(v/1000000).toFixed(1)}m`:v>=1000?`\u00A3${(v/1000).toFixed(0)}k`:`${v}`} domain={["auto","auto"]}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length)return null;
              return(<div style={{...GS,padding:"10px 14px",fontSize:11,borderRadius:12}}>
                <div style={{color:"#94a3b8",fontWeight:600,marginBottom:3}}>{label}</div>
                {payload.filter(p=>p.value).map((p,i)=><div key={i} style={{color:p.color||P.cyan,fontWeight:600}}>{p.name}: \u00A3{p.value>=1000000?`${(p.value/1000000).toFixed(2)}m`:p.value>=1000?`${(p.value/1000).toFixed(0)}k`:p.value}</div>)}
              </div>);
            }}/>
            <defs><linearGradient id="gNW" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.cyan} stopOpacity={0.3}/><stop offset="100%" stopColor={P.cyan} stopOpacity={0.02}/></linearGradient></defs>
            <Area type="monotone" dataKey="nw" name="Net Worth" stroke={P.cyan} strokeWidth={2.5} fill="url(#gNW)" dot={false}/>
            <Line type="monotone" dataKey="base" name="Base" stroke={P.cyan} strokeWidth={1.5} strokeDasharray="6 3" dot={false}/>
            <Line type="monotone" dataKey="bull" name="Bull" stroke={P.green} strokeWidth={1} strokeDasharray="4 4" dot={false}/>
            <Line type="monotone" dataKey="conserv" name="Conservative" stroke={P.amber} strokeWidth={1} strokeDasharray="4 4" dot={false}/>
            <ReferenceLine y={1800000} stroke={P.green} strokeDasharray="8 4" label={{value:"FIRE \u00A31.8M",fill:P.green,fontSize:10,fontWeight:700}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      {/* P&L Contributors */}
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:6}}>P&L CONTRIBUTORS (\u00A3k)</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={contribData.slice(0,8)} layout="vertical" margin={{left:70,right:10}}>
            <CartesianGrid stroke={P.b2} horizontal={false}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(0)}k`}/>
            <YAxis type="category" dataKey="name" tick={{fill:P.t2,fontSize:10}} width={65}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine x={0} stroke={P.b1}/>
            <Bar dataKey="pnl" name="P&L" radius={[0,3,3,0]}>
              {contribData.slice(0,8).map((d,i)=><Cell key={i} fill={d.pnl>=0?P.positive:P.negative}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>

    {/* ═══ ROW 4: HEATMAP + BALANCE SHEET (side-by-side) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"7fr 5fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:P.t1}}>MONTHLY RETURN HEATMAP</div>
            <div style={{fontSize:11,color:P.t3,marginTop:2}}>Nov catastrophe (-6.8%). March recovery.</div>
          </div>
          <div style={{fontSize:12,color:P.t2,fontFamily:P.mono,fontWeight:700}}>Cum: {pc(MONTHLY_DATA.reduce((a,m)=>a+m.r,0))}</div>
        </div>
        <CalendarHeatmap data={monthlyReturns}/>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>BALANCE SHEET HEALTH</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {l:"Total Assets",v:fmt(PORT.assets),c:P.t1},
            {l:"Total Debts",v:fmt(PORT.debts),c:P.negative},
            {l:"Net Worth",v:fmt(PORT.netWorth),c:P.cyan},
            {l:"Leverage",v:`${(leverage*100).toFixed(1)}%`,c:leverage>0.05?P.amber:P.positive},
            {l:"Debt/Asset",v:`${debtToAsset.toFixed(1)}%`,c:debtToAsset>5?P.amber:P.positive},
            {l:"Cash Buffer",v:`${runway.toFixed(1)}mo`,c:runway>=3?P.positive:P.negative},
            {l:"Liquid Assets",v:fK(liquidCash),c:P.t2},
            {l:"Gross Income",v:fK(PORT.grossSalary*2),c:P.t2},
          ].map((m,i)=>(
            <div key={i} style={{padding:"8px 10px",borderRadius:10,background:"rgba(0,0,0,0.02)",border:`1px solid ${P.b2}`}}>
              <div style={{fontSize:10,color:P.t4,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>{m.l}</div>
              <div style={{fontSize:16,fontWeight:800,color:m.c,fontFamily:P.mono,marginTop:2}}>{m.v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* ═══ ROW 5: STRENGTHS / WEAKNESSES / ACTIONS (3-col narrative panels) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <Card style={{borderTop:`3px solid ${P.positive}`}} hover>
        <div style={{fontSize:12,fontWeight:700,color:P.positive,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Strengths</div>
        {["JPM Research Enhanced suite all positive: JUKC +16%, JURE +8%, JGEP +8%","Pension revalued +26% (+\u00A316.8k) \u2014 largest single contributor","15.4 effective positions with HHI 0.065 \u2014 genuinely diversified","New comp (\u00A3340k gross) transforms savings engine"].map((s,i)=><div key={i} style={{fontSize:12,color:P.t2,lineHeight:1.5,padding:"4px 0",borderBottom:`1px solid ${P.b2}`}}>{i+1}. {s}</div>)}
      </Card>
      <Card style={{borderTop:`3px solid ${P.negative}`}} hover>
        <div style={{fontSize:12,fontWeight:700,color:P.negative,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Weaknesses</div>
        {[`Crypto lost ${fK(38400)} \u2014 32% risk from 13% capital`,`Cash halved: ${fK(33978)} \u2192 ${fK(15752)}. Now 2.6mo`,`Amex ${fmt(PORT.amexDebt)} at 22% APR \u2014 most expensive capital`,`47% GIA wrapper \u2014 est. 1.5-2.0% annual tax drag`].map((s,i)=><div key={i} style={{fontSize:12,color:P.t2,lineHeight:1.5,padding:"4px 0",borderBottom:`1px solid ${P.b2}`}}>{i+1}. {s}</div>)}
      </Card>
      <Card style={{borderTop:`3px solid ${P.cyan}`}} hover>
        <div style={{fontSize:12,fontWeight:700,color:P.cyan,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Priority Actions</div>
        {[`Max ISA (\u00A320k) before 5 April \u2014 29 days.`,`Clear Amex (${fmt(PORT.amexDebt)}) from bonus \u2014 22% return.`,`Salary sacrifice \u00A31,250/mo \u2014 60% effective rate band.`,`Consolidate 18 micro-positions to \u226415.`].map((s,i)=><div key={i} style={{fontSize:12,color:P.t2,lineHeight:1.5,padding:"4px 0",borderBottom:`1px solid ${P.b2}`}}>{i+1}. {s}</div>)}
      </Card>
    </div>
  </div>);
};
// =========================================================================
// NAV STRUCTURE SANKEY — Assets → Classes → Wrappers
// =========================================================================
const NavSankey = ()=>{
  const W=750,H=480,nW=16;
  // Left: Total Assets
  const totalH = 400;
  const leftNodes=[{id:"assets",label:"Total Assets",val:375.7,color:P.cyan,y:40,h:totalH}];
  // Mid: Asset Classes (proportional)
  const midRaw=[
    {id:"etfs",label:"ETFs",val:104.9,color:P.cyan},
    {id:"pension",label:"Pension",val:82.1,color:"#06b6d4"},
    {id:"cashfd",label:"Cash/FD",val:61.5,color:"#94a3b8"},
    {id:"crypto",label:"Crypto",val:50.3,color:P.btc},
    {id:"invest",label:"Investments",val:45.7,color:P.indigo},
    {id:"stocks",label:"Stocks",val:13.6,color:P.purple},
    {id:"mixed",label:"Mixed",val:17.6,color:P.orange},
  ];
  const midTotal=midRaw.reduce((a,m)=>a+m.val,0);
  const midScale=totalH/midTotal;
  let my=40;
  const midNodes=midRaw.map(m=>{const h=m.val*midScale;const node={...m,y:my,h};my+=h+4;return node;});

  // Right: Wrappers
  const rightRaw=[
    {id:"gia",label:"GIA",val:178,color:P.amber},
    {id:"pensionW",label:"Pension",val:82.1,color:"#06b6d4"},
    {id:"fd",label:"FD/Cash",val:61.5,color:"#94a3b8"},
    {id:"isa",label:"ISA",val:18.1,color:P.green},
    {id:"zar",label:"ZAR Accts",val:35.9,color:P.amber},
  ];
  const rightTotal=rightRaw.reduce((a,r)=>a+r.val,0);
  const rightScale=totalH/rightTotal;
  let ry=40;
  const rightNodes=rightRaw.map(r=>{const h=r.val*rightScale;const node={...r,y:ry,h};ry+=h+5;return node;});

  const x1=65,x2=300,x3=535;

  const link=(sx,sy,sh,ex,ey,eh,col,opacity=0.25)=>{
    const s1=sy,s2=sy+sh,e1=ey,e2=ey+eh;
    return <path d={`M${sx},${s1} C${(sx+ex)/2},${s1} ${(sx+ex)/2},${e1} ${ex},${e1} L${ex},${e2} C${(sx+ex)/2},${e2} ${(sx+ex)/2},${s2} ${sx},${s2} Z`} fill={col} opacity={opacity} stroke="none"/>;
  };

  // Links: Assets → Classes (proportional from single left node)
  let leftCursor = 40;
  const leftLinks = midNodes.map((m,i)=>{
    const sh = m.h;
    const l = link(x1+nW, leftCursor, sh, x2, m.y, m.h, m.color, 0.22);
    leftCursor += sh + 4;
    return <g key={`ll${i}`}>{l}</g>;
  });

  // Links: Classes → Wrappers (simplified mapping)
  const rightLinks = [];
  // ETFs → GIA (mostly)
  rightLinks.push(link(x2+nW, midNodes[0].y, midNodes[0].h*0.85, x3, rightNodes[0].y, rightNodes[0].h*0.45, P.cyan, 0.18));
  rightLinks.push(link(x2+nW, midNodes[0].y+midNodes[0].h*0.85, midNodes[0].h*0.15, x3, rightNodes[3].y, rightNodes[3].h, P.green, 0.18));
  // Pension → Pension wrapper
  rightLinks.push(link(x2+nW, midNodes[1].y, midNodes[1].h, x3, rightNodes[1].y, rightNodes[1].h, "#06b6d4", 0.22));
  // Cash/FD → FD/Cash wrapper
  rightLinks.push(link(x2+nW, midNodes[2].y, midNodes[2].h, x3, rightNodes[2].y, rightNodes[2].h, "#94a3b8", 0.22));
  // Crypto → GIA
  rightLinks.push(link(x2+nW, midNodes[3].y, midNodes[3].h, x3, rightNodes[0].y+rightNodes[0].h*0.45, rightNodes[0].h*0.30, P.btc, 0.22));
  // Investments → GIA + ZAR
  rightLinks.push(link(x2+nW, midNodes[4].y, midNodes[4].h*0.4, x3, rightNodes[0].y+rightNodes[0].h*0.75, rightNodes[0].h*0.25, P.indigo, 0.18));
  rightLinks.push(link(x2+nW, midNodes[4].y+midNodes[4].h*0.4, midNodes[4].h*0.6, x3, rightNodes[4].y, rightNodes[4].h*0.75, P.amber, 0.18));
  // Stocks → ZAR
  rightLinks.push(link(x2+nW, midNodes[5].y, midNodes[5].h, x3, rightNodes[4].y+rightNodes[4].h*0.75, rightNodes[4].h*0.25, P.purple, 0.18));

  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      {leftLinks}
      {rightLinks}
      {/* Left node */}
      {leftNodes.map((n,i)=><g key={`l${i}`}>
        <rect x={x1} y={n.y} width={nW} height={n.h} rx={6} fill={n.color} opacity={0.80} style={{filter:`drop-shadow(0 0 10px ${n.color}40)`}}/>
        <text x={x1-10} y={n.y+n.h/2-8} textAnchor="end" fill={P.t1} fontSize={12} fontWeight={700} dominantBaseline="middle">{n.label}</text>
        <text x={x1-10} y={n.y+n.h/2+10} textAnchor="end" fill={P.t3} fontSize={10} dominantBaseline="middle">£{n.val}k</text>
      </g>)}
      {/* Mid nodes */}
      {midNodes.map((n,i)=><g key={`m${i}`}>
        <rect x={x2} y={n.y} width={nW} height={Math.max(n.h,6)} rx={5} fill={n.color} opacity={0.80} style={{filter:`drop-shadow(0 0 6px ${n.color}30)`}}/>
        <text x={x2+nW+10} y={n.y+n.h/2} fill={P.t2} fontSize={10} fontWeight={600} dominantBaseline="middle">{n.label}</text>
        <text x={x2+nW+10} y={n.y+n.h/2+13} fill={P.t4} fontSize={9} dominantBaseline="middle">£{n.val.toFixed(0)}k · {(n.val/375.7*100).toFixed(0)}%</text>
      </g>)}
      {/* Right nodes */}
      {rightNodes.map((n,i)=><g key={`r${i}`}>
        <rect x={x3} y={n.y} width={nW} height={Math.max(n.h,6)} rx={5} fill={n.color} opacity={0.80} style={{filter:`drop-shadow(0 0 6px ${n.color}30)`}}/>
        <text x={x3+nW+10} y={n.y+n.h/2-6} fill={P.t2} fontSize={10} fontWeight={600} dominantBaseline="middle">{n.label}</text>
        <text x={x3+nW+10} y={n.y+n.h/2+8} fill={P.t4} fontSize={9} dominantBaseline="middle">£{n.val.toFixed(0)}k</text>
      </g>)}
      {/* Column labels */}
      <text x={x1+nW/2} y={25} textAnchor="middle" fill={P.cyan} fontSize={9} fontWeight={700} letterSpacing={1.2}>TOTAL</text>
      <text x={x2+nW/2} y={25} textAnchor="middle" fill={P.t3} fontSize={9} fontWeight={700} letterSpacing={1.2}>ASSET CLASS</text>
      <text x={x3+nW/2} y={25} textAnchor="middle" fill={P.t3} fontSize={9} fontWeight={700} letterSpacing={1.2}>WRAPPER</text>
    </svg>
  );
};

// =========================================================================
// TAB 2 — STRUCTURE & CONCENTRATION
// =========================================================================
const T2 = ()=>{
  const sorted=[...HOLDINGS].sort((a,b)=>b.val-a.val);
  const top5=sorted.slice(0,5).reduce((a,h)=>a+h.val,0);
  const top3=sorted.slice(0,3).reduce((a,h)=>a+h.val,0);
  const geoColors={"UK":P.cyan,"US":"#3b82f6","SA":P.amber,"Global":P.purple,"Europe":P.indigo,"EM":P.orange,"Japan":"#06b6d4","Asia":P.green,"Mixed":"#94a3b8"};
  const geoAgg={};HOLDINGS.forEach(h=>{geoAgg[h.geo]=(geoAgg[h.geo]||0)+h.val;});
  const geoData=Object.entries(geoAgg).map(([n,v])=>({n,v:+(v/totalAssets*100).toFixed(1),c:geoColors[n]||P.t3})).sort((a,b)=>b.v-a.v);
  const ccyColors={"GBP":P.cyan,"USD":"#3b82f6","ZAR":P.amber,"EUR":P.indigo,"GBP-H":P.purple,"Mixed":"#94a3b8"};
  const ccyAgg={};HOLDINGS.forEach(h=>{ccyAgg[h.ccy]=(ccyAgg[h.ccy]||0)+h.val;});
  const ccyData=Object.entries(ccyAgg).map(([n,v])=>({n,v:+(v/totalAssets*100).toFixed(1),c:ccyColors[n]||P.t3})).sort((a,b)=>b.v-a.v);
  const treemapData = sorted.slice(0,12).map(h=>({name:h.name.split("(")[0].split(" ").slice(0,2).join(" ").trim(),size:h.val,color:h.cls==="Crypto"?P.btc:h.cls==="ETF"?P.cyan:h.cls==="Pension"?"#06b6d4":h.cls==="Cash/FD"||h.cls==="Cash"?"#94a3b8":h.cls==="Investment"?P.indigo:P.purple}));

  return(<div>
    <Hd t="STRUCTURE & CONCENTRATION" s="Holdings decomposition, geographic exposure, wrapper analysis, concentration metrics" tag="HOLDINGS"/>

    {/* KPI ROW */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Positions" v={HOLDINGS.length+18} c={P.t2} sm/><K l="Eff. Pos" v={RISK.effPos.toFixed(1)} c={P.positive} sm delta="1/HHI"/>
      <K l="HHI" v={RISK.hhi.toFixed(3)} c={P.positive} sm delta="<0.10=good"/><K l="Entropy" v={RISK.entropy.toFixed(2)} c={P.t2} sm/>
      <K l="Top 3" v={`${(top3/totalAssets*100).toFixed(0)}%`} c={P.amber} sm delta="Concentration"/><K l="Top 5" v={`${(top5/totalAssets*100).toFixed(0)}%`} c={P.t2} sm/>
      <K l="Div. Ratio" v={RISK.divRatio.toFixed(2)} c={P.positive} sm delta=">1.3=good"/>
    </FlexRow>

    <Ins text={`HHI of ${RISK.hhi} and ${RISK.effPos} effective positions = solid diversification. But 18+ positions below \u00A31k are symbolic clutter. Top 3 hold ${(top3/totalAssets*100).toFixed(0)}% \u2014 pension dominance is structural. The real concentration risk: crypto at 13% capital drives 32% of risk (2.5x ratio).`}/>

    {/* MAIN 2-COLUMN LAYOUT: Left (charts) + Right (holdings table) */}
    <div style={{display:"grid",gridTemplateColumns:"7fr 5fr",gap:14,marginBottom:14}}>
      {/* LEFT: Treemap + Sankey */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <Card hover>
          <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>PORTFOLIO SIZE MAP \u2014 RANKED BY VALUE</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={treemapData} layout="vertical" margin={{left:80}}>
              <CartesianGrid stroke={P.b2} horizontal={false} vertical/>
              <XAxis type="number" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>fK(v)} axisLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fill:P.t2,fontSize:10}} width={75} axisLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="size" name="Value" radius={[0,6,6,0]}>{treemapData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.75}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card hover>
          <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:4}}>NAV FLOW \u2014 ASSETS \u2192 CLASSES \u2192 WRAPPERS</div>
          <div style={{fontSize:11,color:P.t3,marginBottom:10}}>Total {fK(PORT.assets)} decomposed. 57% in taxable wrappers \u2014 biggest structural inefficiency.</div>
          <NavSankey/>
        </Card>
      </div>

      {/* RIGHT: Full holdings table */}
      <Card hover tier={1}>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>FULL HOLDINGS \u2014 RANKED BY VALUE</div>
        <Tbl h={["Holding","Value","Wt%","Class","6mo","Geo"]}
          r={sorted.map(h=>[h.name.split("(")[0].trim(),fK(h.val),`${(h.val/totalAssets*100).toFixed(1)}%`,h.cls,h.prev?pc((h.val-h.prev)/h.prev*100):"---",h.geo])} hl={4}/>
      </Card>
    </div>

    {/* GEO + CURRENCY + WRAPPER (3-column) */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>GEOGRAPHIC EXPOSURE</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={geoData} layout="vertical" margin={{left:38}}>
            <XAxis type="number" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v}%`}/>
            <YAxis dataKey="n" type="category" tick={{fill:P.t2,fontSize:11}} width={35}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Weight %" radius={[0,5,5,0]}>{geoData.map((g,i)=><Cell key={i} fill={g.c} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{fontSize:11,color:P.t3,marginTop:4}}>UK home bias 29% vs 5% MSCI World. US underweight 18% vs 70% MSCI.</div>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>CURRENCY EXPOSURE</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ccyData} margin={{left:5}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="n" tick={{fill:P.t3,fontSize:11}}/>
            <YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Weight %" radius={[5,5,0,0]}>{ccyData.map((g,i)=><Cell key={i} fill={g.c} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{fontSize:11,color:P.t3,marginTop:4}}>GBP 44%, USD 22%, ZAR 10%. FX risk is material.</div>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>WRAPPER DISTRIBUTION</div>
        <Tbl h={["Wrapper","Value","% NAV","Tax"]}
          r={[["GIA (ETFs+Crypto)",fK(178000),"47%","Taxable"],["Pension",fK(82133),"22%","Free"],["FD / Cash",fK(61538),"16%","Mixed"],["ISA",fK(18085),"5%","Free"],["ZAR Accounts",fK(35914),"10%","Taxable"]]}/>
        <div style={{fontSize:11,color:P.t3,marginTop:6}}>57% taxable. Est. annual drag: 1.5-2.0% of NAV (\u00A35.4-7.3k/yr).</div>
      </Card>
    </div>

    {/* SECTOR EXPOSURE (full width) */}
    <Card hover>
      <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:4}}>LOOK-THROUGH SECTOR EXPOSURE</div>
      <div style={{fontSize:11,color:P.t3,marginBottom:10}}>ETF holdings decomposed into underlying sectors (JPM factsheets). Reveals true concentration vs perceived diversification.</div>
      {(()=>{
        const sectorBreakdown = REF_DATA?.etf_sector_breakdown || {JURE:{Tech:30,Financial:14,Healthcare:13,Industrial:11,ConsDisc:9,Energy:6,CommServ:5,Other:12},JGEP:{Tech:22,Financial:16,Industrial:12,Healthcare:11,ConsDisc:8,Energy:7,Materials:6,Other:18},JUKC:{Financial:22,ConsDisc:14,Industrial:13,Energy:11,Healthcare:9,Materials:8,Tech:6,Other:17}};
        const etfHoldings = HOLDINGS.filter(h=>h.cls==="ETF");
        const sectorAgg = {};
        etfHoldings.forEach(h=>{
          const ticker = h.name.split('.')[0];
          const weights = ticker ? sectorBreakdown[ticker] : null;
          if(weights){ Object.entries(weights).forEach(([sec,pct])=>{ sectorAgg[sec] = (sectorAgg[sec]||0) + h.val * pct / 100; }); }
        });
        const sectorColors={Tech:P.cyan,Financial:P.indigo,Healthcare:P.green,Industrial:P.amber,ConsDisc:P.purple,Energy:P.red,Materials:"#06b6d4",CommServ:"#8b5cf6",Other:P.t4};
        const sectorData = Object.entries(sectorAgg).map(([n,v])=>({n,v:Math.round(v),pct:+(v/totalAssets*100).toFixed(1),c:sectorColors[n]||P.t3})).sort((a,b)=>b.v-a.v);
        if(!sectorData.length) return <div style={{fontSize:12,color:P.t4}}>Sector data loading...</div>;
        return(<>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectorData} layout="vertical" margin={{left:65}}>
              <CartesianGrid stroke={P.b2}/>
              <XAxis type="number" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>fK(v)}/>
              <YAxis dataKey="n" type="category" tick={{fill:P.t2,fontSize:10}} width={60}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="v" name="Exposure" radius={[0,5,5,0]}>{sectorData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.7}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
            {sectorData.slice(0,6).map((s,i)=><div key={i} style={{fontSize:10,color:s.c,padding:"2px 8px",background:`${s.c}12`,borderRadius:5,fontWeight:700}}>{s.n} {s.pct}%</div>)}
          </div>
        </>);
      })()}
    </Card>
  </div>);
};
// =========================================================================
// TAB 3 — PERFORMANCE & ATTRIBUTION
// =========================================================================
const T3 = ()=>{
  const wfData = BRIDGE_ITEMS.slice(1).map(b => b);
  const waterfall = [];
  waterfall.push({name:"Start (Sep 25)", val:PORT.nw6moAgo/1000, base:0, step:PORT.nw6moAgo/1000, isAnchor:true, cum:PORT.nw6moAgo/1000});
  let cum = PORT.nw6moAgo;
  wfData.forEach(b => {
    const prev = cum;
    cum += b.delta;
    waterfall.push({name: b.name, val: Math.abs(b.delta)/1000, base: Math.min(prev, cum)/1000, step: b.delta/1000, isAnchor: false, isPos: b.delta >= 0, cum: cum/1000});
  });
  waterfall.push({name:"End (Mar 26)", val:PORT.netWorth/1000, base:0, step:PORT.netWorth/1000, isAnchor:true, cum:PORT.netWorth/1000});

  const sleevePerf = HOLDINGS.filter(h=>h.prev&&h.prev>0).map(h=>({
    name:h.name.split("(")[0].split(" ").slice(0,2).join(" ").trim(),
    ret:+((h.val-h.prev)/h.prev*100).toFixed(1),
    contrib:+((h.val-h.prev)/PORT.nw6moAgo*100).toFixed(1),
  })).sort((a,b)=>b.contrib-a.contrib).filter((_,i,a)=>i<4||i>=a.length-5);
  const cumReturn = NW_WEEKLY.map(w=>({d:w.d,ret:((w.nw-PORT.nw6moAgo)/PORT.nw6moAgo*100)}));

  return(<div>
    <Hd t="PERFORMANCE & ATTRIBUTION" s="NAV reconciliation, contribution analysis, return decomposition" tag="PM REVIEW"/>

    {/* KPI ROW */}
    <FlexRow gap={8} style={{marginBottom:14}}>
      <K l="Opening NW" v={fK(PORT.nw6moAgo)} c={P.t2} delta="20 Sep 2025"/>
      <K l="Closing NW" v={fK(PORT.netWorth)} c={P.t1} delta="7 Mar 2026"/>
      <K l="Net Change" v={fK(PORT.netWorth-PORT.nw6moAgo)} c={P.negative} delta={pc(nwReturn)} deltaType="down"/>
      <K l="Inflows" v="+\u00A328.8k" c={P.positive} delta="Salary+Bonus+Employer" deltaType="up"/>
      <K l="Market P&L" v="-\u00A319.3k" c={P.negative} delta="Net investment return" deltaType="down"/>
    </FlexRow>

    {/* ROW 2: NAV Bridge (left 7fr) + Sleeve Return (right 5fr) */}
    <div style={{display:"grid",gridTemplateColumns:"7fr 5fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:6}}>NAV WATERFALL BRIDGE</div>
        <div style={{fontSize:11,color:P.t3,marginBottom:8}}>Start/End = absolute. Steps = contribution to change from {fK(PORT.nw6moAgo)} \u2192 {fK(PORT.netWorth)}.</div>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={waterfall} margin={{left:5,right:5,bottom:10}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="name" tick={{fill:P.t3,fontSize:9}} angle={-25} textAnchor="end" height={60} interval={0}/>
            <YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`\u00A3${v.toFixed(0)}k`} domain={[0,'auto']}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length)return null;
              const d=waterfall.find(w=>w.name===label);
              return(<div style={{...GS,padding:"10px 14px",fontSize:12,borderRadius:12}}>
                <div style={{color:P.t3,marginBottom:3,fontWeight:600}}>{label}</div>
                {d?.isAnchor
                  ?<div style={{color:P.cyan,fontWeight:700}}>\u00A3{d.step.toFixed(1)}k</div>
                  :<><div style={{color:d?.isPos?P.cyan:P.red,fontWeight:700}}>{d?.isPos?"+":""}{d?.step.toFixed(1)}k</div>
                    <div style={{color:P.t4,fontSize:11}}>Running: \u00A3{d?.cum.toFixed(1)}k</div></>}
              </div>);
            }}/>
            <Bar dataKey="base" stackId="w" fill="transparent" name=" " radius={0}/>
            <Bar dataKey="val" stackId="w" name="Change" radius={[3,3,0,0]}>
              {waterfall.map((w,i)=><Cell key={i} fill={w.isAnchor?P.indigo:w.isPos?P.cyan:P.red} fillOpacity={w.isAnchor?0.55:0.75} stroke={w.isAnchor?"rgba(129,140,248,0.4)":"none"} strokeWidth={w.isAnchor?1:0}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>SLEEVE RETURN vs CONTRIBUTION</div>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={sleevePerf} layout="vertical" margin={{left:55}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:10}}/>
            <YAxis dataKey="name" type="category" tick={{fill:P.t2,fontSize:11}} width={50}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine x={0} stroke={P.t4}/>
            <Bar dataKey="ret" name="Return %" radius={[0,4,4,0]}>{sleevePerf.map((d,i)=><Cell key={i} fill={d.ret>=0?P.cyan:P.red} fillOpacity={0.6}/>)}</Bar>
            <Line dataKey="contrib" name="Contribution %" stroke={P.amber} strokeWidth={2} dot={{fill:P.amber,r:3}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>

    <Ins text={`The bridge reveals the core issue: +\u00A328.8k fresh capital but crypto destroyed -\u00A352.2k and cash drawn down -\u00A325.9k. Equity +\u00A313.6k and pension +\u00A316.8k were bright spots. Without crypto, portfolio would have grown +\u00A335k \u2014 instead it shrank -\u00A335k.`}/>

    {/* ROW 3: Cumulative Return + Contributors Table */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>CUMULATIVE RETURN PATH</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={cumReturn} margin={{left:5}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="d" tick={{fill:P.t3,fontSize:9}} interval={3}/>
            <YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v.toFixed(0)}%`}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine y={0} stroke={P.t4}/>
            <Area type="monotone" dataKey="ret" name="Cumulative %" stroke={P.red} fill={P.red} fillOpacity={0.08} strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
      <Card hover tier={1}>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>TOP CONTRIBUTORS & DETRACTORS</div>
        <Tbl h={["Holding","Start","End","P&L","Ret"]}
          r={HOLDINGS.filter(h=>h.prev).map(h=>({n:h.name.split("(")[0].split(" ").slice(0,3).join(" ").trim(),s:h.prev,e:h.val,pnl:h.val-h.prev,ret:(h.val-h.prev)/h.prev*100})).sort((a,b)=>b.pnl-a.pnl).map(h=>[h.n,fK(h.s),fK(h.e),`${h.pnl>=0?"+":""}${fK(h.pnl)}`,pc(h.ret)])} hl={3}/>
      </Card>
    </div>

    {/* Decision Attribution + Up/Down Capture side-by-side */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:4}}>DECISION ATTRIBUTION</div>
        <div style={{fontSize:11,color:P.t3,marginBottom:10}}>Market/allocation/selection/FX/structural decomposition.</div>
        {(()=>{
          const totalRet = (PORT.netWorth - PORT.nw6moAgo) / PORT.nw6moAgo * 100;
          const benchRet = (PORT.benchReturn || -0.028) * 100;
          const attrs = [{n:"Market (Beta)",v:benchRet,c:P.t3},{n:"Allocation",v:-3.2,c:P.red},{n:"Selection",v:1.8,c:P.green},{n:"FX / Currency",v:1.3,c:P.cyan},{n:"Structural Drag",v:-1.5,c:P.amber},{n:"Residual",v:+(totalRet-benchRet-(-3.2)-1.8-1.3-(-1.5)).toFixed(1),c:P.purple}];
          return(
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {attrs.map((a,i)=>{
                const barW = Math.abs(a.v) / 10 * 100;
                return(<div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:100,fontSize:11,color:P.t3,textAlign:"right",fontWeight:600}}>{a.n}</div>
                  <div style={{flex:1,height:14,background:"rgba(0,0,0,0.03)",borderRadius:7,position:"relative",overflow:"hidden"}}>
                    {a.v >= 0 ? <div style={{position:"absolute",left:"50%",width:`${Math.min(barW,50)}%`,height:"100%",background:`${P.green}60`,borderRadius:"0 7px 7px 0"}}/> : <div style={{position:"absolute",right:"50%",width:`${Math.min(barW,50)}%`,height:"100%",background:`${P.red}60`,borderRadius:"7px 0 0 7px"}}/>}
                    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(0,0,0,0.08)"}}/>
                  </div>
                  <div style={{width:45,fontSize:12,fontWeight:800,color:a.v>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{a.v>=0?"+":""}{a.v.toFixed(1)}%</div>
                </div>);
              })}
              <div style={{display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${P.b2}`,paddingTop:6,marginTop:4}}>
                <div style={{width:100,fontSize:12,color:P.t1,textAlign:"right",fontWeight:800}}>Total</div>
                <div style={{flex:1}}/>
                <div style={{width:45,fontSize:13,fontWeight:800,color:totalRet>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{totalRet>=0?"+":""}{totalRet.toFixed(1)}%</div>
              </div>
            </div>
          );
        })()}
        <div style={{fontSize:11,color:P.t3,marginTop:6}}>Allocation (-3.2%) from crypto overweight destroyed value. Selection (+1.8%) from JPM Research Enhanced outperformance.</div>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:4}}>UP/DOWN CAPTURE RATIO</div>
        <div style={{fontSize:11,color:P.t3,marginBottom:10}}>Portfolio participation in benchmark gains vs losses.</div>
        {(()=>{
          const benchMonthly = REF_DATA?.benchmark_monthly_returns?.months || [{m:"Oct",bench:-1.5,port:-2.1},{m:"Nov",bench:-3.2,port:-6.8},{m:"Dec",bench:0.8,port:-1.2},{m:"Jan",bench:1.2,port:-0.5},{m:"Feb",bench:-2.1,port:-4.2},{m:"Mar",bench:2.0,port:3.2}];
          const upMonths = benchMonthly.filter(m => m.bench > 0);
          const downMonths = benchMonthly.filter(m => m.bench < 0);
          const upCapture = upMonths.length > 0 ? +(upMonths.reduce((a,m)=>a+m.port,0) / upMonths.reduce((a,m)=>a+m.bench,0) * 100).toFixed(0) : 0;
          const downCapture = downMonths.length > 0 ? +(downMonths.reduce((a,m)=>a+m.port,0) / downMonths.reduce((a,m)=>a+m.bench,0) * 100).toFixed(0) : 0;
          const captureRatio = downCapture > 0 ? +(upCapture / downCapture).toFixed(2) : 0;
          return(<div>
            <FlexRow gap={6} style={{marginBottom:10}}>
              <K l="Up Capture" v={`${upCapture}%`} c={upCapture>100?P.positive:P.amber} sm/><K l="Down Capture" v={`${downCapture}%`} c={downCapture<100?P.positive:P.negative} sm/><K l="Ratio" v={captureRatio.toFixed(2)} c={captureRatio>=1?P.positive:P.negative} sm delta=">1.0 = skill"/>
            </FlexRow>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={benchMonthly}><CartesianGrid stroke={P.b2}/><XAxis dataKey="m" tick={{fill:P.t3,fontSize:11}}/><YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v}%`}/><Tooltip content={<Tip/>}/><ReferenceLine y={0} stroke={P.t4}/><Bar dataKey="bench" name="Benchmark" fill={P.t4} fillOpacity={0.4} radius={[3,3,0,0]}/><Bar dataKey="port" name="Portfolio" radius={[3,3,0,0]}>{benchMonthly.map((d,i)=><Cell key={i} fill={d.port>=0?P.cyan:P.red} fillOpacity={0.7}/>)}</Bar></BarChart>
            </ResponsiveContainer>
            <div style={{fontSize:11,color:P.t3,marginTop:4}}>Capture ratio {captureRatio} \u2014 {captureRatio < 1 ? "below 1.0 = portfolio amplifies downside. Crypto drag." : "defensive characteristics."}</div>
          </div>);
        })()}
      </Card>
    </div>
  </div>);
};
// =========================================================================
// TAB 4 — RISK ENGINE
// =========================================================================
const T4 = ()=>{
  const radar=FACTORS.slice(0,8).map(f=>({factor:f.f.split("/")[0],portfolio:f.p,benchmark:f.b}));
  const riskContrib=[
    {name:"Crypto",risk:32,capital:13,color:P.btc},{name:"Equity ETFs",risk:28,capital:28,color:P.cyan},
    {name:"ZAR/EM",risk:14,capital:12,color:P.amber},{name:"Pension",risk:12,capital:22,color:"#06b6d4"},
    {name:"Cash/FD",risk:2,capital:16,color:"#94a3b8"},{name:"Other",risk:12,capital:9,color:P.purple},
  ];
  const volTrend=MONTHLY_DATA.filter(m=>m.vol!=null).map(m=>({d:m.m,vol:m.vol,dd:m.r}));
  return(<div>
    <Hd t="RISK ENGINE" s="Volatility, tail risk, VaR, factor analysis, correlation structure" tag="RISK" ac={P.red}/>

    {/* KPI ROW */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Vol" v={`${RISK.vol}%`} c={P.negative} sm delta="Annualised"/><K l="Sharpe" v={RISK.sharpe.toFixed(2)} c={RISK.sharpe>=0.5?P.positive:P.negative} sm delta="<0.5=poor"/>
      <K l="Sortino" v={RISK.sortino.toFixed(2)} c={P.amber} sm delta="Downside-adj"/><K l="Max DD" v={`${RISK.maxDD}%`} c={P.negative} sm delta={`${RISK.ddDur}d`}/>
      <K l="VaR 95" v={`${RISK.var95}%`} c={P.negative} sm delta="Monthly"/><K l="CVaR" v={`${RISK.cvar95}%`} c={P.negative} sm delta="Shortfall"/>
      <K l="Omega" v={RISK.omega.toFixed(2)} c={P.amber} sm delta=">1.0 OK"/><K l="Beta" v={RISK.beta.toFixed(2)} c={P.t2} sm delta="vs MSCI"/>
    </FlexRow>

    {/* Risk metrics table (full width, Glass-1 for density) */}
    <Card hover tier={1} style={{marginBottom:14}}>
      <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>COMPLETE RISK METRICS</div>
      <Tbl h={["Metric","Value","Rating","Interpretation"]}
        r={[
          ["Annualised Vol",`${RISK.vol}%`,"Elevated","Driven by 48% crypto vol on 13% weight"],
          ["Sharpe Ratio",RISK.sharpe.toFixed(2),"Poor","Below 0.5 = insufficient risk compensation"],
          ["Sortino Ratio",RISK.sortino.toFixed(2),"Below avg","Downside vol from crypto drawdown"],
          ["Calmar Ratio",RISK.calmar.toFixed(2),"Weak","Return/MaxDD \u2014 need >1.0"],
          ["Max Drawdown",`${RISK.maxDD}%`,"Moderate",`${RISK.ddDur} days, still in drawdown`],
          ["VaR 95%",`${RISK.var95}%`,"Elevated","5% chance of >3.8% monthly loss"],
          ["CVaR 95%",`${RISK.cvar95}%`,"Elevated","Expected -6.2% when VaR breached"],
          ["Tail Ratio",RISK.tail.toFixed(2),"Borderline","<1.0 = fatter left tail"],
          ["Skewness",RISK.skew.toFixed(2),"Neg. skew","More large losses than gains"],
          ["Kurtosis",RISK.kurt.toFixed(1),"Fat tails","5.4 vs normal 3.0"],
        ]} hl={2}/>
    </Card>

    {/* Factor Radar + Risk vs Capital (side-by-side) */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>FACTOR EXPOSURE vs BENCHMARK</div>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radar}><PolarGrid stroke="rgba(0,0,0,0.04)" gridType="polygon"/>
            <PolarAngleAxis dataKey="factor" tick={{fill:P.t2,fontSize:11}}/>
            <PolarRadiusAxis tick={{fill:P.t4,fontSize:9}} domain={[0,100]}/>
            <Radar name="Portfolio" dataKey="portfolio" stroke={P.cyan} fill={P.cyan} fillOpacity={0.12} strokeWidth={2.5}/>
            <Radar name="Benchmark" dataKey="benchmark" stroke={P.t4} fill="none" strokeWidth={1.5} strokeDasharray="4 4"/>
            <Tooltip/>
          </RadarChart>
        </ResponsiveContainer>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>RISK vs CAPITAL CONTRIBUTION</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={riskContrib} margin={{left:5}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="name" tick={{fill:P.t3,fontSize:10}}/>
            <YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="capital" name="Capital %" fill={P.cyan} fillOpacity={0.4} radius={[4,4,0,0]}/>
            <Bar dataKey="risk" name="Risk %" fill={P.red} fillOpacity={0.6} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
        <div style={{fontSize:11,color:P.t3,marginTop:4}}>Crypto: 13% capital \u2192 32% risk (2.5x). Cash/FD: 16% capital \u2192 2% risk (drag).</div>
      </Card>
    </div>

    {/* Vol Trend + Factor Table (side-by-side) */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>ROLLING VOLATILITY & MONTHLY RETURN</div>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={volTrend}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="d" tick={{fill:P.t3,fontSize:11}}/>
            <YAxis yAxisId="l" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v}%`}/>
            <YAxis yAxisId="r" orientation="right" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Bar yAxisId="r" dataKey="dd" name="Monthly Ret %" radius={[3,3,0,0]}>{volTrend.map((d,i)=><Cell key={i} fill={d.dd>=0?P.cyan:P.red} fillOpacity={0.6}/>)}</Bar>
            <Line yAxisId="l" type="monotone" dataKey="vol" name="Rolling Vol %" stroke={P.amber} strokeWidth={2.5} dot={{fill:P.amber,r:3}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
      <Card hover tier={1}>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:8}}>FACTOR ATTRIBUTION TABLE</div>
        <Tbl h={["Factor","Port","Bench","Intent","Ret%","Risk%"]}
          r={FACTORS.map(f=>[f.f,`${f.p}`,`${f.b}`,f.intent,`${f.ret>0?"+":""}${f.ret}%`,`${f.risk}%`])} hl={4}/>
        <div style={{fontSize:11,color:P.t3,marginTop:6}}>Crypto Beta: 32% risk, -8.4% return. Only equity beta and UK domestic are compensated.</div>
      </Card>
    </div>

    {/* Risk Budget + Correlation (side-by-side) */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:4}}>RISK BUDGET UTILISATION</div>
        <div style={{fontSize:11,color:P.t3,marginBottom:10}}>{"Risk/capital ratio. >1.5x = overconsuming. <0.5x = drag."}</div>
        <div style={{display:"grid",gap:8}}>
          {riskContrib.map((rc,i)=>{
            const ratio = rc.capital > 0 ? (rc.risk / rc.capital) : 0;
            const barC = ratio > 2.0 ? P.red : ratio > 1.5 ? P.amber : ratio > 0.5 ? P.green : P.t4;
            const label = ratio > 2.0 ? "OVER" : ratio > 1.5 ? "HIGH" : ratio > 0.5 ? "OK" : "DRAG";
            return (
              <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:70,fontSize:11,color:P.t2,fontWeight:600,textAlign:"right"}}>{rc.name}</div>
                <div style={{flex:1,height:12,background:"rgba(0,0,0,0.04)",borderRadius:6,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(ratio/3*100,100)}%`,height:"100%",background:`linear-gradient(90deg,${barC}cc,${barC}60)`,borderRadius:6}}/>
                </div>
                <div style={{width:35,fontSize:12,fontWeight:800,color:barC,fontFamily:P.mono,textAlign:"right"}}>{ratio.toFixed(1)}x</div>
                <div style={{width:40,fontSize:9,color:barC,fontWeight:700,padding:"2px 4px",background:`${barC}12`,borderRadius:4,textAlign:"center"}}>{label}</div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card hover>
        <div style={{fontSize:13,fontWeight:700,color:P.t1,marginBottom:4}}>CROSS-ASSET CORRELATION</div>
        <div style={{fontSize:11,color:P.t3,marginBottom:8}}>Pairwise correlations. Low/negative = genuine diversification.</div>
        {(()=>{
          const corrData = REF_DATA?.correlation_matrix || {sleeves:["Equity","Crypto","Pension","Cash/FD","ZAR","Other"],matrix:[[1,0.52,0.8,-0.15,0.35,0.6],[0.52,1,0.3,-0.05,0.25,0.2],[0.8,0.3,1,-0.1,0.25,0.5],[-0.15,-0.05,-0.1,1,0.05,-0.1],[0.35,0.25,0.25,0.05,1,0.4],[0.6,0.2,0.5,-0.1,0.4,1]]};
          const sl = corrData.sleeves; const mx = corrData.matrix;
          const cellBg = (v) => v >= 0.7 ? "rgba(239,68,68,0.25)" : v >= 0.4 ? "rgba(251,191,36,0.15)" : v < 0 ? "rgba(34,197,94,0.15)" : "rgba(0,0,0,0.03)";
          const cellC = (v) => v >= 0.7 ? P.red : v >= 0.4 ? P.amber : v < 0 ? P.green : P.t2;
          return(<div style={{display:"grid",gridTemplateColumns:`70px repeat(${sl.length},1fr)`,gap:2,fontSize:10}}>
            <div/>{sl.map((s,i)=><div key={i} style={{padding:4,fontWeight:700,color:P.t3,textAlign:"center",fontSize:9}}>{s}</div>)}
            {sl.map((row,ri)=><>{[<div key={`l${ri}`} style={{padding:4,fontWeight:600,color:P.t2,fontSize:10,display:"flex",alignItems:"center"}}>{row}</div>,...mx[ri].map((v,ci)=><div key={`${ri}-${ci}`} style={{padding:"8px 3px",textAlign:"center",background:ri===ci?"rgba(99,102,241,0.10)":cellBg(v),borderRadius:5,fontWeight:ri===ci?800:700,color:ri===ci?P.indigo:cellC(v),fontFamily:P.mono,fontSize:ri===ci?11:10}}>{ri===ci?"1.00":v.toFixed(2)}</div>)]}</>)}
          </div>);
        })()}
        <div style={{fontSize:11,color:P.t3,marginTop:6}}>Equity-Crypto 0.52 = less diversification than perceived. Cash/FD is the only true diversifier.</div>
      </Card>
    </div>

    <Ins type="risk" text={`Sharpe of ${RISK.sharpe} is below institutional minimums. Excluding crypto, equity sleeve Sharpe is ~0.9-1.1. Skewness ${RISK.skew} + kurtosis ${RISK.kurt} = fat left tails. Risk budget dominated by a single asset class delivering negative returns.`}/>
  </div>);
};
// =========================================================================
// TAB 5 — STRESS TESTS
// =========================================================================
const T5 = ()=>{
  const probWeighted = STRESS.map(s=>({...s,wImpact:+(s.impact*parseFloat(s.pr)/100).toFixed(2)}));
  return(<div>
    <Hd t="STRESS TESTS & SCENARIOS" s="Shock analysis and wealth projections with probability weighting" tag="TAIL RISK" ac={P.red}/>

    {/* KPI STRIP */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Scenarios" v={STRESS.length} c={P.t2} sm/><K l="Worst Case" v={`${Math.min(...STRESS.map(s=>s.impact))}%`} c={P.negative} sm delta="Combined risk-off"/>
      <K l="Expected Loss" v={`${probWeighted.reduce((a,s)=>a+s.wImpact,0).toFixed(1)}%`} c={P.negative} sm delta="Prob-weighted"/>
      <K l="Max NW Impact" v={fK(PORT.netWorth * Math.min(...STRESS.map(s=>s.impact)) / 100)} c={P.negative} sm delta="At worst case"/>
      <K l="Best Hedge" v="GBP/USD" c={P.positive} sm delta="+3.2% USD gain"/>
    </FlexRow>

    {/* SIDE-BY-SIDE: Impact Matrix + Probability Chart */}
    <div style={{display:"grid",gridTemplateColumns:"7fr 5fr",gap:14,marginBottom:14}}>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:12}}>SCENARIO IMPACT MATRIX</div>
      {STRESS.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${P.b2}`}}>
        <div style={{flex:"1 1 160px",fontSize:14,color:P.t2,fontWeight:500}}>{s.s}</div>
        <div style={{width:120}}><div style={{height:8,background:"rgba(255,255,255,0.03)",borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${Math.min(Math.abs(s.impact)/18*100,100)}%`,height:"100%",background:s.impact>0?P.positive:P.negative,borderRadius:4,boxShadow:`0 0 8px ${s.impact>0?P.positive:P.negative}30`}}/>
        </div></div>
        <div style={{width:55,textAlign:"right",fontSize:16,fontWeight:800,color:s.impact>0?P.positive:P.negative,fontFamily:P.mono}}>{s.impact>0?"+":""}{s.impact}%</div>
        <div style={{width:35,fontSize:12,color:P.t3,textAlign:"right"}}>{s.pr}</div>
        <div style={{flex:"0 0 120px",fontSize:13,color:P.t3,textAlign:"right"}}>{s.exp}</div>
      </div>)}
    </Card>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>PROBABILITY-WEIGHTED IMPACT</div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={probWeighted} margin={{left:5}}>
          <CartesianGrid stroke={P.b2}/>
          <XAxis dataKey="s" tick={{fill:P.t3,fontSize:11}} angle={-15} textAnchor="end" height={60}/>
          <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}%`}/>
          <Tooltip content={<Tip/>}/>
          <Bar dataKey="wImpact" name="Prob-Weighted %" radius={[4,4,0,0]}>
            {probWeighted.map((d,i)=><Cell key={i} fill={d.wImpact>=0?P.positive:P.negative} fillOpacity={0.7}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{fontSize:12,color:P.t3,marginTop:6}}>Expected loss: {probWeighted.reduce((a,s)=>a+s.wImpact,0).toFixed(2)}% prob-weighted.</div>
    </Card>
    </div>
    {/* SPRINT 2: Scenario Heatmap — sleeves × scenarios cross-matrix */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>SCENARIO SENSITIVITY HEATMAP</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>Each cell shows estimated portfolio impact (%) from that sleeve under that scenario. Darker red = larger loss exposure.</div>
      {(()=>{
        const sleeves=[{n:"Equity ETFs",w:0.28,betas:{eq:1.0,cry:0.0,fx:-0.3,zar:0.0,rate:0.6}},{n:"Pension",w:0.22,betas:{eq:0.7,cry:0.0,fx:0.0,zar:0.0,rate:0.3}},{n:"Crypto",w:0.13,betas:{eq:0.0,cry:1.0,fx:0.0,zar:0.0,rate:0.0}},{n:"Cash/FD",w:0.16,betas:{eq:0.0,cry:0.0,fx:0.0,zar:0.0,rate:-0.2}},{n:"ZAR",w:0.10,betas:{eq:0.3,cry:0.0,fx:0.0,zar:1.0,rate:0.2}},{n:"Other",w:0.11,betas:{eq:0.4,cry:0.0,fx:0.0,zar:0.3,rate:0.3}}];
        const shocks=[{n:"Eq -20%",k:"eq",m:-20},{n:"Cry -40%",k:"cry",m:-40},{n:"BTC -60%",k:"cry",m:-60},{n:"GBP -10%",k:"fx",m:-10},{n:"ZAR -20%",k:"zar",m:-20},{n:"Combined",k:"eq",m:-20,k2:"cry",m2:-40},{n:"Stagflation",k:"eq",m:-15,k2:"rate",m2:4}];
        const cellColor=(v)=>{if(v<=-3)return{bg:"rgba(239,68,68,0.30)",c:P.red};if(v<=-1)return{bg:"rgba(239,68,68,0.15)",c:P.red};if(v<0)return{bg:"rgba(239,68,68,0.06)",c:"#dc2626"};if(v===0)return{bg:"rgba(0,0,0,0.02)",c:P.t4};if(v>0)return{bg:"rgba(34,197,94,0.12)",c:P.green};return{bg:"rgba(0,0,0,0.02)",c:P.t4};};
        return(
          <div style={{overflowX:"auto"}}>
            <div style={{display:"grid",gridTemplateColumns:`100px repeat(${shocks.length},1fr)`,gap:2,fontSize:11}}>
              <div style={{padding:6,fontWeight:700,color:P.t3}}/>
              {shocks.map((s,i)=><div key={i} style={{padding:"6px 4px",fontWeight:700,color:P.t2,textAlign:"center",fontSize:10}}>{s.n}</div>)}
              {sleeves.map((sl,si)=><>
                <div key={`l${si}`} style={{padding:6,fontWeight:600,color:P.t2,fontSize:12}}>{sl.n}</div>
                {shocks.map((sh,shi)=>{
                  let impact = sl.w * (sl.betas[sh.k]||0) * sh.m;
                  if(sh.k2) impact += sl.w * (sl.betas[sh.k2]||0) * sh.m2;
                  impact = +impact.toFixed(1);
                  const {bg,c} = cellColor(impact);
                  return <div key={`${si}-${shi}`} style={{padding:"8px 4px",textAlign:"center",background:bg,borderRadius:6,fontWeight:700,color:c,fontFamily:P.mono,fontSize:12}}>{impact!==0?(impact>0?"+":"")+impact:"-"}</div>;
                })}
              </>)}
            </div>
          </div>
        );
      })()}
    </Card>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:6}}>WEALTH PROJECTION — 5 SCENARIOS</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:10}}>Salary: £170k +15%/yr · Bonus: 100% of salary · Tax: 47% · Expenses: £6k/mo +15%/yr · Returns vary by scenario</div>
      <ResponsiveContainer width="100%" height={420}>
        <AreaChart data={WEALTH_5.filter(w=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(w.y))}><CartesianGrid stroke={P.b2}/>
          <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>`${(v/1000).toFixed(0)}m`}/>
          <Tooltip content={<Tip/>}/>
          <Area type="monotone" dataKey="bull" name="Bull+Crypto" stroke={P.green} fill={P.green} fillOpacity={0.04} strokeWidth={2}/>
          <Area type="monotone" dataKey="allOpps" name="All Opps" stroke={P.indigo} fill={P.indigo} fillOpacity={0.03} strokeWidth={2}/>
          <Area type="monotone" dataKey="base" name="Base (15%)" stroke={P.t1} fill={P.t1} fillOpacity={0.03} strokeWidth={2.5}/>
          <Area type="monotone" dataKey="conservative" name="Conservative (8%)" stroke={P.red} fill={P.red} fillOpacity={0.02} strokeWidth={1.5} strokeDasharray="4 4"/>
          <ReferenceLine y={1000} stroke={P.amber} strokeDasharray="8 4" label={{value:"£1M",fill:P.amber,fontSize:13,fontWeight:700}}/>
          <ReferenceLine y={1800} stroke={P.cyan} strokeDasharray="8 4" label={{value:"FIRE",fill:P.cyan,fontSize:13,fontWeight:700}}/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{fontSize:13,color:P.t3,marginTop:6}}>Base case (15% returns) reaches £1M by 2030 (age 36). Conservative (8% returns) still reaches £1M by 2032. FIRE (£1.8M) achievable by 2032-34 depending on scenario. Income growth at 15%/yr is the dominant driver in all cases.</div>
    </Card>
  </div>);
};

// =========================================================================
// TABS 6-12 (Cashflow, Bonus, Opps, Efficiency, Long-Term, Crypto, Actions)
// =========================================================================
const T6 = ()=>{
  const netSalary=PORT.grossSalary*(1-PORT.taxRate-PORT.niRate);
  const netBonus=PORT.grossBonus*(1-PORT.taxRate-PORT.niRate);
  const totalNet=netSalary+netBonus;
  const savingsRate=((totalNet-PORT.monthlyExpenses*12)/totalNet*100);
  const liquidCash=HOLDINGS.filter(h=>h.cls==="Cash"||h.name.includes("Rainy")).reduce((s,h)=>s+h.val,0);
  const runway=liquidCash/PORT.monthlyExpenses;
  const monthlyFlow=[
    {m:"Salary Net",v:+(netSalary/12).toFixed(0)},{m:"Expenses",v:-PORT.monthlyExpenses},
    {m:"Investable",v:+((netSalary/12)-PORT.monthlyExpenses).toFixed(0)},
  ];
  return(<div>
    <Hd t="CASHFLOW & CAPITAL ENGINE" s="Income, savings velocity, balance sheet health" tag="CAPITAL"/>
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Gross Salary" v={fK(PORT.grossSalary)} s="£170k from March"/><K l="Gross Bonus" v="£150-190k" s="Performance-based" c={P.amber}/>
      <K l="Total Net" v={`~${fK(totalNet)}`} s="Post tax+NI" c={P.positive}/><K l="Expenses" v="£6k/mo" s="£72k/yr"/>
      <K l="Savings Rate" v={`${savingsRate.toFixed(0)}%`} s="of net income" c={savingsRate>30?P.positive:P.amber} sm/><K l="Runway" v={`${runway.toFixed(1)}mo`} s="Liquid cash" c={runway>3?P.positive:P.negative} sm/>
    </FlexRow>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>BALANCE SHEET</div>
      <Tbl h={["Item","Amount","% NW","Interpretation"]} r={[
        ["Total Assets",fmt(PORT.assets),"---","Includes pro-rata £100k correction"],
        ["Amex Credit Card",`-${fmt(PORT.amexDebt)}`,"2.9%","22% APR — clear immediately from bonus"],
        ["Monzo Flex",`-${fmt(PORT.monzoFlex)}`,"0.8%","0% if on plan — low priority"],
        ["Net Worth",fmt(PORT.netWorth),"---","Assets less all debts"],
        ["Liquid Cash",fmt(liquidCash),"4.5%",`${runway.toFixed(1)} months expenses — below 3mo target`],
        ["Emergency Target",fmt(PORT.monthlyExpenses*3),"---","£18k target — shortfall of ~£2k"],
        ["Debt-to-Assets",`${(PORT.debts/PORT.assets*100).toFixed(1)}%`,"---","Low leverage but Amex rate is punitive"],
      ]}/>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>MONTHLY CASHFLOW</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyFlow}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="m" tick={{fill:P.t3,fontSize:13}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>v>=0?`+${(v/1000).toFixed(1)}k`:`${(v/1000).toFixed(1)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="£/month" radius={[4,4,0,0]}>{monthlyFlow.map((d,i)=><Cell key={i} fill={d.v>=0?P.cyan:P.red} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>DEPLOYMENT STATUS</div>
        <div style={{display:"grid",gap:14,marginTop:8}}>
          <Bar2 val={0} max={20000} c={P.red} label="ISA Allowance 2025/26 (29 days left)"/>
          <Bar2 val={5000} max={35000} c={P.amber} label="Pension Annual Allowance"/>
          <Bar2 val={liquidCash} max={18000} c={P.amber} label="Emergency Fund (target £18k)"/>
          <Bar2 val={PORT.amexDebt} max={PORT.amexDebt} c={P.red} label={`Amex Outstanding: ${fmt(PORT.amexDebt)}`}/>
        </div>
      </Card>
    </div>
    {/* SPRINT 2: Capital Conversion Efficiency */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>CAPITAL CONVERSION EFFICIENCY</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>What percentage of every pound earned actually compounds into wealth vs leaks to tax, expenses, debt, and friction.</div>
      {(()=>{
        const grossIncome = PORT.grossSalary + PORT.grossBonus;
        const taxNI = grossIncome * (PORT.taxRate + PORT.niRate);
        const expenses = PORT.monthlyExpenses * 12;
        const debtService = Math.round(PORT.amexDebt * 0.22);
        const investable = grossIncome - taxNI - expenses - debtService;
        const conversionRate = (investable / grossIncome * 100);
        const stages = [
          {l:"Gross Income",v:grossIncome,c:P.cyan,pct:100},
          {l:"After Tax+NI",v:grossIncome-taxNI,c:P.indigo,pct:((grossIncome-taxNI)/grossIncome*100)},
          {l:"After Expenses",v:grossIncome-taxNI-expenses,c:P.amber,pct:((grossIncome-taxNI-expenses)/grossIncome*100)},
          {l:"After Debt Service",v:investable,c:conversionRate>25?P.positive:P.negative,pct:conversionRate},
        ];
        return(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {stages.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:120,fontSize:12,color:P.t3,textAlign:"right"}}>{s.l}</div>
                <div style={{flex:1,height:20,background:"rgba(0,0,0,0.04)",borderRadius:10,overflow:"hidden"}}>
                  <div style={{width:`${s.pct}%`,height:"100%",background:`linear-gradient(90deg,${s.c}bb,${s.c}50)`,borderRadius:10,transition:"width 0.6s"}}/>
                </div>
                <div style={{width:60,fontSize:13,fontWeight:700,color:s.c,fontFamily:P.mono,textAlign:"right"}}>{fK(s.v)}</div>
                <div style={{width:40,fontSize:11,color:P.t4,textAlign:"right"}}>{s.pct.toFixed(0)}%</div>
              </div>
            ))}
            <div style={{fontSize:13,color:P.t3,marginTop:6}}>Of every £1 earned, £{(investable/grossIncome).toFixed(2)} reaches the investment engine. The 47% tax+NI is the largest leak, followed by £72k expenses. Clearing Amex frees an additional £{(debtService/1000).toFixed(1)}k/yr.</div>
          </div>
        );
      })()}
    </Card>
    <Ins type="action" text={`New salary of £170k + bonus £150-190k transforms the capital engine. Post-tax take-home of ~£180k/yr with £72k expenses = £108k+ annual investable surplus. At this deployment rate, £1M is achievable within 5-6 years through savings compounding alone. Immediate priorities: (1) clear Amex in full, (2) max ISA, (3) salary sacrifice into pension, (4) rebuild emergency fund to £18k.`}/>
  </div>);
};

const T7 = ()=>{
  const scen=[{n:"Defensive",...BONUS.def,c:"#06b6d4",r:"Low"},{n:"Balanced",...BONUS.bal,c:P.cyan,r:"Medium"},{n:"Aggressive",...BONUS.agg,c:P.amber,r:"High"}];
  const compData = scen.map(s=>({name:s.n,debt:s.debt/1000,isa:s.isa/1000,pension:s.pension/1000,equity:(s.equity||0)/1000,crypto:(s.crypto||0)/1000,ai:(s.ai||0)/1000,liq:s.liq/1000,travel:s.travel/1000}));
  return(<div>
    <Hd t="BONUS DEPLOYMENT STRATEGY" s={`Gross: ${fK(BONUS.gross)} (mid) · Tax+NI: ${fK(BONUS.tax+BONUS.ni)} · Post-tax: ${fK(BONUS.postTax)}`} tag="ALLOCATION"/>
    <Row gap={10}>
      <K l="Gross" v={fK(BONUS.gross)} s="Mid-range"/><K l="Tax+NI" v={fK(BONUS.tax+BONUS.ni)} s="45%+2%" c={P.red}/>
      <K l="Post-Tax" v={fK(BONUS.postTax)} s="Deployable" c={P.cyan}/><K l="ISA" v="£20k" s="Max immediately" c={P.t1}/><K l="Amex" v={fmt(PORT.amexDebt)} s="Clear in full" c={P.red}/>
    </Row>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>SCENARIO COMPARISON — ALLOCATION (£k)</div>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={compData}>
          <CartesianGrid stroke={P.b2}/>
          <XAxis dataKey="name" tick={{fill:P.t2,fontSize:14}}/>
          <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}k`}/>
          <Tooltip content={<Tip/>}/>
          <Bar dataKey="debt" name="Debt" stackId="a" fill={P.red}/>
          <Bar dataKey="isa" name="ISA" stackId="a" fill={P.cyan}/>
          <Bar dataKey="pension" name="Pension" stackId="a" fill="#06b6d4"/>
          <Bar dataKey="equity" name="Equity" stackId="a" fill={P.indigo}/>
          <Bar dataKey="crypto" name="Crypto" stackId="a" fill={P.btc}/>
          <Bar dataKey="ai" name="AI/Semis" stackId="a" fill={P.purple}/>
          <Bar dataKey="liq" name="Liquidity" stackId="a" fill={P.amber}/>
          <Bar dataKey="travel" name="Travel" stackId="a" fill={P.orange}/>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    {scen.map((s,i)=><Card key={i} style={{borderLeft:`3px solid ${s.c}`}} hover>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontSize:18,fontWeight:800,color:P.t1}}>{s.n}</div>
        <span style={{fontSize:12,fontWeight:700,color:s.c,padding:"3px 8px",background:`${s.c}18`,borderRadius:6,border:`1px solid ${s.c}30`}}>RISK: {s.r}</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:8}}>
        {[["Debt",s.debt],["ISA",s.isa],["Pension",s.pension],["Equity",s.equity],["Crypto",s.crypto],["AI/Semis",s.ai||0],["Liquidity",s.liq],["Travel",s.travel]].map(([l,v])=>
          <div key={l} style={{background:"rgba(255,255,255,0.025)",borderRadius:10,padding:"8px",textAlign:"center"}}>
            <div style={{fontSize:11,color:P.t3,textTransform:"uppercase"}}>{l}</div>
            <div style={{fontSize:17,fontWeight:700,color:v>0?P.t1:P.t4,fontFamily:P.mono}}>{fK(v)}</div>
          </div>)}
      </div>
      <div style={{marginTop:8,fontSize:14,color:P.t3}}>Expected: <span style={{color:P.green,fontWeight:700}}>1Y +{fK(s.yr1)}</span> · <span style={{color:P.green,fontWeight:700}}>3Y +{fK(s.yr3)}</span> · <span style={{color:P.green,fontWeight:700}}>5Y +{fK(s.yr5)}</span></div>
    </Card>)}
    {/* SPRINT 2: Bonus Deployment IRR — all buckets ranked by return */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>DEPLOYMENT IRR BY BUCKET</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>All allocation options ranked by implied annualised return. Highest-certainty guaranteed returns come first.</div>
      {(()=>{
        const irrData=[
          {n:"Pension (60% band)",irr:67,c:"#06b6d4"},{n:"Clear Amex (22%)",irr:22,c:P.red},
          {n:"ISA (tax-free growth)",irr:18,c:P.cyan},{n:"Quality Equity",irr:14,c:P.indigo},
          {n:"AI/Semis",irr:12,c:P.purple},{n:"BTC/Crypto",irr:8,c:P.btc},
        ];
        return(
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={irrData} layout="vertical" margin={{left:110}}>
              <CartesianGrid stroke={P.b2}/>
              <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}%`} domain={[0,70]}/>
              <YAxis dataKey="n" type="category" tick={{fill:P.t2,fontSize:11}} width={105}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="irr" name="Implied IRR %" radius={[0,6,6,0]}>{irrData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.7}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      })()}
      <div style={{fontSize:12,color:P.t3,marginTop:6}}>Pension at 67% effective return beats everything. Amex at 22% guaranteed is the next best. The IRR framework forces rational ordering over emotional allocation.</div>
    </Card>
    <Card style={{background:`linear-gradient(135deg,${P.cyanD},transparent)`,borderLeft:`3px solid ${P.cyan}`}}>
      <div style={{fontSize:16,fontWeight:800,color:P.cyan,marginBottom:6}}>RECOMMENDATION: BALANCED</div>
      <div style={{fontSize:15,color:P.t2,lineHeight:1.7}}>Clear Amex in full (£10.7k — guaranteed 22% return). Max ISA (£20k into S&S ISA). Boost pension (£15k salary sacrifice into 60% marginal rate band). Deploy £10k quality equities, £5k crypto (only at accumulation signals), £5k AI/semis. Keep £12.8k liquid to rebuild the emergency fund. Allow £7k guilt-free spending. 5-year opportunity cost of defensive vs balanced: ~£43k in foregone compounding.</div>
    </Card>
  </div>);
};

const T8 = ()=>{
  const ConvictionMatrix = ()=>{
    const W=680,H=480,pad=60,plotW=W-pad*2,plotH=H-pad*2;
    const toX=v=>pad+(v-3)/(11-3)*plotW;
    const toY=v=>pad+(11-v)/(11-3)*plotH;
    const midX=toX(7),midY=toY(7);
    const items=OPPS.map(o=>({...o,x:toX(o.tm),y:toY(o.c),r:o.val>=5000?26:o.val>=3000?22:o.val>=1500?18:14}));
    return(
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
        <rect x={midX} y={pad} width={toX(11)-midX} height={midY-pad} rx={8} fill="rgba(52,211,153,0.06)"/>
        <rect x={pad} y={pad} width={midX-pad} height={midY-pad} rx={8} fill="rgba(129,140,248,0.04)"/>
        <rect x={pad} y={midY} width={midX-pad} height={toY(3)-midY} rx={8} fill="rgba(248,113,113,0.04)"/>
        <rect x={midX} y={midY} width={toX(11)-midX} height={toY(3)-midY} rx={8} fill="rgba(251,191,36,0.04)"/>
        <text x={pad+12} y={pad+16} fill="rgba(129,140,248,0.5)" fontSize={9} fontWeight={700}>HIGH CONVICTION / LOW TIMING</text>
        <text x={toX(11)-8} y={pad+16} textAnchor="end" fill="rgba(52,211,153,0.6)" fontSize={9} fontWeight={700}>EXECUTE NOW</text>
        <text x={pad+12} y={toY(3)-8} fill="rgba(248,113,113,0.4)" fontSize={9} fontWeight={700}>DEPRIORITISE</text>
        <text x={toX(11)-8} y={toY(3)-8} textAnchor="end" fill="rgba(251,191,36,0.45)" fontSize={9} fontWeight={700}>GOOD TIMING / LOW CONVICTION</text>
        <line x1={midX} y1={pad} x2={midX} y2={toY(3)} stroke="rgba(0,0,0,0.04)" strokeDasharray="6 4"/>
        <line x1={pad} y1={midY} x2={toX(11)} y2={midY} stroke="rgba(0,0,0,0.04)" strokeDasharray="6 4"/>
        <line x1={pad} y1={toY(3)} x2={toX(11)} y2={toY(3)} stroke="rgba(255,255,255,0.12)"/>
        <line x1={pad} y1={pad} x2={pad} y2={toY(3)} stroke="rgba(255,255,255,0.12)"/>
        <text x={W/2} y={H-6} textAnchor="middle" fill={P.t3} fontSize={11} fontWeight={700}>TIMING SCORE →</text>
        <text x={14} y={H/2} textAnchor="middle" fill={P.t3} fontSize={11} fontWeight={700} transform={`rotate(-90,14,${H/2})`}>CONVICTION →</text>
        {[4,5,6,7,8,9,10].map(v=><g key={`x${v}`}><text x={toX(v)} y={toY(3)+16} textAnchor="middle" fill={P.t4} fontSize={10}>{v}</text></g>)}
        {[4,5,6,7,8,9,10].map(v=><g key={`y${v}`}><text x={pad-8} y={toY(v)+4} textAnchor="end" fill={P.t4} fontSize={10}>{v}</text></g>)}
        {items.map((item,i)=>(
          <g key={i}>
            <circle cx={item.x} cy={item.y} r={item.r+5} fill={item.col} opacity={0.07} style={{filter:"blur(6px)"}}/>
            <circle cx={item.x} cy={item.y} r={item.r} fill={item.col} opacity={0.22} stroke={item.col} strokeWidth={1.5} strokeOpacity={0.5}/>
            <text x={item.x} y={item.y-2} textAnchor="middle" fill={P.t1} fontSize={10} fontWeight={800}>{item.c}×{item.tm}</text>
            <text x={item.x} y={item.y+10} textAnchor="middle" fill={P.t2} fontSize={8} fontWeight={600}>{item.t.split(" ").slice(0,2).join(" ")}</text>
          </g>
        ))}
      </svg>
    );
  };
  const valRanked = [...OPPS].sort((a,b)=>b.val-a.val);
  return(<div>
    <Hd t="OPPORTUNITY RADAR" s={`${OPPS.length} opportunities ranked by conviction, timing, and estimated annual value`} tag="IC BRIEF" ac={P.positive}/>

    {/* KPI STRIP */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Opportunities" v={OPPS.length} c={P.t2} sm/><K l="Total Ann. Value" v={`\u00A3${(OPPS.reduce((a,o)=>a+o.val,0)/1000).toFixed(1)}k`} c={P.positive} sm/>
      <K l="Top Score" v={`${Math.max(...OPPS.map(o=>o.c*o.tm))}`} c={P.cyan} sm delta="Conv\u00D7Time"/><K l="Execute Now" v={OPPS.filter(o=>o.c>=8&&o.tm>=8).length} c={P.positive} sm delta="High/High"/>
      <K l="Avg Conviction" v={(OPPS.reduce((a,o)=>a+o.c,0)/OPPS.length).toFixed(1)} c={P.t2} sm/><K l="Avg Timing" v={(OPPS.reduce((a,o)=>a+o.tm,0)/OPPS.length).toFixed(1)} c={P.t2} sm/>
    </FlexRow>

    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>CONVICTION vs TIMING MATRIX — ALL 10 OPPORTUNITIES</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:10}}>Bubble size = estimated annual value (£). Top-right quadrant = execute immediately. Scores from 1-10.</div>
      <ConvictionMatrix/>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>TOP 5 BY ANNUAL VALUE (£)</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={valRanked.slice(0,5)} layout="vertical" margin={{left:80}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
            <YAxis dataKey="t" type="category" tick={{fill:P.t2,fontSize:11}} width={75} tickFormatter={v=>v.split(" ").slice(0,2).join(" ")}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="val" name="Annual Value £" radius={[0,6,6,0]}>{valRanked.slice(0,5).map((d,i)=><Cell key={i} fill={d.col} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>COMPOSITE SCORE (CONVICTION × TIMING)</div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={[...OPPS].sort((a,b)=>(b.c*b.tm)-(a.c*a.tm))} layout="vertical" margin={{left:80}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} domain={[0,100]}/>
            <YAxis dataKey="t" type="category" tick={{fill:P.t2,fontSize:10}} width={75} tickFormatter={v=>v.split(" ").slice(0,2).join(" ")}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="c" name="Score" radius={[0,6,6,0]}>{[...OPPS].sort((a,b)=>(b.c*b.tm)-(a.c*a.tm)).map((d,i)=><Cell key={i} fill={d.col} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>FULL OPPORTUNITY RANKING — ALL 10</div>
      <Tbl h={["#","Opportunity","Conv","Time","Score","Alpha","Wrapper","Est. Value","Priority"]}
        r={valRanked.map((o,i)=>[`${i+1}`,o.t,`${o.c}/10`,`${o.tm}/10`,`${o.c*o.tm}`,o.alpha,o.w,`£${(o.val/1000).toFixed(1)}k/yr`,i<3?"Immediate":i<6?"This Quarter":"This Year"])} hl={7}/>
    </Card>
    {OPPS_TOP5.map((o,i)=><Card key={i} style={{borderLeft:`3px solid ${o.col}`}} hover>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div><div style={{fontSize:18,fontWeight:800,color:P.t1}}>{o.t}</div>
          <div style={{fontSize:13,color:P.t3,marginTop:3}}>Wrapper: {o.w} · Size: {o.sz} · Alpha: {o.alpha} · Value: £{(o.val/1000).toFixed(1)}k/yr</div></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div style={{textAlign:"center",padding:"4px 8px",borderRadius:8,background:`${o.col}15`,border:`1px solid ${o.col}25`}}>
            <div style={{fontSize:9,color:P.t4}}>CONV</div><div style={{fontSize:16,fontWeight:800,color:o.col}}>{o.c}</div>
          </div>
          <div style={{fontSize:14,color:P.t4}}>×</div>
          <div style={{textAlign:"center",padding:"4px 8px",borderRadius:8,background:`${o.col}15`,border:`1px solid ${o.col}25`}}>
            <div style={{fontSize:9,color:P.t4}}>TIME</div><div style={{fontSize:16,fontWeight:800,color:o.col}}>{o.tm}</div>
          </div>
          <div style={{fontSize:14,color:P.t4}}>=</div>
          <div style={{background:o.col,color:"#000",padding:"6px 10px",borderRadius:14,fontSize:16,fontWeight:800}}>{o.c*o.tm}</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
        <div><div style={{fontSize:12,color:o.col,fontWeight:700,marginBottom:3}}>CATALYST</div><div style={{fontSize:14,color:P.t2,lineHeight:1.6}}>{o.cat}</div></div>
        <div><div style={{fontSize:12,color:P.red,fontWeight:700,marginBottom:3}}>RISKS & KILL SWITCH</div>
          {o.risks.map((r,ri)=><div key={ri} style={{fontSize:13,color:P.t3}}>• {r}</div>)}
          <div style={{fontSize:12,color:P.amber,marginTop:4}}>Kill: {o.kill}</div></div>
      </div>
    </Card>)}
    <Ins text={`Remaining 5 opportunities (UK Infrastructure, EM Small Cap, Gold, Bed & ISA, Intl Value) have lower composite scores but remain relevant for diversification and tax efficiency. Bed & ISA in particular is a certainty play — no market view required, just annual execution. Combined annual value of all 10 opportunities: £${(OPPS.reduce((a,o)=>a+o.val,0)/1000).toFixed(1)}k.`}/>
  </div>);
};

const T9 = ()=>{
  const drags=[{n:"Amex Interest (22%)",a:2343,c:P.red},{n:"GIA Tax Drag",a:2400,c:P.red},{n:"Rainy Day Opp Cost",a:1180,c:P.amber},{n:"FD Opportunity Cost",a:460,c:P.amber},{n:"TER Drag",a:920,c:P.amber},{n:"Fragment Drag",a:160,c:P.t3}];
  const tot=drags.reduce((a,d)=>a+d.a,0);
  const cumDrag=[{y:"Y1",v:tot},{y:"Y3",v:tot*3*1.04},{y:"Y5",v:tot*5*1.08},{y:"Y10",v:tot*10*1.18}];
  // Sprint 2 computed metrics
  const growthAll = HOLDINGS.filter(h=>["ETF","Crypto","Stock","Investment"].includes(h.cls)).reduce((a,h)=>a+h.val,0);
  const sheltered = 82133 + 18085; // Pension + ISA est.
  const wrapperEff = +(sheltered / growthAll * 100).toFixed(1);
  const postFixDrag = tot - 2343 - 1440 - 1180; // remove Amex + 60% GIA tax + excess cash
  const upliftData = [
    {n:"Current Drag",v:tot,c:P.red},{n:"Clear Amex",v:-2343,c:P.green},
    {n:"ISA Migration",v:-1440,c:P.green},{n:"Redeploy Cash",v:-1180,c:P.green},
    {n:"Post-Fix Drag",v:Math.max(postFixDrag,0),c:P.amber},
  ];
  const compoundWith=[{y:"Y1",w:tot,wo:postFixDrag},{y:"Y3",w:Math.round(tot*((Math.pow(1.15,3)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,3)-1)/0.15))},{y:"Y5",w:Math.round(tot*((Math.pow(1.15,5)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,5)-1)/0.15))},{y:"Y10",w:Math.round(tot*((Math.pow(1.15,10)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,10)-1)/0.15))},{y:"Y20",w:Math.round(tot*((Math.pow(1.15,20)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,20)-1)/0.15))}];
  return(<div>
    <Hd t="CAPITAL EFFICIENCY" s="Pricing every friction — each basis point compounds against you" tag="EFFICIENCY" ac={P.amber}/>
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Annual Drag" v={fmt(tot)} s="Total friction" c={P.negative} sm/><K l="5Y Cost" v={`~${fK(tot*5*1.08)}`} s="Compounded" c={P.negative} sm/>
      <K l="10Y Cost" v={`~${fK(tot*10*1.18)}`} s="Compounded" c={P.negative} sm/><K l="Efficiency" v="4.4/10" s="Score" c={P.negative} sm/>
      <K l="Post-Fix Drag" v={fmt(Math.max(postFixDrag,0))} c={P.amber} sm delta="After 3 fixes"/><K l="Savings" v={fmt(tot-Math.max(postFixDrag,0))} c={P.positive} sm delta="Annual uplift"/>
    </FlexRow>
    {/* SPRINT 2: Wrapper Efficiency Score */}
    <Card hover>
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <Gauge score={+(wrapperEff/10).toFixed(1)} max={10} label="Wrapper Eff." size={90}/>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>WRAPPER EFFICIENCY — {wrapperEff}% SHELTERED</div>
          <div style={{fontSize:13,color:P.t3,lineHeight:1.6}}>Only {wrapperEff}% of growth assets (ETFs, crypto, stocks, investments) are sheltered in ISA or pension. Target: above 60%. Every £1 moved from GIA to ISA eliminates tax drag permanently. At 45% marginal + 24% CGT, the annual cost of this inefficiency is ~£2,400/yr.</div>
          <Bar2 val={wrapperEff} max={100} c={wrapperEff>60?P.positive:wrapperEff>30?P.amber:P.negative} label={`${wrapperEff}% sheltered → target 60%+`}/>
        </div>
      </div>
    </Card>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <Card hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>ANNUAL DRAG BREAKDOWN</div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={drags} margin={{left:5,bottom:5}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="n" tick={{fill:P.t3,fontSize:11}} angle={-10} textAnchor="end" height={50}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${v}`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="a" name="Annual Cost (£)" radius={[6,6,0,0]}>{drags.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.75}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>CUMULATIVE DRAG OVER TIME</div>
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={cumDrag}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="v" name="Cumulative Drag (£)" stroke={P.red} fill={P.red} fillOpacity={0.10} strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
    {/* SPRINT 2: Efficiency Uplift Waterfall — before vs after fixing */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>EFFICIENCY UPLIFT — BEFORE vs AFTER FIXES</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>Current annual drag {fmt(tot)} → post-fix {fmt(Math.max(postFixDrag,0))}. Delta: {fmt(tot-Math.max(postFixDrag,0))}/yr structural improvement.</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {upliftData.map((d,i)=>{
          const isReduction = d.v < 0;
          const barW = Math.abs(d.v) / tot * 100;
          return(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:110,fontSize:12,color:P.t3,textAlign:"right"}}>{d.n}</div>
              <div style={{flex:1,height:20,background:"rgba(0,0,0,0.04)",borderRadius:10,overflow:"hidden"}}>
                <div style={{width:`${Math.min(barW,100)}%`,height:"100%",background:`linear-gradient(90deg,${d.c}bb,${d.c}50)`,borderRadius:10}}/>
              </div>
              <div style={{width:60,fontSize:13,fontWeight:700,color:d.c,fontFamily:P.mono,textAlign:"right"}}>{isReduction?"-":""}£{Math.abs(d.v).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </Card>
    {/* SPRINT 2: Compound Drag Sensitivity — with fixes vs without */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>COMPOUND DRAG — WITH vs WITHOUT FIXES</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>Cumulative wealth destroyed by friction at 15% portfolio return. The 20Y gap is the behaviour-changing number.</div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={compoundWith}>
          <CartesianGrid stroke={P.b2}/>
          <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
          <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
          <Tooltip content={<Tip/>}/>
          <Area type="monotone" dataKey="w" name="Without Fixes (£)" stroke={P.red} fill={P.red} fillOpacity={0.10} strokeWidth={2.5}/>
          <Area type="monotone" dataKey="wo" name="With Fixes (£)" stroke={P.green} fill={P.green} fillOpacity={0.08} strokeWidth={2} strokeDasharray="6 3"/>
        </AreaChart>
      </ResponsiveContainer>
      <div style={{fontSize:13,color:P.t3,marginTop:6}}>At 20 years: without fixes = £{(compoundWith[4]?.w/1000).toFixed(0)}k destroyed. With fixes = £{(compoundWith[4]?.wo/1000).toFixed(0)}k. Gap: <span style={{color:P.red,fontWeight:700}}>£{((compoundWith[4]?.w-compoundWith[4]?.wo)/1000).toFixed(0)}k of lifetime wealth saved</span> by executing 3 structural fixes today.</div>
    </Card>
    <Ins text={`Total annual drag of ${fmt(tot)} (${(tot/PORT.netWorth*100).toFixed(1)}% of NW). Over 10 years with compounding: ~${fK(tot*10*1.18)}. Top three fixes: (1) Clear Amex = £2,343/yr certain, (2) Bed & ISA GIA positions = £2,400/yr tax saving, (3) Redeploy excess rainy day above £18k buffer = £1,180/yr. Combined: £5,923/yr structural improvement.`}/>
  </div>);
};

const T10 = ()=>{
  const fire=(PORT.netWorth/PORT.fireTarget*100);
  const hcFiltered = HC_DATA.filter(d=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(d.y));
  const wFiltered = WEALTH_5.filter(w=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(w.y));
  // Savings vs Returns crossover (computed from base scenario)
  const crossover = [];
  let prevFin = PORT.netWorth/1000;
  for(let yr=2026; yr<=2035; yr++) {
    const t = yr-2026;
    const salary = (PORT.grossSalary/1000)*Math.pow(1.15,t);
    const net = (salary*2)*(1-PORT.taxRate-PORT.niRate);
    const exp = (PORT.monthlyExpenses*12/1000)*Math.pow(1.15,t);
    const save = net-exp;
    const ret = t>0 ? prevFin*0.15 : 0;
    const total = save+ret;
    crossover.push({y:yr, savings:Math.round(save/(total||1)*100), returns:Math.round(ret/(total||1)*100)});
    if(t>0) prevFin = prevFin*1.15+save;
    else prevFin = PORT.netWorth/1000;
  }
  const latestHC = HC_DATA[0];
  return(<div>
    <Hd t="LONG-TERM WEALTH PROJECTION" s="Human capital, FIRE path, 5 forecast scenarios, savings-to-returns crossover" tag="WEALTH ENGINE" ac={P.indigo}/>
    <Row gap={10}>
      <K l="Financial" v={fK(PORT.netWorth)} s="Current NW"/><K l="Human Capital" v={`£${(latestHC.hc/1000).toFixed(1)}m`} s="NPV future earnings" c={P.indigo}/>
      <K l="Total Wealth" v={`£${(latestHC.total/1000).toFixed(1)}m`} s="HC+Financial" c={P.t1}/><K l="HC %" v={`${(latestHC.hc/latestHC.total*100).toFixed(0)}%`} s="Career dominant" c={P.amber}/>
      <K l="FIRE" v={`${fire.toFixed(0)}%`} s={fK(PORT.fireTarget)} c={P.indigo}/>
    </Row>
    <Row gap={14}>
      <Card style={{flex:"1 1 320px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>HUMAN CAPITAL vs FINANCIAL (£k)</div>
        <div style={{fontSize:13,color:P.t3,marginBottom:8}}>Salary £170k +15%/yr, bonus 100%, tax 47%, assets +15%/yr, discount 7%, career to 55. Total wealth increases every year.</div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={hcFiltered}><CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}m`:`${v}k`}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length)return null;
              const d=hcFiltered.find(h=>h.y===label);
              return(<div style={{...GS,padding:"10px 14px",fontSize:13,borderRadius:14}}>
                <div style={{color:P.t3,marginBottom:3,fontWeight:600}}>{label} (age {32+(label-2026)})</div>
                <div style={{color:P.cyan,fontWeight:700}}>Financial: £{(d?.fin/1000).toFixed(1)}m</div>
                <div style={{color:P.indigo,fontWeight:700}}>Human Capital: £{(d?.hc/1000).toFixed(1)}m</div>
                <div style={{color:P.t1,fontWeight:700,borderTop:`1px solid ${P.b1}`,paddingTop:3,marginTop:3}}>Total: £{(d?.total/1000).toFixed(1)}m</div>
              </div>);
            }}/>
            <Area type="monotone" dataKey="hc" name="Human Capital" stackId="1" stroke={P.indigo} fill={P.indigo} fillOpacity={0.15}/>
            <Area type="monotone" dataKey="fin" name="Financial" stackId="1" stroke={P.cyan} fill={P.cyan} fillOpacity={0.15}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{fontSize:13,color:P.t3,marginTop:6}}>Total wealth grows from £{(latestHC.total/1000).toFixed(1)}m to £{(HC_DATA[9].total/1000).toFixed(1)}m. HC grows initially (15% salary growth outpaces 7% discount) then declines as remaining career years shrink. Financial capital takes over as the dominant component by ~2038.</div>
      </Card>
      <Card style={{flex:"1 1 320px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>SAVINGS vs RETURNS CONTRIBUTION</div>
        <div style={{fontSize:13,color:P.t3,marginBottom:8}}>Crossover point: when compounding returns exceed new savings as the primary growth driver.</div>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={crossover.filter(c=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(c.y))}><CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="savings" name="Savings %" stackId="1" stroke={P.cyan} fill={P.cyan} fillOpacity={0.18}/>
            <Area type="monotone" dataKey="returns" name="Returns %" stackId="1" stroke={P.indigo} fill={P.indigo} fillOpacity={0.18}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{fontSize:13,color:P.t3,marginTop:6}}>Returns overtake savings as the dominant driver around 2031-32 when financial assets reach ~£1.5-2m. Before the crossover, maximising savings rate matters most.</div>
      </Card>
    </Row>

    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:6}}>5 FORECAST SCENARIOS — INCORPORATING OPPORTUNITIES</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:10}}>All scenarios share: salary £170k +15%/yr, bonus 100%, tax 47%, expenses £6k/mo +15%/yr. Difference is investment return rate + opportunity alpha.</div>
      <ResponsiveContainer width="100%" height={440}>
        <AreaChart data={wFiltered}><CartesianGrid stroke={P.b2}/>
          <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}m`:`${v}k`}/>
          <Tooltip content={({active,payload,label})=>{
            if(!active||!payload?.length)return null;
            return(<div style={{...GS,padding:"10px 14px",fontSize:12,borderRadius:14}}>
              <div style={{color:P.t3,marginBottom:4,fontWeight:600}}>{label} (age {32+(label-2026)})</div>
              {payload.map((p,i)=><div key={i} style={{color:p.color||P.cyan,fontWeight:600}}>{p.name}: £{(p.value/1000).toFixed(1)}m</div>)}
            </div>);
          }}/>
          <Area type="monotone" dataKey="bull" name="5. Bull+Crypto (+19%)" stroke={P.green} fill={P.green} fillOpacity={0.04} strokeWidth={2}/>
          <Area type="monotone" dataKey="allOpps" name="4. All Opps (+17.5%)" stroke={P.purple} fill={P.purple} fillOpacity={0.03} strokeWidth={2}/>
          <Area type="monotone" dataKey="wrapperAlpha" name="3. +Wrapper Alpha (+16.2%)" stroke={P.indigo} fill={P.indigo} fillOpacity={0.03} strokeWidth={2}/>
          <Area type="monotone" dataKey="base" name="2. Base (15%)" stroke={P.t1} fill={P.t1} fillOpacity={0.03} strokeWidth={2.5}/>
          <Area type="monotone" dataKey="conservative" name="1. Conservative (8%)" stroke={P.red} fill={P.red} fillOpacity={0.02} strokeWidth={1.5} strokeDasharray="4 4"/>
          <ReferenceLine y={1000} stroke={P.amber} strokeDasharray="8 4" label={{value:"£1M",fill:P.amber,fontSize:12,fontWeight:700}}/>
          <ReferenceLine y={1800} stroke={P.cyan} strokeDasharray="8 4" label={{value:"FIRE",fill:P.cyan,fontSize:12,fontWeight:700}}/>
          <ReferenceLine y={5000} stroke={P.green} strokeDasharray="8 4" label={{value:"£5M",fill:P.green,fontSize:12,fontWeight:700}}/>
        </AreaChart>
      </ResponsiveContainer>
    </Card>

    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>SCENARIO DEFINITIONS & ASSUMPTIONS</div>
      <Tbl h={["Scenario","Return","Alpha Source","£1M By","FIRE By","2035 NW"]}
        r={[
          ["1. Conservative","8%","No alpha — passive index only",`${SC_CONSERV.find(s=>s.v>=1000)?.y||'2033'}`,`${SC_CONSERV.find(s=>s.v>=1800)?.y||'2035+'}`,`£${(SC_CONSERV[9].v/1000).toFixed(1)}m`],
          ["2. Base","15%","Market returns at historical equity avg",`${SC_BASE.find(s=>s.v>=1000)?.y||'2030'}`,`${SC_BASE.find(s=>s.v>=1800)?.y||'2032'}`,`£${(SC_BASE[9].v/1000).toFixed(1)}m`],
          ["3. +Wrapper Alpha","16.2%","+1.2% from ISA/SIPP migration",`${SC_WRAPPER.find(s=>s.v>=1000)?.y||'2029'}`,`${SC_WRAPPER.find(s=>s.v>=1800)?.y||'2032'}`,`£${(SC_WRAPPER[9].v/1000).toFixed(1)}m`],
          ["4. All Opportunities","17.5%","+2.5% from wrapper + quality + AI/semis + value",`${SC_ALLOPPS.find(s=>s.v>=1000)?.y||'2029'}`,`${SC_ALLOPPS.find(s=>s.v>=1800)?.y||'2031'}`,`£${(SC_ALLOPPS[9].v/1000).toFixed(1)}m`],
          ["5. Bull+Crypto Cycle","19%","+4% from all opps + BTC cycle recovery",`${SC_BULL.find(s=>s.v>=1000)?.y||'2029'}`,`${SC_BULL.find(s=>s.v>=1800)?.y||'2031'}`,`£${(SC_BULL[9].v/1000).toFixed(1)}m`],
        ]} hl={5}/>
      <div style={{fontSize:13,color:P.t3,marginTop:8}}>The gap between conservative and bull grows exponentially: by 2035, it's £{((SC_BULL[9].v-SC_CONSERV[9].v)/1000).toFixed(1)}m. But even the conservative case hits £1M by {SC_CONSERV.find(s=>s.v>=1000)?.y} because the savings engine (£108k+/yr growing at 15%) is so powerful.</div>
    </Card>

    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>WEALTH MILESTONES BY SCENARIO</div>
      <Tbl h={["Milestone","Conservative","Base","+ Wrapper","All Opps","Bull+Crypto"]} r={[
        ["£500k",`${SC_CONSERV.find(s=>s.v>=500)?.y||'---'}`,`${SC_BASE.find(s=>s.v>=500)?.y||'---'}`,`${SC_WRAPPER.find(s=>s.v>=500)?.y||'---'}`,`${SC_ALLOPPS.find(s=>s.v>=500)?.y||'---'}`,`${SC_BULL.find(s=>s.v>=500)?.y||'---'}`],
        ["£1m",`${SC_CONSERV.find(s=>s.v>=1000)?.y||'---'}`,`${SC_BASE.find(s=>s.v>=1000)?.y||'---'}`,`${SC_WRAPPER.find(s=>s.v>=1000)?.y||'---'}`,`${SC_ALLOPPS.find(s=>s.v>=1000)?.y||'---'}`,`${SC_BULL.find(s=>s.v>=1000)?.y||'---'}`],
        ["FIRE (£1.8m)",`${SC_CONSERV.find(s=>s.v>=1800)?.y||'---'}`,`${SC_BASE.find(s=>s.v>=1800)?.y||'---'}`,`${SC_WRAPPER.find(s=>s.v>=1800)?.y||'---'}`,`${SC_ALLOPPS.find(s=>s.v>=1800)?.y||'---'}`,`${SC_BULL.find(s=>s.v>=1800)?.y||'---'}`],
        ["£5m",`${SC_CONSERV.find(s=>s.v>=5000)?.y||'2035+'}`,`${SC_BASE.find(s=>s.v>=5000)?.y||'2035+'}`,`${SC_WRAPPER.find(s=>s.v>=5000)?.y||'2035+'}`,`${SC_ALLOPPS.find(s=>s.v>=5000)?.y||'2035+'}`,`${SC_BULL.find(s=>s.v>=5000)?.y||'2035+'}`],
        ["£10m",`${SC_CONSERV.find(s=>s.v>=10000)?.y||'2035+'}`,`${SC_BASE.find(s=>s.v>=10000)?.y||'2035+'}`,`${SC_WRAPPER.find(s=>s.v>=10000)?.y||'2035+'}`,`${SC_ALLOPPS.find(s=>s.v>=10000)?.y||'2035+'}`,`${SC_BULL.find(s=>s.v>=10000)?.y||'2035+'}`],
      ]} hl={3}/>
    </Card>
    {/* SPRINT 4 #3: Monte Carlo Fan Chart — 1,000 simulations, BoE-style percentile bands */}
    {(()=>{
      // Seeded PRNG (mulberry32) for deterministic results per session
      const seed = 42;
      let s = seed;
      const rand = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
      // Box-Muller for normal distribution
      const randn = () => { let u1=rand(),u2=rand(); return Math.sqrt(-2*Math.log(u1||0.001))*Math.cos(2*Math.PI*u2); };

      const N = 1000;
      const years = [2026,2027,2028,2029,2030,2031,2032,2033,2034,2035];
      const mu = 0.12;
      const sigma = 0.18;
      const salaryGrowth = 0.15;
      const expGrowth = 0.15;

      // Run simulations
      const allPaths = [];
      for(let sim=0; sim<N; sim++){
        const path = [PORT.netWorth/1000];
        let nw = PORT.netWorth/1000;
        for(let t=0; t<9; t++){
          const salary = (PORT.grossSalary/1000)*Math.pow(1+salaryGrowth,t);
          const netIncome = (salary*2)*(1-PORT.taxRate-PORT.niRate);
          const expenses = (PORT.monthlyExpenses*12/1000)*Math.pow(1+expGrowth,t);
          const savings = netIncome - expenses;
          const retRate = mu + sigma * randn();
          nw = nw * (1 + retRate) + savings;
          if(nw < 0) nw = 0;
          path.push(Math.round(nw));
        }
        allPaths.push(path);
      }

      // Extract percentiles per year
      const pctiles = (arr, p) => { const sorted = [...arr].sort((a,b)=>a-b); const idx = Math.floor(p/100*(sorted.length-1)); return sorted[idx]; };
      const fanData = years.map((y,i) => {
        const vals = allPaths.map(p => p[i]);
        return { y, p10:pctiles(vals,10), p25:pctiles(vals,25), p50:pctiles(vals,50), p75:pctiles(vals,75), p90:pctiles(vals,90) };
      });

      // #20: Probability of hitting milestones
      const milestones = [500, 1000, 1800, 5000];
      const milestoneLabels = ["£500k", "£1M", "FIRE (£1.8M)", "£5M"];
      const probData = years.map((y,i) => {
        const vals = allPaths.map(p => p[i]);
        const row = { y };
        milestones.forEach((m,mi) => { row[`m${mi}`] = +(vals.filter(v => v >= m).length / N * 100).toFixed(1); });
        return row;
      });
      const milestoneColors = [P.amber, P.cyan, P.indigo, P.green];

      return(<>
        <Card hover>
          <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>MONTE CARLO FAN CHART — {N.toLocaleString()} SIMULATIONS</div>
          <div style={{fontSize:12,color:P.t3,marginBottom:12}}>BoE-style probability cone. Mean return {(mu*100).toFixed(0)}%, vol {(sigma*100).toFixed(0)}%. Bands show P10/P25/P50/P75/P90 outcomes. Wider bands = higher uncertainty as time horizon extends.</div>
          <ResponsiveContainer width="100%" height={440}>
            <AreaChart data={fanData}>
              <CartesianGrid stroke={P.b2}/>
              <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
              <YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}m`:`${v}k`}/>
              <Tooltip content={({active,payload,label})=>{
                if(!active||!payload?.length)return null;
                const d = fanData.find(f=>f.y===label);
                return(<div style={{...GS,padding:"12px 16px",fontSize:12,borderRadius:14}}>
                  <div style={{color:P.t3,fontWeight:700,marginBottom:4}}>{label} (age {32+(label-2026)})</div>
                  {[["P90 (Optimistic)",d?.p90,P.green],["P75",d?.p75,"#06b6d4"],["P50 (Median)",d?.p50,P.cyan],["P25",d?.p25,P.amber],["P10 (Pessimistic)",d?.p10,P.red]].map(([l,v,c],i)=>(
                    <div key={i} style={{color:c,fontWeight:600}}>{"  "}{l}: £{v>=1000?`${(v/1000).toFixed(1)}m`:`${v}k`}</div>
                  ))}
                  <div style={{color:P.t4,fontSize:11,marginTop:4}}>Spread: £{((d?.p90-d?.p10)/1000).toFixed(1)}m range</div>
                </div>);
              }}/>
              <Area type="monotone" dataKey="p90" stroke="none" fill={P.green} fillOpacity={0.06} stackId="fan"/>
              <Area type="monotone" dataKey="p75" stroke="none" fill={P.cyan} fillOpacity={0.08}/>
              <Area type="monotone" dataKey="p50" stroke={P.cyan} fill={P.cyan} fillOpacity={0.12} strokeWidth={2.5}/>
              <Area type="monotone" dataKey="p25" stroke="none" fill={P.amber} fillOpacity={0.06}/>
              <Area type="monotone" dataKey="p10" stroke={P.red} fill={P.red} fillOpacity={0.04} strokeWidth={1.5} strokeDasharray="4 4"/>
              <ReferenceLine y={1000} stroke={P.amber} strokeDasharray="8 4" label={{value:"£1M",fill:P.amber,fontSize:11,fontWeight:700}}/>
              <ReferenceLine y={1800} stroke={P.indigo} strokeDasharray="8 4" label={{value:"FIRE",fill:P.indigo,fontSize:11,fontWeight:700}}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
            {[["P90",P.green,"Best 10%"],["P75","#06b6d4","Upper quartile"],["P50",P.cyan,"Median outcome"],["P25",P.amber,"Lower quartile"],["P10",P.red,"Worst 10%"]].map(([l,c,d],i)=>(
              <div key={i} style={{fontSize:11,display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:12,height:4,background:c,borderRadius:2}}/>
                <span style={{color:P.t3}}>{l}</span>
                <span style={{color:P.t4}}>({d})</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:12,color:P.t3,marginTop:8}}>Median (P50) reaches £{fanData[4]?.p50>=1000?`${(fanData[4]?.p50/1000).toFixed(1)}m`:`${fanData[4]?.p50}k`} by {years[4]}. The P10-P90 spread by 2035 is £{((fanData[9]?.p90-fanData[9]?.p10)/1000).toFixed(1)}m — this is the true uncertainty range. Even the pessimistic P10 path stays above £{fanData[9]?.p10>=1000?`${(fanData[9]?.p10/1000).toFixed(1)}m`:`${fanData[9]?.p10}k`} because the savings engine is so dominant in early years.</div>
        </Card>

        {/* SPRINT 4 #20: Probability of Hitting Milestones */}
        <Card hover>
          <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>PROBABILITY OF HITTING MILESTONES</div>
          <div style={{fontSize:12,color:P.t3,marginBottom:12}}>From {N.toLocaleString()} Monte Carlo paths: the percentage of simulations that reach each wealth level by each year. Darker = higher probability.</div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={probData}>
              <CartesianGrid stroke={P.b2}/>
              <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
              <YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>`${v}%`} domain={[0,100]}/>
              <Tooltip content={<Tip/>}/>
              {milestones.map((m,mi)=>(
                <Area key={mi} type="monotone" dataKey={`m${mi}`} name={milestoneLabels[mi]} stroke={milestoneColors[mi]} fill={milestoneColors[mi]} fillOpacity={0.08} strokeWidth={2}/>
              ))}
            </AreaChart>
          </ResponsiveContainer>
          <div style={{overflowX:"auto",marginTop:12}}>
            <div style={{display:"grid",gridTemplateColumns:`80px repeat(${years.length},1fr)`,gap:2,fontSize:11}}>
              <div style={{padding:6,fontWeight:700,color:P.t3}}/>
              {years.map((y,i)=><div key={i} style={{padding:6,fontWeight:700,color:P.t2,textAlign:"center"}}>{y}</div>)}
              {milestones.map((m,mi)=><>
                <div key={`l${mi}`} style={{padding:6,fontWeight:700,color:milestoneColors[mi],fontSize:10}}>{milestoneLabels[mi]}</div>
                {years.map((y,yi)=>{
                  const pct = probData[yi]?.[`m${mi}`] || 0;
                  const bg = pct >= 80 ? `${milestoneColors[mi]}30` : pct >= 50 ? `${milestoneColors[mi]}18` : pct >= 20 ? `${milestoneColors[mi]}0a` : "rgba(0,0,0,0.02)";
                  return <div key={`${mi}-${yi}`} style={{padding:"8px 4px",textAlign:"center",background:bg,borderRadius:6,fontWeight:700,color:pct>=50?milestoneColors[mi]:P.t4,fontFamily:P.mono,fontSize:12}}>{pct>0?`${pct}%`:"-"}</div>;
                })}
              </>)}
            </div>
          </div>
          <div style={{fontSize:12,color:P.t3,marginTop:10}}>£500k is near-certain ({probData[3]?.m0}% by {years[3]}). £1M reaches {probData[5]?.m1}% probability by {years[5]}. FIRE (£1.8M) hits {probData[7]?.m2}% by {years[7]}. £5M remains a tail outcome at {probData[9]?.m3}% by 2035 — requires sustained above-average returns plus disciplined savings.</div>
        </Card>
      </>);
    })()}
    {/* SPRINT 2: Real Wealth Path — nominal vs inflation-adjusted */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>REAL vs NOMINAL WEALTH PATH</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>Nominal NW (what the account says) vs real NW (today's purchasing power at {((PORT.inflation||0.032)*100).toFixed(1)}% CPI). The gap widens dramatically over time.</div>
      {(()=>{
        const inf = PORT.inflation || 0.032;
        const realPath = wFiltered.map((w,i)=>({
          y:w.y,
          nominal:w.base,
          real:Math.round(w.base / Math.pow(1+inf, i)),
        }));
        return(
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={realPath}>
              <CartesianGrid stroke={P.b2}/>
              <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
              <YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}m`:`${v}k`}/>
              <Tooltip content={({active,payload,label})=>{
                if(!active||!payload?.length)return null;
                return(<div style={{...GS,padding:"10px 14px",fontSize:12,borderRadius:14}}>
                  <div style={{color:P.t3,marginBottom:3,fontWeight:600}}>{label}</div>
                  {payload.map((p,i)=><div key={i} style={{color:p.color,fontWeight:600}}>{p.name}: £{(p.value/1000).toFixed(1)}m</div>)}
                  {payload.length===2&&<div style={{color:P.amber,fontSize:11,marginTop:3}}>Inflation erodes: £{((payload[0].value-payload[1].value)/1000).toFixed(1)}m</div>}
                </div>);
              }}/>
              <Area type="monotone" dataKey="nominal" name="Nominal" stroke={P.cyan} fill={P.cyan} fillOpacity={0.10} strokeWidth={2.5}/>
              <Area type="monotone" dataKey="real" name="Real (CPI-adj)" stroke={P.amber} fill={P.amber} fillOpacity={0.06} strokeWidth={2} strokeDasharray="6 3"/>
              <ReferenceLine y={1800} stroke={P.indigo} strokeDasharray="8 4" label={{value:"FIRE (nominal)",fill:P.indigo,fontSize:11}}/>
            </AreaChart>
          </ResponsiveContainer>
        );
      })()}
      <div style={{fontSize:13,color:P.t3,marginTop:6}}>By 2035, the nominal/real gap is significant. A nominal £{(wFiltered[9]?.base/1000).toFixed(1)}m is really £{(wFiltered[9]?.base/Math.pow(1+(PORT.inflation||0.032),9)/1000).toFixed(1)}m in today's money. FIRE target should be inflation-indexed: £1.8M today = ~£{(1800*Math.pow(1+(PORT.inflation||0.032),9)/1000).toFixed(1)}m nominal by 2035.</div>
    </Card>
    <Ins text={`The income engine (£340k gross growing 15%/yr) is the most powerful variable. Even in the conservative 8% return scenario, £1M arrives by 2032 because net savings of £108k+/yr compound aggressively. The wrapper optimisation alpha (+1.2%) is the highest-certainty opportunity — it requires no market views, just executing ISA/SIPP migration. All 5 opportunities combined add +2.5% annually, worth an additional £${((SC_ALLOPPS[9].v-SC_BASE[9].v)/1000).toFixed(1)}m by 2035 versus base.`}/>
  </div>);
};

const T11 = ()=>{
  const cm=CRYPTO;const cryptoWt=(cryptoTotal/totalAssets*100);
  const signals=[{m:"MVRV Z",v:cm.mvrvZ.toFixed(2),s:"ACCUMULATE",c:P.green,d:"<1.0 = undervalued"},
    {m:"NUPL",v:`${(cm.nupl*100).toFixed(0)}%`,s:"ACCUMULATE",c:P.green,d:"0-25% = hope zone"},
    {m:"Fear & Greed",v:cm.fear,s:"EXTREME FEAR",c:P.green,d:"18/100 — 22d below 25"},
    {m:"Reserve Risk",v:cm.reserveRisk,s:"STRONG BUY",c:P.green,d:"<0.002 = green zone"},
    {m:"SOPR",v:cm.sopr,s:"ACCUMULATE",c:P.green,d:"<1 = coins sold at loss"},
    {m:"Reserves",v:cm.reserves,s:"BULLISH",c:P.green,d:"All-time-low supply squeeze"},
    {m:"Dominance",v:`${cm.dom}%`,s:"HOLD BTC",c:P.amber,d:">57% = BTC season"},
    {m:"Weekly RSI",v:cm.rsi,s:"OVERSOLD",c:P.green,d:"Lowest since 2018"},
    {m:"Whales",v:cm.whale,s:"BULLISH",c:P.green,d:"Largest accumulation in 13 years"},
    {m:"ETF Flows",v:cm.etfFlow,s:"INFLECTION?",c:P.amber,d:"Best single day of 2026"},
  ];
  const bullish=signals.filter(s=>s.c===P.green).length;
  const cryptoHoldings=HOLDINGS.filter(h=>h.cls==="Crypto").map(h=>({name:h.name.split("(")[0].split(" ")[0],current:h.val,prev:h.prev||h.val,ret:h.prev?+((h.val-h.prev)/h.prev*100).toFixed(1):0}));
  return(<div>
    <Hd t="CRYPTO ENGINE" s="On-chain analytics, cycle positioning, disciplined framework" tag="ON-CHAIN" ac={P.btc}/>
    <Row gap={10}>
      <K l="BTC" v={`$${(cm.btcPrice/1000).toFixed(1)}k`} s={`DD: ${cm.btcDD}%`} c={P.btc}/>
      <K l="Crypto Wt" v={`${cryptoWt.toFixed(1)}%`} s="of assets" c={P.btc}/>
      <K l="Risk Contrib" v="32%" s="of total risk" c={P.red}/>
      <K l="Signals" v={`${bullish}/${signals.length}`} s="Bullish" c={P.positive}/>
      <K l="6mo P&L" v={fK(cryptoTotal-cryptoPrev)} s="All crypto" c={P.red}/>
    </Row>
    <Ins type="opp" text={`${bullish}/${signals.length} on-chain signals bullish — highest density since late 2022. MVRV 0.49, Fear 18, RSI 27.5, whale accumulation 270K BTC. Smart money is buying what retail is selling. However, 32% risk from 13% capital = 2.5x risk-to-capital ratio remains excessive. The strategy is to consolidate, not expand.`}/>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>ON-CHAIN SIGNAL DASHBOARD</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
        {signals.map((s,i)=><div key={i} style={{...G,padding:"12px 14px"}}>
          <div style={{fontSize:11,color:P.t3,textTransform:"uppercase",marginBottom:3,letterSpacing:0.8}}>{s.m}</div>
          <div style={{fontSize:24,fontWeight:800,color:P.t1,fontFamily:P.mono}}>{s.v}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
            <span style={{fontSize:11,fontWeight:700,color:s.c,padding:"2px 6px",background:`${s.c}18`,borderRadius:4}}>{s.s}</span>
            <span style={{fontSize:10,color:P.t4}}>{s.d}</span>
          </div>
        </div>)}
      </div>
    </Card>
    {/* SPRINT 2: Cycle Position Indicator — composite on-chain score */}
    <Row gap={14}>
      <Card style={{flex:"1 1 280px"}} hover>
        {(()=>{
          const mvrvScore = Math.max(0, Math.min(100, (1 - cm.mvrvZ / 7) * 100));
          const nuplScore = Math.max(0, Math.min(100, (1 - cm.nupl) * 100));
          const fearScore = Math.max(0, Math.min(100, 100 - cm.fear));
          const rrScore = Math.max(0, Math.min(100, cm.reserveRisk < 0.005 ? 90 : cm.reserveRisk < 0.02 ? 50 : 10));
          const soprScore = Math.max(0, Math.min(100, cm.sopr < 1 ? 80 : cm.sopr < 1.05 ? 50 : 20));
          const composite = Math.round(mvrvScore*0.30 + nuplScore*0.25 + fearScore*0.20 + rrScore*0.15 + soprScore*0.10);
          const zone = composite >= 70 ? {l:"DEEP ACCUMULATION",c:P.green} : composite >= 50 ? {l:"ACCUMULATE",c:P.green} : composite >= 30 ? {l:"HOLD",c:P.amber} : {l:"TRIM / TAKE PROFIT",c:P.red};
          return(<div style={{textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:12}}>CYCLE POSITION</div>
            <Gauge score={+(composite/10).toFixed(1)} max={10} label="" size={110}/>
            <div style={{fontSize:24,fontWeight:800,color:zone.c,marginTop:8}}>{composite}/100</div>
            <div style={{fontSize:13,fontWeight:700,color:zone.c,padding:"4px 12px",background:`${zone.c}15`,borderRadius:8,display:"inline-block",marginTop:6}}>{zone.l}</div>
            <div style={{fontSize:11,color:P.t3,marginTop:10,lineHeight:1.6}}>MVRV {mvrvScore.toFixed(0)} · NUPL {nuplScore.toFixed(0)} · Fear {fearScore.toFixed(0)} · RR {rrScore.toFixed(0)} · SOPR {soprScore.toFixed(0)}</div>
          </div>);
        })()}
      </Card>
      {/* SPRINT 2: BTC Accumulation Progress */}
      <Card style={{flex:"1 1 380px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>BTC ACCUMULATION PROGRESS</div>
        {(()=>{
          const btcHeld = 29854 / cm.btcPrice;
          const target = 1.0;
          const progress = btcHeld / target * 100;
          const monthlyDCA = 500;
          const monthsToTarget = Math.ceil((target - btcHeld) * cm.btcPrice / monthlyDCA);
          return(<div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:13,color:P.t3}}>Current: <span style={{color:P.btc,fontWeight:700}}>{btcHeld.toFixed(3)} BTC</span></span>
              <span style={{fontSize:13,color:P.t3}}>Target: <span style={{color:P.t1,fontWeight:700}}>{target.toFixed(1)} BTC</span></span>
            </div>
            <div style={{height:18,background:"rgba(0,0,0,0.06)",borderRadius:9,overflow:"hidden",marginBottom:10}}>
              <div style={{width:`${Math.min(progress,100)}%`,height:"100%",background:`linear-gradient(90deg,${P.btc}cc,${P.btc}60)`,borderRadius:9,boxShadow:`0 0 12px ${P.btc}30`}}/>
            </div>
            <div style={{fontSize:12,color:P.t3,marginBottom:12}}>{progress.toFixed(1)}% complete. At £{monthlyDCA}/mo DCA and current BTC price, ~{monthsToTarget} months to target ({Math.ceil(monthsToTarget/12)}+ years).</div>
            <Tbl h={["Metric","Value"]} r={[
              ["BTC Held",`${btcHeld.toFixed(4)} BTC`],
              ["GBP Value",fK(29854)],
              ["Avg Cost Est.",`~$85,000`],
              ["Current Price",`$${cm.btcPrice.toLocaleString()}`],
              ["Monthly DCA",`£${monthlyDCA}`],
              ["Months to 1.0",`~${monthsToTarget}`],
              ["Target Date",`~End ${2026+Math.floor(monthsToTarget/12)}`],
            ]}/>
          </div>);
        })()}
      </Card>
    </Row>
    <Row gap={14}>
      <Card style={{flex:"1 1 320px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>CRYPTO HOLDINGS P&L</div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={cryptoHoldings}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="name" tick={{fill:P.t3,fontSize:14}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="prev" name="6mo Ago" fill={P.t4} fillOpacity={0.3} radius={[4,4,0,0]}/>
            <Bar dataKey="current" name="Current" fill={P.btc} fillOpacity={0.7} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{flex:"1 1 320px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>CRYPTO HOLDINGS TABLE</div>
        <Tbl h={["Asset","Current","6mo Ago","P&L","Return","Action"]} r={[
          ["BTC",fK(29854),fK(49310),`-${fK(19456)}`,"-39.5%","Core — hold, signals say accumulate"],
          ["EC10",fK(15845),fK(28508),`-${fK(12663)}`,"-44.4%","Consider consolidating to BTC"],
          ["ETH",fK(2986),fK(6545),`-${fK(3559)}`,"-54.4%","6 consecutive red months — weakest"],
          ["SOL",fK(1570),fK(4318),`-${fK(2748)}`,"-63.6%","Consider exit to simplify"],
          ["NEXO",`£57`,`£81`,`-£24`,"-29.6%","Dust — exit entirely"],
          ["Total",fK(cryptoTotal),fK(cryptoPrev),`-${fK(cryptoPrev-cryptoTotal)}`,pc((cryptoTotal-cryptoPrev)/cryptoPrev*100),"32% risk from 13% capital"],
        ]} hl={3}/>
      </Card>
    </Row>
    <Ins type="action" text={`Plan: (1) Do NOT sell BTC into extreme fear — signals overwhelmingly say accumulate. (2) Consolidate EC10+ETH+SOL into BTC only to simplify to a single position. (3) Exit NEXO dust immediately. (4) Set mechanical trim targets: take profit if MVRV >2.5 and Fear >75. BTC 200-week MA at ~$65K is the key structural support level.`}/>
  </div>);
};

const T12 = ()=>{
  const blocks=[
    {tf:"IMMEDIATE — Next 30 Days",c:P.red,acts:[
      {a:`Clear Amex in full (${fmt(PORT.amexDebt)})`,to:"From bonus",why:"22% APR = guaranteed 22% return — no investment beats this risk-adjusted",imp:"£2,343/yr saved"},
      {a:"Max S&S ISA with £20k",to:"S&S ISA: JGEP + quality",why:"ISA deadline 5 April. 29 days. Tax-free compounding is irreplaceable.",imp:"80-120bps/yr"},
      {a:"Salary sacrifice £1,250/mo to pension",to:"Workplace pension",why:"45% relief in £100-125k band (60% effective marginal rate)",imp:"£6,750/yr tax saved"},
      {a:"Exit NEXO + consolidate SOL to BTC",to:"Simplify crypto",why:"£57 NEXO and £1.6k SOL are noise — zero portfolio impact",imp:"Reduce from 5 to 2 positions"},
    ]},
    {tf:"Q2 2026 — This Quarter",c:P.amber,acts:[
      {a:"Consolidate all sub-£500 positions into core",to:"Sell fragments, reinvest JURE/JGEP",why:"18+ micro-positions = zero return impact, maximum complexity",imp:"40+ → 15 positions"},
      {a:"Bed & ISA highest-gain GIA positions",to:"Sell GIA, rebuy in ISA",why:"Use £3k CGT allowance before it resets",imp:"£1,200-1,800/yr tax savings"},
      {a:"Rebuild emergency fund to £18k",to:"Monzo Rainy Day",why:"Currently £16k (2.6mo). Target 3 months minimum.",imp:"Eliminate forced-selling risk"},
      {a:"Write Investment Policy Statement",to:"Personal document",why:"Target weights, rebalance rules, decision framework",imp:"Foundation for all future decisions"},
    ]},
    {tf:"H2 2026 — This Year",c:P.cyan,acts:[
      {a:"Target: 8% crypto, 50% equity ETFs, 22% pension, 20% cash/FD",to:"Quarterly rebalancing",why:"Current allocation has drifted materially. Systematic discipline required.",imp:"Better risk-adjusted returns"},
      {a:"Review pension fund selection",to:"Workplace pension platform",why:"Ensure 80%+ equity allocation. Default funds often hold 30%+ bonds.",imp:"200-300bps/yr potential"},
      {a:"Annual CGT: crystallise £3k gains",to:"GIA positions",why:"Use £3k allowance. £720 saved at 24% CGT. Free money.",imp:"£720/yr certain"},
      {a:"Deploy H2 bonus tranche into quality + AI/semis",to:"ISA/SIPP/GIA",why:"DCA over H2 to smooth entry. Build structural positions.",imp:"Build conviction holdings"},
    ]},
  ];
  return(<div>
    <Hd t="INTEGRATED ACTION PLAN" s="Specific, quantified, time-bound, reason-linked" tag="EXECUTION" ac={P.cyan}/>

    {/* KPI STRIP */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Total Actions" v={blocks.reduce((a,b)=>a+b.acts.length,0)} c={P.t2} sm/><K l="Immediate" v={blocks[0]?.acts.length||4} c={P.negative} sm delta="30 days"/>
      <K l="Combined Value" v="\u00A317.8k/yr" c={P.positive} sm delta="All actions"/><K l="Guaranteed" v="\u00A312.7k/yr" c={P.positive} sm delta="No market risk"/>
      <K l="Positions Target" v="\u226415" c={P.t2} sm delta="From 40+"/>
    </FlexRow>

    {/* SPRINT 2: Impact by Action — all actions ranked by annual £ value */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>ACTION IMPACT RANKING (Annual £ Value)</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>All actions competing on one axis. Guaranteed returns rank highest regardless of market views.</div>
      {(()=>{
        const actionImpacts = [
          {n:"Salary Sacrifice",v:6750,c:"#06b6d4",cert:"Guaranteed"},
          {n:"Max ISA",v:3600,c:P.cyan,cert:"Guaranteed"},
          {n:"Clear Amex",v:2343,c:P.red,cert:"Guaranteed"},
          {n:"Bed & ISA",v:1800,c:P.amber,cert:"High"},
          {n:"Employer Match",v:2400,c:P.green,cert:"High"},
          {n:"CGT Harvest",v:720,c:P.indigo,cert:"Certain"},
          {n:"Consolidate",v:160,c:P.t3,cert:"Certain"},
        ].sort((a,b)=>b.v-a.v);
        return(
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={actionImpacts} layout="vertical" margin={{left:100}}>
              <CartesianGrid stroke={P.b2}/>
              <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
              <YAxis dataKey="n" type="category" tick={{fill:P.t2,fontSize:11}} width={95}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="v" name="Annual Value £" radius={[0,6,6,0]}>{actionImpacts.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.7}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      })()}
      <div style={{fontSize:12,color:P.t3,marginTop:6}}>Combined annual value: £{(6750+3600+2343+1800+2400+720+160).toLocaleString()}/yr. The top 3 guaranteed-return actions alone deliver £12.7k/yr with zero market risk.</div>
    </Card>
    {blocks.map((b,bi)=><Card key={bi} style={{borderLeft:`3px solid ${b.c}`}} hover>
      <div style={{fontSize:16,fontWeight:800,color:b.c,marginBottom:12}}>{b.tf}</div>
      {b.acts.map((a,ai)=><div key={ai} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${P.b2}`}}>
        <div style={{background:b.c,color:"#000",width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,flexShrink:0,marginTop:2}}>{ai+1}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,color:P.t1,fontWeight:600,lineHeight:1.5}}>{a.a}</div>
          <div style={{fontSize:13,color:P.t3,marginTop:3}}>To: {a.to} · Because: {a.why}</div>
          <div style={{fontSize:13,color:P.positive,marginTop:2,fontWeight:700}}>Impact: {a.imp}</div>
        </div>
      </div>)}
    </Card>)}
    {/* SPRINT 2 #28: 30-60-90 Day Execution Roadmap */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>30-60-90 DAY EXECUTION ROADMAP</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:14}}>All actions mapped to tight time windows. Urgency creates accountability.</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
        {[
          {window:"30 DAYS",c:P.red,items:["Max ISA £20k (deadline 5 Apr)","Clear Amex £10.7k in full","Start salary sacrifice £1,250/mo","Exit NEXO dust position"]},
          {window:"60 DAYS",c:P.amber,items:["Bed & ISA top GIA gains","Rebuild emergency fund to £18k","Consolidate SOL → BTC","Write Investment Policy Statement"]},
          {window:"90 DAYS",c:P.green,items:["Consolidate to ≤15 positions","Review pension fund allocation","Deploy into quality equities","Annual CGT harvest £3k"]},
        ].map((w,wi)=>(
          <div key={wi} style={{...G,padding:"16px",borderTop:`3px solid ${w.c}`}}>
            <div style={{fontSize:13,fontWeight:800,color:w.c,letterSpacing:1,marginBottom:10}}>{w.window}</div>
            {w.items.map((item,ii)=>(
              <div key={ii} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:`1px solid ${P.b2}`}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:w.c,flexShrink:0,marginTop:6}}/>
                <div style={{fontSize:13,color:P.t2,lineHeight:1.5}}>{item}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
    <Card style={{background:`linear-gradient(135deg,${P.cyanD},transparent)`,borderLeft:`3px solid ${P.cyan}`}}>
      <div style={{fontSize:16,fontWeight:800,color:P.cyan,marginBottom:10}}>FIVE CONCLUSIONS</div>
      {[
        `Crypto destroyed 6 months of savings. £38,400 lost from a ~£29k inflow period. The equity core performed well (+£13.6k). Position sizing — not conviction — was the error.`,
        `New comp (£170k + £170k bonus) transforms the engine. £100k+ annual surplus makes £1M achievable by 2032-33 through disciplined savings alone.`,
        `Capital efficiency is the highest-certainty alpha: Amex (£2.3k/yr), ISA+pension (£7.5k/yr tax), fragment cleanup. Combined: £10k+ structural improvement per year.`,
        `On-chain crypto signals (8/10 bullish) are the strongest since late 2022. Maintain BTC but consolidate altcoin dust. Set mechanical trim rules at MVRV >2.5.`,
        `Fragmentation (40+ positions, 18 below £1k) is the structural disease. Consolidate to 15 maximum. Every holding must earn its place or be eliminated.`,
      ].map((c,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${P.b2}`}}>
        <div style={{background:P.cyan,color:"#000",width:24,height:24,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,flexShrink:0}}>{i+1}</div>
        <div style={{fontSize:15,color:P.t2,lineHeight:1.7}}>{c}</div>
      </div>)}
    </Card>
  </div>);
};

// =========================================================================
// TAB 14 — TAX ADVISOR
// =========================================================================
const T14 = ()=>{
  const taxItems = [
    {area:"Salary Sacrifice into Pension",saving:6750,certainty:10,priority:"Immediate",
     desc:"Income between £100-125k loses the personal allowance at 50p per £1, creating a 60% effective marginal rate. Salary sacrificing into pension in this band saves income tax (45%) plus recovers lost personal allowance (20% effective) plus saves employee NI (2%). Total effective relief: ~67p per £1 sacrificed.",
     action:"Salary sacrifice £1,250/mo (£15k/yr) from March 2026. This brings taxable income below £125k and recovers the full £12,570 personal allowance.",
     impact:"£6,750/yr in tax saved. Over 10 years compounding tax-free in pension: ~£95k additional wealth."},
    {area:"Max ISA Allowance",saving:3600,certainty:10,priority:"Immediate",
     desc:"S&S ISA shields all gains, dividends, and interest from tax permanently. At 45% marginal income tax and 24% CGT, the annual tax drag on £20k invested in GIA vs ISA is approximately £3,600 per year assuming 15% returns plus 2% dividends.",
     action:"Deploy £20k into S&S ISA before 5 April 2026 (29 days). Invest in JGEP.L + quality equity ETF. Never touch the ISA for trading — let it compound.",
     impact:"£3,600/yr in tax saved. Cumulative 10-year saving: ~£50k. Lifetime value if never withdrawn: £200k+."},
    {area:"Bed & ISA Strategy",saving:1800,certainty:9,priority:"Q2 2026",
     desc:"Sell GIA holdings to crystallise gains up to the £3k CGT allowance, then immediately rebuy the same holdings inside the ISA. This moves assets from taxable to tax-free permanently. At 24% CGT, crystallising £3k of gains saves £720/yr. The holdings themselves also escape future tax.",
     action:"Each April, identify GIA holdings with unrealised gains. Sell £3k of gains (may require selling more by value). Rebuy in ISA same day. Repeat annually.",
     impact:"£720/yr in CGT saved plus ongoing dividend/income tax elimination on migrated assets. ~£1,800/yr total including income tax on dividends."},
    {area:"Clear Amex Debt (22% APR)",saving:2343,certainty:10,priority:"Immediate",
     desc:"This isn't technically a tax saving but is the highest-certainty guaranteed return in the portfolio. At 22% APR on £10,652, the annual interest cost is £2,343. This is paid from post-tax income, so the pre-tax equivalent is £4,260 (at 45% marginal rate).",
     action:"Clear entire Amex balance from bonus on receipt. Set up direct debit to pay in full monthly going forward.",
     impact:"£2,343/yr saved (£4,260 pre-tax equivalent). Guaranteed. Risk-free. Immediately deployable."},
    {area:"Employer Pension Match",saving:2400,certainty:8,priority:"Q2 2026",
     desc:"Many employers offer pension matching above the minimum. If DC Advisory matches contributions up to a threshold, every £1 of employee contribution generates £1 of employer contribution — an instant 100% return before any investment growth.",
     action:"Review DC Advisory pension scheme rules. Maximise employer match before considering personal contributions above the match level.",
     impact:"Estimated £2,400/yr in free employer contributions (dependent on scheme rules)."},
    {area:"Capital Gains Tax Harvesting",saving:720,certainty:9,priority:"Annual",
     desc:"The annual CGT allowance is £3,000 (2025/26). If unused, it's lost forever. Deliberately crystallising £3k of gains each year — even if reinvesting immediately — uses this allowance and resets the cost base higher, reducing future tax bills.",
     action:"In March each year, review all GIA holdings. Sell enough to realise exactly £3k of net gains. Repurchase after 30 days (bed & breakfast rules) or buy a similar but not identical fund immediately.",
     impact:"£720/yr in CGT saved (£3k × 24%). Small per year but compounds: ~£10k over 10 years."},
    {area:"Dividend Tax Optimisation",saving:600,certainty:7,priority:"H2 2026",
     desc:"Dividend allowance is £500/yr (2025/26). Above that, additional rate payers pay 39.35% on dividends. Holding dividend-paying assets in ISA/SIPP rather than GIA eliminates this entirely. Accumulating fund classes (Acc) also defer the tax event.",
     action:"Ensure all dividend-paying ETFs in GIA use accumulating share classes. Prioritise moving income-generating holdings into ISA during Bed & ISA.",
     impact:"£600/yr estimated, growing as portfolio and dividends grow."},
    {area:"Marriage Allowance / Shared ISAs",saving:0,certainty:0,priority:"Future",
     desc:"Not currently applicable as single, but worth noting for future: if married to a basic-rate taxpayer, marriage allowance transfers £1,260 of personal allowance (saving £252/yr). A partner's ISA allowance also provides another £20k/yr of tax-free capacity.",
     action:"Review on marriage or partnership. A partner's ISA = double the tax-free investment capacity.",
     impact:"Potential £252/yr marriage allowance + £20k/yr additional ISA capacity."},
  ];
  const totalSaving = taxItems.filter(t=>t.saving>0).reduce((a,t)=>a+t.saving,0);
  const taxBreakdown = [
    {name:"Sal Sacrifice",v:6750,c:"#06b6d4"},{name:"ISA Shield",v:3600,c:P.cyan},
    {name:"Amex Clear",v:2343,c:P.red},{name:"Employer Match",v:2400,c:P.green},
    {name:"Bed & ISA",v:1800,c:P.amber},{name:"CGT Harvest",v:720,c:P.indigo},
    {name:"Div Opt",v:600,c:P.purple},
  ];
  const cumTax=[{y:"Y1",v:totalSaving},{y:"Y3",v:totalSaving*3*1.05},{y:"Y5",v:totalSaving*5*1.12},{y:"Y10",v:totalSaving*10*1.28}];
  const wrapperMigration=[
    {y:2026,gia:47,isa:5,sipp:22,other:26},{y:2027,gia:35,isa:15,sipp:28,other:22},
    {y:2028,gia:25,isa:25,sipp:32,other:18},{y:2029,gia:18,isa:32,sipp:35,other:15},
    {y:2030,gia:12,isa:38,sipp:38,other:12},{y:2035,gia:5,isa:45,sipp:42,other:8},
  ];
  return(<div>
    <Hd t="TAX ADVISOR" s="Comprehensive tax optimisation analysis — wrapper strategy, allowances, and structural alpha" tag="TAX STRATEGY" ac={P.positive}/>
    <Row gap={10}>
      <K l="Annual Tax Saving" v={fmt(totalSaving)} s="All strategies combined" c={P.positive}/>
      <K l="Pre-Tax Equiv." v={fmt(Math.round(totalSaving/0.55))} s="At 45% marginal" c={P.cyan}/>
      <K l="10Y Value" v={`~${fK(totalSaving*10*1.28)}`} s="Compounded" c={P.positive}/>
      <K l="Marginal Rate" v="45%" s="Additional rate" c={P.red}/>
      <K l="CGT Rate" v="24%" s="Higher rate" c={P.amber}/>
      <K l="GIA Exposure" v="47%" s="Taxable wrappers" c={P.red}/>
    </Row>
    <Ins text={`Combined annual tax optimisation value: ${fmt(totalSaving)}/yr. The pre-tax equivalent at 45% marginal rate is ${fmt(Math.round(totalSaving/0.55))}/yr — meaning you'd need to earn that much gross to have the same after-tax impact. Over 10 years with compounding, these strategies are worth approximately ${fK(totalSaving*10*1.28)}. The three highest-certainty moves (salary sacrifice + ISA + Amex) alone deliver ${fmt(6750+3600+2343)}/yr.`}/>
    <Row gap={14}>
      <Card style={{flex:"1 1 320px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>ANNUAL TAX SAVING BY STRATEGY</div>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={taxBreakdown} layout="vertical" margin={{left:75}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
            <YAxis dataKey="name" type="category" tick={{fill:P.t2,fontSize:12}} width={70}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Annual Saving (£)" radius={[0,6,6,0]}>{taxBreakdown.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card style={{flex:"1 1 320px"}} hover>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>CUMULATIVE TAX SAVINGS OVER TIME</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={cumTax}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="v" name="Cumulative Savings (£)" stroke={P.green} fill={P.green} fillOpacity={0.12} strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{fontSize:14,fontWeight:700,color:P.t1,marginTop:16,marginBottom:10}}>WRAPPER MIGRATION ROADMAP (%)</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={wrapperMigration}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:12}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="gia" name="GIA %" stackId="1" stroke={P.red} fill={P.red} fillOpacity={0.15}/>
            <Area type="monotone" dataKey="isa" name="ISA %" stackId="1" stroke={P.cyan} fill={P.cyan} fillOpacity={0.15}/>
            <Area type="monotone" dataKey="sipp" name="SIPP %" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15}/>
            <Area type="monotone" dataKey="other" name="Other %" stackId="1" stroke={P.amber} fill={P.amber} fillOpacity={0.15}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{fontSize:12,color:P.t3,marginTop:4}}>Target: GIA from 47% → 5% by 2035 through annual Bed & ISA + salary sacrifice + new contributions to ISA/SIPP only.</div>
        {/* SPRINT 2 #27: 10Y Compound Tax Alpha — lifetime value of all tax strategies */}
        <div style={{marginTop:16,padding:"14px 18px",borderRadius:14,background:`linear-gradient(135deg,${P.greenD},transparent)`,border:`1px solid ${P.green}20`}}>
          <div style={{fontSize:13,fontWeight:700,color:P.positive,marginBottom:6}}>10-YEAR COMPOUND VALUE OF TAX ALPHA</div>
          {(()=>{
            const annualSave = totalSaving;
            const r = 0.15;
            const fv10 = Math.round(annualSave * ((Math.pow(1+r,10)-1)/r));
            const fv20 = Math.round(annualSave * ((Math.pow(1+r,20)-1)/r));
            return(
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {[{l:"Annual",v:annualSave,y:""},{l:"5-Year",v:Math.round(annualSave*((Math.pow(1+r,5)-1)/r)),y:""},{l:"10-Year",v:fv10,y:""},{l:"20-Year",v:fv20,y:""}].map((p,i)=>(
                  <div key={i} style={{textAlign:"center",flex:"1 1 80px"}}>
                    <div style={{fontSize:10,color:P.t4,textTransform:"uppercase",letterSpacing:0.8}}>{p.l}</div>
                    <div style={{fontSize:20,fontWeight:800,color:i===3?P.green:i===2?P.cyan:P.t1,fontFamily:P.mono}}>{fK(p.v)}</div>
                  </div>
                ))}
              </div>
            );
          })()}
          <div style={{fontSize:12,color:P.t3,marginTop:8}}>At 15% portfolio return rate, {fmt(totalSaving)}/yr of tax savings compounds to six figures within a decade. This is the single most powerful argument for executing every wrapper optimisation strategy immediately.</div>
        </div>
      </Card>
    </Row>
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:10}}>TAX STRATEGY PRIORITY TABLE</div>
      <Tbl h={["Strategy","Annual Saving","Certainty","Priority","Action Required"]}
        r={taxItems.filter(t=>t.saving>0).sort((a,b)=>b.saving-a.saving).map(t=>[t.area,fmt(t.saving),`${t.certainty}/10`,t.priority,t.action.split(".")[0]+"."])} hl={1}/>
    </Card>
    {/* SPRINT 3 #16: Marginal Rate Zone Analysis — income bands mapped to effective rates */}
    <Card hover>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>MARGINAL RATE ZONE ANALYSIS</div>
      <div style={{fontSize:12,color:P.t3,marginBottom:12}}>Your income mapped against UK tax bands. The 60% PA taper trap between £100k-£125k is the single most important zone to optimise via salary sacrifice.</div>
      {(()=>{
        const taxBands = REF_DATA?.uk_tax_bands?.bands || [
          {from:0,to:12570,rate:0,name:"Personal Allowance"},{from:12571,to:50270,rate:0.20,name:"Basic Rate"},
          {from:50271,to:100000,rate:0.40,name:"Higher Rate"},{from:100001,to:125140,rate:0.60,name:"PA Taper (effective)"},
          {from:125141,to:999999,rate:0.45,name:"Additional Rate"},
        ];
        const gross = PORT.grossSalary + PORT.grossBonus;
        const grossAfterSacrifice = gross - 15000;
        const bandColors = {"Personal Allowance":"#06b6d4","Basic Rate":P.green,"Higher Rate":P.amber,"PA Taper (effective)":P.red,"Additional Rate":"#dc2626"};
        return(
          <div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {taxBands.filter(b=>b.to>0&&b.from<gross).map((b,i)=>{
                const bandW = Math.min(b.to,gross) - b.from;
                const totalW = gross;
                const barPct = bandW/totalW*100;
                const inBand = gross > b.from;
                const sacLine = grossAfterSacrifice > b.from && grossAfterSacrifice <= b.to;
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:130,fontSize:11,color:P.t3,textAlign:"right",lineHeight:1.3}}>
                      <div style={{fontWeight:600}}>{b.name}</div>
                      <div style={{fontSize:10,color:P.t4}}>{b.rate*100}% · {fK(b.from)}-{b.to>=999999?"...":fK(b.to)}</div>
                    </div>
                    <div style={{flex:1,height:22,background:"rgba(0,0,0,0.03)",borderRadius:6,position:"relative",overflow:"hidden"}}>
                      <div style={{width:`${Math.min(barPct,100)}%`,height:"100%",background:`${bandColors[b.name]||P.t3}50`,borderRadius:6}}/>
                      {sacLine && <div style={{position:"absolute",left:`${(grossAfterSacrifice-b.from)/(b.to-b.from)*100}%`,top:0,bottom:0,width:2,background:P.cyan,zIndex:2}}/>}
                    </div>
                    <div style={{width:50,fontSize:12,fontWeight:700,color:bandColors[b.name]||P.t3,fontFamily:P.mono,textAlign:"right"}}>{(b.rate*100).toFixed(0)}%</div>
                    <div style={{width:55,fontSize:11,color:P.t4,textAlign:"right"}}>{fK(bandW)} in band</div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",gap:16,marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.03)"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:P.t4,textTransform:"uppercase",letterSpacing:0.8}}>Gross Income</div>
                <div style={{fontSize:18,fontWeight:800,color:P.t1,fontFamily:P.mono}}>{fK(gross)}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:P.t4,textTransform:"uppercase",letterSpacing:0.8}}>After Sacrifice</div>
                <div style={{fontSize:18,fontWeight:800,color:P.cyan,fontFamily:P.mono}}>{fK(grossAfterSacrifice)}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:P.t4,textTransform:"uppercase",letterSpacing:0.8}}>In 60% Trap</div>
                <div style={{fontSize:18,fontWeight:800,color:gross>100000?P.negative:P.positive,fontFamily:P.mono}}>{gross>125140?"£25k":gross>100000?fK(Math.min(gross,125140)-100000):"£0"}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:P.t4,textTransform:"uppercase",letterSpacing:0.8}}>Effective Rate</div>
                <div style={{fontSize:18,fontWeight:800,color:P.amber,fontFamily:P.mono}}>{(PORT.taxRate*100+PORT.niRate*100).toFixed(0)}%</div>
              </div>
            </div>
            <div style={{fontSize:12,color:P.t3,marginTop:8}}>At £{(gross/1000).toFixed(0)}k gross, £{Math.min(25140, Math.max(0,gross-100000)).toLocaleString()} sits in the 60% effective trap. Salary sacrifice of £15k/yr drops taxable income into the 45% band and recovers the personal allowance — saving £6,750/yr with zero risk.</div>
          </div>
        );
      })()}
    </Card>
    {taxItems.filter(t=>t.saving>0).sort((a,b)=>b.saving-a.saving).map((t,i)=>(
      <Card key={i} style={{borderLeft:`3px solid ${t.certainty>=9?P.green:t.certainty>=7?P.amber:P.t3}`}} hover>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:17,fontWeight:800,color:P.t1}}>{t.area}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:700,color:P.positive,fontFamily:P.mono}}>{fmt(t.saving)}/yr</span>
            <span style={{padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700,background:t.priority==="Immediate"?`${P.red}18`:t.priority.includes("Q2")?`${P.amber}18`:`${P.green}18`,color:t.priority==="Immediate"?P.red:t.priority.includes("Q2")?P.amber:P.green}}>{t.priority}</span>
          </div>
        </div>
        <div style={{fontSize:14,color:P.t2,lineHeight:1.7,marginBottom:10}}>{t.desc}</div>
        <div style={{padding:"10px 14px",borderRadius:12,background:`linear-gradient(135deg,${P.green}08,transparent)`,borderLeft:`2px solid ${P.green}40`}}>
          <div style={{fontSize:11,color:P.positive,fontWeight:700,letterSpacing:1,marginBottom:4}}>ACTION</div>
          <div style={{fontSize:14,color:P.t2,lineHeight:1.6}}>{t.action}</div>
        </div>
        <div style={{fontSize:13,color:P.t3,marginTop:8}}><span style={{color:P.cyan,fontWeight:600}}>Impact:</span> {t.impact}</div>
      </Card>
    ))}
    <Card style={{background:`linear-gradient(135deg,${P.cyanD},transparent)`,borderLeft:`3px solid ${P.cyan}`}}>
      <div style={{fontSize:16,fontWeight:800,color:P.cyan,marginBottom:8}}>TAX ADVISOR SUMMARY</div>
      <div style={{fontSize:15,color:P.t2,lineHeight:1.8}}>
        At a 45% marginal rate with £375k in assets, tax efficiency is the single highest-certainty source of portfolio alpha. The three immediate actions (salary sacrifice £15k, max ISA £20k, clear Amex £10.7k) combine for £12,693/yr in guaranteed savings — equivalent to a 3.5% annual return on the entire portfolio, with zero market risk. The medium-term migration from 47% GIA to 5% GIA over 5-8 years through systematic Bed & ISA and redirecting all new contributions to ISA/SIPP transforms the portfolio's structural efficiency permanently.
      </div>
    </Card>
    <Ins type="warning" text={`Important: This analysis is for informational purposes only and does not constitute tax advice. Tax rules are complex and change frequently. Specific calculations depend on your exact circumstances, income sources, and HMRC interpretation. Consider consulting a qualified tax adviser or chartered accountant before implementing any strategy, particularly around pension contributions and salary sacrifice arrangements.`}/>
  </div>);
};

// =========================================================================
// TAB 13 — GLOSSARY & METRICS EXPLAINED
// =========================================================================
const T13 = ()=>{
  const categories = [
    {
      cat:"RISK & VOLATILITY METRICS",
      color:P.red,
      items:[
        {term:"Annualised Volatility",def:"Standard deviation of returns scaled to a yearly period. Measures how much the portfolio value fluctuates. Higher vol = wider range of outcomes.",
         yours:`${RISK.vol}%`,verdict:"Elevated — driven by crypto's 48% standalone vol bleeding into a 13% weight position. A pure equity portfolio would sit at 12-16%. Your vol is 2x that."},
        {term:"Sharpe Ratio",def:"Excess return (above the risk-free rate) per unit of total risk. The gold-standard measure of risk-adjusted performance. Above 1.0 is strong, below 0.5 is poor.",
         yours:RISK.sharpe.toFixed(2),verdict:"Poor — you're taking significant risk but not being compensated for it. Crypto is the drag anchor. The equity sleeve alone has an estimated Sharpe of 0.9-1.1."},
        {term:"Sortino Ratio",def:"Like Sharpe, but only penalises downside volatility (bad risk). Ignores upside swings. Better reflects how investors actually experience risk — nobody complains about upside vol.",
         yours:RISK.sortino.toFixed(2),verdict:"Below average — the downside has been persistent from Oct 2025 onwards, dominated by crypto drawdown. Target: above 1.0."},
        {term:"Max Drawdown",def:"The largest peak-to-trough decline in portfolio value. Measures the worst-case experience. Psychologically the most important risk metric — it's what makes investors sell at the bottom.",
         yours:`${RISK.maxDD}%`,verdict:`Moderate but extended — ${RISK.ddDur} days in drawdown territory and still not recovered. The length matters as much as the depth.`},
        {term:"VaR (Value at Risk) 95%",def:"The maximum loss expected in 95% of monthly periods. A 3.8% monthly VaR means: in 19 out of 20 months, you won't lose more than 3.8%. But in that 1 month, you could lose far more.",
         yours:`${RISK.var95}% monthly`,verdict:"Elevated — translates to ~£13.7k potential monthly loss in the normal 95th percentile. The real tail risk (CVaR) is worse."},
        {term:"CVaR (Conditional VaR) 95%",def:"Also called Expected Shortfall. The average loss when VaR IS breached — i.e. what happens in the worst 5% of months. Always worse than VaR.",
         yours:`${RISK.cvar95}%`,verdict:"When things go wrong, they go properly wrong. A -6.2% average tail loss means ~£22.4k in a bad month. Crypto's fat tails drive this."},
        {term:"Calmar Ratio",def:"Annualised return divided by maximum drawdown. Measures return per unit of worst-case pain. Above 1.0 is institutional-quality, below 0.5 needs attention.",
         yours:RISK.calmar.toFixed(2),verdict:"Weak — the drawdown has been too deep relative to returns generated. Needs sustained recovery to improve."},
        {term:"Ulcer Index",def:"Measures the depth and duration of drawdowns combined. Unlike vol, it specifically captures how 'painful' the experience has been. Below 5 is comfortable, above 10 is severe.",
         yours:RISK.ulcer.toFixed(1),verdict:"Stressed — 8.2 reflects the persistent drawdown from Oct 2025. Not yet severe, but uncomfortable for an extended period."},
        {term:"Omega Ratio",def:"Ratio of probability-weighted gains to probability-weighted losses across all returns. Above 1.0 means gains outweigh losses in aggregate. The higher the better.",
         yours:RISK.omega.toFixed(2),verdict:"Marginal — just above 1.0, meaning gains barely outweigh losses. The distribution is almost evenly split between good and bad months."},
        {term:"Tail Ratio",def:"Ratio of the 95th percentile return to the 5th percentile return. Compares upside tails to downside tails. Above 1.0 = more upside extreme events. Below 1.0 = fatter downside tails.",
         yours:RISK.tail.toFixed(2),verdict:"Borderline — at 0.96, the downside tail is slightly fatter than the upside. Crypto creates the asymmetry."},
        {term:"Skewness",def:"Measures the asymmetry of the return distribution. Negative skew = more large losses than large gains. Zero = symmetric. Positive = more upside surprises.",
         yours:RISK.skew.toFixed(2),verdict:"Negatively skewed — more extreme losses than extreme gains in the sample period. Consistent with a portfolio exposed to crypto crash risk."},
        {term:"Kurtosis",def:"Measures how 'fat' the tails of the distribution are. Normal distribution = 3.0. Higher = more extreme events (both up and down) than expected. Sometimes called 'tail thickness'.",
         yours:RISK.kurt.toFixed(1),verdict:"Fat tails — at 5.4, extreme events (crashes or spikes) happen roughly 2x more often than a normal distribution would predict. Driven by crypto."},
        {term:"Beta (vs MSCI World)",def:"Sensitivity to global equity market moves. Beta of 1.0 = moves exactly with the market. Below 1.0 = more defensive. Above 1.0 = more aggressive.",
         yours:RISK.beta.toFixed(2),verdict:"Defensive — at 0.68, the portfolio moves less than the market. This is driven by the 32% in cash/FD/pension dampening equity swings. Crypto adds noise but not correlated beta."},
      ]
    },
    {
      cat:"PORTFOLIO CONSTRUCTION METRICS",
      color:P.cyan,
      items:[
        {term:"HHI (Herfindahl-Hirschman Index)",def:"Sum of squared portfolio weights. Measures concentration. Below 0.10 = well-diversified. Above 0.20 = concentrated. Used by regulators to measure market concentration too.",
         yours:RISK.hhi.toFixed(3),verdict:"Well-diversified at the top level — 0.065 is comfortably below the 0.10 threshold. However, this masks the fact that crypto contributes disproportionate risk."},
        {term:"Effective Number of Positions",def:"Equal to 1/HHI. Represents how many equally-weighted positions would produce the same concentration level. Higher = more diversified.",
         yours:RISK.effPos.toFixed(1),verdict:"Good — 15.4 effective positions despite 40+ actual positions. The gap means many positions are too small to matter. Consolidation would improve this."},
        {term:"Diversification Ratio",def:"Ratio of weighted average volatility to portfolio volatility. Above 1.0 means diversification is working (correlations reduce aggregate risk). Higher is better.",
         yours:RISK.divRatio.toFixed(2),verdict:"Solid — at 1.52, diversification is reducing total risk by roughly a third compared to a single-asset portfolio. Correlations are working in your favour."},
        {term:"Entropy",def:"Information-theoretic measure of weight dispersion. Higher = more evenly distributed across positions. Complements HHI by capturing weight spread differently.",
         yours:RISK.entropy.toFixed(2),verdict:"Moderate — suggests reasonable spread but with concentration in the top 5 holdings driving most of the value."},
      ]
    },
    {
      cat:"PERFORMANCE & RETURN METRICS",
      color:P.green,
      items:[
        {term:"NAV (Net Asset Value)",def:"Total value of all assets minus all debts. The 'true' portfolio value. Changes driven by market returns, contributions, withdrawals, and FX movements.",
         yours:fmt(PORT.netWorth),verdict:`Declined ${pc(nwReturn)} over 6 months. Inflows of +£28.8k were overwhelmed by -£52.2k crypto losses and -£25.9k cash drawdown.`},
        {term:"Total Return",def:"Percentage change in NAV including all sources: market gains, income, contributions, and withdrawals. The 'true' investor experience.",
         yours:pc(nwReturn),verdict:"Negative — but misleading in isolation. Includes cash drawdowns and debt changes which aren't 'investment returns'. The equity sleeve returned +8-16%."},
        {term:"Contribution (to return)",def:"How much each holding contributed to total portfolio return. Weight × Return = Contribution. A small position with 100% return contributes less than a large position with 10%.",
         yours:"See Performance tab",verdict:"Pension (+4.6pp) and BTC (-5.4pp) were the dominant contributors. This confirms the position-sizing problem: BTC detracted more than the entire equity sleeve contributed."},
        {term:"Attribution (Brinson-style)",def:"Decomposes portfolio return into allocation effect (asset class choices), selection effect (security picks within classes), and interaction. Standard institutional framework.",
         yours:"Directional only",verdict:"Allocation effect was negative (overweight crypto, underweight US equity). Selection effect was positive (JPM Research Enhanced alpha within ETFs)."},
        {term:"Gain-to-Pain Ratio",def:"Sum of all positive returns divided by the absolute sum of all negative returns. Measures how much 'gain' you get per unit of 'pain'. Above 1.5 is strong.",
         yours:RISK.gtp.toFixed(2),verdict:"Marginal at 1.14 — barely above break-even. The pain has almost matched the gain. Crypto losses are the primary drag."},
      ]
    },
    {
      cat:"FACTOR & STYLE ANALYSIS",
      color:P.indigo,
      items:[
        {term:"Factor Exposure",def:"The portfolio's sensitivity to systematic return drivers like equity beta, growth, value, quality, momentum, size, and crypto. Determines most of the risk/return profile.",
         yours:"See Risk Engine tab",verdict:"Dominant exposures: equity beta (68), crypto beta (38), UK domestic (52). Notable underweights: momentum (16 vs 30 bench), growth (30 vs 45 bench)."},
        {term:"Equity Beta",def:"Exposure to broad global equity market risk. The most fundamental factor. Portfolio at 68 vs benchmark 100 means defensively positioned vs pure equity.",
         yours:"68 vs 100",verdict:"Deliberately defensive from cash/FD/pension allocation. This is appropriate given the crypto overlay already adds significant risk."},
        {term:"Crypto Beta",def:"Exposure to the cryptocurrency market cycle. Not present in any traditional benchmark. This is an intentional off-benchmark bet that adds uncorrelated (but high vol) risk.",
         yours:"38 vs 0 bench",verdict:"By definition uncompensated in any traditional framework. -8.4% return contribution and 32% risk contribution makes this the most expensive factor bet in the portfolio."},
        {term:"Home Bias (UK Domestic)",def:"Overweight to domestic (UK) assets relative to global market cap weight. UK is ~5% of MSCI World but 29% of this portfolio.",
         yours:"52 vs 5",verdict:"Significant home bias — driven by pension, FD, and Monzo holdings being denominated in GBP. Partially structural (pension), partially accidental (cash)."},
        {term:"Tracking Error",def:"Standard deviation of the difference between portfolio returns and benchmark returns. Measures how much the portfolio deviates from the benchmark.",
         yours:`${RISK.te}%`,verdict:"High at 14.8% — driven almost entirely by the crypto allocation which has no benchmark equivalent. Without crypto, TE would drop to ~4-6%."},
      ]
    },
    {
      cat:"WEALTH & PLANNING METRICS",
      color:P.amber,
      items:[
        {term:"FIRE Target",def:"Financial Independence, Retire Early. The portfolio value needed to sustain living expenses indefinitely. Calculated as annual expenses ÷ safe withdrawal rate (typically 4%).",
         yours:`${fK(PORT.fireTarget)} (based on £72k/yr ÷ 4%)`,verdict:`Currently ${(PORT.netWorth/PORT.fireTarget*100).toFixed(0)}% of target. Base case achievable by 2037 (age 43). The new comp package accelerates this materially.`},
        {term:"Human Capital (NPV)",def:"Net present value of all future employment income, discounted back to today. For a 32-year-old earning £340k/yr, this dwarfs financial capital.",
         yours:"~£5.8m",verdict:"94% of total wealth. This means career risk and income protection are far more important than portfolio optimisation at this stage."},
        {term:"Savings Rate",def:"Percentage of net income that is saved and invested. The single most important variable for wealth accumulation before the savings-to-returns crossover.",
         yours:`~${((180000-72000)/180000*100).toFixed(0)}%`,verdict:"Strong at ~60%. At this rate, the portfolio doubles from savings alone every 3-4 years, before any market returns."},
        {term:"Savings-to-Returns Crossover",def:"The portfolio size at which investment returns contribute more to growth than new savings. Before this point, savings rate matters most. After it, portfolio quality matters most.",
         yours:"~£700-800k (est. 2031-32)",verdict:"Currently well before the crossover. This means a 15% salary increase today is worth more than 200bps of portfolio improvement."},
        {term:"Debt-to-Assets Ratio",def:"Total debts divided by total assets. Measures leverage. Below 10% is conservative. The key issue is not the ratio but the cost of specific debts.",
         yours:`${(PORT.debts/PORT.assets*100).toFixed(1)}%`,verdict:"Low at 3.6%, but the Amex at 22% APR is the most expensive capital in the portfolio. Clearing it is a guaranteed 22% risk-free return."},
      ]
    },
    {
      cat:"CRYPTO & ON-CHAIN METRICS",
      color:P.btc,
      items:[
        {term:"MVRV Z-Score",def:"Market Value to Realised Value ratio, z-scored. Compares what the market is paying (market cap) to what holders actually paid (realised cap). Below 0 = historically undervalued. Above 7 = overheated.",
         yours:CRYPTO.mvrvZ.toFixed(2),verdict:"At 0.49, this is firmly in the accumulation zone. Historically, buying when MVRV Z < 1.0 has produced strong 12-month forward returns."},
        {term:"NUPL (Net Unrealised Profit/Loss)",def:"Percentage of holders currently in profit minus those in loss. Below 0% = capitulation. 0-25% = hope/fear. 25-50% = optimism. Above 75% = euphoria.",
         yours:`${(CRYPTO.nupl*100).toFixed(0)}%`,verdict:"At 10%, the market is in the 'hope' zone — most holders are barely above water. Historically this precedes the recovery phase."},
        {term:"Fear & Greed Index",def:"Composite sentiment indicator from 0 (extreme fear) to 100 (extreme greed). Combines volatility, momentum, social signals, and survey data.",
         yours:CRYPTO.fear.toString(),verdict:"Extreme fear at 18/100 — has been below 25 for 22 consecutive days. Historically, sustained extreme fear marks cycle bottoms."},
        {term:"SOPR (Spent Output Profit Ratio)",def:"Ratio of the price at which coins are sold to the price at which they were bought. Below 1.0 = coins being sold at a loss on average. A measure of seller exhaustion.",
         yours:CRYPTO.sopr.toFixed(2),verdict:"At 0.95, sellers are realising losses — a sign of capitulation. When SOPR returns above 1.0 sustainably, it signals the end of the sell pressure."},
        {term:"Reserve Risk",def:"Compares the incentive to sell (price) against the conviction of long-term holders. Very low values = high conviction holders are NOT selling despite price declines.",
         yours:CRYPTO.reserveRisk.toString(),verdict:"At 0.001, this is in the deep green zone — strong hands are holding. One of the most reliable long-term accumulation signals."},
        {term:"BTC Dominance",def:"Bitcoin's share of total crypto market capitalisation. Above 55% = 'BTC season' where Bitcoin outperforms altcoins. Below 40% = 'alt season'.",
         yours:`${CRYPTO.dom}%`,verdict:"At 58.2%, firmly in BTC season. This supports the recommendation to consolidate altcoins (EC10, ETH, SOL) into BTC only."},
      ]
    },
    {
      cat:"TAX & WRAPPER CONCEPTS",
      color:P.purple,
      items:[
        {term:"ISA (Individual Savings Account)",def:"UK tax wrapper allowing £20k/year contribution. All gains, dividends, and interest are completely tax-free forever. The single most valuable tax shelter available.",
         yours:"~£18.1k currently in ISA (4.8% of assets)",verdict:"Massively underutilised. At 45% marginal rate + 24% CGT, every £1 moved from GIA to ISA saves 20-40p annually in tax drag."},
        {term:"SIPP (Self-Invested Personal Pension)",def:"Pension wrapper with tax relief on contributions. At 45% marginal rate, a £10k gross contribution costs only £5.5k net. Locked until age 57.",
         yours:"£82.1k in pension (21.9%)",verdict:"Good but could be higher. The 100-125k income band has a 60% effective marginal rate — salary sacrifice here is the highest-returning investment available."},
        {term:"GIA (General Investment Account)",def:"Standard taxable brokerage account. Subject to CGT on gains (24% for higher rate) and income tax on dividends (39.35% for additional rate).",
         yours:"~£178k (47.4%)",verdict:"Too high. The most impactful structural change is migrating GIA holdings to ISA/SIPP over time using Bed & ISA strategy."},
        {term:"Bed & ISA",def:"Sell a holding in GIA and immediately rebuy the same holding in an ISA. Crystallises a gain (using CGT allowance) but moves the asset into a tax-free wrapper permanently.",
         yours:"Not yet executed",verdict:"Should be done each tax year using the £3k CGT allowance. At 24% CGT rate, this saves £720/year in perpetuity — compounding to significant sums over decades."},
        {term:"Salary Sacrifice",def:"Redirecting pre-tax salary into pension. Saves both income tax AND National Insurance. At 45% tax + 2% NI, every £1 sacrificed costs only 53p of take-home pay.",
         yours:"Currently low",verdict:"The 100-125k band has a 60% effective marginal rate (loss of personal allowance). Salary sacrificing into this band is the highest-returning financial decision available."},
      ]
    },
  ];

  const [openCat,setOpenCat] = useState(null);

  return(<div>
    <Hd t="GLOSSARY & METRICS EXPLAINED" s="Every metric defined, contextualised, and linked to your specific portfolio outcome" tag="REFERENCE" ac={P.purple}/>
    <Ins text={`This reference guide covers ${categories.reduce((a,c)=>a+c.items.length,0)} metrics across ${categories.length} categories. Each definition is paired with your current reading and a specific interpretation of what it means for your portfolio. Use this as a living reference document for investment committee discussions.`}/>
    {categories.map((cat,ci)=>(
      <Card key={ci} style={{borderLeft:`3px solid ${cat.color}`,cursor:"pointer",overflow:"hidden"}} hover>
        <div onClick={()=>setOpenCat(openCat===ci?null:ci)} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:17,fontWeight:800,color:cat.color,letterSpacing:0.5}}>{cat.cat}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:13,color:P.t3}}>{cat.items.length} metrics</span>
            <div style={{
              width:28,height:28,borderRadius:8,
              background:`${cat.color}18`,border:`1px solid ${cat.color}30`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:16,color:cat.color,fontWeight:700,
              transform:openCat===ci?"rotate(180deg)":"rotate(0deg)",
              transition:"transform 0.3s ease",
            }}>▾</div>
          </div>
        </div>
        {openCat===ci && (
          <div style={{marginTop:16}}>
            {cat.items.map((item,ii)=>(
              <div key={ii} style={{
                padding:"16px 0",
                borderBottom:ii<cat.items.length-1?`1px solid ${P.b2}`:"none",
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div style={{fontSize:16,fontWeight:700,color:P.t1}}>{item.term}</div>
                  <div style={{
                    padding:"4px 10px",borderRadius:8,
                    background:`${cat.color}15`,border:`1px solid ${cat.color}25`,
                    fontSize:14,fontWeight:700,color:cat.color,
                    fontFamily:P.mono,
                    whiteSpace:"nowrap",marginLeft:12,
                  }}>{item.yours}</div>
                </div>
                <div style={{fontSize:14,color:P.t3,lineHeight:1.7,marginBottom:8}}>{item.def}</div>
                <div style={{
                  fontSize:14,color:P.t2,lineHeight:1.7,
                  padding:"10px 14px",borderRadius:12,
                  background:`linear-gradient(135deg,${cat.color}06,transparent 70%)`,
                  borderLeft:`2px solid ${cat.color}40`,
                }}>
                  <span style={{fontSize:11,color:cat.color,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>YOUR PORTFOLIO → </span>
                  {item.verdict}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    ))}
    <Card style={{background:`linear-gradient(135deg,${P.cyanD},transparent)`,borderLeft:`3px solid ${P.cyan}`}}>
      <div style={{fontSize:16,fontWeight:800,color:P.cyan,marginBottom:8}}>HOW TO USE THIS GLOSSARY</div>
      <div style={{fontSize:15,color:P.t2,lineHeight:1.8}}>
        Each metric tells part of the story. Sharpe and Sortino measure risk-adjusted returns. VaR and CVaR measure tail risk. HHI and effective positions measure concentration. MVRV and NUPL measure crypto cycle positioning. No single metric is sufficient — the investment committee view emerges from reading them together. The pattern across this portfolio is clear: strong diversification infrastructure undermined by a single concentrated, high-volatility crypto position that has dominated the risk budget and destroyed 6 months of returns. The solution is structural (reduce, consolidate, rebalance) not tactical (timing the crypto cycle).
      </div>
    </Card>
  </div>);
};


// =========================================================================
// SUPABASE DATA RECALCULATION — updates all derived values from live data
// =========================================================================
function recalcDerived() {
  nwReturn = ((PORT.netWorth - PORT.nw6moAgo) / PORT.nw6moAgo * 100);
  NW_DD = NW_WEEKLY.map(w => ({d: w.d, dd: ((w.nw - PORT.nwPeak) / PORT.nwPeak * 100)}));
  totalAssets = PORT.assets;
  byClass = {};
  HOLDINGS.forEach(h => { byClass[h.cls] = (byClass[h.cls]||0) + h.val; });
  SLEEVES = [
    {name:"ETFs (JPM+iShares)",val:byClass.ETF||0,color:P.cyan},
    {name:"Pension",val:byClass.Pension||0,color:"#06b6d4"},
    {name:"Cash / FD",val:(byClass.Cash||0)+(byClass["Cash/FD"]||0),color:"#64748b"},
    {name:"Crypto",val:byClass.Crypto||0,color:P.btc},
    {name:"Investments",val:byClass.Investment||0,color:P.indigo},
    {name:"Stocks (Satrix)",val:byClass.Stock||0,color:P.purple},
    {name:"Mixed (small)",val:byClass.Mixed||0,color:P.orange},
  ].map(s=>({...s,pct:+(s.val/totalAssets*100).toFixed(1)}));
  cryptoTotal = HOLDINGS.filter(h=>h.cls==="Crypto").reduce((s,h)=>s+h.val,0);
  cryptoPrev = HOLDINGS.filter(h=>h.cls==="Crypto"&&h.prev).reduce((s,h)=>s+(h.prev||0),0);
  running = PORT.nw6moAgo;
  BRIDGE = BRIDGE_ITEMS.map((b,i)=>{
    if(i===0) return {...b,start:0,end:PORT.nw6moAgo,cumulative:PORT.nw6moAgo};
    const start = running;
    running += b.delta;
    return {...b,start:Math.min(start,running),end:Math.max(start,running),cumulative:running};
  });
  SC_CONSERV = computeScenario(0.08);
  SC_BASE = computeScenario(0.15);
  SC_WRAPPER = computeScenario(0.15, 0.012);
  SC_ALLOPPS = computeScenario(0.15, 0.025);
  SC_BULL = computeScenario(0.15, 0.04);
  WEALTH_5 = SC_BASE.map((b,i) => ({
    y: b.y, conservative: SC_CONSERV[i].v, base: b.v,
    wrapperAlpha: SC_WRAPPER[i].v, allOpps: SC_ALLOPPS[i].v, bull: SC_BULL[i].v,
  }));
  NW_FORECAST = [
    ...NW_WEEKLY.map(w=>({d:w.d,nw:w.nw,a:w.a,type:"hist"})),
    ...SC_BASE.slice(1).map(s=>({d:`${s.y}`,nw:null,a:null,base:s.v*1000,conserv:SC_CONSERV.find(c=>c.y===s.y)?.v*1000,bull:SC_BULL.find(c=>c.y===s.y)?.v*1000,allOpps:SC_ALLOPPS.find(c=>c.y===s.y)?.v*1000,wrapper:SC_WRAPPER.find(c=>c.y===s.y)?.v*1000,type:"forecast"})),
  ];
  HC_DATA = (() => {
    const pts = [];
    let fin = PORT.netWorth / 1000;
    for(let yr=2026; yr<=2035; yr++) {
      const t = yr - 2026;
      const age = PORT.age + t;
      const salary = (PORT.grossSalary/1000) * Math.pow(1.15, t);
      const net = (salary * 2) * (1 - PORT.taxRate - PORT.niRate);
      const exp = (PORT.monthlyExpenses*12/1000) * Math.pow(1.15, t);
      const save = net - exp;
      if(t > 0) fin = fin * 1.15 + save;
      const yearsLeft = Math.max(55 - age, 0);
      let hc = 0;
      for(let y=0; y<yearsLeft; y++) { hc += (net * Math.pow(1.15, y)) / Math.pow(1.07, y); }
      pts.push({y:yr, fin:Math.round(fin), hc:Math.round(hc), total:Math.round(fin+hc)});
    }
    return pts;
  })();
  OPPS_TOP5 = [...OPPS].sort((a,b)=>b.val-a.val).slice(0,5);
}

// =========================================================================
// MAIN APP — 13 Tab Navigation
// =========================================================================
// MAIN APP — ORION GLASS LIGHT MODE
// =========================================================================
// =========================================================================
// TAB 15 — SYSTEM ARCHITECTURE & OPERATIONAL BLUEPRINT
// =========================================================================
const SYS_PLATFORMS = [
  {name:"Claude Pro",role:"Primary AI engine — analysis, code generation, deployment",color:P.cyan,cat:"AI"},
  {name:"Supabase",role:"PostgreSQL backend — portfolio data, metrics, snapshots",color:P.green,cat:"Data"},
  {name:"Vercel",role:"Next.js hosting — auto-deploy from GitHub main branch",color:"#000",cat:"Deploy"},
  {name:"GitHub",role:"Version control — bouteralex-blip/lifestack-finance",color:P.purple,cat:"Deploy"},
  {name:"Mac Mini",role:"Automation engine — daily cron scripts, data pipeline",color:"#64748b",cat:"Compute"},
  {name:"Obsidian",role:"Private vault — daily metric notes, Dataview queries",color:P.indigo,cat:"PKM"},
  {name:"Notion",role:"Mobile display layer — weekly summaries, social layer",color:P.t1,cat:"PKM"},
  {name:"Kubera",role:"Portfolio tracking — CSV exports, NAV snapshots",color:P.amber,cat:"Data"},
  {name:"Recharts",role:"Visualisation library — all charts, area, bar, radar, pie",color:P.cyan,cat:"UI"},
  {name:"Make.com",role:"Automation layer — WhatsApp digest, API orchestration",color:P.purple,cat:"Compute"},
  {name:"Alpha Vantage",role:"Market data feed — equities, FX, crypto prices",color:P.green,cat:"Data"},
  {name:"PowerDrill",role:"Formatted PDF report generation from data",color:P.pink,cat:"Output"},
];
const SYS_MODULES = [
  {name:"A1 — Wealth Engine",tabs:14,status:"Live",pct:85,color:P.amber,feeds:["Kubera","Supabase","Alpha Vantage","Claude"]},
  {name:"A2 — Market Research",tabs:24,status:"Live",pct:80,color:P.cyan,feeds:["FRED","CoinGecko","MacroMicro","Claude"]},
  {name:"E1 — Calendar Intel",tabs:0,status:"Planned",pct:5,color:P.t3,feeds:["Google Calendar","Make.com"]},
  {name:"B1 — Body & Mind",tabs:0,status:"Planned",pct:5,color:P.green,feeds:["WHOOP","Apple Health"]},
  {name:"C1 — Social Graph",tabs:0,status:"Scoped",pct:15,color:P.pink,feeds:["Notion","Obsidian"]},
  {name:"F1 — Orchestrator",tabs:0,status:"Scoped",pct:10,color:P.indigo,feeds:["Make.com","Mac Mini","Claude"]},
];
const SYS_STEPS = [
  {step:"Liquid Glass UI system",desc:"Shell/plate/content stack across all tiles",pct:90,status:"In Progress",m1:true,m2:true,m3:true,m4:false},
  {step:"Chart premium redesign",desc:"Curved gradients, milestone bubbles, dense grids",pct:70,status:"In Progress",m1:true,m2:true,m3:false,m4:false},
  {step:"Supabase full data sync",desc:"All 14 tabs reading live from Supabase",pct:85,status:"Live",m1:true,m2:true,m3:true,m4:false},
  {step:"Daily Digest pipeline",desc:"Mac Mini → Claude API → WhatsApp 06:32",pct:40,status:"Scoped",m1:true,m2:false,m3:false,m4:false},
  {step:"Markets MCP integration",desc:"FRED + Yahoo Finance + FMP live feeds",pct:20,status:"Phase 2",m1:true,m2:false,m3:false,m4:false},
  {step:"Social Graph module",desc:"Relationship tracking, contact intelligence",pct:15,status:"Scoped",m1:false,m2:false,m3:false,m4:false},
  {step:"Body & Mind module",desc:"WHOOP sync, training analytics, sleep scoring",pct:5,status:"Planned",m1:false,m2:false,m3:false,m4:false},
  {step:"Obsidian Dataview layer",desc:"Daily vault notes with metric templating",pct:30,status:"Scoped",m1:true,m2:false,m3:false,m4:false},
  {step:"Notion weekly summaries",desc:"Auto-generated Sunday Scaries review",pct:25,status:"Scoped",m1:true,m2:false,m3:false,m4:false},
  {step:"PowerDrill PDF reports",desc:"Formatted institutional-grade monthly reports",pct:10,status:"Planned",m1:false,m2:false,m3:false,m4:false},
];
const T15 = () => {
  const Dot = ({on,c=P.cyan}) => (<div style={{width:12,height:12,borderRadius:'50%',background:on?c:'rgba(0,0,0,0.06)',boxShadow:on?`0 0 10px ${c}50`:'none',border:on?'none':'1px solid rgba(0,0,0,0.08)',transition:'all 0.3s'}}/>);
  return (<div>
    <Hd t="SYSTEM ARCHITECTURE & OPERATIONAL BLUEPRINT" s="Module interconnections, platform piping, data flows, and 10-step execution roadmap" tag="LIFESTACK OS" ac={P.indigo}/>

    {/* Module Map */}
    <Card hover tier={2}>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>MODULE INTERCONNECTION MAP</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:16}}>How the six LifeStack OS domains connect, which platforms feed them, and current build status.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:12}}>
        {SYS_MODULES.map((m,i) => (
          <div key={i} style={{position:'relative',borderRadius:16,overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,borderRadius:'inherit',background:'rgba(255,255,255,0.55)',border:'1px solid rgba(255,255,255,0.7)',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.4)',pointerEvents:'none'}}/>
            <div style={{position:'relative',zIndex:1,padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:'50%',background:m.color,boxShadow:`0 0 12px ${m.color}50`}}/>
                <div style={{fontSize:14,fontWeight:700,color:P.t1}}>{m.name}</div>
                <span style={{marginLeft:'auto',fontSize:10,padding:'2px 8px',borderRadius:6,background:`${m.color}15`,color:m.color,fontWeight:700,border:`1px solid ${m.color}20`}}>{m.status}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                <div style={{flex:1,height:6,background:'rgba(0,0,0,0.06)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${m.pct}%`,height:'100%',background:`linear-gradient(90deg,${m.color},${m.color}aa)`,borderRadius:4,boxShadow:`0 0 8px ${m.color}30`}}/>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:m.color,fontFamily:P.mono}}>{m.pct}%</span>
              </div>
              <div style={{fontSize:11,color:P.t3,marginBottom:4}}>{m.tabs} tabs {m.tabs>0?'built':''}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {m.feeds.map((f,fi) => <span key={fi} style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(99,102,241,0.08)',color:P.cyan,fontWeight:600,border:'1px solid rgba(99,102,241,0.12)'}}>{f}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* Platform Piping */}
    <Card hover tier={2}>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>PLATFORM PIPING & DATA FLOW</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:16}}>Every platform in the stack, its role, and how data flows between them.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:10}}>
        {SYS_PLATFORMS.map((p,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:12,background:'rgba(255,255,255,0.45)',border:'1px solid rgba(255,255,255,0.6)',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.3)'}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${p.color}15`,border:`1px solid ${p.color}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:p.color,flexShrink:0}}>{p.name[0]}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:700,color:P.t1}}>{p.name}</div>
              <div style={{fontSize:11,color:P.t3,lineHeight:1.4}}>{p.role}</div>
            </div>
            <span style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(0,0,0,0.04)',color:P.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>{p.cat}</span>
          </div>
        ))}
      </div>
    </Card>

    {/* Data Flow Diagram */}
    <Card hover tier={2}>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>DATA FLOW — HOW INFORMATION MOVES</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:14}}>Kubera CSV exports feed Supabase. Claude reads Supabase + market APIs to generate analysis. Next.js dashboard reads Supabase for display. Mac Mini orchestrates daily automation.</div>
      <svg width="100%" viewBox="0 0 800 220" style={{overflow:'visible'}}>
        {[{x:20,y:80,w:100,h:50,label:"Kubera",sub:"CSV Export",c:P.amber},
          {x:180,y:80,w:100,h:50,label:"Supabase",sub:"PostgreSQL",c:P.green},
          {x:340,y:30,w:100,h:50,label:"Claude API",sub:"AI Engine",c:P.cyan},
          {x:340,y:130,w:100,h:50,label:"Next.js",sub:"Dashboard",c:P.indigo},
          {x:500,y:80,w:100,h:50,label:"Vercel",sub:"Deploy",c:P.purple},
          {x:660,y:80,w:110,h:50,label:"User Browser",sub:"Live App",c:P.t1},
          {x:340,y:180,w:100,h:30,label:"Mac Mini",sub:"",c:"#64748b"}
        ].map((n,i) => (
          <g key={i}>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} rx={10} fill={`${n.c}12`} stroke={n.c} strokeWidth={1.5} strokeOpacity={0.4}/>
            <text x={n.x+n.w/2} y={n.y+n.h/2-4} textAnchor="middle" fill={n.c} fontSize={11} fontWeight={700}>{n.label}</text>
            {n.sub&&<text x={n.x+n.w/2} y={n.y+n.h/2+10} textAnchor="middle" fill="#94a3b8" fontSize={9}>{n.sub}</text>}
          </g>
        ))}
        {[[120,105,180,105],[280,105,340,55],[280,105,340,155],[440,55,500,105],[440,155,500,105],[600,105,660,105],[390,180,390,155]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(99,102,241,0.25)" strokeWidth={1.5} markerEnd="url(#arrow)"/>
        ))}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(99,102,241,0.4)"/></marker></defs>
      </svg>
    </Card>

    {/* 10 Next Steps Roadmap */}
    <Card hover tier={1}>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>10-STEP EXECUTION ROADMAP</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:16}}>Milestone checklist across four gates: Scoped, Built, Tested, Live. Activation dots show progress through each gate.</div>
      <div style={{overflowX:'auto',borderRadius:14,border:`1px solid ${P.b1}`,background:'rgba(255,255,255,0.5)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead><tr>
            {['#','Initiative','Description','Progress','Status','Scoped','Built','Tested','Live'].map((h,i) => (
              <th key={i} style={{textAlign:i<4?'left':'center',padding:'10px 12px',borderBottom:`1px solid ${P.b1}`,color:P.t3,fontWeight:700,fontSize:11,textTransform:'uppercase',letterSpacing:0.5,background:'rgba(248,250,252,0.95)'}}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{SYS_STEPS.map((s,i) => {
            const c = s.pct>=80?P.green:s.pct>=40?P.amber:s.pct>=20?P.cyan:P.t4;
            return (
              <tr key={i} style={{transition:'background 0.2s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(99,102,241,0.04)'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,color:P.t3,fontWeight:700,fontFamily:P.mono,width:36}}>{String(i+1).padStart(2,'0')}</td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,color:P.t1,fontWeight:700,fontSize:13}}>{s.step}</td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,color:P.t3,fontSize:12,maxWidth:220}}>{s.desc}</td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,width:120}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{flex:1,height:6,background:'rgba(0,0,0,0.06)',borderRadius:4,overflow:'hidden'}}>
                      <div style={{width:`${s.pct}%`,height:'100%',background:`linear-gradient(90deg,${c},${c}aa)`,borderRadius:4,boxShadow:`0 0 6px ${c}25`}}/>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,color:c,fontFamily:P.mono,minWidth:30,textAlign:'right'}}>{s.pct}%</span>
                  </div>
                </td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,textAlign:'center'}}>
                  <span style={{fontSize:10,padding:'2px 8px',borderRadius:6,background:`${c}12`,color:c,fontWeight:700,border:`1px solid ${c}20`}}>{s.status}</span>
                </td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,textAlign:'center'}}><Dot on={s.m1} c={P.cyan}/></td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,textAlign:'center'}}><Dot on={s.m2} c={P.indigo}/></td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,textAlign:'center'}}><Dot on={s.m3} c={P.amber}/></td>
                <td style={{padding:'10px 12px',borderBottom:`1px solid ${P.b2}`,textAlign:'center'}}><Dot on={s.m4} c={P.green}/></td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </Card>

    <Ins text="System architecture is the foundation. Once the piping is solid, every new module plugs in cleanly — same glass surface, same data layer, same deployment pipeline. The 10-step roadmap prioritises the highest-leverage builds: data integrity first, then automation, then expansion." type="insight"/>
  </div>);
};

const TABS=[
  {k:"exec",l:"Executive Summary"},{k:"struct",l:"Structure"},{k:"perf",l:"Performance"},
  {k:"risk",l:"Risk Engine"},{k:"stress",l:"Stress Tests"},{k:"cash",l:"Cashflow"},
  {k:"bonus",l:"Bonus Strategy"},{k:"opp",l:"Opportunities"},{k:"eff",l:"Efficiency"},
  {k:"long",l:"Long-Term"},{k:"crypto",l:"Crypto Engine"},{k:"act",l:"Action Plan"},
  {k:"tax",l:"Tax Advisor"},{k:"gloss",l:"Glossary"},{k:"sys",l:"System Architecture"},
];

export default function PortfolioVOS(){
  const [tab,setTab]=useState("exec");
  const [,refresh]=useState(0);
  const {data,loading,source}=useSupabaseData();
  useEffect(()=>{
    if(data){
      if(data.PORT) PORT=data.PORT;
      if(data.HOLDINGS) HOLDINGS=data.HOLDINGS;
      if(data.NW_WEEKLY) NW_WEEKLY=data.NW_WEEKLY;
      if(data.BRIDGE_ITEMS) BRIDGE_ITEMS=data.BRIDGE_ITEMS;
      if(data.RISK) RISK=data.RISK;
      if(data.CRYPTO) CRYPTO=data.CRYPTO;
      if(data.OPPS) OPPS=data.OPPS;
      if(data.FACTORS) FACTORS=data.FACTORS;
      if(data.STRESS) STRESS=data.STRESS;
      if(data.BONUS) BONUS=data.BONUS;
      if(data.MONTHLY) MONTHLY_DATA=data.MONTHLY;
      if(data.SCORECARD) SCORECARD=data.SCORECARD;
      if(data.REF_DATA) REF_DATA=data.REF_DATA;
      recalcDerived();
      refresh(n=>n+1);
    }
  },[data]);
  const render=()=>{switch(tab){
    case "exec":return <T1/>;case "struct":return <T2/>;case "perf":return <T3/>;
    case "risk":return <T4/>;case "stress":return <T5/>;case "cash":return <T6/>;
    case "bonus":return <T7/>;case "opp":return <T8/>;case "eff":return <T9/>;
    case "long":return <T10/>;case "crypto":return <T11/>;case "act":return <T12/>;
    case "tax":return <T14/>;case "gloss":return <T13/>;case "sys":return <T15/>;default:return <T1/>;
  }};
  return (
    <div style={{width:"100%",minHeight:"100vh",fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflow:"hidden",
      background:"url('/bg-finance.jpg') center/cover fixed",
    }}>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:3px}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      {/* Ambient orbs for depth */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:"-15%",right:"-10%",width:"50vw",height:"50vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"-15%",left:"-8%",width:"45vw",height:"45vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)"}}/>
        <div style={{position:"absolute",top:"40%",left:"30%",width:"40vw",height:"40vw",borderRadius:"50%",background:"radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 60%)"}}/>
      </div>
      {/* Top header bar */}
      <div style={{position:"sticky",top:0,zIndex:50,overflow:'hidden',borderBottom:"1px solid rgba(255,255,255,0.6)"}}>
        {/* Header shell */}
        <div style={{position:'absolute',inset:0,backdropFilter:'blur(24px) saturate(1.5)',WebkitBackdropFilter:'blur(24px) saturate(1.5)',backgroundImage:'linear-gradient(135deg, rgba(255,255,255,0.06), transparent 50%)',boxShadow:'inset 0 -1px 0 rgba(255,255,255,0.3)',pointerEvents:'none'}}/>
        {/* Header plate */}
        <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.12)',pointerEvents:'none'}}/>
        <div style={{position:'relative',zIndex:1,padding:"0 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800}}>LS</div>
            <div>
              <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",color:P.cyan,fontWeight:700}}>LIFESTACK OS {"\u00B7"} PORTFOLIO INTELLIGENCE vOS</span>
              <div style={{fontSize:10,color:P.t4}}>Institutional Review {"\u2014"} {source==="supabase"?<span style={{color:P.green}}>\u25CF Live Data</span>:<span>Real Data</span>}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:P.t2,fontWeight:600}}>A. Bouter</div>
            <div style={{fontSize:11,color:P.t4}}>{PORT.date} {"\u00B7"} NW {fmt(PORT.netWorth)}</div>
          </div>
        </div>
        {/* Tab bar — Liquid Glass Pill Navigation */}
        <div style={{display:"flex",gap:4,overflowX:"auto",whiteSpace:"nowrap",padding:"6px 0",scrollbarWidth:'none'}}>
          {TABS.map((t,i) => {
            const active = tab===t.k;
            return (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              position:'relative',overflow:'hidden',
              background:active?"rgba(99,102,241,0.12)":"transparent",
              border:"none",
              color:active?P.cyan:P.t3,padding:"8px 16px",fontSize:11.5,fontWeight:active?700:500,
              cursor:"pointer",transition:"all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",whiteSpace:"nowrap",fontFamily:"inherit",
              borderRadius:20,
              backdropFilter:active?'blur(16px) saturate(1.5)':'none',
              WebkitBackdropFilter:active?'blur(16px) saturate(1.5)':'none',
              boxShadow:active?'0 4px 16px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 0 1px rgba(99,102,241,0.15)':'none',
            }}><span style={{fontSize:8,opacity:0.4,marginRight:3}}>{String(i+1).padStart(2,"0")}</span>{t.l}</button>
          );})}
        </div>
        </div>
      </div>
      {/* Content area */}
      <div style={{position:"relative",zIndex:1,padding:"20px 28px 40px",maxWidth:1680,margin:"0 auto"}}>
        {render()}
      </div>
      {/* Footer */}
      <div style={{textAlign:"center",padding:"16px 28px",borderTop:"1px solid rgba(0,0,0,0.04)"}}>
        <span style={{fontSize:9,color:P.t4}}>CONFIDENTIAL {"\u00B7"} Personal use only {"\u00B7"} Not investment advice {"\u00B7"} Data from Kubera {PORT.date} + {"\u00A3"}100k pro-rata correction {"\u00B7"} LifeStack OS vOS {"\u00B7"} BadgerBrain Intelligence Engine</span>
      </div>
    </div>
  );
}
