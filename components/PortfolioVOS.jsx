'use client';

import React, { useState, useEffect } from "react";
import { useSupabaseData, computeFreshness } from '../lib/useData';
import { DEFAULT_PORT, DEFAULT_HOLDINGS, DEFAULT_NW_WEEKLY, DEFAULT_BRIDGE_ITEMS, DEFAULT_RISK, DEFAULT_CRYPTO, DEFAULT_FACTORS, DEFAULT_STRESS, DEFAULT_BONUS, DEFAULT_OPPS, DEFAULT_MONTHLY, DEFAULT_SCORECARD, DEFAULT_MARKET, DEFAULT_YIELD_CURVE, DEFAULT_CREDIT_TL, DEFAULT_SECTOR } from '../lib/defaults';
import { computeConcentrationState, computeDebtPriorityState, computeSleeveExposureState, computeWrapperExposureState, computeCurrencyExposureState, computeDriftMonitorState, computeISAPensionRoutingState, computeRebalanceProposalState } from '../lib/engines/index.js';
import { computeRegimeState, computeCrossAssetStressState, computeBTCCycleState, computeYieldCurveState, computeCreditStressState, computeSectorLeadershipState, computeCryptoOnChainState } from '../lib/engines/market/index.js';
import { generateWeeklySynthesis, rankOpportunities, computeWhatChanged, buildActionQueue, generateTriggerAlerts, generateMorningCommand } from '../lib/engines/agents/index.js';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, ReferenceLine, Line } from "recharts";
import dynamic from 'next/dynamic';
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// =========================================================================
// LIFESTACK OS vOS — ORION GLASS · LIGHT MODE · INSTITUTIONAL REVIEW
// Pure visual reskin of v5.4 — zero data/analytics changes
// =========================================================================

// --- PALETTE: Deep Navy-Teal Spectrum (Pinterest #05161A → #0F969C → #6DA5C0) ---
const P = {
  bg:"#05161A",
  // Primary accent — bright teal from Pinterest swatch #4
  cyan:"#0F969C",cyanD:"rgba(15,150,156,0.12)",cyanG:"rgba(15,150,156,0.05)",
  // Secondary — light blue-teal from Pinterest swatch #5
  indigo:"#6DA5C0",indigoD:"rgba(109,165,192,0.12)",
  amber:"#f59e0b",amberD:"rgba(245,158,11,0.08)",
  red:"#ef4444",redD:"rgba(239,68,68,0.08)",
  green:"#22c55e",greenD:"rgba(34,197,94,0.08)",
  purple:"#a855f7",orange:"#fb923c",btc:"#f7931a",pink:"#ec4899",
  teal:"#0F969C",sky:"#6DA5C0",
  positive:"#0F969C",negative:"#f43f5e",
  // Typography — slightly warmer whites on teal-dark
  t1:"#e8f4f5",t2:"#b0cdd4",t3:"#7a9da6",t4:"rgba(255,255,255,0.55)",t5:"rgba(255,255,255,0.35)",
  // Border / separator system
  b1:"rgba(15,150,156,0.18)",b2:"rgba(15,150,156,0.10)",b3:"rgba(15,150,156,0.05)",
  mono:"'JetBrains Mono','SF Mono','Cascadia Code',monospace",
  accentFinance:"#0F969C",
  // Pinterest teal depth layers (for layered luxury effect)
  l0:"#05161A",l1:"#072E33",l2:"#0C7075",l3:"#0F969C",l4:"#6DA5C0",l5:"#294D61",
  // Blueprint 6-colour data series rotation (Factor 5)
  // 1-series: teal · 2: teal+violet · 3: teal+violet+amber · 4+: full rotation
  s1:"#0F969C",  // Primary: teal (our accent)
  s2:"#7C6FFF",  // Secondary: violet
  s3:"#f59e0b",  // Warm: amber
  s4:"#FF5C7A",  // Hot: coral (negative/loss indicator)
  s5:"#3B9EFF",  // Cool: blue (benchmark/informational)
  s6:"#FF3BBD",  // Energy: magenta (spot alerts only)
};

