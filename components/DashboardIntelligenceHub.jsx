'use client';

import React from 'react';
import { useEngines } from '../lib/engineContext';

// Palette matching PortfolioVOS.jsx
const P = {
  bg: '#05161A', cyan: '#0F969C', indigo: '#6DA5C0', amber: '#f59e0b',
  t1: '#e8f4f5', t2: '#b0cdd4', t3: '#7a9da6', t4: 'rgba(255,255,255,0.35)',
  b1: 'rgba(15,150,156,0.14)', positive: '#00E599', negative: '#FF4D4D',
  purple: '#a855f7', orange: '#FF8C42', red: '#ef4444', btc: '#F7931A',
  mono: "'JetBrains Mono','SF Mono',monospace",
};

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(15,150,156,0.14)',
  borderRadius: 16,
  padding: 20,
  backdropFilter: 'blur(24px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
};

function KpiTile({ label, value, color = P.cyan }) {
  return (
    <div style={{ ...glass, flex: 1 }}>
      <div style={{ fontSize: 11, color: P.t3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 'bold', color, fontFamily: P.mono }}>
        {value || '—'}
      </div>
    </div>
  );
}

function ActionCard({ action, priority }) {
  const colors = { high: P.red, medium: P.amber, low: P.t4 };
  return (
    <div style={{ ...glass, marginBottom: 12, padding: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 6, background: colors[priority] }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: P.t2, marginBottom: 4 }}>
            {action.title || action.recommendation || 'Action'}
          </div>
          <div style={{ fontSize: 11, color: P.t3 }}>{action.description || action}</div>
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert }) {
  const severityColor = alert.severity === 'critical' ? P.red : alert.severity === 'warning' ? P.amber : P.cyan;
  return (
    <div style={{ ...glass, marginBottom: 12, padding: 16, borderLeft: `4px solid ${severityColor}` }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', color: severityColor, marginBottom: 4 }}>
        {alert.severity?.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: P.t2 }}>{alert.message || alert.title}</div>
    </div>
  );
}

