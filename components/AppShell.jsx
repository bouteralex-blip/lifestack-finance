import { useState } from "react";
import dynamic from "next/dynamic";

const PortfolioVOS = dynamic(() => import("./PortfolioVOS"), { ssr: false });
const MarketsModule = dynamic(() => import("./MarketsModule"), { ssr: false });

const T = {
  bg: "#060A14",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.07)",
  t1: "#F1F5F9",
  t2: "#94A3B8",
  t3: "#64748B",
  amber: "#F5A623",
  blue: "#3B82F6",
};

const modules = [
  { id: "finance", label: "WEALTH ENGINE", accent: T.amber, icon: "\u00A3" },
  { id: "markets", label: "MARKET & RESEARCH", accent: T.blue, icon: "\u2261" },
];

export default function AppShell() {
  const [activeModule, setActiveModule] = useState("finance");

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      {/* Module switcher bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 16px",
          background: "rgba(6,10,20,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.glassBorder}`,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.t3,
            letterSpacing: 2,
            marginRight: 12,
          }}
        >
          LIFESTACK OS
        </div>
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
                border: `1px solid ${active ? m.accent + "40" : T.glassBorder}`,
                background: active ? m.accent + "12" : T.glass,
                color: active ? m.accent : T.t3,
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s",
                letterSpacing: 0.5,
              }}
            >
              <span style={{ fontSize: 14 }}>{m.icon}</span>
              {m.label}
            </button>
          );
        })}
        <div style={{ marginLeft: "auto", fontSize: 10, color: T.t3 }}>
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Module content */}
      {activeModule === "finance" && <PortfolioVOS />}
      {activeModule === "markets" && <MarketsModule />}
    </div>
  );
}
