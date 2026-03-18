'use client';
import React, { useState, useEffect } from 'react';
import { Briefcase, Factory, Landmark, TrendingUp, Layers, Map, Users, Flame, ChevronDown, ChevronRight } from 'lucide-react';
import { useEngines } from '../lib/engineContext';

// ── PALETTE ──
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

// --- LIQUID GLASS SYSTEM ---
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

// Backward-compat shim
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

// ── MARKET DATA ──
const M={date:"7 March 2026",regime:"LATE CYCLE — INFLATION SCARE",regimeConf:68,
// Equities
sp500:6831,sp500ATH:7008,sp500PE:29,sp500CAPE:40,sp50012m:18,sp500YTD:-0.01,
ftse100:10414,ftse10012m:19,ftse100ATH:10935,ftse250:23727,ftse25012m:12,
msciWorld12m:19.7,msciEurope12m:36.25,msciJapan12m:25.05,msciEM12m:33.57,nikkei:55621,
vix:24.5,move:118,stlfsi:0.8,nfci:0.2,
// Crypto
btcPrice:68200,btcATH:126198,btcDD:-45.9,ethPrice:1975,ethATH:4953,ethDD:-60,solPrice:86,solATH:293,solDD:-71,
fearGreed:18,mvrvZ:0.49,nupl:0.10,btcDom:58.2,rsi:27.5,etfFlow:"+$500M (5 Mar)",reserves:"2.48M ATL",whale:"270K BTC 30d",
sopr:0.95,reserveRisk:0.001,hodlWave:"68% held >1yr",
// UK Macro
boeRate:3.75,ukCPI:3.0,ukCore:3.1,ukServices:4.4,ukGDP:0.1,ukUnemp:5.2,gilt10y:4.62,gilt2y:3.80,
// FX
gbpusd:1.337,gbpzar:21.87,dxy:95.5,
// Commodities
brent:93.04,wti:91,gold:5280,copper:9200,uranium:78.5,
euETS:68,ukETS:42,
// Credit
igOAS:95,hyOAS:340,bbbOAS:145,
// Rates
fed:4.50,ecb:2.75,boj:0.5,
// Cash
bestSave:4.30,isaDeadlineDays:29,
// Sector
smh12m:70,igv12m:-30,mag7YTD:-6};

// ── SHARED UI COMPONENTS ──
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

const Hd=({t,s,tag,ac=P.cyan,showFreshness=false})=>(
  <div style={{marginBottom:18,marginTop:6}}>
    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
      <h2 style={{fontSize:24,fontWeight:800,color:P.t1,margin:0,letterSpacing:-0.4,textShadow:'0 2px 8px rgba(0,0,0,0.3)'}}>{t}</h2>
      {tag&&<span style={{padding:"3px 10px",borderRadius:6,fontSize:10,fontWeight:700,background:`${ac}20`,color:ac,textTransform:"uppercase",letterSpacing:1.2,border:`1px solid ${ac}30`}}>{tag}</span>}
    </div>
    {s&&<p style={{fontSize:12,color:P.t3,margin:"5px 0 0",lineHeight:1.5}}>{s}</p>}
  </div>
);

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

const SourceTag=({sources})=>(
  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>
    {sources.map((s,i)=><span key={i} style={{fontSize:8.5,padding:"2px 7px",borderRadius:4,background:P.cyanD,color:P.cyan,fontWeight:600,border:`1px solid ${P.b1}`}}>{s}</span>)}
  </div>
);

