'use client';
import React, { useState, useEffect } from "react";
import { useSupabaseData } from '../lib/useData';
import { ChevronDown, ChevronRight, Settings, Database, Cpu, Sliders } from "lucide-react";

// ── PALETTE (copied from PortfolioVOS) ──
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
const MAT={
  teal:{background:'linear-gradient(135deg, #0F969C 0%, #0C7075 50%, #072E33 100%)',boxShadow:'0 8px 32px rgba(15,150,156,0.45), 0 0 80px rgba(15,150,156,0.10), inset 0 1px 0 rgba(255,255,255,0.22)',borderRadius:16,border:'1px solid rgba(15,150,156,0.35)'},
  indigo:{background:'linear-gradient(135deg, #294D61 0%, #1a3548 50%, #05161A 100%)',boxShadow:'0 8px 32px rgba(41,77,97,0.45), 0 0 80px rgba(41,77,97,0.08), inset 0 1px 0 rgba(255,255,255,0.18)',borderRadius:16,border:'1px solid rgba(109,165,192,0.25)'},
  amber:{background:'linear-gradient(135deg, #d97706, #92400e)',boxShadow:'0 8px 32px rgba(217,119,6,0.30), 0 0 80px rgba(217,119,6,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',borderRadius:16,border:'1px solid rgba(255,255,255,0.12)'},
  red:{background:'linear-gradient(135deg, #dc2626, #7f1d1d)',boxShadow:'0 8px 32px rgba(220,38,38,0.30), 0 0 80px rgba(220,38,38,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',borderRadius:16,border:'1px solid rgba(255,255,255,0.12)'},
  dark:{background:'linear-gradient(135deg, #0C7075 0%, #072E33 50%, #05161A 100%)',boxShadow:'0 8px 32px rgba(12,112,117,0.40), 0 0 80px rgba(12,112,117,0.08), inset 0 1px 0 rgba(255,255,255,0.14)',borderRadius:16,border:'1px solid rgba(15,150,156,0.20)'},
};
const GLASS_BASE={radius:16,padding:20};
const glassLight=(tier=2)=>{
  const plate=tier===1?'rgba(7,46,51,0.72)':tier===3?'rgba(5,22,26,0.35)':'rgba(7,46,51,0.58)';
  const blur=20;const sat=tier===1?1.8:tier===3?1.3:1.6;
  const specular=tier===1?0.22:tier===3?0.10:0.15;
  const sheen=tier===3?0.08:tier===1?0.08:0.06;
  const bdr=tier===1?'rgba(15,150,156,0.32)':tier===3?'rgba(15,150,156,0.10)':'rgba(15,150,156,0.22)';
  return{background:plate,backdropFilter:`blur(${blur}px) saturate(${sat})`,WebkitBackdropFilter:`blur(${blur}px) saturate(${sat})`,border:`1px solid ${bdr}`,borderRadius:GLASS_BASE.radius,boxShadow:`0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,${specular}), inset 0 0 0 1px rgba(15,150,156,0.06)`,backgroundImage:`linear-gradient(135deg, rgba(255,255,255,${sheen}) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)`};
};
const G=glassLight(2);const G1=glassLight(1);const G3=glassLight(3);
const GS={background:"rgba(7,46,51,0.92)",backdropFilter:"blur(20px) saturate(1.6)",WebkitBackdropFilter:"blur(20px) saturate(1.6)",border:"1px solid rgba(15,150,156,0.28)",borderRadius:16,boxShadow:"0 8px 32px rgba(0,0,0,0.30), 0 0 80px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.16)",backgroundImage:"linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)"};
const HEADER_BANNER={background:'linear-gradient(90deg, rgba(5,22,26,0.92), rgba(7,46,51,0.80) 70%)',padding:'10px 16px',borderRadius:'16px 16px 0 0',marginBottom:0,display:'flex',justifyContent:'space-between',alignItems:'center',backgroundImage:'linear-gradient(90deg, rgba(15,150,156,0.10), transparent 70%)',borderBottom:'1px solid rgba(15,150,156,0.16)'};
const HEADER_TITLE={fontSize:13,fontWeight:800,color:'#e8f4f5',letterSpacing:1.5,textTransform:'uppercase'};
const HEADER_SUB={fontSize:10,fontWeight:500,color:'rgba(232,244,245,0.45)',marginTop:1};
const hx2=c=>{if(!c||c[0]!=="#")return"99,102,241";c=c.replace("#","");return[parseInt(c.substring(0,2),16),parseInt(c.substring(2,4),16),parseInt(c.substring(4,6),16)].join(",");};
const fmt=v=>`£${Math.abs(v).toLocaleString("en-GB",{maximumFractionDigits:0})}`;
const fK=v=>`£${(v/1000).toFixed(v>=10000?0:1)}k`;

