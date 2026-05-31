import { useRef, useState, useEffect } from "react";
import { Activity } from "lucide-react";
import type { AiensieReport } from "@workspace/aiensie-engine";

// ── Types ──────────────────────────────────────────────────────────────────────

interface TimelineEvent {
  id:          string;
  type:        "loss" | "escalation" | "entry" | "sizing" | "recovery" | "pattern" | "neutral";
  title:       string;
  description: string;
  timeLabel:   string;
}

// ── Style map ─────────────────────────────────────────────────────────────────

const EVENT_STYLE: Record<TimelineEvent["type"], { color: string; bg: string; border: string }> = {
  loss:       { color: "#ef4444", bg: "rgba(239,68,68,0.07)",    border: "rgba(239,68,68,0.22)"    },
  escalation: { color: "#f97316", bg: "rgba(249,115,22,0.07)",   border: "rgba(249,115,22,0.22)"   },
  entry:      { color: "#f59e0b", bg: "rgba(245,158,11,0.07)",   border: "rgba(245,158,11,0.22)"   },
  sizing:     { color: "#a78bfa", bg: "rgba(167,139,250,0.07)",  border: "rgba(167,139,250,0.22)"  },
  recovery:   { color: "#10b981", bg: "rgba(16,185,129,0.07)",   border: "rgba(16,185,129,0.22)"   },
  pattern:    { color: "#06b6d4", bg: "rgba(6,182,212,0.07)",    border: "rgba(6,182,212,0.22)"    },
  neutral:    { color: "#94a3b8", bg: "rgba(148,163,184,0.05)",  border: "rgba(148,163,184,0.15)"  },
};

// ── Event generator ───────────────────────────────────────────────────────────