const PH=({title,sub,ac=P.cyan,right})=>(
  <div style={{margin:'-18px -18px 14px',borderRadius:'14px 14px 0 0',overflow:'hidden',flexShrink:0}}>
    <div style={{height:1,background:`linear-gradient(90deg,transparent 8%,rgba(255,255,255,0.18) 30%,${ac}55 50%,rgba(255,255,255,0.18) 70%,transparent 92%)`}}/>
    <div style={{...HEADER_BANNER,borderRadius:0}}>
      <div style={{flex:1}}>
        <div style={HEADER_TITLE}>{title}</div>
        {sub&&<div style={HEADER_SUB}>{sub}</div>}
      </div>
      {right&&<div style={{fontSize:11,fontWeight:700,color:ac,fontFamily:P.mono}}>{right}</div>}
    </div>
    <div style={{height:2,background:`linear-gradient(90deg,${ac}80,${ac}35 50%,transparent)`}}/>
  </div>
);

const MatStat=({label,value,sub,mat="teal",icon})=>(
  <div style={{...MAT[mat]||MAT.teal,overflow:'hidden',position:'relative',padding:'16px 18px',flex:'1 1 140px',minWidth:130}}>
    <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 50%)',pointerEvents:'none'}}/>
    <div style={{position:'relative',zIndex:1}}>
      {icon&&<div style={{fontSize:18,marginBottom:6}}>{icon}</div>}
      <div style={{fontSize:9,color:'rgba(255,255,255,0.55)',fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color:'#e8f4f5',fontFamily:P.mono,letterSpacing:-0.5,lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:'rgba(255,255,255,0.55)',marginTop:4,lineHeight:1.3}}>{sub}</div>}
    </div>
  </div>
);

// ── CAREER TAB TEMPLATE ──
const CareerTab=({name,tag,hero,items,sources,verdict,imp,mon})=>(<div>
<Hd t={name} tag={tag}/>
{hero&&<Row style={{marginBottom:0}}>{hero.map((h,i)=><MatStat key={i} {...h}/>)}</Row>}
<Glass>
<PH title="INTELLIGENCE DASHBOARD"/>
<MetricGrid items={items}/>
{sources&&<SourceTag sources={sources}/>}
</Glass>
<Verdict label={verdict} imp={imp} mon={mon}/></div>);

// ── C1-C8 CAREER TABS ──
const C1=()=><CareerTab name="GP ACTIVITY, STRATEGY & SPONSOR TRACKER" tag="SPONSOR MAP"
hero={[
  {label:"Deal Flow",value:"Elevated",sub:"Data centres dominating pipeline",mat:"teal"},
  {label:"Dry Powder",value:"$1.2T+",sub:"KKR Fund V · Brookfield successor",mat:"indigo"},
  {label:"Top Sector",value:"Data Centres",sub:"$40B Aligned/GIP benchmark deal",mat:"amber"},
  {label:"Signal",value:"BULLISH",sub:"Defence adjacencies opening",mat:"dark"},
]}
items={[
{l:"Blackstone",v:"Data Centres",n:"$40B+ AUM. Publicly traded vehicle planned.",c:T.violet},{l:"KKR",v:"Energy Transition",n:"Global Infra Fund V. Active in Europe.",c:T.blue},{l:"EQT",v:"Digital + Transport",n:"Nordic HQ. Strong European pipeline.",c:T.cyan},{l:"Macquarie",v:"Exiting positions",n:"$40B Aligned Data Centers sale to GIP consortium.",c:T.amber},{l:"Brookfield",v:"Renewables + Grid",n:"Largest infra AUM globally.",c:T.teal},{l:"AXA IM Alts",v:"Core / Core+",n:"Long-hold institutional infra.",c:T.neutral},{l:"Antin",v:"Mid-market Europe",n:"Digital, energy, transport, social.",c:T.blue},{l:"Igneo (First Sentier)",v:"Selective acquirer",n:"M&A reopening narrative.",c:T.violet}
]} sources={["Infrastructure Investor","GP Annual Reports","PitchBook (free news)","PE Hub"]}
verdict="SPONSOR APPETITE: ELEVATED FOR DATA CENTRES & ENERGY TRANSITION" imp={["Data centres dominating deal flow. $40B Aligned/GIP deal sets pricing benchmark.","Defence spending creating adjacencies for UK infra advisory at DC.","Fresh dry powder (KKR Fund V, Brookfield successor) = more credible buyers in processes."]} mon={["Infrastructure Investor weekly deal flow","GP fund close announcements","DC Advisory internal pipeline","Hyperscaler capex driving sponsor confidence"]}/>;