export default function DashboardIntelligenceHub() {
  const { ENGINE, MKTENG, AGENT } = useEngines();

  // Safe data accessors
  const nw = ENGINE?.concentration?.totalValue || 0;
  const sixmReturn = AGENT?.performanceBridge?.returns6m || 0;
  const fireProgress = (nw / 5000000) * 100 || 0; // Assume 5M FIRE target
  const regime = MKTENG?.regime?.classification || 'Awaiting data';
  const stress = MKTENG?.stress?.compositeScore || undefined;
  const alerts = AGENT?.triggerAlerts?.alerts || [];
  const actions = AGENT?.actionQueue?.actions || [];
  const synthesis = AGENT?.synthesis || {};
  const morning = AGENT?.morningCommand || {};

  const formatNum = (n) => {
    if (typeof n !== 'number') return '—';
    return n >= 1000000 ? `£${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `£${(n / 1000).toFixed(0)}k` : `£${n}`;
  };

  const formatPct = (n) => (typeof n === 'number' ? `${(n * 100).toFixed(1)}%` : '—');

  return (
    <div style={{ padding: 24, background: P.bg, color: P.t1, fontFamily: "'Segoe UI',sans-serif" }}>
      {/* HEADER STRIP */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: P.t1, letterSpacing: '-0.01em' }}>
            INTELLIGENCE HUB
          </h1>
          <span style={{ fontSize: 12, color: P.t3 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <div style={{ fontSize: 12, color: P.t4 }}>
          {ENGINE ? '● Live' : '○ Awaiting Wealth Engine'} · {MKTENG ? 'Markets active' : 'Markets pending'}
        </div>
      </div>

      {/* KPI STRIP — 6 tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 32 }}>
        <KpiTile label="Net Worth" value={formatNum(nw)} />
        <KpiTile label="6M Return" value={formatPct(sixmReturn)} color={sixmReturn >= 0 ? P.positive : P.negative} />
        <KpiTile label="FIRE %age" value={formatPct(fireProgress / 100)} />
        <KpiTile label="Market Regime" value={regime} color={P.cyan} />
        <KpiTile label="Stress Score" value={stress ? formatPct(stress) : '—'} />
        <KpiTile label="Alerts" value={alerts?.length || 0} color={alerts?.length > 0 ? P.red : P.cyan} />
      </div>

      {/* TWO-COLUMN: MORNING COMMAND + ACTION QUEUE */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Left: Morning Command */}
        <div style={glass}>
          <h2 style={{ fontSize: 14, fontWeight: 'bold', color: P.cyan, marginBottom: 16, textTransform: 'uppercase' }}>
            ⚡ Morning Command
          </h2>
          <p style={{ fontSize: 13, color: P.t2, lineHeight: 1.6 }}>
            {morning?.synthesis || morning?.text || 'Visit Wealth Engine to generate daily synthesis.'}
          </p>
        </div>

        {/* Right: Top 5 Actions */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 'bold', color: P.amber, marginBottom: 12, textTransform: 'uppercase' }}>
            Priority Queue
          </h3>
          {(actions?.slice(0, 5) || []).map((a, i) => (
            <ActionCard key={i} action={a} priority={a.priority || 'medium'} />
          ))}
          {!actions?.length && (
            <div style={{ fontSize: 12, color: P.t4, fontStyle: 'italic' }}>No pending actions</div>
          )}
        </div>
      </div>

      {/* THREE-COLUMN: SYNTHESIS / ALERTS / ENGINE STATUS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {/* Column 1: Weekly Themes */}
        <div style={glass}>
          <h3 style={{ fontSize: 12, fontWeight: 'bold', color: P.purple, marginBottom: 12, textTransform: 'uppercase' }}>
            📊 Weekly Themes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {synthesis?.themes ? (
              Object.entries(synthesis.themes).map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11, color: P.t3, fontWeight: 'bold' }}>{k}</div>
                  <div style={{ fontSize: 11, color: P.t4 }}>{v}</div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 11, color: P.t4 }}>Themes pending</div>
            )}
          </div>
        </div>

        {/* Column 2: Trigger Alerts */}
        <div>
          <h3 style={{ fontSize: 12, fontWeight: 'bold', color: P.red, marginBottom: 12, textTransform: 'uppercase' }}>
            🚨 Alerts ({alerts?.length || 0})
          </h3>
          {alerts?.slice(0, 4)?.map((a, i) => (
            <AlertCard key={i} alert={a} />
          ))}
          {!alerts?.length && (
            <div style={{ fontSize: 12, color: P.t4, fontStyle: 'italic' }}>All systems nominal</div>
          )}
        </div>

        {/* Column 3: Engine Status */}
        <div style={glass}>
          <h3 style={{ fontSize: 12, fontWeight: 'bold', color: P.indigo, marginBottom: 12, textTransform: 'uppercase' }}>
            🔧 Engine Status
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ padding: 12, background: 'rgba(15,150,156,0.05)', borderRadius: 8, border: '1px solid rgba(15,150,156,0.1)' }}>
              <div style={{ fontSize: 11, color: P.t3 }}>Finance</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: ENGINE ? P.positive : P.t4 }}>
                {ENGINE ? '✓' : '◯'}
              </div>
            </div>
            <div style={{ padding: 12, background: 'rgba(15,150,156,0.05)', borderRadius: 8, border: '1px solid rgba(15,150,156,0.1)' }}>
              <div style={{ fontSize: 11, color: P.t3 }}>Markets</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: MKTENG ? P.positive : P.t4 }}>
                {MKTENG ? '✓' : '◯'}
              </div>
            </div>
            <div style={{ padding: 12, background: 'rgba(15,150,156,0.05)', borderRadius: 8, border: '1px solid rgba(15,150,156,0.1)' }}>
              <div style={{ fontSize: 11, color: P.t3 }}>Agents</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: AGENT ? P.positive : P.t4 }}>
                {AGENT ? '✓' : '◯'}
              </div>
            </div>
            <div style={{ padding: 12, background: 'rgba(15,150,156,0.05)', borderRadius: 8, border: '1px solid rgba(15,150,156,0.1)' }}>
              <div style={{ fontSize: 11, color: P.t3 }}>Data</div>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: ENGINE || MKTENG || AGENT ? P.positive : P.t4 }}>
                {ENGINE || MKTENG || AGENT ? '✓' : '◯'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA FRESHNESS BAR */}
      <div style={{ ...glass, padding: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 'bold', color: P.cyan, marginBottom: 8, textTransform: 'uppercase' }}>
          Data Freshness Status
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: P.positive }}>●</span> <span style={{ color: P.t3 }}>Live: </span>
            <span style={{ color: P.t1 }}>{ENGINE ? '15' : '0'}</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: P.cyan }}>●</span> <span style={{ color: P.t3 }}>Fresh: </span>
            <span style={{ color: P.t1 }}>{MKTENG ? '26' : '0'}</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: P.amber }}>●</span> <span style={{ color: P.t3 }}>Stale: </span>
            <span style={{ color: P.t1 }}>0</span>
          </div>
          <div style={{ fontSize: 12 }}>
            <span style={{ color: P.t4 }}>●</span> <span style={{ color: P.t3 }}>Fallback: </span>
            <span style={{ color: P.t1 }}>0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DashboardIntelligenceHub };
