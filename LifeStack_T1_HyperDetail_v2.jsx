import { useState, Fragment } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine
} from "recharts";
import { Star, TrendingUp, TrendingDown, BarChart3, Download, Shield, Target, Zap, Activity, AlertTriangle } from "lucide-react";

/* ═══ TOKENS (maps to T in live codebase) ═══ */
const P={bg:"#080810",glass:"rgba(255,255,255,0.05)",border:"rgba(255,255,255,0.08)",
  shadow:"0 8px 32px rgba(0,0,0,0.3),0 0 80px rgba(0,0,0,0.15)",
  hShadow:"0 12px 44px rgba(0,0,0,0.4),0 0 100px rgba(0,0,0,0.2),inset 0 1px 0 rgba(255,255,255,0.12)",
  t1:"#F8FAFC",t2:"#94A3B8",t3:"#64748B",
  teal:"#00D4AA",coral:"#FF5C7A",amber:"#F5A623",violet:"#7C6FFF",
  blue:"#3B9EFF",sky:"#38BDF8",pink:"#EC4899",emerald:"#34D399",
  mono:"'JetBrains Mono','SF Mono',monospace",sans:"'Inter','SF Pro Display',system-ui,sans-serif",
  r:16,gap:16,pad:20,grid:"rgba(255,255,255,0.04)"};

/* ═══ GLASS TILE — with specular highlight + hover lift ═══ */
const G=({children,span,accent,glow,style={}})=>{
  const[h,setH]=useState(false);
  return(<div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{
    background:P.glass,backdropFilter:"blur(20px) saturate(1.4)",WebkitBackdropFilter:"blur(20px) saturate(1.4)",
    border:`1px solid ${P.border}`,borderRadius:P.r,position:"relative",overflow:"hidden",
    boxShadow:h?P.hShadow:(glow?`${P.shadow},0 0 30px rgba(245,166,35,0.12)`:P.shadow),
    transform:h?"translateY(-3px)":"none",transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",
    gridColumn:span?`span ${span}`:undefined,padding:P.pad,
    ...(accent?{borderTop:`2.5px solid ${accent}`}:{}),
    ...style
  }}>
    {/* Specular highlight shine band */}
    <div style={{position:"absolute",top:0,left:"10%",right:"10%",height:1,
      background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)",
      pointerEvents:"none",zIndex:1}}/>
    {/* Diagonal shine gradient */}
    <div style={{position:"absolute",inset:0,
      background:"linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 40%)",
      pointerEvents:"none",borderRadius:"inherit"}}/>
    {children}
  </div>);
};

/* ═══ STABILIZED PLATE — behind hero KPI values ═══ */
const Plate=({children})=>(<div style={{background:"rgba(0,0,0,0.22)",borderRadius:10,padding:"6px 14px",display:"inline-block"}}>{children}</div>);

/* ═══ PILL DATA LABEL — floating rounded callout on charts ═══ */
const PillLabel=({x,y,value,color=P.t1,bg="rgba(0,0,0,0.65)"})=>{
  if(!x||!y)return null;
  const w=String(value).length*6.5+16;
  return(<g><rect x={x-w/2} y={y-15} width={w} height={18} rx={9} fill={bg} stroke={color} strokeWidth={0.5} strokeOpacity={0.25}/><text x={x} y={y-3} textAnchor="middle" fill={color} fontSize={9} fontFamily={P.mono} fontWeight="600">{value}</text></g>);
};

/* ═══ HYPER CHART ANATOMY ═══ */
const Dot=({c,sz=6})=>(<span style={{width:sz,height:sz,borderRadius:"50%",background:c,display:"inline-block",flexShrink:0}}/>);
const Tag=({t,c=P.amber})=>(<span style={{fontFamily:P.mono,fontSize:8,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:c,background:`${c}15`,padding:"2px 7px",borderRadius:5}}>{t}</span>);
const HTitle=({t})=>(<div style={{fontSize:14,fontWeight:700,color:P.t1,letterSpacing:"-0.01em"}}>{t}</div>);

// Full Hyper KPI strip with deltas, comparison text, and green badges
const HKpi=({items})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
  {items.map((k,i)=>(<div key={i} style={{flex:1,textAlign:i===0?"left":i===items.length-1?"right":"center"}}>
    <div style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:P.t2,fontWeight:500,justifyContent:i===0?"flex-start":i===items.length-1?"flex-end":"center"}}>{k.dot&&<Dot c={k.dot}/>}{k.icon}{k.label}</div>
    <div style={{display:"flex",alignItems:"baseline",gap:5,justifyContent:i===0?"flex-start":i===items.length-1?"flex-end":"center"}}>
      <span style={{fontSize:24,fontWeight:700,color:P.t1,fontFamily:P.mono,letterSpacing:"-0.02em"}}>{k.value}</span>
      {k.delta&&<span style={{fontSize:11,fontWeight:700,color:k.deltaC||P.teal,background:`${(k.deltaC||P.teal)}15`,padding:"1px 6px",borderRadius:4}}>{k.delta}</span>}
    </div>
    {k.sub&&<div style={{fontSize:9,color:P.t3,textAlign:i===0?"left":i===items.length-1?"right":"center",marginTop:2}}>{k.sub}</div>}
  </div>))}
</div>);

// Hyper city data table with 3-column layout
const HTable=({rows,cols=1})=>(<div style={{marginTop:10,borderTop:`1px solid ${P.grid}`,paddingTop:8}}>
  {rows.map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:i>0?`1px solid ${P.grid}`:"none"}}>
    <span style={{fontSize:12,color:P.t2}}>{r.city}</span>
    <div style={{display:"flex",gap:cols>1?16:0}}>{r.values.map((v,j)=>(<span key={j} style={{fontSize:12,color:P.t1,fontFamily:P.mono,fontWeight:500,minWidth:cols>1?70:90,textAlign:"right"}}>{v}</span>))}</div>
  </div>))}
</div>);