const C2=()=><CareerTab name="ENERGY & INFRASTRUCTURE DEAL INTELLIGENCE" tag="DEAL FLOW"
hero={[
  {label:"Deal Volume",value:"Growing",sub:"Energy transition + digital dominating",mat:"teal"},
  {label:"Top Subsector",value:"Data Centres",sub:"EV/EBITDA 20-25x · $40B deal",mat:"indigo"},
  {label:"WB PPI",value:"235 Projects",sub:"FREE global infra deal data",mat:"amber"},
  {label:"Financing",value:"Tightening",sub:"Gilt shock raising UK deal costs",mat:"red"},
]}
items={[
{l:"Deal Volume",v:"Growing",n:"Energy transition + digital dominating",c:T.teal},{l:"Top Subsector",v:"Data Centres",n:"Multi-billion equity checks. $40B Aligned deal.",c:T.violet},{l:"Valuations",v:"Rich for digital",n:"Data centre EV/EBITDA 20-25x",c:T.coral},{l:"Financing",v:"Tightening",n:"Gilt shock raising UK deal costs",c:T.amber},
{l:"WB PPI Database",v:"235 projects (2025)",n:"FREE infra deal data globally",c:T.teal},{l:"Africa Deals",v:"47 SSA projects",n:"$12.8B. Energy dominant.",c:T.blue},{l:"Failed Auctions",v:"Rising",n:"Pricing discipline tightening",c:T.amber},{l:"Pipeline",v:"Strong",n:"Energy security + grid driving mandates",c:T.teal}
]} sources={["World Bank PPI (free)","Infrastructure Investor","IJGlobal (free summaries)","EIB Project Database","Press releases"]}
verdict="DEAL VELOCITY HIGH — DATA CENTRES + ENERGY TRANSITION DOMINATING" imp={["World Bank PPI database provides FREE project-level deal data. Reduces IJGlobal dependency.","Data centre valuations (20-25x) are stretched. Watch for repricing if AI capex disappoints.","Gilt shock raising UK infra financing costs. Expect more selective sponsor behaviour."]} mon={["World Bank PPI quarterly updates","Deal announcement tracking","Valuation multiple trends","Financing condition trajectory"]}/>;

const C3=()=><CareerTab name="FINANCING & CAPITAL MARKETS FOR INFRA" tag="DEBT MARKETS"
hero={[
  {label:"Gilt 10Y",value:"4.62%",sub:"40bp weekly surge · mini-budget level",mat:"red"},
  {label:"Infra Spreads",value:"Widening",sub:"Gilt shock transmitting to PF",mat:"amber"},
  {label:"DFI Appetite",value:"Strong",sub:"IFC · AfDB · EBRD co-lending",mat:"teal"},
  {label:"Verdict",value:"SELECTIVE",sub:"Financing backdrop tightening",mat:"dark"},
]}
items={[
{l:"Infra Debt Spreads",v:"Widening",n:"Gilt shock transmitting to project finance",c:T.coral},{l:"Leverage Tolerance",v:"Tightening",n:"Lenders more selective post-rate spike",c:T.amber},{l:"Project Finance",v:"Selective",n:"Bank appetite focused on contracted assets",c:T.amber},{l:"Recap Window",v:"Narrowing",n:"Higher rates reduce recap economics",c:T.coral},
{l:"EIB Pipeline",v:"Active",n:"Free project-level data",c:T.teal},{l:"DFI Appetite",v:"Strong",n:"IFC, AfDB, EBRD co-lending robust",c:T.teal},{l:"Hedge Cost",v:"Rising",n:"Swap rates following gilt surge",c:T.coral},{l:"Verdict",v:"SELECTIVE",n:"Financing backdrop tightening",c:T.amber}
]} sources={["FRED base rates","BoE SONIA swaps","EIB Project Database (free)","DFI annual reports","Published deal terms"]}
verdict="FINANCING TIGHTENING — SPONSORS MUST BE MORE SELECTIVE" imp={["Gilt 4.62% directly impacts UK infra deal IRRs. Leveraged returns compress.","EIB and DFI databases are free and comprehensive for pipeline tracking.","If financing loosens (rate cuts resume), expect rapid acceleration in deal velocity."]} mon={["Gilt trajectory","Bank lending surveys","Published deal financing terms","EIB/EBRD pipeline updates"]}/>;

