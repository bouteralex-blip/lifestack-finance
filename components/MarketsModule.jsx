'use client';
import React, { useState } from "react";
import { BarChart, Bar, AreaChart, Area, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, ReferenceLine, ScatterChart, Scatter } from "recharts";
import { Globe, TrendingUp, AlertTriangle, Activity, BarChart3, Zap, DollarSign, Shield, Target, Radio, Layers, Box, Cpu, Building2, Landmark, CircleDot, FileText, Briefcase, Factory, Flame, Map, Users, Gem, ChevronRight, ChevronDown } from "lucide-react";

// =========================================================================
// LIFESTACK OS — MARKET & RESEARCH ANALYSIS MODULE v3.0
// Horizon Glass · Liquid Refraction · Luxury Teal-Navy System
// 24 Tabs | 17 Upgrades Integrated | Teal-Navy Accent
// Data: 7 March 2026 | Sources: FRED, GMD, MacroMicro, CoinGecko,
// LookIntoBitcoin, WB PPI, StockGeist, Dune, CarbonCredits, CFTC
// Phase 2 MCP: FRED, Yahoo Finance, FMP, Octagon AI, Financial Datasets
// Phase 2 Quant: Riskfolio-Lib (24 risk measures), skfolio (ML clustering)
// =========================================================================

// --- PALETTE: Deep Navy-Teal Spectrum (Pinterest #05161A → #0F969C → #6DA5C0) ---
const P={
  bg:"#05161A",
  cyan:"#0F969C",cyanD:"rgba(15,150,156,0.12)",cyanG:"rgba(15,150,156,0.05)",
  indigo:"#6DA5C0",indigoD:"rgba(109,165,192,0.12)",
  amber:"#f59e0b",amberD:"rgba(245,158,11,0.08)",
  red:"#ef4444",redD:"rgba(239,68,68,0.08)",
  green:"#22c55e",greenD:"rgba(34,197,94,0.08)",
  purple:"#a855f7",orange:"#fb923c",btc:"#f7931a",pink:"#ec4899",
  teal:"#0F969C",sky:"#6DA5C0",
  positive:"#0F969C",negative:"#f43f5e",
  t1:"#e8f4f5",t2:"#b0cdd4",t3:"#7a9da6",t4:"rgba(255,255,255,0.55)",t5:"rgba(255,255,255,0.35)",
  b1:"rgba(15,150,156,0.18)",b2:"rgba(15,150,156,0.10)",b3:"rgba(15,150,156,0.05)",
  mono:"'JetBrains Mono','SF Mono','Cascadia Code',monospace",
  l0:"#05161A",l1:"#072E33",l2:"#0C7075",l3:"#0F969C",l4:"#6DA5C0",l5:"#294D61",
  s1:"#0F969C",s2:"#7C6FFF",s3:"#f59e0b",s4:"#FF5C7A",s5:"#3B9EFF",s6:"#FF3BBD",
};

// --- MATERIAL TILE STYLES: Solid gradient accent cards — teal-navy spectrum ---
const MAT={
  teal:{background:'linear-gradient(135deg, #0F969C 0%, #0C7075 50%, #072E33 100%)',boxShadow:'0 8px 32px rgba(15,150,156,0.45), 0 0 80px rgba(15,150,156,0.10), inset 0 1px 0 rgba(255,255,255,0.22)',borderRadius:16,border:'1px solid rgba(15,150,156,0.35)'},
  indigo:{background:'linear-gradient(135deg, #294D61 0%, #1a3548 50%, #05161A 100%)',boxShadow:'0 8px 32px rgba(41,77,97,0.45), 0 0 80px rgba(41,77,97,0.08), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:16,border:'1px solid rgba(109,165,192,0.25)'},
  amber:{background:'linear-gradient(135deg, #d97706, #92400e)',boxShadow:'0 8px 32px rgba(217,119,6,0.30), 0 0 80px rgba(217,119,6,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',borderRadius:16,border:'1px solid rgba(255,255,255,0.12)'},
  red:{background:'linear-gradient(135deg, #dc2626, #7f1d1d)',boxShadow:'0 8px 32px rgba(220,38,38,0.30), 0 0 80px rgba(220,38,38,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',borderRadius:16,border:'1px solid rgba(255,255,255,0.12)'},
  dark:{background:'linear-gradient(135deg, #0C7075 0%, #072E33 50%, #05161A 100%)',boxShadow:'0 8px 32px rgba(12,112,117,0.40), 0 0 80px rgba(12,112,117,0.08), inset 0 1px 0 rgba(255,255,255,0.14)',borderRadius:16,border:'1px solid rgba(15,150,156,0.20)'},
};

// --- LIQUID GLASS SYSTEM: True refraction over teal/navy wallpaper ---
const glassLight=(tier=2)=>{
  const plate=tier===1?'rgba(7,46,51,0.72)':tier===3?'rgba(5,22,26,0.35)':'rgba(7,46,51,0.58)';
  const blur=20;
  const sat=tier===1?1.8:tier===3?1.3:1.6;
  const specular=tier===1?0.22:tier===3?0.10:0.15;
  const sheen=tier===3?0.08:tier===1?0.08:0.06;
  const bdr=tier===1?'rgba(15,150,156,0.32)':tier===3?'rgba(15,150,156,0.10)':'rgba(15,150,156,0.22)';
  return {
    background:plate,
    backdropFilter:`blur(${blur}px) saturate(${sat}) url(#glass-refract)`,
    WebkitBackdropFilter:`blur(${blur}px) saturate(${sat})`,
    border:`1px solid ${bdr}`,
    borderRadius:16,
    boxShadow:`0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,${specular}), inset 0 0 0 1px rgba(15,150,156,0.06)`,
    backgroundImage:`linear-gradient(135deg, rgba(255,255,255,${sheen}) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)`,
  };
};
const G=glassLight(2);const G1=glassLight(1);const G3=glassLight(3);
const GS={
  background:"rgba(7,46,51,0.92)",
  backdropFilter:"blur(20px) saturate(1.6)",WebkitBackdropFilter:"blur(20px) saturate(1.6)",
  border:"1px solid rgba(15,150,156,0.28)",borderRadius:16,
  boxShadow:"0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.16)",
  backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)",
};
const HEADER_BANNER={
  background:'linear-gradient(90deg, rgba(5,22,26,0.92), rgba(7,46,51,0.80) 70%)',
  padding:'10px 16px',borderRadius:'16px 16px 0 0',
  marginBottom:0,display:'flex',justifyContent:'space-between',alignItems:'center',
  backgroundImage:'linear-gradient(90deg, rgba(15,150,156,0.10), transparent 70%)',
  borderBottom:'1px solid rgba(15,150,156,0.16)',
};
const HEADER_TITLE={fontSize:13,fontWeight:800,color:'#e8f4f5',letterSpacing:1.5,textTransform:'uppercase'};
const HEADER_SUB={fontSize:10,fontWeight:500,color:'rgba(232,244,245,0.45)',marginTop:1};

// Backward-compat shim: T maps to P so all existing tab code (T.accent, T.teal, etc.) auto-upgrades
const T={
  bg:P.bg,surface:P.l1,glass:P.cyanG,glassBorder:P.b2,glassRadius:16,glassPad:18,glassGap:14,
  glassBlur:"blur(20px) saturate(1.6)",shadow:"0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15)",
  teal:P.cyan,violet:P.s2,amber:P.amber,coral:P.s4,blue:P.s5,magenta:P.s6,cyan:P.cyan,
  positive:P.positive,negative:P.negative,warning:P.amber,neutral:P.t3,
  btc:P.btc,eth:"#627EEA",sol:"#9945FF",
  t1:P.t1,t2:P.t2,t3:P.t3,
  accent:P.cyan,accentSub:P.cyanD,accentGlow:"rgba(15,150,156,0.12)",grid:P.b3,
  cp:[P.s1,P.s2,P.s3,P.s4,P.s5,P.s6,P.cyan,P.green],
};
const hx=h=>{h=h.replace("#","");return[parseInt(h.substring(0,2),16),parseInt(h.substring(2,4),16),parseInt(h.substring(4,6),16)].join(",");};
const GW=(c=T.accent)=>`0 0 24px rgba(${hx(c)},0.15), 0 0 60px rgba(${hx(c)},0.06)`;

// =========================================================================
// MARKET DATA ENGINE — 7 MARCH 2026
// Upgrade #1: GMD unified macro layer | #6: MacroMicro MOVE
// =========================================================================
const M={date:"7 March 2026",regime:"LATE CYCLE — INFLATION SCARE",regimeConf:68,
// Equities
sp500:6831,sp500ATH:7008,sp500PE:29,sp500CAPE:40,sp50012m:18,sp500YTD:-0.01,
ftse100:10414,ftse10012m:19,ftse100ATH:10935,ftse250:23727,ftse25012m:12,
msciWorld12m:19.7,msciEurope12m:36.25,msciJapan12m:25.05,msciEM12m:33.57,nikkei:55621,
vix:24.5,move:118,stlfsi:0.8,nfci:0.2, // Upgrade #6: MOVE now sourced from MacroMicro
// Crypto
btcPrice:68200,btcATH:126198,btcDD:-45.9,ethPrice:1975,ethATH:4953,ethDD:-60,solPrice:86,solATH:293,solDD:-71,
fearGreed:18,mvrvZ:0.49,nupl:0.10,btcDom:58.2,rsi:27.5,etfFlow:"+$500M (5 Mar)",reserves:"2.48M ATL",whale:"270K BTC 30d",
sopr:0.95,reserveRisk:0.001,hodlWave:"68% held >1yr", // Upgrade #15: HODL Waves + Reserve Risk
// UK Macro
boeRate:3.75,ukCPI:3.0,ukCore:3.1,ukServices:4.4,ukGDP:0.1,ukUnemp:5.2,gilt10y:4.62,gilt2y:3.80,
// FX
gbpusd:1.337,gbpzar:21.87,dxy:95.5,
// Commodities
brent:93.04,wti:91,gold:5280,copper:9200,uranium:78.5, // Upgrade #13: CarbonCredits.com uranium
euETS:68,ukETS:42,
// Credit
igOAS:95,hyOAS:340,bbbOAS:145,
// Rates
fed:4.50,ecb:2.75,boj:0.5,
// Cash
bestSave:4.30,isaDeadlineDays:29,
// Sector
smh12m:70,igv12m:-30,mag7YTD:-6};

// Upgrade #14: Liquidity Divergence Metric (M2 growth % minus S&P growth %)
const LIQ_DIV=[{m:"Sep 25",m2g:3.2,spg:12.1,div:-8.9},{m:"Oct",m2g:3.8,spg:8.4,div:-4.6},{m:"Nov",m2g:4.1,spg:5.2,div:-1.1},{m:"Dec",m2g:4.3,spg:3.8,div:0.5},{m:"Jan 26",m2g:4.6,spg:2.1,div:2.5},{m:"Feb",m2g:4.8,spg:0.5,div:4.3},{m:"Mar",m2g:5.0,spg:-0.01,div:5.0}];

const YIELD_CURVE=[{t:"3M",us:4.35,uk:3.72},{t:"6M",us:4.28,uk:3.68},{t:"1Y",us:4.15,uk:3.74},{t:"2Y",us:4.02,uk:3.80},{t:"3Y",us:3.95,uk:3.92},{t:"5Y",us:4.05,uk:4.15},{t:"7Y",us:4.18,uk:4.35},{t:"10Y",us:4.30,uk:4.62},{t:"30Y",us:4.55,uk:4.85}];

const REGION_RET=[{r:"MSCI Europe",v:36.25,y:11,c:T.violet},{r:"MSCI EM",v:33.57,y:9.2,c:T.teal},{r:"Nikkei",v:25.05,y:5.8,c:T.cyan},{r:"FTSE 100",v:19,y:3.2,c:T.blue},{r:"MSCI World",v:19.7,y:3.0,c:T.neutral},{r:"S&P 500",v:18,y:-0.01,c:T.amber},{r:"FTSE 250",v:12,y:1.5,c:T.coral}];

const SECTOR=[{s:"Semis (SMH)",v:70,c:T.teal},{s:"Comm Svcs",v:33.6,c:T.violet},{s:"Info Tech",v:24,c:T.blue},{s:"Industrials",v:19.4,c:T.cyan},{s:"Financials",v:15,c:T.amber},{s:"Healthcare",v:14.6,c:T.positive},{s:"Energy",v:8.7,c:T.coral},{s:"Software (IGV)",v:-30,c:T.negative}];

const FACTORS=[{f:"Enhanced Value",r:39.4,y:7.8,st:"Leading"},{f:"Value",r:23.5,y:7.8,st:"Leading"},{f:"Momentum",r:20.1,y:3.4,st:"Neutral"},{f:"Small Cap",r:20.4,y:5.6,st:"Improving"},{f:"Quality",r:16.9,y:0,st:"Lagging"},{f:"Growth",r:19.3,y:-1.9,st:"Lagging"}];

const CRYPTO_TL=[{d:"Mar 25",btc:85,fg:45},{d:"Apr",btc:78,fg:32},{d:"May",btc:92,fg:55},{d:"Jun",btc:98,fg:62},{d:"Jul",btc:105,fg:70},{d:"Aug",btc:112,fg:74},{d:"Sep",btc:118,fg:78},{d:"Oct",btc:126,fg:84},{d:"Nov",btc:100,fg:38},{d:"Dec",btc:88,fg:28},{d:"Jan 26",btc:82,fg:24},{d:"Feb",btc:65,fg:12},{d:"Mar",btc:68,fg:18}];

const CREDIT_TL=[{d:"Sep 25",ig:85,hy:310},{d:"Oct",ig:90,hy:325},{d:"Nov",ig:88,hy:318},{d:"Dec",ig:92,hy:330},{d:"Jan 26",ig:90,hy:322},{d:"Feb",ig:93,hy:335},{d:"Mar",ig:95,hy:340}];

const VOL_TL=[{d:"Sep 25",vix:14,move:95,cv:35},{d:"Oct",vix:22,move:125,cv:65},{d:"Nov",vix:18,move:108,cv:55},{d:"Dec",vix:16,move:100,cv:48},{d:"Jan 26",vix:15,move:98,cv:42},{d:"Feb",vix:21,move:112,cv:52},{d:"Mar",vix:24.5,move:118,cv:50}];

