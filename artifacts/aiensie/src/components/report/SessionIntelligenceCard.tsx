import { useRef, useState, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, AlertTriangle, Zap } from "lucide-react";
import type { SessionIntelligence, SessionProfile, SessionPeriod } from "@workspace/aiensie-engine";

// ── Period icon & color ───────────────────────────────────────────────────────

const PERIOD_META: Record<SessionPeriod, { emoji: string; color: string; glow: string }> = {
  morning:   { emoji: "🌅", color: "#f59e0b", glow: "rgba(245,158,11,0.15)"  },
  midday:    { emoji: "☀️",  color: "#06b6d4", glow: "rgba(6,182,212,0.15)"   },
  afternoon: { emoji: "🌤️", color: "#10b981", glow: "rgba(16,185,129,0.15)"  },
  evening:   { emoji: "🌆", color: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
  night:     { emoji: "🌙", color: "#ef4444", glow: "rgba(239,68,68,0.15)"   },
};

const RISK_CONFIG = {
  low:    { label: "Low Risk",  color: "#10b981", bg: "oklch(0.13 0.02 160 / 0.4)", border: "rgba(16,185,129,0.2)"  },
  medium: { label: "Moderate",  color: "#f59e0b", bg: "oklch(0.13 0.02 60 / 0.4)",  border: "rgba(245,158,11,0.2)"  },
  high:   { label: "High Risk", color: "#ef4444", bg: "oklch(0.13 0.02 20 / 0.4)",  border: "rgba(239,68,68,0.2)"   },
};

// ── Session bar ───────────────────────────────────────────────────────────────

function SessionBar({ session, isStrongest, isWeakest, visible }: {
  session: SessionProfile;
  isStrongest: boolean;
  isWeakest: boolean;
  visible: boolean;
}) {
  const meta      = PERIOD_META[session.period];
  const riskConf  = RISK_CONFIG[session.emotionalRisk];
  const winPct    = Math.round(session.winRate * 100);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setBarWidth(session.quality), 300);
      return () => clearTimeout(t);
    }
  }, [visible, session.quality]);

  return (
    <div
      className="rounded-xl border p-4 transition-all"
      style={{
        background:   riskConf.bg,
        borderColor:  riskConf.border,
        opacity:      visible ? 1 : 0,
        transform:    visible ? "translateY(0)" : "translateY(8px)",
        transition:   "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{meta.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-foreground/90">{session.label}</p>
            <p className="text-[11px] text-muted-foreground">{session.tradeCount} trades</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isStrongest && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/50 border border-emerald-700/40 text-emerald-400">
              Best
            </span>
          )}
          {isWeakest && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-900/50 border border-red-700/40 text-red-400">
              Weakest
            </span>
          )}
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
            style={{ color: riskConf.color, borderColor: riskConf.border, background: riskConf.bg }}
          >
            {riskConf.label}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <p className="text-base font-bold tabular-nums" style={{ color: meta.color }}>{winPct}%</p>
          <p className="text-[10px] text-muted-foreground">Win Rate</p>
        </div>
        <div className="text-center">
          <p className={`text-base font-bold tabular-nums ${session.avgPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {session.avgPnl >= 0 ? "+" : ""}{session.avgPnl.toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground">Avg PnL</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold tabular-nums text-foreground/80">{session.quality}</p>
          <p className="text-[10px] text-muted-foreground">Quality</p>
        </div>
      </div>

      {/* Quality bar */}
      <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width:      `${barWidth}%`,
            background: meta.color,
            boxShadow:  `0 0 6px ${meta.color}60`,
            transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>
    </div>
  );
}

// ── Highlight row ─────────────────────────────────────────────────────────────

function HighlightRow({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}18` }}>
        <Icon className="w-3.5 h-3.5" style={{ color }} />
      </div>
      <p className="text-[11px] text-muted-foreground uppercase tracking-widest flex-shrink-0 w-36">{label}</p>
      <p className="text-sm text-foreground/85 font-medium">{value}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SessionIntelligenceCard({ data }: { data: SessionIntelligence }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const PERIOD_LABELS: Record<SessionPeriod, string> = {
    morning:   "Morning",
    midday:    "Midday",
    afternoon: "Afternoon",
    evening:   "Evening",
    night:     "Late Night",
  };

  return (
    <div ref={ref} className="glass rounded-2xl p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Session Intelligence
        </h3>
      </div>

      {/* Key highlights */}
      <div className="rounded-xl bg-card/40 border border-border/30 px-4 py-1 mb-5">
        <HighlightRow
          icon={TrendingUp}
          label="Strongest Session"
          value={`${PERIOD_META[data.strongestSession].emoji} ${PERIOD_LABELS[data.strongestSession]}`}
          color="#10b981"
        />
        <HighlightRow
          icon={TrendingDown}
          label="Weakest Session"
          value={`${PERIOD_META[data.weakestSession].emoji} ${PERIOD_LABELS[data.weakestSession]}`}
          color="#ef4444"
        />
        {data.emotionalRiskPeriod && (
          <HighlightRow
            icon={AlertTriangle}
            label="Emotional Risk Period"
            value={`${PERIOD_META[data.emotionalRiskPeriod].emoji} ${PERIOD_LABELS[data.emotionalRiskPeriod]}`}
            color="#f59e0b"
          />
        )}
        <HighlightRow
          icon={Zap}
          label="Best Execution Window"
          value={data.bestExecutionWindow}
          color="#06b6d4"
        />
      </div>

      {/* Session cards */}
      <div className="space-y-3 mb-5">
        {data.sessions.map((session) => (
          <SessionBar
            key={session.period}
            session={session}
            isStrongest={session.period === data.strongestSession}
            isWeakest={session.period === data.weakestSession}
            visible={visible}
          />
        ))}
      </div>

      {/* Insight */}
      <div
        className="rounded-xl bg-primary/5 border border-primary/15 p-4"
        style={{
          opacity:    visible ? 1 : 0,
          transition: "opacity 0.5s ease 0.6s",
        }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1.5">Session Insight</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{data.insight}</p>
      </div>
    </div>
  );
}
