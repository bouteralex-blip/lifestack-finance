import { useState } from "react";
import dynamic from "next/dynamic";
import { EngineProvider } from "../lib/engineContext";

const PortfolioVOS = dynamic(() => import("./PortfolioVOS"), { ssr: false });
const MarketsModule = dynamic(() => import("./MarketsModule"), { ssr: false });
const SystemsModule = dynamic(() => import("./SystemsModule"), { ssr: false });
const CareerModule = dynamic(() => import("./CareerModule"), { ssr: false });
const DashboardIntelligenceHub = dynamic(() => import("./DashboardIntelligenceHub"), { ssr: false });

const T = {
  bg: "#05161A",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(15,150,156,0.14)",
  t1: "#e8f4f5",
  t2: "#b0cdd4",
  t3: "#7a9da6",
  amber: "#f59e0b",
  teal: "#0F969C",
  indigo: "#6DA5C0",
  purple: "#a855f7",
};

const modules = [
  { id: "dashboard", label: "INTELLIGENCE HUB",       accent: T.teal,   icon: "◉" },
  { id: "finance",   label: "WEALTH ENGINE",          accent: T.amber,  icon: "£" },
  { id: "markets",   label: "MARKET & RESEARCH",      accent: T.teal,   icon: "≡" },
  { id: "career",    label: "CAREER & INFRA",         accent: T.indigo, icon: "◆" },
  { id: "systems",   label: "SYSTEMS & INFO",         accent: T.purple, icon: "⚙" },
];

export default function AppShell() {
  const [activeModule, setActiveModule] = useState("finance");

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, #05161A 0%, #072E33 12%, #05161A 100%)`,
    }}>
      {/* Module switcher bar — liquid glass teal-navy */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        background: "rgba(5,22,26,0.90)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderBottom: "1px solid rgba(15,150,156,0.18)",
        boxShadow: "0 1px 0 rgba(15,150,156,0.08), 0 4px 24px rgba(0,0,0,0.30)",
      }}>
        {/* Brand */}
        <div style={{
          fontSize: 10,
          fontWeight: 800,
          color: T.teal,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          marginRight: 10,
          fontFamily: "'JetBrains Mono','SF Mono',monospace",
        }}>
          LIFESTACK OS
        </div>

        {/* Module buttons */}
        {modules.map((m) => {
          const active = activeModule === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 8,
                border: `1px solid ${active ? m.accent + "45" : "rgba(255,255,255,0.08)"}`,
                background: active ? m.accent + "15" : "rgba(255,255,255,0.04)",
                color: active ? m.accent : T.t3,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.18s ease",
                letterSpacing: 0.6,
                backdropFilter: "blur(12px)",
                boxShadow: active ? `0 0 14px ${m.accent}20, inset 0 1px 0 rgba(255,255,255,0.10)` : "none",
                textTransform: "uppercase",
              }}
            >
              <span style={{ fontSize: 13 }}>{m.icon}</span>
              {m.label}
            </button>
          );
        })}

        {/* Date */}
        <div style={{ marginLeft: "auto", fontSize: 10, color: T.t3, fontFamily: "'JetBrains Mono','SF Mono',monospace" }}>
          {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* Module content — EngineProvider shares engine state across modules */}
      <EngineProvider>
        {activeModule === "dashboard" && (
          <div style={{ minHeight: "100vh", background: "#05161A", padding: "24px", color: "#e8f4f5" }}>
            <DashboardIntelligenceHub />
          </div>
        )}
        {activeModule === "finance"  && <PortfolioVOS />}
        {activeModule === "markets"  && <MarketsModule />}
        {activeModule === "career"   && <CareerModule />}
        {activeModule === "systems"  && <SystemsModule />}
      </EngineProvider>
    </div>
  );
}
