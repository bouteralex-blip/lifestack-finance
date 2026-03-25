// =========================================================================
// TAB 1 — EXECUTIVE SUMMARY — HYPER CHARTS UPGRADE (v57)
// PASTE THIS ENTIRE BLOCK TO REPLACE THE EXISTING T1 FUNCTION
// =========================================================================
const T1=()=>{
  const fire=(PORT.netWorth/PORT.fireTarget*100);
  const contribData=HOLDINGS.filter(h=>h.prev).map(h=>({name:h.name.split("(")[0].split(" ").slice(0,2).join(" ").trim(),pnl:((h.val-h.prev)/1000)})).sort((a,b)=>b.pnl-a.pnl);
  const probNW=Math.round(0.15*PORT.netWorth*0.85+0.50*PORT.netWorth*1.12+0.25*PORT.netWorth*1.25+0.10*PORT.netWorth*1.45);
  const alerts=[{msg:`ISA deadline: 29 days remaining. \u00A30 of \u00A320k deployed.`,sev:"high"},{msg:`Amex at 22% APR: ${fmt(PORT.amexDebt)} outstanding. Guaranteed return to clear.`,sev:"high"},{msg:`Cash buffer at ${runway.toFixed(1)} months vs 3.0 target. Forced-selling risk.`,sev:"med"},{msg:`Crypto risk budget: 32% of risk from 13% capital (2.5x). Exceeds 2.0x limit.`,sev:"med"},{msg:`18 positions below \u00A31k. Fragment drag \u00A3160/yr.`,sev:"low"}];

  /* ═══ LOCAL COLORS NOT IN T ═══ */
  const C={sky:"#38BDF8",pink:"#EC4899",emerald:"#34D399"};
  const MONO="'JetBrains Mono','SF Mono',monospace";

  /* ═══ LOCAL DATA ═══ */
  const nwS=[297,290,285,278,272,268,265,262,258,263,260,262].map(v=>({v}));
  const retS=[0,-1.2,-2.8,-4.5,-6.1,-8.2,-9.5,-11.2,-10.8,-11.7,-11,-11.7].map(v=>({v}));
  const ddS=[0,-2,-5,-8,-11,-14,-16.7,-15,-14,-16,-15.5,-16.7].map(v=>({v}));
  const fireS=[18,19,20,21,22,23,24,26,28,30,32,34].map(v=>({v}));
  const edgeD=["Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({m,pension:[48,49,50,52,56,58,60][i],equity:[41,41,40,39,37,36,41][i],crypto:[39,35,28,27,23,22,24][i],cash:[36,34,29,22,17,13,12][i],zar:[20,20,20,20,20,20,20][i]}));
  const radarD=[{s:"Overall",v:5.2,t:7},{s:"Returns",v:3.8,t:7},{s:"Risk",v:5.4,t:7},{s:"Process",v:4.2,t:7},{s:"Tax Eff",v:6,t:7},{s:"Diversity",v:7.6,t:7},{s:"Capital",v:4.4,t:7}];
  const contribChart=[{n:"Pension",v:16},{n:"ZAR",v:14},{n:"JURE",v:12},{n:"JGEP",v:8},{n:"JUKC",v:5},{n:"Monzo",v:3},{n:"WLDS",v:-2},{n:"SOL",v:-8},{n:"EC10",v:-12},{n:"BTC",v:-19}];
  const monthlyR=[{m:"Oct",v:-2.1},{m:"Nov",v:-4.5},{m:"Dec",v:-1.8},{m:"Jan",v:1.2},{m:"Feb",v:-3.2},{m:"Mar",v:0.8}];
  const scenD=["2026","2027","2028","2029","2030"].map((y,i)=>({y,base:[262,290,322,358,398][i],bull:[262,310,365,430,510][i],bear:[262,250,245,255,270][i]}));
  const allocD=[{name:"ETFs",value:27.9,color:T.teal},{name:"Pension",value:23,color:T.violet},{name:"Cash/FD",value:16.4,color:C.sky},{name:"Crypto",value:13.6,color:T.amber},{name:"Investments",value:12.2,color:T.blue},{name:"Stocks",value:3.6,color:C.pink},{name:"Mixed",value:3.3,color:T.coral}];
  const captureD=["Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map((m,i)=>({m,up:[8,5,3,2,6,4,7][i],down:[-4,-8,-12,-6,-10,-14,-5][i]}));
  const riskRetD=[{x:4,y:8,z:60,n:"Pension",c:T.violet},{x:8,y:-12,z:22,n:"BTC",c:T.amber},{x:3,y:7,z:24,n:"JURE",c:T.teal},{x:5,y:5,z:17,n:"JGEP",c:C.sky},{x:6,y:21,z:20,n:"ZAR",c:C.pink},{x:2,y:4,z:46,n:"FD",c:C.emerald}];
  const thermalD={assets:["BTC","JURE","JGEP","Pension","ISA","ZAR"],months:["Oct","Nov","Dec","Jan","Feb","Mar"],grid:[[-10.8,-14.5,-11.0,-12.2,-6.3,5.9],[1.2,-1.8,-0.5,0.8,2.1,4.2],[0.8,-2.1,-1.2,-0.3,1.5,3.8],[0.2,0.4,-1.5,-1.5,4.8,3.2],[-0.5,-0.8,-0.6,-0.1,1.8,2.1],[-1.2,-0.5,0.8,-2.1,1.8,0.4]]};
  const liqD=[{n:"T+1",v:12},{n:"T+3",v:15},{n:"T+7",v:8},{n:"T+30",v:46},{n:"T+90",v:60},{n:"Illiquid",v:22}];
  const holdingsAll=[{n:"Daiwa Pension",v:"\u00A360,275",w:"23.0%",r:"+28.6%",c:T.teal,cont:"+4.2%"},{n:"Fixed Deposit",v:"\u00A346,000",w:"17.5%",r:"+7.4%",c:T.teal,cont:"+0.6%"},{n:"JURE.L",v:"\u00A323,834",w:"9.1%",r:"+8.4%",c:T.teal,cont:"+0.7%"},{n:"BTC",v:"\u00A321,900",w:"8.3%",r:"-44.0%",c:T.coral,cont:"-3.5%"},{n:"ZAR Invest",v:"\u00A320,258",w:"7.7%",r:"+21.2%",c:T.teal,cont:"+1.5%"},{n:"Monzo Cash",v:"\u00A311,558",w:"4.4%",r:"+11.1%",c:T.teal,cont:"+0.3%"}];

  /* ═══ LOCAL HELPER COMPONENTS ═══ */
  const Dot=({c,sz=6})=>(<span style={{width:sz,height:sz,borderRadius:"50%",background:c,display:"inline-block",flexShrink:0}}/>);
  const Tag=({t,c=T.amber})=>(<span style={{fontFamily:MONO,fontSize:8,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:c,background:`${c}15`,padding:"2px 7px",borderRadius:5}}>{t}</span>);
  const Plate=({children})=>(<div style={{background:"rgba(0,0,0,0.22)",borderRadius:10,padding:"6px 14px",display:"inline-block"}}>{children}</div>);
  const HTitle=({t})=>(<div style={{fontSize:14,fontWeight:700,color:T.t1,letterSpacing:"-0.01em"}}>{t}</div>);
  const HKpi=({items})=>(<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:8}}>
    {items.map((k,i)=>(<div key={i} style={{flex:1,textAlign:i===0?"left":i===items.length-1?"right":"center"}}>
      <div style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:T.t2,fontWeight:500,justifyContent:i===0?"flex-start":i===items.length-1?"flex-end":"center"}}>{k.dot&&<Dot c={k.dot}/>}{k.label}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:5,justifyContent:i===0?"flex-start":i===items.length-1?"flex-end":"center"}}>
        <span style={{fontSize:24,fontWeight:700,color:T.t1,fontFamily:MONO,letterSpacing:"-0.02em"}}>{k.value}</span>
        {k.delta&&<span style={{fontSize:11,fontWeight:700,color:k.deltaC||T.teal,background:`${(k.deltaC||T.teal)}15`,padding:"1px 6px",borderRadius:4}}>{k.delta}</span>}
      </div>
      {k.sub&&<div style={{fontSize:9,color:T.t3,textAlign:i===0?"left":i===items.length-1?"right":"center",marginTop:2}}>{k.sub}</div>}
    </div>))}
  </div>);
  const HTable=({rows,cols=1})=>(<div style={{marginTop:10,borderTop:`1px solid ${T.grid}`,paddingTop:8}}>
    {rows.map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:i>0?`1px solid ${T.grid}`:"none"}}>
      <span style={{fontSize:12,color:T.t2}}>{r.city}</span>
      <div style={{display:"flex",gap:cols>1?16:0}}>{r.values.map((v,j)=>(<span key={j} style={{fontSize:12,color:T.t1,fontFamily:MONO,fontWeight:500,minWidth:cols>1?70:90,textAlign:"right"}}>{v}</span>))}</div>
    </div>))}
  </div>);
  const HBadge=({icon,label,value,color})=>(<div style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0"}}>
    <div style={{width:32,height:32,borderRadius:10,background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
    <div><div style={{fontSize:9,color:T.t3}}>{label}</div><div style={{fontSize:13,fontWeight:700,color:T.t1,fontFamily:MONO}}>{value}</div></div>
  </div>);
  const SR=({l,v,c})=>(<div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.grid}`}}><span style={{fontSize:11,color:T.t2}}>{l}</span><span style={{fontSize:11,fontFamily:MONO,fontWeight:600,color:c||T.t1}}>{v}</span></div>);
  const Spark=({data,color=T.teal,w=72,h=26})=>(<ResponsiveContainer width={w} height={h}><LineChart data={data}><Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.8} dot={false} style={{filter:`drop-shadow(0 0 4px ${color}55)`}}/></LineChart></ResponsiveContainer>);
  const Tog=({items,a=0})=>(<div style={{display:"flex",gap:2}}>{items.map((t,i)=>(<span key={i} style={{fontSize:8,fontFamily:MONO,fontWeight:600,padding:"3px 8px",borderRadius:6,background:i===a?`${T.blue}30`:"rgba(255,255,255,0.04)",color:i===a?T.blue:T.t3,border:`1px solid ${i===a?T.blue+"55":"rgba(255,255,255,0.06)"}`}}>{t}</span>))}</div>);
  const Sev=({text,sev})=>{const c=sev==="red"?T.coral:sev==="amber"?T.amber:T.teal;return(<span style={{fontSize:9,fontWeight:600,color:c,background:`${c}15`,padding:"3px 10px",borderRadius:16,borderLeft:`3px solid ${c}`,fontFamily:MONO}}>{text}</span>);};
  const tCol=(v)=>v>2?T.teal:v>0?C.emerald:v>-2?T.amber:v>-5?T.coral:"#EF4444";

  return(<div>
    <Hd t="Executive Summary" s={`${PORT.date} \u00B7 Portfolio \u00A3${PORT.netWorth.toLocaleString()} \u00B7 Assets ${fmt(PORT.assets)} \u00B7 Debts ${fmt(PORT.debts)}`} tag="COMMAND CENTER"/>

    {/* ═══ ZONE 1: 4x PRIMARY KPI with sparklines ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:T.glassGap,marginBottom:T.glassGap}}>
      {[
        {l:"Net Worth",v:`\u00A3${PORT.netWorth.toLocaleString()}`,d:"\u25BC 11.7%",dc:T.coral,sp:nwS,sc:T.coral,sub:"Peak: \u00A3297,457 \u00B7 Sep 2025",avg:"Avg. score \u00A3278,340",ac:T.amber},
        {l:"6M Return (TWR)",v:pc(nwReturn),d:`\u25BC ${fK(PORT.nw6moAgo-PORT.netWorth)}`,dc:T.coral,sp:retS,sc:T.coral,sub:"XIRR: -13.2% \u00B7 Bench: -4.1%",avg:"Avg. score -7.2%",ac:T.coral},
        {l:"Peak Drawdown",v:`${RISK.maxDD}%`,d:"Feb 2026",dc:T.coral,sp:ddS,sc:T.coral,sub:"CDaR\u2098: -12.8% \u00B7 Recovery: In Progress",avg:"Avg. score -9.4%",ac:T.coral},
        {l:"Coast FIRE",v:`${fire.toFixed(0)}%`,d:"+2.1pp",dc:T.teal,sp:fireS,sc:T.teal,sub:`Target: ${fK(PORT.fireTarget)} \u00B7 Gap: ${fK(PORT.fireTarget-PORT.netWorth)}`,avg:"Avg. score 28%",ac:T.teal}
      ].map((k,i)=>(<Glass key={i} style={{borderTop:`2.5px solid ${k.ac}`,padding:T.glassPad,marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,color:T.t3,fontFamily:MONO,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{k.l}</div>
            <Plate><div style={{display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{fontSize:24,fontWeight:700,color:T.t1,fontFamily:MONO,letterSpacing:"-0.02em",textShadow:`0 0 20px ${k.ac}33`}}>{k.v}</span>
              <span style={{fontSize:11,fontWeight:700,color:k.dc,background:`${k.dc}15`,padding:"1px 6px",borderRadius:4}}>{k.d}</span>
            </div></Plate>
            <div style={{fontSize:9,color:T.t3,marginTop:4}}>{k.sub}</div>
          </div>
          <Spark data={k.sp} color={k.sc}/>
        </div>
        <div style={{fontSize:8,color:T.t3,marginTop:6,fontStyle:"italic"}}>{k.avg}</div>
      </Glass>))}
    </div>

    {/* ═══ ZONE 2: HERO CHART (8col) + SIDEBAR (4col) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass glow style={{borderTop:`2.5px solid ${T.amber}`,marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
          <HTitle t="Net Worth \u2014 Asset Flow Trajectory"/>
          <div style={{display:"flex",gap:6,alignItems:"center"}}><Tag t="GRADIENT EDGE" c={T.t3}/><Star size={16} color={T.teal}/></div>
        </div>
        <HKpi items={[
          {dot:T.teal,label:"Weekly",value:fK(PORT.netWorth),delta:"+\u00A34k",deltaC:T.teal,sub:"Compared to \u00A3258k last week"},
          {dot:T.amber,label:"Monthly",value:fK(PORT.netWorth),delta:"-\u00A31k",deltaC:T.coral,sub:"Compared to \u00A3263k last month"},
          {dot:T.violet,label:"6M",value:fK(PORT.netWorth),delta:`-${fK(PORT.nw6moAgo-PORT.netWorth)}`,deltaC:T.coral,sub:`Compared to ${fK(PORT.nw6moAgo)} Sep 2025`},
        ]}/>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={edgeD}>
            <defs>
              {[["t1_pen",T.violet,0.6],["t1_eq",T.teal,0.55],["t1_cr",T.amber,0.5],["t1_ca",C.emerald,0.45],["t1_zar",T.coral,0.4]].map(([id,c,o])=>(
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={o}/><stop offset="100%" stopColor={c} stopOpacity={0.08}/></linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis dataKey="m" tick={{fontSize:10,fill:T.t3,fontFamily:MONO}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10,fill:T.t3,fontFamily:MONO}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`} domain={[0,70]}/>
            <Area type="basis" dataKey="pension" stroke={T.violet} fill="url(#t1_pen)" strokeWidth={0} name="Pension"/>
            <Area type="basis" dataKey="equity" stroke={T.teal} fill="url(#t1_eq)" strokeWidth={0} name="Equities"/>
            <Area type="basis" dataKey="crypto" stroke={T.amber} fill="url(#t1_cr)" strokeWidth={0} name="Crypto"/>
            <Area type="basis" dataKey="cash" stroke={C.emerald} fill="url(#t1_ca)" strokeWidth={0} name="Cash"/>
            <Area type="basis" dataKey="zar" stroke={T.coral} fill="url(#t1_zar)" strokeWidth={0} name="ZAR"/>
            <ReferenceLine x="Nov" stroke="rgba(255,255,255,0.12)" strokeWidth={6}/>
            <ReferenceLine x="Jan" stroke="rgba(255,255,255,0.12)" strokeWidth={6}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:12,marginTop:6,flexWrap:"wrap"}}>
          {[{n:"Pension",c:T.violet},{n:"Equities",c:T.teal},{n:"Crypto",c:T.amber},{n:"Cash",c:C.emerald},{n:"ZAR",c:T.coral}].map((l,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.t2}}><Dot c={l.c} sz={5}/>{l.n}</div>))}
        </div>
        <div style={{display:"flex",gap:16,marginTop:6}}>
          <HBadge icon={<BarChart3 size={14} color={T.teal}/>} label="Total assets" value={fmt(PORT.assets)} color={T.teal}/>
          <HBadge icon={<Activity size={14} color={T.coral}/>} label="Total debts" value={fmt(PORT.debts)} color={T.coral}/>
        </div>
        <HTable rows={[{city:"Pension (SIPP)",values:["\u00A360,275","\u00A382,133","+28.6%"]},{city:"Crypto Sleeve",values:["\u00A321,900","\u00A349,310","-44.0%"]},{city:"Cash Buffer",values:["\u00A311,558","\u00A333,978","-66.0%"]}]} cols={3}/>
      </Glass>

      {/* Sidebar */}
      <div style={{display:"flex",flexDirection:"column",gap:T.glassGap}}>
        <Glass style={{marginBottom:0}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:11,fontWeight:700,color:T.t1,textTransform:"uppercase"}}>Module Control</span><Tag t="CMP-0034" c={T.t3}/></div>
          {[["Return Mode",["TWR","XIRR","Real"],0],["Scenario",["Base","Bull","Bear"],0],["Benchmark",["60/40","MSCI","Custom"],0]].map(([l,opts,a],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0"}}><span style={{fontSize:9,color:T.t3}}>{l}</span><Tog items={opts} a={a}/></div>))}
        </Glass>
        <Glass style={{marginBottom:0}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,fontWeight:700,color:T.t1,textTransform:"uppercase"}}>Risk Alerts</span><Tag t="CMP-0035" c={T.t3}/></div>
          {[{t:"CDaR\u2098 breached \u2014 BTC sleeve",s:"red",age:"2h"},{t:"Liquidity buffer below 5%",s:"amber",age:"1h"},{t:"Pension contribution on track",s:"green",age:"3h"}].map((a,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><Sev text={a.t} sev={a.s}/><span style={{fontSize:8,color:T.t3}}>{a.age}</span></div>))}
        </Glass>
        <Glass style={{marginBottom:0}}><span style={{fontSize:11,fontWeight:700,color:T.t1,textTransform:"uppercase",marginBottom:6,display:"block"}}>Threshold Governance</span>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            {[{l:"Liquidity",v:17,c:T.coral},{l:"Risk Budget",v:91,c:T.teal},{l:"FIRE",v:34,c:T.amber}].map((g,i)=>(<div key={i} style={{textAlign:"center"}}><div style={{width:44,height:44,borderRadius:"50%",border:`3px solid ${g.c}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",background:`${g.c}11`,boxShadow:`0 0 12px ${g.c}25`}}><span style={{fontSize:11,fontWeight:700,color:T.t1,fontFamily:MONO}}>{g.v}%</span></div><div style={{fontSize:8,color:T.t3,fontFamily:MONO}}>{g.l}</div></div>))}
          </div>
        </Glass>
        <Glass style={{marginBottom:0}}><span style={{fontSize:11,fontWeight:700,color:T.t1,textTransform:"uppercase",marginBottom:6,display:"block"}}>Asset Allocation</span>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <PieChart width={95} height={95}><Pie data={allocD} cx={47} cy={47} innerRadius={28} outerRadius={44} dataKey="value" stroke="none" paddingAngle={2}>{allocD.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie></PieChart>
            <div style={{display:"flex",flexDirection:"column",gap:2}}>{allocD.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:8}}><Dot c={d.color} sz={5}/><span style={{color:T.t2,minWidth:50}}>{d.name}</span><span style={{color:T.t1,fontFamily:MONO,fontWeight:600}}>{d.value}%</span></div>))}</div>
          </div>
        </Glass>
      </div>
    </div>

    {/* ═══ ZONE 3: QUALITY RADAR + DRAWDOWN (6+6) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass style={{borderTop:`2.5px solid ${T.violet}`,marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Quality Score"/><Star size={14} color={T.amber}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:"0 0 100px"}}>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.t2}}><Dot c={T.teal}/>Current</div>
            <Plate><span style={{fontSize:24,fontWeight:700,color:T.t1,fontFamily:MONO}}>5.2</span></Plate>
            <div style={{fontSize:10,color:T.teal,fontWeight:700,marginTop:3}}>+0.3</div>
            <div style={{fontSize:8,color:T.t3}}>vs 4.9 last quarter</div>
            <div style={{marginTop:8}}><HBadge icon={<Shield size={11} color={T.teal}/>} label="Risk quality" value="5.4/7" color={T.teal}/></div>
          </div>
          <ResponsiveContainer width={180} height={170}>
            <RadarChart data={radarD}><PolarGrid stroke="rgba(255,255,255,0.08)"/><PolarAngleAxis dataKey="s" tick={{fontSize:7,fill:T.t3}}/><PolarRadiusAxis tick={false} axisLine={false} domain={[0,8]}/>
              <Radar dataKey="v" stroke={T.teal} fill={T.teal} fillOpacity={0.15} strokeWidth={2.5} style={{filter:"drop-shadow(0 0 4px rgba(0,212,170,0.35))"}}/>
              <Radar dataKey="t" stroke={T.amber} fill="none" strokeWidth={1} strokeDasharray="4 4"/>
            </RadarChart>
          </ResponsiveContainer>
          <div style={{flex:"0 0 100px",textAlign:"right"}}>
            <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:T.t2,justifyContent:"flex-end"}}><Star size={10} color={T.amber}/>Target</div>
            <Plate><span style={{fontSize:24,fontWeight:700,color:T.t1,fontFamily:MONO}}>7.0</span></Plate>
            <div style={{fontSize:8,color:T.t3,marginTop:3}}>Institutional benchmark</div>
            <div style={{marginTop:14}}><div style={{fontSize:10,color:T.coral}}>Weakest</div><div style={{fontSize:20,fontWeight:700,color:T.coral,fontFamily:MONO}}>3.8</div><div style={{fontSize:8,color:T.t3}}>Returns axis</div></div>
          </div>
        </div>
        <HTable rows={[{city:"Diversity",values:["7.6 / 7.0"]},{city:"Tax Efficiency",values:["6.0 / 7.0"]},{city:"Returns",values:["3.8 / 7.0"]}]}/>
      </Glass>

      <Glass style={{borderTop:`2.5px solid ${T.coral}`,marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Drawdown Profile"/><Tag t="CMP-0063" c={T.t3}/></div>
        <HKpi items={[
          {dot:T.coral,label:"Current",value:`${RISK.maxDD}%`,delta:"Feb 2026",deltaC:T.coral,sub:"CDaR\u2098: -12.8%"},
          {label:"Recovery",value:"In Progress",sub:"0 of \u00A335.4k recovered"},
          {dot:T.amber,label:"Max DD",value:`${RISK.maxDD}%`,sub:"Peak \u00A3297k \u2192 \u00A3248k"},
        ]}/>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={ddS.map((d,i)=>({x:["Sep","Oct","Nov","Dec","Jan","Feb","Mar","","","","",""][i]||`W${i}`,v:d.v}))}>
            <defs><linearGradient id="t1_dd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.coral} stopOpacity={0.45}/><stop offset="100%" stopColor={T.coral} stopOpacity={0.03}/></linearGradient></defs>
            <CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis dataKey="x" tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <ReferenceLine y={-16.7} stroke={T.coral} strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.5}/>
            <Area type="monotone" dataKey="v" stroke={T.coral} fill="url(#t1_dd)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 6px rgba(255,92,122,0.4))"}}/>
          </AreaChart>
        </ResponsiveContainer>
        <HTable rows={[{city:"Peak-to-Trough",values:["-\u00A349,834"]},{city:"Recovery Needed",values:["+\u00A335,400"]},{city:"Days in Drawdown",values:[`${RISK.ddDur} days`]}]}/>
      </Glass>
    </div>

    {/* ═══ ZONE 4: UP/DOWN CAPTURE + BRINSON (6+6) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Up/Down Capture"/><Tag t="CMP-0043" c={T.t3}/></div>
        <HKpi items={[{dot:T.blue,label:"Up Capture",value:"68%",delta:"+3pp",deltaC:T.teal,sub:"vs 60/40 benchmark"},{dot:T.coral,label:"Down Capture",value:"112%",delta:"+8pp",deltaC:T.coral,sub:"Excess down exposure"}]}/>
        <ResponsiveContainer width="100%" height={155}>
          <AreaChart data={captureD}>
            <defs>
              <linearGradient id="t1_up" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.55}/><stop offset="100%" stopColor={T.blue} stopOpacity={0.05}/></linearGradient>
              <linearGradient id="t1_dn" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={T.coral} stopOpacity={0.55}/><stop offset="100%" stopColor={T.coral} stopOpacity={0.05}/></linearGradient>
            </defs>
            <CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis dataKey="m" tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)"/>
            <Area type="monotone" dataKey="up" stroke={T.blue} fill="url(#t1_up)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 4px rgba(59,158,255,0.35))"}}/>
            <Area type="monotone" dataKey="down" stroke={T.coral} fill="url(#t1_dn)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 4px rgba(255,92,122,0.35))"}}/>
          </AreaChart>
        </ResponsiveContainer>
        <HTable rows={[{city:"Net Capture Ratio",values:["0.61x"]},{city:"Asymmetry Score",values:["-0.44"]},{city:"Batting Average",values:["42%"]}]}/>
      </Glass>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Brinson Attribution"/><Star size={14} color={T.amber}/></div>
        <HKpi items={[{dot:T.teal,label:"Allocation",value:"+2.1%",delta:"Positive",deltaC:T.teal,sub:"Asset class positioning"},{dot:T.coral,label:"Selection",value:"-9.8%",delta:"Negative",deltaC:T.coral,sub:"Security-level drag (BTC)"}]}/>
        <ResponsiveContainer width="100%" height={165}>
          <BarChart data={contribChart} layout="vertical" barCategoryGap="16%">
            <CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis type="number" tick={{fontSize:8,fill:T.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v>0?"+":""}${v}k`}/>
            <YAxis type="category" dataKey="n" tick={{fontSize:9,fill:T.t2}} axisLine={false} tickLine={false} width={50}/>
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.08)"/>
            <Bar dataKey="v" radius={[0,4,4,0]} label={{position:"right",fontSize:8,fill:T.t2,fontFamily:MONO,formatter:v=>`${v>0?"+":""}${v}k`}}>{contribChart.map((d,i)=><Cell key={i} fill={d.v>=0?T.teal:T.coral} fillOpacity={0.8}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <HBadge icon={<Activity size={12} color={T.coral}/>} label="Total active return" value="-7.6%" color={T.coral}/>
      </Glass>
    </div>

    {/* ═══ ZONE 5: RISK MAP + THERMAL HEATMAP (6+6) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Risk / Return Map"/><Tag t="CMP-0053" c={T.t3}/></div>
        <HKpi items={[{dot:T.teal,label:"Monthly",value:"\u00A38,097",delta:"+19.6%",deltaC:T.teal,sub:"44,214 USD"},{dot:T.amber,label:"Yearly",value:"\u00A3312,134",delta:"+2.5%",deltaC:T.teal,sub:"301,002 USD"}]}/>
        <ResponsiveContainer width="100%" height={175}>
          <ScatterChart><CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis type="number" dataKey="x" tick={{fontSize:8,fill:T.t3}} axisLine={false} tickLine={false} name="Vol"/>
            <YAxis type="number" dataKey="y" tick={{fontSize:8,fill:T.t3}} axisLine={false} tickLine={false} name="Ret"/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)"/>
            {riskRetD.map((b,i)=>(<Scatter key={i} data={[b]} fill={b.c} fillOpacity={0.65}><Cell r={Math.sqrt(b.z)*1.8}/></Scatter>))}
          </ScatterChart>
        </ResponsiveContainer>
        <HTable rows={riskRetD.map(b=>({city:b.n,values:[`Vol: ${b.x}%`,`Ret: ${b.y>0?"+":""}${b.y}%`]}))} cols={2}/>
      </Glass>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Monthly Returns"/><Tag t="CMP-0018" c={T.t3}/></div>
        <HKpi items={[{dot:T.teal,label:"Monthly",value:"\u00A38,097",delta:"+19.6%",deltaC:T.teal,sub:"44,214 USD"},{dot:T.amber,label:"Yearly",value:"\u00A3312,134",delta:"+2.5%",deltaC:T.teal,sub:"301,002 USD"}]}/>
        <div style={{display:"grid",gridTemplateColumns:"55px repeat(6,1fr)",gap:2,fontSize:7,fontFamily:MONO}}>
          <div/>{thermalD.months.map((m,i)=>(<div key={i} style={{textAlign:"center",color:T.t3,padding:3}}>{m}</div>))}
          {thermalD.assets.map((asset,ri)=>(<Fragment key={ri}>
            <div style={{color:T.t2,display:"flex",alignItems:"center",fontSize:8}}>{asset}</div>
            {thermalD.grid[ri].map((v,ci)=>(<div key={ci} style={{background:`${tCol(v)}${Math.min(Math.round(Math.abs(v)*12+20),99)}`,borderRadius:4,padding:"5px 2px",textAlign:"center",color:T.t1,fontWeight:600}}>{v>0?"+":""}{v.toFixed(1)}</div>))}
          </Fragment>))}
        </div>
        <HTable rows={[{city:"Best Month",values:["Jan +1.2%"]},{city:"Worst Month",values:["Nov -4.5%"]},{city:"Hit Rate",values:["33% positive"]}]}/>
      </Glass>
    </div>

    {/* ═══ ZONE 6: MONTHLY BARS + LIQUIDITY (6+6) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Monthly Return Distribution"/><Tag t="RAINFALL" c={T.t3}/></div>
        <HKpi items={[{dot:T.teal,label:"Positive",value:"2",delta:"33%",deltaC:T.teal,sub:"months positive"},{dot:T.coral,label:"Negative",value:"4",delta:"67%",deltaC:T.coral,sub:"months negative"},{label:"Avg",value:"-1.6%",sub:"mean monthly"}]}/>
        <ResponsiveContainer width="100%" height={145}>
          <BarChart data={monthlyR}><CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis dataKey="m" tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:9,fill:T.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.06)"/>
            <Bar dataKey="v" radius={[4,4,0,0]} label={{position:"top",fontSize:8,fill:T.t2,fontFamily:MONO,formatter:v=>`${v>0?"+":""}${v}%`}}>{monthlyR.map((d,i)=><Cell key={i} fill={d.v>=0?T.teal:T.coral} fillOpacity={0.8}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <HTable rows={[{city:"Sharpe (monthly)",values:[`${RISK.sharpe}`]},{city:"Sortino",values:[`${RISK.sortino}`]},{city:"Skewness",values:[`${RISK.skew}`]}]}/>
      </Glass>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Liquidity Ladder"/><Tag t="LIQUIDITY" c={T.t3}/></div>
        <HKpi items={[{dot:T.teal,label:"Liquid",value:"\u00A335k",delta:"13.3%",deltaC:T.teal,sub:"of total NAV"},{dot:T.violet,label:"Semi-liquid",value:"\u00A3106k",delta:"40.4%",deltaC:T.amber,sub:"T+30 to T+90"},{dot:T.coral,label:"Illiquid",value:"\u00A322k",delta:"8.4%",deltaC:T.coral,sub:"Locked/restricted"}]}/>
        <ResponsiveContainer width="100%" height={145}>
          <BarChart data={liqD} barCategoryGap="20%"><CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
            <XAxis dataKey="n" tick={{fontSize:8,fill:T.t3}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:8,fill:T.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`}/>
            <Bar dataKey="v" radius={[4,4,0,0]} label={{position:"top",fontSize:8,fill:T.t2,fontFamily:MONO,formatter:v=>`\u00A3${v}k`}}>{liqD.map((_,i)=><Cell key={i} fill={[T.teal,T.teal,C.sky,T.blue,T.violet,T.coral][i]} fillOpacity={0.8}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
        <HTable rows={[{city:"Cash Buffer",values:["\u00A312k (2.6mo)"]},{city:"Emergency Target",values:["\u00A318k (3mo)"]},{city:"Buffer Gap",values:["-\u00A36k"]}]}/>
      </Glass>
    </div>

    {/* ═══ ZONE 7: 5-YEAR SCENARIOS (full width) ═══ */}
    <Glass glow style={{borderTop:`2.5px solid ${T.teal}`,marginBottom:T.glassGap}}>
      <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="5-Year Wealth Scenarios"/><Tag t="CMP-0070" c={T.t3}/></div>
      <HKpi items={[
        {dot:T.teal,label:"Bull 2030",value:"\u00A3510k",delta:"+94%",deltaC:T.teal,sub:"12% CAGR compounded"},
        {dot:T.blue,label:"Base 2030",value:"\u00A3398k",delta:"+52%",deltaC:T.teal,sub:"8.7% CAGR historical"},
        {dot:T.coral,label:"Bear 2030",value:"\u00A3270k",delta:"+3%",deltaC:T.amber,sub:"0.6% real after inflation"},
      ]}/>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={scenD}>
          <defs>
            <linearGradient id="t1_sc1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.teal} stopOpacity={0.3}/><stop offset="100%" stopColor={T.teal} stopOpacity={0.02}/></linearGradient>
            <linearGradient id="t1_sc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={T.blue} stopOpacity={0.25}/><stop offset="100%" stopColor={T.blue} stopOpacity={0.02}/></linearGradient>
          </defs>
          <CartesianGrid stroke={T.grid} strokeDasharray="3 3"/>
          <XAxis dataKey="y" tick={{fontSize:10,fill:T.t3}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:10,fill:T.t3}} axisLine={false} tickLine={false} tickFormatter={v=>`\u00A3${v}k`}/>
          <Area type="monotone" dataKey="bull" stroke={T.teal} fill="url(#t1_sc1)" strokeWidth={2.5} dot={false} style={{filter:"drop-shadow(0 0 6px rgba(0,212,170,0.4))"}}/>
          <Area type="monotone" dataKey="base" stroke={T.blue} fill="url(#t1_sc2)" strokeWidth={2} dot={false}/>
          <Line type="monotone" dataKey="bear" stroke={T.coral} strokeWidth={2} dot={false} strokeDasharray="6 3"/>
          <ReferenceLine y={750} stroke={T.amber} strokeDasharray="8 4" strokeOpacity={0.3}/>
        </AreaChart>
      </ResponsiveContainer>
      <HTable rows={[{city:"FIRE Target",values:["\u00A3750k","\u00A31.8M","25x expenses"]},{city:"Coast FIRE",values:["\u00A3398k","2030","Base case"]},{city:"Current Gap",values:[`${fK(PORT.fireTarget-PORT.netWorth)}`,"-65%","vs target"]}]} cols={3}/>
    </Glass>

    {/* ═══ ZONE 8: HOLDINGS + METRICS + SMALL KPIs (4+4+4) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Top Holdings"/><Tag t="POSITION" c={T.t3}/></div>
        <table style={{width:"100%",borderCollapse:"collapse",marginTop:6}}>
          <thead><tr>{["Holding","Value","Wt","Ret","Ctb"].map((h,i)=>(<th key={i} style={{textAlign:i===0?"left":"right",fontSize:7,color:T.t3,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",padding:"4px 4px",borderBottom:`1px solid ${T.grid}`}}>{h}</th>))}</tr></thead>
          <tbody>{holdingsAll.map((h,i)=>(<tr key={i} style={{borderBottom:`1px solid ${T.grid}`}}><td style={{padding:"4px",fontSize:10,color:T.t2}}>{h.n}</td><td style={{padding:"4px",fontSize:10,color:T.t1,fontFamily:MONO,textAlign:"right"}}>{h.v}</td><td style={{padding:"4px",fontSize:10,color:T.t3,fontFamily:MONO,textAlign:"right"}}>{h.w}</td><td style={{padding:"4px",fontSize:10,color:h.c,fontFamily:MONO,fontWeight:600,textAlign:"right"}}>{h.r}</td><td style={{padding:"4px",fontSize:10,color:h.c,fontFamily:MONO,textAlign:"right"}}>{h.cont}</td></tr>))}</tbody>
        </table>
        <HBadge icon={<BarChart3 size={12} color={T.teal}/>} label="Total positions" value="40 holdings" color={T.teal}/>
      </Glass>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Key Metrics"/><Tag t="ANALYTICS" c={T.t3}/></div>
        {[["Sharpe Ratio",`${RISK.sharpe}`,T.coral],["Sortino Ratio",`${RISK.sortino}`],["Max Drawdown",`${RISK.maxDD}%`,T.coral],["HHI (Eff N)",`${RISK.hhi}`],["Entropy",`${RISK.entropy}`],["Active Share","72%",T.amber],["Beta (vs MSCI)",`${RISK.beta}`],["Tracking Error",`${RISK.te}%`]].map(([l,v,c],i)=><SR key={i} l={l} v={v} c={c}/>)}
        <HBadge icon={<Activity size={12} color={T.amber}/>} label="Overall quality" value="5.2 / 7.0" color={T.amber}/>
      </Glass>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:T.glassGap}}>
        {[{l:"Savings Rate",v:"38%",d:"+2pp",c:T.teal,avg:"Avg. 32%"},{l:"Runway",v:`${runway.toFixed(1)}mo`,d:"\u25BC 1.8",c:T.coral,avg:"Target: 3.0mo"},{l:"Debt Ratio",v:"0%",d:"Clear",c:T.teal,avg:"Amex cleared"},{l:"ISA Used",v:"\u00A320k",d:"Max",c:T.teal,avg:"100% utilised"},{l:"Pension YTD",v:"\u00A312.3k",d:"+\u00A38.3k",c:T.teal,avg:"Target \u00A360k"},{l:"DQS",v:"72",d:"+5",c:T.amber,avg:"Decision Quality"}].map((k,i)=>(<Glass key={i} style={{padding:12,textAlign:"center",marginBottom:0}}>
          <div style={{fontSize:8,color:T.t3,fontFamily:MONO,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{k.l}</div>
          <Plate><span style={{fontSize:18,fontWeight:700,color:T.t1,fontFamily:MONO}}>{k.v}</span></Plate>
          <div style={{fontSize:9,fontWeight:700,color:k.c,marginTop:3,background:`${k.c}15`,padding:"1px 6px",borderRadius:4,display:"inline-block"}}>{k.d}</div>
          <div style={{fontSize:7,color:T.t3,marginTop:2,fontStyle:"italic"}}>{k.avg}</div>
        </Glass>))}
      </div>
    </div>

    {/* ═══ ZONE 9: CAPITAL FLOW + WRAPPER (6+6) ═══ */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:T.glassGap,marginBottom:T.glassGap}}>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Capital Flow"/><Star size={14} color={T.amber}/></div>
        <HKpi items={[{dot:T.teal,label:"Gross Income",value:"\u00A3340k",sub:"Annual compensation"},{dot:T.teal,label:"Investable",value:"\u00A3128k",delta:"38%",deltaC:T.teal,sub:"Net deployable capital"}]}/>
        {[{l:"Gross Income",v:"\u00A3340k",c:T.teal,w:"100%"},{l:"Tax & NI",v:"\u00A3140k",c:T.coral,w:"41%"},{l:"Expenses",v:"\u00A372k",c:T.amber,w:"21%"},{l:"Investable",v:"\u00A3128k",c:T.teal,w:"38%"}].map((f,i)=>(<div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:T.t2}}>{f.l}</span><span style={{fontSize:10,fontFamily:MONO,color:T.t1,fontWeight:600}}>{f.v}</span></div><div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.04)",overflow:"hidden"}}><div style={{height:"100%",width:f.w,background:`linear-gradient(90deg,${f.c}88,${f.c})`,borderRadius:4,boxShadow:`0 0 8px ${f.c}33`}}/></div></div>))}
        <HTable rows={[{city:"Savings Rate",values:["38%"]},{city:"Tax Rate (eff.)",values:["41%"]},{city:"Monthly Surplus",values:["\u00A310.7k"]}]}/>
      </Glass>
      <Glass style={{marginBottom:0}}>
        <div style={{display:"flex",justifyContent:"space-between"}}><HTitle t="Wrapper Efficiency"/><Tag t="TAX SHELTER" c={T.t3}/></div>
        <HKpi items={[{dot:T.teal,label:"Tax-Free",value:"43%",sub:"ISA + Pension wrapper"},{dot:T.coral,label:"Taxable",value:"57%",delta:"GIA dominant",deltaC:T.coral,sub:"Est. 1.5-2% drag"}]}/>
        {[{l:"ISA",v:"\u00A320.0k / \u00A320k",p:100,c:T.teal},{l:"Pension",v:"\u00A312.3k / \u00A360k",p:20,c:T.violet},{l:"GIA",v:"\u00A323.8k / \u00A350k",p:48,c:T.amber}].map((w,i)=>(<div key={i} style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:T.t2}}>{w.l}</span><span style={{fontSize:10,fontFamily:MONO,color:w.c,fontWeight:600}}>{w.v}</span></div><div style={{height:7,borderRadius:4,background:"rgba(255,255,255,0.04)"}}><div style={{height:"100%",width:`${w.p}%`,background:`linear-gradient(90deg,${w.c}88,${w.c})`,borderRadius:4,boxShadow:`0 0 8px ${w.c}33`}}/></div></div>))}
        <HTable rows={[{city:"Annual Tax Drag",values:["\u00A34-7.3k"]},{city:"CGT Allowance",values:["\u00A33,000"]},{city:"Marginal Rate",values:["45% + 2% NI"]}]}/>
      </Glass>
    </div>

    {/* ═══ ZONE 10: STRENGTHS / WEAKNESSES / ACTIONS ═══ */}
    <Row gap={T.glassGap}>{[
      {t:"Strengths",c:T.teal,icon:<Star size={13} color={T.teal}/>,items:["JPM Enhanced suite all positive: JUKC +16%, JURE +8%, JGEP +8%","Pension revalued +26% (+\u00A316.8k) \u2014 largest single contributor","15.4 effective positions with HHI 0.065 \u2014 genuinely diversified","New comp (\u00A3340k gross) transforms savings engine completely"]},
      {t:"Weaknesses",c:T.coral,icon:<Shield size={13} color={T.coral}/>,items:[`Crypto lost ${fK(38400)} \u2014 32% of risk from 13% of capital`,`Cash buffer halved from ${fK(33978)} to ${fK(15752)}. Now 2.6mo`,`Amex debt ${fmt(PORT.amexDebt)} at 22% APR \u2014 most expensive capital`,"47% in taxable GIA wrapper \u2014 est. 1.5-2.0% annual tax drag"]},
      {t:"Priority Actions",c:T.amber,icon:<Zap size={13} color={T.amber}/>,items:[`Max ISA (\u00A320k) before 5 April \u2014 29 days left. Non-negotiable`,`Clear Amex (${fmt(PORT.amexDebt)}) from bonus \u2014 guaranteed 22% return`,"Salary sacrifice \u00A31,250/mo into pension \u2014 60% effective band","Consolidate 18 micro-positions to \u226415. Every position must earn its place"]}
    ].map((sec,i)=>(<Glass key={i} style={{flex:"1 1 240px",borderTop:`3px solid ${sec.c}`,marginBottom:0}}>
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div>{sec.icon}</div><span style={{fontSize:11,fontWeight:700,color:sec.c,textTransform:"uppercase",fontFamily:MONO,letterSpacing:"0.06em"}}>{sec.t}</span></div>
      {sec.items.map((item,j)=>(<div key={j} style={{fontSize:10,color:T.t2,lineHeight:1.65,padding:"4px 0",borderBottom:`1px solid ${T.grid}`}}><span style={{color:sec.c,marginRight:5,fontWeight:700}}>{j+1}.</span>{item}</div>))}
    </Glass>))}</Row>

    {/* Footer */}
    <div style={{textAlign:"center",padding:"14px 0",borderTop:`1px solid ${T.grid}`,marginTop:T.glassGap}}>
      <div style={{fontSize:8,color:T.t3,fontFamily:MONO}}>Data as of {PORT.date}. Portfolio value {fmt(PORT.netWorth)}. Live state: unknown. Not investment advice.</div>
    </div>
  </div>);
};