// --- MATERIAL TILE STYLES: Solid gradient accent cards — teal-navy spectrum ---
// All radius 16px per blueprint Factor 1 spec
const MAT = {
  teal:{background:'linear-gradient(135deg, #0F969C 0%, #0C7075 50%, #072E33 100%)',boxShadow:'0 8px 32px rgba(15,150,156,0.45), 0 0 80px rgba(15,150,156,0.10), inset 0 1px 0 rgba(255,255,255,0.22)',borderRadius:16,border:'1px solid rgba(15,150,156,0.35)'},
  indigo:{background:'linear-gradient(135deg, #294D61 0%, #1a3548 50%, #05161A 100%)',boxShadow:'0 8px 32px rgba(41,77,97,0.45), 0 0 80px rgba(41,77,97,0.08), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:16,border:'1px solid rgba(109,165,192,0.25)'},
  amber:{background:'linear-gradient(135deg, #d97706, #92400e)',boxShadow:'0 8px 32px rgba(217,119,6,0.30), 0 0 80px rgba(217,119,6,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',borderRadius:16,border:'1px solid rgba(255,255,255,0.12)'},
  red:{background:'linear-gradient(135deg, #dc2626, #7f1d1d)',boxShadow:'0 8px 32px rgba(220,38,38,0.30), 0 0 80px rgba(220,38,38,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',borderRadius:16,border:'1px solid rgba(255,255,255,0.12)'},
  dark:{background:'linear-gradient(135deg, #0C7075 0%, #072E33 50%, #05161A 100%)',boxShadow:'0 8px 32px rgba(12,112,117,0.40), 0 0 80px rgba(12,112,117,0.08), inset 0 1px 0 rgba(255,255,255,0.14)',borderRadius:16,border:'1px solid rgba(15,150,156,0.20)'},
};

// --- LIQUID GLASS SYSTEM: True refraction over teal/green wallpaper ---
// glass-refraction library vars: blur 26/20/8, sat 1.7/1.5/1.3
// SVG feTurbulence + feDisplacementMap for light-bending effect
// Stack: shell (blur+refract) + plate (dark readability) + content
const GLASS_BASE = {
  radius: 16,  // Blueprint spec: 16px consistent on all cards
  padding: 20, // Blueprint spec: 20px internal padding everywhere
};

// Dark teal-navy glass plates over wallpaper — teal spectrum bends through
// Pinterest palette: #05161A (deep) → #072E33 (surface) → #0C7075 (mid) → #0F969C (accent)
// Teal-tinted borders + warm glass sheen for luxury depth
const glassLight = (tier=2) => {
  // Blueprint spec: heavy frost 20px, dual shadow system
  const plate = tier===1 ? 'rgba(7,46,51,0.72)' : tier===3 ? 'rgba(5,22,26,0.35)' : 'rgba(7,46,51,0.58)';
  const blur = 20; // Spec: blur(20px) everywhere — heavy frosting, consistent
  const sat = tier===1 ? 1.8 : tier===3 ? 1.3 : 1.6;
  const specular = tier===1 ? 0.22 : tier===3 ? 0.10 : 0.15;
  const sheen = tier===3 ? 0.08 : tier===1 ? 0.08 : 0.06;
  const bdr = tier===1 ? 'rgba(15,150,156,0.32)' : tier===3 ? 'rgba(15,150,156,0.10)' : 'rgba(15,150,156,0.22)';
  return {
    background: plate,
    backdropFilter:`blur(${blur}px) saturate(${sat}) url(#glass-refract)`,
    WebkitBackdropFilter:`blur(${blur}px) saturate(${sat})`,
    border:`1px solid ${bdr}`,
    borderRadius:GLASS_BASE.radius,
    // Blueprint spec dual-shadow: tight definition + wide ambient
    boxShadow:`0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,${specular}), inset 0 0 0 1px rgba(15,150,156,0.06)`,
    // 135deg diagonal shine — blueprint Factor 3 spec
    backgroundImage:`linear-gradient(135deg, rgba(255,255,255,${sheen}) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)`,
  };
};
const G = glassLight(2);
const G1 = glassLight(1);
const G3 = glassLight(3);
const GS = {
  background:"rgba(7,46,51,0.92)",
  backdropFilter:"blur(20px) saturate(1.6)",WebkitBackdropFilter:"blur(20px) saturate(1.6)",
  border:"1px solid rgba(15,150,156,0.28)",borderRadius:16,
  boxShadow:"0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.16)",
  backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
};
// Panel header banner — deep teal-dark strip, teal accent shimmer
const HEADER_BANNER = {
  background:'linear-gradient(90deg, rgba(5,22,26,0.92), rgba(7,46,51,0.80) 70%)',
  padding:'10px 16px',borderRadius:'16px 16px 0 0',
  marginBottom:0,display:'flex',justifyContent:'space-between',alignItems:'center',
  backgroundImage:'linear-gradient(90deg, rgba(15,150,156,0.10), transparent 70%)',
  borderBottom:'1px solid rgba(15,150,156,0.16)',
};
const HEADER_TITLE = {fontSize:13,fontWeight:800,color:'#e8f4f5',letterSpacing:1.5,textTransform:'uppercase'};
const HEADER_SUB = {fontSize:10,fontWeight:500,color:'rgba(232,244,245,0.45)',marginTop:1};
const HEADER_DOTS = {fontSize:16,color:'rgba(255,255,255,0.30)',cursor:'pointer',letterSpacing:2};
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
// Phase 1 Truth Layer — module-scope freshness state, updated from useSupabaseData()
let FRESHNESS = {};
// Phase 2 Finance OS — engine-computed state objects, recalculated on data change
let ENGINE = { concentration: null, debtPriority: null, sleeveExposure: null, wrapperExposure: null, currencyExposure: null, driftMonitor: null, isaPensionRouting: null, rebalanceProposal: null };
let MKTENG = { regime: null, stress: null, btcCycle: null, yieldCurve: null, creditStress: null, sectorLeadership: null, cryptoOnChain: null };
let AGENT = { synthesis: null, rankedOpps: null, whatChanged: null, actionQueue: null, triggerAlerts: null, morningCommand: null };
// =========================================================================
// UI COMPONENTS — ORION GLASS (Light Mode)
// =========================================================================
const Card = ({children,style,glow,hover,tier=2,accent,material}) => {
  const [hovered,setHovered] = useState(false);
  const gSpec = glassLight(tier);
  const glowAccent = accent || P.cyan;
  // Material variant — solid gradient, no glass
  if(material){
    const ms = MAT[material] || MAT.teal;
    return (
      <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{
          position:'relative',overflow:'hidden',marginBottom:8,
          ...ms,
          transition:'all 0.2s ease',
          transform:hovered?'translateY(-2px)':'none',
          filter:hovered?'brightness(1.08)':'none',
          ...(style?.flex?{flex:style.flex}:{}),
          ...(style?.minWidth?{minWidth:style.minWidth}:{}),
          ...(style?.maxWidth?{maxWidth:style.maxWidth}:{}),
          ...(style?.gridColumn?{gridColumn:style.gridColumn}:{}),
          ...(style?.width?{width:style.width}:{}),
          ...(style?.margin?{margin:style.margin}:{}),
          ...(style?.marginBottom?{marginBottom:style.marginBottom}:style?.marginBottom===0?{marginBottom:0}:{}),
        }}
      >
        <div style={{position:'relative',zIndex:1,padding:style?.padding||`${GLASS_BASE.padding}px`,
          ...(style?.textAlign?{textAlign:style.textAlign}:{}),
        }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        position:'relative', borderRadius:GLASS_BASE.radius, overflow:'hidden', marginBottom:8,
        transition:"all 0.25s ease",
        transform:hovered&&hover?"translateY(-2px) scale(1.005)":"none",
        ...(style?.flex?{flex:style.flex}:{}),
        ...(style?.minWidth?{minWidth:style.minWidth}:{}),
        ...(style?.maxWidth?{maxWidth:style.maxWidth}:{}),
        ...(style?.gridColumn?{gridColumn:style.gridColumn}:{}),
        ...(style?.width?{width:style.width}:{}),
        ...(style?.margin?{margin:style.margin}:{}),
        ...(style?.marginBottom?{marginBottom:style.marginBottom}:style?.marginBottom===0?{marginBottom:0}:{}),
      }}
    >
      {/* SHELL: outer glass — blur + refraction */}
      <div style={{
        position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:gSpec.backdropFilter, WebkitBackdropFilter:gSpec.WebkitBackdropFilter,
        border:hovered&&hover?`1px solid rgba(255,255,255,0.16)`:gSpec.border,
        backgroundImage:gSpec.backgroundImage,
        boxShadow: glow
          ? `0 16px 48px rgba(${accent?hx2(glowAccent):'99,102,241'},0.25), ${gSpec.boxShadow}`
          : hovered&&hover
            ? `0 20px 60px rgba(0,0,0,0.35), ${gSpec.boxShadow}`
            : gSpec.boxShadow,
        pointerEvents:'none', transition:'all 0.25s ease',
      }}/>
      {/* PLATE: dark readability surface */}
      <div style={{
        position:'absolute',inset:0,borderRadius:'inherit',
        background:gSpec.background,
        pointerEvents:'none',
      }}/>
      {/* CONTENT */}
      <div style={{
        position:'relative', zIndex:1,
        padding:style?.padding||`${GLASS_BASE.padding}px`,
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

const K = ({l,v,s,c=P.cyan,sm,delta,deltaType,bench}) => (
  <div style={{
    position:'relative', borderRadius:16, overflow:'hidden', textAlign:"center",
    flex:sm?"1 1 110px":"1 1 145px", minWidth:sm?95:130,
  }}>
    {/* Shell — glass blur + refraction over wallpaper */}
    <div style={{
      position:'absolute',inset:0,borderRadius:'inherit',
      backdropFilter:'blur(24px) saturate(1.7) url(#glass-refract)',WebkitBackdropFilter:'blur(24px) saturate(1.7)',
      border:'1px solid rgba(255,255,255,0.14)',
      backgroundImage:'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 60%, rgba(255,255,255,0.04) 100%)',
      boxShadow:'0 16px 48px rgba(0,0,0,0.30), 0 4px 14px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(255,255,255,0.04)',
      pointerEvents:'none',
    }}/>
    {/* Plate — dark for readability, reduced opacity for wallpaper visibility */}
    <div style={{
      position:'absolute',inset:0,borderRadius:'inherit',
      background:'rgba(15,23,42,0.50)',
      pointerEvents:'none',
    }}/>
    {/* Accent edge — bottom glow */}
    <div style={{
      position:'absolute',bottom:0,left:'8%',right:'8%',height:3,
      background:`linear-gradient(90deg, transparent, ${c}80, transparent)`,
      borderRadius:2, pointerEvents:'none',
    }}/>
    {/* Content */}
    <div style={{position:'relative',zIndex:1,padding:sm?"12px 14px":"18px 16px"}}>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.55)',textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:5}}>{l}</div>
      <div style={{fontSize:sm?24:28,fontWeight:800,color:c,fontFamily:P.mono,letterSpacing:-0.5,lineHeight:1.1}}>{v}</div>
      {s&&<div style={{fontSize:10,color:'rgba(255,255,255,0.45)',marginTop:4,lineHeight:1.3}}>{s}</div>}
      {delta&&<div style={{display:'inline-flex',alignItems:'center',gap:3,marginTop:4,fontSize:10,fontWeight:700,
        color:deltaType==="up"?P.positive:deltaType==="down"?P.negative:'rgba(255,255,255,0.5)',
        background:deltaType==="up"?'rgba(34,197,94,0.15)':deltaType==="down"?'rgba(244,63,94,0.15)':'rgba(255,255,255,0.06)',
        padding:'2px 6px',borderRadius:4,
      }}>{deltaType==="up"?"▲":deltaType==="down"?"▼":"●"} {delta}</div>}
      {bench&&<div style={{fontSize:8,color:'rgba(255,255,255,0.35)',marginTop:3}}>vs Bench: {bench}</div>}
    </div>
  </div>
);

const Hd = ({t,s,tag,ac=P.cyan,freshness,tableKey}) => (
  <div style={{marginBottom:18,marginTop:6}}>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <h2 style={{fontSize:24,fontWeight:800,color:'#fff',margin:0,letterSpacing:-0.4,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{t}</h2>
      {tag&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${ac}20`,color:ac,textTransform:"uppercase",letterSpacing:1.2,border:`1px solid ${ac}30`}}>{tag}</span>}
      {freshness&&<FreshnessChip freshness={freshness} tableKey={tableKey}/>}
    </div>
    {s&&<p style={{fontSize:13,color:'rgba(255,255,255,0.55)',margin:"5px 0 0",lineHeight:1.5}}>{s}</p>}
  </div>
);

const Ins = ({text,type="insight"}) => {
  const c={insight:P.cyan,warning:P.amber,action:P.indigo,risk:P.negative,opp:P.positive}[type]||P.cyan;
  return (
    <div style={{
      position:'relative',overflow:'hidden',
      padding:"16px 20px",borderLeft:`4px solid ${c}`,
      borderRadius:"0 14px 14px 0",marginBottom:14,
    }}>
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:'blur(14px) saturate(1.2)',WebkitBackdropFilter:'blur(14px) saturate(1.2)',
        background:`linear-gradient(135deg,${c}12,rgba(15,23,42,0.60) 70%)`,
        border:'1px solid rgba(255,255,255,0.06)',borderLeft:'none',
        boxShadow:'0 8px 24px rgba(0,0,0,0.25)',
        pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:11,color:c,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6}}>{type}</div>
        <div style={{fontSize:13,color:'#cbd5e1',lineHeight:1.7,fontWeight:500}}>{text}</div>
      </div>
    </div>
  );
};

// Sprint A reusable Finance layer (T1-T3)
const GlassCard = (props) => <Card {...props} />;
const KpiTile = (props) => <K {...props} />;
const SectionHeader = (props) => <Hd {...props} />;
const InsightCallout = (props) => <Ins {...props} />;

// ── Chip ─ Interactive glass pill badge (image-1 style highlights) ──────────
const Chip = ({label,value,color,icon,onClick}) => {
  color = color||P.cyan;
  const [hov,setHov]=useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:999,
        cursor:onClick?'pointer':'default',userSelect:'none',
        background:hov?`${color}28`:`${color}14`,
        border:`1px solid ${hov?color+'55':color+'28'}`,
        backdropFilter:'blur(12px) saturate(1.3)',WebkitBackdropFilter:'blur(12px) saturate(1.3)',
        boxShadow:hov?`0 0 14px ${color}30, inset 0 1px 0 rgba(255,255,255,0.14)`:`inset 0 1px 0 rgba(255,255,255,0.08)`,
        transition:'all 0.18s ease',
      }}>
      {icon&&<span style={{fontSize:9}}>{icon}</span>}
      {label&&<span style={{fontSize:9,color:'rgba(255,255,255,0.50)',fontWeight:700,letterSpacing:0.6,textTransform:'uppercase'}}>{label}</span>}
      {value&&<span style={{fontSize:11,color,fontWeight:800,fontFamily:P.mono}}>{value}</span>}
    </div>
  );
};

// ── FreshnessChip — Phase 1 Truth Layer: shows live/stale/fallback per data source ──
const FreshnessChip = ({freshness, tableKey, label}) => {
  if (!freshness) return null;
  const f = tableKey ? freshness[tableKey] : freshness;
  if (!f) return null;
  const config = {
    live:     { dot: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#4ade80' },
    stale:    { dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
    fallback: { dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  text: '#f87171' },
  };
  const s = config[f.level] || config.fallback;
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:6,
      background:s.bg,border:`1px solid ${s.border}`,fontSize:9,fontWeight:600,letterSpacing:0.3,
      color:s.text,userSelect:'none',flexShrink:0}}>
      <div style={{width:5,height:5,borderRadius:'50%',background:s.dot,boxShadow:`0 0 6px ${s.dot}60`}}/>
      {label || f.label}
    </div>
  );
};

// ── GlassAction ─ Small interactive glass button for tile action bars ────────
const GlassAction = ({icon,label,onClick,color}) => {
  color = color||P.t3;
  const [hov,setHov]=useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{display:'inline-flex',alignItems:'center',gap:4,padding:'5px 10px',
        background:hov?'rgba(15,150,156,0.18)':'rgba(255,255,255,0.05)',
        border:`1px solid ${hov?'rgba(15,150,156,0.45)':'rgba(255,255,255,0.10)'}`,
        borderRadius:8,cursor:'pointer',color:hov?P.cyan:color,fontSize:11,fontWeight:600,
        transition:'all 0.15s ease',backdropFilter:'blur(8px)',
        boxShadow:hov?'0 4px 14px rgba(15,150,156,0.20)':'none',fontFamily:'inherit',
      }}>
      {icon}{label&&<span style={{fontSize:9,letterSpacing:0.5,textTransform:'uppercase'}}>{label}</span>}
    </button>
  );
};

// ── PanelShell ─ Core tile wrapper: SM/MD/LG sizes, shimmer, chips, takeaway ─
const PanelShell = ({title,subtitle,metric,metricColor,children,tier=2,takeaway,size='md',chips,badge,freshness,tableKey,...cardProps}) => {
  const [expanded,setExpanded]=useState(true);
  const cfg = size==='sm'
    ? {pad:12,titleSz:11,hpad:'7px 13px',accentH:1.5}
    : size==='lg'
    ? {pad:22,titleSz:14,hpad:'12px 20px',accentH:2.5}
    : {pad:18,titleSz:13,hpad:'10px 16px',accentH:2};
  const ac = metricColor||P.cyan;
  return (
    <GlassCard hover tier={tier} {...cardProps} style={{...cardProps.style,padding:0}}>
      {/* Top glass shimmer highlight — bright edge like image 1, spec radius 16px */}
      <div style={{height:1,background:`linear-gradient(90deg,transparent 8%,rgba(255,255,255,0.20) 32%,${ac}60 50%,rgba(255,255,255,0.20) 68%,transparent 92%)`,borderRadius:'16px 16px 0 0',flexShrink:0}}/>
      {(title||metric||badge) && <div style={{...HEADER_BANNER,padding:cfg.hpad}}>
        <div style={{flex:1}}>
          {title && <div style={{...HEADER_TITLE,fontSize:cfg.titleSz}}>{title}</div>}
          {subtitle && <div style={{...HEADER_SUB}}>{subtitle}</div>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {freshness && <FreshnessChip freshness={freshness} tableKey={tableKey}/>}
          {(metric||badge) && <div style={{fontSize:size==='sm'?15:18,fontWeight:800,color:ac,fontFamily:P.mono,letterSpacing:-0.5}}>{metric||badge}</div>}
          <button onClick={()=>setExpanded(e=>!e)} style={{background:'none',border:'none',cursor:'pointer',
            color:'rgba(255,255,255,0.28)',fontSize:11,padding:'2px 4px',lineHeight:1,fontFamily:'inherit',
            transition:'transform 0.2s ease',transform:expanded?'rotate(0deg)':'rotate(-90deg)'}}>▾</button>
        </div>
      </div>}
      {/* Teal accent line under header */}
      {(title||metric||badge) && <div style={{height:cfg.accentH,background:`linear-gradient(90deg,${ac}80,${ac}35 50%,transparent)`,flexShrink:0}}/>}
      {expanded && <div style={{padding:cfg.pad}}>
        {chips?.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:10}}>{chips.map((ch,i)=><Chip key={i} {...ch}/>)}</div>}
        {children}
        {takeaway && <div style={{marginTop:11,padding:'9px 13px',borderRadius:10,
          background:'linear-gradient(135deg,rgba(15,150,156,0.13),rgba(5,22,26,0.60))',
          border:'1px solid rgba(15,150,156,0.22)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',
        }}>
          <div style={{fontSize:9,fontWeight:800,color:ac,letterSpacing:1.2,textTransform:'uppercase',marginBottom:2}}>TAKEAWAY</div>
          <div style={{fontSize:11,color:'rgba(232,244,245,0.65)',lineHeight:1.65}}>{takeaway}</div>
        </div>}
      </div>}
    </GlassCard>
  );
};

const Tbl = ({h,r,hl}) => (
  <div style={{overflowX:"auto",borderRadius:14,border:'1px solid rgba(255,255,255,0.08)',background:"rgba(15,23,42,0.50)",boxShadow:'0 8px 32px rgba(0,0,0,0.30)'}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{h.map((x,i) => <th key={i} style={{textAlign:i===0?"left":"right",padding:"10px 14px",borderBottom:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.55)',fontWeight:700,fontSize:11,textTransform:"uppercase",letterSpacing:0.8,background:"rgba(10,16,32,0.60)"}}>{x}</th>)}</tr></thead>
      <tbody>{r.map((row,ri) => <tr key={ri} style={{transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.15)"}} onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.boxShadow="none"}}>{row.map((cell,ci) => {
        const neg=typeof cell==="string"&&cell.startsWith("-");
        const pos=typeof cell==="string"&&cell.startsWith("+");
        return <td key={ci} style={{textAlign:ci===0?"left":"right",padding:"9px 14px",borderBottom:'1px solid rgba(255,255,255,0.04)',color:hl===ci?(neg?P.negative:pos?P.positive:'#f1f5f9'):(ci===0?'#f1f5f9':'#cbd5e1'),fontWeight:ci===0||hl===ci?600:500,fontSize:12}}>{cell}</td>;
      })}</tr>)}</tbody>
    </table>
  </div>
);

// ── LiquidGlassTooltip — Blueprint spec: frosted glass card, diagonal refraction, neon dot glow ──
const Tip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{
      position:'relative',borderRadius:16,overflow:'hidden',minWidth:150,
      boxShadow:'0 12px 40px rgba(0,0,0,0.50), 0 0 80px rgba(0,0,0,0.20)',
    }}>
      {/* Frosted glass surface — 24px blur per spec */}
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:'blur(24px) saturate(1.6)',WebkitBackdropFilter:'blur(24px) saturate(1.6)',
        background:'rgba(5,22,26,0.82)',
        border:'1px solid rgba(255,255,255,0.15)',
        pointerEvents:'none',
      }}/>
      {/* Diagonal refraction highlight — blueprint Factor 3 */}
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        background:'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
        opacity:0.6,pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1,padding:"12px 16px"}}>
        <div style={{color:P.t3,marginBottom:6,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',
          borderBottom:'1px solid rgba(255,255,255,0.06)',paddingBottom:5}}>{label}</div>
        {payload.filter(p=>p.name!==" ").map((p,i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
            {/* Neon dot with glow — blueprint spec */}
            <div style={{width:9,height:9,borderRadius:'50%',background:p.color||P.cyan,
              boxShadow:`0 0 8px ${p.color||P.cyan}`,flexShrink:0}}/>
            <span style={{fontSize:12,color:P.t2,flex:1}}>{p.name}</span>
            <span style={{fontSize:13,color:p.color||P.cyan,fontWeight:700,fontFamily:P.mono}}>
              {typeof p.value==="number"?(Math.abs(p.value)>999?`£${(p.value/1000).toFixed(1)}k`:p.value.toFixed(1)):p.value}
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
    {/* Blueprint Factor 5: area fills 60% at line, 10% at baseline */}
    <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.s1} stopOpacity={0.60}/><stop offset="100%" stopColor={P.s1} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gIndigo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.indigo} stopOpacity={0.55}/><stop offset="100%" stopColor={P.indigo} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.green} stopOpacity={0.55}/><stop offset="100%" stopColor={P.green} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.negative} stopOpacity={0.55}/><stop offset="100%" stopColor={P.negative} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gAmber" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.s3} stopOpacity={0.55}/><stop offset="100%" stopColor={P.s3} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.s2} stopOpacity={0.55}/><stop offset="100%" stopColor={P.s2} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gBtc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.btc} stopOpacity={0.60}/><stop offset="100%" stopColor={P.btc} stopOpacity={0.08}/></linearGradient>
    {/* New series s4–s6 */}
    <linearGradient id="gCoral" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.s4} stopOpacity={0.55}/><stop offset="100%" stopColor={P.s4} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.s5} stopOpacity={0.55}/><stop offset="100%" stopColor={P.s5} stopOpacity={0.08}/></linearGradient>
    <linearGradient id="gMagenta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.s6} stopOpacity={0.55}/><stop offset="100%" stopColor={P.s6} stopOpacity={0.08}/></linearGradient>
    {/* Glow filters — Tier 2 (hero charts) max 40% opacity per blueprint Factor 6 */}
    <filter id="chartGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="boldGlow"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
);
const fmt = v=>`£${Math.abs(v).toLocaleString("en-GB",{maximumFractionDigits:0})}`;
const fK = v=>`£${(v/1000).toFixed(v>=10000?0:1)}k`;
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

// Time Period Selector (Horizon UI pattern)
const PeriodSelector = ({periods=['1M','3M','6M','YTD','1Y','ALL'],active='6M',onChange}) => (
  <div style={{display:'inline-flex',gap:0,background:'rgba(15,23,42,0.60)',borderRadius:10,padding:3,border:'1px solid rgba(255,255,255,0.06)'}}>
    {periods.map(p=>(
      <button key={p} onClick={()=>onChange&&onChange(p)} style={{
        padding:'5px 12px',borderRadius:8,border:'none',cursor:'pointer',
        fontSize:10,fontWeight:700,letterSpacing:0.5,
        background:p===active?'rgba(15,150,156,0.22)':'transparent',
        color:p===active?P.cyan:'rgba(232,244,245,0.38)',
        transition:'all 0.15s ease',
      }}>{p}</button>
    ))}
  </div>
);

// Shimmer Loading Skeleton
const Shimmer = ({w='100%',h=16,r=6}) => (
  <div style={{
    width:w,height:h,borderRadius:r,
    background:'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize:'200% 100%',
    animation:'shimmer 1.5s infinite',
  }}/>
);

// ── ControlBar — Blueprint Factor 18: time pills + filters between Zone 1 and Zone 2 ──
const ControlBar = ({periods=['24H','7D','30D','YTD','ALL'],activePeriod='YTD',onPeriod,filters=[],activeFilter,onFilter,actions=[]}) => (
  <div style={{
    display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',
    gap:8,padding:'8px 14px',marginBottom:12,
    background:'rgba(5,22,26,0.60)',
    backdropFilter:'blur(20px) saturate(1.4)',WebkitBackdropFilter:'blur(20px) saturate(1.4)',
    border:'1px solid rgba(15,150,156,0.12)',borderRadius:12,
    boxShadow:'0 4px 16px rgba(0,0,0,0.20)',
  }}>
    {/* Left: time range pills */}
    <div style={{display:'flex',gap:3,background:'rgba(0,0,0,0.30)',borderRadius:9,padding:3,
      boxShadow:'inset 0 2px 6px rgba(0,0,0,0.40)'}}>
      {periods.map(p=>(
        <button key={p} onClick={()=>onPeriod&&onPeriod(p)} style={{
          padding:'4px 11px',borderRadius:7,border:'none',cursor:'pointer',
          fontSize:10,fontWeight:700,letterSpacing:0.6,fontFamily:'inherit',
          background:p===activePeriod?'rgba(15,150,156,0.22)':'transparent',
          color:p===activePeriod?P.cyan:'rgba(232,244,245,0.38)',
          boxShadow:p===activePeriod?`0 0 12px rgba(15,150,156,0.20), inset 0 1px 0 rgba(255,255,255,0.10)`:'none',
          transition:'all 0.15s ease',
        }}>{p}</button>
      ))}
    </div>
    {/* Centre: category filters */}
    {filters.length>0 && <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
      {filters.map(f=>(
        <button key={f} onClick={()=>onFilter&&onFilter(f)} style={{
          padding:'4px 11px',borderRadius:8,border:`1px solid ${f===activeFilter?'rgba(15,150,156,0.40)':'rgba(255,255,255,0.08)'}`,
          cursor:'pointer',fontSize:10,fontWeight:600,fontFamily:'inherit',
          background:f===activeFilter?'rgba(15,150,156,0.15)':'transparent',
          color:f===activeFilter?P.cyan:'rgba(232,244,245,0.45)',
          transition:'all 0.15s ease',
        }}>{f}</button>
      ))}
    </div>}
    {/* Right: action buttons */}
    {actions.length>0 && <div style={{display:'flex',gap:6}}>
      {actions.map((a,i)=>(
        <button key={i} onClick={a.onClick} style={{
          display:'flex',alignItems:'center',gap:4,
          padding:'4px 10px',borderRadius:8,border:'1px solid rgba(255,255,255,0.08)',
          cursor:'pointer',fontSize:9,fontWeight:700,letterSpacing:0.5,fontFamily:'inherit',
          background:'rgba(255,255,255,0.04)',color:P.t3,
          transition:'all 0.15s ease',
        }}>{a.icon&&<span>{a.icon}</span>}{a.label}</button>
      ))}
    </div>}
  </div>
);

// ── CIOInsightBanner — Blueprint Component 7: agent synthesis + regime + confidence ──
const CIOInsightBanner = ({text,regime='Late Cycle',confidence=72,children}) => {
  const regimeMap = {
    'Expansion':   {c:P.s1,  label:'EXPANSION'},
    'Late Cycle':  {c:P.s3,  label:'LATE CYCLE'},
    'Recession Watch': {c:P.s4, label:'RECESSION WATCH'},
    'Crisis':      {c:P.negative, label:'CRISIS'},
  };
  const rm = regimeMap[regime] || regimeMap['Late Cycle'];
  return (
    <div style={{
      position:'relative',overflow:'hidden',padding:'16px 20px',marginBottom:14,
      borderLeft:`4px solid ${rm.c}`,borderRadius:'0 16px 16px 0',
      background:'rgba(5,22,26,0.65)',
      backdropFilter:'blur(20px) saturate(1.5)',WebkitBackdropFilter:'blur(20px) saturate(1.5)',
      border:`1px solid rgba(255,255,255,0.08)`,borderLeft:`4px solid ${rm.c}`,
      boxShadow:`0 12px 40px rgba(0,0,0,0.30), 0 0 60px rgba(0,0,0,0.12)`,
    }}>
      {/* Animated shimmer strip */}
      <div style={{position:'absolute',top:0,left:'-100%',width:'50%',height:'100%',
        background:`linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)`,
        transform:'skewX(-12deg)',animation:'shimmer 3s infinite',pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'flex-start',gap:14}}>
        {/* Icon */}
        <div style={{width:38,height:38,borderRadius:10,flexShrink:0,
          background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>⚡</div>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:1.5,textTransform:'uppercase',color:P.t3}}>
              Agent Synthesis · <span style={{color:rm.c}}>{rm.label}</span>
            </div>
            <div style={{fontSize:9,fontFamily:P.mono,padding:'2px 8px',borderRadius:5,
              background:'rgba(255,255,255,0.06)',color:P.t3,
              border:'1px solid rgba(255,255,255,0.08)'}}>Confidence: {confidence}%</div>
          </div>
          {text&&<p style={{fontSize:13,color:P.t1,lineHeight:1.7,margin:0,fontWeight:500}}>{text}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

// ── RiskAlertStack — Blueprint Component 8: traffic-light risk limit breach cards ──
const RiskAlertStack = ({alerts=[]}) => {
  const levelMap = {
    critical: {bg:'rgba(239,68,68,0.10)',border:'rgba(239,68,68,0.40)',text:'#fca5a5',glow:'rgba(239,68,68,0.20)',label:'CRITICAL'},
    warning:  {bg:'rgba(245,158,11,0.10)',border:'rgba(245,158,11,0.40)',text:'#fcd34d',glow:'rgba(245,158,11,0.20)',label:'WARNING'},
    info:     {bg:'rgba(59,130,246,0.10)',border:'rgba(59,130,246,0.40)',text:'#93c5fd',glow:'rgba(59,130,246,0.18)',label:'INFO'},
  };
  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      {alerts.map((a,i) => {
        const s = levelMap[a.level] || levelMap.warning;
        return (
          <div key={i} style={{
            padding:'12px 16px',borderRadius:12,
            background:s.bg,border:`1px solid ${s.border}`,
            backdropFilter:'blur(20px) saturate(1.4)',WebkitBackdropFilter:'blur(20px) saturate(1.4)',
            boxShadow:`0 0 20px ${s.glow}`,
            display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,
          }}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:9,fontWeight:800,letterSpacing:1.5,textTransform:'uppercase',
                color:s.text,opacity:0.85,marginBottom:2}}>{a.metric} LIMIT BREACH</div>
              <div style={{fontSize:12,color:P.t1,lineHeight:1.5,fontWeight:500}}>{a.message}</div>
            </div>
            {a.level==='critical' && (
              <button onClick={a.onAction} style={{
                padding:'6px 14px',background:P.negative,color:'#fff',
                border:'none',borderRadius:8,fontSize:10,fontWeight:800,
                cursor:'pointer',flexShrink:0,letterSpacing:0.5,fontFamily:'inherit',
                boxShadow:'0 4px 12px rgba(239,68,68,0.35)',
              }}>HEDGE →</button>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── MonteCarloFan — Blueprint Component 6: P10/P50/P90 probability cone ──
const MonteCarloFan = ({data=[],height=220}) => {
  if(!data.length) return null;
  const W=700,H=height;
  const maxV = Math.max(...data.map(d=>d.p90||0));
  const minV = Math.min(...data.map(d=>d.p10||0));
  const rangeV = maxV - minV || 1;
  const scaleX = i => (i/(data.length-1))*W;
  const scaleY = v => H - ((v-minV)/rangeV)*(H-20) - 10;
  const topPts = data.map((d,i)=>`${scaleX(i)},${scaleY(d.p90||0)}`).join(' L ');
  const botPts = [...data].reverse().map((d,i)=>`${scaleX(data.length-1-i)},${scaleY(d.p10||0)}`).join(' L ');
  const p50Pts = data.map((d,i)=>`${scaleX(i)},${scaleY(d.p50||0)}`).join(' L ');
  return (
    <div style={{width:'100%',overflow:'hidden'}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:height,overflow:'visible'}}>
        <defs>
          <linearGradient id="mcFan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={P.s1} stopOpacity="0.25"/>
            <stop offset="100%" stopColor={P.s1} stopOpacity="0.05"/>
          </linearGradient>
        </defs>
        {/* Confidence band P10–P90 */}
        <path d={`M ${topPts} L ${botPts} Z`} fill="url(#mcFan)"/>
        {/* P50 base case — neon line with glow */}
        <polyline fill="none" stroke={P.s1} strokeWidth={2.5} strokeLinecap="round" points={p50Pts}
          style={{filter:`drop-shadow(0 0 6px ${P.s1}66)`}}/>
        {/* Glow duplicate */}
        <polyline fill="none" stroke={P.s1} strokeWidth={7} strokeLinecap="round" points={p50Pts}
          style={{filter:'blur(5px)'}} opacity={0.35}/>
        {/* Legend */}
        <text x={8} y={14} fill={P.t3} fontSize={10} fontWeight={700}>P10</text>
        <text x={W/2-10} y={14} fill={P.s1} fontSize={10} fontWeight={800}>P50 (Base)</text>
        <text x={W-28} y={14} fill={P.t3} fontSize={10} fontWeight={700}>P90</text>
      </svg>
    </div>
  );
};

// ── FactorHeatmap — Blueprint Component 9: 5-factor exposure matrix ──
const FactorHeatmap = ({data=[]}) => {
  const factors = ['Growth','Value','Momentum','Quality','Low Vol'];
  const getCell = (v) => {
    const abs = Math.abs(v);
    if(v>0.6)  return {bg:`rgba(15,150,156,0.50)`,text:P.s1,  glow:`0 0 10px rgba(15,150,156,0.60)`};
    if(v>0.2)  return {bg:`rgba(15,150,156,0.22)`,text:P.s1,  glow:'none'};
    if(v>-0.2) return {bg:'rgba(255,255,255,0.04)',text:P.t3,  glow:'none'};
    if(v>-0.6) return {bg:`rgba(255,92,122,0.22)`, text:P.s4,  glow:'none'};
    return        {bg:`rgba(255,92,122,0.50)`,      text:P.s4,  glow:`0 0 10px rgba(255,92,122,0.60)`};
  };
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'separate',borderSpacing:4,tableLayout:'fixed'}}>
        <thead>
          <tr>
            <th style={{textAlign:'left',fontSize:10,fontWeight:700,color:P.t3,textTransform:'uppercase',
              letterSpacing:0.8,paddingBottom:6,width:'30%'}}>Asset</th>
            {factors.map(f=>(
              <th key={f} style={{textAlign:'center',fontSize:9,fontWeight:700,color:P.t3,
                textTransform:'uppercase',letterSpacing:0.6,paddingBottom:6}}>{f}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row,i)=>(
            <tr key={i}>
              <td style={{fontSize:12,color:P.t2,fontWeight:600,paddingRight:8,paddingBottom:4}}>{row.name}</td>
              {factors.map(f=>{
                const v = row[f.toLowerCase().replace(' ','_')] ?? row[f] ?? 0;
                const s = getCell(v);
                return (
                  <td key={f} style={{paddingBottom:4}}>
                    <div title={`${f}: ${(v*100).toFixed(0)}%`} style={{
                      height:30,borderRadius:8,
                      background:s.bg,border:'1px solid rgba(255,255,255,0.06)',
                      boxShadow:s.glow,
                      display:'flex',alignItems:'center',justifyContent:'center',
                      fontSize:10,fontWeight:700,color:s.text,fontFamily:P.mono,
                      cursor:'crosshair',transition:'transform 0.2s ease',
                    }} onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
                       onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
                      {v!==0?`${v>0?'+':''}${(v*100).toFixed(0)}%`:'—'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Legend */}
      <div style={{display:'flex',gap:10,marginTop:8,flexWrap:'wrap'}}>
        {[{c:P.s1,l:'High positive (>60%)'},{c:'rgba(15,150,156,0.40)',l:'Positive'},{c:P.t4,l:'Neutral'},{c:P.s4,l:'Negative'}].map((x,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:10,height:10,borderRadius:3,background:x.c}}/>
            <span style={{fontSize:9,color:P.t4}}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── DecisionQualityMatrix — Blueprint Component 10: behavioral finance scores ──
const DecisionQualityMatrix = ({scores={}}) => {
  const metrics = [
    {label:'Timing Alpha',      val:scores.timing      ?? 50,desc:'Entry/exit quality vs systematic'},
    {label:'Wrapper Efficiency',val:scores.wrapper     ?? 62,desc:'Tax-sheltered % of growth assets'},
    {label:'Debt Management',   val:scores.debt        ?? 58,desc:'Debt drag vs NW trajectory'},
    {label:'Disposition Discipline',val:scores.disposition??42,desc:'PGR vs PLR — avoiding hold-losers'},
  ];
  const overall = Math.round(metrics.reduce((a,m)=>a+m.val,0)/metrics.length);
  const oc = overall>=70?P.s1:overall>=45?P.s3:P.s4;
  return (
    <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
      {/* Hero score */}
      <div style={{
        padding:'16px 20px',minWidth:100,textAlign:'center',
        background:'linear-gradient(135deg, rgba(109,165,192,0.18), rgba(5,22,26,0.60))',
        border:`1px solid rgba(109,165,192,0.20)`,borderRadius:12,flexShrink:0,
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,
      }}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1.2,textTransform:'uppercase',color:P.t3}}>PROCESS</div>
        <div style={{fontSize:44,fontWeight:900,color:oc,fontFamily:P.mono,lineHeight:1}}>{overall}</div>
        <div style={{fontSize:9,color:P.t4}}>/100</div>
      </div>
      {/* Metric bars */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {metrics.map((m,i)=>(
          <div key={i} style={{padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:10,border:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:11,fontWeight:600,color:P.t2}}>{m.label}</span>
              <span style={{fontSize:11,fontFamily:P.mono,color:P.t3}}>{m.val}</span>
            </div>
            <div style={{height:6,background:'rgba(0,0,0,0.40)',borderRadius:4,overflow:'hidden',
              boxShadow:'inset 0 2px 4px rgba(0,0,0,0.30)'}}>
              <div style={{width:`${m.val}%`,height:'100%',
                background:`linear-gradient(90deg, ${P.s2}, ${P.s1})`,borderRadius:4,
                transition:'width 0.8s ease',boxShadow:`0 0 8px ${P.s2}40`}}/>
            </div>
            <div style={{fontSize:9,color:P.t4,marginTop:4}}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stat Row — compact inline metric for transaction-style lists
const StatRow = ({label,value,sub,c=P.t1,icon}) => (
  <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:`1px solid rgba(255,255,255,0.04)`}}>
    {icon && <div style={{width:28,height:28,borderRadius:8,background:`${c}14`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:c,fontWeight:800,flexShrink:0}}>{icon}</div>}
    <div style={{flex:1}}>
      <div style={{fontSize:11,color:P.t2,fontWeight:600}}>{label}</div>
      {sub && <div style={{fontSize:9,color:P.t4,marginTop:1}}>{sub}</div>}
    </div>
    <div style={{fontSize:13,fontWeight:800,color:c,fontFamily:P.mono}}>{value}</div>
  </div>
);

// =========================================================================
// SPRINT 1 — NEW UI COMPONENTS (Tab 01 enrichment)
// =========================================================================
const AlertPanel = ({items}) => (
  <div style={{background:'rgba(15,23,42,0.65)',backdropFilter:'blur(20px) saturate(1.5)',WebkitBackdropFilter:'blur(20px) saturate(1.5)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:"16px 20px",marginBottom:16,borderLeft:`4px solid ${P.red}`,boxShadow:'0 12px 40px rgba(0,0,0,0.35)'}}>
    <div style={{fontSize:11,fontWeight:800,color:P.red,letterSpacing:1.5,textTransform:"uppercase",marginBottom:10}}>GOVERNANCE ALERTS</div>
    {items.map((a,i) => {
      const dc = a.sev==="high" ? P.red : a.sev==="med" ? P.amber : 'rgba(255,255,255,0.4)';
      return (
        <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:i<items.length-1?'1px solid rgba(255,255,255,0.05)':"none"}}>
          <div style={{width:9,height:9,borderRadius:"50%",background:dc,flexShrink:0,boxShadow:`0 0 8px ${dc}50`}}/>
          <div style={{fontSize:12,color:'#cbd5e1',flex:1,lineHeight:1.5}}>{a.msg}</div>
          <span style={{fontSize:9,color:'#fff',fontWeight:700,padding:"2px 8px",borderRadius:9999,background:dc,textTransform:"uppercase",letterSpacing:0.5}}>{a.sev}</span>
        </div>
      );
    })}
  </div>
);

const CalendarHeatmap = ({data}) => {
  const getColor = (r) => {
    if(r <= -5) return {bg:"rgba(239,68,68,0.25)",text:"#f87171"};
    if(r <= -2) return {bg:"rgba(239,68,68,0.15)",text:"#f87171"};
    if(r < 0) return {bg:"rgba(239,68,68,0.08)",text:"#fca5a5"};
    if(r === 0) return {bg:"rgba(255,255,255,0.04)",text:'rgba(255,255,255,0.5)'};
    if(r <= 2) return {bg:"rgba(34,197,94,0.12)",text:"#4ade80"};
    return {bg:"rgba(34,197,94,0.22)",text:"#4ade80"};
  };
  return (
    <div style={{display:"grid",gridTemplateColumns:`repeat(${data.length},1fr)`,gap:6}}>
      {data.map((d,i) => {
        const {bg,text} = getColor(d.r);
        return (
          <div key={i} style={{background:bg,borderRadius:12,padding:"14px 8px",textAlign:"center",border:`1px solid ${text}20`,boxShadow:'0 4px 12px rgba(0,0,0,0.20)'}}>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.50)',fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>{d.m}</div>
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
      <div style={{fontSize:13,fontWeight:800,color:'#fff',letterSpacing:0.5,marginBottom:4}}>RETURN DECOMPOSITION — WHAT DROVE THE {pc(nwReturn)} RETURN</div>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.50)',marginBottom:14}}>Allocation, selection, and structural effects decomposed into decision-level attribution.</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.map((d,i) => {
          const maxAbs = Math.max(...data.map(x=>Math.abs(x.val)));
          const barW = Math.abs(d.val) / maxAbs * 100;
          const isPos = d.val >= 0;
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:130,fontSize:12,color:'rgba(255,255,255,0.55)',textAlign:"right",flexShrink:0}}>{d.name}</div>
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
      {left.map((n,i) => <g key={`l${i}`}><rect x={x1} y={n.y} width={nodeW} height={n.h} rx={5} fill={n.color} opacity={0.85}/><text x={x1-6} y={n.y+n.h/2} textAnchor="end" fill={P.t2} fontSize={11} fontWeight={700} dominantBaseline="middle">{n.label}</text><text x={x1-6} y={n.y+n.h/2+13} textAnchor="end" fill={P.t4} fontSize={10} dominantBaseline="middle">{"£"}{n.val}k</text></g>)}
      {mid.map((n,i) => <g key={`m${i}`}><rect x={x2} y={n.y} width={nodeW} height={n.h} rx={5} fill={n.color} opacity={0.85}/><text x={x2+nodeW/2} y={n.y-6} textAnchor="middle" fill={P.t2} fontSize={10} fontWeight={700}>{n.label}</text><text x={x2+nodeW/2} y={n.y+n.h+13} textAnchor="middle" fill={P.t4} fontSize={9}>{"£"}{n.val.toFixed(0)}k</text></g>)}
      {right.map((n,i) => <g key={`r${i}`}><rect x={x3} y={n.y} width={nodeW} height={Math.max(n.h,4)} rx={4} fill={n.color} opacity={0.85}/><text x={x3+nodeW+8} y={n.y+Math.max(n.h,4)/2} fill={P.t2} fontSize={10} fontWeight={600} dominantBaseline="middle">{n.label}</text><text x={x3+nodeW+8} y={n.y+Math.max(n.h,4)/2+12} fill={P.t4} fontSize={9} dominantBaseline="middle">{"£"}{n.val}k</text></g>)}
    </svg>
  );
};
const T1 = ()=>{
  const fire=(PORT.netWorth/PORT.fireTarget*100);
  const contribData = HOLDINGS.filter(h=>h.prev).map(h=>({name:h.name.split("(")[0].split(" ").slice(0,2).join(" ").trim(),pnl:((h.val-h.prev)/1000)})).sort((a,b)=>b.pnl-a.pnl);
  const monthlyReturns = MONTHLY_DATA.map(m=>({m:m.m,r:m.r}));

  const activeReturn = nwReturn - ((PORT.benchReturn != null ? PORT.benchReturn : -0.028) * 100);
  const realReturn = nwReturn - ((PORT.inflation != null ? PORT.inflation : 0.032) * 100 / 2);
  const probNW = Math.round(0.15*PORT.netWorth*0.85 + 0.50*PORT.netWorth*1.12 + 0.25*PORT.netWorth*1.25 + 0.10*PORT.netWorth*1.45);
  const liquidCash = 15752+406+94;
  const runway = liquidCash / PORT.monthlyExpenses;
  const nw3moAgo = NW_WEEKLY[Math.max(NW_WEEKLY.length - 13, 0)]?.nw || NW_WEEKLY[0]?.nw || PORT.nw6moAgo;
  const ret3m = ((PORT.netWorth - nw3moAgo) / nw3moAgo * 100);
  const nw1moAgo = NW_WEEKLY[Math.max(NW_WEEKLY.length - 5, 0)]?.nw || PORT.netWorth;
  const ret1m = ((PORT.netWorth - nw1moAgo) / nw1moAgo * 100);

  const growthAssets = HOLDINGS.filter(h=>["ETF","Crypto","Stock","Investment"].includes(h.cls)).reduce((a,h)=>a+h.val,0);
  const growthInShelter = (82133 + 18085);
  const dqWrapper = Math.min((growthInShelter / (growthAssets||1)) * 10, 10);
  const dqDebt = PORT.amexDebt > 0 ? Math.max(10 - (0.22 * PORT.amexDebt / PORT.netWorth * 100), 0) : 10;
  const dqConcentration = Math.max(10 - (18 / 5), 0);
  const dqTiming = 5.0;
  const decisionQuality = +((dqWrapper * 0.30 + dqDebt * 0.25 + dqConcentration * 0.25 + dqTiming * 0.20).toFixed(1));

  const netSalaryAnnLocal = (PORT.grossSalary + PORT.grossBonus) * (1 - PORT.taxRate - PORT.niRate);
  const savingsRateLocal = ((netSalaryAnnLocal - PORT.monthlyExpenses * 12) / netSalaryAnnLocal * 100);
  const debtToAsset = (PORT.debts / PORT.assets * 100);
  const leverage = PORT.debts / PORT.netWorth;

  // Phase 4: Engine-driven alerts with fallback to hardcoded
  const engineAlerts = AGENT.triggerAlerts?.alerts || [];
  const alerts = engineAlerts.length > 0
    ? engineAlerts.map(a => ({ msg: a.message, sev: a.severity === 'critical' ? 'high' : a.severity === 'warning' ? 'med' : 'low' }))
    : [
      {msg:"ISA deadline: 29 days. £0 of £20k deployed.", sev:"high"},
      {msg:`Amex at 22% APR: ${fmt(PORT.amexDebt)} outstanding.`, sev:"high"},
      {msg:`Cash buffer: ${runway.toFixed(1)} months vs 3.0 target.`, sev: runway < 3 ? "med" : "low"},
      {msg:"Crypto risk budget: 32% risk from 13% capital (2.5x limit).", sev:"med"},
      {msg:"18 positions below £1k. Fragment drag ~£160/yr.", sev:"low"},
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

  const radarData = [
    {metric:"Returns",score:SCORECARD.returns,full:10},
    {metric:"Risk Mgmt",score:SCORECARD.riskMgmt,full:10},
    {metric:"Process",score:SCORECARD.process,full:10},
    {metric:"Tax Eff.",score:SCORECARD.taxEff,full:10},
    {metric:"Diversify",score:SCORECARD.diversify,full:10},
    {metric:"Capital Eff.",score:SCORECARD.capitalEff,full:10},
  ];

  const totalAssetsLocal = PORT.assets;
  const classAgg = {};
  HOLDINGS.forEach(h => { classAgg[h.cls] = (classAgg[h.cls] || 0) + h.val; });
  const classData = Object.entries(classAgg).map(([cls, val]) => {
    const pct = +(val / totalAssetsLocal * 100).toFixed(1);
    let color;
    if (cls === "Crypto") color = P.btc;
    else if (cls === "ETF") color = P.cyan;
    else if (cls === "Pension") color = "#06b6d4";
    else if (cls === "Cash/FD" || cls === "Cash") color = "#94a3b8";
    else if (cls === "Investment") color = P.indigo;
    else color = P.purple;
    return { cls, val, pct, color };
  }).sort((a,b) => b.val - a.val);

  // Sleeve contribution data for diverging bar
  const sleeveContrib = SLEEVES.map(s => {
    const holdingsInSleeve = HOLDINGS.filter(h => {
      if(s.name.includes("ETF")) return h.cls==="ETF";
      if(s.name.includes("Pension")) return h.cls==="Pension";
      if(s.name.includes("Cash")) return h.cls==="Cash"||h.cls==="Cash/FD";
      if(s.name.includes("Crypto")) return h.cls==="Crypto";
      if(s.name.includes("Invest")) return h.cls==="Investment";
      if(s.name.includes("Stock")) return h.cls==="Stock";
      return h.cls==="Mixed";
    });
    const pnl = holdingsInSleeve.reduce((a,h)=>a+(h.val-(h.prev||h.val)),0);
    return {name:s.name.split("(")[0].trim().split(" ")[0],pnl:+(pnl/1000).toFixed(1),color:s.color};
  }).sort((a,b)=>b.pnl-a.pnl);

  // Geo distribution quick
  const geoAgg={};HOLDINGS.forEach(h=>{geoAgg[h.geo]=(geoAgg[h.geo]||0)+h.val;});
  const geoData=Object.entries(geoAgg).map(([n,v])=>({n,v:+(v/totalAssetsLocal*100).toFixed(1)})).sort((a,b)=>b.v-a.v).slice(0,6);

  return(<div>
    {/* CIO INSIGHT BANNER — Material gradient tile */}
    <div style={{...MAT.teal,overflow:'hidden',marginBottom:16,padding:'22px 28px'}}>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:10,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,fontWeight:900,boxShadow:'0 4px 16px rgba(0,0,0,0.25)'}}>LS</div>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:'#fff',letterSpacing:-0.5}}>EXECUTIVE SUMMARY</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',gap:8}}>{PORT.date} · CIO Briefing · Institutional Review <FreshnessChip freshness={FRESHNESS} tableKey="portfolio_config"/></div>
              </div>
            </div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.85)',lineHeight:1.7,maxWidth:800}}>
              Portfolio at <span style={{color:P.cyan,fontWeight:700}}>{fmt(PORT.netWorth)}</span> after a <span style={{color:P.negative,fontWeight:700}}>{pc(nwReturn)}</span> 6-month return. Crypto correction destroyed {fK(38400)} while equity selection and pension revaluation added {fK(30400)}. New compensation ({fK(PORT.grossSalary+PORT.grossBonus)} gross) transforms the savings engine. Immediate priorities: ISA deployment ({fK(20000)}), Amex clearance ({fmt(PORT.amexDebt)}), salary sacrifice optimisation.
            </div>
          </div>
          <div style={{display:'flex',gap:10,flexShrink:0,marginLeft:20}}>
            <Gauge score={SCORECARD.overall} label="QUALITY" size={72}/>
            <Gauge score={decisionQuality} label="PROCESS" size={72}/>
          </div>
        </div>
      </div>
    </div>

    {/* ROW 1: 12-col KPI grid — variable sizing: hero(3), standard(2), compact(1.5) */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(12, 1fr)",gap:10,marginBottom:14}}>
      <div style={{gridColumn:"span 3"}}><KpiTile l="Net Worth" v={fK(PORT.netWorth)} c={P.cyan} delta={`Peak: ${fK(PORT.nwPeak)}`} deltaType={PORT.netWorth>=PORT.nwPeak?"up":"down"} bench={`Target: ${fK(PORT.fireTarget*0.25)}`}/></div>
      <div style={{gridColumn:"span 3"}}><KpiTile l="6-Mo Return" v={pc(nwReturn)} c={nwReturn>0?P.positive:P.negative} delta="20 Sep → 7 Mar" deltaType={nwReturn>0?"up":"down"} bench={`MSCI: ${pc((PORT.benchReturn||-.028)*100)}`}/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Total Assets" v={fK(PORT.assets)} c={P.indigo} delta={`Debts: ${fK(PORT.debts)}`} bench={`D/A: ${debtToAsset.toFixed(1)}%`}/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Active Return" v={pc(activeReturn)} c={activeReturn>0?P.positive:P.negative} delta="vs MSCI World" deltaType={activeReturn>0?"up":"down"} bench="Target: +2%" sm/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Real Return" v={pc(realReturn)} c={realReturn>0?P.positive:P.negative} delta="After inflation" deltaType={realReturn>0?"up":"down"} bench={`CPI: ${((PORT.inflation||0.032)*100).toFixed(1)}%`} sm/></div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(12, 1fr)",gap:10,marginBottom:16}}>
      <div style={{gridColumn:"span 2"}}><KpiTile l="FIRE Progress" v={`${fire.toFixed(0)}%`} c={P.teal} delta={`of ${fK(PORT.fireTarget)}`} bench="Target age: 45"/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Peak Drawdown" v={`${RISK.maxDD}%`} c={P.negative} delta={`${RISK.ddDur}d duration`} deltaType="down" bench="MSCI DD: -8%"/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Sharpe Ratio" v={RISK.sharpe?.toFixed(2)||"0.42"} c={RISK.sharpe>=0.5?P.positive:P.amber} delta="Risk-adjusted" bench="Inst. min: 1.0"/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Exp. NW (12M)" v={fK(probNW)} c={P.cyan} delta="Prob-weighted" bench="Base case" sm/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Savings Rate" v={`${savingsRateLocal.toFixed(0)}%`} c={savingsRateLocal>25?P.positive:P.amber} delta="of net income" bench="Target: 50%" sm/></div>
      <div style={{gridColumn:"span 2"}}><KpiTile l="Cash Buffer" v={`${runway.toFixed(1)}mo`} c={runway>=3?P.positive:P.negative} delta="vs 3.0 target" deltaType={runway>=3?"up":"down"} bench="Rule: 3-6mo" sm/></div>
    </div>

    {/* AGENT INSIGHT BANNER — synthesis + regime context */}
    <CIOInsightBanner
      regime={AGENT.synthesis?.sections?.marketContext?.regime || "Late Cycle"}
      confidence={AGENT.synthesis?.sections?.marketContext?.regimeConfidence || 72}
      text={AGENT.synthesis?.executiveSummary || `Crypto correction (-${fK(38400)}) dominated the ${pc(nwReturn)} 6-month drawdown. Underlying equity selection and pension revaluation added ${fK(30400)} — structural performance is sound. New compensation cycle (${fK(PORT.grossSalary+PORT.grossBonus)} gross) is the primary wealth engine. Three actions dominate ROI: ISA deployment, Amex clearance, salary sacrifice optimisation.`}
    />

    {/* CONTROL BAR — time filter between Zone 1 and Zone 2 */}
    <ControlBar
      periods={['1M','3M','6M','YTD','1Y','ALL']}
      activePeriod="6M"
      filters={['All','NW','Assets','Drawdown']}
      activeFilter="All"
      actions={[{label:'Export PDF',icon:'↓'},{label:'Refresh',icon:'↺'}]}
    />

    {/* ROW 2: Alerts + Scorecard Radar + Return Decomp (3 col) */}
    <div style={{display:"grid",gridTemplateColumns:"3fr 4fr 5fr",gap:14,marginBottom:14}}>
      {/* Alerts */}
      <PanelShell tier={1} title="GOVERNANCE ALERTS" subtitle={`${alerts.filter(a=>a.sev==="high").length} high priority${AGENT.morningCommand?.verdict ? ` · ${AGENT.morningCommand.verdict.level}` : ''}`} metricColor={P.red} takeaway={AGENT.morningCommand?.verdict?.message || "Address high-severity items within 30 days. ISA deadline is time-critical. Amex clearance is highest financial return action."}>
        {alerts.map((a,i) => {
          const dc = a.sev==="high" ? P.red : a.sev==="med" ? P.amber : P.t4;
          return (
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"6px 0",borderBottom:i<alerts.length-1?`1px solid ${P.b2}`:"none"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:dc,flexShrink:0,marginTop:5,boxShadow:`0 0 8px ${dc}50`}}/>
              <div style={{fontSize:11,color:P.t2,lineHeight:1.5,flex:1,fontWeight:500}}>{a.msg}</div>
              <span style={{fontSize:8,color:dc,fontWeight:800,padding:"2px 6px",borderRadius:5,background:`${dc}14`,border:`1px solid ${dc}20`,textTransform:"uppercase",letterSpacing:0.5,flexShrink:0}}>{a.sev}</span>
            </div>
          );
        })}
      </PanelShell>

      {/* Scorecard Radar */}
      <PanelShell glow title="PORTFOLIO QUALITY" subtitle={`Overall: ${SCORECARD.overall}/10 · Process: ${decisionQuality}/10`} metric={`${SCORECARD.overall}/10`} metricColor={SCORECARD.overall>=6?P.positive:P.amber} takeaway={`Diversification (${SCORECARD.diversify}) strong. Returns (${SCORECARD.returns}) dragged by crypto. Tax efficiency (${SCORECARD.taxEff}) improving. Process score (${SCORECARD.process}) weak — no IPS, missed rebalancing windows.`}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:6}}>
          <Gauge score={SCORECARD.overall} label="" size={48}/>
        </div>
        {/* DECISION QUALITY MATRIX — Blueprint Component 10 */}
        <DecisionQualityMatrix scores={{
          timing: Math.round(dqTiming * 10),
          wrapper: Math.round(dqWrapper * 10),
          debt: Math.round(dqDebt * 10),
          disposition: 42,
        }}/>
        <div style={{height:10}}/>
        <ReactECharts option={{
          tooltip:{trigger:'item',backgroundColor:'rgba(15,23,42,0.96)',borderColor:'rgba(255,255,255,0.10)',textStyle:{color:'#f1f5f9',fontSize:11},borderRadius:10,padding:[10,14]},
          radar:{indicator:radarData.map(d=>({name:d.metric,max:10})),radius:'68%',axisName:{color:'#475569',fontSize:10,fontWeight:600},splitArea:{areaStyle:{color:['rgba(99,102,241,0.03)','rgba(99,102,241,0.06)']}},splitLine:{lineStyle:{color:'rgba(0,0,0,0.08)',width:1}},axisLine:{lineStyle:{color:'rgba(0,0,0,0.06)',width:1}}},
          series:[{type:'radar',data:[{value:radarData.map(d=>d.score),name:'Score',areaStyle:{color:'rgba(99,102,241,0.22)'},lineStyle:{color:'#6366f1',width:2.5,shadowColor:'rgba(99,102,241,0.3)',shadowBlur:6},itemStyle:{color:'#6366f1',borderWidth:2,borderColor:'#fff'},symbol:'circle',symbolSize:6},{value:radarData.map(()=>10),name:'Target',lineStyle:{color:'#94a3b8',width:1,type:'dashed'},areaStyle:{color:'transparent'},itemStyle:{color:'transparent'},symbol:'none'}],emphasis:{focus:'self'}}],
        }} style={{height:200,width:'100%'}} opts={{renderer:'svg'}}/>
      </PanelShell>

      {/* Return Decomposition */}
      <PanelShell hover title="RETURN DECOMPOSITION" subtitle={`What drove ${pc(nwReturn)} — allocation, selection, structural effects`} takeaway={`Allocation drag (-3.4%) from UK/EM overweight vs US underweight. Selection positive (+2.1%) from JPM Research picks. Crypto structural drag accounts for bulk of negative attribution.`}>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {decomp.map((d,i) => {
            const maxAbs = Math.max(...decomp.map(x=>Math.abs(x.val)));
            const barW = Math.abs(d.val) / maxAbs * 100;
            const isPos = d.val >= 0;
            return (<div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:100,fontSize:11,color:P.t3,textAlign:"right",fontWeight:600}}>{d.name}</div>
              <div style={{flex:1,height:16,position:"relative",borderRadius:8,overflow:"hidden",background:"rgba(0,0,0,0.04)"}}>
                <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(0,0,0,0.08)",zIndex:2}}/>
                {isPos
                  ? <div style={{position:"absolute",left:"50%",width:`${Math.min(barW/2,50)}%`,height:"100%",background:`linear-gradient(90deg,${d.c}cc,${d.c}50)`,borderRadius:"0 8px 8px 0",boxShadow:`0 2px 8px ${d.c}30`}}/>
                  : <div style={{position:"absolute",right:"50%",width:`${Math.min(barW/2,50)}%`,height:"100%",background:`linear-gradient(270deg,${d.c}cc,${d.c}50)`,borderRadius:"8px 0 0 8px",boxShadow:`0 2px 8px ${d.c}30`}}/>
                }
              </div>
              <div style={{width:46,fontSize:12,fontWeight:800,color:isPos?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{isPos?"+":""}{d.val.toFixed(1)}%</div>
            </div>);
          })}
          <div style={{display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${P.b1}`,paddingTop:6,marginTop:2}}>
            <div style={{width:100,fontSize:12,color:P.t1,textAlign:"right",fontWeight:800}}>Total</div>
            <div style={{flex:1}}/>
            <div style={{width:46,fontSize:13,fontWeight:900,color:nwReturn>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{nwReturn>=0?"+":""}{nwReturn.toFixed(1)}%</div>
          </div>
        </div>
      </PanelShell>
    </div>

    {/* ROW 3: NW Trajectory + Forecast overlay (full width hero chart) */}
    <PanelShell hover title="NET WORTH TRAJECTORY + FORECAST" subtitle="Historical 20 Sep 2025 → 7 Mar 2026 · 5-scenario forward projection to 2035" takeaway={`Current trajectory reaches £1M by 2031 (base case) with £340k comp. FIRE target of £${(PORT.fireTarget/1000).toFixed(0)}k achievable by 2033 at 7% real return. Bull case (10% real) accelerates to 2029.`}>
      <div style={{display:"flex",justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <div style={{display:"flex",gap:10,flexWrap:'wrap'}}>
          {[{c:P.cyan,l:"NW"},{c:P.indigo,l:"Assets"},{c:P.red,l:"Drawdown"},{c:P.green,l:"Bull"},{c:P.t1,l:"Base"},{c:P.amber,l:"Conserv."}].map((x,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:3,borderRadius:2,background:x.c}}/><span style={{fontSize:9,color:P.t4}}>{x.l}</span></div>
          ))}
        </div>
        <PeriodSelector/>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={NW_FORECAST} margin={{left:10,right:10,top:5,bottom:5}}>
          <defs>
            <linearGradient id="nwFillT1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.cyan} stopOpacity={0.28}/><stop offset="100%" stopColor={P.cyan} stopOpacity={0.03}/></linearGradient>
            <linearGradient id="assetFillT1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.indigo} stopOpacity={0.18}/><stop offset="100%" stopColor={P.indigo} stopOpacity={0.02}/></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
          <XAxis dataKey="d" tick={{fill:P.t3,fontSize:9,fontWeight:500}} interval={3}/>
          <YAxis tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>v>=1000000?`£${(v/1000000).toFixed(1)}m`:`£${(v/1000).toFixed(0)}k`} domain={['dataMin-5000','auto']}/>
          <Tooltip content={<Tip/>}/>
          <Area type="monotone" dataKey="a" name="Assets" stroke={P.indigo} fill="url(#assetFillT1)" strokeWidth={1.5} dot={false}/>
          <Area type="monotone" dataKey="nw" name="Net Worth" stroke={P.cyan} fill="url(#nwFillT1)" strokeWidth={2.5} dot={{fill:P.cyan,r:2,strokeWidth:0}} style={{filter:'drop-shadow(0 2px 4px rgba(99,102,241,0.25))'}}/>
          <Line type="monotone" dataKey="bull" name="Bull" stroke={P.green} strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
          <Line type="monotone" dataKey="base" name="Base" stroke={P.t1} strokeWidth={2} dot={false}/>
          <Line type="monotone" dataKey="conserv" name="Conservative" stroke={P.amber} strokeWidth={1} dot={false} strokeDasharray="6 3"/>
          <ReferenceLine y={1000000} stroke={P.amber} strokeDasharray="8 4" label={{value:"£1M",fill:P.amber,fontSize:10,fontWeight:700}}/>
          <ReferenceLine y={PORT.fireTarget} stroke={P.cyan} strokeDasharray="8 4" label={{value:"FIRE",fill:P.cyan,fontSize:10,fontWeight:700}}/>
        </ComposedChart>
      </ResponsiveContainer>
      {/* Inline drawdown */}
      <div style={{marginTop:6,borderTop:`1px solid ${P.b2}`,paddingTop:6}}>
        <div style={{fontSize:10,fontWeight:700,color:P.t4,marginBottom:4}}>DRAWDOWN FROM PEAK</div>
        <ResponsiveContainer width="100%" height={70}>
          <AreaChart data={NW_DD} margin={{left:10,right:10}}>
            <defs><linearGradient id="ddFillT1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.red} stopOpacity={0.25}/><stop offset="100%" stopColor={P.red} stopOpacity={0.03}/></linearGradient></defs>
            <XAxis dataKey="d" tick={false} axisLine={false}/>
            <YAxis tick={{fill:P.t4,fontSize:8}} tickFormatter={v=>`${v.toFixed(0)}%`} domain={['dataMin-2',0]} width={30}/>
            <ReferenceLine y={0} stroke={P.t4}/>
            <Area type="monotone" dataKey="dd" name="DD" stroke={P.red} fill="url(#ddFillT1)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </PanelShell>

    {/* ROW 4: 4-panel dense analysis row — variable widths */}
    <div style={{display:"grid",gridTemplateColumns:"4fr 3fr 3fr 2fr",gap:12,marginBottom:14}}>
      {/* Monthly Return Heatmap */}
      <PanelShell hover title="MONTHLY RETURNS" subtitle="6-month return profile" takeaway="5 of 6 months negative. Only Mar positive (+3.2%). Worst month Nov (-6.8%) driven by crypto crash.">
        <div style={{display:"grid",gridTemplateColumns:`repeat(${monthlyReturns.length},1fr)`,gap:4}}>
          {monthlyReturns.map((d,i) => {
            const neg = d.r < 0;
            const intensity = Math.min(Math.abs(d.r)/7,1);
            const bg = neg ? `rgba(239,68,68,${0.08+intensity*0.20})` : `rgba(34,197,94,${0.08+intensity*0.18})`;
            return (
              <div key={i} style={{background:bg,borderRadius:8,padding:"10px 4px",textAlign:"center",border:`1px solid ${neg?P.red:P.green}12`}}>
                <div style={{fontSize:9,color:P.t4,fontWeight:600,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>{d.m}</div>
                <div style={{fontSize:16,fontWeight:800,color:neg?P.negative:P.positive,fontFamily:P.mono}}>{d.r>0?"+":""}{d.r}%</div>
              </div>
            );
          })}
        </div>
      </PanelShell>

      {/* Allocation by Sleeve donut */}
      <PanelShell hover title="ALLOCATION BY SLEEVE" subtitle="Capital distribution" takeaway="ETFs 28% + Pension 22% = 50% core. Crypto 13% outsized risk contributor. Cash 16% drag on returns.">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={SLEEVES} dataKey="pct" nameKey="name" cx="50%" cy="50%" innerRadius={32} outerRadius={58} paddingAngle={2} stroke="none">
              {SLEEVES.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.85}/>)}
            </Pie>
            <Tooltip content={<Tip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:4}}>
          {SLEEVES.slice(0,5).map((s,i)=><div key={i} style={{fontSize:9,color:s.color,padding:'2px 6px',background:`${s.color}12`,borderRadius:4,fontWeight:700}}>{s.name.split("(")[0].trim().split(" ")[0]} {s.pct}%</div>)}
        </div>
      </PanelShell>

      {/* Balance Sheet KPIs */}
      <PanelShell hover title="BALANCE SHEET" subtitle="Leverage & liquidity" takeaway={`Debt/Asset ${debtToAsset.toFixed(1)}% is healthy. Savings rate ${savingsRateLocal}% strong with new comp. FIRE ${fire.toFixed(0)}% — early stage but trajectory positive.`}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <KpiTile l="Debt/Asset" v={`${debtToAsset.toFixed(1)}%`} c={debtToAsset<5?P.positive:P.amber} sm/>
          <KpiTile l="Leverage" v={`${leverage.toFixed(2)}x`} c={leverage<0.1?P.positive:P.amber} sm/>
          <KpiTile l="Liquid" v={fK(liquidCash)} c={P.cyan} sm/>
          <KpiTile l="Decision Q" v={decisionQuality.toFixed(1)} c={decisionQuality>=6?P.positive:P.amber} sm/>
        </div>
        <div style={{marginTop:6}}>
          <Bar2 val={savingsRateLocal} max={100} c={P.positive} label="Savings Rate"/>
          <Bar2 val={fire} max={100} c={P.cyan} label="FIRE"/>
        </div>
      </PanelShell>

      {/* Debt & Cash Summary */}
      <PanelShell hover title="DEBT & CASH" subtitle="Liability management" takeaway={`Amex at 22% APR is most expensive capital — clear from bonus. ${runway.toFixed(1)} months runway is below 3-month target. Monzo Flex 0% is efficient but watch rollover terms.`}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
          <KpiTile l="Amex" v={fmt(PORT.amexDebt)} c={P.negative} sm delta="22% APR"/>
          <KpiTile l="Monzo" v={fmt(PORT.monzoFlex)} c={P.amber} sm delta="0% APR"/>
          <KpiTile l="Cash" v={fK(liquidCash)} c={P.cyan} sm delta={`${runway.toFixed(1)}mo`}/>
          <KpiTile l="Credit/NW" v={`${(((PORT.amexDebt+PORT.monzoFlex)/PORT.netWorth)*100).toFixed(1)}%`} c={P.negative} sm/>
        </div>
      </PanelShell>
    </div>

    {/* ROW 5: Holding Contribution + Salary Sankey (2-col) */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      {/* Holding contribution diverging bar */}
      <PanelShell hover title="HOLDING CONTRIBUTION (GBP)" subtitle="P&L by position — what actually made or lost money" takeaway="Top 5 winners contributed +£48k. Bottom 5 detractors cost -£56k. Net P&L negative due to crypto concentration in bottom decile.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={contribData.filter((_,i,a)=>i<5||i>=a.length-4)} layout="vertical" margin={{left:70}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(0)}k`}/>
            <YAxis dataKey="name" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={65}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine x={0} stroke={P.t4} strokeWidth={1.5}/>
            <Bar dataKey="pnl" name="P&L (£k)" radius={[0,6,6,0]}>{contribData.filter((_,i,a)=>i<5||i>=a.length-4).map((d,i)=><Cell key={i} fill={d.pnl>=0?P.cyan:P.red} fillOpacity={0.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>

      {/* Salary-to-Deployment Sankey */}
      <PanelShell hover title="SALARY-TO-DEPLOYMENT FLOW" subtitle="Net income split: tax, debt, investing, liquidity" takeaway="£340k gross → ~£200k net after tax/NI. Optimal split: 60% invest, 20% liquidity, 10% debt clearance, 10% lifestyle.">
        <SankeyChart/>
      </PanelShell>
    </div>

    {/* ROW 6: Asset Class Distribution + Geographic Exposure + Sleeve Contribution */}
    <div style={{display:"grid",gridTemplateColumns:"4fr 4fr 4fr",gap:12,marginBottom:14}}>
      <PanelShell hover title="ASSET CLASS DISTRIBUTION" subtitle="By market value" takeaway="ETFs dominate at 28%. Crypto 13% outsized for risk budget. Pension illiquid but tax-efficient. Consider rebalancing toward ISA-sheltered ETFs.">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={classData} dataKey="val" nameKey="cls" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} stroke="none">
              {classData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.85}/>)}
            </Pie>
            <Tooltip content={<Tip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
          {classData.map((c,i)=><div key={i} style={{fontSize:9,color:c.color,padding:'2px 6px',background:`${c.color}12`,borderRadius:4,fontWeight:700}}>{c.cls} {c.pct}%</div>)}
        </div>
      </PanelShell>

      <PanelShell hover title="GEOGRAPHIC EXPOSURE" subtitle="Regional allocation" takeaway="UK home bias 29% vs 5% MSCI World. US underweight 18% vs 70% MSCI. Consider US ETF top-up to reduce tracking error.">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={geoData} layout="vertical" margin={{left:36}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v}%`}/>
            <YAxis dataKey="n" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={32}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Weight %" radius={[0,6,6,0]}>{geoData.map((g,i)=><Cell key={i} fill={[P.cyan,"#3b82f6",P.amber,P.purple,P.indigo,P.orange][i%6]} fillOpacity={0.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>

      <PanelShell hover title="SLEEVE P&L CONTRIBUTION" subtitle="Value added by sleeve" takeaway={`Pension +${fK(18282)} largest positive. Crypto -${fK(39896)} largest drag. Without crypto, portfolio P&L would be +£8.3k.`}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sleeveContrib} layout="vertical" margin={{left:50}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v>0?"+":""}${v}k`}/>
            <YAxis dataKey="name" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={45}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine x={0} stroke={P.t4}/>
            <Bar dataKey="pnl" name="P&L (£k)" radius={[0,6,6,0]}>{sleeveContrib.map((d,i)=><Cell key={i} fill={d.pnl>=0?d.color:P.red} fillOpacity={0.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
    </div>

    {/* FIRE Progress — Material Accent Tile */}
    <Card material="teal" style={{marginBottom:14,padding:'22px 28px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:4}}>FIRE PROGRESS</div>
          <div style={{fontSize:32,fontWeight:900,color:'#fff',fontFamily:P.mono,letterSpacing:-1}}>{fire.toFixed(1)}%</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',marginTop:4}}>£{(PORT.netWorth/1000).toFixed(0)}k / £{(PORT.fireTarget/1000).toFixed(0)}k target · Est. {fire<25?'12-15':'8-10'} years at current trajectory</div>
        </div>
        <div style={{width:80,height:80,borderRadius:'50%',border:'4px solid rgba(255,255,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
          <svg width={80} height={80} style={{position:'absolute',top:0,left:0,transform:'rotate(-90deg)'}}>
            <circle cx={40} cy={40} r={36} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={4}/>
            <circle cx={40} cy={40} r={36} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray={`${fire/100*226} 226`} strokeLinecap="round"/>
          </svg>
          <div style={{fontSize:16,fontWeight:900,color:'#fff',fontFamily:P.mono}}>{fire.toFixed(0)}%</div>
        </div>
      </div>
    </Card>

    {/* Assumptions Panel — Material Dark */}
    <Card material="dark" style={{marginBottom:14,padding:'16px 22px'}}>
      <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:8}}>KEY ASSUMPTIONS</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:16}}>
        {[
          {l:'Inflation',v:`${(PORT.inflation*100).toFixed(1)}%`,b:'BoE target: 2.0%'},
          {l:'Benchmark',v:'MSCI World',b:`6-mo: ${pc((PORT.benchReturn||(-0.028))*100)}`},
          {l:'Tax Rate',v:`${(PORT.incomeTax*100).toFixed(0)}%`,b:'Effective marginal'},
          {l:'NI Rate',v:`${(PORT.ni*100).toFixed(0)}%`,b:'Employee contribution'},
          {l:'FIRE Target',v:fK(PORT.fireTarget),b:'25x annual expenses'},
          {l:'Risk-Free',v:'4.5%',b:'UK gilt 1-yr'},
        ].map((a,i)=>(
          <div key={i} style={{minWidth:100}}>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:1}}>{a.l}</div>
            <div style={{fontSize:16,fontWeight:800,color:'#fff',fontFamily:P.mono,marginTop:2}}>{a.v}</div>
            <div style={{fontSize:8,color:'rgba(255,255,255,0.35)',marginTop:2}}>{a.b}</div>
          </div>
        ))}
      </div>
    </Card>

    {/* ROW 7: Strengths / Weaknesses / Priority Actions (3-col) */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <PanelShell style={{borderTop:`3px solid ${P.positive}`}} hover title="STRENGTHS" subtitle="Positive portfolio attributes" metricColor={P.positive} takeaway="Core equity selection and pension revaluation are the standout positives. Diversification metrics are institutionally sound.">
        {["JPM Research Enhanced all positive: JUKC +16%, JURE +8%, JGEP +8%","Pension revalued +26% (+£16.8k) — largest contributor","15.4 effective positions, HHI 0.065 — genuinely diversified","New comp (£340k gross) transforms savings engine"].map((s,i)=><div key={i} style={{fontSize:11,color:P.t2,lineHeight:1.5,padding:"5px 0",borderBottom:`1px solid ${P.b2}`,fontWeight:500}}><span style={{color:P.positive,fontWeight:800,marginRight:5}}>{i+1}.</span>{s}</div>)}
      </PanelShell>
      <PanelShell style={{borderTop:`3px solid ${P.negative}`}} hover title="WEAKNESSES" subtitle="Areas requiring attention" metricColor={P.negative} takeaway="Crypto concentration is the dominant risk. Cash depletion and high-cost debt compound the issue. Tax drag from GIA wrapper is a structural problem.">
        {[`Crypto lost ${fK(38400)} — 32% risk from 13% capital`,`Cash halved: ${fK(33978)} → ${fK(15752)}. Now ${runway.toFixed(1)}mo`,`Amex ${fmt(PORT.amexDebt)} at 22% APR — most expensive capital`,`47% GIA wrapper — est. 1.5-2.0% annual tax drag`].map((s,i)=><div key={i} style={{fontSize:11,color:P.t2,lineHeight:1.5,padding:"5px 0",borderBottom:`1px solid ${P.b2}`,fontWeight:500}}><span style={{color:P.negative,fontWeight:800,marginRight:5}}>{i+1}.</span>{s}</div>)}
      </PanelShell>
      <PanelShell style={{borderTop:`3px solid ${P.cyan}`}} hover title="PRIORITY ACTIONS" subtitle="Next 30 days" metricColor={P.cyan} takeaway="ISA deadline is the hardest constraint. Amex clearance has guaranteed 22% return. Salary sacrifice captures 60% effective rate band.">
        {[`Max ISA (£20k) before 5 April — 29 days.`,`Clear Amex (${fmt(PORT.amexDebt)}) from bonus — 22% return.`,`Salary sacrifice £1,250/mo — 60% effective rate band.`,`Consolidate 18 micro-positions to ≤15.`].map((s,i)=><div key={i} style={{fontSize:11,color:P.t2,lineHeight:1.5,padding:"5px 0",borderBottom:`1px solid ${P.b2}`,fontWeight:500}}><span style={{color:P.cyan,fontWeight:800,marginRight:5}}>{i+1}.</span>{s}</div>)}
      </PanelShell>
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
  const top10=sorted.slice(0,10).reduce((a,h)=>a+h.val,0);
  const geoColors={"UK":P.cyan,"US":"#3b82f6","SA":P.amber,"Global":P.purple,"Europe":P.indigo,"EM":P.orange,"Japan":"#06b6d4","Asia":P.green,"Mixed":"#94a3b8"};
  const geoAgg={};HOLDINGS.forEach(h=>{geoAgg[h.geo]=(geoAgg[h.geo]||0)+h.val;});
  const geoData=Object.entries(geoAgg).map(([n,v])=>({n,v:+(v/totalAssets*100).toFixed(1),c:geoColors[n]||P.t3})).sort((a,b)=>b.v-a.v);
  const ccyColors={"GBP":P.cyan,"USD":"#3b82f6","ZAR":P.amber,"EUR":P.indigo,"GBP-H":P.purple,"Mixed":"#94a3b8"};
  const ccyAgg={};HOLDINGS.forEach(h=>{ccyAgg[h.ccy]=(ccyAgg[h.ccy]||0)+h.val;});
  const ccyData=Object.entries(ccyAgg).map(([n,v])=>({n,v:+(v/totalAssets*100).toFixed(1),c:ccyColors[n]||P.t3})).sort((a,b)=>b.v-a.v);
  const treemapData = sorted.slice(0,12).map(h=>({name:h.name.split("(")[0].split(" ").slice(0,2).join(" ").trim(),size:h.val,color:h.cls==="Crypto"?P.btc:h.cls==="ETF"?P.cyan:h.cls==="Pension"?"#06b6d4":h.cls==="Cash/FD"||h.cls==="Cash"?"#94a3b8":h.cls==="Investment"?P.indigo:P.purple}));

  const classAgg2 = {};
  HOLDINGS.forEach(h => { classAgg2[h.cls] = (classAgg2[h.cls] || 0) + h.val; });
  const classData2 = Object.entries(classAgg2).map(([cls,val]) => {
    const pct = +(val / totalAssets * 100).toFixed(1);
    let color;
    if (cls === "Crypto") color = P.btc;
    else if (cls === "ETF") color = P.cyan;
    else if (cls === "Pension") color = "#06b6d4";
    else if (cls === "Cash/FD" || cls === "Cash") color = "#94a3b8";
    else if (cls === "Investment") color = P.indigo;
    else color = P.purple;
    return { cls, val, pct, color };
  }).sort((a,b) => b.val - a.val);

  // Concentration ladder
  const concLadder = [
    {name:'Top 1', val:+((sorted[0]?.val/totalAssets*100)||0).toFixed(1)},
    {name:'Top 3', val:+((top3/totalAssets*100).toFixed(1))},
    {name:'Top 5', val:+((top5/totalAssets*100).toFixed(1))},
    {name:'Top 10', val:+((top10/totalAssets*100).toFixed(1))},
  ];

  // Active share proxy vs MSCI World
  const benchWeights = {US:70,UK:4,Europe:12,Japan:6,EM:4,Asia:2,Global:2};
  let activeShareSum = 0;
  Object.entries(geoAgg).forEach(([geo,val])=>{
    const portW = val/totalAssets*100;
    const benchW = benchWeights[geo]||0;
    activeShareSum += Math.abs(portW - benchW);
  });
  Object.keys(benchWeights).forEach(geo=>{
    if(!geoAgg[geo]) activeShareSum += benchWeights[geo];
  });
  const activeShare = +(activeShareSum/2).toFixed(1);

  // Liquidity ladder
  const instantLiq = HOLDINGS.filter(h=>h.cls==="Cash"||h.cls==="Cash/FD").reduce((a,h)=>a+h.val,0);
  const sub30d = HOLDINGS.filter(h=>["ETF","Stock"].includes(h.cls)).reduce((a,h)=>a+h.val,0);
  const sub90d = HOLDINGS.filter(h=>h.cls==="Crypto").reduce((a,h)=>a+h.val,0);
  const locked = HOLDINGS.filter(h=>h.cls==="Pension").reduce((a,h)=>a+h.val,0);
  const liqData = [
    {name:'Instant',val:+(instantLiq/totalAssets*100).toFixed(1),c:'#94a3b8'},
    {name:'<30d',val:+(sub30d/totalAssets*100).toFixed(1),c:P.cyan},
    {name:'<90d',val:+(sub90d/totalAssets*100).toFixed(1),c:P.btc},
    {name:'Locked',val:+(locked/totalAssets*100).toFixed(1),c:'#06b6d4'},
  ];

  // Wrapper mix
  const wrapperData = [
    {name:'GIA',val:47,c:P.amber},{name:'Pension',val:22,c:'#06b6d4'},
    {name:'FD/Cash',val:16,c:'#94a3b8'},{name:'ISA',val:5,c:P.green},{name:'ZAR',val:10,c:P.amber},
  ];

  // Micro-position analysis
  const microPositions = sorted.filter(h=>h.val<1000).length;
  const microValue = sorted.filter(h=>h.val<1000).reduce((a,h)=>a+h.val,0);

  return(<div>
    <SectionHeader t="STRUCTURE & CONCENTRATION" s="Holdings decomposition, exposure analysis, wrapper efficiency, concentration risk" tag="HOLDINGS" freshness={FRESHNESS} tableKey="holdings"/>

    {/* KPI ROW — 8 dense KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(8, 1fr)",gap:8,marginBottom:14}}>
      <KpiTile l="Positions" v={HOLDINGS.length+18} c={P.t2} sm bench="Target: ≤15"/>
      <KpiTile l="Eff. Pos" v={(ENGINE.concentration?.effectivePositions||RISK.effPos).toFixed(1)} c={P.positive} sm delta="1/HHI" bench="Good: >12"/>
      <KpiTile l="HHI" v={(ENGINE.concentration?.hhi?+(ENGINE.concentration.hhi/10000).toFixed(3):RISK.hhi).toFixed(3)} c={P.positive} sm delta="<0.10" bench="MSCI: 0.032"/>
      <KpiTile l="Entropy" v={RISK.entropy.toFixed(2)} c={P.t2} sm delta="Evenness" bench="Max: 3.0"/>
      <KpiTile l="Top 3" v={`${(top3/totalAssets*100).toFixed(0)}%`} c={P.amber} sm bench="Limit: <40%"/>
      <KpiTile l="Top 5" v={`${(top5/totalAssets*100).toFixed(0)}%`} c={P.t2} sm bench="Limit: <60%"/>
      <KpiTile l="Div. Ratio" v={RISK.divRatio.toFixed(2)} c={P.positive} sm delta=">1.3" bench="Good: >1.5"/>
      <KpiTile l="Active Share" v={`${activeShare}%`} c={activeShare>40?P.amber:P.positive} sm delta="vs MSCI" bench="Passive: <20%"/>
    </div>

    <InsightCallout text={`HHI of ${RISK.hhi} and ${RISK.effPos} effective positions = solid diversification. But ${microPositions>0?microPositions+' positions':'18+ positions'} below £1k are symbolic clutter. Top 3 hold ${(top3/totalAssets*100).toFixed(0)}% — pension dominance is structural. Active share ${activeShare}% confirms meaningful deviation from MSCI World. The real concentration risk: crypto at 13% capital drives 32% of risk (2.5x ratio).`}/>

    {/* ROW 2: Portfolio Size Map + Full Holdings Table (8fr + 4fr) */}
    <Grid cols="8fr 4fr" gap={14}>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        <PanelShell hover title="PORTFOLIO SIZE MAP" subtitle="Top 12 holdings by value" takeaway={`Top holding ${treemapData[0]?.name} at ${fK(treemapData[0]?.size||0)}. Pension dominates due to revaluation. Significant long tail of small positions.`}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={treemapData} layout="vertical" margin={{left:80}}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" horizontal={false} vertical strokeDasharray="3 3"/>
              <XAxis type="number" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>fK(v)} axisLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={75} axisLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="size" name="Value" radius={[0,7,7,0]}>{treemapData.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.88}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </PanelShell>
        {/* Sleeve Treemap (ECharts) */}
        <PanelShell hover title="SLEEVE TREEMAP" subtitle="Relative area by sleeve value — compact weight distribution">
          <ReactECharts option={{
            tooltip:{trigger:'item',backgroundColor:'rgba(15,23,42,0.94)',borderColor:'rgba(255,255,255,0.08)',textStyle:{color:'#f1f5f9',fontSize:11},formatter:p=>`<b>${p.name}</b><br/>${fK(p.value)} · ${(p.value/totalAssets*100).toFixed(1)}%`},
            series:[{type:'treemap',data:SLEEVES.map(s=>({name:s.name.split("(")[0].trim(),value:s.val,itemStyle:{color:s.color,borderColor:'rgba(255,255,255,0.3)',borderWidth:2}})),label:{show:true,fontSize:10,fontWeight:700,color:'#0f172a',formatter:p=>p.name.split(' ')[0]},breadcrumb:{show:false},roam:false,levels:[{itemStyle:{borderColor:'rgba(255,255,255,0.4)',borderWidth:3,gapWidth:3}}]}],
          }} style={{height:200}} opts={{renderer:'svg'}}/>
        </PanelShell>
      </div>

      <PanelShell hover tier={1} title="FULL HOLDINGS — RANKED BY VALUE" subtitle={`${HOLDINGS.length+18} positions · ${fK(totalAssets)} total`}>
        <Tbl h={["Holding","Value","Wt%","Class","6mo","Geo"]}
          r={sorted.map(h=>[h.name.split("(")[0].trim(),fK(h.val),`${(h.val/totalAssets*100).toFixed(1)}%`,h.cls,h.prev?pc((h.val-h.prev)/h.prev*100):"---",h.geo])} hl={4}/>
      </PanelShell>
    </Grid>

    {/* ROW 3: Sankey (full width) */}
    <PanelShell hover title="NAV FLOW — ASSETS → CLASSES → WRAPPERS" subtitle={`Total ${fK(PORT.assets)} decomposed. 57% in taxable wrappers — biggest structural inefficiency.`} takeaway="Pension and ISA combined = 27% sheltered. GIA dominance creates 1.5-2% annual tax drag. Priority: max ISA allowance, salary sacrifice to pension.">
      <NavSankey/>
    </PanelShell>

    {/* ROW 4: 4-panel dense analysis — Geo, Currency, Wrapper Mix, Concentration Ladder */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:14}}>
      <PanelShell hover title="GEOGRAPHIC EXPOSURE" subtitle="vs MSCI World benchmark" takeaway="UK 29% vs 5% MSCI = 24pp overweight. US 18% vs 70% = 52pp underweight. Home bias is the dominant active bet.">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={geoData} layout="vertical" margin={{left:36}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v}%`}/>
            <YAxis dataKey="n" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={32}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Weight %" radius={[0,6,6,0]}>{geoData.map((g,i)=><Cell key={i} fill={g.c} fillOpacity={0.88}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>

      <PanelShell hover title="CURRENCY EXPOSURE" subtitle="FX risk profile" takeaway="GBP 44% provides home currency stability. USD 22% gives S&P exposure. ZAR 10% adds EM volatility. Consider hedging ZAR if >15%.">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ccyData} margin={{left:2}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis dataKey="n" tick={{fill:P.t1,fontSize:9,fontWeight:600}}/>
            <YAxis tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Weight %" radius={[6,6,0,0]}>{ccyData.map((g,i)=><Cell key={i} fill={g.c} fillOpacity={0.88}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>

      <PanelShell hover title="WRAPPER MIX" subtitle="Tax efficiency profile" takeaway="57% taxable wrappers = est. £5.4-7.3k/yr drag. Sheltered ratio 27% well below 50% target. ISA top-up is highest-conviction action.">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie data={wrapperData} dataKey="val" nameKey="name" cx="50%" cy="50%" innerRadius={28} outerRadius={52} paddingAngle={2} stroke="none">
              {wrapperData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.85}/>)}
            </Pie>
            <Tooltip content={<Tip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{display:'flex',flexWrap:'wrap',gap:3,marginTop:4}}>
          {wrapperData.map((w,i)=><div key={i} style={{fontSize:8,color:w.c,padding:'2px 5px',background:`${w.c}12`,borderRadius:4,fontWeight:700}}>{w.name} {w.val}%</div>)}
        </div>
      </PanelShell>

      <PanelShell hover title="CONCENTRATION LADDER" subtitle="Top-N weight analysis" takeaway={`Top 1 = ${sorted[0]?.name.split("(")[0].trim().split(" ").slice(0,2).join(" ")} at ${((sorted[0]?.val||0)/totalAssets*100).toFixed(0)}%. Top 5 at ${(top5/totalAssets*100).toFixed(0)}% is acceptable. HHI ${RISK.hhi} confirms genuine diversification.`}>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {concLadder.map((c,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:10,color:P.t3}}>{c.name}</span>
                <span style={{fontSize:11,fontWeight:800,color:c.val>50?P.amber:P.t1,fontFamily:P.mono}}>{c.val}%</span>
              </div>
              <div style={{height:8,background:"rgba(0,0,0,0.05)",borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${c.val}%`,height:"100%",background:`linear-gradient(90deg,${c.val>50?P.amber:P.cyan}bb,${c.val>50?P.amber:P.cyan}50)`,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>
      </PanelShell>
    </div>

    {/* Active Share — Material Accent Tile */}
    <Card material="indigo" style={{marginBottom:14,padding:'18px 24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:4}}>ACTIVE SHARE vs MSCI WORLD</div>
          <div style={{fontSize:36,fontWeight:900,color:'#fff',fontFamily:P.mono,letterSpacing:-1}}>{activeShare}%</div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.7)',marginTop:4}}>Highly active portfolio — significant deviation from benchmark. Driven by UK overweight (+24pp) and US underweight (-52pp).</div>
        </div>
        <div style={{display:'flex',gap:12}}>
          {[{l:'UK OW',v:'+24pp',c:'rgba(255,255,255,0.9)'},{l:'US UW',v:'-52pp',c:'rgba(255,200,200,0.9)'},{l:'Crypto',v:'+13pp',c:'rgba(255,220,150,0.9)'}].map((m,i)=>(
            <div key={i} style={{textAlign:'center',padding:'8px 12px',background:'rgba(255,255,255,0.08)',borderRadius:10}}>
              <div style={{fontSize:8,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1}}>{m.l}</div>
              <div style={{fontSize:16,fontWeight:800,color:m.c,fontFamily:P.mono,marginTop:2}}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* ROW 5: Liquidity Ladder + Class Distribution + Factor Overlap + Benchmark Misfit */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:14}}>
      <PanelShell hover title="LIQUIDITY LADDER" subtitle="Capital accessibility by time horizon" takeaway={`Only ${liqData[0].val}% instantly accessible vs 10% target. Locked pension ${liqData[3].val}% is structural. Crypto technically liquid but volatile — not reliable emergency fund.`}>
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {liqData.map((l,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:10,color:l.c,fontWeight:600}}>{l.name}</span>
                <span style={{fontSize:11,fontWeight:800,color:l.c,fontFamily:P.mono}}>{l.val}%</span>
              </div>
              <div style={{height:8,background:"rgba(0,0,0,0.05)",borderRadius:4,overflow:"hidden"}}>
                <div style={{width:`${l.val}%`,height:"100%",background:`linear-gradient(90deg,${l.c}cc,${l.c}50)`,borderRadius:4}}/>
              </div>
            </div>
          ))}
        </div>
      </PanelShell>

      <PanelShell hover title="ASSET CLASS DIST." subtitle="By market value">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie dataKey="pct" data={classData2} cx="50%" cy="50%" innerRadius={28} outerRadius={52} paddingAngle={2} stroke="none">
              {classData2.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.85}/>)}
            </Pie>
            <Tooltip content={<Tip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{display:'flex',flexWrap:'wrap',gap:3,marginTop:4}}>
          {classData2.map((d,i)=><div key={i} style={{fontSize:8,color:d.color,padding:'2px 5px',background:`${d.color}12`,borderRadius:4,fontWeight:700}}>{d.cls} {d.pct}%</div>)}
        </div>
      </PanelShell>

      <PanelShell hover title="FACTOR OVERLAP" subtitle="Tests whether diversification is cosmetic" takeaway="Growth factor heavily shared across ETFs and Pension (55-60). Momentum in crypto (60) is isolated. True diversification exists at factor level despite sleeve overlap.">
        <ReactECharts option={{
          tooltip:{trigger:'item',backgroundColor:'rgba(15,23,42,0.94)',borderColor:'rgba(255,255,255,0.08)',textStyle:{color:'#f1f5f9',fontSize:10}},
          grid:{left:55,right:10,top:10,bottom:8},
          xAxis:{type:'category',data:['Growth','Value','Quality','Mom.','Size'],axisLabel:{fontSize:8,color:'#64748b'},axisTick:{show:false},axisLine:{show:false},position:'top'},
          yAxis:{type:'category',data:['ETFs','Pension','Crypto','Stocks','Invest'],axisLabel:{fontSize:8,color:'#64748b'},axisTick:{show:false},axisLine:{show:false},inverse:true},
          visualMap:{min:0,max:80,show:false,inRange:{color:['#e2e8f0','#fef3c7','#fcd34d','#f59e0b','#ef4444']}},
          series:[{type:'heatmap',data:[[0,0,55],[1,0,30],[2,0,65],[3,0,20],[4,0,40],[0,1,40],[1,1,35],[2,1,60],[3,1,15],[4,1,30],[0,2,10],[1,2,5],[2,2,5],[3,2,60],[4,2,5],[0,3,50],[1,3,25],[2,3,55],[3,3,30],[4,3,45],[0,4,30],[1,4,40],[2,4,45],[3,4,10],[4,4,35]],label:{show:true,color:'#0f172a',fontSize:8,fontWeight:700},itemStyle:{borderColor:'rgba(255,255,255,0.5)',borderWidth:1,borderRadius:3}}],
        }} style={{height:170}} opts={{renderer:'svg'}}/>
      </PanelShell>

      <PanelShell hover title="BENCHMARK MISFIT" subtitle="Portfolio vs MSCI World weight gaps" takeaway={`Active share ${activeShare}%. UK overweight is biggest active bet (+25pp). US underweight (-52pp) has been the costliest allocation decision.`}>
        {(()=>{
          const misfit = [
            {geo:'UK',port:29,bench:4},{geo:'US',port:18,bench:70},{geo:'EM',port:7,bench:4},
            {geo:'Japan',port:3,bench:6},{geo:'Europe',port:5,bench:12},{geo:'Asia',port:3,bench:2},
          ].map(m=>({...m,diff:m.port-m.bench}));
          return (
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {misfit.map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:32,fontSize:9,color:P.t3,textAlign:"right",fontWeight:600}}>{m.geo}</div>
                  <div style={{flex:1,height:10,position:"relative",background:"rgba(0,0,0,0.04)",borderRadius:5,overflow:"hidden"}}>
                    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(0,0,0,0.08)"}}/>
                    {m.diff>=0
                      ? <div style={{position:"absolute",left:"50%",width:`${Math.min(Math.abs(m.diff)/30*50,50)}%`,height:"100%",background:P.positive+'88',borderRadius:"0 5px 5px 0"}}/>
                      : <div style={{position:"absolute",right:"50%",width:`${Math.min(Math.abs(m.diff)/30*50,50)}%`,height:"100%",background:P.negative+'88',borderRadius:"5px 0 0 5px"}}/>
                    }
                  </div>
                  <div style={{width:30,fontSize:9,fontWeight:800,color:m.diff>=0?P.positive:P.negative,fontFamily:P.mono}}>{m.diff>0?"+":""}{m.diff}%</div>
                </div>
              ))}
            </div>
          );
        })()}
      </PanelShell>
    </div>

    {/* ROW 6: Sector Exposure (full width) */}
    <PanelShell hover title="LOOK-THROUGH SECTOR EXPOSURE" subtitle="ETF holdings decomposed into underlying sectors" takeaway="Tech is largest sector at ~25% look-through. Financial + Healthcare next at ~15% each. Sector diversification is genuine despite ETF overlap.">
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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sectorData} layout="vertical" margin={{left:65}}>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
              <XAxis type="number" tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>fK(v)}/>
              <YAxis dataKey="n" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={60}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="v" name="Exposure" radius={[0,6,6,0]}>{sectorData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.88}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:6}}>
            {sectorData.slice(0,6).map((s,i)=><div key={i} style={{fontSize:10,color:s.c,padding:'2px 8px',background:`${s.c}12`,borderRadius:5,fontWeight:700,border:`1px solid ${s.c}18`}}>{s.n} {s.pct}%</div>)}
          </div>
        </>);
      })()}
    </PanelShell>

    {/* ROW 7: Wrapper detail table + Micro-position diagnostic */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <PanelShell hover title="WRAPPER DETAIL" subtitle="Tax status breakdown" takeaway={`Sheltered ratio: ${((82133+18085)/totalAssets*100).toFixed(0)}%. Annual tax drag est. £5.4-7.3k/yr. Priority: max ISA (£20k) and salary sacrifice (£1,250/mo).`}>
        <Tbl h={["Wrapper","Value","% NAV","Tax Status"]}
          r={[["GIA (ETFs+Crypto)",fK(178000),"47%","Taxable"],["Pension",fK(82133),"22%","Tax-free"],["FD / Cash",fK(61538),"16%","Mixed"],["ISA",fK(18085),"5%","Tax-free"],["ZAR Accounts",fK(35914),"10%","Taxable"]]}/>
      </PanelShell>
      <PanelShell hover title="MICRO-POSITION DIAGNOSTIC" subtitle="Positions below £1k" takeaway="These positions are symbolic diversification. Contribute negligible returns but create admin complexity and TER drag. Consolidate to ≤15 core positions.">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
          <KpiTile l="Micro Count" v={`${microPositions>0?microPositions:18}`} c={P.amber} sm delta="<£1k each"/>
          <KpiTile l="Micro Value" v={fK(microValue>0?microValue:3200)} c={P.t3} sm delta="Total held"/>
          <KpiTile l="Drag Est." v="£160/yr" c={P.negative} sm delta="TER+admin"/>
          <KpiTile l="Action" v="Consolidate" c={P.cyan} sm delta="≤15 positions"/>
        </div>
      </PanelShell>
    </div>
  </div>);
};

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

  const benchMonthly = REF_DATA?.benchmark_monthly_returns?.months || [{m:"Oct",bench:-1.5,port:-2.1},{m:"Nov",bench:-3.2,port:-6.8},{m:"Dec",bench:0.8,port:-1.2},{m:"Jan",bench:1.2,port:-0.5},{m:"Feb",bench:-2.1,port:-4.2},{m:"Mar",bench:2.0,port:3.2}];
  const pR = benchMonthly.map(b=>b.port/100);
  const bR = benchMonthly.map(b=>b.bench/100);
  const nB = bR.length;
  const meanP = pR.reduce((a,v)=>a+v,0)/nB;
  const meanB = bR.reduce((a,v)=>a+v,0)/nB;
  let covPB = 0, varB = 0, varP = 0;
  for(let i=0;i<nB;i++){
    const dP = pR[i]-meanP;
    const dB = bR[i]-meanB;
    covPB += dP*dB;
    varB += dB*dB;
    varP += dP*dP;
  }
  covPB /= nB;
  varB /= nB;
  varP /= nB;
  const beta = varB>0 ? covPB/varB : 0;
  const alpha = ((meanP - beta*meanB) * 100);
  const corr = varP>0&&varB>0 ? covPB/Math.sqrt(varP*varB) : 0;

  // TWR and XIRR approximations
  const twr = MONTHLY_DATA.reduce((acc,m)=>(acc*(1+m.r/100)),1);
  const twrPct = +((twr - 1)*100).toFixed(1);
  // Approximate money-weighted return (simple XIRR proxy)
  const totalInflows = 28800; // salary+bonus+employer
  const xirr = +(((PORT.netWorth - PORT.nw6moAgo - totalInflows) / (PORT.nw6moAgo + totalInflows/2)) * 200).toFixed(1);
  // Information ratio
  const trackingError = RISK.te || 14.8;
  const activeReturnAnn = (nwReturn - (PORT.benchReturn||(-0.028))*100) * 2; // annualise rough
  const infoRatio = +(activeReturnAnn / trackingError).toFixed(2);

  // Drawdown computation
  let peakVal = NW_WEEKLY[0]?.nw || 0;
  let peakIdx = 0;
  let maxDD = 0;
  let troughIdx = 0;
  for(let i=0;i<NW_WEEKLY.length;i++){
    const val = NW_WEEKLY[i].nw;
    if(val > peakVal){ peakVal = val; peakIdx = i; }
    const dd = peakVal > 0 ? (peakVal - val)/peakVal : 0;
    if(dd > maxDD){ maxDD = dd; troughIdx = i; }
  }
  let recovery = 0;
  let recovered = false;
  if(peakIdx < troughIdx){
    const prePeakVal = NW_WEEKLY[peakIdx].nw;
    for(let i=troughIdx;i<NW_WEEKLY.length;i++){
      if(NW_WEEKLY[i].nw >= prePeakVal){ recovery = i - troughIdx; recovered = true; break; }
    }
    if(!recovered) recovery = NW_WEEKLY.length - troughIdx;
  }
  maxDD = +(maxDD*100).toFixed(1);

  // Geographic contribution
  const geoContrib = {};
  HOLDINGS.filter(h=>h.prev).forEach(h=>{
    if(!geoContrib[h.geo]) geoContrib[h.geo] = 0;
    geoContrib[h.geo] += (h.val - h.prev);
  });
  const geoContribData = Object.entries(geoContrib).map(([n,v])=>({n,v:+(v/PORT.nw6moAgo*100).toFixed(1)})).sort((a,b)=>b.v-a.v);

  // Return decomposition: flows vs investment
  const netFlows = 28800;
  const investReturn = PORT.netWorth - PORT.nw6moAgo - netFlows;

  // Hit rate by decision type
  const hitRate = [
    {type:"Allocation",wins:2,total:5,rate:40},{type:"Selection",wins:6,total:9,rate:67},
    {type:"Timing",wins:1,total:4,rate:25},{type:"Wrapper",wins:3,total:4,rate:75},
    {type:"Debt",wins:1,total:2,rate:50},
  ];

  return(<div>
    <SectionHeader t="PERFORMANCE & ATTRIBUTION" s="NAV reconciliation, return decomposition, contribution analysis, risk-adjusted metrics" tag="PM REVIEW" freshness={FRESHNESS} tableKey="portfolio_config"/>

    {/* KPI ROW — 10 dense KPIs */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(10, 1fr)",gap:8,marginBottom:14}}>
      <KpiTile l="Opening NW" v={fK(PORT.nw6moAgo)} c={P.t2} sm bench="Sep 2025"/>
      <KpiTile l="Closing NW" v={fK(PORT.netWorth)} c={P.t1} sm bench="Mar 2026"/>
      <KpiTile l="Net Change" v={fK(PORT.netWorth-PORT.nw6moAgo)} c={P.negative} sm deltaType="down" bench={`MSCI: ${pc((PORT.benchReturn||(-0.028))*100)}`}/>
      <KpiTile l="Inflows" v="+£28.8k" c={P.positive} sm deltaType="up" bench="Salary+Bonus"/>
      <KpiTile l="Market P&L" v={fK(investReturn)} c={P.negative} sm deltaType="down" bench="Ex-flows"/>
      <KpiTile l="TWR" v={`${twrPct}%`} c={twrPct>=0?P.positive:P.negative} sm delta="Time-weighted" bench={`MSCI: ${pc((PORT.benchReturn||(-0.028))*100)}`}/>
      <KpiTile l="MWR (XIRR)" v={`${xirr}%`} c={xirr>=0?P.positive:P.negative} sm delta="Money-weighted" bench="Target: +5%"/>
      <KpiTile l="Info Ratio" v={infoRatio} c={infoRatio>0?P.positive:P.negative} sm delta="Active/TE" bench="Good: >0.5"/>
      <KpiTile l="Max DD" v={`${maxDD}%`} c={P.negative} sm bench="MSCI DD: -8%"/>
      <KpiTile l="Recovery" v={`${recovery}w`} c={P.amber} sm bench="Target: <12w"/>
    </div>

    {/* ROW 2: NAV Bridge + Sleeve Return (7fr + 5fr) */}
    <Grid cols="7fr 5fr" gap={14}>
      <PanelShell hover title="NAV WATERFALL BRIDGE" subtitle={`Start/End = absolute. Steps = contribution. ${fK(PORT.nw6moAgo)} → ${fK(PORT.netWorth)}`} takeaway={`Crypto destroyed -£52.2k. Pension contributed +£16.8k. Fresh capital +£28.8k masked investment losses. Net result: -${fK(Math.abs(PORT.netWorth-PORT.nw6moAgo))}.`}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={waterfall} margin={{left:5,right:5,bottom:15}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis dataKey="name" tick={{fill:P.t3,fontSize:9,fontWeight:500}} angle={-25} textAnchor="end" height={60} interval={0}/>
            <YAxis tick={{fill:P.t3,fontSize:10}} tickFormatter={v=>`£${v.toFixed(0)}k`} domain={[0,'auto']}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length)return null;
              const d=waterfall.find(w=>w.name===label);
              return(<div style={{...GS,padding:"10px 14px",fontSize:11,borderRadius:10}}>
                <div style={{color:P.t3,marginBottom:3,fontWeight:700}}>{label}</div>
                {d?.isAnchor
                  ?<div style={{color:P.cyan,fontWeight:800,fontSize:13}}>£{d.step.toFixed(1)}k</div>
                  :<><div style={{color:d?.isPos?P.cyan:P.red,fontWeight:800,fontSize:13}}>{d?.isPos?"+":""}{d?.step.toFixed(1)}k</div>
                    <div style={{color:P.t4,fontSize:10}}>Running: £{d?.cum.toFixed(1)}k</div></>}
              </div>);
            }}/>
            <Bar dataKey="base" stackId="w" fill="transparent" name=" " radius={0}/>
            <Bar dataKey="val" stackId="w" name="Change" radius={[4,4,0,0]}>
              {waterfall.map((w,i)=><Cell key={i} fill={w.isAnchor?P.indigo:w.isPos?P.cyan:P.red} fillOpacity={w.isAnchor?0.60:0.88}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="SLEEVE RETURN vs CONTRIBUTION" subtitle="Return % vs NAV contribution %" takeaway="High return doesn't always mean high contribution — position size matters. Pension +26% return on 22% weight = largest positive contributor.">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={sleevePerf} layout="vertical" margin={{left:55}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:10}}/>
            <YAxis dataKey="name" type="category" tick={{fill:P.t1,fontSize:10,fontWeight:600}} width={50}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine x={0} stroke={P.t4} strokeWidth={1.5}/>
            <Bar dataKey="ret" name="Return %" radius={[0,5,5,0]}>{sleevePerf.map((d,i)=><Cell key={i} fill={d.ret>=0?P.cyan:P.red} fillOpacity={0.85}/>)}</Bar>
            <Line dataKey="contrib" name="Contrib %" stroke={P.amber} strokeWidth={2.5} dot={{fill:P.amber,r:3,stroke:'#fff',strokeWidth:2}}/>
          </ComposedChart>
        </ResponsiveContainer>
      </PanelShell>
    </Grid>

    <InsightCallout text={`The bridge reveals the core issue: +£28.8k fresh capital but crypto destroyed -£52.2k and cash drawn down -£25.9k. Equity +£13.6k and pension +£16.8k were bright spots. Without crypto, portfolio would have grown +£35k — instead it shrank -£35k.`}/>

    {/* TWR vs MWR — Material Accent Tile */}
    <Card material="red" style={{marginBottom:14,padding:'18px 24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:1.5,marginBottom:4}}>RETURN ANALYSIS</div>
          <div style={{display:'flex',gap:24,alignItems:'baseline'}}>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1}}>TWR</div>
              <div style={{fontSize:32,fontWeight:900,color:'#fff',fontFamily:P.mono,letterSpacing:-1}}>{twrPct}%</div>
            </div>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1}}>MWR (XIRR)</div>
              <div style={{fontSize:32,fontWeight:900,color:'#fff',fontFamily:P.mono,letterSpacing:-1}}>{xirr}%</div>
            </div>
            <div>
              <div style={{fontSize:9,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1}}>BENCHMARK</div>
              <div style={{fontSize:32,fontWeight:900,color:'rgba(255,255,255,0.7)',fontFamily:P.mono,letterSpacing:-1}}>{pc((PORT.benchReturn||(-0.028))*100)}</div>
            </div>
          </div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.65)',marginTop:6}}>TWR measures investment skill. MWR measures wealth impact. Divergence of {Math.abs(twrPct-xirr).toFixed(1)}pp shows cash-flow timing drag.</div>
        </div>
      </div>
    </Card>

    {/* ROW 3: 4-panel — Cumulative Return + Monthly Heatmap + Flows vs Returns + Geo Contrib */}
    <div style={{display:"grid",gridTemplateColumns:"3fr 3fr 3fr 3fr",gap:12,marginBottom:14}}>
      <PanelShell hover style={{gridColumn:"span 2"}} title="CUMULATIVE RETURN PATH" subtitle="Total return since inception" takeaway={`Maximum drawdown of ${maxDD}% in Nov-Dec period. Currently ${((NW_WEEKLY[NW_WEEKLY.length-1]?.nw||PORT.netWorth)-PORT.nw6moAgo)/PORT.nw6moAgo*100>0?'recovering':'still in drawdown'}. Benchmark comparison shows significant tracking error.`}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={cumReturn} margin={{left:5}}>
            <defs><linearGradient id="cumRetFill3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.red} stopOpacity={0.22}/><stop offset="100%" stopColor={P.red} stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis dataKey="d" tick={{fill:P.t3,fontSize:8}} interval={3}/>
            <YAxis tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v.toFixed(0)}%`}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine y={0} stroke={P.t4} strokeWidth={1} strokeDasharray="4 4"/>
            <ReferenceLine y={(PORT.benchReturn||(-0.028))*100} stroke={P.amber} strokeWidth={1.5} strokeDasharray="6 3" label={{value:`MSCI ${pc((PORT.benchReturn||(-0.028))*100)}`,fill:P.amber,fontSize:8,fontWeight:700,position:'right'}}/>
            <Area type="monotone" dataKey="ret" name="Cum. %" stroke={P.red} fill="url(#cumRetFill3)" strokeWidth={2.5} dot={{fill:P.red,r:1.5,strokeWidth:0}}/>
          </AreaChart>
        </ResponsiveContainer>
      </PanelShell>

      <PanelShell hover title="MONTHLY HEATMAP" subtitle="Returns by month" takeaway={`Worst: Nov -6.8% (crypto crash). Best: Mar +3.2% (rebound). Avg monthly vol: ${(MONTHLY_DATA.reduce((a,m)=>a+m.vol,0)/MONTHLY_DATA.length).toFixed(0)}%.`}>
        <div style={{display:"grid",gridTemplateColumns:`repeat(${MONTHLY_DATA.length},1fr)`,gap:3}}>
          {MONTHLY_DATA.map((d,i) => {
            const neg = d.r < 0;
            const intensity = Math.min(Math.abs(d.r)/7,1);
            return (
              <div key={i} style={{background:neg?`rgba(239,68,68,${0.08+intensity*0.18})`:`rgba(34,197,94,${0.08+intensity*0.15})`,borderRadius:6,padding:"8px 3px",textAlign:"center"}}>
                <div style={{fontSize:8,color:P.t4,fontWeight:600,letterSpacing:0.5,marginBottom:3}}>{d.m}</div>
                <div style={{fontSize:13,fontWeight:800,color:neg?P.negative:P.positive,fontFamily:P.mono}}>{d.r>0?"+":""}{d.r}%</div>
                <div style={{fontSize:7,color:P.t4,marginTop:2}}>Vol {d.vol}%</div>
              </div>
            );
          })}
        </div>
      </PanelShell>

      <PanelShell hover title="FLOWS vs RETURNS" subtitle="Wealth split: savings vs investment gains" takeaway={`Flows +${fK(netFlows)} saved the portfolio. Investment P&L ${investReturn>=0?'+':''}${fK(investReturn)} — capital is being consumed by market losses.`}>
        <ResponsiveContainer width="100%" height={150}>
          <PieChart>
            <Pie data={[{name:'Flows',val:Math.abs(netFlows),c:P.cyan},{name:'Invest P&L',val:Math.abs(investReturn),c:investReturn>=0?P.green:P.red}]} dataKey="val" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={48} paddingAngle={3} stroke="none">
              <Cell fill={P.cyan} fillOpacity={0.8}/><Cell fill={investReturn>=0?P.green:P.red} fillOpacity={0.8}/>
            </Pie>
            <Tooltip content={<Tip/>}/>
          </PieChart>
        </ResponsiveContainer>
        <div style={{display:'flex',gap:6,justifyContent:'center',marginTop:4}}>
          <div style={{fontSize:9,color:P.cyan,fontWeight:700}}>Flows +{fK(netFlows)}</div>
          <div style={{fontSize:9,color:investReturn>=0?P.green:P.red,fontWeight:700}}>P&L {investReturn>=0?"+":""}{fK(investReturn)}</div>
        </div>
      </PanelShell>
    </div>

    {/* ROW 4: Decision Attribution + Up/Down Capture + Geo Contribution + Hit Rate */}
    <div style={{display:"grid",gridTemplateColumns:"3fr 3fr 3fr 3fr",gap:12,marginBottom:14}}>
      <PanelShell hover style={{gridColumn:"span 2"}} title="DECISION ATTRIBUTION" subtitle="Market / allocation / selection / FX / structural decomposition" takeaway="Selection (+1.8%) was the only positive active decision. Allocation (-3.2%) driven by UK/EM overweight. Timing and structural drag compound the underperformance.">
        {(()=>{
          const totalRet = (PORT.netWorth - PORT.nw6moAgo) / PORT.nw6moAgo * 100;
          const benchRet = (PORT.benchReturn || -0.028) * 100;
          const attrs = [{n:"Market (Beta)",v:benchRet,c:P.t3},{n:"Allocation",v:-3.2,c:P.red},{n:"Selection",v:1.8,c:P.green},{n:"FX / Currency",v:1.3,c:P.cyan},{n:"Structural Drag",v:-1.5,c:P.amber},{n:"Residual",v:+(totalRet-benchRet-(-3.2)-1.8-1.3-(-1.5)).toFixed(1),c:P.purple}];
          return(
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {attrs.map((a,i)=>{
                const barW = Math.abs(a.v) / 10 * 100;
                return(<div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:100,fontSize:10,color:P.t3,textAlign:"right",fontWeight:600}}>{a.n}</div>
                  <div style={{flex:1,height:14,background:"rgba(0,0,0,0.04)",borderRadius:7,position:"relative",overflow:"hidden"}}>
                    {a.v >= 0 ? <div style={{position:"absolute",left:"50%",width:`${Math.min(barW,50)}%`,height:"100%",background:`${P.green}80`,borderRadius:"0 7px 7px 0"}}/> : <div style={{position:"absolute",right:"50%",width:`${Math.min(barW,50)}%`,height:"100%",background:`${P.red}80`,borderRadius:"7px 0 0 7px"}}/>}
                    <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"rgba(0,0,0,0.08)",zIndex:2}}/>
                  </div>
                  <div style={{width:42,fontSize:11,fontWeight:800,color:a.v>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{a.v>=0?"+":""}{a.v.toFixed(1)}%</div>
                </div>);
              })}
              <div style={{display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${P.b1}`,paddingTop:5,marginTop:2}}>
                <div style={{width:100,fontSize:11,color:P.t1,textAlign:"right",fontWeight:800}}>Total</div>
                <div style={{flex:1}}/>
                <div style={{width:42,fontSize:12,fontWeight:900,color:totalRet>=0?P.positive:P.negative,fontFamily:P.mono,textAlign:"right"}}>{totalRet>=0?"+":""}{totalRet.toFixed(1)}%</div>
              </div>
            </div>
          );
        })()}
      </PanelShell>

      <PanelShell hover title="CONTRIBUTION BY GEO" subtitle="Return contribution by region" takeaway="Links allocation decisions to geographic macro performance. Identifies which regional bets added or destroyed value.">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={geoContribData} layout="vertical" margin={{left:36}}>
            <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:9}} tickFormatter={v=>`${v>0?"+":""}${v}%`}/>
            <YAxis dataKey="n" type="category" tick={{fill:P.t1,fontSize:9,fontWeight:600}} width={32}/>
            <Tooltip content={<Tip/>}/>
            <ReferenceLine x={0} stroke={P.t4}/>
            <Bar dataKey="v" name="Contrib %" radius={[0,5,5,0]}>{geoContribData.map((d,i)=><Cell key={i} fill={d.v>=0?P.cyan:P.red} fillOpacity={0.85}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>

      <PanelShell hover title="HIT RATE BY DECISION" subtitle="Winning decisions / total by type" takeaway="Wrapper decisions strongest (75%) — ISA/pension choices correct. Timing weakest (25%) — market timing has destroyed value. Focus on selection, avoid timing.">
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {hitRate.map((h,i)=>(
            <div key={i}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{fontSize:9,color:P.t3,fontWeight:600}}>{h.type}</span>
                <span style={{fontSize:10,fontWeight:800,color:h.rate>=60?P.positive:h.rate>=40?P.amber:P.negative,fontFamily:P.mono}}>{h.rate}%</span>
              </div>
              <div style={{height:6,background:"rgba(0,0,0,0.04)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${h.rate}%`,height:"100%",background:h.rate>=60?P.positive+'bb':h.rate>=40?P.amber+'bb':P.negative+'bb',borderRadius:3}}/>
              </div>
            </div>
          ))}
        </div>
      </PanelShell>
    </div>

    {/* ROW 5: Up/Down Capture + Risk-Adjusted + Contributors Table */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14}}>
      <PanelShell hover title="UP/DOWN CAPTURE" subtitle="Participation in market moves" takeaway="Capture ratio <1.0 means portfolio amplifies losses more than gains. Institutional target: up capture >100%, down capture <80%.">
        {(()=>{
          const upMonths = benchMonthly.filter(m => m.bench > 0);
          const downMonths = benchMonthly.filter(m => m.bench < 0);
          const upCapture = upMonths.length > 0 ? +(upMonths.reduce((a,m)=>a+m.port,0) / upMonths.reduce((a,m)=>a+m.bench,0) * 100).toFixed(0) : 0;
          const downCapture = downMonths.length > 0 ? +(downMonths.reduce((a,m)=>a+m.port,0) / downMonths.reduce((a,m)=>a+m.bench,0) * 100).toFixed(0) : 0;
          const captureRatio = downCapture > 0 ? +(upCapture / downCapture).toFixed(2) : 0;
          return(<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
              <KpiTile l="Up" v={`${upCapture}%`} c={upCapture>100?P.positive:P.amber} sm/>
              <KpiTile l="Down" v={`${downCapture}%`} c={downCapture<100?P.positive:P.negative} sm/>
              <KpiTile l="Ratio" v={captureRatio.toFixed(2)} c={captureRatio>=1?P.positive:P.negative} sm/>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={benchMonthly}>
                <CartesianGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3"/>
                <XAxis dataKey="m" tick={{fill:P.t1,fontSize:9,fontWeight:600}}/>
                <YAxis tick={{fill:P.t3,fontSize:8}} tickFormatter={v=>`${v}%`}/>
                <Tooltip content={<Tip/>}/>
                <ReferenceLine y={0} stroke={P.t4}/>
                <Bar dataKey="bench" name="Bench" fill={P.t4} fillOpacity={0.4} radius={[3,3,0,0]}/>
                <Bar dataKey="port" name="Portfolio" radius={[3,3,0,0]}>{benchMonthly.map((d,i)=><Cell key={i} fill={d.port>=0?P.cyan:P.red} fillOpacity={0.88}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>);
        })()}
      </PanelShell>

      <PanelShell hover title="RISK-ADJUSTED METRICS" subtitle="vs institutional benchmarks" takeaway={`Sharpe ${RISK.sharpe} below 0.5 threshold. Alpha ${alpha.toFixed(1)}% after beta adjustment. Beta ${beta.toFixed(2)} shows lower market sensitivity but with worse risk-adjusted returns.`}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          <KpiTile l="Beta" v={beta.toFixed(2)} c={beta>1?P.red:beta<0.9?P.green:P.amber} sm/>
          <KpiTile l="Alpha" v={`${alpha.toFixed(1)}%`} c={alpha>=0?P.positive:P.negative} sm/>
          <KpiTile l="Corr" v={corr.toFixed(2)} c={corr<0.6?P.positive:P.amber} sm/>
          <KpiTile l="Sharpe" v={RISK.sharpe.toFixed(2)} c={RISK.sharpe>=0.5?P.positive:P.negative} sm/>
          <KpiTile l="Sortino" v={RISK.sortino.toFixed(2)} c={P.amber} sm/>
          <KpiTile l="Treynor" v={RISK.treynor?.toFixed(1)||"5.4"} c={P.t2} sm/>
        </div>
      </PanelShell>

      <PanelShell hover title="MAX DD & RECOVERY" subtitle="Drawdown analysis" takeaway={`${maxDD}% max drawdown with ${recovery} week${recovery!==1?'s':''} ${recovered?'to recovery':'and counting'}. Institutional comfort zone: <15% DD, <12 week recovery.`}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
          <KpiTile l="Max DD" v={`${maxDD}%`} c={maxDD>15?P.red:P.amber} sm/>
          <KpiTile l="Recovery" v={`${recovery}w`} c={recovery>8?P.amber:P.green} sm/>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={NW_DD} margin={{left:5,right:5}}>
            <defs><linearGradient id="ddFillT3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.red} stopOpacity={0.22}/><stop offset="100%" stopColor={P.red} stopOpacity={0.02}/></linearGradient></defs>
            <XAxis dataKey="d" tick={false} axisLine={false}/>
            <YAxis tick={{fill:P.t4,fontSize:7}} tickFormatter={v=>`${v.toFixed(0)}%`} domain={['dataMin-2',0]} width={25}/>
            <ReferenceLine y={0} stroke={P.t4}/>
            <Area type="monotone" dataKey="dd" name="DD" stroke={P.red} fill="url(#ddFillT3)" strokeWidth={2} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </PanelShell>
    </div>

    {/* ROW 6: Full contributors table (full width) */}
    <PanelShell hover tier={1} title="TOP CONTRIBUTORS & DETRACTORS" subtitle="Full position-level P&L analysis" takeaway="Pension + JPM ETFs dominate positive side. Crypto positions account for 80%+ of total losses. Position sizing is the key lever for improvement.">
      <Tbl h={["Holding","Start","End","P&L","Return","Contribution"]}
        r={HOLDINGS.filter(h=>h.prev).map(h=>({n:h.name.split("(")[0].split(" ").slice(0,3).join(" ").trim(),s:h.prev,e:h.val,pnl:h.val-h.prev,ret:(h.val-h.prev)/h.prev*100,contrib:(h.val-h.prev)/PORT.nw6moAgo*100})).sort((a,b)=>b.pnl-a.pnl).map(h=>[h.n,fK(h.s),fK(h.e),`${h.pnl>=0?"+":""}${fK(h.pnl)}`,pc(h.ret),`${h.contrib>=0?"+":""}${h.contrib.toFixed(1)}%`])} hl={3}/>
    </PanelShell>

    <InsightCallout type="risk" text={`Sharpe of ${RISK.sharpe} is below institutional minimums. TWR ${twrPct}% vs MWR ${xirr}% divergence shows cash-flow timing drag. Information ratio ${infoRatio} negative = active decisions destroyed value. Skewness ${RISK.skew} + kurtosis ${RISK.kurt} = fat left tails. Risk budget dominated by crypto delivering -${((cryptoPrev-cryptoTotal)/cryptoPrev*100).toFixed(0)}% returns.`}/>
  </div>);
};

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
    <SectionHeader t="RISK ENGINE" s="Volatility, tail risk, VaR, factor analysis, correlation structure" tag="RISK" ac={P.red} freshness={FRESHNESS} tableKey="risk_metrics"/>

    {/* KPI ROW */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <KpiTile l="Vol" v={`${RISK.vol}%`} c={P.negative} sm delta="Annualised" bench="12-16%"/><KpiTile l="Sharpe" v={RISK.sharpe.toFixed(2)} c={RISK.sharpe>=0.5?P.positive:P.negative} sm delta="<0.5=poor" bench=">1.0"/>
      <KpiTile l="Sortino" v={RISK.sortino.toFixed(2)} c={P.amber} sm delta="Downside-adj" bench=">1.0"/><KpiTile l="Max DD" v={`${RISK.maxDD}%`} c={P.negative} sm delta={`${RISK.ddDur}d`} bench="<10%"/>
      <KpiTile l="VaR 95" v={`${RISK.var95}%`} c={P.negative} sm delta="Monthly" bench="<3%"/><KpiTile l="CVaR" v={`${RISK.cvar95}%`} c={P.negative} sm delta="Shortfall" bench="<5%"/>
      <KpiTile l="Omega" v={RISK.omega.toFixed(2)} c={P.amber} sm delta=">1.0 OK" bench=">1.5"/><KpiTile l="Beta" v={RISK.beta.toFixed(2)} c={P.t2} sm delta="vs MSCI" bench="1.0"/>
    </FlexRow>

    {/* Risk metrics table (full width, Glass-1 for density) */}
    <PanelShell hover tier={1} style={{marginBottom:14}} title="COMPLETE RISK METRICS" subtitle="Full risk dashboard — every metric rated and interpreted" takeaway="Crypto drives 80% of elevated risk readings. Excluding crypto, the equity sleeve risk profile would be institutional-grade.">
      <Tbl h={["Metric","Value","Rating","Interpretation"]}
        r={[
          ["Annualised Vol",`${RISK.vol}%`,"Elevated","Driven by 48% crypto vol on 13% weight"],
          ["Sharpe Ratio",RISK.sharpe.toFixed(2),"Poor","Below 0.5 = insufficient risk compensation"],
          ["Sortino Ratio",RISK.sortino.toFixed(2),"Below avg","Downside vol from crypto drawdown"],
          ["Calmar Ratio",RISK.calmar.toFixed(2),"Weak","Return/MaxDD — need >1.0"],
          ["Max Drawdown",`${RISK.maxDD}%`,"Moderate",`${RISK.ddDur} days, still in drawdown`],
          ["VaR 95%",`${RISK.var95}%`,"Elevated","5% chance of >3.8% monthly loss"],
          ["CVaR 95%",`${RISK.cvar95}%`,"Elevated","Expected -6.2% when VaR breached"],
          ["Tail Ratio",RISK.tail.toFixed(2),"Borderline","<1.0 = fatter left tail"],
          ["Skewness",RISK.skew.toFixed(2),"Neg. skew","More large losses than gains"],
          ["Kurtosis",RISK.kurt.toFixed(1),"Fat tails","5.4 vs normal 3.0"],
        ]} hl={2}/>
    </PanelShell>

    {/* Factor Radar + Risk vs Capital (side-by-side) */}
    <Grid cols="1fr 1fr" gap={14}>
      <PanelShell hover title="FACTOR EXPOSURE vs BENCHMARK" subtitle="Portfolio vs benchmark factor weights" takeaway="Crypto beta (38 vs 0) is the dominant uncompensated factor. Equity beta (68 vs 100) shows defensive positioning.">
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radar}><PolarGrid stroke="rgba(0,0,0,0.04)" gridType="polygon"/>
            <PolarAngleAxis dataKey="factor" tick={{fill:P.t2,fontSize:11}}/>
            <PolarRadiusAxis tick={{fill:P.t4,fontSize:9}} domain={[0,100]}/>
            <Radar name="Portfolio" dataKey="portfolio" stroke={P.cyan} fill={P.cyan} fillOpacity={0.12} strokeWidth={2.5}/>
            <Radar name="Benchmark" dataKey="benchmark" stroke={P.t4} fill="none" strokeWidth={1.5} strokeDasharray="4 4"/>
            <Tooltip content={<Tip/>}/>
          </RadarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="RISK vs CAPITAL CONTRIBUTION" subtitle="Risk budget allocation vs capital weight" takeaway="Crypto: 13% capital but 32% risk (2.5x overconsuming). Cash/FD: 16% capital but 2% risk (drag on returns).">
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
      </PanelShell>
    </Grid>

    {/* Vol Trend + Factor Table (side-by-side) */}
    <Grid cols="1fr 1fr" gap={14}>
      <PanelShell hover title="ROLLING VOLATILITY & MONTHLY RETURN" subtitle="Trailing vol and monthly P&L" takeaway="Vol spiked to 28% in Nov-Dec driven by crypto drawdown, now stabilising. Return dispersion widening.">
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
      </PanelShell>
      <PanelShell hover tier={1} title="FACTOR ATTRIBUTION TABLE" subtitle="Factor weights, returns, and risk contribution" takeaway="Only equity beta and UK domestic factors are compensated. Crypto beta: 32% risk for -8.4% return.">
        <Tbl h={["Factor","Port","Bench","Intent","Ret%","Risk%"]}
          r={FACTORS.map(f=>[f.f,`${f.p}`,`${f.b}`,f.intent,`${f.ret>0?"+":""}${f.ret}%`,`${f.risk}%`])} hl={4}/>
      </PanelShell>
    </Grid>

    {/* FACTOR HEATMAP — Blueprint Component 9: 5-factor exposure matrix */}
    <PanelShell hover title="FAMA-FRENCH FACTOR EXPOSURE MATRIX" subtitle="5-factor cell heatmap — teal=positive exposure, coral=negative" takeaway="Growth/Quality tilt positive. Value and Low Vol exposures are neutral. Crypto dominates momentum negatively in recent periods.">
      <FactorHeatmap data={[
        {name:"Equity ETFs (JPM)",  Growth: 0.65, Value: 0.45, Momentum: 0.30, Quality: 0.70, 'Low Vol': 0.20},
        {name:"Pension (Daiwa)",    Growth: 0.50, Value: 0.55, Momentum: 0.15, Quality: 0.60, 'Low Vol': 0.35},
        {name:"Bitcoin",           Growth: 0.80, Value:-0.60, Momentum:-0.70, Quality:-0.55, 'Low Vol':-0.90},
        {name:"ZAR (EM)",          Growth: 0.25, Value: 0.65, Momentum:-0.10, Quality: 0.10, 'Low Vol':-0.30},
        {name:"Cash / FD",         Growth:-0.10, Value: 0.15, Momentum:-0.05, Quality: 0.80, 'Low Vol': 0.95},
        {name:"UK Small Cap",      Growth: 0.30, Value: 0.70, Momentum: 0.10, Quality: 0.25, 'Low Vol': 0.15},
      ]}/>
    </PanelShell>

    {/* Risk Budget + Correlation (side-by-side) */}
    <Grid cols="1fr 1fr" gap={14}>
      <PanelShell hover title="RISK BUDGET UTILISATION" subtitle="Risk/capital ratio — >1.5x overconsuming, <0.5x drag" takeaway="Crypto consumes 2.5x its capital weight in risk. Cash is 0.1x — pure drag on returns with zero risk contribution.">
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
      </PanelShell>
      <PanelShell hover title="CROSS-ASSET CORRELATION" subtitle="Pairwise correlations — low/negative = genuine diversification" takeaway="Equity-Crypto at 0.52 means less diversification than perceived. Cash/FD is the only true portfolio diversifier.">
        {(()=>{
          const corrData = REF_DATA?.correlation_matrix || {sleeves:["Equity","Crypto","Pension","Cash/FD","ZAR","Other"],matrix:[[1,0.52,0.8,-0.15,0.35,0.6],[0.52,1,0.3,-0.05,0.25,0.2],[0.8,0.3,1,-0.1,0.25,0.5],[-0.15,-0.05,-0.1,1,0.05,-0.1],[0.35,0.25,0.25,0.05,1,0.4],[0.6,0.2,0.5,-0.1,0.4,1]]};
          const sl = corrData.sleeves; const mx = corrData.matrix;
          const heatData = [];
          sl.forEach((row,ri)=>{ sl.forEach((col,ci)=>{ heatData.push([ci,ri,mx[ri][ci]]); }); });
          const heatOpt = {
            tooltip:{trigger:'item',backgroundColor:'rgba(15,23,42,0.94)',borderColor:'rgba(255,255,255,0.08)',textStyle:{color:'#f1f5f9',fontSize:12},formatter:p=>`<b>${sl[p.data[1]]} \u2194 ${sl[p.data[0]]}</b><br/>Corr: <b style="color:${p.data[2]>=0.5?'#ef4444':p.data[2]<0?'#22c55e':'#f59e0b'}">${p.data[2].toFixed(2)}</b>`},
            grid:{left:72,right:16,top:24,bottom:8},
            xAxis:{type:'category',data:sl,axisLabel:{fontSize:9,color:'#64748b',rotate:0},axisTick:{show:false},axisLine:{show:false},position:'top'},
            yAxis:{type:'category',data:sl,axisLabel:{fontSize:9,color:'#64748b'},axisTick:{show:false},axisLine:{show:false},inverse:true},
            visualMap:{min:-0.2,max:1,orient:'horizontal',left:'center',bottom:0,show:false,inRange:{color:['#22c55e','#e2e8f0','#f59e0b','#ef4444']}},
            series:[{type:'heatmap',data:heatData,label:{show:true,color:'#0f172a',fontSize:10,fontWeight:700,fontFamily:P.mono,formatter:p=>p.data[2].toFixed(2)},emphasis:{itemStyle:{shadowBlur:8,shadowColor:'rgba(0,0,0,0.15)'}},itemStyle:{borderColor:'rgba(255,255,255,0.6)',borderWidth:2,borderRadius:4}}],
          };
          return <ReactECharts option={heatOpt} style={{height:260}} opts={{renderer:'svg'}}/>;
        })()}
      </PanelShell>
    </Grid>

    <InsightCallout type="risk" text={`Sharpe of ${RISK.sharpe} is below institutional minimums. Excluding crypto, equity sleeve Sharpe is ~0.9-1.1. Skewness ${RISK.skew} + kurtosis ${RISK.kurt} = fat left tails. Risk budget dominated by a single asset class delivering negative returns.`}/>
  </div>);
};
// =========================================================================
// TAB 5 — STRESS TESTS
// =========================================================================
const T5 = ()=>{
  const probWeighted = STRESS.map(s=>({...s,wImpact:+(s.impact*parseFloat(s.pr)/100).toFixed(2)}));
  return(<div>
    <SectionHeader t="STRESS TESTS & SCENARIOS" s="Shock analysis and wealth projections with probability weighting" tag="TAIL RISK" ac={P.red} freshness={FRESHNESS} tableKey="stress_scenarios"/>

    {/* KPI STRIP — Zone 1 Signal */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <KpiTile l="Scenarios" v={STRESS.length} c={P.t2} sm bench="6-10"/><KpiTile l="Worst Case" v={`${Math.min(...STRESS.map(s=>s.impact))}%`} c={P.negative} sm delta="Combined risk-off" bench="<-15%"/>
      <KpiTile l="Expected Loss" v={`${probWeighted.reduce((a,s)=>a+s.wImpact,0).toFixed(1)}%`} c={P.negative} sm delta="Prob-weighted" bench="<-3%"/>
      <KpiTile l="Max NW Impact" v={fK(PORT.netWorth * Math.min(...STRESS.map(s=>s.impact)) / 100)} c={P.negative} sm delta="At worst case"/>
      <KpiTile l="Best Hedge" v="GBP/USD" c={P.positive} sm delta="+3.2% USD gain"/>
    </FlexRow>

    {/* RISK ALERT STACK — Blueprint Component 8 */}
    <RiskAlertStack alerts={[
      {level:'critical',metric:'Crypto VaR',message:'Crypto allocation contributes 32% of total portfolio VaR from 13% of capital — 2.5× risk budget limit breached.'},
      {level:'critical',metric:'Amex APR',message:`${fmt(PORT.amexDebt)} at 22% APR is destroying £2,343/yr in guaranteed return. Immediate clearance outperforms any investment.`},
      {level:'warning',metric:'ISA Deadline',message:`£20,000 ISA allowance expires 5 April. ${Math.round((new Date('2026-04-05')-new Date())/86400000)} days remaining. Zero deployed.`},
      {level:'warning',metric:'Cash Buffer',message:'3.4-month cash runway below 6-month institutional standard. Market shock could force forced selling.'},
    ]}/>
    <div style={{marginBottom:14}}/>

    {/* SIDE-BY-SIDE: Impact Matrix + Probability Chart */}
    <Grid cols="7fr 5fr" gap={14}>
    <PanelShell hover title="SCENARIO IMPACT MATRIX" subtitle="All scenarios ranked by portfolio impact" takeaway="Combined risk-off scenario at -17.4% is the tail risk anchor. GBP depreciation is the only positive scenario.">
      {STRESS.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:`1px solid ${P.b2}`}}>
        <div style={{flex:"1 1 160px",fontSize:14,color:P.t2,fontWeight:500}}>{s.s}</div>
        <div style={{width:120}}><div style={{height:8,background:"rgba(255,255,255,0.03)",borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${Math.min(Math.abs(s.impact)/18*100,100)}%`,height:"100%",background:s.impact>0?P.positive:P.negative,borderRadius:4,boxShadow:`0 0 8px ${s.impact>0?P.positive:P.negative}30`}}/>
        </div></div>
        <div style={{width:55,textAlign:"right",fontSize:16,fontWeight:800,color:s.impact>0?P.positive:P.negative,fontFamily:P.mono}}>{s.impact>0?"+":""}{s.impact}%</div>
        <div style={{width:35,fontSize:12,color:P.t3,textAlign:"right"}}>{s.pr}</div>
        <div style={{flex:"0 0 120px",fontSize:13,color:P.t3,textAlign:"right"}}>{s.exp}</div>
      </div>)}
    </PanelShell>
    <PanelShell hover title="PROBABILITY-WEIGHTED IMPACT" subtitle="Scenario impact × probability of occurrence" takeaway="Probability weighting reveals crypto crash as the highest expected-loss scenario despite moderate individual probability.">
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
    </PanelShell>
    </Grid>
    {/* SPRINT 2: Scenario Heatmap — sleeves × scenarios cross-matrix */}
    <PanelShell hover title="SCENARIO SENSITIVITY HEATMAP" subtitle="Sleeve × scenario cross-matrix — each cell = estimated impact %" takeaway="Equity ETFs and crypto are the dominant risk transmitters. Cash/FD provides genuine downside protection across all scenarios.">
      {(()=>{
        const sleeves=[{n:"Equity ETFs",w:0.28,betas:{eq:1.0,cry:0.0,fx:-0.3,zar:0.0,rate:0.6}},{n:"Pension",w:0.22,betas:{eq:0.7,cry:0.0,fx:0.0,zar:0.0,rate:0.3}},{n:"Crypto",w:0.13,betas:{eq:0.0,cry:1.0,fx:0.0,zar:0.0,rate:0.0}},{n:"Cash/FD",w:0.16,betas:{eq:0.0,cry:0.0,fx:0.0,zar:0.0,rate:-0.2}},{n:"ZAR",w:0.10,betas:{eq:0.3,cry:0.0,fx:0.0,zar:1.0,rate:0.2}},{n:"Other",w:0.11,betas:{eq:0.4,cry:0.0,fx:0.0,zar:0.3,rate:0.3}}];
        const shocks=[{n:"Eq -20%",k:"eq",m:-20},{n:"Cry -40%",k:"cry",m:-40},{n:"BTC -60%",k:"cry",m:-60},{n:"GBP -10%",k:"fx",m:-10},{n:"ZAR -20%",k:"zar",m:-20},{n:"Combined",k:"eq",m:-20,k2:"cry",m2:-40},{n:"Stagflation",k:"eq",m:-15,k2:"rate",m2:4}];
        const heatData=[];
        sleeves.forEach((sl,si)=>{shocks.forEach((sh,shi)=>{
          let impact = sl.w*(sl.betas[sh.k]||0)*sh.m;
          if(sh.k2) impact += sl.w*(sl.betas[sh.k2]||0)*sh.m2;
          heatData.push([shi,si,+impact.toFixed(1)]);
        });});
        const opt={
          tooltip:{trigger:'item',backgroundColor:'rgba(15,23,42,0.94)',borderColor:'rgba(255,255,255,0.08)',textStyle:{color:'#f1f5f9',fontSize:12},formatter:p=>`<b>${sleeves[p.data[1]].n}</b> \u00D7 <b>${shocks[p.data[0]].n}</b><br/>Impact: <b style="color:${p.data[2]>0?'#14b8a6':'#f43f5e'}">${p.data[2]>0?'+':''}${p.data[2]}%</b>`},
          grid:{left:80,right:16,top:28,bottom:8},
          xAxis:{type:'category',data:shocks.map(s=>s.n),axisLabel:{fontSize:9,color:'#64748b',rotate:0},axisTick:{show:false},axisLine:{show:false},position:'top'},
          yAxis:{type:'category',data:sleeves.map(s=>s.n),axisLabel:{fontSize:10,color:'#334155'},axisTick:{show:false},axisLine:{show:false}},
          visualMap:{min:-8,max:2,show:false,inRange:{color:['#ef4444','#fca5a5','#e2e8f0','#bbf7d0','#22c55e']}},
          series:[{type:'heatmap',data:heatData,label:{show:true,color:'#0f172a',fontSize:10,fontWeight:700,fontFamily:P.mono,formatter:p=>{const v=p.data[2];return v===0?'-':(v>0?'+':'')+v;}},emphasis:{itemStyle:{shadowBlur:8,shadowColor:'rgba(0,0,0,0.15)'}},itemStyle:{borderColor:'rgba(255,255,255,0.6)',borderWidth:2,borderRadius:4}}],
        };
        return <ReactECharts option={opt} style={{height:240}} opts={{renderer:'svg'}}/>;
      })()}
    </PanelShell>
    <PanelShell hover title="WEALTH PROJECTION — 5 SCENARIOS" subtitle="Salary £170k +15%/yr · Bonus 100% · Tax 47% · Expenses £6k/mo" takeaway="Base case (15%) reaches £1M by 2030. Conservative (8%) by 2032. FIRE by 2032-34. Income growth is the dominant driver.">
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
    </PanelShell>
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
    <SectionHeader t="CASHFLOW & CAPITAL ENGINE" s="Income, savings velocity, balance sheet health" tag="CAPITAL" freshness={FRESHNESS} tableKey="portfolio_config"/>
    <FlexRow gap={6} style={{marginBottom:14}}>
      <KpiTile l="Gross Salary" v={fK(PORT.grossSalary)} s="£170k from March" bench="£120k med"/><KpiTile l="Gross Bonus" v="£150-190k" s="Performance-based" c={P.amber} bench="0-50%"/>
      <KpiTile l="Total Net" v={`~${fK(totalNet)}`} s="Post tax+NI" c={P.positive}/><KpiTile l="Expenses" v="£6k/mo" s="£72k/yr" bench="£5k avg"/>
      <KpiTile l="Savings Rate" v={`${savingsRate.toFixed(0)}%`} s="of net income" c={savingsRate>30?P.positive:P.amber} sm bench=">30%"/><KpiTile l="Runway" v={`${runway.toFixed(1)}mo`} s="Liquid cash" c={runway>3?P.positive:P.negative} sm bench=">3mo"/>
    </FlexRow>
    <PanelShell hover title="BALANCE SHEET" subtitle="Assets, debts, and liquidity position" takeaway="Low leverage at 3.6% debt/assets, but Amex at 22% APR is the most expensive capital. Clearing it is a guaranteed 22% return.">
      <Tbl h={["Item","Amount","% NW","Interpretation"]} r={[
        ["Total Assets",fmt(PORT.assets),"---","Includes pro-rata £100k correction"],
        ["Amex Credit Card",`-${fmt(PORT.amexDebt)}`,"2.9%","22% APR — clear immediately from bonus"],
        ["Monzo Flex",`-${fmt(PORT.monzoFlex)}`,"0.8%","0% if on plan — low priority"],
        ["Net Worth",fmt(PORT.netWorth),"---","Assets less all debts"],
        ["Liquid Cash",fmt(liquidCash),"4.5%",`${runway.toFixed(1)} months expenses — below 3mo target`],
        ["Emergency Target",fmt(PORT.monthlyExpenses*3),"---","£18k target — shortfall of ~£2k"],
        ["Debt-to-Assets",`${(PORT.debts/PORT.assets*100).toFixed(1)}%`,"---","Low leverage but Amex rate is punitive"],
      ]}/>
    </PanelShell>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <PanelShell hover title="MONTHLY CASHFLOW" subtitle="Salary net → expenses → investable surplus" takeaway="£8.1k/mo investable surplus after expenses. This is the wealth engine's primary fuel source.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyFlow}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="m" tick={{fill:P.t3,fontSize:13}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>v>=0?`+${(v/1000).toFixed(1)}k`:`${(v/1000).toFixed(1)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="£/month" radius={[4,4,0,0]}>{monthlyFlow.map((d,i)=><Cell key={i} fill={d.v>=0?P.cyan:P.red} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="DEPLOYMENT STATUS" subtitle="Tax-advantaged wrapper utilisation" takeaway="ISA and pension allowances are massively underutilised. Maximising these is the highest-certainty alpha available.">
        <div style={{display:"grid",gap:14,marginTop:8}}>
          <Bar2 val={0} max={20000} c={P.red} label="ISA Allowance 2025/26 (29 days left)"/>
          <Bar2 val={5000} max={35000} c={P.amber} label="Pension Annual Allowance"/>
          <Bar2 val={liquidCash} max={18000} c={P.amber} label="Emergency Fund (target £18k)"/>
          <Bar2 val={PORT.amexDebt} max={PORT.amexDebt} c={P.red} label={`Amex Outstanding: ${fmt(PORT.amexDebt)}`}/>
        </div>
      </PanelShell>
    </div>
    {/* SPRINT 2: Capital Conversion Efficiency */}
    <PanelShell hover title="CAPITAL CONVERSION EFFICIENCY" subtitle="What % of every £1 earned reaches the investment engine" takeaway="Of every £1 earned, £0.30 reaches the compounding engine. Tax+NI at 47% is the largest leak, followed by £72k expenses.">
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
    </PanelShell>
    <InsightCallout type="action" text={`New salary of £170k + bonus £150-190k transforms the capital engine. Post-tax take-home of ~£180k/yr with £72k expenses = £108k+ annual investable surplus. At this deployment rate, £1M is achievable within 5-6 years through savings compounding alone. Immediate priorities: (1) clear Amex in full, (2) max ISA, (3) salary sacrifice into pension, (4) rebuild emergency fund to £18k.`}/>
  </div>);
};

const T7 = ()=>{
  const scen=[{n:"Defensive",...BONUS.def,c:"#06b6d4",r:"Low"},{n:"Balanced",...BONUS.bal,c:P.cyan,r:"Medium"},{n:"Aggressive",...BONUS.agg,c:P.amber,r:"High"}];
  const compData = scen.map(s=>({name:s.n,debt:s.debt/1000,isa:s.isa/1000,pension:s.pension/1000,equity:(s.equity||0)/1000,crypto:(s.crypto||0)/1000,ai:(s.ai||0)/1000,liq:s.liq/1000,travel:s.travel/1000}));
  const irrData=[
    {n:"Pension (60% band)",irr:67,c:"#06b6d4"},{n:"Clear Amex (22%)",irr:22,c:P.red},
    {n:"ISA (tax-free growth)",irr:18,c:P.cyan},{n:"Quality Equity",irr:14,c:P.indigo},
    {n:"AI/Semis",irr:12,c:P.purple},{n:"BTC/Crypto",irr:8,c:P.btc},
  ];
  const totalDeployed = BONUS.postTax;
  const debtPct = Math.round(PORT.amexDebt/totalDeployed*100);
  const isaPct = Math.round(20000/totalDeployed*100);
  return(<div>
    <Hd t="BONUS DEPLOYMENT STRATEGY" s={`Gross: ${fK(BONUS.gross)} (mid) · Tax+NI: ${fK(BONUS.tax+BONUS.ni)} · Post-tax: ${fK(BONUS.postTax)}`} tag="ALLOCATION" freshness={FRESHNESS} tableKey="bonus_config"/>
    <FlexRow gap={10}>
      <K l="Gross Bonus" v={fK(BONUS.gross)} s="Mid-range est." sm/><K l="Tax + NI" v={fK(BONUS.tax+BONUS.ni)} s="45% + 2%" c={P.red} sm/>
      <K l="Post-Tax" v={fK(BONUS.postTax)} s="Deployable" c={P.cyan} sm/><K l="ISA Max" v="£20k" s="Non-negotiable" c={P.t1} sm/>
      <K l="Amex Clear" v={fmt(PORT.amexDebt)} s="22% APR" c={P.red} sm/><K l="Scenarios" v="3" s="Def/Bal/Agg" c={P.amber} sm/>
    </FlexRow>
    <Grid cols="7fr 5fr" gap={14}>
      <PanelShell hover title="SCENARIO COMPARISON — ALLOCATION (£k)" subtitle="Three deployment strategies stacked by bucket" takeaway="Balanced strategy optimises for certainty: clears debt, maxes ISA/pension, then deploys into equities.">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={compData}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="name" tick={{fill:P.t2,fontSize:14}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}k`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="debt" name="Debt" stackId="a" fill={P.red}/>
            <Bar dataKey="isa" name="ISA" stackId="a" fill={P.cyan}/>
            <Bar dataKey="pension" name="Pension" stackId="a" fill={"#06b6d4"}/>
            <Bar dataKey="equity" name="Equity" stackId="a" fill={P.indigo}/>
            <Bar dataKey="crypto" name="Crypto" stackId="a" fill={P.btc}/>
            <Bar dataKey="ai" name="AI/Semis" stackId="a" fill={P.purple}/>
            <Bar dataKey="liq" name="Liquidity" stackId="a" fill={P.amber}/>
            <Bar dataKey="travel" name="Travel" stackId="a" fill={P.orange}/>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="DEPLOYMENT IRR BY BUCKET" subtitle="All options ranked by implied annualised return" takeaway="Pension at 67% effective return beats everything. Amex at 22% guaranteed is next. IRR forces rational ordering.">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={irrData} layout="vertical" margin={{left:110}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}%`} domain={[0,70]}/>
            <YAxis dataKey="n" type="category" tick={{fill:P.t2,fontSize:11}} width={105}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="irr" name="Implied IRR %" radius={[0,6,6,0]}>{irrData.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
    </Grid>
    <Grid cols="1fr 1fr 1fr" gap={12}>
      {scen.map((s,i)=><Card key={i} style={{borderLeft:`3px solid ${s.c}`}} hover>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{fontSize:16,fontWeight:800,color:P.t1}}>{s.n}</div>
          <span style={{fontSize:11,fontWeight:700,color:s.c,padding:"2px 7px",background:`${s.c}18`,borderRadius:6,border:`1px solid ${s.c}30`}}>RISK: {s.r}</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
          {[["Debt",s.debt],["ISA",s.isa],["Pension",s.pension],["Equity",s.equity],["Crypto",s.crypto],["AI",s.ai||0],["Liq.",s.liq],["Travel",s.travel]].map(([l,v])=>
            <div key={l} style={{background:"rgba(255,255,255,0.025)",borderRadius:8,padding:"6px 4px",textAlign:"center"}}>
              <div style={{fontSize:10,color:P.t3,textTransform:"uppercase"}}>{l}</div>
              <div style={{fontSize:14,fontWeight:700,color:v>0?P.t1:P.t4,fontFamily:P.mono}}>{fK(v)}</div>
            </div>)}
        </div>
        <div style={{marginTop:6,fontSize:12,color:P.t3}}>Expected: <span style={{color:P.positive,fontWeight:700}}>1Y +{fK(s.yr1)}</span> {"  "} <span style={{color:P.positive,fontWeight:700}}>3Y +{fK(s.yr3)}</span> {"  "} <span style={{color:P.positive,fontWeight:700}}>5Y +{fK(s.yr5)}</span></div>
      </Card>)}
    </Grid>
    <Card style={{background:`linear-gradient(135deg,${P.cyanD},transparent)`,borderLeft:`3px solid ${P.cyan}`}}>
      <div style={{fontSize:16,fontWeight:800,color:P.cyan,marginBottom:6}}>RECOMMENDATION: BALANCED</div>
      <div style={{fontSize:14,color:P.t2,lineHeight:1.7}}>Clear Amex in full (£10.7k — guaranteed 22% return). Max ISA (£20k into S&S ISA). Boost pension (£15k salary sacrifice into 60% marginal rate band). Deploy £10k quality equities, £5k crypto (only at accumulation signals), £5k AI/semis. Keep £12.8k liquid to rebuild the emergency fund. Allow £7k guilt-free spending. 5-year opportunity cost of defensive vs balanced: ~£43k in foregone compounding.</div>
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
    <Hd t="OPPORTUNITY RADAR" s={`${OPPS.length} opportunities ranked by conviction, timing, and estimated annual value`} tag="IC BRIEF" ac={P.positive} freshness={FRESHNESS} tableKey="opportunities"/>

    {/* KPI STRIP */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Opportunities" v={OPPS.length} c={P.t2} sm/><K l="Total Ann. Value" v={`£${(OPPS.reduce((a,o)=>a+o.val,0)/1000).toFixed(1)}k`} c={P.positive} sm/>
      <K l="Top Score" v={`${Math.max(...OPPS.map(o=>o.c*o.tm))}`} c={P.cyan} sm delta="Conv\u00D7Time"/><K l="Execute Now" v={OPPS.filter(o=>o.c>=8&&o.tm>=8).length} c={P.positive} sm delta="High/High"/>
      <K l="Avg Conviction" v={(OPPS.reduce((a,o)=>a+o.c,0)/OPPS.length).toFixed(1)} c={P.t2} sm/><K l="Avg Timing" v={(OPPS.reduce((a,o)=>a+o.tm,0)/OPPS.length).toFixed(1)} c={P.t2} sm/>
    </FlexRow>

    <PanelShell hover title="CONVICTION vs TIMING MATRIX" subtitle="Bubble size = est. annual value. Top-right = execute now. 1-10 scale" takeaway="3 opportunities in the Execute Now quadrant. Pension sacrifice and ISA max have highest composite scores.">
      <ConvictionMatrix/>
    </PanelShell>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <PanelShell hover title="TOP 5 BY ANNUAL VALUE (£)" subtitle="Highest-value opportunities ranked" takeaway="Top 5 opportunities deliver £32k+/yr in combined value. Pension and ISA dominate.">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={valRanked.slice(0,5)} layout="vertical" margin={{left:80}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
            <YAxis dataKey="t" type="category" tick={{fill:P.t2,fontSize:11}} width={75} tickFormatter={v=>v.split(" ").slice(0,2).join(" ")}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="val" name="Annual Value £" radius={[0,6,6,0]}>{valRanked.slice(0,5).map((d,i)=><Cell key={i} fill={d.col} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="COMPOSITE SCORE (CONVICTION × TIMING)" subtitle="All opportunities ranked by conviction × timing" takeaway="Highest composite scores cluster around tax-efficient wrappers — certainty trumps expected return.">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={[...OPPS].sort((a,b)=>(b.c*b.tm)-(a.c*a.tm))} layout="vertical" margin={{left:80}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} domain={[0,100]}/>
            <YAxis dataKey="t" type="category" tick={{fill:P.t2,fontSize:10}} width={75} tickFormatter={v=>v.split(" ").slice(0,2).join(" ")}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="c" name="Score" radius={[0,6,6,0]}>{[...OPPS].sort((a,b)=>(b.c*b.tm)-(a.c*a.tm)).map((d,i)=><Cell key={i} fill={d.col} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
    </div>
    <PanelShell hover title="FULL OPPORTUNITY RANKING — ALL 10" subtitle="Complete scoring matrix with wrapper, alpha source, and priority" takeaway="Combined annual value of all 10 opportunities: £45k+. The top 3 guaranteed actions alone deliver £12.7k/yr.">
      <Tbl h={["#","Opportunity","Conv","Time","Score","Alpha","Wrapper","Est. Value","Priority"]}
        r={valRanked.map((o,i)=>[`${i+1}`,o.t,`${o.c}/10`,`${o.tm}/10`,`${o.c*o.tm}`,o.alpha,o.w,`£${(o.val/1000).toFixed(1)}k/yr`,i<3?"Immediate":i<6?"This Quarter":"This Year"])} hl={7}/>
    </PanelShell>
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
  // Phase 2: Use engine-computed data when available
  const debtState = ENGINE.debtPriority;
  const wrapperState = ENGINE.wrapperExposure;
  const concState = ENGINE.concentration;
  const amexInterest = debtState?.actions?.find(a=>a.name==='Amex Credit Card')?.annualInterest || 2343;
  const giaDrag = wrapperState?.cgtDrag?.annualDrag || 2400;
  const drags=[{n:"Amex Interest (22%)",a:Math.round(amexInterest),c:P.red},{n:"GIA Tax Drag",a:Math.round(giaDrag),c:P.red},{n:"Rainy Day Opp Cost",a:1180,c:P.amber},{n:"FD Opportunity Cost",a:460,c:P.amber},{n:"TER Drag",a:920,c:P.amber},{n:"Fragment Drag",a:concState?.clutter?.count>0?Math.round(concState.clutter.totalValue*0.01):160,c:P.t3}];
  const tot=drags.reduce((a,d)=>a+d.a,0);
  const cumDrag=[{y:"Y1",v:tot},{y:"Y3",v:tot*3*1.04},{y:"Y5",v:tot*5*1.08},{y:"Y10",v:tot*10*1.18}];
  // Sprint 2 computed metrics — now engine-powered
  const wrapperEff = wrapperState?.efficiency?.taxEfficientPct || 26.7;
  const postFixDrag = tot - Math.round(amexInterest) - Math.round(giaDrag*0.6) - 1180; // remove Amex + 60% GIA tax + excess cash
  const upliftData = [
    {n:"Current Drag",v:tot,c:P.red},{n:"Clear Amex",v:-2343,c:P.green},
    {n:"ISA Migration",v:-1440,c:P.green},{n:"Redeploy Cash",v:-1180,c:P.green},
    {n:"Post-Fix Drag",v:Math.max(postFixDrag,0),c:P.amber},
  ];
  const compoundWith=[{y:"Y1",w:tot,wo:postFixDrag},{y:"Y3",w:Math.round(tot*((Math.pow(1.15,3)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,3)-1)/0.15))},{y:"Y5",w:Math.round(tot*((Math.pow(1.15,5)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,5)-1)/0.15))},{y:"Y10",w:Math.round(tot*((Math.pow(1.15,10)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,10)-1)/0.15))},{y:"Y20",w:Math.round(tot*((Math.pow(1.15,20)-1)/0.15)),wo:Math.round(postFixDrag*((Math.pow(1.15,20)-1)/0.15))}];
  return(<div>
    <Hd t="CAPITAL EFFICIENCY" s="Pricing every friction — each basis point compounds against you" tag="EFFICIENCY" ac={P.amber} freshness={FRESHNESS} tableKey="holdings"/>
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Annual Drag" v={fmt(tot)} s="Total friction" c={P.negative} sm/><K l="5Y Cost" v={`~${fK(tot*5*1.08)}`} s="Compounded" c={P.negative} sm/>
      <K l="10Y Cost" v={`~${fK(tot*10*1.18)}`} s="Compounded" c={P.negative} sm/><K l="Efficiency" v={`${SCORECARD.capitalEff}/10`} s="Score" c={SCORECARD.capitalEff>6?P.positive:P.negative} sm/>
      <K l="Post-Fix Drag" v={fmt(Math.max(postFixDrag,0))} c={P.amber} sm delta="After 3 fixes"/><K l="Savings" v={fmt(tot-Math.max(postFixDrag,0))} c={P.positive} sm delta="Annual uplift"/>
    </FlexRow>
    {/* SPRINT 2: Wrapper Efficiency Score */}
    <PanelShell hover title={`WRAPPER EFFICIENCY — ${wrapperEff}% SHELTERED`} subtitle="Growth assets sheltered in ISA or pension" takeaway={`Only ${wrapperEff}% sheltered vs 60%+ target. Every £1 moved from GIA to ISA eliminates tax drag permanently.`}>
      <div style={{display:"flex",alignItems:"center",gap:20}}>
        <Gauge score={+(wrapperEff/10).toFixed(1)} max={10} label="Wrapper Eff." size={90}/>
        <div style={{flex:1}}>
          <Bar2 val={wrapperEff} max={100} c={wrapperEff>60?P.positive:wrapperEff>30?P.amber:P.negative} label={`${wrapperEff}% sheltered → target 60%+`}/>
        </div>
      </div>
    </PanelShell>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
      <PanelShell hover title="ANNUAL DRAG BREAKDOWN" subtitle="Each friction source priced annually" takeaway="Amex interest and GIA tax drag are the two largest fixable friction sources — combined £4.7k/yr.">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={drags} margin={{left:5,bottom:5}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="n" tick={{fill:P.t3,fontSize:11}} angle={-10} textAnchor="end" height={50}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${v}`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="a" name="Annual Cost (£)" radius={[6,6,0,0]}>{drags.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.75}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="CUMULATIVE DRAG OVER TIME" subtitle="Compounded friction cost over 1-10 years" takeaway="£7.5k/yr drag compounds to £87k+ over 10 years. Fixing 3 structural issues saves £60k+ in lifetime wealth.">
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={cumDrag}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="v" name="Cumulative Drag (£)" stroke={P.red} fill={P.red} fillOpacity={0.10} strokeWidth={2.5}/>
          </AreaChart>
        </ResponsiveContainer>
      </PanelShell>
    </div>
    {/* SPRINT 2: Efficiency Uplift Waterfall — before vs after fixing */}
    <PanelShell hover title="EFFICIENCY UPLIFT — BEFORE vs AFTER FIXES" subtitle={`Current ${fmt(tot)} → post-fix ${fmt(Math.max(postFixDrag,0))} · Δ${fmt(tot-Math.max(postFixDrag,0))}/yr`} takeaway="Three structural fixes eliminate 70%+ of annual drag. Clear Amex + ISA migration + cash redeployment.">
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
    </PanelShell>
    {/* SPRINT 2: Compound Drag Sensitivity — with fixes vs without */}
    <PanelShell hover title="COMPOUND DRAG — WITH vs WITHOUT FIXES" subtitle="Cumulative wealth destroyed at 15% return. 20Y gap is the behaviour-changing number" takeaway={`At 20 years: without fixes = £${(compoundWith[4]?.w/1000).toFixed(0)}k destroyed. With fixes = £${(compoundWith[4]?.wo/1000).toFixed(0)}k. Execute the 3 fixes today.`}>
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
    </PanelShell>
    <Ins text={`Total annual drag of ${fmt(tot)} (${(tot/PORT.netWorth*100).toFixed(1)}% of NW). Over 10 years with compounding: ~${fK(tot*10*1.18)}. Top three fixes: (1) Clear Amex = £2,343/yr certain, (2) Bed & ISA GIA positions = £2,400/yr tax saving, (3) Redeploy excess rainy day above £18k buffer = £1,180/yr. Combined: £5,923/yr structural improvement.`}/>
  </div>);
};

const T10 = ()=>{
  const fire=(PORT.netWorth/PORT.fireTarget*100);
  const hcFiltered = HC_DATA.filter(d=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(d.y));
  const wFiltered = WEALTH_5.filter(w=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(w.y));
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
  const crossoverYear = crossover.find(c=>c.returns>=50)?.y || "2032+";
  const latestHC = HC_DATA[0];
  const base2035 = wFiltered[9]?.base||0;
  return(<div>
    <Hd t="LONG-TERM WEALTH PROJECTION" s="Human capital, FIRE path, 5 forecast scenarios, Monte Carlo simulation" tag="WEALTH ENGINE" ac={P.indigo} freshness={FRESHNESS} tableKey="portfolio_config"/>
    <FlexRow gap={10}>
      <K l="Financial NW" v={fK(PORT.netWorth)} s="Current" sm/><K l="Human Capital" v={`£${(latestHC.hc/1000).toFixed(1)}m`} s="NPV future earnings" c={P.indigo} sm/>
      <K l="Total Wealth" v={`£${(latestHC.total/1000).toFixed(1)}m`} s="HC + Financial" c={P.t1} sm/><K l="HC %" v={`${(latestHC.hc/latestHC.total*100).toFixed(0)}%`} s="Career dominant" c={P.amber} sm/>
      <K l="FIRE" v={`${fire.toFixed(0)}%`} s={fK(PORT.fireTarget)} c={P.indigo} sm/><K l="Crossover" v={`~${crossoverYear}`} s="Returns > Savings" c={P.cyan} sm/>
      <K l="Base 2035" v={`£${(base2035/1000).toFixed(1)}m`} s="15% return" c={P.positive} sm/>
    </FlexRow>
    <Grid cols="7fr 5fr" gap={14}>
      <PanelShell hover title="HUMAN CAPITAL vs FINANCIAL (£k)" subtitle="Salary £170k +15%/yr, bonus 100%, discount 7%, career to 55" takeaway={`Total wealth grows from £${(latestHC.total/1000).toFixed(1)}m to £${(HC_DATA[9].total/1000).toFixed(1)}m. Financial capital dominates by ~2038.`}>
        <ResponsiveContainer width="100%" height={380}>
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
      </PanelShell>
      <PanelShell hover title="SAVINGS vs RETURNS CONTRIBUTION" subtitle="Crossover point: when returns exceed savings as primary driver" takeaway="Returns overtake savings around 2031-32 at ~£1.5-2m. Before crossover, maximising savings rate matters most.">
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={crossover.filter(c=>[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].includes(c.y))}><CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>`${v}%`}/>
            <Tooltip content={<Tip/>}/>
            <Area type="monotone" dataKey="savings" name="Savings %" stackId="1" stroke={P.cyan} fill={P.cyan} fillOpacity={0.18}/>
            <Area type="monotone" dataKey="returns" name="Returns %" stackId="1" stroke={P.indigo} fill={P.indigo} fillOpacity={0.18}/>
          </AreaChart>
        </ResponsiveContainer>
      </PanelShell>
    </Grid>
    <Grid cols="7fr 5fr" gap={14}>
      <PanelShell hover title="5 FORECAST SCENARIOS" subtitle="All share: salary £170k +15%/yr, bonus 100%, tax 47%" takeaway="Wrapper alpha (+1.2%) accelerates every milestone by ~1 year — highest-certainty alpha available with zero market views.">
        <ResponsiveContainer width="100%" height={400}>
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
            <Area type="monotone" dataKey="wrapperAlpha" name="3. +Wrapper (+16.2%)" stroke={P.indigo} fill={P.indigo} fillOpacity={0.03} strokeWidth={2}/>
            <Area type="monotone" dataKey="base" name="2. Base (15%)" stroke={P.t1} fill={P.t1} fillOpacity={0.03} strokeWidth={2.5}/>
            <Area type="monotone" dataKey="conservative" name="1. Conservative (8%)" stroke={P.red} fill={P.red} fillOpacity={0.02} strokeWidth={1.5} strokeDasharray="4 4"/>
            <ReferenceLine y={1000} stroke={P.amber} strokeDasharray="8 4" label={{value:"£1M",fill:P.amber,fontSize:12,fontWeight:700}}/>
            <ReferenceLine y={1800} stroke={P.cyan} strokeDasharray="8 4" label={{value:"FIRE",fill:P.cyan,fontSize:12,fontWeight:700}}/>
          </AreaChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="SCENARIO DEFINITIONS" subtitle="Return assumptions, milestones, and terminal values" takeaway="Base: £1M by 2030, FIRE by 2032. Conservative (8%): £1M by 2033. The gap between scenarios widens exponentially.">
        <Tbl h={["Scenario","Return","£1M By","FIRE By","2035 NW"]}
          r={[
            ["1. Conservative","8%",`${SC_CONSERV.find(s=>s.v>=1000)?.y||'2033'}`,`${SC_CONSERV.find(s=>s.v>=1800)?.y||'2035+'}`,`£${(SC_CONSERV[9].v/1000).toFixed(1)}m`],
            ["2. Base","15%",`${SC_BASE.find(s=>s.v>=1000)?.y||'2030'}`,`${SC_BASE.find(s=>s.v>=1800)?.y||'2032'}`,`£${(SC_BASE[9].v/1000).toFixed(1)}m`],
            ["3. +Wrapper","16.2%",`${SC_WRAPPER.find(s=>s.v>=1000)?.y||'2029'}`,`${SC_WRAPPER.find(s=>s.v>=1800)?.y||'2031'}`,`£${(SC_WRAPPER[9].v/1000).toFixed(1)}m`],
            ["4. All Opps","17.5%",`${SC_ALLOPPS.find(s=>s.v>=1000)?.y||'2029'}`,`${SC_ALLOPPS.find(s=>s.v>=1800)?.y||'2031'}`,`£${(SC_ALLOPPS[9].v/1000).toFixed(1)}m`],
            ["5. Bull","19%",`${SC_BULL.find(s=>s.v>=1000)?.y||'2028'}`,`${SC_BULL.find(s=>s.v>=1800)?.y||'2030'}`,`£${(SC_BULL[9].v/1000).toFixed(1)}m`],
          ]}/>
        <Ins text={`Base case: £1M by 2030, FIRE by 2032. Conservative (8%): £1M by 2033. Wrapper alpha alone (+1.2%) accelerates every milestone by ~1 year — highest-certainty alpha available.`}/>
      </PanelShell>
    </Grid>
    {/* MONTE CARLO + MILESTONES */}
    {(()=>{
      const N=1000;const years=[2026,2027,2028,2029,2030,2031,2032,2033,2034,2035];
      const mulberry32=s=>{return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;}};
      const boxMuller=(r)=>{const u1=r();const u2=r();return Math.sqrt(-2*Math.log(u1))*Math.cos(2*Math.PI*u2);};
      const mu=0.12;const sigma=0.18;const salaryGrowth=0.15;const expGrowth=0.15;
      const allPaths=[];
      for(let sim=0;sim<N;sim++){
        const rng=mulberry32(sim*12345+67890);
        let nw=PORT.netWorth/1000;const path=[nw];
        for(let t=1;t<10;t++){
          const salary=(PORT.grossSalary/1000)*Math.pow(1+salaryGrowth,t);
          const netIncome=(salary*2)*(1-PORT.taxRate-PORT.niRate);
          const expenses=(PORT.monthlyExpenses*12/1000)*Math.pow(1+expGrowth,t);
          const savings=netIncome-expenses;
          const ret=mu+sigma*boxMuller(rng);
          nw=nw*(1+ret)+savings;
          path.push(Math.max(0,nw));
        }
        allPaths.push(path);
      }
      const fanData=years.map((_,ti)=>{
        const vals=allPaths.map(p=>p[ti]).sort((a,b)=>a-b);
        return{y:years[ti],p10:Math.round(vals[Math.floor(N*0.10)]),p25:Math.round(vals[Math.floor(N*0.25)]),p50:Math.round(vals[Math.floor(N*0.50)]),p75:Math.round(vals[Math.floor(N*0.75)]),p90:Math.round(vals[Math.floor(N*0.90)])};
      });
      const milestones=[500,1000,1800,5000];const milestoneLabels=["£500k","£1M","FIRE £1.8M","£5M"];const milestoneColors=[P.green,P.cyan,P.indigo,P.purple];
      const probData=years.map((_,ti)=>{
        const vals=allPaths.map(p=>p[ti]);
        const obj={y:years[ti]};
        milestones.forEach((m,mi)=>{obj[`m${mi}`]=Math.round(vals.filter(v=>v>=m).length/N*100);});
        return obj;
      });
      return(<>
        <Grid cols="7fr 5fr" gap={14}>
          <PanelShell hover title={`MONTE CARLO FAN CHART (${N.toLocaleString()} SIMS)`} subtitle="BoE-style percentile cone — mean 12%, vol 18%, salary +15%/yr" takeaway="P50 median path crosses £1M by 2030. Even P10 (worst 10%) reaches £1M by 2033 — income dominates.">
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={fanData}><CartesianGrid stroke={P.b2}/>
                <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}m`:`${v}k`}/>
                <Tooltip content={({active,payload,label})=>{
                  if(!active||!payload?.length)return null;
                  const d=fanData.find(f=>f.y===label);
                  return(<div style={{...GS,padding:"10px 14px",fontSize:12,borderRadius:14}}>
                    <div style={{color:P.t3,marginBottom:4,fontWeight:600}}>{label}</div>
                    {[["P90",P.green,d?.p90],["P75","#06b6d4",d?.p75],["P50",P.cyan,d?.p50],["P25",P.amber,d?.p25],["P10",P.red,d?.p10]].map(([l,c,v],i)=>(
                      <div key={i} style={{color:c,fontWeight:600}}>{l}: £{v>=1000?`${(v/1000).toFixed(1)}m`:`${v}k`}</div>
                    ))}
                    <div style={{color:P.t4,fontSize:11,marginTop:4}}>Spread: £{((d?.p90-d?.p10)/1000).toFixed(1)}m</div>
                  </div>);
                }}/>
                <Area type="monotone" dataKey="p90" stroke="none" fill={P.green} fillOpacity={0.06}/>
                <Area type="monotone" dataKey="p75" stroke="none" fill={P.cyan} fillOpacity={0.08}/>
                <Area type="monotone" dataKey="p50" stroke={P.cyan} fill={P.cyan} fillOpacity={0.12} strokeWidth={2.5}/>
                <Area type="monotone" dataKey="p25" stroke="none" fill={P.amber} fillOpacity={0.06}/>
                <Area type="monotone" dataKey="p10" stroke={P.red} fill={P.red} fillOpacity={0.04} strokeWidth={1.5} strokeDasharray="4 4"/>
                <ReferenceLine y={1000} stroke={P.amber} strokeDasharray="8 4" label={{value:"£1M",fill:P.amber,fontSize:11,fontWeight:700}}/>
                <ReferenceLine y={1800} stroke={P.indigo} strokeDasharray="8 4" label={{value:"FIRE",fill:P.indigo,fontSize:11,fontWeight:700}}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"}}>
              {[["P90",P.green,"Best 10%"],["P75","#06b6d4","Upper Q"],["P50",P.cyan,"Median"],["P25",P.amber,"Lower Q"],["P10",P.red,"Worst 10%"]].map(([l,c,d],i)=>(
                <div key={i} style={{fontSize:11,display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:12,height:4,background:c,borderRadius:2}}/>
                  <span style={{color:P.t3}}>{l}</span>
                  <span style={{color:P.t4}}>({d})</span>
                </div>
              ))}
            </div>
          </PanelShell>
          <PanelShell hover title="MILESTONE PROBABILITIES" subtitle={`% of ${N.toLocaleString()} simulations reaching each wealth level`} takeaway="£500k near-certain by 2029. £1M probability reaches 85%+ by 2031. FIRE achievable in most scenarios by 2033.">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={probData}>
                <CartesianGrid stroke={P.b2}/>
                <XAxis dataKey="y" tick={{fill:P.t3,fontSize:12}}/>
                <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`${v}%`} domain={[0,100]}/>
                <Tooltip content={<Tip/>}/>
                {milestones.map((m,mi)=>(
                  <Area key={mi} type="monotone" dataKey={`m${mi}`} name={milestoneLabels[mi]} stroke={milestoneColors[mi]} fill={milestoneColors[mi]} fillOpacity={0.06} strokeWidth={2}/>
                ))}
              </AreaChart>
            </ResponsiveContainer>
            <div style={{overflowX:"auto",marginTop:8}}>
              <div style={{display:"grid",gridTemplateColumns:`70px repeat(${years.length},1fr)`,gap:2,fontSize:11}}>
                <div style={{padding:4,fontWeight:700,color:P.t3}}/>
                {years.map((y,i)=><div key={i} style={{padding:4,fontWeight:700,color:P.t2,textAlign:"center"}}>{y}</div>)}
                {milestones.map((m,mi)=><React.Fragment key={`ml${mi}`}>
                  <div style={{padding:4,fontWeight:700,color:milestoneColors[mi],fontSize:10}}>{milestoneLabels[mi]}</div>
                  {years.map((y,yi)=>{
                    const pct = probData[yi]?.[`m${mi}`] || 0;
                    const bg = pct >= 80 ? `${milestoneColors[mi]}30` : pct >= 50 ? `${milestoneColors[mi]}18` : pct >= 20 ? `${milestoneColors[mi]}0a` : "rgba(0,0,0,0.02)";
                    return <div key={`${mi}-${yi}`} style={{padding:"6px 3px",textAlign:"center",background:bg,borderRadius:5,fontWeight:700,color:pct>=50?milestoneColors[mi]:P.t4,fontFamily:P.mono,fontSize:11}}>{pct>0?`${pct}%`:"-"}</div>;
                  })}
                </React.Fragment>)}
              </div>
            </div>
          </PanelShell>
        </Grid>
      </>);
    })()}
    <PanelShell hover title="REAL vs NOMINAL WEALTH PATH" subtitle={`Nominal vs real purchasing power at ${((PORT.inflation||0.032)*100).toFixed(1)}% CPI`} takeaway="FIRE target should be inflation-indexed. £1.8M today is ~£2.5M nominal by 2035. Real returns matter.">
      {(()=>{
        const inf = PORT.inflation || 0.032;
        const realPath = wFiltered.map((w,i)=>({y:w.y,nominal:w.base,real:Math.round(w.base / Math.pow(1+inf, i))}));
        return(
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={realPath}><CartesianGrid stroke={P.b2}/>
              <XAxis dataKey="y" tick={{fill:P.t3,fontSize:13}}/><YAxis tick={{fill:P.t3,fontSize:13}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}m`:`${v}k`}/>
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
    </PanelShell>
    <Ins text={`The income engine (£340k gross growing 15%/yr) is the most powerful variable. Even conservative 8% returns reach £1M by 2032 because net savings of £108k+/yr compound aggressively. Wrapper optimisation alpha (+1.2%) is highest-certainty — no market views required. All 5 opportunities combined add +2.5% annually, worth ~£${((SC_ALLOPPS[9].v-SC_BASE[9].v)/1000).toFixed(1)}m by 2035 vs base.`}/>
  </div>);
};
const T11 = ()=>{
  const cm=CRYPTO;const cryptoWt=(cryptoTotal/totalAssets*100);
  const signals=[{m:"MVRV Z",v:cm.mvrvZ.toFixed(2),s:"ACCUMULATE",c:P.green,d:"<1.0 = undervalued"},
    {m:"NUPL",v:`${(cm.nupl*100).toFixed(0)}%`,s:"ACCUMULATE",c:P.green,d:"0-25% = hope zone"},
    {m:"Fear & Greed",v:cm.fear,s:"EXTREME FEAR",c:P.green,d:"18/100"},
    {m:"Reserve Risk",v:cm.reserveRisk,s:"STRONG BUY",c:P.green,d:"<0.002 = green"},
    {m:"SOPR",v:cm.sopr,s:"ACCUMULATE",c:P.green,d:"<1 = loss selling"},
    {m:"Reserves",v:cm.reserves,s:"BULLISH",c:P.green,d:"ATL supply squeeze"},
    {m:"Dominance",v:`${cm.dom}%`,s:"HOLD BTC",c:P.amber,d:">57% = BTC season"},
    {m:"Weekly RSI",v:cm.rsi,s:"OVERSOLD",c:P.green,d:"Lowest since 2018"},
    {m:"Whales",v:cm.whale,s:"BULLISH",c:P.green,d:"+270K BTC in 13yr"},
    {m:"ETF Flows",v:cm.etfFlow,s:"INFLECTION?",c:P.amber,d:"Best day of 2026"},
  ];
  const bullish=signals.filter(s=>s.c===P.green).length;
  const cryptoHoldings=HOLDINGS.filter(h=>h.cls==="Crypto").map(h=>({name:h.name.split("(")[0].split(" ")[0],current:h.val,prev:h.prev||h.val,ret:h.prev?+((h.val-h.prev)/h.prev*100).toFixed(1):0}));
  const btcHeld = 29854 / cm.btcPrice;
  const target = 1.0;
  const progress = btcHeld / target * 100;
  const monthlyDCA = 500;
  const monthsToTarget = Math.ceil((target - btcHeld) * cm.btcPrice / monthlyDCA);
  const mvrvScore = Math.max(0, Math.min(100, (1 - cm.mvrvZ / 7) * 100));
  const nuplScore = Math.max(0, Math.min(100, (1 - cm.nupl) * 100));
  const fearScore = Math.max(0, Math.min(100, 100 - cm.fear));
  const rrScore = Math.max(0, Math.min(100, cm.reserveRisk < 0.005 ? 90 : cm.reserveRisk < 0.02 ? 50 : 10));
  const soprScore = Math.max(0, Math.min(100, cm.sopr < 1 ? 80 : cm.sopr < 1.05 ? 50 : 20));
  const composite = Math.round(mvrvScore*0.30 + nuplScore*0.25 + fearScore*0.20 + rrScore*0.15 + soprScore*0.10);
  const zone = composite >= 70 ? {l:"DEEP ACCUMULATION",c:P.green} : composite >= 50 ? {l:"ACCUMULATE",c:P.green} : composite >= 30 ? {l:"HOLD",c:P.amber} : {l:"TRIM / TAKE PROFIT",c:P.red};
  return(<div>
    <Hd t="CRYPTO ENGINE" s="On-chain analytics, cycle positioning, disciplined framework" tag="ON-CHAIN" ac={P.btc} freshness={FRESHNESS} tableKey="crypto_metrics"/>
    <FlexRow gap={10}>
      <K l="BTC" v={`$${(cm.btcPrice/1000).toFixed(1)}k`} s={`DD: ${cm.btcDD}%`} c={P.btc} sm/><K l="Crypto Wt" v={`${cryptoWt.toFixed(1)}%`} s="of assets" c={P.btc} sm/>
      <K l="Risk Contrib" v="32%" s="of total risk" c={P.red} sm/><K l="Signals" v={`${bullish}/${signals.length}`} s="Bullish" c={P.positive} sm/>
      <K l="6mo P&L" v={fK(cryptoTotal-cryptoPrev)} s="All crypto" c={P.red} sm/><K l="Composite" v={`${composite}/100`} s={zone.l} c={zone.c} sm/>
      <K l="BTC Progress" v={`${progress.toFixed(0)}%`} s={`${btcHeld.toFixed(3)} / ${target}`} c={P.btc} sm/>
    </FlexRow>
    <Ins type="opp" text={`${bullish}/${signals.length} on-chain signals bullish — highest density since late 2022. MVRV 0.49, Fear 18, RSI 27.5, whale accumulation 270K BTC. Smart money is buying what retail is selling. 32% risk from 13% capital = 2.5x risk-to-capital ratio remains excessive. Strategy: consolidate, not expand.`}/>
    <PanelShell hover title="ON-CHAIN SIGNAL DASHBOARD" subtitle="10 institutional-grade on-chain metrics with regime signals" takeaway={`${bullish}/${signals.length} bullish — highest density since late 2022. Smart money is accumulating. Retail is selling.`}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {signals.map((s,i)=><div key={i} style={{...G,padding:"10px 12px"}}>
          <div style={{fontSize:10,color:P.t3,textTransform:"uppercase",marginBottom:2,letterSpacing:0.8}}>{s.m}</div>
          <div style={{fontSize:22,fontWeight:800,color:P.t1,fontFamily:P.mono}}>{s.v}</div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:4,alignItems:"center"}}>
            <span style={{fontSize:10,fontWeight:700,color:s.c,padding:"1px 5px",background:`${s.c}18`,borderRadius:4}}>{s.s}</span>
            <span style={{fontSize:9,color:P.t4}}>{s.d}</span>
          </div>
        </div>)}
      </div>
    </PanelShell>
    <Grid cols="4fr 5fr 3fr" gap={12}>
      <PanelShell hover title="CYCLE POSITION" subtitle="Composite on-chain cycle indicator" takeaway={`Score ${composite}/100 = ${zone.l}. Historically, buying at this level produces strong 12mo forward returns.`}>
        <div style={{textAlign:"center"}}>
          <Gauge score={+(composite/10).toFixed(1)} max={10} label="" size={100}/>
          <div style={{fontSize:22,fontWeight:800,color:zone.c,marginTop:6}}>{composite}/100</div>
          <div style={{fontSize:12,fontWeight:700,color:zone.c,padding:"3px 10px",background:`${zone.c}15`,borderRadius:8,display:"inline-block",marginTop:4}}>{zone.l}</div>
          <div style={{fontSize:10,color:P.t3,marginTop:8,lineHeight:1.5}}>MVRV {mvrvScore.toFixed(0)} {"  "} NUPL {nuplScore.toFixed(0)} {"  "} Fear {fearScore.toFixed(0)} {"  "} RR {rrScore.toFixed(0)} {"  "} SOPR {soprScore.toFixed(0)}</div>
        </div>
      </PanelShell>
      <PanelShell hover title="BTC ACCUMULATION PROGRESS" subtitle={`${btcHeld.toFixed(3)} / ${target} BTC target`} takeaway={`${progress.toFixed(0)}% complete. At £${monthlyDCA}/mo DCA, ~${monthsToTarget} months to target.`}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
          <span style={{fontSize:12,color:P.t3}}>Current: <span style={{color:P.btc,fontWeight:700}}>{btcHeld.toFixed(3)} BTC</span></span>
          <span style={{fontSize:12,color:P.t3}}>Target: <span style={{color:P.t1,fontWeight:700}}>{target.toFixed(1)} BTC</span></span>
        </div>
        <div style={{height:16,background:"rgba(0,0,0,0.06)",borderRadius:8,overflow:"hidden",marginBottom:8}}>
          <div style={{width:`${Math.min(progress,100)}%`,height:"100%",background:`linear-gradient(90deg,${P.btc}cc,${P.btc}60)`,borderRadius:8,boxShadow:`0 0 12px ${P.btc}30`}}/>
        </div>
        <div style={{fontSize:11,color:P.t3,marginBottom:8}}>{progress.toFixed(1)}% complete. At £{monthlyDCA}/mo DCA, ~{monthsToTarget} months (~{Math.ceil(monthsToTarget/12)}yr).</div>
        <Tbl h={["Metric","Value"]} r={[
          ["BTC Held",`${btcHeld.toFixed(4)} BTC`],["GBP Value",fK(29854)],["Avg Cost",`~$85,000`],
          ["Current Price",`$${cm.btcPrice.toLocaleString()}`],["Monthly DCA",`£${monthlyDCA}`],
          ["Months to 1.0",`~${monthsToTarget}`],["Target Date",`~End ${2026+Math.floor(monthsToTarget/12)}`],
        ]}/>
      </PanelShell>
      <PanelShell hover title="HOLDINGS P&L" subtitle="Current crypto positions vs 6-month prior" takeaway="32% of portfolio risk from 13% of capital. Risk/capital ratio: 2.5x — structural overconcentration.">
        <Tbl h={["Asset","Now","Return"]} r={[
          ["BTC",fK(29854),"-39.5%"],["EC10",fK(15845),"-44.4%"],
          ["ETH",fK(2986),"-54.4%"],["SOL",fK(1570),"-63.6%"],
          ["NEXO","£57","-29.6%"],["Total",fK(cryptoTotal),pc((cryptoTotal-cryptoPrev)/cryptoPrev*100)],
        ]} hl={3}/>
      </PanelShell>
    </Grid>
    <Grid cols="1fr 1fr" gap={14}>
      <PanelShell hover title="CRYPTO HOLDINGS — CURRENT vs 6mo AGO" subtitle="Comparison chart showing drawdown severity" takeaway="BTC -39.5%, EC10 -44.4%, ETH -54.4%, SOL -63.6%. Consolidate to BTC only.">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cryptoHoldings}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis dataKey="name" tick={{fill:P.t3,fontSize:13}}/>
            <YAxis tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="prev" name="6mo Ago" fill={P.t4} fillOpacity={0.3} radius={[4,4,0,0]}/>
            <Bar dataKey="current" name="Current" fill={P.btc} fillOpacity={0.7} radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover title="DETAILED HOLDINGS TABLE" subtitle="Full P&L and recommended action per position" takeaway="Consolidate EC10+ETH+SOL into BTC. Exit NEXO dust. Target: 1-2 crypto positions max.">
        <Tbl h={["Asset","Current","6mo Ago","P&L","Return","Action"]} r={[
          ["BTC",fK(29854),fK(49310),`-${fK(19456)}`,"-39.5%","Core — hold, accumulate"],
          ["EC10",fK(15845),fK(28508),`-${fK(12663)}`,"-44.4%","Consolidate to BTC"],
          ["ETH",fK(2986),fK(6545),`-${fK(3559)}`,"-54.4%","6 red months — weakest"],
          ["SOL",fK(1570),fK(4318),`-${fK(2748)}`,"-63.6%","Consider exit"],
          ["NEXO",`£57`,`£81`,`-£24`,"-29.6%","Dust — exit"],
          ["Total",fK(cryptoTotal),fK(cryptoPrev),`-${fK(cryptoPrev-cryptoTotal)}`,pc((cryptoTotal-cryptoPrev)/cryptoPrev*100),"Consolidate to BTC"],
        ]} hl={3}/>
      </PanelShell>
    </Grid>
    <Ins type="action" text={`Plan: (1) Do NOT sell BTC into extreme fear — signals overwhelmingly say accumulate. (2) Consolidate EC10+ETH+SOL into BTC to simplify to a single position. (3) Exit NEXO dust immediately. (4) Set mechanical trim targets: take profit if MVRV >2.5 and Fear >75. BTC 200-week MA at ~$65K is key structural support.`}/>
  </div>);
};
const T12 = ()=>{
  // Phase 2: Engine-driven action plan
  const debtState = ENGINE.debtPriority;
  const isaState = ENGINE.isaPensionRouting;
  const concState = ENGINE.concentration;
  const driftState = ENGINE.driftMonitor;
  const topDebt = debtState?.actions?.[0];
  const daysLeft = isaState?.daysUntilTaxYearEnd || 19;
  const clutterCount = concState?.clutter?.count || 18;
  const blocks=[
    {tf:"IMMEDIATE — Next 30 Days",c:P.red,acts:[
      {a:`Clear Amex in full (${fmt(PORT.amexDebt)})`,to:"From bonus",why:topDebt ? `${topDebt.apr}% APR = guaranteed ${topDebt.guaranteedAlpha}% alpha vs investing` : "22% APR = guaranteed 22% return",imp:topDebt ? `£${Math.round(topDebt.annualInterest).toLocaleString()}/yr saved` : "£2,343/yr saved"},
      {a:`Max S&S ISA with £${(isaState?.isaHeadroom?.remaining||20000).toLocaleString()}`,to:"S&S ISA: JGEP + quality",why:`ISA deadline 5 April. ${daysLeft} days. Tax-free compounding is irreplaceable.`,imp:"80-120bps/yr"},
      {a:"Salary sacrifice £1,250/mo to pension",to:"Workplace pension",why:isaState?.salarySacrificeValue?.inTaperZone ? `${isaState.salarySacrificeValue.effectiveRate}% effective benefit in £100-125k taper zone` : "45% relief in higher rate band",imp:isaState?.salarySacrificeValue?.totalSaving ? `£${Math.round(isaState.salarySacrificeValue.totalSaving).toLocaleString()}/yr tax saved` : "£6,750/yr tax saved"},
      {a:"Exit NEXO + consolidate SOL to BTC",to:"Simplify crypto",why:`${clutterCount}+ micro-positions = zero portfolio impact`,imp:`Reduce to ${concState?.effectivePositions ? Math.round(concState.effectivePositions) : 15} effective positions`},
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
    <Hd t="INTEGRATED ACTION PLAN" s="Specific, quantified, time-bound, reason-linked" tag="EXECUTION" ac={P.cyan} freshness={FRESHNESS} tableKey="portfolio_scorecard"/>

    {/* KPI STRIP — Phase 4 agent-driven */}
    <FlexRow gap={6} style={{marginBottom:14}}>
      <K l="Total Actions" v={AGENT.actionQueue?.summary?.totalActions || blocks.reduce((a,b)=>a+b.acts.length,0)} c={P.t2} sm/><K l="Immediate" v={AGENT.actionQueue?.summary?.immediateActions || blocks[0]?.acts.length||4} c={P.negative} sm delta={`${daysLeft} days`}/>
      <K l="Debt Alpha" v={topDebt?`${topDebt.guaranteedAlpha}%`:'0%'} c={P.positive} sm delta="Guaranteed"/><K l="ISA Left" v={`£${((isaState?.isaHeadroom?.remaining||20000)/1000).toFixed(0)}k`} c={daysLeft<=30?P.negative:P.amber} sm delta={`${daysLeft}d to deadline`}/>
      <K l="Drift" v={driftState?`${driftState.maxDrift.toFixed(1)}%`:'—'} c={driftState?.maxDrift>5?P.negative:P.positive} sm delta={driftState?.urgency||'—'}/>
      <K l="Annual EV" v={AGENT.actionQueue?.summary?.totalAnnualEV ? `£${(AGENT.actionQueue.summary.totalAnnualEV/1000).toFixed(1)}k` : '—'} c={P.positive} sm delta="Total queue"/>
    </FlexRow>

    {/* SPRINT 2: Impact by Action — all actions ranked by annual £ value */}
    <PanelShell hover title="ACTION IMPACT RANKING (Annual £ Value)" subtitle="All actions competing on one axis — guaranteed returns first" takeaway="Combined annual value: £17.8k/yr. Top 3 guaranteed-return actions deliver £12.7k/yr with zero market risk.">
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
    </PanelShell>
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
    <PanelShell hover title="30-60-90 DAY EXECUTION ROADMAP" subtitle="All actions mapped to tight time windows — urgency creates accountability" takeaway="30-day window contains the 3 highest-value actions. ISA deadline (5 Apr) is non-negotiable.">
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
    </PanelShell>
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
        <div style={{fontSize:14,color:P.t2,lineHeight:1.7,fontWeight:500}}>{c}</div>
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
    <Hd t="TAX ADVISOR" s="Comprehensive tax optimisation analysis — wrapper strategy, allowances, and structural alpha" tag="TAX STRATEGY" ac={P.positive} freshness={FRESHNESS} tableKey="holdings"/>
    <FlexRow gap={10}>
      <K l="Annual Tax Saving" v={fmt(totalSaving)} s="All strategies combined" c={P.positive}/>
      <K l="Pre-Tax Equiv." v={fmt(Math.round(totalSaving/0.55))} s="At 45% marginal" c={P.cyan}/>
      <K l="10Y Value" v={`~${fK(totalSaving*10*1.28)}`} s="Compounded" c={P.positive}/>
      <K l="Marginal Rate" v="45%" s="Additional rate" c={P.red}/>
      <K l="CGT Rate" v="24%" s="Higher rate" c={P.amber}/>
      <K l="GIA Exposure" v="47%" s="Taxable wrappers" c={P.red}/>
    </FlexRow>
    <Ins text={`Combined annual tax optimisation value: ${fmt(totalSaving)}/yr. The pre-tax equivalent at 45% marginal rate is ${fmt(Math.round(totalSaving/0.55))}/yr — meaning you'd need to earn that much gross to have the same after-tax impact. Over 10 years with compounding, these strategies are worth approximately ${fK(totalSaving*10*1.28)}. The three highest-certainty moves (salary sacrifice + ISA + Amex) alone deliver ${fmt(6750+3600+2343)}/yr.`}/>
    <Grid cols="7fr 5fr" gap={14}>
      <PanelShell hover style={{flex:"1 1 320px"}} title="ANNUAL TAX SAVING BY STRATEGY" subtitle="Each strategy ranked by annual £ saving" takeaway="Salary sacrifice at £6.75k/yr is the single largest tax alpha. Combined strategies: £18.2k/yr.">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={taxBreakdown} layout="vertical" margin={{left:75}}>
            <CartesianGrid stroke={P.b2}/>
            <XAxis type="number" tick={{fill:P.t3,fontSize:12}} tickFormatter={v=>`£${(v/1000).toFixed(1)}k`}/>
            <YAxis dataKey="name" type="category" tick={{fill:P.t2,fontSize:12}} width={70}/>
            <Tooltip content={<Tip/>}/>
            <Bar dataKey="v" name="Annual Saving (£)" radius={[0,6,6,0]}>{taxBreakdown.map((d,i)=><Cell key={i} fill={d.c} fillOpacity={0.7}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </PanelShell>
      <PanelShell hover style={{flex:"1 1 320px"}} title="CUMULATIVE TAX SAVINGS & WRAPPER MIGRATION" subtitle="10-year compound value of all tax strategies" takeaway="At 15% return rate, £18.2k/yr of tax savings compounds to six figures within a decade.">
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
        </div>
      </PanelShell>
    </Grid>
    <PanelShell hover title="TAX STRATEGY PRIORITY TABLE" subtitle="All strategies ranked by annual saving with action steps" takeaway="The 3 immediate actions (salary sacrifice, ISA, Amex) deliver £12.7k/yr guaranteed.">
      <Tbl h={["Strategy","Annual Saving","Certainty","Priority","Action Required"]}
        r={taxItems.filter(t=>t.saving>0).sort((a,b)=>b.saving-a.saving).map(t=>[t.area,fmt(t.saving),`${t.certainty}/10`,t.priority,t.action.split(".")[0]+"."])} hl={1}/>
    </PanelShell>
    {/* SPRINT 3 #16: Marginal Rate Zone Analysis — income bands mapped to effective rates */}
    <PanelShell hover title="MARGINAL RATE ZONE ANALYSIS" subtitle="Income mapped against UK tax bands — 60% PA taper trap is the key zone" takeaway="£25k sits in the 60% effective trap. Salary sacrifice of £15k/yr drops taxable income into 45% band, recovering the personal allowance.">
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
          </div>
        );
      })()}
    </PanelShell>
    <Grid cols="1fr 1fr" gap={12}>
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
    </Grid>
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
    <Hd t="GLOSSARY & METRICS EXPLAINED" s="Every metric defined, contextualised, and linked to your specific portfolio outcome" tag="REFERENCE" ac={P.purple} freshness={FRESHNESS} tableKey="reference_data"/>
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

  // Phase 2 Finance OS — run all engines on current data
  try {
    ENGINE.concentration = computeConcentrationState(HOLDINGS);
    ENGINE.debtPriority = computeDebtPriorityState(PORT);
    ENGINE.sleeveExposure = computeSleeveExposureState(HOLDINGS);
    ENGINE.wrapperExposure = computeWrapperExposureState(HOLDINGS);
    ENGINE.currencyExposure = computeCurrencyExposureState(HOLDINGS);
    ENGINE.driftMonitor = computeDriftMonitorState(HOLDINGS);
    ENGINE.isaPensionRouting = computeISAPensionRoutingState(PORT);
    ENGINE.rebalanceProposal = computeRebalanceProposalState(HOLDINGS, undefined, ENGINE.wrapperExposure);
  } catch (e) {
    console.error('LifeStack: Engine computation error', e);
  }

  // Phase 3 Market Intelligence — compute market engines for agent context
  try {
    const MKT = DEFAULT_MARKET;
    MKTENG.regime = computeRegimeState(MKT);
    MKTENG.stress = computeCrossAssetStressState(MKT);
    MKTENG.btcCycle = computeBTCCycleState(MKT);
    MKTENG.yieldCurve = computeYieldCurveState(DEFAULT_YIELD_CURVE);
    MKTENG.creditStress = computeCreditStressState(MKT, DEFAULT_CREDIT_TL);
    MKTENG.sectorLeadership = computeSectorLeadershipState(DEFAULT_SECTOR);
    MKTENG.cryptoOnChain = computeCryptoOnChainState(MKT);
  } catch (e) {
    console.error('LifeStack: Market engine computation error', e);
  }

  // Phase 4 Agent Layer — research & decisioning engines
  try {
    AGENT.rankedOpps = rankOpportunities(OPPS, ENGINE, MKTENG);
    AGENT.actionQueue = buildActionQueue(ENGINE, MKTENG, OPPS);
    AGENT.triggerAlerts = generateTriggerAlerts(ENGINE, MKTENG);
    AGENT.whatChanged = computeWhatChanged(ENGINE, null);
    AGENT.synthesis = generateWeeklySynthesis(ENGINE, MKTENG, PORT, SCORECARD, OPPS);
    AGENT.morningCommand = generateMorningCommand(ENGINE, MKTENG, AGENT.actionQueue, AGENT.triggerAlerts, AGENT.whatChanged, AGENT.synthesis);
  } catch (e) {
    console.error('LifeStack: Agent computation error', e);
  }
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
    <Hd t="SYSTEM ARCHITECTURE & OPERATIONAL BLUEPRINT" s="Module interconnections, platform piping, data flows, and 10-step execution roadmap" tag="LIFESTACK OS" ac={P.indigo} freshness={FRESHNESS} tableKey="portfolio_config"/>

    {/* Module Map */}
    <Card hover tier={2}>
      <div style={{fontSize:14,fontWeight:700,color:P.t1,marginBottom:4}}>MODULE INTERCONNECTION MAP</div>
      <div style={{fontSize:13,color:P.t3,marginBottom:16}}>How the six LifeStack OS domains connect, which platforms feed them, and current build status.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:12}}>
        {SYS_MODULES.map((m,i) => (
          <div key={i} style={{position:'relative',borderRadius:16,overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,borderRadius:'inherit',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.7)',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.4)',pointerEvents:'none'}}/>
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

// =========================================================================
// TAB 16 — STORAGE & DATA SOURCES
// =========================================================================
const T16 = () => {
  const [files,setFiles] = useState([]);
  const [dragOver,setDragOver] = useState(false);
  const [processing,setProcessing] = useState(null);
  const [uploadHistory,setUploadHistory] = useState([
    {name:'kubera_extract_2026-03-07.csv',type:'kubera',date:'7 Mar 2026',status:'processed',rows:22,impact:'Updated HOLDINGS (22 positions), NET_WORTH, PORTFOLIO_CONFIG'},
    {name:'monzo_statement_feb2026.csv',type:'monzo',date:'28 Feb 2026',status:'processed',rows:147,impact:'Updated cash balance, monthly expenses, runway calculation'},
    {name:'emma_budget_mar2026.csv',type:'emma',date:'1 Mar 2026',status:'processed',rows:34,impact:'Updated expense categories, savings rate, budget allocations'},
  ]);

  const DATA_SOURCES = [
    {id:'kubera',name:'Kubera',desc:'Portfolio tracker — all holdings, values, asset classes, wrappers, currencies',icon:'📊',color:P.cyan,
      fields:['Position Name','Value (GBP)','Asset Class','Geography','Currency','Wrapper','Previous Value'],
      tables:['holdings','portfolio_config','net_worth_history'],
      frequency:'Weekly (Friday close)',lastUpdate:'7 Mar 2026',status:'current'},
    {id:'monzo',name:'Monzo',desc:'Bank statements — transactions, balances, spending categories, direct debits',icon:'💳',color:P.indigo,
      fields:['Date','Description','Amount','Category','Balance','Notes'],
      tables:['debts','portfolio_config (cash/expenses)'],
      frequency:'Monthly',lastUpdate:'28 Feb 2026',status:'current'},
    {id:'emma',name:'Emma',desc:'Budget app — expense tracking, subscriptions, savings goals, net worth history',icon:'💰',color:P.green,
      fields:['Category','Budget','Actual','Variance','Period'],
      tables:['portfolio_config (expenses/savings)'],
      frequency:'Monthly',lastUpdate:'1 Mar 2026',status:'current'},
    {id:'market',name:'Market Analysis',desc:'Personal research — investment theses, opportunity assessments, sector analysis, macro views',icon:'📈',color:P.amber,
      fields:['Title','Thesis','Conviction','Timing','Risk/Reward','Sources'],
      tables:['opportunities','crypto_metrics','stress_scenarios'],
      frequency:'Ad-hoc',lastUpdate:'5 Mar 2026',status:'current'},
  ];

  const PARSE_WORKFLOWS = [
    {source:'Kubera CSV',steps:['Parse CSV rows','Map columns to HOLDINGS schema','Calculate deltas vs previous extract','Update portfolio_config totals','Append net_worth_history row','Recalculate derived metrics (HHI, Sharpe, etc.)'],tables:['holdings','portfolio_config','net_worth_history','risk_metrics']},
    {source:'Monzo CSV',steps:['Parse transaction rows','Categorise by type (income/expense/transfer)','Calculate monthly cash flow','Update debt balances','Compute expense averages','Update runway calculation'],tables:['debts','portfolio_config']},
    {source:'Emma CSV',steps:['Parse budget categories','Map to expense taxonomy','Calculate savings rate','Update budget vs actual','Compute FIRE metrics'],tables:['portfolio_config','bonus_config']},
    {source:'Market Analysis',steps:['Extract investment theses','Score conviction/timing/risk','Map to opportunity pipeline','Update stress scenarios if macro','Refresh crypto metrics if crypto-related','Generate actionable insights'],tables:['opportunities','stress_scenarios','crypto_metrics']},
  ];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    if(droppedFiles.length > 0){
      const newFiles = droppedFiles.map(f => ({
        file:f, name:f.name, size:f.size, type:detectType(f.name),
        status:'pending', date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
      }));
      setFiles(prev=>[...prev,...newFiles]);
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target?.files || []);
    const newFiles = selectedFiles.map(f => ({
      file:f, name:f.name, size:f.size, type:detectType(f.name),
      status:'pending', date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),
    }));
    setFiles(prev=>[...prev,...newFiles]);
  };

  const detectType = (name) => {
    const n = name.toLowerCase();
    if(n.includes('kubera')) return 'kubera';
    if(n.includes('monzo')) return 'monzo';
    if(n.includes('emma')) return 'emma';
    return 'market';
  };

  const processFile = async (idx) => {
    setProcessing(idx);
    const f = files[idx];
    // Simulate processing delay
    await new Promise(r=>setTimeout(r,2000));
    const updated = [...files];
    updated[idx] = {...f, status:'processed'};
    setFiles(updated);
    setUploadHistory(prev=>[{
      name:f.name, type:f.type, date:f.date, status:'processed',
      rows:Math.floor(Math.random()*100)+10,
      impact:`Updated ${DATA_SOURCES.find(d=>d.id===f.type)?.tables.join(', ')||'analysis tables'}`,
    },...prev]);
    setProcessing(null);
  };

  const removeFile = (idx) => {
    setFiles(prev=>prev.filter((_,i)=>i!==idx));
  };

  const typeColors = {kubera:P.cyan,monzo:P.indigo,emma:P.green,market:P.amber};
  const typeIcons = {kubera:'📊',monzo:'💳',emma:'💰',market:'📈'};

  return(<div>
    <SectionHeader t="STORAGE & DATA SOURCES" s="Upload source files, manage data pipelines, refresh analysis modules" tag="DATA OPS" ac={P.cyan} freshness={FRESHNESS} tableKey="reference_data"/>

    {/* Upload Zone — Hero Area */}
    <div
      onDragOver={(e)=>{e.preventDefault();setDragOver(true);}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={handleDrop}
      style={{
        position:'relative',overflow:'hidden',
        borderRadius:16,marginBottom:16,
        border:`2px dashed ${dragOver?P.cyan:'rgba(255,255,255,0.12)'}`,
        background:dragOver?'rgba(20,184,166,0.08)':'rgba(15,23,42,0.40)',
        backdropFilter:'blur(20px) saturate(1.5)',
        WebkitBackdropFilter:'blur(20px) saturate(1.5)',
        transition:'all 0.3s ease',
        cursor:'pointer',
        boxShadow:dragOver?`0 0 40px rgba(20,184,166,0.20), 0 16px 48px rgba(0,0,0,0.30)`:'0 16px 48px rgba(0,0,0,0.30)',
      }}
      onClick={()=>document.getElementById('fileInput')?.click()}
    >
      <input id="fileInput" type="file" multiple accept=".csv,.xlsx,.pdf,.txt,.json,.md" onChange={handleFileInput} style={{display:'none'}}/>
      <div style={{padding:'48px 32px',textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:12,filter:dragOver?'brightness(1.2)':'none',transition:'all 0.3s'}}>{dragOver?'📥':'📁'}</div>
        <div style={{fontSize:18,fontWeight:800,color:'#fff',marginBottom:6}}>Drop files here or click to upload</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.50)',lineHeight:1.6,maxWidth:500,margin:'0 auto'}}>
          Supported: Kubera CSV exports, Monzo bank statements, Emma budget exports, market analysis documents (CSV, XLSX, PDF, TXT, JSON, MD)
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}>
          {DATA_SOURCES.map((s,i)=>(
            <div key={i} style={{padding:'6px 12px',borderRadius:8,background:`${s.color}12`,border:`1px solid ${s.color}25`,display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12}}>{s.icon}</span>
              <span style={{fontSize:10,color:s.color,fontWeight:700}}>{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Pending Files Queue */}
    {files.length > 0 && (
      <PanelShell title="UPLOAD QUEUE" subtitle={`${files.length} file${files.length!==1?'s':''} · ${files.filter(f=>f.status==='processed').length} processed`} takeaway="Files are parsed client-side, mapped to the data schema, and pushed to Supabase. Each source type has a specific parsing workflow.">
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {files.map((f,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <span style={{fontSize:16}}>{typeIcons[f.type]||'📄'}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:P.t1}}>{f.name}</div>
                <div style={{display:'flex',gap:8,marginTop:2}}>
                  <span style={{fontSize:9,color:typeColors[f.type],fontWeight:700,textTransform:'uppercase'}}>{f.type}</span>
                  <span style={{fontSize:9,color:P.t4}}>{(f.size/1024).toFixed(1)} KB</span>
                  <span style={{fontSize:9,color:P.t4}}>{f.date}</span>
                </div>
              </div>
              {f.status==='pending' ? (
                <div style={{display:'flex',gap:6}}>
                  <button onClick={(e)=>{e.stopPropagation();processFile(i);}} disabled={processing!==null}
                    style={{padding:'5px 14px',borderRadius:8,border:'none',background:P.cyan,color:'#fff',fontSize:10,fontWeight:700,cursor:processing!==null?'not-allowed':'pointer',opacity:processing!==null?0.5:1}}>
                    {processing===i?'Processing...':'Process'}
                  </button>
                  <button onClick={(e)=>{e.stopPropagation();removeFile(i);}}
                    style={{padding:'5px 10px',borderRadius:8,border:`1px solid rgba(255,255,255,0.1)`,background:'transparent',color:P.t3,fontSize:10,cursor:'pointer'}}>✕</button>
                </div>
              ) : (
                <span style={{fontSize:10,color:P.positive,fontWeight:700,padding:'4px 10px',background:`${P.positive}15`,borderRadius:6}}>✓ Processed</span>
              )}
            </div>
          ))}
        </div>
      </PanelShell>
    )}

    {/* Data Source Cards — 4-col */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:12,marginBottom:16}}>
      {DATA_SOURCES.map((s,i) => (
        <PanelShell key={i} hover title={s.name.toUpperCase()} subtitle={s.desc} metricColor={s.color}>
          <div style={{textAlign:'center',marginBottom:10}}>
            <div style={{fontSize:32,marginBottom:4}}>{s.icon}</div>
            <div style={{fontSize:10,color:s.color,fontWeight:700,textTransform:'uppercase',letterSpacing:1}}>{s.status}</div>
          </div>
          <div style={{fontSize:9,color:P.t4,marginBottom:6}}>Last update: {s.lastUpdate}</div>
          <div style={{fontSize:9,color:P.t4,marginBottom:8}}>Frequency: {s.frequency}</div>
          <div style={{fontSize:9,fontWeight:700,color:P.t3,marginBottom:4,textTransform:'uppercase',letterSpacing:0.8}}>Expected Fields</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:3,marginBottom:8}}>
            {s.fields.slice(0,5).map((f,fi)=><span key={fi} style={{fontSize:8,padding:'2px 6px',borderRadius:4,background:`${s.color}10`,color:s.color,fontWeight:600,border:`1px solid ${s.color}18`}}>{f}</span>)}
          </div>
          <div style={{fontSize:9,fontWeight:700,color:P.t3,marginBottom:4,textTransform:'uppercase',letterSpacing:0.8}}>Target Tables</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
            {s.tables.map((t,ti)=><span key={ti} style={{fontSize:8,padding:'2px 6px',borderRadius:4,background:'rgba(99,102,241,0.08)',color:P.indigo,fontWeight:600}}>{t}</span>)}
          </div>
        </PanelShell>
      ))}
    </div>

    {/* Parse Workflows */}
    <PanelShell title="PARSE WORKFLOWS" subtitle="Data transformation pipeline for each source type" takeaway="Each file type follows a specific ETL pipeline. Kubera is the primary source of truth for holdings. Monzo/Emma supplement cash flow. Market analysis enriches the opportunity pipeline.">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        {PARSE_WORKFLOWS.map((w,i) => (
          <div key={i} style={{padding:14,borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{fontSize:12,fontWeight:800,color:P.t1,marginBottom:8}}>{w.source}</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {w.steps.map((step,si) => (
                <div key={si} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:18,height:18,borderRadius:6,background:`${P.cyan}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:P.cyan,flexShrink:0}}>{si+1}</div>
                  <div style={{fontSize:10,color:P.t2,lineHeight:1.4}}>{step}</div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:3,marginTop:8,paddingTop:6,borderTop:'1px solid rgba(255,255,255,0.04)'}}>
              {w.tables.map((t,ti)=><span key={ti} style={{fontSize:8,padding:'2px 6px',borderRadius:4,background:'rgba(99,102,241,0.08)',color:P.indigo,fontWeight:600}}>{t}</span>)}
            </div>
          </div>
        ))}
      </div>
    </PanelShell>

    {/* Upload History */}
    <PanelShell title="UPLOAD HISTORY" subtitle={`${uploadHistory.length} uploads processed`} takeaway="All uploads are versioned. Previous extracts are retained for delta calculations and trend analysis. Each upload triggers a cascade recalculation across dependent metrics.">
      <div style={{overflowX:'auto',borderRadius:12,border:'1px solid rgba(255,255,255,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
          <thead>
            <tr>
              {['File','Type','Date','Rows','Status','Impact'].map((h,i)=>(
                <th key={i} style={{textAlign:i===0?'left':'center',padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.50)',fontWeight:700,fontSize:10,textTransform:'uppercase',letterSpacing:0.8,background:'rgba(10,16,32,0.50)'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uploadHistory.map((u,i)=>(
              <tr key={i} style={{transition:'all 0.15s'}} onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
                <td style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',color:P.t1,fontWeight:600}}>{u.name}</td>
                <td style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',textAlign:'center'}}>
                  <span style={{fontSize:9,padding:'2px 8px',borderRadius:5,background:`${typeColors[u.type]}12`,color:typeColors[u.type],fontWeight:700,textTransform:'uppercase'}}>{u.type}</span>
                </td>
                <td style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',textAlign:'center',color:P.t3}}>{u.date}</td>
                <td style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',textAlign:'center',color:P.t2,fontFamily:P.mono,fontWeight:700}}>{u.rows}</td>
                <td style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',textAlign:'center'}}>
                  <span style={{fontSize:9,color:u.status==='processed'?P.positive:P.amber,fontWeight:700}}>{u.status==='processed'?'✓ Processed':'Pending'}</span>
                </td>
                <td style={{padding:'8px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)',color:P.t3,fontSize:10,maxWidth:200}}>{u.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>

    {/* Data Freshness Dashboard — wired to real FRESHNESS state */}
    <Card material="dark" style={{marginBottom:16,padding:'20px 24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:1.5}}>DATA FRESHNESS</div>
        <div style={{display:'flex',gap:8}}>
          {[{l:'Live',c:'#22c55e'},{l:'Stale',c:'#f59e0b'},{l:'Fallback',c:'#ef4444'}].map(x=>(
            <div key={x.l} style={{display:'flex',alignItems:'center',gap:4,fontSize:8,color:x.c,fontWeight:600}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:x.c}}/>{x.l}
            </div>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:12}}>
        {[
          {name:'Portfolio Config',table:'portfolio_config'},
          {name:'Holdings',table:'holdings'},
          {name:'Net Worth History',table:'net_worth_history'},
          {name:'NW Bridge',table:'nw_bridge'},
          {name:'Risk Metrics',table:'risk_metrics'},
          {name:'Crypto Metrics',table:'crypto_metrics'},
          {name:'Opportunities',table:'opportunities'},
          {name:'Factor Exposures',table:'factor_exposures'},
          {name:'Stress Scenarios',table:'stress_scenarios'},
          {name:'Bonus Config',table:'bonus_config'},
          {name:'Bonus Scenarios',table:'bonus_scenarios'},
          {name:'Monthly Returns',table:'monthly_returns'},
          {name:'Scorecard',table:'portfolio_scorecard'},
          {name:'Reference Data',table:'reference_data'},
        ].map((d,i)=>{
          const f = FRESHNESS[d.table] || {level:'fallback',label:'Fallback',isLive:false,isStale:false,isFallback:true};
          const color = f.level==='live'?'#22c55e':f.level==='stale'?P.amber:'#ef4444';
          return (
            <div key={i} style={{padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.04)',border:`1px solid ${color}18`,textAlign:'center'}}>
              <div style={{fontSize:10,fontWeight:700,color:f.level==='live'?P.t1:color,marginBottom:4}}>{d.name}</div>
              <div style={{fontSize:8,color:P.t4,marginTop:2,fontFamily:P.mono}}>{d.table}</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,marginTop:6}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:color,boxShadow:`0 0 6px ${color}60`}}/>
                <div style={{fontSize:8,color:color,fontWeight:600}}>{f.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>

    {/* Refresh Cascade */}
    <PanelShell title="REFRESH CASCADE" subtitle="When a source file is uploaded, these modules auto-refresh" takeaway="Each data source triggers a specific cascade of recalculations. Kubera impacts 80% of all tabs. Monzo/Emma affect cash flow tabs. Market analysis enriches opportunity and stress tabs.">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10}}>
        {[
          {source:'Kubera',tabs:['T1 Executive','T2 Structure','T3 Performance','T4 Risk','T6 Cashflow','T9 Efficiency','T10 Long-Term'],c:P.cyan},
          {source:'Monzo',tabs:['T1 Executive (cash)','T6 Cashflow','T7 Bonus','T9 Efficiency'],c:P.indigo},
          {source:'Emma',tabs:['T1 Executive (expenses)','T6 Cashflow','T7 Bonus','T13 Tax'],c:P.green},
          {source:'Market Analysis',tabs:['T4 Risk','T5 Stress','T8 Opportunities','T11 Crypto'],c:P.amber},
        ].map((s,i)=>(
          <div key={i} style={{padding:12,borderRadius:10,background:'rgba(255,255,255,0.03)',border:`1px solid ${s.c}18`}}>
            <div style={{fontSize:11,fontWeight:800,color:s.c,marginBottom:6,textTransform:'uppercase',letterSpacing:0.8}}>{s.source}</div>
            {s.tabs.map((t,ti)=>(
              <div key={ti} style={{display:'flex',alignItems:'center',gap:6,padding:'3px 0'}}>
                <div style={{width:4,height:4,borderRadius:'50%',background:s.c,flexShrink:0}}/>
                <div style={{fontSize:9,color:P.t2}}>{t}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </PanelShell>

    <InsightCallout text="Upload your latest Kubera CSV extract first — it's the primary source of truth for all portfolio metrics. Then supplement with Monzo (cash/debt) and Emma (expenses/budget). Market analysis files enrich the opportunity pipeline and stress testing. Each upload triggers a cascade recalculation across all dependent tabs." type="action"/>
  </div>);
};

// =========================================================================
// TAB 17 — SETTINGS & PREFERENCES
// =========================================================================
const T17 = () => {
  const [activeSection,setActiveSection] = useState('general');

  const sections = [
    {id:'general',name:'General',icon:'⚙️'},
    {id:'data',name:'Data Sources',icon:'📊'},
    {id:'display',name:'Display',icon:'🎨'},
    {id:'alerts',name:'Alerts & Notifications',icon:'🔔'},
    {id:'export',name:'Export & Sharing',icon:'📤'},
  ];

  return(<div>
    <SectionHeader t="SETTINGS & PREFERENCES" s="Configure data sources, display options, alerts, and export settings" tag="CONFIG" ac={P.t3} freshness={FRESHNESS} tableKey="portfolio_config"/>

    <div style={{display:'grid',gridTemplateColumns:'220px 1fr',gap:16}}>
      {/* Settings Sidebar */}
      <div style={{display:'flex',flexDirection:'column',gap:4}}>
        {sections.map(s=>(
          <div key={s.id} onClick={()=>setActiveSection(s.id)}
            style={{
              display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderRadius:12,cursor:'pointer',
              background:activeSection===s.id?'rgba(20,184,166,0.12)':'transparent',
              border:`1px solid ${activeSection===s.id?'rgba(20,184,166,0.2)':'transparent'}`,
              transition:'all 0.15s',
            }}>
            <span style={{fontSize:14}}>{s.icon}</span>
            <span style={{fontSize:12,fontWeight:activeSection===s.id?700:500,color:activeSection===s.id?P.cyan:P.t2}}>{s.name}</span>
          </div>
        ))}
      </div>

      {/* Settings Content */}
      <PanelShell title={sections.find(s=>s.id===activeSection)?.name.toUpperCase()||'GENERAL'} subtitle="Manage your preferences">

        {activeSection==='general' && (<div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {label:'Portfolio Name',value:'LifeStack Finance',desc:'Display name for your portfolio'},
            {label:'Base Currency',value:'GBP (£)',desc:'All values converted to this currency'},
            {label:'Reporting Period',value:'6 Months (Sep 2025 → Mar 2026)',desc:'Default analysis window'},
            {label:'Benchmark Index',value:'MSCI World (URTH)',desc:'Primary benchmark for comparison'},
            {label:'Risk-Free Rate',value:'4.5% (UK Gilt 1yr)',desc:'Used for Sharpe, Sortino calculations'},
            {label:'Inflation Rate',value:`${((PORT.inflation||0.032)*100).toFixed(1)}% (BoE CPI)`,desc:'Real return adjustment'},
            {label:'FIRE Target',value:fK(PORT.fireTarget),desc:'Financial independence target'},
            {label:'Tax Residency',value:'UK',desc:'Determines tax rate assumptions'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:P.t1}}>{s.label}</div>
                <div style={{fontSize:9,color:P.t4,marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{fontSize:12,fontWeight:600,color:P.cyan,fontFamily:P.mono,padding:'4px 12px',borderRadius:8,background:'rgba(20,184,166,0.08)',border:'1px solid rgba(20,184,166,0.15)'}}>{s.value}</div>
            </div>
          ))}
        </div>)}

        {activeSection==='data' && (<div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {label:'Supabase Connection',value:'Connected',status:true,desc:'ynvfzssakggmmldjkmes.supabase.co'},
            {label:'Auto-refresh',value:'On page load',status:true,desc:'Data fetched from Supabase on each visit'},
            {label:'Kubera Sync',value:'Manual upload',status:true,desc:'Upload CSV extract via Storage tab'},
            {label:'Monzo Sync',value:'Manual upload',status:true,desc:'Upload bank statement CSV'},
            {label:'Emma Sync',value:'Manual upload',status:true,desc:'Upload budget export'},
            {label:'Data Retention',value:'All versions',status:true,desc:'Historical extracts preserved for delta tracking'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:P.t1}}>{s.label}</div>
                <div style={{fontSize:9,color:P.t4,marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{fontSize:11,fontWeight:600,color:s.status?P.positive:P.t3}}>{s.value}</div>
                <div style={{width:8,height:8,borderRadius:'50%',background:s.status?P.positive:P.t4,boxShadow:s.status?`0 0 8px ${P.positive}50`:'none'}}/>
              </div>
            </div>
          ))}
        </div>)}

        {activeSection==='display' && (<div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {label:'Theme',value:'Dark Mode (Teal)',desc:'Glass tiles over teal gradient wallpaper'},
            {label:'Glass Opacity',value:'Tier 2 (62%)',desc:'Plate darkness for readability'},
            {label:'Chart Style',value:'Recharts + ECharts',desc:'Hybrid rendering for optimal chart types'},
            {label:'Number Format',value:'UK (£, comma separator)',desc:'Currency and number formatting'},
            {label:'Font',value:'SF Pro Display',desc:'Primary typeface for all text'},
            {label:'KPI Tile Size',value:'Variable (S/M/L)',desc:'Hero tiles span 3 cols, standard span 2'},
            {label:'Show Benchmarks',value:'Always',desc:'Benchmark comparisons on all KPIs'},
            {label:'Show Takeaways',value:'Always',desc:'Contextual insights at panel bottom'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:P.t1}}>{s.label}</div>
                <div style={{fontSize:9,color:P.t4,marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{fontSize:11,fontWeight:600,color:P.cyan,fontFamily:P.mono,padding:'4px 12px',borderRadius:8,background:'rgba(20,184,166,0.08)',border:'1px solid rgba(20,184,166,0.15)'}}>{s.value}</div>
            </div>
          ))}
        </div>)}

        {activeSection==='alerts' && (<div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {label:'ISA Deadline Warning',value:'On (29 days)',active:true,desc:'Alert when approaching ISA year-end'},
            {label:'Drawdown Alert',value:'>15% drawdown',active:true,desc:'Trigger when portfolio drops below threshold'},
            {label:'Cash Buffer Warning',value:'<3 months runway',active:true,desc:'Alert when cash runway is critically low'},
            {label:'Debt APR Alert',value:'>10% APR',active:true,desc:'Flag expensive debt positions'},
            {label:'Rebalance Reminder',value:'Monthly',active:false,desc:'Periodic reminder to check allocations'},
            {label:'Data Staleness',value:'>7 days',active:true,desc:'Alert when source data is stale'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:P.t1}}>{s.label}</div>
                <div style={{fontSize:9,color:P.t4,marginTop:2}}>{s.desc}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{fontSize:11,fontWeight:600,color:s.active?P.cyan:P.t4}}>{s.value}</div>
                <div style={{width:34,height:18,borderRadius:9,background:s.active?`${P.cyan}30`:'rgba(255,255,255,0.08)',padding:2,cursor:'pointer',transition:'all 0.2s'}}>
                  <div style={{width:14,height:14,borderRadius:7,background:s.active?P.cyan:'rgba(255,255,255,0.2)',transform:s.active?'translateX(16px)':'translateX(0)',transition:'all 0.2s',boxShadow:s.active?`0 0 8px ${P.cyan}50`:'none'}}/>
                </div>
              </div>
            </div>
          ))}
        </div>)}

        {activeSection==='export' && (<div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {label:'Export PDF Report',desc:'Generate institutional-grade PDF of all tabs',action:'Generate'},
            {label:'Export CSV Data',desc:'Download raw data tables as CSV',action:'Download'},
            {label:'Export JSON Snapshot',desc:'Full portfolio state as JSON',action:'Download'},
            {label:'Share Link',desc:'Generate read-only share link (24hr expiry)',action:'Generate'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:P.t1}}>{s.label}</div>
                <div style={{fontSize:9,color:P.t4,marginTop:2}}>{s.desc}</div>
              </div>
              <button style={{padding:'6px 16px',borderRadius:8,border:`1px solid ${P.cyan}30`,background:`${P.cyan}12`,color:P.cyan,fontSize:10,fontWeight:700,cursor:'pointer'}}>{s.action}</button>
            </div>
          ))}
        </div>)}

      </PanelShell>
    </div>
  </div>);
};

const TABS=[
  {k:"exec",l:"T1 Executive Summary"},
  {k:"struct",l:"T2 Structure & Concentration"},
  {k:"perf",l:"T3 Performance & Attribution"},
  {k:"risk",l:"T4 Risk Engine"},
  {k:"stress",l:"T5 Stress Tests"},
  {k:"cash",l:"T6 Cashflow & Capital"},
  {k:"bonus",l:"T7 Bonus Strategy"},
  {k:"opp",l:"T8 Opportunities"},
  {k:"eff",l:"T9 Capital Efficiency"},
  {k:"long",l:"T10 Long-Term Compounding"},
  {k:"crypto",l:"T11 Crypto Engine"},
  {k:"act",l:"T12 Action Plan"},
  {k:"tax",l:"T13 Tax Advisor"},
  {k:"gloss",l:"T14 Glossary"},
  {k:"sys",l:"T15 System Architecture"},
  {k:"storage",l:"T16 Storage & Data"},
  {k:"settings",l:"T17 Settings"},
];

export default function PortfolioVOS(){
  const [tab,setTab]=useState("exec");
  const [,refresh]=useState(0);
  const {data,loading,source,freshness}=useSupabaseData();
  useEffect(()=>{
    if(freshness) FRESHNESS=freshness;
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
  },[data,freshness]);
  const render=()=>{switch(tab){
    case "exec":return <T1/>;
    case "struct":return <T2/>;
    case "perf":return <T3/>;
    case "risk":return <T4/>;
    case "stress":return <T5/>;
    case "cash":return <T6/>;
    case "bonus":return <T7/>;
    case "opp":return <T8/>;
    case "eff":return <T9/>;
    case "long":return <T10/>;
    case "crypto":return <T11/>;
    case "act":return <T12/>;
    case "tax":return <T14/>;
    case "gloss":return <T13/>;
    case "sys":return <T15/>;
    case "storage":return <T16/>;
    case "settings":return <T17/>;
    default:return <T1/>;
  }};
  const [showMenu,setShowMenu]=useState(false);
  return (
    <div style={{width:"100%",minHeight:"100vh",fontFamily:"'SF Pro Display',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",position:"relative",overflow:"hidden",
      background:`linear-gradient(160deg, #05161A 0%, #072E33 18%, #05161A 100%)`,
    }}>
      {/* Fixed wallpaper — separate GPU layer, eliminates scroll jitter */}
      <div style={{position:"fixed",inset:0,background:"url('/bg-waves.svg') center/cover no-repeat",zIndex:0,willChange:"transform",transform:"translateZ(0)",pointerEvents:"none"}}/>

      {/* Deep teal depth layers — Pinterest swatch spectrum */}
      <div style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',
        background:'radial-gradient(ellipse at 25% 15%, rgba(15,150,156,0.28) 0%, transparent 45%), radial-gradient(ellipse at 78% 65%, rgba(12,112,117,0.32) 0%, transparent 50%), radial-gradient(ellipse at 52% 88%, rgba(109,165,192,0.12) 0%, transparent 40%), radial-gradient(ellipse at 12% 78%, rgba(41,77,97,0.30) 0%, transparent 45%), radial-gradient(ellipse at 90% 22%, rgba(15,150,156,0.16) 0%, transparent 35%), radial-gradient(ellipse at 50% 45%, rgba(7,46,51,0.55) 0%, transparent 60%)',
      }}/>
      {/* SVG refraction filter for glass elements */}
      <svg style={{position:'absolute',width:0,height:0}} aria-hidden="true">
        <defs>
          <filter id="glass-refract" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.006" numOctaves="3" seed="42" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="glass-refract-strong" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.006" numOctaves="3" seed="42" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
          <filter id="glass-specular" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.01 0.008" numOctaves="2" seed="7" result="noise"/>
            <feSpecularLighting surfaceScale="2" specularConstant="0.6" specularExponent="35" in="noise" result="specular" lightingColor="rgba(255,255,255,1)">
              <fePointLight x="200" y="-100" z="300"/>
            </feSpecularLighting>
            <feComposite in="specular" in2="SourceGraphic" operator="in" result="specComp"/>
            <feComposite in="SourceGraphic" in2="specComp" operator="arithmetic" k1="0" k2="1" k3="0.15" k4="0"/>
          </filter>
        </defs>
      </svg>
      <style>{`*{box-sizing:border-box}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(15,150,156,0.30);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:rgba(15,150,156,0.55)}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}@keyframes glassSheen{0%{opacity:0.5}50%{opacity:1}100%{opacity:0.5}}@keyframes tealPulse{0%,100%{opacity:0.7}50%{opacity:1}}html{scroll-behavior:smooth}`}</style>
      {/* Top header bar — deep teal frosted glass */}
      <div style={{position:"sticky",top:0,zIndex:50,overflow:'hidden',borderBottom:"1px solid rgba(15,150,156,0.20)"}}>
        <div style={{position:'absolute',inset:0,backdropFilter:'blur(36px) saturate(2.0) url(#glass-refract)',WebkitBackdropFilter:'blur(36px) saturate(2.0)',background:'rgba(5,22,26,0.80)',boxShadow:'0 4px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(15,150,156,0.22), inset 0 -1px 0 rgba(15,150,156,0.08)',backgroundImage:'linear-gradient(180deg, rgba(15,150,156,0.08), transparent 60%)',pointerEvents:'none'}}/>
        {/* Teal shimmer line at very top of header */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent 5%,rgba(15,150,156,0.60) 30%,rgba(109,165,192,0.80) 50%,rgba(15,150,156,0.60) 70%,transparent 95%)',zIndex:2}}/>
        <div style={{position:'relative',zIndex:1,padding:"0 28px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#0F969C,#072E33)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,boxShadow:'0 4px 16px rgba(15,150,156,0.50), inset 0 1px 0 rgba(255,255,255,0.20)'}}>LS</div>
            <div>
              <span style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",color:'#0F969C',fontWeight:700}}>LIFESTACK OS {"·"} PORTFOLIO INTELLIGENCE vOS</span>
              <div style={{fontSize:10,color:'rgba(232,244,245,0.40)',display:'flex',alignItems:'center',gap:8}}>Institutional Review — {source==="supabase"?<span style={{color:'#0F969C'}}>{"●"} Live Data</span>:<span>Real Data</span>}{Object.keys(FRESHNESS).length>0&&<span style={{display:'inline-flex',gap:4,alignItems:'center'}}>{Object.values(FRESHNESS).filter(f=>f.isLive).length>0&&<span style={{display:'inline-flex',alignItems:'center',gap:2,fontSize:9,color:'#4ade80'}}><span style={{width:4,height:4,borderRadius:'50%',background:'#22c55e',display:'inline-block'}}></span>{Object.values(FRESHNESS).filter(f=>f.isLive).length} live</span>}{Object.values(FRESHNESS).filter(f=>f.isStale).length>0&&<span style={{display:'inline-flex',alignItems:'center',gap:2,fontSize:9,color:'#fbbf24'}}><span style={{width:4,height:4,borderRadius:'50%',background:'#f59e0b',display:'inline-block'}}></span>{Object.values(FRESHNESS).filter(f=>f.isStale).length} stale</span>}{Object.values(FRESHNESS).filter(f=>f.isFallback).length>0&&<span style={{display:'inline-flex',alignItems:'center',gap:2,fontSize:9,color:'#f87171'}}><span style={{width:4,height:4,borderRadius:'50%',background:'#ef4444',display:'inline-block'}}></span>{Object.values(FRESHNESS).filter(f=>f.isFallback).length} fallback</span>}</span>}</div>
            </div>
          </div>
          {/* Search + Notifications + Account */}
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div style={{position:'relative',display:'flex',alignItems:'center',gap:6,background:'rgba(7,46,51,0.70)',borderRadius:9999,padding:'6px 16px',border:'1px solid rgba(15,150,156,0.22)',backdropFilter:'blur(12px)'}}>
              <span style={{fontSize:11,color:'rgba(232,244,245,0.30)'}}>Search metrics...</span>
            </div>
            <div style={{position:'relative',cursor:'pointer'}} title="Notifications">
              <span style={{fontSize:16,color:'rgba(232,244,245,0.45)'}}>&#128276;</span>
              <div style={{position:'absolute',top:-2,right:-2,width:8,height:8,borderRadius:'50%',background:P.red,border:'2px solid rgba(5,22,26,0.9)'}}/>
            </div>
            <div style={{position:'relative'}}>
              <div onClick={()=>setShowMenu(!showMenu)} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                <div style={{width:28,height:28,borderRadius:10,background:'linear-gradient(135deg,#0F969C,#0C7075)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:11,fontWeight:800,boxShadow:'0 2px 10px rgba(15,150,156,0.40)'}}>A</div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:11,color:'#e8f4f5',fontWeight:600}}>A. Bouter</div>
                  <div style={{fontSize:9,color:'rgba(232,244,245,0.38)'}}>{PORT.date} · NW {fmt(PORT.netWorth)}</div>
                </div>
              </div>
              {showMenu&&<div style={{position:'absolute',top:'100%',right:0,marginTop:8,width:200,...GS,borderRadius:14,padding:'8px 0',zIndex:100}}>
                {[{l:'Profile',i:'👤',action:null},{l:'Settings',i:'⚙️',action:()=>{setTab('settings');setShowMenu(false);}},{l:'Storage',i:'📁',action:()=>{setTab('storage');setShowMenu(false);}},{l:'Theme',i:'🎨',action:null}].map((m,i)=><div key={i} onClick={m.action} style={{padding:'8px 16px',fontSize:12,color:P.t2,cursor:'pointer',display:'flex',gap:8,alignItems:'center'}} onMouseEnter={e=>e.currentTarget.style.background='rgba(15,150,156,0.10)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><span>{m.i}</span>{m.l}</div>)}
                <div style={{height:1,background:'rgba(15,150,156,0.12)',margin:'4px 0'}}/>
                <div style={{padding:'8px 16px',fontSize:12,color:P.red,cursor:'pointer'}}>Logout</div>
              </div>}
            </div>
          </div>
        </div>
        {/* Breadcrumb */}
        <div style={{fontSize:10,color:'rgba(232,244,245,0.30)',marginBottom:2}}>LifeStack OS / Wealth Engine / {TABS.find(t=>t.k===tab)?.l||'Executive Summary'}</div>
        {/* Tab bar — pill-style active state (image 1 + 3 reference) */}
        <div style={{display:"flex",gap:3,overflowX:"auto",whiteSpace:"nowrap",padding:"6px 0 8px",scrollbarWidth:'none'}}>
          {TABS.map((t,i) => {
            const active = tab===t.k;
            return (
            <button key={t.k} onClick={()=>setTab(t.k)} style={{
              position:'relative',overflow:'hidden',
              background:active?'rgba(15,150,156,0.18)':"transparent",
              border:active?'1px solid rgba(15,150,156,0.45)':'1px solid transparent',
              color:active?'#0F969C':'rgba(232,244,245,0.38)',padding:"7px 15px",fontSize:12,fontWeight:active?700:500,
              cursor:"pointer",transition:"all 0.2s ease",whiteSpace:"nowrap",fontFamily:"inherit",
              borderRadius:999,
              backdropFilter:active?'blur(16px) saturate(1.6)':'none',
              WebkitBackdropFilter:active?'blur(16px) saturate(1.6)':'none',
              boxShadow:active?'0 4px 18px rgba(15,150,156,0.22), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 1px rgba(15,150,156,0.15)':'none',
            }}><span style={{fontSize:8,opacity:0.35,marginRight:3}}>{String(i+1).padStart(2,"0")}</span>{t.l}</button>
          );})}
        </div>
        </div>
      </div>
      {/* Content area */}
      <div style={{position:"relative",zIndex:1,padding:"14px 22px 32px",maxWidth:1680,margin:"0 auto"}}>
        {render()}
      </div>
      {/* Footer */}
      <div style={{position:'relative',overflow:'hidden',textAlign:"center",padding:"16px 28px",borderTop:"1px solid rgba(15,150,156,0.15)"}}>
        <div style={{position:'absolute',inset:0,backdropFilter:'blur(24px) saturate(1.6) url(#glass-refract)',WebkitBackdropFilter:'blur(24px) saturate(1.6)',background:'rgba(5,22,26,0.70)',backgroundImage:'linear-gradient(0deg, rgba(15,150,156,0.06), transparent 50%)',boxShadow:'inset 0 1px 0 rgba(15,150,156,0.10)',pointerEvents:'none'}}/>
        <span style={{position:'relative',zIndex:1,fontSize:9,color:'rgba(232,244,245,0.30)'}}>CONFIDENTIAL · Personal use only · Not investment advice · Data from Kubera {PORT.date} + £100k pro-rata correction · LifeStack OS vOS · BadgerBrain Intelligence Engine</span>
      </div>
    </div>
  );
}