const C4=()=><CareerTab name="LISTED INFRA & PUBLIC-PRIVATE BRIDGE" tag="SIGNAL BRIDGE"
hero={[
  {label:"AI Power Capex",value:"$660-690B",sub:"Hyperscaler spend 2026 · grid bottleneck",mat:"teal"},
  {label:"EU Grid Need",value:"€1.4T",sub:"ENTSO-E · structural multi-year cycle",mat:"indigo"},
  {label:"DC REITs",value:"Strong",sub:"DLR · EQIX structural winners",mat:"amber"},
  {label:"Nuclear / SMR",value:"Rising",sub:"Uranium $78.50 · AI power narrative",mat:"dark"},
]}
items={[
{l:"AI Power Demand",v:"$660-690B capex",n:"Hyperscaler spending in 2026",c:T.violet},{l:"Grid Investment",v:"Accelerating",n:"€1.4T needed for EU grid upgrades",c:T.teal},{l:"Data Centre REITs",v:"Strong",n:"DLR, EQIX structural winners",c:T.teal},{l:"Utility Capex",v:"Rising",n:"NEE, SO, DUK expanding generation",c:T.blue},
{l:"Renewables LCOE",v:"Declining",n:"IRENA + Lazard data (free)",c:T.teal},{l:"Transport Infra",v:"Recovering",n:"Airport volumes normalising",c:T.neutral},{l:"Pub-Priv Gap",v:"Narrowing",n:"Listed re-rating toward private comps",c:T.amber},{l:"Nuclear / SMR",v:"Narrative rising",n:"Uranium $78.50 (CarbonCredits.com)",c:T.cyan}
]} sources={["SEC EDGAR (hyperscaler 10-Q)","IRENA (LCOE, free)","Lazard LCOE (free)","ENTSO-E (grid data, free)","IEA Electricity Report","CarbonCredits.com (uranium)"]}
verdict="AI POWER DEMAND = RICHEST CROSSOVER BETWEEN JOB AND INVESTING" imp={["Hyperscaler capex confirms multi-year power demand cycle. Grid + utilities = structural winners.","IRENA, Lazard, ENTSO-E all provide free data for renewables and grid economics.","Nuclear/SMR narrative strengthening. Uranium at $78.50 via CarbonCredits.com (free, replacing UxC paid)."]} mon={["Hyperscaler Q1 capex guidance","ENTSO-E grid data","IRENA annual cost report","Listed infra vs broad index performance"]}/>;