// Badge icon
const HBadge=({icon,label,value,color})=>(<div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}>
  <div style={{width:32,height:32,borderRadius:10,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
  <div><div style={{fontSize:9,color:P.t3}}>{label}</div><div style={{fontSize:13,fontWeight:700,color:P.t1,fontFamily:P.mono}}>{value}</div></div>
</div>);

const HExport=()=>(<button style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${P.border}`,borderRadius:8,padding:"4px 10px",color:P.t2,fontSize:9,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:P.mono}}><Download size={10}/>Export</button>);
const Spark=({data,color=P.teal,w=72,h=26})=>(<ResponsiveContainer width={w} height={h}><LineChart data={data}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} style={{filter:`drop-shadow(0 0 4px ${color}55)`}}/></LineChart></ResponsiveContainer>);
const Tog=({items,a=0})=>(<div style={{display:"flex",gap:2}}>{items.map((t,i)=>(<span key={i} style={{fontSize:8,fontFamily:P.mono,fontWeight:600,padding:"3px 8px",borderRadius:6,background:i===a?`${P.blue}30`:"rgba(255,255,255,0.04)",color:i===a?P.blue:P.t3,border:`1px solid ${i===a?P.blue+"55":"rgba(255,255,255,0.06)"}`}}>{t}</span>))}</div>);
const Pill=({text,sev})=>{const c=sev==="red"?P.coral:sev==="amber"?P.amber:P.teal;return(<span style={{fontSize:9,fontWeight:600,color:c,background:`${c}15`,padding:"3px 10px",borderRadius:16,borderLeft:`3px solid ${c}`,fontFamily:P.mono}}>{text}</span>);};
const SR=({l,v,c})=>(<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${P.grid}`}}><span style={{fontSize:11,color:P.t2}}>{l}</span><span style={{fontSize:11,fontFamily:P.mono,fontWeight:600,color:c||P.t1}}>{v}</span></div>);

/* ═══ DATA ═══ */
const nwS=[297,290,285,278,272,268,265,262,258,263,260,262].map(v=>({v}));
const retS=[0,-1.2,-2.8,-4.5,-6.1,-8.2,-9.5,-11.2,-10.8,-11.7,-11,-11.7].map(v=>({v}));
const ddS=[0,-2,-5,-8,-11,-14,-16.7,-15,-14,-16,-15.5,-16.7].map(v=>({v}));
const fireS=[18,19,20,21,22,23,24,26,28,30,32,34].map(v=>({v}));

// Gradient Edge hero data — independent overlapping streams
const edgeD=["Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({
  m,
  pension:[48,49,50,52,56,58,60][i],
  equity:[41,41,40,39,37,36,41][i],
  crypto:[39,35,28,27,23,22,24][i],
  cash:[36,34,29,22,17,13,12][i],
  zar:[20,20,20,20,20,20,20][i],
}));