// Upgrade #16: Media-vs-Flow Divergence Data (StockGeist sentiment vs ETF flows)
const SENT_DIV=[{theme:"Crypto/BTC",sentiment:-82,flowDir:"+$500M 5 Mar",signal:"DIVERGENCE: Extreme negative sentiment BUT whale buying + ETF inflows resuming",col:T.teal},
{theme:"US Tech/Mag7",sentiment:-45,flowDir:"Net outflows",signal:"ALIGNED: Negative sentiment confirmed by outflows. No contrarian signal.",col:T.coral},
{theme:"European Equities",sentiment:+32,flowDir:"$4B+ EM/EAFE inflows Jan",signal:"ALIGNED: Positive sentiment confirmed by strong institutional flows.",col:T.teal},
{theme:"UK Gilts",sentiment:-68,flowDir:"Selling pressure",signal:"ALIGNED: Negative sentiment confirmed by 40bp weekly yield surge. Avoid.",col:T.coral},
{theme:"Gold/Real Assets",sentiment:+55,flowDir:"Strong inflows",signal:"ALIGNED: HALO trade confirmed by both sentiment and flows. +80% 12M.",col:T.teal},
{theme:"Software/SaaS",sentiment:-72,flowDir:"Heavy outflows",signal:"ALIGNED: SaaSpocalypse confirmed. IGV -30%. Wait for stabilisation.",col:T.coral}];

// Upgrade #2: World Bank PPI — Infrastructure Deal Data (free)
const WB_PPI=[{region:"Sub-Saharan Africa",deals:47,value:12.8,topSector:"Energy",trend:"Growing"},{region:"South Asia",deals:38,value:18.2,topSector:"Transport",trend:"Stable"},{region:"East Asia",deals:62,value:45.1,topSector:"Digital/Telecom",trend:"Growing"},{region:"Latin America",deals:41,value:22.6,topSector:"Energy",trend:"Growing"},{region:"Europe & Central Asia",deals:29,value:15.3,topSector:"Renewables",trend:"Stable"},{region:"MENA",deals:18,value:8.9,topSector:"Water/Waste",trend:"Declining"}];

const COMMODITY=[{n:"Gold",p:"$5,280",chg:"+80%",sig:"ATH. Geopolitical + inflation hedge.",c:T.amber},{n:"Brent Crude",p:"$93.04",chg:"+22%",sig:"Iran/Hormuz disruption. Energy infra valuations up.",c:T.coral},{n:"Copper",p:"$9,200",chg:"+12%",sig:"Electrification demand structural. Dr Copper stable.",c:T.teal},{n:"Uranium",p:"$78.50",chg:"+18%",sig:"AI power demand reviving nuclear. SMR narrative.",c:T.cyan},{n:"EU ETS Carbon",p:"\u20AC68",chg:"+5%",sig:"Policy stable. Transition price signal.",c:T.violet},{n:"UK ETS Carbon",p:"\u00A342",chg:"+8%",sig:"UK market developing.",c:T.blue},{n:"Silver",p:"$38.20",chg:"+45%",sig:"Industrial + monetary demand.",c:T.neutral},{n:"Nat Gas (EU)",p:"\u20AC42/MWh",chg:"+40%",sig:"Iran/LNG disruption. Wholesale gas surging.",c:T.coral}];

const JPM=[{tk:"JURE",nm:"US Research Enhanced",ret:"12.98%",aum:"7,769",ter:"0.20%",bm:"S&P 500"},{tk:"JGEP",nm:"Global (GBP-H)",ret:"17.62%",aum:"406",ter:"0.25%",bm:"MSCI World"},{tk:"JUKC",nm:"UK Equity Core",ret:"22.89%",aum:"369",ter:"0.25%",bm:"FTSE All-Share"},{tk:"JERE",nm:"Europe Enhanced",ret:"22.17%",aum:"2,492",ter:"0.23%",bm:"MSCI Europe"},{tk:"JMRE",nm:"EM Enhanced",ret:"33.05%",aum:"1,715",ter:"0.35%",bm:"MSCI EM"},{tk:"JRJE",nm:"Japan Enhanced",ret:"22.26%",aum:"356",ter:"0.25%",bm:"MSCI Japan"},{tk:"JRAE",nm:"Asia Pac ex-JP",ret:"~30%",aum:"New",ter:"~0.25%",bm:"MSCI AC AsiaPac"}];

// Scenario data (P14)
const SCENARIOS=[{s:"Base Case",pr:50,sp:"7,200",btc:"$85K",desc:"Late-cycle grind. 2 rate cuts. Broadening earnings. Iran contained.",col:T.blue},
{s:"Bull Case",pr:20,sp:"7,600",btc:"$120K",desc:"Iran de-escalation. 4 rate cuts. AI capex payoff confirmed. Flow chase.",col:T.teal},
{s:"Bear Case",pr:20,sp:"6,200",btc:"$45K",desc:"Stagflation. 0 cuts. Brent >$120. Earnings -15%. Spreads widen 200bp.",col:T.coral},
{s:"Crisis",pr:10,sp:"5,500",btc:"$30K",desc:"Recession. Gilt crisis. Credit freeze. Forced selling across all risk assets.",col:T.negative}];

// =========================================================================
// UI COMPONENTS — HORIZON GLASS · LIQUID TEAL-NAVY SYSTEM
// Shell + plate + content stack, 3 tiers, 135deg locked light,
// teal-tinted borders, dual-shadow depth, graceful fallback
// =========================================================================

// SVG glass refraction filter (injected once at root)
const GlassDefs=()=>(
  <svg style={{position:'absolute',width:0,height:0}} aria-hidden="true">
    <defs>
      <filter id="glass-refract" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise"/>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>
);

// Glass panel — uses glassLight() teal-navy plates
const Glass=({children,style={},glow=false,accent=P.cyan,tier=2})=>{
  const gs=glassLight(tier);
  const glowColor=accent||P.cyan;
  return(
    <div style={{position:'relative',borderRadius:16,overflow:'hidden',marginBottom:14,
      ...(style.flex?{flex:style.flex}:{}),
      ...(style.minWidth?{minWidth:style.minWidth}:{}),
      ...(style.borderTop?{}:{}),
    }}>
      {/* Shell: blur + refraction */}
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:gs.backdropFilter,WebkitBackdropFilter:gs.WebkitBackdropFilter,
        border:gs.border,backgroundImage:gs.backgroundImage,
        boxShadow:glow?`${gs.boxShadow}, ${GW(glowColor)}`:gs.boxShadow,
        pointerEvents:'none',transition:'box-shadow 0.3s ease',
      }}/>
      {/* Plate: dark teal readability surface */}
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',background:gs.background,pointerEvents:'none'}}/>
      {/* Teal accent top line */}
      <div style={{position:'absolute',top:0,left:'8%',right:'8%',height:1,
        background:`linear-gradient(90deg,transparent,${glowColor}50,transparent)`,
        pointerEvents:'none',borderRadius:1,
      }}/>
      {/* Content */}
      <div style={{position:'relative',zIndex:1,
        padding:style.padding||18,
        ...(style.textAlign?{textAlign:style.textAlign}:{}),
        ...(style.borderTop?{borderTop:style.borderTop}:{}),
        ...(style.borderLeft?{borderLeft:style.borderLeft}:{}),
      }}>{children}</div>
    </div>
  );
};

// KPI tile — rich accent-edge tile matching PortfolioVOS K component
const KPI=({label,value,delta,dt="up",sub,ac})=>{
  const dc=dt==="up"?P.positive:dt==="down"?P.negative:P.t3;
  const di=dt==="up"?"▲":dt==="down"?"▼":"●";
  const acColor=ac||P.cyan;
  return(
    <div style={{position:'relative',borderRadius:16,overflow:'hidden',flex:"1 1 145px",minWidth:130,marginBottom:14}}>
      {/* Shell */}
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:'blur(24px) saturate(1.7) url(#glass-refract)',WebkitBackdropFilter:'blur(24px) saturate(1.7)',
        border:'1px solid rgba(255,255,255,0.14)',
        backgroundImage:'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 40%, transparent 60%, rgba(255,255,255,0.04) 100%)',
        boxShadow:'0 16px 48px rgba(0,0,0,0.30), 0 4px 14px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(255,255,255,0.04)',
        pointerEvents:'none',
      }}/>
      {/* Plate */}
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',background:'rgba(7,46,51,0.62)',pointerEvents:'none'}}/>
      {/* Accent bottom edge */}
      <div style={{position:'absolute',bottom:0,left:'8%',right:'8%',height:3,
        background:`linear-gradient(90deg, transparent, ${acColor}80, transparent)`,
        borderRadius:2,pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1,padding:"16px 15px",textAlign:"center"}}>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.55)',textTransform:"uppercase",letterSpacing:1.5,fontWeight:700,marginBottom:5}}>{label}</div>
        <div style={{fontSize:24,fontWeight:800,color:acColor,fontFamily:P.mono,letterSpacing:-0.5,lineHeight:1.1}}>{value}</div>
        {delta&&<div style={{display:'inline-flex',alignItems:'center',gap:3,marginTop:5,fontSize:10,fontWeight:700,
          color:dc,background:dt==="up"?'rgba(15,150,156,0.18)':dt==="down"?'rgba(244,63,94,0.15)':'rgba(255,255,255,0.06)',
          padding:'2px 7px',borderRadius:4,
        }}>{di} {delta}</div>}
        {sub&&<div style={{fontSize:9,color:P.t3,marginTop:3,lineHeight:1.3}}>{sub}</div>}
      </div>
    </div>
  );
};