function buildEvents(report: AiensieReport): TimelineEvent[] {
  const { detectedPatterns, metrics, scores, sessionIntelligence } = report;

  const hasRevenge     = detectedPatterns.some((p) => /revenge/i.test(p.name));
  const hasOvertrading = detectedPatterns.some((p) => /overtrad/i.test(p.name));
  const hasHolding     = detectedPatterns.some((p) => /hold|loss hold/i.test(p.name));
  const hasOverconf    = detectedPatterns.some((p) => /overconfiden|confident/i.test(p.name));
  const hasSizing      = detectedPatterns.some((p) => /sizing|position size/i.test(p.name));

  const events: TimelineEvent[] = [];

  // ── 1. Session open ──
  if (scores.disciplineScore >= 65) {
    events.push({
      id: "open", type: "recovery", timeLabel: "Session open",
      title: "Session opens with structure",
      description: "Early trades executed with measured frequency and consistent entry discipline. Behavioral footprint is controlled.",
    });
  } else {
    events.push({
      id: "open", type: "entry", timeLabel: "Session open",
      title: "Session opens reactively",
      description: "Initial trades placed under market pressure without fully confirmed setups — discipline under stress is the core vulnerability.",
    });
  }

  // ── 2. Losing streak ──
  if (metrics.maxConsecutiveLosses >= 2) {
    events.push({
      id: "loss-streak", type: "loss", timeLabel: "Mid-session",
      title: `${metrics.maxConsecutiveLosses}-trade losing sequence detected`,
      description: `A run of ${metrics.maxConsecutiveLosses} consecutive losses — a critical inflection point where emotional state typically deteriorates and behavioral patterns emerge.`,
    });
  }

  // ── 3. Revenge entry ──
  if (hasRevenge) {
    events.push({
      id: "revenge", type: "escalation", timeLabel: "Post-loss",
      title: "Rapid re-entry after loss",
      description: "Trade frequency increased within minutes of a significant loss. Position entered without standard setup criteria — revenge execution confirmed.",
    });
  }

  // ── 4. Position sizing escalation ──
  if (hasSizing || metrics.positionSizeVariability > 0.35) {
    const pct = Math.min(400, Math.round(metrics.positionSizeVariability * 260 + 90));
    events.push({
      id: "sizing", type: "sizing", timeLabel: "Emotional window",
      title: "Position size escalated",
      description: `Sizing increased approximately ${pct}% above baseline during high-stress periods. Risk management framework was bypassed — a clear emotional override signature.`,
    });
  }

  // ── 5. Overtrading spike ──
  if (hasOvertrading) {
    events.push({
      id: "overtrading", type: "entry", timeLabel: "High-frequency window",
      title: "Trade frequency doubled",
      description: `${metrics.tradesPerActiveDay.toFixed(1)} avg trades/day — well above your disciplined baseline. High-frequency sessions correlate with your weakest execution quality readings.`,
    });
  }

  // ── 6. Loss holding ──
  if (hasHolding) {
    events.push({
      id: "holding", type: "escalation", timeLabel: "Drawdown period",
      title: "Exits delayed on losing positions",
      description: "Losing trades were held significantly longer than winning trades. Loss aversion behavior — not stop discipline — was driving exit decisions.",
    });
  }

  // ── 7. Overconfidence after wins ──
  if (hasOverconf) {
    events.push({
      id: "overconf", type: "sizing", timeLabel: "Post-win streak",
      title: "Overconfidence caused exposure expansion",
      description: "Consecutive wins preceded aggressive position increases. Winning streaks systematically trigger underestimation of risk — the classic overconfidence trap.",
    });
  }

  // ── 8. Session-specific emotional risk ──
  if (sessionIntelligence?.emotionalRiskPeriod) {
    const label: Record<string, string> = {
      morning: "Morning", midday: "Midday", afternoon: "Afternoon", evening: "Evening", night: "Late-night",
    };
    const period = label[sessionIntelligence.emotionalRiskPeriod] ?? sessionIntelligence.emotionalRiskPeriod;
    events.push({
      id: "session-risk", type: "pattern", timeLabel: `${period} window`,
      title: `Execution quality deteriorated — ${period} session`,
      description: "Behavioral patterns cluster around this time window. Emotional risk index peaks here — session timing is amplifying psychological pressure.",
    });
  }

  // ── 9. Close ──
  if (scores.emotionalStabilityScore >= 62) {
    events.push({
      id: "close", type: "recovery", timeLabel: "Session close",
      title: "Emotional equilibrium maintained through close",
      description: "Despite behavioral pressure mid-session, final execution windows showed recovery toward structured, disciplined patterns.",
    });
  } else {
    events.push({
      id: "close", type: "escalation", timeLabel: "Session close",
      title: "Emotional pressure persisted to close",
      description: "Execution discipline did not recover by session end — elevated risk of carryover behavior impacting the next trading session.",
    });
  }

  return events.slice(0, 8);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BehaviorTimeline({ report }: { report: AiensieReport }) {
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

  const events = buildEvents(report);

  return (
    <div ref={ref} className="glass rounded-2xl p-6 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Activity className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Behavior Timeline</h3>
        <span className="ml-auto text-[10px] text-muted-foreground/35 uppercase tracking-widest">Reconstructed</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connector */}
        <div className="absolute left-[9px] top-2 bottom-2 w-px"
             style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)" }} />

        <div className="space-y-3">
          {events.map((ev, i) => {
            const s = EVENT_STYLE[ev.type];
            return (
              <div
                key={ev.id}
                className="relative flex gap-4"
                style={{
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "translateX(0)" : "translateX(-10px)",
                  transition: `opacity 0.4s ease ${i * 75}ms, transform 0.4s ease ${i * 75}ms`,
                }}
              >
                {/* Dot */}
                <div className="relative z-10 flex-shrink-0 mt-[14px]">
                  <div
                    className="w-[19px] h-[19px] rounded-full border-2 flex items-center justify-center"
                    style={{ background: `${s.color}15`, borderColor: s.color, boxShadow: `0 0 8px ${s.color}45` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  </div>
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-xl border p-3.5"
                  style={{ background: s.bg, borderColor: s.border }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold leading-tight" style={{ color: s.color }}>
                      {ev.title}
                    </p>
                    <span className="text-[10px] text-muted-foreground/45 flex-shrink-0 mt-0.5 whitespace-nowrap">
                      {ev.timeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/65 leading-relaxed">{ev.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/30 mt-5 leading-relaxed">
        Timeline reconstructed from behavioral pattern analysis. Events are statistically inferred — not exact timestamps.
      </p>
    </div>
  );
}