const radarD=[{s:"Overall",v:5.2,t:7},{s:"Returns",v:3.8,t:7},{s:"Risk",v:5.4,t:7},{s:"Process",v:4.2,t:7},{s:"Tax Eff",v:6,t:7},{s:"Diversity",v:7.6,t:7},{s:"Capital",v:4.4,t:7}];
const contribD=[{n:"Pension",v:16},{n:"ZAR",v:14},{n:"JURE",v:12},{n:"JGEP",v:8},{n:"JUKC",v:5},{n:"Monzo",v:3},{n:"WLDS",v:-2},{n:"SOL",v:-8},{n:"EC10",v:-12},{n:"BTC",v:-19}];
const monthlyR=[{m:"Oct",v:-2.1},{m:"Nov",v:-4.5},{m:"Dec",v:-1.8},{m:"Jan",v:1.2},{m:"Feb",v:-3.2},{m:"Mar",v:0.8}];
const scenD=["2026","2027","2028","2029","2030"].map((y,i)=>({y,base:[262,290,322,358,398][i],bull:[262,310,365,430,510][i],bear:[262,250,245,255,270][i]}));
const allocD=[{name:"ETFs",value:27.9,color:P.teal},{name:"Pension",value:23,color:P.violet},{name:"Cash/FD",value:16.4,color:P.sky},{name:"Crypto",value:13.6,color:P.amber},{name:"Investments",value:12.2,color:P.blue},{name:"Stocks",value:3.6,color:P.pink},{name:"Mixed",value:3.3,color:P.coral}];
const captureD=["Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({m,up:[8,5,3,2,6,4,7][i],down:[-4,-8,-12,-6,-10,-14,-5][i]}));
const riskRetD=[{x:4,y:8,z:60,n:"Pension",c:P.violet},{x:8,y:-12,z:22,n:"BTC",c:P.amber},{x:3,y:7,z:24,n:"JURE",c:P.teal},{x:5,y:5,z:17,n:"JGEP",c:P.sky},{x:6,y:21,z:20,n:"ZAR",c:P.pink},{x:2,y:4,z:46,n:"FD",c:P.emerald}];
const thermalD={assets:["BTC","JURE","JGEP","Pension","ISA","ZAR"],months:["Oct","Nov","Dec","Jan","Feb","Mar"],grid:[[-10.8,-14.5,-11.0,-12.2,-6.3,5.9],[1.2,-1.8,-0.5,0.8,2.1,4.2],[0.8,-2.1,-1.2,-0.3,1.5,3.8],[0.2,0.4,-1.5,-1.5,4.8,3.2],[-0.5,-0.8,-0.6,-0.1,1.8,2.1],[-1.2,-0.5,0.8,-2.1,1.8,0.4]]};
const liqD=[{n:"T+1",v:12},{n:"T+3",v:15},{n:"T+7",v:8},{n:"T+30",v:46},{n:"T+90",v:60},{n:"Illiquid",v:22}];
const holdingsAll=[{n:"Daiwa Pension",v:"\u00A360,275",w:"23.0%",r:"+28.6%",c:P.teal,cont:"+4.2%"},{n:"Fixed Deposit",v:"\u00A346,000",w:"17.5%",r:"+7.4%",c:P.teal,cont:"+0.6%"},{n:"JURE.L",v:"\u00A323,834",w:"9.1%",r:"+8.4%",c:P.teal,cont:"+0.7%"},{n:"BTC",v:"\u00A321,900",w:"8.3%",r:"-44.0%",c:P.coral,cont:"-3.5%"},{n:"ZAR Invest",v:"\u00A320,258",w:"7.7%",r:"+21.2%",c:P.teal,cont:"+1.5%"},{n:"Monzo Cash",v:"\u00A311,558",w:"4.4%",r:"+11.1%",c:P.teal,cont:"+0.3%"}];

/* ═══════════════════════════════════════════════════════
   T1: EXECUTIVE SUMMARY — FULL HYPER DETAIL + QUALITY
   ═══════════════════════════════════════════════════════ */
export default function T1Executive(){
  return(<div style={{minHeight:"100vh",fontFamily:P.sans,WebkitFontSmoothing:"antialiased",
    background:`radial-gradient(ellipse at 20% 50%,rgba(56,89,160,0.08),transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(120,50,160,0.06),transparent 50%),linear-gradient(180deg,${P.bg} 0%,${P.bg} 100%)`,
    position:"relative",overflow:"hidden"}}>

    {/* Ambient gradient orbs */}
    <div style={{position:"fixed",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(245,166,35,0.06),transparent 70%)",top:"-10%",left:"65%",filter:"blur(80px)",pointerEvents:"none"}}/>
    <div style={{position:"fixed",width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,212,170,0.04),transparent 70%)",top:"60%",left:"-5%",filter:"blur(80px)",pointerEvents:"none"}}/>

    {/* Header */}
    <div style={{padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${P.border}`,position:"sticky",top:0,zIndex:50,background:"rgba(8,8,16,0.85)",backdropFilter:"blur(20px) saturate(1.4)"}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontFamily:P.mono,fontSize:12,fontWeight:800,color:P.amber,letterSpacing:"0.08em"}}>LIFESTACK OS</span>
        <span style={{fontSize:10,color:P.t3,fontFamily:P.mono}}>PORTFOLIO INTELLIGENCE v5.6</span>
        <div style={{display:"flex",gap:0,marginLeft:8}}>{["Executive Summary","Structure","Performance","Risk","Stress","CashFlow","Bonus","Tax","Opps","Efficiency","Long-Term","Crypto","Actions","Decisions","System"].map((t,i)=>(<button key={i} style={{fontSize:9,fontFamily:P.sans,fontWeight:i===0?700:500,padding:"8px 12px",border:"none",cursor:"pointer",whiteSpace:"nowrap",background:i===0?`${P.amber}12`:"transparent",color:i===0?P.amber:P.t3,borderBottom:i===0?`2px solid ${P.amber}`:"2px solid transparent"}}>{t}</button>))}</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{display:"flex",gap:2,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:2}}>{["1M","3M","6M","1Y","ALL"].map((r,i)=>(<span key={i} style={{fontSize:9,fontFamily:P.mono,fontWeight:600,padding:"4px 10px",borderRadius:6,background:i===2?P.amber:"transparent",color:i===2?P.bg:P.t3}}>{r}</span>))}</div>
        <span style={{fontSize:10,color:P.t2,fontFamily:P.mono}}>A. Bouter</span>
      </div>
    </div>

    <div style={{padding:"20px 20px 60px",maxWidth:1400,margin:"0 auto",display:"flex",flexDirection:"column",gap:P.gap,position:"relative",zIndex:1}}>

      {/* ═══ HEADER ═══ */}
      <div style={{display:"flex",alignItems:"center",gap:12}}><Tag t="COMMAND CENTER"/><span style={{fontSize:20,fontWeight:700,color:P.t1,letterSpacing:"-0.02em"}}>Executive Summary</span></div>

      {/* ═══ ZONE 1: 4x PRIMARY KPI with stabilized plates ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:P.gap}}>
        {[
          {l:"Net Worth",v:"\u00A3262,622",d:"\u25BC 11.7%",dc:P.coral,sp:nwS,sc:P.coral,sub:"Peak: \u00A3297,457 \u00B7 Sep 2025",avg:"Avg. score \u00A3278,340",ac:P.amber},
          {l:"6M Return (TWR)",v:"-11.7%",d:"\u25BC 34.8k",dc:P.coral,sp:retS,sc:P.coral,sub:"XIRR: -13.2% \u00B7 Bench: -4.1%",avg:"Avg. score -7.2%",ac:P.coral},
          {l:"Peak Drawdown",v:"-16.7%",d:"Feb 2026",dc:P.coral,sp:ddS,sc:P.coral,sub:"CDaR\u2098: -18.4% \u00B7 Recovery: In Progress",avg:"Avg. score -9.4%",ac:P.coral},
          {l:"Coast FIRE",v:"34%",d:"+2.1pp",dc:P.teal,sp:fireS,sc:P.teal,sub:"Target: \u00A3750k \u00B7 Gap: \u00A3487k",avg:"Avg. score 28%",ac:P.teal}
        ].map((k,i)=>(<G key={i} accent={k.ac}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:10,color:P.t3,fontFamily:P.mono,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{k.l}</div>
              <Plate><div style={{display:"flex",alignItems:"baseline",gap:6}}>
                <span style={{fontSize:24,fontWeight:700,color:P.t1,fontFamily:P.mono,letterSpacing:"-0.02em",textShadow:`0 0 20px ${k.ac}33`}}>{k.v}</span>
                <span style={{fontSize:11,fontWeight:700,color:k.dc,background:`${k.dc}15`,padding:"1px 6px",borderRadius:4}}>{k.d}</span>
              </div></Plate>
              <div style={{fontSize:9,color:P.t3,marginTop:4}}>{k.sub}</div>
            </div>
            <Spark data={k.sp} color={k.sc}/>
          </div>
          <div style={{fontSize:8,color:P.t3,marginTop:6,fontStyle:"italic"}}>{k.avg}</div>
        </G>))}
      </div>

      {/* ═══ ZONE 2: GRADIENT EDGE HERO (8col) + SIDEBAR (4col) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:P.gap}}>
        <G accent={P.amber} glow>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
            <HTitle t="Net Worth \u2014 Asset Flow Trajectory"/>
            <div style={{display:"flex",gap:6,alignItems:"center"}}><Tag t="GRADIENT EDGE" c={P.t3}/><Star size={16} color={P.teal}/></div>
          </div>
          <HKpi items={[
            {dot:P.teal,label:"Weekly",value:"\u00A3262k",delta:"+\u00A34k",deltaC:P.teal,sub:"Compared to \u00A3258k last week"},
            {dot:P.amber,label:"Monthly",value:"\u00A3262k",delta:"-\u00A31k",deltaC:P.coral,sub:"Compared to \u00A3263k last month"},
            {dot:P.violet,label:"6M",value:"\u00A3262k",delta:"-\u00A335k",deltaC:P.coral,sub:"Compared to \u00A3297k Sep 2025"},
          ]}/>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={edgeD}>
              <defs>
                {[["t1_pen",P.violet,0.6],["t1_eq",P.teal,0.55],["t1_cr",P.amber,0.5],["t1_ca",P.emerald,0.45],["t1_zar",P.coral,0.4]].map(([id,c,o])=>(
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={o}/><stop offset="100%" stopColor={c} stopOpacity={0.08}/></linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis dataKey="m" tick={{fontSize:10,fill:P.t3,fontFamily:P.mono}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10,fill:P.t3,fontFamily:P.mono}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`} domain={[0,70]}/>
              {/* Independent overlapping streams — NO stackId = streams cross/overlap */}
              <Area type="basis" dataKey="pension" stroke={P.violet} fill="url(#t1_pen)" strokeWidth={0} name="Pension"
                label={({x,y,value,index})=>index===0||index===6?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.violet}/>:null}/>
              <Area type="basis" dataKey="equity" stroke={P.teal} fill="url(#t1_eq)" strokeWidth={0} name="Equities"
                label={({x,y,value,index})=>index===3?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.teal}/>:null}/>
              <Area type="basis" dataKey="crypto" stroke={P.amber} fill="url(#t1_cr)" strokeWidth={0} name="Crypto"
                label={({x,y,value,index})=>index===0||index===6?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.amber}/>:null}/>
              <Area type="basis" dataKey="cash" stroke={P.emerald} fill="url(#t1_ca)" strokeWidth={0} name="Cash"
                label={({x,y,value,index})=>index===0||index===6?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.emerald}/>:null}/>
              <Area type="basis" dataKey="zar" stroke={P.coral} fill="url(#t1_zar)" strokeWidth={0} name="ZAR"/>
              {/* Vertical reference markers */}
              <ReferenceLine x="Nov" stroke="rgba(255,255,255,0.12)" strokeWidth={6}/>
              <ReferenceLine x="Jan" stroke="rgba(255,255,255,0.12)" strokeWidth={6}/>
            </AreaChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"}}>
            {[{n:"Pension",c:P.violet},{n:"Equities",c:P.teal},{n:"Crypto",c:P.amber},{n:"Cash",c:P.emerald},{n:"ZAR",c:P.coral}].map((l,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:P.t2}}><Dot c={l.c} sz={5}/>{l.n}</div>))}
          </div>
          <div style={{display:"flex",gap:16,marginTop:6}}>
            <HBadge icon={<BarChart3 size={14} color={P.teal}/>} label="Total assets" value="\u00A3375,670" color={P.teal}/>
            <HBadge icon={<TrendingDown size={14} color={P.coral}/>} label="Total debts" value="\u00A313,048" color={P.coral}/>
          </div>
          <HTable rows={[{city:"Pension (SIPP)",values:["\u00A360,275","\u00A382,133","+28.6%"]},{city:"Crypto Sleeve",values:["\u00A321,900","\u00A349,310","-44.0%"]},{city:"Cash Buffer",values:["\u00A311,558","\u00A333,978","-66.0%"]}]} cols={3}/>
        </G>

        {/* Sidebar */}
        <div style={{display:"flex",flexDirection:"column",gap:P.gap}}>
          <G><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:P.t1,textTransform:"uppercase"}}>Module Control</span><Tag t="CMP-0034" c={P.t3}/></div>
            {[["Return Mode",["TWR","XIRR","Real"],0],["Scenario",["Base","Bull","Bear"],0],["Benchmark",["60/40","MSCI","Custom"],0]].map(([l,opts,a],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}><span style={{fontSize:9,color:P.t3}}>{l}</span><Tog items={opts} a={a}/></div>))}
          </G>
          <G><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,fontWeight:700,color:P.t1,textTransform:"uppercase"}}>Risk Alerts</span><Tag t="CMP-0035" c={P.t3}/></div>
            {[{t:"CDaR\u2098 breached \u2014 BTC sleeve",s:"red",age:"2k"},{t:"Liquidity buffer below 5%",s:"amber",age:"1h"},{t:"Pension contribution on track",s:"green",age:"3h"}].map((a,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><Pill text={a.t} sev={a.s}/><span style={{fontSize:8,color:P.t3}}>{a.age}</span></div>))}
          </G>
          <G><span style={{fontSize:11,fontWeight:700,color:P.t1,textTransform:"uppercase",marginBottom:6,display:"block"}}>Threshold Governance</span>
            <div style={{display:"flex",justifyContent:"space-around"}}>
              {[{l:"Liquidity",v:17,c:P.coral},{l:"Risk Budget",v:91,c:P.teal},{l:"FIRE",v:34,c:P.amber}].map((g,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{width:44,height:44,borderRadius:"50%",border:`3px solid ${g.c}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",background:`${g.c}11`,boxShadow:`0 0 12px ${g.c}25`}}><span style={{fontSize:11,fontWeight:700,color:P.t1,fontFamily:P.mono}}>{g.v}%</span></div><div style={{fontSize:8,color:P.t3,fontFamily:P.mono}}>{g.l}</div></div>))}
            </div>
          </G>
          <G><span style={{fontSize:11,fontWeight:700,color:P.t1,textTransform:"uppercase",marginBottom:6,display:"block"}}>Asset Allocation</span>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <PieChart width={95} height={95}><Pie data={allocD} cx={47} cy={47} innerRadius={28} outerRadius={44} dataKey="value" stroke="none" paddingAngle={2}>{allocD.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart>
              <div style={{display:"flex",flexDirection:"column",gap:2}}>{allocD.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:8}}><Dot c={d.color} sz={5}/><span style={{color:P.t2,minWidth:50}}>{d.name}</span><span style={{color:P.t1,fontFamily:P.mono,fontWeight:600}}>{d.value}%</span></div>))}</div>
            </div>
          </G>
        </div>
      </div>

      {/* ═══ ZONE 3: RADAR + DRAWDOWN (6+6) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:P.gap}}>
        <G accent={P.violet}>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Quality Score"/><Star size={14} color={P.amber}/></div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:"0 0 100px"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:P.t2}}><Dot c={P.teal}/>Current</div>
              <Plate><span style={{fontSize:24,fontWeight:700,color:P.t1,fontFamily:P.mono}}>5.2</span></Plate>
              <div style={{fontSize:10,color:P.teal,fontWeight:700,marginTop:3}}>+0.3</div>
              <div style={{fontSize:8,color:P.t3}}>vs 4.9 last quarter</div>
              <div style={{marginTop:8}}><HBadge icon={<Shield size={11} color={P.teal}/>} label="Risk quality" value="5.4/7" color={P.teal}/></div>
            </div>
            <ResponsiveContainer width={180} height={170}>
              <RadarChart data={radarD}><PolarGrid stroke="rgba(255,255,255,0.08)"/><PolarAngleAxis dataKey="s" tick={{fontSize:7,fill:P.t3}}/><PolarRadiusAxis tick={false} axisLine={false} domain={[0,8]}/>
                <Radar dataKey="v" stroke={P.teal} fill={P.teal} fillOpacity={0.15} strokeWidth={2.5} style={{filter:"drop-shadow(0 0 4px rgba(0,212,170,0.35))"}}/>
                <Radar dataKey="t" stroke={P.amber} fill="none" strokeWidth={1} strokeDasharray="4 4"/>
              </RadarChart>
            </ResponsiveContainer>
            <div style={{flex:"0 0 100px",textAlign:"right"}}>
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:P.t2,justifyContent:"flex-end"}}><Star size={10} color={P.amber}/>Target</div>
              <Plate><span style={{fontSize:24,fontWeight:700,color:P.t1,fontFamily:P.mono}}>7.0</span></Plate>
              <div style={{fontSize:8,color:P.t3,marginTop:3}}>Institutional benchmark</div>
              <div style={{marginTop:14}}><div style={{fontSize:10,color:P.coral}}>Weakest</div><div style={{fontSize:20,fontWeight:700,color:P.coral,fontFamily:P.mono}}>3.8</div><div style={{fontSize:8,color:P.t3}}>Returns axis</div></div>
            </div>
          </div>
          <HTable rows={[{city:"Diversity",values:["7.6 / 7.0"]},{city:"Tax Efficiency",values:["6.0 / 7.0"]},{city:"Returns",values:["3.8 / 7.0"]}]}/>
        </G>

        <G accent={P.coral}>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Drawdown Profile"/><div style={{display:"flex",gap:4}}><Tag t="CMP-0063" c={P.t3}/><HExport/></div></div>
          <HKpi items={[
            {dot:P.coral,label:"Current",value:"-16.7%",delta:"Feb 2026",deltaC:P.coral,sub:"CDaR\u2098: -18.4%"},
            {label:"Recovery",value:"In Progress",sub:"0 of \u00A335.4k recovered"},
            {dot:P.amber,label:"Max DD",value:"-16.7%",sub:"Peak \u00A3297k \u2192 \u00A3248k"},
          ]}/>
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={ddS.map((d,i)=>({x:["Sep","Oct","Nov","Dec","Jan","Feb","Mar","","","","",""][i]||`W${i}`,v:d.v}))}>
              <defs><linearGradient id="t1_dd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.coral} stopOpacity={0.45}/><stop offset="100%" stopColor={P.coral} stopOpacity={0.03}/></linearGradient></defs>
              <CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis dataKey="x" tick={{fontSize:9,fill:P.t3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:P.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <ReferenceLine y={-16.7} stroke={P.coral} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5}/>
              <Area type="monotone" dataKey="v" stroke={P.coral} fill="url(#t1_dd)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 6px rgba(255,92,122,0.4))"}}/>
            </AreaChart>
          </ResponsiveContainer>
          <HTable rows={[{city:"Peak-to-Trough",values:["-\u00A349,834"]},{city:"Recovery Needed",values:["+\u00A335,400"]},{city:"Days in Drawdown",values:["142 days"]}]}/>
        </G>
      </div>

      {/* ═══ ZONE 4: UP/DOWN CAPTURE + BRINSON (6+6) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:P.gap}}>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Up/Down Capture"/><Tag t="CMP-0043" c={P.t3}/></div>
          <HKpi items={[{dot:P.blue,label:"Up Capture",value:"68%",delta:"+3pp",deltaC:P.teal,sub:"vs 60/40 benchmark"},{dot:P.coral,label:"Down Capture",value:"112%",delta:"+8pp",deltaC:P.coral,sub:"Excess down exposure"}]}/>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={captureD}>
              <defs>
                <linearGradient id="t1_up" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.blue} stopOpacity={0.55}/><stop offset="100%" stopColor={P.blue} stopOpacity={0.05}/></linearGradient>
                <linearGradient id="t1_dn" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={P.coral} stopOpacity={0.55}/><stop offset="100%" stopColor={P.coral} stopOpacity={0.05}/></linearGradient>
              </defs>
              <CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis dataKey="m" tick={{fontSize:9,fill:P.t3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:P.t3}} axisLine={false} tickLine={false}/>
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)"/>
              <Area type="monotone" dataKey="up" stroke={P.blue} fill="url(#t1_up)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 4px rgba(59,158,255,0.35))"}}/>
              <Area type="monotone" dataKey="down" stroke={P.coral} fill="url(#t1_dn)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 4px rgba(255,92,122,0.35))"}}/>
            </AreaChart>
          </ResponsiveContainer>
          <HTable rows={[{city:"Net Capture Ratio",values:["0.61x"]},{city:"Asymmetry Score",values:["-0.44"]},{city:"Batting Average",values:["42%"]}]}/>
        </G>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Brinson Attribution"/><Star size={14} color={P.amber}/></div>
          <HKpi items={[{dot:P.teal,label:"Allocation",value:"+2.1%",delta:"Positive",deltaC:P.teal,sub:"Asset class positioning"},{dot:P.coral,label:"Selection",value:"-9.8%",delta:"Negative",deltaC:P.coral,sub:"Security-level drag (BTC)"}]}/>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={contribD} layout="vertical" barCategoryGap="16%">
              <CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis type="number" tick={{fontSize:8,fill:P.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v>0?"+":""}${v}k`}/>
              <YAxis type="category" dataKey="n" tick={{fontSize:9,fill:P.t2}} axisLine={false} tickLine={false} width={50}/>
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.08)"/>
              <Bar dataKey="v" radius={[0,4,4,0]} label={{position:"right",fontSize:8,fill:P.t2,fontFamily:P.mono,formatter:v=>`${v>0?"+":""}${v}k`}}>{contribD.map((d,i)=><Cell key={i} fill={d.v>=0?P.teal:P.coral} fillOpacity={0.8}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <HBadge icon={<TrendingDown size={12} color={P.coral}/>} label="Total active return" value="-7.6%" color={P.coral}/>
        </G>
      </div>

      {/* ═══ ZONE 5: RISK MAP + THERMAL (6+6) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:P.gap}}>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Risk / Return Map"/><Tag t="CMP-0053" c={P.t3}/></div>
          <HKpi items={[{dot:P.teal,label:"Monthly",value:"\u00A38,097",delta:"+19.6%",deltaC:P.teal,sub:"44,214 USD"},{dot:P.amber,label:"Yearly",value:"\u00A3312,134",delta:"+2.5%",deltaC:P.teal,sub:"301,002 USD"}]}/>
          <ResponsiveContainer width="100%" height={175}>
            <ScatterChart><CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis type="number" dataKey="x" tick={{fontSize:8,fill:P.t3}} axisLine={false} tickLine={false}/>
              <YAxis type="number" dataKey="y" tick={{fontSize:8,fill:P.t3}} axisLine={false} tickLine={false}/>
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)"/>
              {riskRetD.map((b,i)=>(<Scatter key={i} data={[b]} fill={b.c} fillOpacity={0.65}><Cell r={Math.sqrt(b.z)*1.8}/></Scatter>))}
            </ScatterChart>
          </ResponsiveContainer>
          <HTable rows={riskRetD.map(b=>({city:b.n,values:[`Vol: ${b.x}%`,`Ret: ${b.y>0?"+":""}${b.y}%`]}))} cols={2}/>
        </G>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Monthly Returns"/><Tag t="CMP-0018" c={P.t3}/></div>
          <HKpi items={[{dot:P.teal,label:"Monthly",value:"\u00A38,097",delta:"+19.6%",deltaC:P.teal,sub:"44,214 USD"},{dot:P.amber,label:"Yearly",value:"\u00A3312,134",delta:"+2.5%",deltaC:P.teal,sub:"301,002 USD"}]}/>
          <div style={{display:"grid",gridTemplateColumns:`55px repeat(6,1fr)`,gap:2,fontSize:7,fontFamily:P.mono}}>
            <div/>{thermalD.months.map((m,i)=>(<div key={i} style={{textAlign:"center",color:P.t3,padding:3}}>{m}</div>))}
            {thermalD.assets.map((asset,ri)=>(<Fragment key={ri}>
              <div style={{color:P.t2,display:"flex",alignItems:"center",fontSize:8}}>{asset}</div>
              {thermalD.grid[ri].map((v,ci)=>{const c=v>2?P.teal:v>0?P.emerald:v>-2?P.amber:v>-5?P.coral:"#EF4444";return(
                <div key={ci} style={{background:`${c}${Math.min(Math.round(Math.abs(v)*12+20),99)}`,borderRadius:4,padding:"5px 2px",textAlign:"center",color:P.t1,fontWeight:600}}>{v>0?"+":""}{v.toFixed(1)}</div>
              );})}
            </Fragment>))}
          </div>
          <HTable rows={[{city:"Best Month",values:["Jan +1.2%"]},{city:"Worst Month",values:["Nov -4.5%"]},{city:"Hit Rate",values:["33% positive"]}]}/>
        </G>
      </div>

      {/* ═══ ZONE 6: MONTHLY BARS + LIQUIDITY (6+6) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:P.gap}}>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Monthly Return Distribution"/><Tag t="RAINFALL" c={P.t3}/></div>
          <HKpi items={[{dot:P.teal,label:"Positive",value:"2",delta:"33%",deltaC:P.teal,sub:"months positive"},{dot:P.coral,label:"Negative",value:"4",delta:"67%",deltaC:P.coral,sub:"months negative"},{label:"Avg",value:"-1.6%",sub:"mean monthly"}]}/>
          <ResponsiveContainer width="100%" height={145}>
            <BarChart data={monthlyR}><CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis dataKey="m" tick={{fontSize:9,fill:P.t3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:P.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)"/>
              <Bar dataKey="v" radius={[4,4,0,0]} label={{position:"top",fontSize:8,fill:P.t2,fontFamily:P.mono,formatter:v=>`${v>0?"+":""}${v}%`}}>{monthlyR.map((d,i)=><Cell key={i} fill={d.v>=0?P.teal:P.coral} fillOpacity={0.8}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <HTable rows={[{city:"Sharpe (monthly)",values:["0.42"]},{city:"Sortino",values:["0.31"]},{city:"Skewness",values:["-0.8"]}]}/>
        </G>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Liquidity Ladder"/><HExport/></div>
          <HKpi items={[{dot:P.teal,label:"Liquid",value:"\u00A335k",delta:"13.3%",deltaC:P.teal,sub:"of total NAV"},{dot:P.violet,label:"Semi-liquid",value:"\u00A3106k",delta:"40.4%",deltaC:P.amber,sub:"T+30 to T+90"},{dot:P.coral,label:"Illiquid",value:"\u00A322k",delta:"8.4%",deltaC:P.coral,sub:"Locked/restricted"}]}/>
          <ResponsiveContainer width="100%" height={145}>
            <BarChart data={liqD} barCategoryGap="20%"><CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
              <XAxis dataKey="n" tick={{fontSize:8,fill:P.t3}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:8,fill:P.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`}/>
              <Bar dataKey="v" radius={[4,4,0,0]} label={{position:"top",fontSize:8,fill:P.t2,fontFamily:P.mono,formatter:v=>`\u00A3${v}k`}}>{liqD.map((_,i)=><Cell key={i} fill={[P.teal,P.teal,P.sky,P.blue,P.violet,P.coral][i]} fillOpacity={0.8}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
          <HTable rows={[{city:"Cash Buffer",values:["\u00A312k (2.6mo)"]},{city:"Emergency Target",values:["\u00A318k (3mo)"]},{city:"Buffer Gap",values:["-\u00A36k"]}]}/>
        </G>
      </div>

      {/* ═══ ZONE 7: 5-YEAR SCENARIOS (full width) ═══ */}
      <G accent={P.teal} glow>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="5-Year Wealth Scenarios"/><div style={{display:"flex",gap:4}}><Tag t="CMP-0070" c={P.t3}/><HExport/></div></div>
        <HKpi items={[
          {dot:P.teal,label:"Bull 2030",value:"\u00A3510k",delta:"+94%",deltaC:P.teal,sub:"12% CAGR compounded"},
          {dot:P.blue,label:"Base 2030",value:"\u00A3398k",delta:"+52%",deltaC:P.teal,sub:"8.7% CAGR historical"},
          {dot:P.coral,label:"Bear 2030",value:"\u00A3270k",delta:"+3%",deltaC:P.amber,sub:"0.6% real after inflation"},
        ]}/>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={scenD}>
            <defs>
              <linearGradient id="t1_sc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.teal} stopOpacity={0.3}/><stop offset="100%" stopColor={P.teal} stopOpacity={0.02}/></linearGradient>
              <linearGradient id="t1_sc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.blue} stopOpacity={0.25}/><stop offset="100%" stopColor={P.blue} stopOpacity={0.02}/></linearGradient>
            </defs>
            <CartesianGrid stroke={P.grid} strokeDasharray="3 3"/>
            <XAxis dataKey="y" tick={{fontSize:10,fill:P.t3}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:P.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`}/>
            <Area type="monotone" dataKey="bull" stroke={P.teal} fill="url(#t1_sc1)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 6px rgba(0,212,170,0.4))"}}
              label={({x,y,value,index})=>index===4?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.teal}/>:null}/>
            <Area type="monotone" dataKey="base" stroke={P.blue} fill="url(#t1_sc2)" strokeWidth={2} dot={false}
              label={({x,y,value,index})=>index===4?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.blue}/>:null}/>
            <Line type="monotone" dataKey="bear" stroke={P.coral} strokeWidth={2} dot={false} strokeDasharray="6 3"
              label={({x,y,value,index})=>index===4?<PillLabel x={x} y={y} value={`\u00A3${value}k`} color={P.coral}/>:null}/>
            <ReferenceLine y={750} stroke={P.amber} strokeDasharray="8 4" strokeOpacity={0.3}/>
          </AreaChart>
        </ResponsiveContainer>
        <HTable rows={[{city:"FIRE Target",values:["\u00A3750k","\u00A31.8M","25x expenses"]},{city:"Coast FIRE",values:["\u00A3398k","2030","Base case"]},{city:"Current Gap",values:["\u00A3488k","-65%","vs target"]}]} cols={3}/>
      </G>

      {/* ═══ ZONE 8: HOLDINGS + METRICS + SMALL KPIs (4+4+4) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:P.gap}}>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Top Holdings"/><Tag t="POSITION" c={P.t3}/></div>
          <table style={{width:"100%",borderCollapse:"collapse",marginTop:6}}>
            <thead><tr>{["Holding","Value","Wt","Ret","Ctb"].map((h,i)=>(<th key={i} style={{textAlign:i===0?"left":"right",fontSize:7,color:P.t3,fontFamily:P.mono,textTransform:"uppercase",letterSpacing:"0.06em",padding:"4px 4px",borderBottom:`1px solid ${P.grid}`}}>{h}</th>))}</tr></thead>
            <tbody>{holdingsAll.map((h,i)=>(<tr key={i} style={{borderBottom:`1px solid ${P.grid}`}}><td style={{padding:"4px",fontSize:10,color:P.t2}}>{h.n}</td><td style={{padding:"4px",fontSize:10,color:P.t1,fontFamily:P.mono,textAlign:"right"}}>{h.v}</td><td style={{padding:"4px",fontSize:10,color:P.t3,fontFamily:P.mono,textAlign:"right"}}>{h.w}</td><td style={{padding:"4px",fontSize:10,color:h.c,fontFamily:P.mono,fontWeight:600,textAlign:"right"}}>{h.r}</td><td style={{padding:"4px",fontSize:10,color:h.c,fontFamily:P.mono,textAlign:"right"}}>{h.cont}</td></tr>))}</tbody>
          </table>
          <HBadge icon={<BarChart3 size={12} color={P.teal}/>} label="Total positions" value="40 holdings" color={P.teal}/>
        </G>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Key Metrics"/><Tag t="ANALYTICS" c={P.t3}/></div>
          {[["Sharpe Ratio","0.42",P.coral],["Sortino Ratio","0.31",P.coral],["Max Drawdown","-16.7%",P.coral],["HHI (Eff N)","5.8"],["Entropy","1.64"],["Active Share","72%",P.amber],["Beta (vs MSCI)","0.87"],["Tracking Error","8.4%"]].map(([l,v,c],i)=><SR key={i} l={l} v={v} c={c}/>)}
          <HBadge icon={<Activity size={12} color={P.amber}/>} label="Overall quality" value="5.2 / 7.0" color={P.amber}/>
        </G>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:P.gap}}>
          {[{l:"Savings Rate",v:"38%",d:"+2pp",c:P.teal,avg:"Avg. 32%"},{l:"Runway",v:"4.2mo",d:"\u25BC 1.8",c:P.coral,avg:"Target: 3.0mo"},{l:"Debt Ratio",v:"0%",d:"Clear",c:P.teal,avg:"Amex cleared"},{l:"ISA Used",v:"\u00A320k",d:"Max",c:P.teal,avg:"100% utilised"},{l:"Pension YTD",v:"\u00A312.3k",d:"+\u00A38.3k",c:P.teal,avg:"Target \u00A360k"},{l:"DQS",v:"72",d:"+5",c:P.amber,avg:"Decision Quality"}].map((k,i)=>(<G key={i} style={{padding:12,textAlign:"center"}}>
            <div style={{fontSize:8,color:P.t3,fontFamily:P.mono,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{k.l}</div>
            <Plate><span style={{fontSize:18,fontWeight:700,color:P.t1,fontFamily:P.mono}}>{k.v}</span></Plate>
            <div style={{fontSize:9,fontWeight:700,color:k.c,marginTop:3,background:`${k.c}15`,padding:"1px 6px",borderRadius:4,display:"inline-block"}}>{k.d}</div>
            <div style={{fontSize:7,color:P.t3,marginTop:2,fontStyle:"italic"}}>{k.avg}</div>
          </G>))}
        </div>
      </div>

      {/* ═══ ZONE 9: CAPITAL FLOW + WRAPPER (6+6) ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:P.gap}}>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Capital Flow"/><Star size={14} color={P.amber}/></div>
          <HKpi items={[{dot:P.teal,label:"Gross Income",value:"\u00A3340k",sub:"Annual compensation"},{dot:P.teal,label:"Investable",value:"\u00A3128k",delta:"38%",deltaC:P.teal,sub:"Net deployable capital"}]}/>
          {[{l:"Gross Income",v:"\u00A3340k",c:P.teal,w:"100%"},{l:"Tax & NI",v:"\u00A3140k",c:P.coral,w:"41%"},{l:"Expenses",v:"\u00A372k",c:P.amber,w:"21%"},{l:"Investable",v:"\u00A3128k",c:P.teal,w:"38%"}].map((f,i)=>(<div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:P.t2}}>{f.l}</span><span style={{fontSize:10,fontFamily:P.mono,color:P.t1,fontWeight:600}}>{f.v}</span></div><div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",width:f.w,background:`linear-gradient(90deg,${f.c}88,${f.c})`,borderRadius:4,boxShadow:`0 0 8px ${f.c}33`}}/></div></div>))}
          <HTable rows={[{city:"Savings Rate",values:["38%"]},{city:"Tax Rate (eff.)",values:["41%"]},{city:"Monthly Surplus",values:["\u00A310.7k"]}]}/>
        </G>
        <G>
          <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Wrapper Efficiency"/><Tag t="TAX SHELTER" c={P.t3}/></div>
          <HKpi items={[{dot:P.teal,label:"Tax-Free",value:"43%",sub:"ISA + Pension wrapper"},{dot:P.coral,label:"Taxable",value:"57%",delta:"GIA dominant",deltaC:P.coral,sub:"Est. 1.5-2% drag"}]}/>
          {[{l:"ISA",v:"\u00A320.0k / \u00A320k",p:100,c:P.teal},{l:"Pension",v:"\u00A312.3k / \u00A360k",p:20,c:P.violet},{l:"GIA",v:"\u00A323.8k / \u00A350k",p:48,c:P.amber}].map((w,i)=>(<div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:P.t2}}>{w.l}</span><span style={{fontSize:10,fontFamily:P.mono,color:w.c,fontWeight:600}}>{w.v}</span></div><div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.04)"}}><div style={{height:"100%",width:`${w.p}%`,background:`linear-gradient(90deg,${w.c}88,${w.c})`,borderRadius:4,boxShadow:`0 0 8px ${w.c}33`}}/></div></div>))}
          <HTable rows={[{city:"Annual Tax Drag",values:["\u00A34-7.3k"]},{city:"CGT Allowance",values:["\u00A33,000"]},{city:"Marginal Rate",values:["45% + 2% NI"]}]}/>
        </G>
      </div>

      {/* ═══ ZONE 10: STRENGTHS / WEAKNESSES / ACTIONS ═══ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:P.gap}}>
        {[
          {t:"Strengths",c:P.teal,icon:<TrendingUp size={13}/>,items:["JPM Enhanced suite all positive: JUKC +16%, JURE +8%, JGEP +8%","Pension revalued +26% (+\u00A316.8k) \u2014 largest single contributor","15.4 effective positions with HHI 0.065 \u2014 genuinely diversified","New comp (\u00A3340k gross) transforms savings engine completely"]},
          {t:"Weaknesses",c:P.coral,icon:<AlertTriangle size={13}/>,items:["Crypto lost \u00A338k \u2014 32% of risk from 13% of capital","Cash buffer halved from \u00A334k to \u00A316k. Now 2.6mo vs 3mo target","Amex debt \u00A310,652 at 22% APR \u2014 most expensive capital","47% in taxable GIA wrapper \u2014 est. 1.5-2.0% annual tax drag"]},
          {t:"Priority Actions",c:P.amber,icon:<Zap size={13}/>,items:["Max ISA (\u00A320k) before 5 April \u2014 29 days left. Non-negotiable","Clear Amex (\u00A310,652) from bonus \u2014 guaranteed 22% return","Salary sacrifice \u00A31,250/mo into pension \u2014 60% effective band","Consolidate 18 micro-positions to \u226415. Every position must earn its place"]}
        ].map((sec,i)=>(<G key={i} accent={sec.c}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div style={{color:sec.c}}>{sec.icon}</div><span style={{fontSize:11,fontWeight:700,color:sec.c,textTransform:"uppercase",fontFamily:P.mono,letterSpacing:"0.06em"}}>{sec.t}</span></div>
          {sec.items.map((item,j)=>(<div key={j} style={{fontSize:10,color:P.t2,lineHeight:1.65,padding:"4px 0",borderBottom:`1px solid ${P.grid}`}}><span style={{color:sec.c,marginRight:5,fontWeight:700}}>{j+1}.</span>{item}</div>))}
        </G>))}
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",padding:"14px 0",borderTop:`1px solid ${P.grid}`}}>
        <div style={{fontSize:8,color:P.t3,fontFamily:P.mono}}>CONFIDENTIAL \u00B7 Personal use only. Not investment advice. Source: Kubera + Monzo via Supabase. LifeStack OS v5.6 \u00B7 BadgerBrain Intelligence Engine.</div>
      </div>
    </div>
  </div>);
}