// Section header — 24px luxury title matching PortfolioVOS
const Hd=({t,s,tag,ac=P.cyan})=>(
  <div style={{marginBottom:18,marginTop:6}}>
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <h2 style={{fontSize:24,fontWeight:800,color:P.t1,margin:0,letterSpacing:-0.4,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{t}</h2>
      {tag&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${ac}20`,color:ac,textTransform:"uppercase",letterSpacing:1.2,border:`1px solid ${ac}30`}}>{tag}</span>}
    </div>
    {s&&<p style={{fontSize:12,color:P.t3,margin:"5px 0 0",lineHeight:1.5}}>{s}</p>}
  </div>
);

// Insight callout — 4px border, gradient bg, 13px text
const Ins=({text,type="insight"})=>{
  const c={insight:P.cyan,warning:P.amber,action:P.s2,risk:P.negative,opportunity:P.positive,regime:P.sky,source:P.t3}[type]||P.cyan;
  return(
    <div style={{position:'relative',overflow:'hidden',padding:"16px 20px",borderLeft:`4px solid ${c}`,borderRadius:"0 14px 14px 0",marginBottom:14}}>
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:'blur(14px) saturate(1.3)',WebkitBackdropFilter:'blur(14px) saturate(1.3)',
        background:`linear-gradient(135deg,${c}14,rgba(7,46,51,0.65) 70%)`,
        border:'1px solid rgba(255,255,255,0.06)',borderLeft:'none',
        boxShadow:'0 8px 24px rgba(0,0,0,0.28)',
        pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1}}>
        <div style={{fontSize:10,color:c,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",marginBottom:5}}>{type}</div>
        <div style={{fontSize:13,color:P.t2,lineHeight:1.7,fontWeight:500}}>{text}</div>
      </div>
    </div>
  );
};

const Row=({children,gap=14,style})=>(<div style={{display:"flex",flexWrap:"wrap",gap,...style}}>{children}</div>);
const Grid=({children,cols="1fr 1fr",gap=14,style={}})=>(<div style={{display:"grid",gridTemplateColumns:cols,gap,...style}}>{children}</div>);

// Table — glass panel bg, hover rows, richer typography
const Tbl=({h,r,hl})=>(
  <div style={{overflowX:"auto",borderRadius:14,border:'1px solid rgba(15,150,156,0.15)',background:"rgba(7,46,51,0.52)",boxShadow:'0 8px 32px rgba(0,0,0,0.25)'}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead><tr>{h.map((x,i)=><th key={i} style={{textAlign:i===0?"left":"right",padding:"10px 14px",borderBottom:'1px solid rgba(15,150,156,0.15)',color:P.t3,fontWeight:700,fontSize:10,textTransform:"uppercase",letterSpacing:0.8,background:"rgba(5,22,26,0.60)"}}>{x}</th>)}</tr></thead>
      <tbody>{r.map((row,ri)=><tr key={ri} style={{transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(15,150,156,0.06)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>{row.map((cell,ci)=>{const neg=typeof cell==="string"&&cell.startsWith("-");const pos=typeof cell==="string"&&cell.startsWith("+");return<td key={ci} style={{textAlign:ci===0?"left":"right",padding:"9px 14px",borderBottom:'1px solid rgba(15,150,156,0.07)',color:hl===ci?(neg?P.negative:pos?P.positive:P.t1):(ci===0?P.t1:P.t2),fontWeight:ci===0||hl===ci?600:500,fontSize:12,fontFamily:ci>0?P.mono:"inherit"}}>{cell}</td>;})}</tr>)}</tbody>
    </table>
  </div>
);

// Tooltip — liquid glass, teal spec
const Tip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(
    <div style={{position:'relative',borderRadius:14,overflow:'hidden',minWidth:145,boxShadow:'0 12px 40px rgba(0,0,0,0.50)'}}>
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        backdropFilter:'blur(24px) saturate(1.6)',WebkitBackdropFilter:'blur(24px) saturate(1.6)',
        background:'rgba(5,22,26,0.88)',border:'1px solid rgba(15,150,156,0.28)',pointerEvents:'none',
      }}/>
      <div style={{position:'absolute',inset:0,borderRadius:'inherit',
        background:'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 50%)',opacity:0.7,pointerEvents:'none',
      }}/>
      <div style={{position:'relative',zIndex:1,padding:"10px 14px"}}>
        <div style={{color:P.t3,marginBottom:5,fontSize:10,fontWeight:700,letterSpacing:1,textTransform:'uppercase',borderBottom:'1px solid rgba(15,150,156,0.12)',paddingBottom:4}}>{label}</div>
        {payload.filter(p=>p.value!=null).map((p,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:7,marginBottom:3}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:p.color||P.cyan,boxShadow:`0 0 8px ${p.color||P.cyan}`,flexShrink:0}}/>
            <span style={{fontSize:11,color:P.t2,flex:1}}>{p.name}</span>
            <span style={{fontSize:12,color:p.color||P.cyan,fontWeight:700,fontFamily:P.mono}}>{typeof p.value==="number"?p.value.toLocaleString():p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Regime card — MAT tile-style with teal glow
const RegimeCard=({label,conf,color})=>(
  <div style={{position:'relative',overflow:'hidden',borderRadius:16,marginBottom:14}}>
    <div style={{position:'absolute',inset:0,borderRadius:'inherit',
      background:`linear-gradient(135deg, ${color}22 0%, rgba(7,46,51,0.80) 60%, rgba(5,22,26,0.92) 100%)`,
      backdropFilter:'blur(20px) saturate(1.6)',WebkitBackdropFilter:'blur(20px) saturate(1.6)',
      border:`1px solid ${color}35`,
      boxShadow:`0 8px 32px rgba(0,0,0,0.30), 0 0 60px ${color}18, inset 0 1px 0 rgba(255,255,255,0.14)`,
      pointerEvents:'none',
    }}/>
    <div style={{position:'relative',zIndex:1,padding:"20px 24px",textAlign:"center"}}>
      <div style={{fontSize:9,color:P.t3,letterSpacing:1.8,fontWeight:700,textTransform:"uppercase",marginBottom:8}}>MACRO REGIME CLASSIFIER</div>
      <div style={{fontSize:20,fontWeight:800,color,letterSpacing:0.5,textShadow:`0 0 20px ${color}60`}}>{label}</div>
      <div style={{marginTop:12,display:"flex",justifyContent:"center",alignItems:"center",gap:10}}>
        <div style={{height:6,flex:1,maxWidth:180,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden"}}>
          <div style={{width:`${conf}%`,height:"100%",background:`linear-gradient(90deg,${color},${color}99)`,borderRadius:4,boxShadow:`0 0 12px ${color}50`}}/>
        </div>
        <span style={{fontSize:13,fontWeight:800,color,fontFamily:P.mono}}>{conf}%</span>
      </div>
    </div>
  </div>
);

// Verdict panel — teal top-border accent
const Verdict=({label,imp,mon})=>(
  <Glass style={{borderTop:`2px solid ${P.cyan}`}}>
    <div style={{fontSize:9,color:P.cyan,fontWeight:700,letterSpacing:1.5,marginBottom:6,textTransform:'uppercase'}}>TAB VERDICT</div>
    <div style={{fontSize:16,fontWeight:800,color:P.t1,marginBottom:12,lineHeight:1.3}}>{label}</div>
    <div style={{fontSize:9,color:P.t3,fontWeight:700,letterSpacing:1,marginBottom:6,textTransform:'uppercase'}}>TOP 3 IMPLICATIONS</div>
    {imp.map((x,i)=><div key={i} style={{fontSize:12,color:P.t2,padding:"5px 0",borderBottom:`1px solid ${P.b3}`,display:"flex",gap:8,lineHeight:1.5}}>
      <span style={{color:P.cyan,fontWeight:800,fontFamily:P.mono,minWidth:16}}>{i+1}.</span>{x}
    </div>)}
    <div style={{fontSize:9,color:P.t3,fontWeight:700,letterSpacing:1,marginTop:12,marginBottom:6,textTransform:'uppercase'}}>MONITOR NEXT 7-30 DAYS</div>
    {mon.map((x,i)=><div key={i} style={{fontSize:12,color:P.t2,padding:"3px 0"}}>{"•"} {x}</div>)}
  </Glass>
);

// Metric grid — teal left-border tiles
const MetricGrid=({items})=>(
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(175px, 1fr))",gap:9}}>
    {items.map((s,i)=>(
      <div key={i} style={{position:'relative',overflow:'hidden',borderRadius:12}}>
        <div style={{position:'absolute',inset:0,borderRadius:'inherit',
          background:'rgba(7,46,51,0.55)',
          border:'1px solid rgba(15,150,156,0.14)',
          boxShadow:'0 4px 16px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
          pointerEvents:'none',
        }}/>
        <div style={{position:'relative',zIndex:1,padding:"10px 14px",borderLeft:`3px solid ${s.c||P.cyan}`}}>
          <div style={{fontSize:9.5,color:P.t3,letterSpacing:0.5,fontWeight:600,textTransform:'uppercase'}}>{s.l}</div>
          <div style={{fontSize:16,fontWeight:700,color:P.t1,fontFamily:P.mono,margin:"3px 0",lineHeight:1.1}}>{s.v}</div>
          {s.n&&<div style={{fontSize:10,color:s.c||P.t3,lineHeight:1.3}}>{s.n}</div>}
        </div>
      </div>
    ))}
  </div>
);

// Source tag — teal-accent pills
const SourceTag=({sources})=>(
  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
    {sources.map((s,i)=><span key={i} style={{fontSize:8.5,padding:"2px 7px",borderRadius:4,background:P.cyanD,color:P.cyan,fontWeight:600,border:`1px solid ${P.b1}`}}>{s}</span>)}
  </div>
);

// =========================================================================
// P1 — GLOBAL MACRO REGIME DASHBOARD (Upgrades: #1 GMD, #6 MacroMicro MOVE, #14 Liquidity Divergence)
// =========================================================================
const P1=()=>(<div>
<Hd t="GLOBAL MACRO REGIME DASHBOARD" s={`${M.date} | Regime classification, growth nowcast, inflation, rates, liquidity, dollar`} tag="MASTER STATE"/>
<RegimeCard label={M.regime} conf={M.regimeConf} color={T.amber}/>
<Ins type="regime" text={`Late-cycle dynamics confirmed. US growth decelerating, UK stagnant (0.1% QoQ). Inflation sticky above target in both regions. Iran escalation (Brent $93, wholesale gas +40%) has injected an inflation scare into the disinflationary glide path. BoE March cut probability collapsed from 80% to <20%. Gilt 10Y surged 40bp in one week (mini-budget levels). Not yet recession watch, but risk budget must tighten.`}/>
<SourceTag sources={["GMD v2026","FRED API","MacroMicro","IMF WEO","ONS","ECB SDW","BoE Stats"]}/>

<Row><KPI label="S&P 500" value={M.sp500.toLocaleString()} delta={`ATH ${M.sp500ATH.toLocaleString()}`} dt="down" sub="PE 29x | CAPE 40x"/>
<KPI label="FTSE 100" value={M.ftse100.toLocaleString()} delta="+19% 12m" dt="up"/>
<KPI label="VIX" value={M.vix.toFixed(1)} delta="Elevated" dt="down" ac={T.coral}/>
<KPI label="MOVE" value={M.move.toString()} delta="Rate vol high" dt="down" ac={T.coral}/>
<KPI label="Brent" value={`$${M.brent}`} delta="Iran shock" dt="down" ac={T.coral}/>
<KPI label="Gold" value={`$${M.gold.toLocaleString()}`} delta="+80% 12m" dt="up" ac={T.amber}/>
<KPI label="DXY" value={M.dxy.toString()} delta="-10% from highs" dt="up"/></Row>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>MACRO INDICATOR PANEL</div>
<MetricGrid items={[{l:"US GDP",v:"2.3%",n:"Slowing",c:T.amber},{l:"UK GDP QoQ",v:"0.1%",n:"Stagnant",c:T.coral},{l:"US Core CPI",v:"3.1%",n:"Sticky",c:T.coral},{l:"UK CPI",v:`${M.ukCPI}%`,n:"Falling but above target",c:T.amber},{l:"Fed Funds",v:`${M.fed}%`,n:"On hold",c:T.neutral},{l:"BoE Rate",v:`${M.boeRate}%`,n:"Cuts paused — Iran",c:T.amber},{l:"UK 10Y Gilt",v:`${M.gilt10y}%`,n:"40bp weekly surge",c:T.negative},{l:"MOVE Index",v:M.move.toString(),n:"Rate vol elevated (MacroMicro)",c:T.coral}]}/></Glass>

<Grid cols="1fr 1fr">
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>YIELD CURVE — UST vs UK GILT</div>
<div style={{height:220}}><ResponsiveContainer><LineChart data={YIELD_CURVE}><CartesianGrid strokeDasharray="3 3" stroke={T.grid}/><XAxis dataKey="t" tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><YAxis tick={{fill:T.t3,fontSize:10}} stroke={T.grid} domain={[3.4,5.0]} tickFormatter={v=>`${v}%`}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="us" stroke={T.blue} strokeWidth={2.5} dot={{fill:T.blue,r:3}} name="US Treasury"/><Line type="monotone" dataKey="uk" stroke={T.coral} strokeWidth={2.5} dot={{fill:T.coral,r:3}} name="UK Gilt"/></LineChart></ResponsiveContainer></div></Glass>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>LIQUIDITY DIVERGENCE METRIC — M2 Growth % minus S&P Growth %</div>
<div style={{height:200}}><ResponsiveContainer><ComposedChart data={LIQ_DIV}><CartesianGrid strokeDasharray="3 3" stroke={T.grid}/><XAxis dataKey="m" tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><YAxis tick={{fill:T.t3,fontSize:10}} stroke={T.grid} tickFormatter={v=>`${v}%`}/><Tooltip content={<Tip/>}/><Bar dataKey="div" name="Divergence %" radius={[4,4,0,0]}>{LIQ_DIV.map((e,i)=><Cell key={i} fill={e.div>0?T.teal:T.coral}/>)}</Bar><ReferenceLine y={5} stroke={T.teal} strokeDasharray="6 3" strokeOpacity={0.5} label={{value:"Bullish >5%",fill:T.teal,fontSize:9}}/><ReferenceLine y={-5} stroke={T.coral} strokeDasharray="6 3" strokeOpacity={0.5} label={{value:"Bearish <-5%",fill:T.coral,fontSize:9}}/><ReferenceLine y={0} stroke={T.t3} strokeOpacity={0.3}/></ComposedChart></ResponsiveContainer></div>
<Ins type="insight" text={`Liquidity divergence has turned positive and is now at +5.0% — right at the bullish threshold. Global M2 expanding at 5% while S&P is flat YTD means liquidity is building faster than asset prices. Historically, when this metric exceeds +5%, equities rally to close the gap. However, the Iran inflation shock could reverse the easing trend. Watch for central bank balance sheet changes.`}/>
<SourceTag sources={["FRED M2SL","StreetStats Global M2","MacroMicro CB Balance Sheets"]}/></Glass>
</Grid>

<Verdict label="LATE CYCLE — INFLATION SCARE (68% confidence)" imp={[
"Tighten risk budget 10-15%. Iran escalation is repricing the entire rate path. Gilt 40bp weekly move is crisis-level.",
"Liquidity divergence at +5% is bullish IF central banks don't reverse course. This supports equities medium-term but timing is uncertain.",
"Value, real assets, defensive quality over growth and duration. The HALO trade has structural legs."
]} mon={["BoE MPC 19 March — <20% cut probability","US CPI — core above 3.2% kills cut hopes","Iran/Hormuz — Brent >$100 triggers stagflation scenario","Liquidity divergence — sustained >5% confirms bullish regime"]}/></div>);

// =========================================================================
// P2 — LIQUIDITY, RATES & CREDIT (Upgrade #6: MOVE from MacroMicro)
// =========================================================================
const P2=()=>(<div>
<Hd t="LIQUIDITY, RATES & CREDIT" s="Credit spreads, MOVE index, bank lending, money-market hurdle, plumbing stress" tag="FUNDING CONDITIONS"/>
<Row><KPI label="IG OAS" value={`${M.igOAS}bp`} delta="Contained" dt="neutral"/><KPI label="HY OAS" value={`${M.hyOAS}bp`} delta="Watching 400bp" dt="neutral" ac={T.amber}/><KPI label="BBB OAS" value={`${M.bbbOAS}bp`} delta="Stable" dt="neutral"/><KPI label="MOVE Index" value={M.move.toString()} delta="Rate vol elevated" dt="down" ac={T.coral}/><KPI label="Money Mkt Hurdle" value={`${M.bestSave}%`} delta="1Y fix best rate" dt="neutral"/><KPI label="STLFSI" value={M.stlfsi.toFixed(1)} delta="Mild stress" dt="neutral"/></Row>

<Grid cols="1fr 1fr">
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>CREDIT SPREAD TRAJECTORY — IG vs HY OAS (bp)</div>
<div style={{height:200}}><ResponsiveContainer><LineChart data={CREDIT_TL}><CartesianGrid strokeDasharray="3 3" stroke={T.grid}/><XAxis dataKey="d" tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><YAxis tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="ig" stroke={T.blue} strokeWidth={2} name="IG OAS"/><Line type="monotone" dataKey="hy" stroke={T.coral} strokeWidth={2} name="HY OAS"/><ReferenceLine y={400} stroke={T.negative} strokeDasharray="8 4" strokeOpacity={0.4}/></LineChart></ResponsiveContainer></div>
<Ins type="insight" text={`Credit is the calm in the storm. IG at 95bp and HY at 340bp are well below stress thresholds (400bp+ for HY would signal risk-off). This disconnect between rates stress (gilt 40bp weekly surge, MOVE at 118) and credit calm is unusual. Either credit is complacent or rates stress won't transmit to corporate funding. Watch HY closely — widening above 400bp would confirm contagion.`}/>
<SourceTag sources={["FRED BAMLH0A0HYM2","FRED BAMLC0A0CM","MacroMicro MOVE","FRED STLFSI4"]}/></Glass>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>MONEY-MARKET HURDLE vs EQUITY EARNINGS YIELD</div>
<MetricGrid items={[{l:"Best 1Y Fix",v:`${M.bestSave}%`,n:"MBNA/Lloyds",c:T.blue},{l:"Real Cash Yield",v:"~0.8%",n:"After 40% tax + 3% CPI",c:T.amber},{l:"S&P Earnings Yield",v:"~3.4%",n:"1/PE at 29x",c:T.coral},{l:"UK Equity Yield",v:"~5.5%",n:"1/PE at 18x FTSE",c:T.teal},{l:"HY Yield",v:"~7.5%",n:"But default risk rising",c:T.amber},{l:"Cash Hurdle",v:"MODERATE",n:"Cash competitive vs US equity ERP",c:T.amber}]}/></Glass>
</Grid>

<Verdict label="RATES STRESS ELEVATED — CREDIT CALM BUT DISCONNECT IS FRAGILE" imp={[
"MOVE at 118 signals rate volatility hurting duration assets. Do not add long-dated gilts or treasuries.",
"Cash at 4.3% (1Y fix) is genuinely competitive vs S&P earnings yield at 3.4%. No urgency to deploy into US equities at these valuations.",
"Credit-to-rates disconnect is the key watchpoint. If HY OAS widens above 400bp, shift to full defensive posture."
]} mon={["HY OAS — 400bp threshold","MOVE trajectory — sustained >120 is crisis","Bank lending surveys (SLOOS)","Refinancing window — primary issuance volumes"]}/></div>);

// =========================================================================
// P3 — NEWS, NARRATIVE & POLICY (Upgrades: #4 StockGeist, #5 Octagon AI, #16 Media-vs-Flow)
// =========================================================================
const P3=()=>(<div>
<Hd t="BREAKING NEWS, NARRATIVE PULSE & POLICY SHOCK" s="Top stories, sentiment divergence, policy shocks, earnings tracking" tag="NARRATIVE RADAR"/>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>TOP 5 MARKET-MOVING STORIES</div>
{[{s:"Iran escalation reprices global rate path",d:"Brent $93, gas +40%, gilt 40bp surge. BoE cut probability collapsed. Stagflation risk rising.",c:T.coral},
{s:"Value rotation hits 99.8th percentile weekly spread",d:"Bloomberg Pure Value vs Pure Growth spread: +4.06pp in one week — second largest since 2000.",c:T.amber},
{s:"BTC ETF inflows resume — $500M on 5 March",d:"Snaps 6-week outflow streak. Whale accumulation 270K BTC ($23B) in 30 days.",c:T.teal},
{s:"SaaSpocalypse: $1-2T software market cap destroyed",d:"IGV -30% from Sep peak. Claude Cowork launch triggered existential SaaS fears. Forward PE 35x to 20x.",c:T.coral},
{s:"Gold breaks $5,280 — HALO trade dominates 2026",d:"Hard Assets, Low Obsolescence. Defence stocks (Babcock +147%), miners, energy. FTSE 100 outperforming.",c:T.amber}
].map((x,i)=>(<div key={i} style={{padding:"10px 12px",marginBottom:7,background:"rgba(255,255,255,0.02)",borderRadius:10,borderLeft:`3px solid ${x.c}`}}><div style={{fontSize:12,fontWeight:700,color:T.t1}}><span style={{color:x.c,fontFamily:"'JetBrains Mono',monospace"}}>{i+1}.</span> {x.s}</div><div style={{fontSize:11,color:T.t3,marginTop:3,lineHeight:1.5}}>{x.d}</div></div>))}</Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>MEDIA SENTIMENT vs FLOW DIVERGENCE</div>
<div style={{fontSize:9,color:T.accent,fontWeight:600,marginBottom:8}}>UPGRADE: StockGeist NLP sentiment + ETF flow data = contrarian signal detection</div>
{SENT_DIV.map((x,i)=>(<div key={i} style={{padding:"9px 12px",marginBottom:6,background:"rgba(255,255,255,0.02)",borderRadius:10,borderLeft:`3px solid ${x.col}`,display:"flex",flexDirection:"column",gap:3}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11.5,fontWeight:700,color:T.t1}}>{x.theme}</span><span style={{fontSize:10,fontWeight:700,color:x.sentiment<-50?T.coral:x.sentiment>30?T.teal:T.amber,fontFamily:"'JetBrains Mono',monospace"}}>Sentiment: {x.sentiment>0?"+":""}{x.sentiment}</span></div>
<div style={{fontSize:10,color:T.t3}}>Flows: {x.flowDir}</div>
<div style={{fontSize:10.5,color:x.col,fontWeight:600}}>{x.signal}</div></div>))}
<Ins type="opportunity" text={`The key divergence signal: crypto sentiment is at -82 (extreme negative) BUT whale wallets are accumulating $23B and ETF inflows just resumed. This is the classic contrarian setup — dumb money panicking while smart money accumulates. European equities show the opposite: positive sentiment confirmed by $4B+ institutional flows. No contrarian needed — ride the trend.`}/>
<SourceTag sources={["StockGeist NLP","Octagon AI (earnings)","GDELT","CNN F&G","etfdb.com","Finnhub"]}/></Glass>

<Verdict label="GEOPOLITICS DOMINATING — DIVERGENCE SIGNALS ON CRYPTO" imp={[
"Iran is the swing factor. Everything else is secondary until resolution or escalation.",
"Crypto media-vs-flow divergence is the strongest contrarian signal in the module. Continue DCA.",
"SaaSpocalypse is structural. AI agents are genuinely disrupting SaaS. Do not bottom-fish software yet."
]} mon={["Iran/Hormuz developments","StockGeist sentiment shift detection","Octagon AI: next earnings season topic tracking","Regulatory calendar: CARF crypto reporting"]}/></div>);

// =========================================================================
// P4 — EQUITIES, SECTORS & FACTORS (minor upgrades, already built in v1)
// =========================================================================
const P4=()=>(<div>
<Hd t="GLOBAL EQUITIES, SECTORS & FACTORS" s="Regional returns, sector leadership, factor rotation, JPM REI suite" tag="EQUITY INTELLIGENCE"/>
<Ins type="insight" text={`The single most important equity story: non-US outperformance. Every major region beat the S&P 500 over 12 months. Mag 7 all underperforming YTD 2026. In February, S&P tech fell -3.9% while equal-weight rose +3.5%. SMH/IGV divergence (60pp) is 4 standard deviations from normal.`}/>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>REGIONAL RETURN LADDER — 12-MONTH</div>
<div style={{height:230}}><ResponsiveContainer><BarChart data={REGION_RET} layout="vertical" margin={{left:85}}><CartesianGrid strokeDasharray="3 3" stroke={T.grid} horizontal={false}/><XAxis type="number" tick={{fill:T.t3,fontSize:10}} stroke={T.grid} tickFormatter={v=>`${v}%`}/><YAxis type="category" dataKey="r" tick={{fill:T.t2,fontSize:10}} stroke={T.grid} width={80}/><Tooltip content={<Tip/>}/><Bar dataKey="v" name="12M %" radius={[0,6,6,0]}>{REGION_RET.map((e,i)=><Cell key={i} fill={e.c}/>)}</Bar></BarChart></ResponsiveContainer></div></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>SECTOR PERFORMANCE — 12-MONTH</div>
<div style={{height:230}}><ResponsiveContainer><BarChart data={SECTOR} layout="vertical" margin={{left:95}}><CartesianGrid strokeDasharray="3 3" stroke={T.grid} horizontal={false}/><XAxis type="number" tick={{fill:T.t3,fontSize:10}} stroke={T.grid} tickFormatter={v=>`${v}%`}/><YAxis type="category" dataKey="s" tick={{fill:T.t2,fontSize:10}} stroke={T.grid} width={90}/><Tooltip content={<Tip/>}/><Bar dataKey="v" name="12M %" radius={[0,6,6,0]}>{SECTOR.map((e,i)=><Cell key={i} fill={e.c}/>)}</Bar></BarChart></ResponsiveContainer></div></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>FACTOR LEADERSHIP — THE VALUE ROTATION</div>
<Tbl h={["Factor","CY2025","YTD 2026","Status"]} r={FACTORS.map(f=>[f.f,`+${f.r}%`,f.y?`${f.y>0?"+":""}${f.y}%`:"N/A",f.st])} hl={1}/></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>JPM RESEARCH ENHANCED ETF SUITE</div>
<Tbl h={["Ticker","Name","1Y Return","AUM (M)","TER","Benchmark"]} r={JPM.map(e=>[e.tk,e.nm,e.ret,`\u00A3${e.aum}`,e.ter,e.bm])} hl={2}/>
<Ins type="opportunity" text={`JMRE (+33%) and JERE (+22%) riding the rotation. JURE (+13%) lagging from US growth-to-value shift. ISA deadline 29 days: deploy into JERE/JMRE to capture rotation at 0.23-0.35% TER vs traditional active at 1.32%.`}/>
<SourceTag sources={["Yahoo Finance MCP","FMP MCP","Kenneth French","AQR Datasets","Damodaran"]}/></Glass>

<Verdict label="INTERNATIONAL OUTPERFORMANCE CONFIRMED — ROTATION HAS STRUCTURAL LEGS" imp={[
"JURE US overweight is weakest link. Rebalance toward JERE (Europe) and JMRE (EM) via ISA.",
"Value/growth spread +9.7pp YTD has structural support from rates, energy, defence. Do not fight it.",
"Mag 7 capex $660-690B in 2026. NBER: 90% of firms see no AI productivity impact. AI payoff question is THE risk."
]} mon={["MSCI ACWI ex-US vs S&P spread","Software PE stabilisation","Breadth: % S&P above 200dma","ASML order backlog"]}/></div>);

// =========================================================================
// P5 — BONDS, DURATION & FIXED INCOME
// =========================================================================
const P5=()=>(<div>
<Hd t="SOVEREIGN BONDS, DURATION & FIXED INCOME" s="Curves, duration returns, breakevens, term premium, infra debt" tag="RATES COMPLEX"/>
<Row><KPI label="UST 10Y" value="4.30%" delta="Bear steepening" dt="down"/><KPI label="Gilt 10Y" value={`${M.gilt10y}%`} delta="40bp weekly surge" dt="down" ac={T.negative}/><KPI label="Gilt 2Y" value={`${M.gilt2y}%`} delta="Short end stable" dt="neutral"/><KPI label="Bund 10Y" value="~2.8%" delta="Lower than UK/US" dt="neutral"/><KPI label="5Y5Y Breakeven" value="~2.6%" delta="Rising on oil" dt="down" ac={T.coral}/></Row>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>SOVEREIGN YIELD CURVES — UST vs GILT</div>
<div style={{height:220}}><ResponsiveContainer><LineChart data={YIELD_CURVE}><CartesianGrid strokeDasharray="3 3" stroke={T.grid}/><XAxis dataKey="t" tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><YAxis tick={{fill:T.t3,fontSize:10}} stroke={T.grid} domain={[3.4,5.0]} tickFormatter={v=>`${v}%`}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="us" stroke={T.blue} strokeWidth={2.5} dot={{fill:T.blue,r:3}} name="UST"/><Line type="monotone" dataKey="uk" stroke={T.coral} strokeWidth={2.5} dot={{fill:T.coral,r:3}} name="Gilt"/></LineChart></ResponsiveContainer></div>
<Ins type="risk" text={`UK gilt curve is the acute stress point. 10Y at 4.62% with a 40bp weekly move matching the Sep 2022 mini-budget. The curve is inverted short-end (3M 3.72% vs 2Y 3.80%) and steeply positive beyond 5Y. This signals: inflation fear dominating rate-cut optimism. Duration is dangerous. Term premium rising for bad reasons (supply + inflation, not growth optimism).`}/></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>CREDIT CARRY vs CASH HURDLE</div>
<MetricGrid items={[{l:"Best 1Y Fix",v:`${M.bestSave}%`,n:"Risk-free baseline",c:T.blue},{l:"HY Yield",v:"~7.5%",n:"Carry attractive but default risk rising",c:T.amber},{l:"IG Yield",v:"~5.2%",n:"Modest spread over cash",c:T.neutral},{l:"Infra Debt Proxy",v:"~5.8%",n:"Utility bond ETF yield (LQD)",c:T.cyan},{l:"EM Local Yield",v:"~8-10%",n:"ZAR carry positive. GBPZAR 21.87.",c:T.teal},{l:"Duration Return (TLT)",v:"-5% YTD",n:"Long bonds losing money",c:T.coral}]}/>
<SourceTag sources={["FRED DGS series","BoE Stats","ECB SDW","FRED BAML yield indices"]}/></Glass>

<Verdict label="DURATION IS DANGEROUS — STAY SHORT, FAVOUR CASH AND SELECTIVE CARRY" imp={[
"Do not add UK duration. 40bp gilt move is crisis-level. Wait for stabilisation below 4.3%.",
"Cash at 4.3% beats S&P earnings yield (3.4%) on a risk-adjusted basis. Cash is a genuine asset here.",
"EM local debt (ZAR carry) attractive but GBP/ZAR at 21.87 limits new exposure. Hold existing, don't add."
]} mon={["Gilt 10Y — above 5.0% is genuine crisis","Breakeven inflation — oil-driven spike could persist","TLT price action — stabilisation would signal duration buying opportunity","EM rate cut cycle continuation"]}/></div>);

// =========================================================================
// P6 — FX, EM & FRONTIER (Upgrade #1: GMD for EM macro)
// =========================================================================
const P6=()=>(<div>
<Hd t="FX, EM & FRONTIER MARKETS" s="GBP base board, EM carry, ZAR module, China impulse, political risk" tag="CURRENCY & EM"/>
<Row><KPI label="GBP/USD" value={M.gbpusd.toFixed(3)} delta="52wk: 1.27-1.39" dt="neutral"/><KPI label="GBP/ZAR" value={M.gbpzar.toFixed(2)} delta="-7% YoY" dt="down" ac={T.amber}/><KPI label="DXY" value={M.dxy.toString()} delta="-10% from 110" dt="up" ac={T.teal}/><KPI label="EM Carry" value="Attractive" delta="Real yields positive" dt="up" ac={T.teal}/></Row>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>GBP BASE-CURRENCY BOARD</div>
<MetricGrid items={[{l:"GBP/USD",v:M.gbpusd.toFixed(3),n:"Up 3.8% YoY. USD weakness.",c:T.teal},{l:"GBP/ZAR",v:M.gbpzar.toFixed(2),n:"Down 7% YoY. Rand strengthening.",c:T.coral},{l:"GBP/EUR",v:"~1.18",n:"Stable. ECB cutting faster.",c:T.neutral},{l:"GBP/JPY",v:"~188",n:"JPY weak despite BoJ hike.",c:T.amber},{l:"DXY Index",v:M.dxy.toString(),n:"Multi-year low. -10% from 110.",c:T.teal},{l:"Dollar Regime",v:"WEAK",n:"Supports EM, commodities, crypto",c:T.teal}]}/>
<Ins type="insight" text={`Dollar weakness (-10% DXY from 110 highs to 95.5) is the single biggest FX story. It amplifies international returns in USD terms (MSCI Europe: +36% USD vs +19% EUR). For your portfolio, weak USD supports JMRE (EM), JERE (Europe), and commodity positions. GBP/ZAR at 21.87 means your Nedbank pension and EasyCrypto are worth more in GBP. Do NOT add ZAR exposure at these levels — the Rand has appreciated 13% from the April 2025 peak.`}/>
<SourceTag sources={["FRED DXY proxy","ECB SDW","SARB","GMD v2026 (EM macro)","IMF WEO"]}/></Glass>

<Verdict label="DOLLAR WEAKNESS SUPPORTS EM — ZAR STRENGTH LIMITS NEW EXPOSURE" imp={[
"DXY at 95.5 is a major tailwind for EM and commodities. JMRE positioning is well-timed.",
"GBP/ZAR at 21.87: existing ZAR assets worth more in GBP. Do not add until above 23 again.",
"EM rotation confirmed by $4B iShares inflows in Jan. The weakest dollar in years supports further rotation."
]} mon={["DXY — sustained below 95 is multi-year trend change","GBP/ZAR — reversal above 23 makes additions attractive","Iran oil supply disruption impact on EM importers","China PMI above 50 confirms impulse improvement"]}/></div>);

// =========================================================================
// P7 — COMMODITIES & REAL ASSETS (Upgrade #13: CarbonCredits.com uranium)
// =========================================================================
const P7=()=>(<div>
<Hd t="COMMODITIES & REAL ASSETS" s="Commodity leadership, gold, copper, energy, uranium, carbon, listed real assets" tag="REAL ASSETS"/>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>COMMODITY LEADERSHIP TABLE</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:8}}>
{COMMODITY.map((x,i)=>(<div key={i} style={{padding:"10px 13px",background:"rgba(255,255,255,0.02)",borderRadius:10,borderLeft:`3px solid ${x.c}`}}>
<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,fontWeight:700,color:T.t1}}>{x.n}</span><span style={{fontSize:11,fontWeight:700,color:T.t1,fontFamily:"'JetBrains Mono',monospace"}}>{x.p}</span></div>
<div style={{display:"flex",justifyContent:"space-between",marginTop:3}}><span style={{fontSize:10,color:x.c,fontWeight:600}}>{x.chg} 12M</span></div>
<div style={{fontSize:10,color:T.t3,marginTop:3}}>{x.sig}</div></div>))}
</div>
<SourceTag sources={["FRED DCOILWTICO","Alpha Vantage","CarbonCredits.com (uranium)","Trading Economics (EU ETS)","EMBER Climate","Stooq"]}/></Glass>