const C5=()=><CareerTab name="PE, PRIVATE CREDIT & SECONDARIES" tag="ALTERNATIVES"
hero={[
  {label:"Secondaries Vol",value:"$103B",sub:"H1 2025 record · Jefferies (free)",mat:"teal"},
  {label:"LP Pricing",value:"90% NAV",sub:"Discount narrowing · confidence rising",mat:"indigo"},
  {label:"PE Temperature",value:"Warming",sub:"Exits reopening · IPO pipeline building",mat:"amber"},
  {label:"Priv Credit",value:"Stress rising",sub:"Proskauer default index · free quarterly",mat:"red"},
]}
items={[
{l:"PE Temperature",v:"Warming",n:"Exits reopening. IPO pipeline building.",c:T.teal},{l:"Secondaries Volume",v:"Record $103B",n:"H1 2025 Jefferies report (free)",c:T.teal},{l:"LP Pricing",v:"90% NAV",n:"Discount narrowing",c:T.amber},{l:"Private Credit",v:"Stress rising",n:"Proskauer default index (free quarterly)",c:T.coral},
{l:"Infra Secondaries",v:"Active",n:"GP-led continuation vehicles growing",c:T.blue},{l:"VC Late-Stage",v:"Selective",n:"AI funding robust. Other sectors challenged.",c:T.amber},{l:"Real Estate",v:"Bifurcated",n:"Data centres premium. Office distressed.",c:T.amber},{l:"Alt Policy",v:"Max 5% NAV",n:"Liquidity limits enforced",c:T.accent}
]} sources={["Jefferies Secondary Market Review (free)","Bain Global PE Report (free)","McKinsey Private Markets Review (free)","Proskauer Default Index (free)","Campbell Lutyens (free)"]}
verdict="SECONDARIES AT RECORD — STRESS INDICATOR AND OPPORTUNITY" imp={["All key PE/secondaries data available FREE: Jefferies, Bain, McKinsey, Proskauer, Campbell Lutyens.","Secondaries pricing at 90% NAV signals improving confidence but not euphoria.","Private credit stress rising — Proskauer free quarterly is the key monitor."]} mon={["Jefferies H2 2025 report","Bain Global PE Report 2026","Proskauer quarterly index","IPO pipeline development"]}/>;

const C6=()=><CareerTab name="AFRICA MACRO, COUNTRY RISK & OPPORTUNITY" tag="AFRICA"
hero={[
  {label:"Africa GDP",value:"3.9%",sub:"AfDB 2025 · Energy reform progress",mat:"teal"},
  {label:"GBP/ZAR",value:M.gbpzar.toFixed(2),sub:"Rand +7% YoY · Don't add until 23",mat:"amber"},
  {label:"Financing Gap",value:"$245B/yr",sub:"Sub-Saharan infra need",mat:"red"},
  {label:"DC Opportunity",value:"<1% Global",sub:"Africa data centre gap · AI theme",mat:"indigo"},
]}
items={[
{l:"Africa GDP Growth",v:"3.9%",n:"AfDB 2025 estimate. Modest downgrade.",c:T.amber},{l:"Financing Gap",v:"$245B/yr",n:"Sub-Saharan Africa infrastructure need",c:T.coral},{l:"GBP/ZAR",v:M.gbpzar.toFixed(2),n:"Rand strengthening. -7% YoY.",c:T.amber},{l:"SA Load Shedding",v:"Improving",n:"Energy reform progress",c:T.teal},
{l:"Nigeria FX",v:"Liberalising",n:"Reform progress but volatile",c:T.amber},{l:"Kenya PPP",v:"Framework developing",n:"Digital infra opportunities",c:T.blue},{l:"ODA Decline",v:"-9-17%",n:"Aid cuts forcing private capital",c:T.coral},{l:"Data Centre Gap",v:"<1% global",n:"Africa has <1% of world DC capacity",c:T.violet}
]} sources={["AfDB Economic Outlook (free)","IMF Data Portal (free)","World Bank Africa (free)","AfDB Open Data (free)","GMD v2026 (free)","World Bank PPI (free)"]}
verdict="SA IMPROVING BUT FINANCING GAP DEMANDS PRIVATE CAPITAL" imp={["All Africa macro data available FREE: AfDB, IMF, World Bank, GMD. Zero paid sources needed.","GBP/ZAR at 21.87: existing ZAR assets worth more. Don't add until above 23.","Africa data centre gap (<1% global) is the biggest digital infra opportunity — aligns with AI power theme."]} mon={["AfDB Annual Report","SA load-shedding status","Nigeria FX reform","GBP/ZAR trajectory"]}/>;

