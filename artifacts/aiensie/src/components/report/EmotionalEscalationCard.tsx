import { useRef, useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { AlertTriangle, TrendingUp, Zap, RotateCcw, BarChart3, CheckCircle2 } from "lucide-react";
import type { AiensieReport } from "@workspace/aiensie-engine";

// ── Types ──────────────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ className?: string; style?: CSSProperties }>;

interface EscalationSignal {
  id:          string;
  title:       string;
  description: string;
  severity:    "critical" | "warning" | "caution";
  metric:      string;
  icon:        IconComponent;
}

// ── Severity style map ─────────────────────────────────────────────────────────

const SEV_STYLE = {
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.06)",    border: "rgba(239,68,68,0.2)",    label: "Critical" },
  warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.06)",   border: "rgba(245,158,11,0.2)",   label: "Warning"  },
  caution:  { color: "#06b6d4", bg: "rgba(6,182,212,0.06)",    border: "rgba(6,182,212,0.2)",    label: "Caution"  },
};

// ── Signal generator ──────────────────────────────────────────────────────────

function buildSignals(report: AiensieReport): EscalationSignal[] {
  const { detectedPatterns, metrics, scores } = report;
  const signals: EscalationSignal[] = [];

  const hasRevenge  = detectedPatterns.some((p) => /revenge/i.test(p.name));
  const hasOvertrad = detectedPatterns.some((p) => /overtrad/i.test(p.name));
  const hasOverconf = detectedPatterns.some((p) => /overconfiden|confident/i.test(p.name));
  const hasSizing   = detectedPatterns.some((p) => /sizing|position size/i.test(p.name));

  // ── Revenge trading ──
  if (hasRevenge) {
    signals.push({
      id: "revenge", icon: RotateCcw,
      severity: "critical",
      title: "Revenge Trading Confirmed",
      description:
        "Re-entry behavior detected within minutes of significant losses. This pattern compounds drawdowns, destroys expectancy, and is the #1 behavioral score suppressor in your assessment.",
      metric: `${metrics.maxConsecutiveLosses} consecutive losses — primary trigger`,
    });
  }

  // ── Position sizing escalation ──
  if (hasSizing || metrics.positionSizeVariability > 0.35) {
    const pct = Math.min(400, Math.round(metrics.positionSizeVariability * 260 + 90));
    signals.push({
      id: "sizing", icon: BarChart3,
      severity: metrics.positionSizeVariability > 0.55 ? "critical" : "warning",
      title: "Position Size Escalation",
      description:
        "Sizing deviates significantly from baseline during emotionally elevated sessions. Risk management is being bypassed — your position sizing follows your emotional state, not your plan.",
      metric: `~${pct}% deviation from baseline sizing`,
    });
  }

  // ── Overconfidence ──
  if (hasOverconf) {
    signals.push({
      id: "overconf", icon: TrendingUp,
      severity: "warning",
      title: "Overconfidence After Win Streaks",
      description:
        "Winning streak confidence systematically triggered aggressive exposure expansion. You underestimate risk during high-equity periods — turning potential strong sessions into breakeven results.",
      metric: "Win streak → exposure expansion cycle",
    });
  }

  // ── Frequency spike ──
  if (hasOvertrad || metrics.tradesPerActiveDay > 8) {
    signals.push({
      id: "frequency", icon: Zap,
      severity: "warning",
      title: "Impulsive Frequency Spike",
      description:
        "Trade frequency significantly exceeded your disciplined baseline during emotional windows. High-frequency sessions are statistically your worst-performing execution periods.",
      metric: `${metrics.tradesPerActiveDay.toFixed(1)} trades/day avg detected`,
    });
  }

  // ── Chronic emotional instability ──
  if (scores.emotionalStabilityScore < 40) {
    signals.push({
      id: "instability", icon: AlertTriangle,
      severity: "critical",
      title: "Chronic Emotional Instability",
      description:
        "Emotional control scores reveal systematic vulnerability to market-driven behavioral shifts. Execution quality degrades predictably under pressure — this is a structural issue, not situational.",
      metric: `${scores.emotionalStabilityScore}/100 stability score`,
    });
  } else if (scores.emotionalStabilityScore < 58) {
    signals.push({
      id: "instability-mild", icon: AlertTriangle,
      severity: "caution",
      title: "Moderate Emotional Volatility",
      description:
        "Emotional stability is below the 60-point threshold associated with consistent execution. Behavioral decisions are partially driven by emotional state rather than systematic analysis.",
      metric: `${scores.emotionalStabilityScore}/100 stability score`,
    });
  }

  // ── Panic exit signature ──
  if (metrics.averageHoldingMinutes < 6 && metrics.winRate < 0.44) {
    signals.push({
      id: "panic", icon: RotateCcw,
      severity: "caution",
      title: "Panic Exit Signature",
      description:
        "Short average hold times combined with below-optimal win rates suggest premature exits driven by loss aversion — your stops are emotional, not systematic.",
      metric: `${metrics.averageHoldingMinutes.toFixed(0)}min avg hold time`,
    });
  }

  return signals.slice(0, 5);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EmotionalEscalationCard({ report }: { report: AiensieReport }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const signals = buildSignals(report);

  const criticalCount = signals.filter((s) => s.severity === "critical").length;
  const warningCount  = signals.filter((s) => s.severity === "warning").length;

  return (
    <div ref={ref} className="glass rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1.5">
        <div className="w-6 h-6 rounded-lg bg-red-950/40 border border-red-800/30 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
        </div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Emotional Escalation</h3>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {criticalCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/50 border border-red-800/40 text-red-400">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/40 text-amber-400">
              {warningCount} warning
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/55 mb-5 pl-9">
        Psychological escalation signals reconstructed from your trading behavioral data.
      </p>

      {signals.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-400">No escalation patterns detected.</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your emotional state remains controlled throughout your trading sessions.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((sig, i) => {
            const cfg  = SEV_STYLE[sig.severity];
            const Icon = sig.icon;
            return (
              <div
                key={sig.id}
                className="rounded-xl border p-4"
                style={{
                  background:  cfg.bg,
                  borderColor: cfg.border,
                  opacity:     visible ? 1 : 0,
                  transform:   visible ? "translateY(0)" : "translateY(6px)",
                  transition:  `opacity 0.4s ease ${i * 80}ms, transform 0.4s ease ${i * 80}ms`,
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${cfg.color}18` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    <p className="text-sm font-semibold leading-tight" style={{ color: cfg.color }}>
                      {sig.title}
                    </p>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0"
                    style={{ color: cfg.color, borderColor: cfg.border }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-foreground/65 leading-relaxed pl-9 mb-2">{sig.description}</p>
                <p className="text-[11px] font-semibold pl-9 opacity-65" style={{ color: cfg.color }}>
                  {sig.metric}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