<Ins type="insight" text={`Gold at $5,280 (+80%) is the market's clearest macro message: inflation fear + geopolitical risk + dollar weakness. Uranium at $78.50 (CarbonCredits.com — free source replacing UxC paid) supports the AI power demand / nuclear revival thesis. Brent at $93 directly supports your job sector (energy infra valuations) but threatens UK inflation. The HALO trade (Hard Assets, Low Obsolescence) explains FTSE 100 outperformance.`}/>

<Verdict label="REAL ASSETS DOMINATING — HALO TRADE IS THE 2026 THEME" imp={[
"Gold at ATH is macro insurance. Consider small allocation (2-3% NAV) for tail hedge.",
"Uranium at $78.50 supports AI power/nuclear thesis. Listed proxies: CCJ, URNM. Research only for now.",
"Brent $93 supports energy infra valuations (job lens) but threatens UK CPI trajectory (portfolio lens)."
]} mon={["Brent — $100 triggers stagflation scenario","Gold vs real yields — if decoupling persists, geopolitical premium is extreme","Copper inventories — drawdowns confirm demand","Iran supply disruption duration"]}/></div>);

// =========================================================================
// P8 — HOUSING & PROPERTY
// =========================================================================
const P8=()=>(<div>
<Hd t="HOUSING, PROPERTY & REAL ESTATE" s="Affordability, mortgage rates, segment split, REITs" tag="PROPERTY"/>
<MetricGrid items={[{l:"UK House Price Forecast",v:"+1.5-3.5%",n:"But gilt shock threatens",c:T.amber},{l:"Mortgage Rate (5Y fix)",v:"~4.5%+",n:"Rising on gilt surge",c:T.coral},{l:"Best Cash ISA Rate",v:"~4.05%",n:"Falling with BoE cuts",c:T.neutral},{l:"FTSE 250 (domestic)",v:"23,727",n:"Lagging at 13x PE. Deep value.",c:T.teal},{l:"Data Centre REITs",v:"Strong",n:"DLR, EQIX structural winners",c:T.teal},{l:"Office REITs",v:"Distressed",n:"Structural loser. WFH permanent.",c:T.coral},{l:"REIT Disc to NAV",v:"~13%",n:"Widening on rate fears",c:T.amber},{l:"Construction",v:"Recovering",n:"Permits improving but fragile",c:T.neutral}]}/>
<Ins type="warning" text={`Gilt surge to 4.62% is directly pushing mortgage rates higher. The 5% deposit era is over. Best 1Y fix at 4.30% and falling. Property provides zero diversification when rates are the stress driver — both equities and property sell off together. Data centres and logistics are structural winners; office is a structural loser. FTSE 250 at 13x earnings and 13% average IT discount to NAV is a deep value opportunity IF rate cuts resume.`}/>
<SourceTag sources={["FRED Case-Shiller","ONS HPI","UK Land Registry","BoE Mortgage Stats","Zillow Research"]}/>
<Verdict label="GILT SHOCK THREATENS HOUSING — STAY PATIENT ON PROPERTY" imp={[
"Do not assume BoE cuts will rescue affordability. Gilt yields may stay elevated if Iran persists.",
"Data-centre/logistics REITs are structural winners. Track DLR, EQIX, PLD via yfinance.",
"FTSE 250 deep value (13x PE) is the contrarian UK play IF rate cuts resume in H2."
]} mon={["UK mortgage rate trajectory","Transaction volumes","REIT discounts to NAV","BoE MPC impact on pricing"]}/></div>);