// ── Module globals ──
let PORT={date:"7 March 2026",fireTarget:1800000,inflation:0.032,netWorth:362072};
let FRESHNESS={};
let ENGINE={concentration:null,debtPriority:null,sleeveExposure:null,wrapperExposure:null,currencyExposure:null,driftMonitor:null,isaPensionRouting:null,rebalanceProposal:null,riskBudget:null,contributionAttribution:null,drawdown:null,scenarioSensitivity:null,monteCarlo:null,liquidityLadder:null,bonusAllocation:null,capitalEfficiency:null,cryptoRebalance:null,cryptoScenario:null};
let MKTENG={regime:null,stress:null,btcCycle:null,yieldCurve:null,creditStress:null,sectorLeadership:null,cryptoOnChain:null};
let AGENT={synthesis:null,rankedOpps:null,whatChanged:null,actionQueue:null,triggerAlerts:null,morningCommand:null,dailyBrief:null,opportunityRadar:null,watchlist:null,deadlines:null,rebalanceApproval:null,monthlyReview:null,freshnessAudit:null,tilePriority:null,insightCallouts:null,whatMattersNow:null,reportExport:null,altcoinRiskCap:null,performanceBridge:null,thesisMonitor:null};

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

// =========================================================================
// TAB 18 — AGENT COMMAND CENTER
// =========================================================================
const T18 = ({ ENGINE, MKTENG, AGENT }) => {
  const [view, setView] = useState('overview');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentSettings, setAgentSettings] = useState({});
  const [editingAgent, setEditingAgent] = useState(null);

  // Agent configurable parameters — users can adjust thresholds and inputs
  const defaultConfigs = {
    concentration: { maxHHI: 0.15, topNLimit: 5, clutterThreshold: 0.01 },
    driftMonitor: { driftThreshold: 5, rebalanceBand: 3, urgencyWeight: 0.7 },
    drawdown: { maxDrawdown: 15, recoveryWindow: 90, alertThreshold: 10 },
    riskBudget: { maxVol: 12, targetSharpe: 0.8, maxBeta: 1.2 },
    cryptoRebalance: { btcTarget: 60, ethTarget: 25, altTarget: 15, rebalanceBand: 5 },
    altcoinRiskCap: { maxAltcoinPct: 5, hardCap: true, reviewCycleDays: 30 },
    regime: { recessionThreshold: 40, inflationTarget: 2.5, confidenceMin: 60 },
    stress: { elevatedThreshold: 40, crisisThreshold: 70, contagionWeight: 0.3 },
    btcCycle: { accumulationMVRV: 1.0, distributionMVRV: 3.0, fearThreshold: 25 },
    triggerAlerts: { vixSpike: 30, driftAlert: 5, drawdownAlert: 10, isaDeadlineDays: 30 },
    deadlines: { isaDeadline: '2026-04-05', pensionReview: '2026-06-30', taxReturn: '2026-01-31' },
    morningCommand: { priorityCount: 5, includeMarket: true, includeCrypto: true },
  };

  const getConfig = (agentId) => agentSettings[agentId] || defaultConfigs[agentId] || {};
  const updateConfig = (agentId, key, value) => {
    setAgentSettings(prev => ({
      ...prev,
      [agentId]: { ...(prev[agentId] || defaultConfigs[agentId] || {}), [key]: value }
    }));
  };

  const engineAgents = [
    { id: 'concentration', name: 'Concentration Engine', category: 'Portfolio', source: ENGINE, key: 'concentration', trigger: 'Daily', desc: 'HHI, position limits, clutter detection' },
    { id: 'debtPriority', name: 'Debt Priority', category: 'Portfolio', source: ENGINE, key: 'debtPriority', trigger: 'Daily', desc: 'Debt ranking, guaranteed alpha calculation' },
    { id: 'sleeveExposure', name: 'Sleeve Exposure', category: 'Portfolio', source: ENGINE, key: 'sleeveExposure', trigger: 'Daily', desc: 'Asset class breakdown' },
    { id: 'wrapperExposure', name: 'Wrapper Exposure', category: 'Portfolio', source: ENGINE, key: 'wrapperExposure', trigger: 'Daily', desc: 'ISA/GIA/SIPP tax efficiency' },
    { id: 'currencyExposure', name: 'Currency Exposure', category: 'Portfolio', source: ENGINE, key: 'currencyExposure', trigger: 'Daily', desc: 'FX concentration monitoring' },
    { id: 'driftMonitor', name: 'Drift Monitor', category: 'Portfolio', source: ENGINE, key: 'driftMonitor', trigger: 'Daily', desc: 'Rebalance urgency scoring' },
    { id: 'isaPensionRouting', name: 'ISA / Pension Routing', category: 'Portfolio', source: ENGINE, key: 'isaPensionRouting', trigger: 'Weekly', desc: 'Tax-optimal wrapper placement' },
    { id: 'rebalanceProposal', name: 'Rebalance Proposal', category: 'Portfolio', source: ENGINE, key: 'rebalanceProposal', trigger: 'Weekly', desc: 'Trade generation' },
    { id: 'riskBudget', name: 'Risk Budget', category: 'Portfolio', source: ENGINE, key: 'riskBudget', trigger: 'Daily', desc: 'Risk allocation tracking' },
    { id: 'drawdown', name: 'Drawdown Monitor', category: 'Portfolio', source: ENGINE, key: 'drawdown', trigger: 'Daily', desc: 'Peak-to-trough analysis' },
    { id: 'monteCarlo', name: 'Monte Carlo', category: 'Portfolio', source: ENGINE, key: 'monteCarlo', trigger: 'Weekly', desc: 'Probabilistic wealth projection' },
    { id: 'liquidityLadder', name: 'Liquidity Ladder', category: 'Portfolio', source: ENGINE, key: 'liquidityLadder', trigger: 'Daily', desc: 'Maturity analysis' },
    { id: 'bonusAllocation', name: 'Bonus Allocation', category: 'Portfolio', source: ENGINE, key: 'bonusAllocation', trigger: 'Event', desc: 'Bonus deployment logic' },
    { id: 'capitalEfficiency', name: 'Capital Efficiency', category: 'Portfolio', source: ENGINE, key: 'capitalEfficiency', trigger: 'Weekly', desc: 'Return on capital metrics' },
    { id: 'cryptoRebalance', name: 'Crypto Rebalance', category: 'Crypto', source: ENGINE, key: 'cryptoRebalance', trigger: 'Weekly', desc: 'Crypto-specific rebalancing' },
    { id: 'cryptoScenario', name: 'Crypto Scenario Lab', category: 'Crypto', source: ENGINE, key: 'cryptoScenario', trigger: 'Weekly', desc: 'BTC/ETH/SOL stress testing' },
    { id: 'scenarioSensitivity', name: 'Scenario Sensitivity', category: 'Portfolio', source: ENGINE, key: 'scenarioSensitivity', trigger: 'Weekly', desc: 'Stress testing' },
    { id: 'contributionAttribution', name: 'Contribution Attribution', category: 'Portfolio', source: ENGINE, key: 'contributionAttribution', trigger: 'Daily', desc: 'Performance attribution' },
  ];

  const marketAgents = [
    { id: 'regime', name: 'Macro Regime Classifier', category: 'Market', source: MKTENG, key: 'regime', trigger: 'Daily', desc: 'Risk-on/off classification' },
    { id: 'stress', name: 'Cross-Asset Stress', category: 'Market', source: MKTENG, key: 'stress', trigger: 'Daily', desc: 'VIX, MOVE, spreads, dollar' },
    { id: 'btcCycle', name: 'BTC Cycle', category: 'Crypto', source: MKTENG, key: 'btcCycle', trigger: 'Daily', desc: 'MVRV, NUPL, SOPR cycle scoring' },
    { id: 'yieldCurve', name: 'Yield Curve', category: 'Market', source: MKTENG, key: 'yieldCurve', trigger: 'Daily', desc: '2s10s, curve shape' },
    { id: 'creditStress', name: 'Credit Stress', category: 'Market', source: MKTENG, key: 'creditStress', trigger: 'Daily', desc: 'IG/HY OAS monitoring' },
    { id: 'sectorLeadership', name: 'Sector Leadership', category: 'Market', source: MKTENG, key: 'sectorLeadership', trigger: 'Daily', desc: 'Sector rotation tracking' },
    { id: 'cryptoOnChain', name: 'Crypto On-Chain', category: 'Crypto', source: MKTENG, key: 'cryptoOnChain', trigger: 'Daily', desc: 'On-chain metrics' },
  ];

  const decisionAgents = [
    { id: 'morningCommand', name: 'Morning Command', category: 'Decision', source: AGENT, key: 'morningCommand', trigger: 'Daily', desc: 'Daily priority briefing' },
    { id: 'dailyBrief', name: 'Daily Brief', category: 'Research', source: AGENT, key: 'dailyBrief', trigger: 'Daily', desc: '1-page daily market brief' },
    { id: 'synthesis', name: 'Weekly Synthesis', category: 'Research', source: AGENT, key: 'synthesis', trigger: 'Weekly', desc: 'CIO-style weekly memo' },
    { id: 'actionQueue', name: 'Action Queue', category: 'Decision', source: AGENT, key: 'actionQueue', trigger: 'Daily', desc: 'Ranked action recommendations' },
    { id: 'rankedOpps', name: 'Opportunity Ranker', category: 'Decision', source: AGENT, key: 'rankedOpps', trigger: 'Daily', desc: 'Conviction-scored opportunities' },
    { id: 'triggerAlerts', name: 'Trigger Alerts', category: 'Decision', source: AGENT, key: 'triggerAlerts', trigger: 'Event', desc: 'Threshold-based notifications' },
    { id: 'whatChanged', name: 'What Changed', category: 'Dashboard', source: AGENT, key: 'whatChanged', trigger: 'Daily', desc: 'Delta detection engine' },
    { id: 'whatMattersNow', name: 'What Matters Now', category: 'Dashboard', source: AGENT, key: 'whatMattersNow', trigger: 'Daily', desc: 'Priority ranking engine' },
    { id: 'insightCallouts', name: 'Insight Callouts', category: 'Dashboard', source: AGENT, key: 'insightCallouts', trigger: 'Daily', desc: 'Plain-English insight writer' },
    { id: 'tilePriority', name: 'Tile Priority', category: 'Dashboard', source: AGENT, key: 'tilePriority', trigger: 'Daily', desc: 'Dashboard tile reordering' },
    { id: 'thesisMonitor', name: 'Thesis Monitor', category: 'Decision', source: AGENT, key: 'thesisMonitor', trigger: 'Weekly', desc: 'Investment thesis tracking' },
    { id: 'opportunityRadar', name: 'Opportunity Radar', category: 'Decision', source: AGENT, key: 'opportunityRadar', trigger: 'Weekly', desc: 'Opportunity detection' },
    { id: 'watchlist', name: 'Watchlist', category: 'Decision', source: AGENT, key: 'watchlist', trigger: 'Daily', desc: 'Dynamic asset watchlist' },
    { id: 'deadlines', name: 'Deadline Agent', category: 'Execution', source: AGENT, key: 'deadlines', trigger: 'Daily', desc: 'ISA, tax, review deadlines' },
    { id: 'rebalanceApproval', name: 'Rebalance Pack', category: 'Execution', source: AGENT, key: 'rebalanceApproval', trigger: 'Weekly', desc: 'Drift + cost + tax approval memo' },
    { id: 'monthlyReview', name: 'Monthly Review', category: 'Research', source: AGENT, key: 'monthlyReview', trigger: 'Monthly', desc: 'Full scorecard review' },
    { id: 'freshnessAudit', name: 'Freshness Audit', category: 'Dashboard', source: AGENT, key: 'freshnessAudit', trigger: 'Daily', desc: 'Data staleness checker' },
    { id: 'altcoinRiskCap', name: 'Altcoin Risk Cap', category: 'Crypto', source: AGENT, key: 'altcoinRiskCap', trigger: 'Daily', desc: 'Hard sleeve cap enforcement' },
    { id: 'performanceBridge', name: 'Performance Bridge', category: 'Research', source: AGENT, key: 'performanceBridge', trigger: 'Weekly', desc: 'NAV attribution memo' },
    { id: 'reportExport', name: 'Report Exporter', category: 'Dashboard', source: AGENT, key: 'reportExport', trigger: 'Weekly', desc: 'Markdown report generator' },
  ];

  const allAgents = [...engineAgents, ...marketAgents, ...decisionAgents];
  const categories = ['Portfolio', 'Market', 'Crypto', 'Decision', 'Research', 'Execution', 'Dashboard'];
  const triggers = ['Daily', 'Weekly', 'Monthly', 'Event'];

  const getStatus = (agent) => {
    const data = agent.source?.[agent.key];
    if (!data) return { label: 'Idle', color: 'rgba(232,244,245,0.25)' };
    if (data.error) return { label: 'Error', color: P.red };
    return { label: 'Active', color: '#22c55e' };
  };

  const getOutputPreview = (agent) => {
    const data = agent.source?.[agent.key];
    if (!data) return 'No output yet';
    if (data.error) return `Error: ${data.error}`;
    const keys = Object.keys(data);
    if (keys.length <= 5) return keys.join(', ');
    return `${keys.slice(0, 4).join(', ')} + ${keys.length - 4} more`;
  };

  const activeCount = allAgents.filter(a => getStatus(a).label === 'Active').length;
  const errorCount = allAgents.filter(a => getStatus(a).label === 'Error').length;

  const cronSchedules = [
    { name: 'Daily Orchestration', schedule: '0 7 * * *', desc: 'Runs all engines + agents at 7 AM UTC', endpoint: '/api/cron/daily' },
    { name: 'Weekly Synthesis', schedule: '0 8 * * 1', desc: 'Weekly memo + review on Monday 8 AM UTC', endpoint: '/api/cron/weekly' },
  ];

  const views = [
    { id: 'overview', label: 'Overview' },
    { id: 'engines', label: 'Portfolio Engines' },
    { id: 'market', label: 'Market Engines' },
    { id: 'agents', label: 'Decision Agents' },
    { id: 'workflows', label: 'Automated Workflows' },
    { id: 'output', label: 'Agent Output Inspector' },
    { id: 'settings', label: 'Agent Settings' },
  ];

  const filteredAgents = view === 'engines' ? engineAgents : view === 'market' ? marketAgents : view === 'agents' ? decisionAgents : allAgents;

  const AgentCard = ({ agent }) => {
    const status = getStatus(agent);
    const isSelected = selectedAgent?.id === agent.id;
    const data = agent.source?.[agent.key];
    const hasConfig = !!defaultConfigs[agent.id];
    const config = getConfig(agent.id);

    // Extract key metrics from agent output for quick-glance drill-down
    const getQuickMetrics = () => {
      if (!data || data.error) return [];
      const metrics = [];
      if (data.compositeScore !== undefined) metrics.push({ l: 'Score', v: `${Number(data.compositeScore).toFixed(0)}/100`, c: data.compositeScore > 60 ? '#ef4444' : data.compositeScore > 30 ? '#f59e0b' : '#22c55e' });
      if (data.phase) metrics.push({ l: 'Phase', v: data.phase, c: '#0F969C' });
      if (data.regime) metrics.push({ l: 'Regime', v: data.regime, c: '#6DA5C0' });
      if (data.riskScore !== undefined) metrics.push({ l: 'Risk', v: `${Number(data.riskScore).toFixed(0)}/100`, c: data.riskScore > 60 ? '#ef4444' : '#22c55e' });
      if (data.confidence !== undefined) metrics.push({ l: 'Conf', v: `${Number(data.confidence).toFixed(0)}%`, c: '#0F969C' });
      if (data.bias !== undefined) metrics.push({ l: 'Bias', v: `${data.bias}/5`, c: data.bias >= 3 ? '#22c55e' : '#f59e0b' });
      if (data.healthScore !== undefined) metrics.push({ l: 'Health', v: `${Number(data.healthScore).toFixed(0)}/100`, c: data.healthScore > 60 ? '#22c55e' : '#ef4444' });
      if (data.alerts?.length) metrics.push({ l: 'Alerts', v: data.alerts.length.toString(), c: '#ef4444' });
      if (data.topAction) metrics.push({ l: 'Action', v: typeof data.topAction === 'string' ? data.topAction.slice(0, 20) : '1 pending', c: '#0F969C' });
      return metrics.slice(0, 4);
    };

    return (
      <div onClick={() => setSelectedAgent(isSelected ? null : agent)} style={{ ...GS, borderRadius: 12, padding: '12px 16px', cursor: 'pointer', border: isSelected ? '1px solid rgba(15,150,156,0.5)' : '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: P.t1 }}>{agent.name}</span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {hasConfig && <span onClick={(e) => { e.stopPropagation(); setEditingAgent(agent.id); setView('settings'); }} style={{ fontSize: 8, padding: '2px 5px', borderRadius: 4, background: 'rgba(109,165,192,0.15)', color: '#6DA5C0', cursor: 'pointer', border: '1px solid rgba(109,165,192,0.25)' }}>SETTINGS</span>}
            <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(15,150,156,0.15)', color: P.teal }}>{agent.trigger}</span>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.color, display: 'inline-block' }}/>
          </div>
        </div>
        <div style={{ fontSize: 10, color: P.t3, marginBottom: 4 }}>{agent.desc}</div>

        {/* Quick metrics drill-down */}
        {getQuickMetrics().length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            {getQuickMetrics().map((m, i) => (
              <div key={i} style={{ padding: '2px 7px', borderRadius: 4, background: `${m.c}18`, border: `1px solid ${m.c}30`, fontSize: 9 }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', marginRight: 3 }}>{m.l}:</span>
                <span style={{ color: m.c, fontWeight: 700 }}>{m.v}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 9, color: 'rgba(232,244,245,0.3)' }}>Output: {getOutputPreview(agent)}</div>

        {isSelected && data && !data.error && (
          <div style={{ marginTop: 10, padding: 10, background: 'rgba(0,0,0,0.3)', borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
            <div style={{ fontSize: 10, color: P.teal, marginBottom: 6, fontWeight: 600 }}>Live Output Inspector</div>
            {/* Structured output view for common patterns */}
            {data.narrative && <div style={{ fontSize: 10, color: P.t2, marginBottom: 8, padding: '6px 8px', background: 'rgba(15,150,156,0.08)', borderRadius: 6, borderLeft: '3px solid rgba(15,150,156,0.4)', lineHeight: 1.5 }}>{data.narrative}</div>}
            {data.alerts?.length > 0 && <div style={{ marginBottom: 8 }}>{data.alerts.slice(0, 3).map((a, i) => (
              <div key={i} style={{ fontSize: 9, color: '#f59e0b', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{typeof a === 'string' ? a : a.message || a.alert || JSON.stringify(a)}</div>
            ))}</div>}
            <pre style={{ fontSize: 9, color: P.t3, whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
              {JSON.stringify(data, null, 2).slice(0, 2000)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (<div>
    <SectionHeader t="AGENT COMMAND CENTER" s={`${allAgents.length} engines & agents · ${activeCount} active · ${errorCount} errors · 2 cron workflows`} tag="OPS" ac={P.teal} freshness={FRESHNESS} tableKey="agent_status"/>

    {/* View switcher */}
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      {views.map(v => (
        <div key={v.id} onClick={() => { setView(v.id); setSelectedAgent(null); }}
          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            background: view === v.id ? 'rgba(15,150,156,0.25)' : 'rgba(255,255,255,0.04)',
            color: view === v.id ? P.teal : P.t3,
            border: `1px solid ${view === v.id ? 'rgba(15,150,156,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
          {v.label}
        </div>
      ))}
    </div>

    {/* Overview stats */}
    {view === 'overview' && (<>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        {categories.map(cat => {
          const agents = allAgents.filter(a => a.category === cat);
          const active = agents.filter(a => getStatus(a).label === 'Active').length;
          return (
            <PanelShell key={cat} style={{ padding: 14 }}>
              <div style={{ fontSize: 11, color: P.t3, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: P.t1 }}>{agents.length}</div>
              <div style={{ fontSize: 10, color: active === agents.length ? '#22c55e' : P.amber }}>{active}/{agents.length} active</div>
            </PanelShell>
          );
        })}
      </div>

      {/* Cron workflows */}
      <PanelShell style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.t1, marginBottom: 10 }}>Automated Workflows (Vercel Cron)</div>
        {cronSchedules.map((c, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < cronSchedules.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: P.t1 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: P.t3 }}>{c.desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: P.teal }}>{c.schedule}</div>
              <div style={{ fontSize: 9, color: 'rgba(232,244,245,0.3)' }}>{c.endpoint}</div>
            </div>
          </div>
        ))}
      </PanelShell>

      {/* Pipeline diagram */}
      <PanelShell style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.t1, marginBottom: 12 }}>3-Stage Orchestration Pipeline</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Stage 1: Portfolio Engines', count: engineAgents.length, color: '#0F969C' },
            { label: '→', count: null, color: P.t3 },
            { label: 'Stage 2: Market Engines', count: marketAgents.length, color: '#6DA5C0' },
            { label: '→', count: null, color: P.t3 },
            { label: 'Stage 3: Decision Agents', count: decisionAgents.length, color: '#4ade80' },
          ].map((s, i) => s.count !== null ? (
            <div key={i} style={{ padding: '10px 16px', borderRadius: 10, background: `${s.color}20`, border: `1px solid ${s.color}40`, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: P.t1, marginTop: 2 }}>{s.count}</div>
            </div>
          ) : (
            <span key={i} style={{ fontSize: 16, color: P.t3 }}>{s.label}</span>
          ))}
        </div>
      </PanelShell>
    </>)}

    {/* Workflows view */}
    {view === 'workflows' && (
      <PanelShell style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: P.t1, marginBottom: 12 }}>Execution Schedule</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {triggers.map(t => {
            const agents = allAgents.filter(a => a.trigger === t);
            return (
              <div key={t} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: P.teal }}>{t} ({agents.length} agents)</span>
                  <span style={{ fontSize: 10, color: P.t3 }}>{t === 'Daily' ? '7:00 AM UTC' : t === 'Weekly' ? 'Monday 8:00 AM UTC' : t === 'Monthly' ? '1st of month' : 'On threshold breach'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {agents.map(a => {
                    const s = getStatus(a);
                    return <span key={a.id} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: s.label === 'Active' ? '#22c55e' : s.label === 'Error' ? P.red : P.t3, border: '1px solid rgba(255,255,255,0.06)' }}>{a.name}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PanelShell>
    )}

    {/* Agent Output Inspector */}
    {view === 'output' && (
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 600, overflow: 'auto' }}>
          {allAgents.filter(a => getStatus(a).label === 'Active').map(a => (
            <div key={a.id} onClick={() => setSelectedAgent(a)}
              style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 11, color: selectedAgent?.id === a.id ? P.teal : P.t2,
                background: selectedAgent?.id === a.id ? 'rgba(15,150,156,0.15)' : 'transparent',
                border: `1px solid ${selectedAgent?.id === a.id ? 'rgba(15,150,156,0.3)' : 'transparent'}` }}>
              {a.name}
            </div>
          ))}
        </div>
        <PanelShell style={{ padding: 16, maxHeight: 600, overflow: 'auto' }}>
          {selectedAgent ? (<>
            <div style={{ fontSize: 14, fontWeight: 700, color: P.t1, marginBottom: 4 }}>{selectedAgent.name}</div>
            <div style={{ fontSize: 10, color: P.t3, marginBottom: 12 }}>{selectedAgent.desc} · {selectedAgent.trigger} · {selectedAgent.category}</div>
            <pre style={{ fontSize: 10, color: P.t2, whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, lineHeight: 1.5 }}>
              {JSON.stringify(selectedAgent.source?.[selectedAgent.key] || {}, null, 2).slice(0, 5000)}
            </pre>
          </>) : (
            <div style={{ fontSize: 12, color: P.t3, padding: 40, textAlign: 'center' }}>Select an agent to inspect its output</div>
          )}
        </PanelShell>
      </div>
    )}

    {/* Agent cards grid */}
    {(view === 'engines' || view === 'market' || view === 'agents' || view === 'overview') && view !== 'overview' && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {filteredAgents.map(a => <AgentCard key={a.id} agent={a}/>)}
      </div>
    )}

    {/* Agent Settings — editable configuration panel */}
    {view === 'settings' && (
      <div>
        <PanelShell style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: P.t1, marginBottom: 4 }}>Agent Configuration</div>
          <div style={{ fontSize: 10, color: P.t3, marginBottom: 16 }}>Adjust thresholds, inputs, and parameters for each agent. Changes take effect on the next orchestration run.</div>

          {/* Agent selector */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.keys(defaultConfigs).map(id => {
              const agent = allAgents.find(a => a.id === id);
              return agent ? (
                <div key={id} onClick={() => setEditingAgent(id)}
                  style={{ padding: '5px 12px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    background: editingAgent === id ? 'rgba(15,150,156,0.25)' : 'rgba(255,255,255,0.04)',
                    color: editingAgent === id ? P.teal : P.t3,
                    border: `1px solid ${editingAgent === id ? 'rgba(15,150,156,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
                  {agent.name}
                </div>
              ) : null;
            })}
          </div>
        </PanelShell>

        {/* Editing panel */}
        {editingAgent && defaultConfigs[editingAgent] && (
          <PanelShell style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: P.t1 }}>{allAgents.find(a => a.id === editingAgent)?.name || editingAgent}</div>
                <div style={{ fontSize: 10, color: P.t3 }}>{allAgents.find(a => a.id === editingAgent)?.desc}</div>
              </div>
              <div onClick={() => { setAgentSettings(prev => { const next = { ...prev }; delete next[editingAgent]; return next; }); }}
                style={{ fontSize: 9, padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer', border: '1px solid rgba(239,68,68,0.25)' }}>
                Reset to Defaults
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {Object.entries(defaultConfigs[editingAgent]).map(([key, defaultVal]) => {
                const currentVal = getConfig(editingAgent)[key] ?? defaultVal;
                const isNumber = typeof defaultVal === 'number';
                const isBool = typeof defaultVal === 'boolean';
                return (
                  <div key={key} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: 10, color: P.t3, fontWeight: 600, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    {isBool ? (
                      <div onClick={() => updateConfig(editingAgent, key, !currentVal)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <div style={{ width: 36, height: 20, borderRadius: 10, background: currentVal ? 'rgba(15,150,156,0.4)' : 'rgba(255,255,255,0.1)', border: `1px solid ${currentVal ? 'rgba(15,150,156,0.6)' : 'rgba(255,255,255,0.15)'}`, position: 'relative', transition: 'all 0.2s' }}>
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: currentVal ? P.teal : P.t3, position: 'absolute', top: 2, left: currentVal ? 19 : 2, transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}/>
                        </div>
                        <span style={{ fontSize: 12, color: P.t1, fontWeight: 600 }}>{currentVal ? 'ON' : 'OFF'}</span>
                      </div>
                    ) : isNumber ? (
                      <div>
                        <input type="range" min={Math.floor(defaultVal * 0.2)} max={Math.ceil(defaultVal * 3)} step={defaultVal >= 10 ? 1 : 0.1}
                          value={currentVal} onChange={(e) => updateConfig(editingAgent, key, parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: P.teal, height: 4, cursor: 'pointer' }}/>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: P.teal, fontFamily: 'monospace' }}>{typeof currentVal === 'number' ? (currentVal % 1 === 0 ? currentVal : currentVal.toFixed(1)) : currentVal}</span>
                          <span style={{ fontSize: 9, color: 'rgba(232,244,245,0.3)' }}>default: {defaultVal}</span>
                        </div>
                      </div>
                    ) : (
                      <input type="text" value={currentVal} onChange={(e) => updateConfig(editingAgent, key, e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(15,150,156,0.2)', borderRadius: 6, padding: '6px 10px', color: P.t1, fontSize: 12, fontFamily: 'monospace', outline: 'none' }}/>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Show current engine output alongside config */}
            {(() => {
              const agent = allAgents.find(a => a.id === editingAgent);
              const data = agent?.source?.[agent?.key];
              if (!data || data.error) return null;
              return (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, border: '1px solid rgba(15,150,156,0.1)' }}>
                  <div style={{ fontSize: 10, color: P.teal, fontWeight: 600, marginBottom: 8 }}>Current Output Preview</div>
                  {data.narrative && <div style={{ fontSize: 10, color: P.t2, marginBottom: 8, padding: '6px 8px', background: 'rgba(15,150,156,0.06)', borderRadius: 6, borderLeft: '3px solid rgba(15,150,156,0.3)', lineHeight: 1.5 }}>{data.narrative}</div>}
                  <pre style={{ fontSize: 9, color: P.t3, whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, maxHeight: 150, overflow: 'auto' }}>
                    {JSON.stringify(data, null, 2).slice(0, 1500)}
                  </pre>
                </div>
              );
            })()}
          </PanelShell>
        )}

        {!editingAgent && (
          <PanelShell style={{ padding: 30, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: P.t3 }}>Select an agent above to configure its parameters</div>
          </PanelShell>
        )}
      </div>
    )}

    {/* Overview: all agents summary */}
    {view === 'overview' && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
        {allAgents.map(a => <AgentCard key={a.id} agent={a}/>)}
      </div>
    )}
  </div>);
};


// ── NAVIGATION ──
const TABS=[
  {id:"S1",n:"System Architecture",ic:Cpu,s:"A",k:"sys"},
  {id:"S2",n:"Storage & Data",ic:Database,s:"A",k:"storage"},
  {id:"S3",n:"Settings",ic:Settings,s:"B",k:"settings"},
  {id:"S4",n:"Agent Command Center",ic:Sliders,s:"B",k:"agents"},
];
const SECS={A:"SYSTEM & ARCHITECTURE",B:"CONFIGURATION & CONTROL"};

export default function SystemsModule(){
const[tab,setTab]=useState("sys");
const[side,setSide]=useState(true);
const[open,setOpen]=useState({A:true,B:true});
const{data,loading,source,freshness}=useSupabaseData();
useEffect(()=>{if(freshness) FRESHNESS=freshness;},[freshness]);
const tog=s=>setOpen(p=>({...p,[s]:!p[s]}));

const render=()=>{switch(tab){
  case "sys":return <T15/>;
  case "storage":return <T16/>;
  case "settings":return <T17/>;
  case "agents":return <T18 ENGINE={ENGINE} MKTENG={MKTENG} AGENT={AGENT}/>;
  default:return <T15/>;
}};

return(
<div style={{minHeight:"100vh",background:"#05161A",color:P.t1,fontFamily:"system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",display:"flex",position:"relative"}}>
  <div style={{position:"fixed",inset:0,background:"url('/bg-waves.svg') center/cover no-repeat",zIndex:-2,willChange:"transform",transform:"translateZ(0)"}}/>
  <div style={{position:"fixed",inset:0,background:"rgba(5,22,26,0.62)",zIndex:-1,pointerEvents:"none"}}/>
  <svg style={{position:'absolute',width:0,height:0}} aria-hidden="true"><defs><filter id="glass-refract" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.008 0.006" numOctaves="3" seed="42" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
  <div style={{position:"fixed",top:"-15%",right:"-8%",width:"55vw",height:"55vw",background:`radial-gradient(circle,${P.cyan}08 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>
  <div style={{position:"fixed",bottom:"-15%",left:"-8%",width:"45vw",height:"45vw",background:`radial-gradient(circle,${P.indigo}06 0%,transparent 65%)`,pointerEvents:"none",zIndex:0}}/>

  {/* SIDEBAR */}
  {side&&<div style={{width:256,minWidth:256,position:"sticky",top:0,height:"100vh",zIndex:10,overflow:'hidden'}}>
    <div style={{position:'absolute',inset:0,backdropFilter:'blur(24px) saturate(1.5)',WebkitBackdropFilter:'blur(24px) saturate(1.5)',borderRight:'1px solid rgba(15,150,156,0.18)',backgroundImage:'linear-gradient(180deg, rgba(15,150,156,0.06), transparent 40%)',boxShadow:'inset -1px 0 0 rgba(15,150,156,0.10), 4px 0 24px rgba(0,0,0,0.30)',pointerEvents:'none'}}/>
    <div style={{position:'absolute',inset:0,background:'rgba(5,22,26,0.82)',pointerEvents:'none'}}/>
    <div style={{position:'relative',zIndex:1,padding:"14px 0",overflowY:"auto",height:'100%'}}>
      <div style={{padding:"8px 18px 18px",borderBottom:`1px solid ${P.b2}`}}>
        <div style={{fontSize:9,color:P.cyan,fontWeight:800,letterSpacing:2.5,textTransform:'uppercase',marginBottom:2}}>LIFESTACK OS</div>
        <div style={{fontSize:15,fontWeight:800,color:P.t1,letterSpacing:-0.3}}>Systems & Info</div>
        <div style={{fontSize:10,fontWeight:600,color:P.cyan,letterSpacing:0.5,marginTop:1}}>v3.0 · Horizon Glass</div>
        <div style={{fontSize:8.5,color:P.t3,marginTop:3}}>4 tabs · Control & Configuration</div>
      </div>
      {Object.entries(SECS).map(([k,l])=>(
        <div key={k} style={{marginTop:8}}>
          <div onClick={()=>tog(k)} style={{padding:"6px 18px",display:"flex",alignItems:"center",gap:5,cursor:"pointer",fontSize:9,fontWeight:800,color:P.t3,letterSpacing:1.5,textTransform:"uppercase",userSelect:'none'}}>
            {open[k]?<ChevronDown size={11} color={P.cyan}/>:<ChevronRight size={11} color={P.t3}/>}
            <span>{l}</span>
          </div>
          {open[k]&&TABS.filter(t=>t.s===k).map(t=>{
            const Ic=t.ic;const a=tab===t.k;
            return(
              <div key={t.id} onClick={()=>setTab(t.k)}
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
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
      <button onClick={()=>setSide(!side)} style={{
        background:'rgba(7,46,51,0.55)',border:`1px solid ${P.b1}`,borderRadius:8,
        padding:"5px 10px",color:P.t2,cursor:"pointer",fontSize:10,fontWeight:600,
        backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',transition:'all 0.15s',
      }}>{side?"← Hide":"Menu →"}</button>
      <div style={{fontSize:9,color:P.t3,fontWeight:600,letterSpacing:0.8}}>
        SECTION {TABS.find(t=>t.k===tab)?.s} · TAB {TABS.find(t=>t.k===tab)?.id}
      </div>
      <div style={{marginLeft:"auto",display:"flex",gap:5}}>
        {["sys","agents"].map(q=>{
          const t=TABS.find(t=>t.k===q);
          return t?(
          <button key={q} onClick={()=>setTab(q)} style={{
            background:tab===q?P.cyanD:'rgba(7,46,51,0.45)',
            border:`1px solid ${tab===q?P.b1:'rgba(255,255,255,0.06)'}`,
            borderRadius:7,padding:"4px 10px",
            color:tab===q?P.cyan:P.t3,
            cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:0.5,
            backdropFilter:'blur(10px)',transition:'all 0.15s',
          }}>{t.id}</button>
        ):null;})}
      </div>
    </div>
    {render()}
  </div>
</div>
);
}