const C7=()=><CareerTab name="AFRICA INVESTOR & DEAL TRACKER" tag="AFRICA BUYERS"
hero={[
  {label:"WB PPI Africa",value:"47 Deals",sub:"$12.8B SSA · energy dominant · FREE",mat:"teal"},
  {label:"DFI Appetite",value:"Strong",sub:"IFC · AfDB · EBRD co-lending active",mat:"indigo"},
  {label:"Priority Market",value:"SA + Kenya",sub:"Strongest reform + growth combo",mat:"amber"},
  {label:"DC Opportunity",value:"<1% Global",sub:"Africa data centre gap · AI theme",mat:"dark"},
]}
items={[
{l:"Helios Investment",v:"PE/Climate/Digital",n:"Pan-African. West Africa focus.",c:T.violet},{l:"AIIM",v:"Long-term Infra",n:"Institutional. Southern Africa.",c:T.blue},{l:"Africa Finance Corp",v:"Principal Investing",n:"Infrastructure mobilisation. Free reports.",c:T.teal},{l:"Actis",v:"Sustainable Infra",n:"Energy transition focus.",c:T.cyan},
{l:"Adenia",v:"Control-Growth",n:"Francophone Africa. Mid-market.",c:T.amber},{l:"WB PPI (Africa)",v:"47 SSA deals",n:"$12.8B value. Energy dominant.",c:T.teal},{l:"DFI Co-Lending",v:"Strong",n:"IFC, AfDB, EBRD active in Africa",c:T.teal},{l:"Priority",v:"SA + Kenya",n:"Strongest reform + growth combo",c:T.accent}
]} sources={["GP Websites (free)","Infrastructure Investor (free)","AFC Annual Report (free)","World Bank PPI (free)","DFI Reports (free)"]}
verdict="AFRICA INVESTOR MAP: ALL DATA AVAILABLE FREE" imp={["GP websites and annual reports provide free strategy and portfolio information.","World Bank PPI gives project-level African deal data at zero cost.","AFC publications provide free pipeline data and risk-mitigation frameworks."]} mon={["Helios, AIIM, AFC, Actis website updates","Infrastructure Investor Africa coverage","AFC annual report","DFI co-lending announcements"]}/>;

const C8=()=><CareerTab name="ENERGY TRANSITION, POWER & DIGITAL INFRA" tag="THEMATIC CAPSTONE"
hero={[
  {label:"AI Power Capex",value:"$660-690B",sub:"Hyperscaler spend 2026 · Grid bottleneck",mat:"teal"},
  {label:"Grid Need",value:"€1.4T",sub:"EU upgrades · ENTSO-E",mat:"indigo"},
  {label:"BNEF Transition",value:"$2.3T",sub:"Record 2025 global energy investment",mat:"amber"},
  {label:"Uranium",value:"$78.50",sub:"+18% · AI nuclear revival · CarbonCredits",mat:"dark"},
]}
items={[
{l:"Grid Investment",v:"Accelerating",n:"€1.4T EU upgrades needed (ENTSO-E)",c:T.teal},{l:"AI Power Demand",v:"$660-690B",n:"Hyperscaler capex in 2026",c:T.violet},{l:"Battery/Storage",v:"Costs declining",n:"IRENA data (free)",c:T.teal},{l:"Gas-to-Power",v:"Necessary",n:"Transition needs dispatchable support",c:T.amber},
{l:"Digital Build-Out",v:"Fibre + DC",n:"TeleGeography free data",c:T.blue},{l:"Circular Economy",v:"Less crowded",n:"Waste/water still infra-like",c:T.neutral},{l:"Resilience Infra",v:"Emerging",n:"Energy security becoming investable",c:T.cyan},{l:"BNEF Transition",v:"$2.3T (2025)",n:"Record global energy transition investment",c:T.teal}
]} sources={["IEA World Energy Investment (free)","IRENA (free)","ENTSO-E (free)","SEC EDGAR (hyperscaler 10-Q)","Lazard LCOE (free)","CarbonCredits.com (uranium, free)","BP/Energy Institute (free)"]}
verdict="AI POWER + GRID = HIGHEST-CONVICTION STRUCTURAL THEME" imp={["All energy transition data sources are FREE: IEA, IRENA, ENTSO-E, Lazard, CarbonCredits.","Grid bottlenecks are the binding constraint on AI scaling — creates multi-year capex cycle.","Nuclear/SMR revival (uranium $78.50) is the underappreciated sub-theme within AI power."]} mon={["Hyperscaler Q1 capex","IEA quarterly report","Grid investment announcements","Battery cost trajectory"]}/>;