// =========================================================================
// P9 — CRYPTO INTELLIGENCE (Upgrades: #12 Dune, #15 HODL Waves + Reserve Risk)
// =========================================================================
const P9=()=>(<div>
<Hd t="CRYPTO INTELLIGENCE ENGINE" s="On-chain cycle state, ETF flows, derivatives, HODL Waves, Reserve Risk" tag="EXTREME FEAR"/>
<Ins type="risk" text={`BTC -44% from ATH. ETH -60%. SOL -71%. Fear & Greed hit 10. Weekly RSI 27.5 — third time below 30 in history. Previous instances (Jan 2015, Dec 2018) preceded bull runs of 9,900% and 1,700%. Structural supply case extreme: exchange reserves ATL, illiquid supply 75%, whales accumulating $23B in 30 days.`}/>

<Row><KPI label="BTC" value={`$${M.btcPrice.toLocaleString()}`} delta={`ATH $126K`} dt="down" ac={T.btc}/><KPI label="F&G" value={M.fearGreed.toString()} delta="Extreme Fear" dt="down" ac={T.coral}/><KPI label="MVRV Z" value={M.mvrvZ.toFixed(2)} delta="Near undervalued" dt="neutral" ac={T.amber}/><KPI label="RSI" value={M.rsi.toFixed(1)} delta="3rd time <30" dt="down" ac={T.coral}/><KPI label="BTC Dom" value={`${M.btcDom}%`} delta="8yr high" dt="up"/><KPI label="ETF" value={M.etfFlow} delta="Streak broken" dt="up" ac={T.teal}/></Row>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>BTC PRICE vs FEAR & GREED — 12 MONTHS</div>
<div style={{height:230}}><ResponsiveContainer><ComposedChart data={CRYPTO_TL}><CartesianGrid strokeDasharray="3 3" stroke={T.grid}/><XAxis dataKey="d" tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><YAxis yAxisId="l" tick={{fill:T.t3,fontSize:10}} stroke={T.grid} tickFormatter={v=>`$${v}K`}/><YAxis yAxisId="r" orientation="right" tick={{fill:T.t3,fontSize:10}} stroke={T.grid} domain={[0,100]}/><Tooltip content={<Tip/>}/><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.btc} stopOpacity={0.3}/><stop offset="100%" stopColor={T.btc} stopOpacity={0.02}/></linearGradient></defs><Area yAxisId="l" type="monotone" dataKey="btc" fill="url(#bg)" stroke={T.btc} strokeWidth={2.5} name="BTC ($K)"/><Line yAxisId="r" type="monotone" dataKey="fg" stroke={T.coral} strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Fear & Greed"/><ReferenceLine yAxisId="r" y={25} stroke={T.coral} strokeDasharray="8 4" strokeOpacity={0.4}/></ComposedChart></ResponsiveContainer></div></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>ON-CHAIN SIGNAL GRID</div>
<div style={{fontSize:9,color:T.accent,fontWeight:600,marginBottom:8}}>UPGRADES: HODL Waves, Reserve Risk, Dune Analytics custom queries</div>
<MetricGrid items={[
{l:"Exchange Reserves",v:M.reserves,n:"All-time low since 2018",c:T.teal},
{l:"Illiquid Supply",v:"14.8M BTC",n:"75% of circulating",c:T.teal},
{l:"Whale Accumulation",v:M.whale,n:"$23B — largest in 13 years",c:T.positive},
{l:"HODL Waves",v:M.hodlWave,n:"Long-term holders NOT distributing",c:T.teal},
{l:"Reserve Risk",v:M.reserveRisk.toString(),n:"0.001 = high holder confidence, low price",c:T.teal},
{l:"SOPR",v:M.sopr.toString(),n:"<1 = selling at a loss",c:T.coral},
{l:"NUPL",v:M.nupl.toFixed(2),n:"Hope/fear boundary",c:T.amber},
{l:"ETF Cost Basis",v:"~$90,200",n:"Holders 15-16% underwater",c:T.coral},
{l:"Strategy (MSTR)",v:"672,497 BTC",n:"$58B largest corporate holder",c:T.btc},
{l:"Token Failures 2025",v:"11.6M",n:"86.3% of all-time failures",c:T.negative},
{l:"ETH Dominance",v:"10%",n:"Collapsed from 14%+",c:T.coral},
{l:"Dune: DEX Volume",v:"Collapsed",n:"Memecoin activity faded",c:T.coral}
]}/>
<SourceTag sources={["LookIntoBitcoin (MVRV, NUPL, HODL Waves, Reserve Risk)","CoinGecko","DefiLlama","Dune Analytics","Alternative.me F&G","Blockchain.com"]}/></Glass>

<Ins type="opportunity" text={`HODL Waves show 68% of BTC held >1 year — long-term holders are NOT distributing. Reserve Risk at 0.001 confirms high holder confidence relative to price. Combined with exchange reserves at ATL, whale accumulation of $23B, and ETF inflows resuming, the structural supply picture is the most bullish it has ever been at this price level. The 1.0 BTC accumulation strategy was designed for exactly this environment.`}/>

<Verdict label="EXTREME FEAR — STRUCTURAL ACCUMULATION ZONE" imp={[
"Continue BTC DCA on schedule. MVRV 0.49, RSI 27.5, Reserve Risk 0.001 — historically rare accumulation signals.",
"Crypto risk budget: 32% of risk from 13% capital (2.5x). Exceeds 2.0x limit. Add equities to dilute, or cap crypto.",
"ETH -60%, SOL -71%: do NOT add alts. BTC dominance rising. BTC-only accumulation in extreme fear."
]} mon={["ETF flow direction — 3+ consecutive inflow days confirms inflection","MVRV Z below 0 = deep-value zone","HODL Waves: any spike in short-term bands = distribution warning","BTC/S&P correlation — decorrelation strengthens structural case"]}/></div>);

// =========================================================================
// P10 — FLOWS & POSITIONING
// =========================================================================
const P10=()=>(<div>
<Hd t="CAPITAL FLOWS, POSITIONING & MARKET STRUCTURE" s="ETF flows, CFTC positioning, retail vs institutional, cross-asset alignment" tag="FLOW INTELLIGENCE"/>
<MetricGrid items={[{l:"EM ETF Inflows (Jan)",v:"$4B+",n:"Strongest since 2015",c:T.teal},{l:"US Equity Flows",v:"Flat",n:"Rotation away from US",c:T.neutral},{l:"BTC ETF (5 Mar)",v:"+$500M",n:"Snapped 6-week outflow",c:T.teal},{l:"CFTC Oil Longs",v:"Multi-year high",n:"Iran-driven. Crowded.",c:T.coral},{l:"Put/Call Ratio",v:"Elevated",n:"Hedging demand rising",c:T.amber},{l:"Software Short Int",v:"Elevated",n:"Post-SaaSpocalypse",c:T.coral},{l:"Pension Allocation",v:"Increasing to infra",n:"Slow-money structural",c:T.teal},{l:"Cross-Asset Alignment",v:"DIVERGING",n:"Equities up, crypto down",c:T.amber}]}/>
<Ins type="warning" text={`Cross-asset flow alignment is diverging: equities (especially international) are attracting strong institutional flows, while crypto is in sustained outflow (until the 5 March reversal). Commodities are seeing Iran-driven positioning that's becoming crowded (CFTC oil longs at multi-year highs). This divergence means crypto is NOT providing portfolio diversification — it's a correlated risk asset that just happens to be in a deeper drawdown.`}/>
<SourceTag sources={["CFTC COT (weekly CSV)","etfdb.com","ICI mutual fund flows","CBOE put/call","FINRA short interest"]}/>
<Verdict label="FLOWS CONFIRM INTERNATIONAL ROTATION — CRYPTO FLOWS DIVERGING" imp={[
"$4B EM inflows in January is real institutional money moving. JMRE is correctly positioned.",
"CFTC oil positioning is crowded. If Iran de-escalates, oil unwind could be violent. Watch for reversal.",
"BTC ETF flow reversal on 5 March is potentially significant. 3+ days confirms trend change."
]} mon={["Weekly ETF flow data","CFTC COT every Friday","BTC ETF daily flows","Pension allocation survey releases"]}/></div>);

// =========================================================================
// P11 — VALUATION & FACTORS
// =========================================================================
const P11=()=>(<div>
<Hd t="VALUATION, FACTORS & MARKET QUALITY" s="Regional valuations, ERP, factor scorecard, crypto valuation, infra multiples" tag="VALUATION DISCIPLINE"/>
<MetricGrid items={[{l:"S&P 500 PE",v:`${M.sp500PE}x`,n:"CAPE 40x. Dot-com levels.",c:T.coral},{l:"FTSE 100 PE",v:"~18x",n:"Fair value range",c:T.neutral},{l:"FTSE 250 PE",v:"~13x",n:"Deep value. 25-year discount to large.",c:T.teal},{l:"MSCI EM PE",v:"~12x",n:"20-year discount to DM",c:T.teal},{l:"US ERP",v:"~3.4%",n:"Compressed. Cash competitive.",c:T.coral},{l:"Intl ERP",v:"~6-7%",n:"Much higher. Equity justified.",c:T.teal},{l:"Software PE",v:"~20x fwd",n:"Crashed from 35x. 2014 levels.",c:T.amber},{l:"BTC MVRV Z",v:M.mvrvZ.toFixed(2),n:"Near undervalued zone",c:T.teal}]}/>
<Ins type="insight" text={`S&P at 29x trailing PE and 40x CAPE is dot-com territory. US ERP at ~3.4% barely compensates for risk above cash at 4.3%. International ERP at 6-7% is vastly more attractive. FTSE 250 at 13x and EM at 12x represent genuine deep value. The valuation + momentum fusion score ranks EM as the best risk-reward globally: cheap AND improving momentum.`}/>
<SourceTag sources={["Shiller CAPE","Damodaran ERP","FMP MCP (forward estimates)","Financial Datasets MCP","Kenneth French"]}/>
<Verdict label="US EXPENSIVE, INTERNATIONAL CHEAP — VALUATION SUPPORTS ROTATION" imp={[
"Do not add to US at CAPE 40x. Historical 10-year returns from this level average ~3% annualised.",
"EM at 12x with improving momentum is best risk-reward globally. JMRE is the vehicle.",
"Software at 20x forward PE (from 35x) may be creating value. But wait for stabilisation — catching knives is expensive."
]} mon={["S&P forward PE — above 24x is danger zone","EM earnings revisions — improving confirms thesis","MVRV Z below 0 = crypto deep value","Software PE trajectory — 18x signals capitulation"]}/></div>);

// =========================================================================
// P12 — VOLATILITY & STRESS (Upgrades: #10 Riskfolio-Lib, #11 skfolio)
// =========================================================================
const P12=()=>(<div>
<Hd t="VOLATILITY, SENTIMENT & CROSS-ASSET STRESS" s="Vol regime, correlations, drawdown clustering, gap risk" tag="MARKET HEARTBEAT"/>
<Row><KPI label="VIX" value={M.vix.toFixed(1)} delta="+19% on 5 Mar" dt="down" ac={T.coral}/><KPI label="MOVE" value={M.move.toString()} delta="Rate vol high" dt="down" ac={T.coral}/><KPI label="S&P Impl Vol" value="16.1%" delta="vs 13% realised" dt="down"/><KPI label="BTC Vol" value="~50%" delta="3.5x S&P" dt="down" ac={T.coral}/><KPI label="FTSE Vol" value="~9.4%" dt="up" ac={T.teal}/></Row>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>VOL REGIME — VIX vs MOVE vs CRYPTO (annualised)</div>
<div style={{height:210}}><ResponsiveContainer><ComposedChart data={VOL_TL}><CartesianGrid strokeDasharray="3 3" stroke={T.grid}/><XAxis dataKey="d" tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><YAxis tick={{fill:T.t3,fontSize:10}} stroke={T.grid}/><Tooltip content={<Tip/>}/><Line type="monotone" dataKey="vix" stroke={T.blue} strokeWidth={2} name="VIX"/><Line type="monotone" dataKey="move" stroke={T.coral} strokeWidth={2} name="MOVE" strokeDasharray="6 3"/><Line type="monotone" dataKey="cv" stroke={T.btc} strokeWidth={2} name="Crypto Vol"/><ReferenceLine y={20} stroke={T.amber} strokeDasharray="6 4" strokeOpacity={0.4}/></ComposedChart></ResponsiveContainer></div>
<Ins type="source" text={`Phase 2 upgrade: Riskfolio-Lib (24 convex risk measures including Ulcer Index, CVaR, EDaR) and skfolio (ML-driven asset clustering) deploy on Mac Mini. These replace basic Sharpe/Sortino with institutional-grade risk analytics — including drawdown severity scoring, tail-risk modelling, and dynamic correlation regime detection.`}/></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>CROSS-ASSET STRESS DASHBOARD</div>
<MetricGrid items={[{l:"US Equities",v:"Moderate",n:"VIX 24.5, -3% from ATH",c:T.amber},{l:"UK Equities",v:"Elevated",n:"Gilt shock, -5.5% weekly",c:T.coral},{l:"Credit",v:"Low",n:"HY spreads contained",c:T.teal},{l:"Rates / Gilts",v:"HIGH",n:"40bp weekly — mini-budget",c:T.negative},{l:"Crypto",v:"EXTREME",n:"F&G 18, RSI 27.5",c:T.negative},{l:"FX / GBP",v:"Moderate",n:"USD safe-haven bid",c:T.amber},{l:"Commodities",v:"Elevated",n:"Brent $93, gold ATH",c:T.coral},{l:"Volatility",v:"Elevated",n:"Impl > realised",c:T.amber}]}/>
<SourceTag sources={["FRED VIXCLS","MacroMicro MOVE","FRED STLFSI4/NFCI","Phase 2: Riskfolio-Lib, skfolio"]}/></Glass>

<Verdict label="ELEVATED STRESS — DEFENCE POSTURE WARRANTED" imp={[
"MOVE at 118 + VIX at 24.5 = dual stress signal. Do not add risk until both normalise.",
"Crypto vol at 50% = 3.5x equities. This drives 32% of portfolio risk from 13% capital. Key risk management issue.",
"Phase 2: Riskfolio-Lib Ulcer Index will quantify sustained drawdown pain vs quick resets across assets."
]} mon={["Gilt 10Y — 5.0% = crisis","VIX term structure — backwardation = acute stress","BTC-S&P correlation — rising = zero diversification","HY OAS widening above 400bp = contagion"]}/></div>);

// =========================================================================
// P13 — ALPHA FRONTIER (Upgrade #17: space, synbio, tokenisation watchlist)
// =========================================================================
const P13=()=>(<div>
<Hd t="ALPHA FRONTIER, NASCENT THEMES & OPPORTUNITY RADAR" s="Emerging themes, narrative velocity, execution feasibility, failure modes" tag="VENTURE SLEEVE"/>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>NASCENT THEME SCANNER — CONVICTION vs MATURITY</div>
<Tbl h={["Theme","Conviction","Timing","Vehicle","Status"]} r={[
["AI Power / Grid Infrastructure","9/10","8/10","GII, XLU, NEE, utilities","Research — high conviction"],
["Defence Tech","8/10","7/10","BA, LMT, Babcock, BAE","Priced in at index level"],
["Stablecoin Infrastructure","7/10","6/10","BTC (indirect), SQ, PYPL","Watch — GENIUS Act tailwind"],
["Robotics / Automation","6/10","4/10","BOTZ, ROBO","Watch — not doing useful work yet"],
["RWA Tokenisation","6/10","3/10","No clean public proxy","Watch — structural but early"],
["Space Robotics / LEO","5/10","2/10","RKLB, SPCE, ASTS","Watchlist only — pre-revenue"],
["Synthetic Biology","5/10","2/10","XBI (broad), ARKG","Watchlist only — early stage"],
["Carbon Infra / CCUS","5/10","4/10","KRBN, utilities","Research — policy dependent"]
]} hl={1}/>
<Ins type="insight" text={`AI power infrastructure remains highest-conviction: hyperscaler capex $660-690B in 2026, grid bottlenecks creating structural demand. Defence tech is accelerating (Babcock +147%) but priced in. Three new watchlist additions from Stanford SETR and McKinsey: space robotics (microgravity manufacturing), synthetic biology (AI + genetic engineering), and RWA tokenisation. None are investable yet via clean public proxies — they stay on watch with zero allocation.`}/></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>SATELLITE ALLOCATION RULES</div>
<MetricGrid items={[{l:"Max Satellite Weight",v:"5% NAV",n:"Hard cap. No exceptions.",c:T.accent},{l:"Max Concurrent Bets",v:"3",n:"Focus > diversification",c:T.accent},{l:"Review Cycle",v:"90 days",n:"Trim or kill at each review",c:T.accent},{l:"Research Hurdle",v:"3+ confirmations",n:"Price, flows, earnings, policy",c:T.accent}]}/></Glass>

<Verdict label="AI POWER INFRASTRUCTURE = HIGHEST CONVICTION NASCENT THEME" imp={[
"AI power/grid is the only theme with sufficient confirmation for active research. All others stay on watchlist.",
"Space robotics, synthetic biology, RWA tokenisation added to watchlist. Zero allocation until public proxies exist.",
"Satellite rules: 5% max, 3 concurrent, 90-day review. Phase 2 upgrade: Kelly Criterion for optimal sizing."
]} mon={["Hyperscaler Q1 capex guidance","Grid investment announcements (ENTSO-E)","ASML backlog — cancellations signal peak","Stablecoin legislation progress"]}/></div>);

// =========================================================================
// P14 — SCENARIO LAB
// =========================================================================
const P14=()=>(<div>
<Hd t="SCENARIO LAB & ALLOCATION PLAYBOOKS" s="Base/bull/bear/crisis, portfolio sensitivity, triggers, deployment rules" tag="FORWARD-LOOKING"/>
<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>SCENARIO STACK</div>
{SCENARIOS.map((x,i)=>(<div key={i} style={{padding:"10px 13px",marginBottom:7,background:"rgba(255,255,255,0.02)",borderRadius:10,borderLeft:`3px solid ${x.col}`}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700,color:T.t1}}>{x.s}</span><span style={{fontSize:12,fontWeight:700,color:x.col,fontFamily:"'JetBrains Mono',monospace"}}>{x.pr}%</span></div>
<div style={{display:"flex",gap:16,marginTop:4}}><span style={{fontSize:10,color:T.t3}}>S&P: {x.sp}</span><span style={{fontSize:10,color:T.t3}}>BTC: {x.btc}</span></div>
<div style={{fontSize:10.5,color:T.t2,marginTop:3}}>{x.desc}</div></div>))}</Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>PORTFOLIO SENSITIVITY BY SCENARIO</div>
<Tbl h={["Scenario","Impact","Most Exposed Sleeve","Probability"]} r={[
["Equities -20%","-9.8%","ETF sleeves (£109K)",M.sp500PE>25?"15%":"10%"],
["Crypto -40%","-5.6%","Crypto (£50K)","20%"],
["Combined Risk-Off","-16.8%","Eq-20% + Crypto-40%","5%"],
["Iran Escalation","-4.2%","Oil $120, rates spike","20%"],
["Stagflation (UK)","-8.4%","Rates+4%, FTSE-15%","10%"],
["Liquidity Melt-Up","+12.5%","All risk assets","20%"]
]} hl={1}/>
<Ins type="source" text={`Phase 2 upgrade: Riskfolio-Lib CVaR and EDaR will replace these static sensitivity estimates with Monte Carlo-driven probability distributions. The Entropic Drawdown at Risk measure will specifically stress-test the crypto winter extension scenario using exponential cone programming to capture tail risks that normal distributions miss.`}/></Glass>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>DEPLOYMENT PLAYBOOK</div>
<MetricGrid items={[{l:"At -10% from peak",v:"Deploy 25%",n:"of dry powder into highest-conviction ideas",c:T.teal},{l:"At -20% from peak",v:"Deploy 50%",n:"accelerate ISA + BTC DCA",c:T.teal},{l:"At -30% from peak",v:"Deploy remaining",n:"maximum aggression into quality",c:T.positive},{l:"Current Drawdown",v:"-8.9%",n:"From £397K peak (4 Oct 25)",c:T.amber}]}/></Glass>

<Verdict label="LATE CYCLE — BASE 50%, INFLATION SCARE UPGRADED TO 20%" imp={[
"Iran escalation moved inflation-shock from 15% to 20% probability. Adjust positioning accordingly.",
"Portfolio most vulnerable to combined risk-off (-16.8%). Crypto drives disproportionate downside.",
"Deployment playbook: at current -8.9% drawdown, approaching the -10% trigger for 25% dry powder deploy."
]} mon={["Brent >$100 = upgrade inflation-shock scenario","PMI <48 = upgrade recession scenario","Gilt 10Y >5.0% = trigger UK crisis scenario","BTC below $62K = trigger crypto winter extension"]}/></div>);

// =========================================================================
// P15 — CASH & DEFENCE
// =========================================================================
const P15=()=>(<div>
<Hd t="CASH, DEFENCE & DEPLOYMENT STRATEGY" s="Cash ladder, real yield, buffer, drag, defensive assets, dry powder rules" tag="CAPITAL PRESERVATION"/>
<MetricGrid items={[{l:"Liquid Cash",v:"\u00A316.3K",n:"Monzo + other",c:T.amber},{l:"Fixed Deposit",v:"\u00A345.8K",n:"At 5% (locked)",c:T.teal},{l:"Buffer (months)",v:"2.7",n:"vs 3.0 target. Risk.",c:T.coral},{l:"Best 1Y Fix",v:`${M.bestSave}%`,n:"MBNA/Lloyds",c:T.blue},{l:"Real Cash Yield",v:"~0.8%",n:"After 40% tax + 3% CPI",c:T.amber},{l:"Cash Drag",v:"~\u00A3800/yr",n:"Idle cash vs equity ERP",c:T.coral},{l:"ISA Deployed",v:"\u00A30 / \u00A320K",n:`${M.isaDeadlineDays} days remaining!`,c:T.negative},{l:"Amex Balance",v:"\u00A310,652",n:"22% APR. Guaranteed return.",c:T.negative}]}/>

<Ins type="action" text={`Three highest-alpha actions ranked by certainty: (1) Pay Amex balance — guaranteed 22% return. (2) Deploy ISA \u00A320K — 80-120bps structural alpha per year, every year, forever. (3) Continue BTC DCA — accumulation at extreme fear with historic contrarian signals. These three actions alone are worth more than any amount of research. Execute them.`}/>

<Glass><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:10}}>DEFENSIVE ASSET COMPARISON</div>
<Tbl h={["Asset","Return","In Current Drawdown","Role"]} r={[
["Cash (4.3% fix)","4.3% nominal","Stable. Zero drawdown.","Baseline hurdle"],
["Short Gilts (SHY equiv)","~3.8%","Modest positive","Low-duration ballast"],
["Gold ($5,280)","80% 12M","Best performer in stress","Geopolitical hedge"],
["Long Gilts (TLT equiv)","-5% YTD","FAILED as hedge","Avoid"],
["Low-Vol Equities","Moderate","Outperforming growth","Partial hedge"],
["BTC at extreme fear","N/A","Down 44% from ATH","Contrarian accumulation"]
]} hl={2}/></Glass>