// ── NAVIGATION CONFIG ──
const TABS=[
{id:"C1",n:"GP & Sponsors",ic:Briefcase,s:"A",C:C1},{id:"C2",n:"Infra Deal Intel",ic:Factory,s:"A",C:C2},
{id:"C3",n:"Infra Financing",ic:Landmark,s:"A",C:C3},{id:"C4",n:"Listed Infra Bridge",ic:TrendingUp,s:"A",C:C4},
{id:"C5",n:"PE & Secondaries",ic:Layers,s:"B",C:C5},{id:"C6",n:"Africa Macro",ic:Map,s:"B",C:C6},
{id:"C7",n:"Africa Investors",ic:Users,s:"B",C:C7},{id:"C8",n:"Energy Transition",ic:Flame,s:"B",C:C8}];

const SECS={A:"GP, DEALS & FINANCING",B:"ALTERNATIVES & THEMATIC"};

// ── MAIN EXPORT ──
export default function CareerModule(){
const[tab,setTab]=useState("C1");
const[side,setSide]=useState(true);
const[open,setOpen]=useState({A:true,B:true});
const Act=TABS.find(t=>t.id===tab)?.C||C1;
const tog=s=>setOpen(p=>({...p,[s]:!p[s]}));

// Sync live market prices from EngineContext (published by MarketsModule on mount/refresh)
const { PRICES: ctxPrices } = useEngines();
const [, forceUpdate] = useState(0);
useEffect(()=>{
  if(!ctxPrices) return;
  const keys = ['gbpusd','gbpzar','dxy','gilt10y','gilt2y','boeRate','ukCPI','ukCore','ukGDP','ukUnemp','btcPrice','ethPrice','vix','fearGreed','brent','gold'];
  let updated = false;
  keys.forEach(k => { if(ctxPrices[k] != null && ctxPrices[k] !== M[k]) { M[k] = ctxPrices[k]; updated = true; } });
  if(updated) forceUpdate(n => n+1);
},[ctxPrices]);

return(
<div style={{minHeight:"100vh",background:"#05161A",color:P.t1,fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",display:"flex",position:"relative"}}>
  {/* Fixed wallpaper layer — separate GPU-composited layer eliminates scroll jitter */}
  <div style={{position:"fixed",inset:0,background:"url('/bg-markets.png') center/cover no-repeat",zIndex:-2,willChange:"transform",transform:"translateZ(0)"}}/>
  {/* Dark teal overlay so glass panels stay readable over warm wallpaper */}
  <div style={{position:"fixed",inset:0,background:"rgba(5,22,26,0.62)",zIndex:-1,pointerEvents:"none"}}/>
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
        <div style={{fontSize:15,fontWeight:800,color:P.t1,letterSpacing:-0.3}}>Career & Infra Intelligence</div>
        <div style={{fontSize:10,fontWeight:600,color:P.cyan,letterSpacing:0.5,marginTop:1}}>v3.0 · Horizon Glass</div>
        <div style={{fontSize:8.5,color:P.t3,marginTop:3}}>{M.date} · 8 tabs</div>
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
        {["C1","C4","C6","C8"].map(q=>(
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