<Verdict label="CASH IS COMPETITIVE — ISA DEPLOYMENT IS THE #1 PRIORITY" imp={[
"ISA \u00A320K deployment before 5 April is the single highest-alpha action. 29 days remaining. Execute.",
"Amex at 22% APR: clearing this is a guaranteed 22% return. Prioritise alongside ISA.",
"Gold has been the best drawdown hedge. Gilts failed. Consider 2-3% gold allocation for tail protection."
]} mon={["ISA deadline: 5 April 2026","Cash rate trajectory","Amex paydown progress","Buffer replenishment from March income"]}/></div>);

// =========================================================================
// P16 — WEEKLY SYNTHESIS (enhanced from v1)
// =========================================================================
const P16=()=>(<div>
<Hd t="WEEKLY INTELLIGENCE SYNTHESIS" s={`Week of ${M.date}`} tag="SUNDAY SCARIES"/>
<Glass glow><div style={{fontSize:12,fontWeight:700,color:T.t1,marginBottom:12}}>FIVE KEY SHIFTS</div>
{[{s:"Iran reprices the entire rate path",d:"Brent $93, gilt 40bp surge. BoE cut <20%. Stagflation risk rising.",c:T.coral},
{s:"Value rotation at 99.8th percentile intensity",d:"Value +7.8% YTD vs Growth -1.9%. Structural, not noise.",c:T.amber},
{s:"BTC ETF inflows resume after 6-week drought",d:"$500M on 5 March. Whale accumulation $23B in 30 days.",c:T.teal},
{s:"SaaSpocalypse: $1-2T destroyed",d:"IGV -30%. Software PE 35x to 20x. AI agents disrupting SaaS.",c:T.coral},
{s:"Gold $5,280 — HALO trade dominates",d:"Hard Assets, Low Obsolescence. Defence + miners + energy.",c:T.amber}
].map((x,i)=>(<div key={i} style={{padding:"9px 12px",marginBottom:6,background:"rgba(255,255,255,0.02)",borderRadius:10,borderLeft:`3px solid ${x.c}`}}><div style={{fontSize:12,fontWeight:700,color:T.t1}}><span style={{color:x.c,fontFamily:"'JetBrains Mono',monospace"}}>{i+1}.</span> {x.s}</div><div style={{fontSize:10.5,color:T.t3,marginTop:2,paddingLeft:20}}>{x.d}</div></div>))}</Glass>

<Grid cols="1fr 1fr">
<Glass><div style={{fontSize:11,fontWeight:700,color:T.coral,letterSpacing:1,marginBottom:8}}>THREE RISING RISKS</div>
{["Iran forces BoE halt — gilt crisis, mortgage spike, FTSE 250 exposed",
"AI capex $660-690B with 90% of firms seeing no productivity impact. Bubble risk real.",
"Crypto-equity correlation rising. Zero diversification benefit from 13% crypto weight."
].map((r,i)=>(<div key={i} style={{fontSize:11,color:T.t2,padding:"4px 0",borderBottom:`1px solid ${T.grid}`,lineHeight:1.5}}><span style={{color:T.coral,fontWeight:700}}>{i+1}.</span> {r}</div>))}</Glass>
<Glass><div style={{fontSize:11,fontWeight:700,color:T.teal,letterSpacing:1,marginBottom:8}}>THREE OPPORTUNITIES</div>
{["BTC accumulation at extreme fear — MVRV 0.49, RSI 27.5, whale buying confirms. Continue DCA.",
"European equities + value rotation — JERE +22%, structural defence/bank/rotation tailwinds.",
"ISA deployment: 29 days, \u00A30 deployed. 80-120bps structural alpha. Highest certainty action."
].map((o,i)=>(<div key={i} style={{fontSize:11,color:T.t2,padding:"4px 0",borderBottom:`1px solid ${T.grid}`,lineHeight:1.5}}><span style={{color:T.teal,fontWeight:700}}>{i+1}.</span> {o}</div>))}</Glass></Grid>

<Glass><div style={{fontSize:11,fontWeight:700,color:T.accent,letterSpacing:1,marginBottom:8}}>PORTFOLIO IMPLICATION BOARD</div>
<Tbl h={["Sleeve","Signal","Action"]} r={[
["JURE (US)","Growth-to-value headwind. Mag 7 all underperforming.","Hold. Do not add."],
["JERE (Europe)","Defence + banks + rotation. +22% 12M.","ADD via ISA"],
["JMRE (EM)","EM +34%. $4B inflows Jan. Dollar weak.","ADD via ISA"],
["JUKC (UK)","FTSE value tilt helps. Gilt shock headwind.","Hold"],
["BTC","F&G 18, RSI 27.5, whale accumulation extreme.","Continue DCA"],
["ETH / SOL","ETH -60%, SOL -71%. BTC dom rising.","Do NOT add"],
["Cash / FD","Best 1Y at 4.30%. Real yield ~0.8%.","Deploy ISA. Cash above 3-mo buffer is drag."],
["Amex Debt","\u00A310.6K at 22% APR.","CLEAR — guaranteed 22% return"]
]} hl={2}/></Glass>

<Glass style={{borderTop:`2px solid ${T.teal}`}}><div style={{fontSize:11,fontWeight:700,color:T.teal,letterSpacing:1,marginBottom:8}}>ACTION SUMMARY</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(190px, 1fr))",gap:10}}>
{[{l:"DO THIS WEEK",items:["Deploy ISA \u00A320K: JERE + JMRE","Continue BTC DCA","Review Amex paydown (\u00A310.6K)"],c:T.teal},
{l:"WATCH CLOSELY",items:["BoE MPC 19 March","US CPI release","Gilt 10Y (5.0% = crisis)","BTC ETF daily flows"],c:T.amber},
{l:"IGNORE",items:["Daily crypto price noise","Mag 7 earnings chatter","Housing headlines","Short-term FX"],c:T.neutral}
].map((b,i)=>(<div key={i} style={{padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:10,borderTop:`2px solid ${b.c}`}}>
<div style={{fontSize:10,fontWeight:700,color:b.c,letterSpacing:0.8,marginBottom:6}}>{b.l}</div>
{b.items.map((x,j)=>(<div key={j} style={{fontSize:11,color:T.t2,padding:"2px 0"}}>{"\u2022"} {x}</div>))}</div>))}</div></Glass>
</div>);

// =========================================================================
// CAREER TABS C1-C8 (Enhanced with Upgrade #2: World Bank PPI)
// =========================================================================
const CareerTab=({name,tag,items,sources,verdict,imp,mon})=>(<div>
<Hd t={name} tag={tag}/><MetricGrid items={items}/>
{sources&&<SourceTag sources={sources}/>}
<Verdict label={verdict} imp={imp} mon={mon}/></div>);

const C1=()=><CareerTab name="GP ACTIVITY, STRATEGY & SPONSOR TRACKER" tag="SPONSOR MAP" items={[
{l:"Blackstone",v:"Data Centres",n:"$40B+ AUM. Publicly traded vehicle planned.",c:T.violet},{l:"KKR",v:"Energy Transition",n:"Global Infra Fund V. Active in Europe.",c:T.blue},{l:"EQT",v:"Digital + Transport",n:"Nordic HQ. Strong European pipeline.",c:T.cyan},{l:"Macquarie",v:"Exiting positions",n:"$40B Aligned Data Centers sale to GIP consortium.",c:T.amber},{l:"Brookfield",v:"Renewables + Grid",n:"Largest infra AUM globally.",c:T.teal},{l:"AXA IM Alts",v:"Core / Core+",n:"Long-hold institutional infra.",c:T.neutral},{l:"Antin",v:"Mid-market Europe",n:"Digital, energy, transport, social.",c:T.blue},{l:"Igneo (First Sentier)",v:"Selective acquirer",n:"M&A reopening narrative.",c:T.violet}
]} sources={["Infrastructure Investor","GP Annual Reports","PitchBook (free news)","PE Hub"]}
verdict="SPONSOR APPETITE: ELEVATED FOR DATA CENTRES & ENERGY TRANSITION" imp={["Data centres dominating deal flow. $40B Aligned/GIP deal sets pricing benchmark.","Defence spending creating adjacencies for UK infra advisory at DC.","Fresh dry powder (KKR Fund V, Brookfield successor) = more credible buyers in processes."]} mon={["Infrastructure Investor weekly deal flow","GP fund close announcements","DC Advisory internal pipeline","Hyperscaler capex driving sponsor confidence"]}/>;

const C2=()=><CareerTab name="ENERGY & INFRASTRUCTURE DEAL INTELLIGENCE" tag="DEAL FLOW" items={[
{l:"Deal Volume",v:"Growing",n:"Energy transition + digital dominating",c:T.teal},{l:"Top Subsector",v:"Data Centres",n:"Multi-billion equity checks. $40B Aligned deal.",c:T.violet},{l:"Valuations",v:"Rich for digital",n:"Data centre EV/EBITDA 20-25x",c:T.coral},{l:"Financing",v:"Tightening",n:"Gilt shock raising UK deal costs",c:T.amber},
{l:"WB PPI Database",v:"235 projects (2025)",n:"FREE infra deal data globally",c:T.teal},{l:"Africa Deals",v:"47 SSA projects",n:"$12.8B. Energy dominant.",c:T.blue},{l:"Failed Auctions",v:"Rising",n:"Pricing discipline tightening",c:T.amber},{l:"Pipeline",v:"Strong",n:"Energy security + grid driving mandates",c:T.teal}
]} sources={["World Bank PPI (free)","Infrastructure Investor","IJGlobal (free summaries)","EIB Project Database","Press releases"]}
verdict="DEAL VELOCITY HIGH — DATA CENTRES + ENERGY TRANSITION DOMINATING" imp={["World Bank PPI database provides FREE project-level deal data. Reduces IJGlobal dependency.","Data centre valuations (20-25x) are stretched. Watch for repricing if AI capex disappoints.","Gilt shock raising UK infra financing costs. Expect more selective sponsor behaviour."]} mon={["World Bank PPI quarterly updates","Deal announcement tracking","Valuation multiple trends","Financing condition trajectory"]}/>;

const C3=()=><CareerTab name="FINANCING & CAPITAL MARKETS FOR INFRA" tag="DEBT MARKETS" items={[
{l:"Infra Debt Spreads",v:"Widening",n:"Gilt shock transmitting to project finance",c:T.coral},{l:"Leverage Tolerance",v:"Tightening",n:"Lenders more selective post-rate spike",c:T.amber},{l:"Project Finance",v:"Selective",n:"Bank appetite focused on contracted assets",c:T.amber},{l:"Recap Window",v:"Narrowing",n:"Higher rates reduce recap economics",c:T.coral},
{l:"EIB Pipeline",v:"Active",n:"Free project-level data",c:T.teal},{l:"DFI Appetite",v:"Strong",n:"IFC, AfDB, EBRD co-lending robust",c:T.teal},{l:"Hedge Cost",v:"Rising",n:"Swap rates following gilt surge",c:T.coral},{l:"Verdict",v:"SELECTIVE",n:"Financing backdrop tightening",c:T.amber}
]} sources={["FRED base rates","BoE SONIA swaps","EIB Project Database (free)","DFI annual reports","Published deal terms"]}
verdict="FINANCING TIGHTENING — SPONSORS MUST BE MORE SELECTIVE" imp={["Gilt 4.62% directly impacts UK infra deal IRRs. Leveraged returns compress.","EIB and DFI databases are free and comprehensive for pipeline tracking.","If financing loosens (rate cuts resume), expect rapid acceleration in deal velocity."]} mon={["Gilt trajectory","Bank lending surveys","Published deal financing terms","EIB/EBRD pipeline updates"]}/>;

const C4=()=><CareerTab name="LISTED INFRA & PUBLIC-PRIVATE BRIDGE" tag="SIGNAL BRIDGE" items={[
{l:"AI Power Demand",v:"$660-690B capex",n:"Hyperscaler spending in 2026",c:T.violet},{l:"Grid Investment",v:"Accelerating",n:"\u20AC1.4T needed for EU grid upgrades",c:T.teal},{l:"Data Centre REITs",v:"Strong",n:"DLR, EQIX structural winners",c:T.teal},{l:"Utility Capex",v:"Rising",n:"NEE, SO, DUK expanding generation",c:T.blue},
{l:"Renewables LCOE",v:"Declining",n:"IRENA + Lazard data (free)",c:T.teal},{l:"Transport Infra",v:"Recovering",n:"Airport volumes normalising",c:T.neutral},{l:"Pub-Priv Gap",v:"Narrowing",n:"Listed re-rating toward private comps",c:T.amber},{l:"Nuclear / SMR",v:"Narrative rising",n:"Uranium $78.50 (CarbonCredits.com)",c:T.cyan}
]} sources={["SEC EDGAR (hyperscaler 10-Q)","IRENA (LCOE, free)","Lazard LCOE (free)","ENTSO-E (grid data, free)","IEA Electricity Report","CarbonCredits.com (uranium)"]}
verdict="AI POWER DEMAND = RICHEST CROSSOVER BETWEEN JOB AND INVESTING" imp={["Hyperscaler capex confirms multi-year power demand cycle. Grid + utilities = structural winners.","IRENA, Lazard, ENTSO-E all provide free data for renewables and grid economics.","Nuclear/SMR narrative strengthening. Uranium at $78.50 via CarbonCredits.com (free, replacing UxC paid)."]} mon={["Hyperscaler Q1 capex guidance","ENTSO-E grid data","IRENA annual cost report","Listed infra vs broad index performance"]}/>;

const C5=()=><CareerTab name="PE, PRIVATE CREDIT & SECONDARIES" tag="ALTERNATIVES" items={[
{l:"PE Temperature",v:"Warming",n:"Exits reopening. IPO pipeline building.",c:T.teal},{l:"Secondaries Volume",v:"Record $103B",n:"H1 2025 Jefferies report (free)",c:T.teal},{l:"LP Pricing",v:"90% NAV",n:"Discount narrowing",c:T.amber},{l:"Private Credit",v:"Stress rising",n:"Proskauer default index (free quarterly)",c:T.coral},
{l:"Infra Secondaries",v:"Active",n:"GP-led continuation vehicles growing",c:T.blue},{l:"VC Late-Stage",v:"Selective",n:"AI funding robust. Other sectors challenged.",c:T.amber},{l:"Real Estate",v:"Bifurcated",n:"Data centres premium. Office distressed.",c:T.amber},{l:"Alt Policy",v:"Max 5% NAV",n:"Liquidity limits enforced",c:T.accent}
]} sources={["Jefferies Secondary Market Review (free)","Bain Global PE Report (free)","McKinsey Private Markets Review (free)","Proskauer Default Index (free)","Campbell Lutyens (free)"]}
verdict="SECONDARIES AT RECORD — STRESS INDICATOR AND OPPORTUNITY" imp={["All key PE/secondaries data available FREE: Jefferies, Bain, McKinsey, Proskauer, Campbell Lutyens.","Secondaries pricing at 90% NAV signals improving confidence but not euphoria.","Private credit stress rising — Proskauer free quarterly is the key monitor."]} mon={["Jefferies H2 2025 report","Bain Global PE Report 2026","Proskauer quarterly index","IPO pipeline development"]}/>;

const C6=()=><CareerTab name="AFRICA MACRO, COUNTRY RISK & OPPORTUNITY" tag="AFRICA" items={[
{l:"Africa GDP Growth",v:"3.9%",n:"AfDB 2025 estimate. Modest downgrade.",c:T.amber},{l:"Financing Gap",v:"$245B/yr",n:"Sub-Saharan Africa infrastructure need",c:T.coral},{l:"GBP/ZAR",v:M.gbpzar.toFixed(2),n:"Rand strengthening. -7% YoY.",c:T.amber},{l:"SA Load Shedding",v:"Improving",n:"Energy reform progress",c:T.teal},
{l:"Nigeria FX",v:"Liberalising",n:"Reform progress but volatile",c:T.amber},{l:"Kenya PPP",v:"Framework developing",n:"Digital infra opportunities",c:T.blue},{l:"ODA Decline",v:"-9-17%",n:"Aid cuts forcing private capital",c:T.coral},{l:"Data Centre Gap",v:"<1% global",n:"Africa has <1% of world DC capacity",c:T.violet}
]} sources={["AfDB Economic Outlook (free)","IMF Data Portal (free)","World Bank Africa (free)","AfDB Open Data (free)","GMD v2026 (free)","World Bank PPI (free)"]}
verdict="SA IMPROVING BUT FINANCING GAP DEMANDS PRIVATE CAPITAL" imp={["All Africa macro data available FREE: AfDB, IMF, World Bank, GMD. Zero paid sources needed.","GBP/ZAR at 21.87: existing ZAR assets worth more. Don't add until above 23.","Africa data centre gap (<1% global) is the biggest digital infra opportunity — aligns with AI power theme."]} mon={["AfDB Annual Report","SA load-shedding status","Nigeria FX reform","GBP/ZAR trajectory"]}/>;

const C7=()=><CareerTab name="AFRICA INVESTOR & DEAL TRACKER" tag="AFRICA BUYERS" items={[
{l:"Helios Investment",v:"PE/Climate/Digital",n:"Pan-African. West Africa focus.",c:T.violet},{l:"AIIM",v:"Long-term Infra",n:"Institutional. Southern Africa.",c:T.blue},{l:"Africa Finance Corp",v:"Principal Investing",n:"Infrastructure mobilisation. Free reports.",c:T.teal},{l:"Actis",v:"Sustainable Infra",n:"Energy transition focus.",c:T.cyan},
{l:"Adenia",v:"Control-Growth",n:"Francophone Africa. Mid-market.",c:T.amber},{l:"WB PPI (Africa)",v:"47 SSA deals",n:"$12.8B value. Energy dominant.",c:T.teal},{l:"DFI Co-Lending",v:"Strong",n:"IFC, AfDB, EBRD active in Africa",c:T.teal},{l:"Priority",v:"SA + Kenya",n:"Strongest reform + growth combo",c:T.accent}
]} sources={["GP Websites (free)","Infrastructure Investor (free)","AFC Annual Report (free)","World Bank PPI (free)","DFI Reports (free)"]}
verdict="AFRICA INVESTOR MAP: ALL DATA AVAILABLE FREE" imp={["GP websites and annual reports provide free strategy and portfolio information.","World Bank PPI gives project-level African deal data at zero cost.","AFC publications provide free pipeline data and risk-mitigation frameworks."]} mon={["Helios, AIIM, AFC, Actis website updates","Infrastructure Investor Africa coverage","AFC annual report","DFI co-lending announcements"]}/>;

const C8=()=><CareerTab name="ENERGY TRANSITION, POWER & DIGITAL INFRA" tag="THEMATIC CAPSTONE" items={[
{l:"Grid Investment",v:"Accelerating",n:"\u20AC1.4T EU upgrades needed (ENTSO-E)",c:T.teal},{l:"AI Power Demand",v:"$660-690B",n:"Hyperscaler capex in 2026",c:T.violet},{l:"Battery/Storage",v:"Costs declining",n:"IRENA data (free)",c:T.teal},{l:"Gas-to-Power",v:"Necessary",n:"Transition needs dispatchable support",c:T.amber},
{l:"Digital Build-Out",v:"Fibre + DC",n:"TeleGeography free data",c:T.blue},{l:"Circular Economy",v:"Less crowded",n:"Waste/water still infra-like",c:T.neutral},{l:"Resilience Infra",v:"Emerging",n:"Energy security becoming investable",c:T.cyan},{l:"BNEF Transition",v:"$2.3T (2025)",n:"Record global energy transition investment",c:T.teal}
]} sources={["IEA World Energy Investment (free)","IRENA (free)","ENTSO-E (free)","SEC EDGAR (hyperscaler 10-Q)","Lazard LCOE (free)","CarbonCredits.com (uranium, free)","BP/Energy Institute (free)"]}
verdict="AI POWER + GRID = HIGHEST-CONVICTION STRUCTURAL THEME" imp={["All energy transition data sources are FREE: IEA, IRENA, ENTSO-E, Lazard, CarbonCredits.","Grid bottlenecks are the binding constraint on AI scaling — creates multi-year capex cycle.","Nuclear/SMR revival (uranium $78.50) is the underappreciated sub-theme within AI power."]} mon={["Hyperscaler Q1 capex","IEA quarterly report","Grid investment announcements","Battery cost trajectory"]}/>;

// =========================================================================
// NAVIGATION & SHELL
// =========================================================================
const TABS=[
{id:"P1",n:"Global Macro Regime",ic:Globe,s:"A",C:P1},{id:"P2",n:"Liquidity, Rates & Credit",ic:DollarSign,s:"A",C:P2},
{id:"P3",n:"News & Narrative Pulse",ic:Radio,s:"A",C:P3},{id:"P4",n:"Equities & Factors",ic:TrendingUp,s:"A",C:P4},
{id:"P5",n:"Bonds & Duration",ic:Layers,s:"A",C:P5},{id:"P6",n:"FX, EM & Frontier",ic:Globe,s:"A",C:P6},
{id:"P7",n:"Commodities & Real Assets",ic:Gem,s:"A",C:P7},{id:"P8",n:"Housing & Property",ic:Building2,s:"A",C:P8},
{id:"P9",n:"Crypto Intelligence",ic:CircleDot,s:"A",C:P9},{id:"P10",n:"Flows & Positioning",ic:Activity,s:"A",C:P10},
{id:"P11",n:"Valuation & Factors",ic:Target,s:"A",C:P11},{id:"P12",n:"Volatility & Stress",ic:AlertTriangle,s:"A",C:P12},
{id:"P13",n:"Alpha Frontier",ic:Zap,s:"A",C:P13},{id:"P14",n:"Scenario Lab",ic:Box,s:"A",C:P14},
{id:"P15",n:"Cash & Defence",ic:Shield,s:"A",C:P15},{id:"P16",n:"Weekly Synthesis",ic:FileText,s:"A",C:P16},
{id:"C1",n:"GP & Sponsors",ic:Briefcase,s:"B",C:C1},{id:"C2",n:"Infra Deal Intel",ic:Factory,s:"B",C:C2},
{id:"C3",n:"Infra Financing",ic:Landmark,s:"B",C:C3},{id:"C4",n:"Listed Infra Bridge",ic:TrendingUp,s:"B",C:C4},
{id:"C5",n:"PE & Secondaries",ic:Layers,s:"B",C:C5},{id:"C6",n:"Africa Macro",ic:Map,s:"B",C:C6},
{id:"C7",n:"Africa Investors",ic:Users,s:"B",C:C7},{id:"C8",n:"Energy Transition",ic:Flame,s:"B",C:C8}];

const SECS={A:"PERSONAL MARKETS & PORTFOLIO",B:"CAREER & INFRA INTELLIGENCE"};

export default function LifeStackMarkets(){
const[tab,setTab]=useState("P1");
const[side,setSide]=useState(true);
const[open,setOpen]=useState({A:true,B:true});
const Act=TABS.find(t=>t.id===tab)?.C||P1;
const tog=s=>setOpen(p=>({...p,[s]:!p[s]}));

return(
<div style={{minHeight:"100vh",background:"url('/bg-waves.svg') center/cover fixed, #05161A",color:P.t1,fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",display:"flex",position:"relative"}}>
  {/* SVG glass refraction defs */}
  <GlassDefs/>
  {/* Ambient teal glow orbs */}
  <div style={{position:"fixed",top:"-15%",right:"-8%",width:"55vw",height:"55vw",background:`radial-gradient(circle,${P.cyan}08 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>
  <div style={{position:"fixed",bottom:"-15%",left:"-8%",width:"45vw",height:"45vw",background:`radial-gradient(circle,${P.indigo}06 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>
  <div style={{position:"fixed",top:"40%",left:"30%",width:"30vw",height:"30vw",background:`radial-gradient(circle,${P.cyan}04 0%,transparent 60%)`,pointerEvents:"none",zIndex:0}}/>

  {/* SIDEBAR */}
  {side&&<div style={{width:256,minWidth:256,position:"sticky",top:0,height:"100vh",zIndex:10,overflow:'hidden'}}>
    {/* Sidebar shell: blur + teal refraction */}
    <div style={{position:'absolute',inset:0,
      backdropFilter:'blur(24px) saturate(1.5)',WebkitBackdropFilter:'blur(24px) saturate(1.5)',
      borderRight:'1px solid rgba(15,150,156,0.18)',
      backgroundImage:'linear-gradient(180deg, rgba(15,150,156,0.06), transparent 40%)',
      boxShadow:'inset -1px 0 0 rgba(15,150,156,0.10), 4px 0 24px rgba(0,0,0,0.30)',
      pointerEvents:'none',
    }}/>
    {/* Sidebar plate: deep teal-navy */}
    <div style={{position:'absolute',inset:0,background:'rgba(5,22,26,0.82)',pointerEvents:'none'}}/>
    <div style={{position:'relative',zIndex:1,padding:"14px 0",overflowY:"auto",height:'100%'}}>
      {/* Header */}
      <div style={{padding:"8px 18px 18px",borderBottom:`1px solid ${P.b2}`}}>
        <div style={{fontSize:9,color:P.cyan,fontWeight:800,letterSpacing:2.5,textTransform:'uppercase',marginBottom:2}}>LIFESTACK OS</div>
        <div style={{fontSize:15,fontWeight:800,color:P.t1,letterSpacing:-0.3}}>Market & Research</div>
        <div style={{fontSize:10,fontWeight:600,color:P.cyan,letterSpacing:0.5,marginTop:1}}>v3.0 · Horizon Glass</div>
        <div style={{fontSize:8.5,color:P.t3,marginTop:3}}>{M.date} · 24 tabs · 17 upgrades</div>
      </div>
      {/* Nav sections */}
      {Object.entries(SECS).map(([k,l])=>(
        <div key={k} style={{marginTop:8}}>
          <div onClick={()=>tog(k)} style={{padding:"6px 18px",display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:9,fontWeight:800,color:P.t3,letterSpacing:1.5,textTransform:"uppercase",userSelect:'none'}}>
            {open[k]?<ChevronDown size={11} color={P.cyan}/>:<ChevronRight size={11} color={P.t3}/>}
            <span>{l}</span>
          </div>
          {open[k]&&TABS.filter(t=>t.s===k).map(t=>{
            const Ic=t.ic;const a=tab===t.id;
            return(
              <div key={t.id} onClick={()=>setTab(t.id)}
                style={{padding:"7px 18px 7px 24px",display:"flex",alignItems:"center",gap:8,cursor:"pointer",
                  background:a?`linear-gradient(90deg,${P.cyanD},transparent)`:"transparent",
                  borderLeft:a?`2px solid ${P.cyan}`:`2px solid transparent`,
                  transition:"all 0.15s",
                }}>
                <Ic size={13} color={a?P.cyan:P.t3} strokeWidth={a?2.5:1.5}/>
                <div>
                  <div style={{fontSize:11.5,fontWeight:a?700:500,color:a?P.t1:P.t2,lineHeight:1.2}}>{t.n}</div>
                  <div style={{fontSize:8,color:a?P.cyan:P.t3,opacity:0.7,letterSpacing:0.5}}>{t.id}</div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>}

  {/* MAIN CONTENT */}
  <div style={{flex:1,padding:"18px 26px 40px",maxWidth:1400,margin:"0 auto",position:"relative",zIndex:1}}>
    {/* Topbar */}
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <button onClick={()=>setSide(!side)} style={{
        background:'rgba(7,46,51,0.55)',border:`1px solid ${P.b1}`,borderRadius:8,
        padding:"5px 10px",color:P.t2,cursor:"pointer",fontSize:10,fontWeight:600,
        backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',
        transition:'all 0.15s',
      }}>{side?"← Hide":"Menu →"}</button>
      <div style={{fontSize:9,color:P.t3,fontWeight:600,letterSpacing:0.8}}>
        SECTION {TABS.find(t=>t.id===tab)?.s} · TAB {tab}
      </div>
      {/* Quick-jump pills */}
      <div style={{marginLeft:"auto",display:"flex",gap:5}}>
        {["P1","P4","P9","P16"].map(q=>(
          <button key={q} onClick={()=>setTab(q)} style={{
            background:tab===q?P.cyanD:'rgba(7,46,51,0.45)',
            border:`1px solid ${tab===q?P.b1:'rgba(255,255,255,0.06)'}`,
            borderRadius:7,padding:"4px 10px",
            color:tab===q?P.cyan:P.t3,
            cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:0.5,
            backdropFilter:'blur(10px)',
            transition:'all 0.15s',
          }}>{q}</button>
        ))}
      </div>
    </div>
    <Act/>
  </div>
</div>
);
}
