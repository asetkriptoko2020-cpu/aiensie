import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Shield,
  Activity,
  Brain,
  Target,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiensieReport, AiensieScores } from "@workspace/aiensie-engine";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoreReportProps {
  report: AiensieReport;
  exchange: string;
  tradeCount: number;
  onReset: () => void;
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const [progress, setProgress] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const tProgress = setTimeout(() => setProgress(score), 150);

    let start = 0;
    const duration = 1600;
    const step = 16;
    const increment = score / (duration / step);
    const tCount = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(tCount);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, step);

    return () => {
      clearTimeout(tProgress);
      clearInterval(tCount);
    };
  }, [score]);

  const R = 52;
  const circumference = 2 * Math.PI * R;
  const dashOffset = circumference - (progress / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" :
    score >= 65 ? "#06b6d4" :
    score >= 50 ? "#f59e0b" : "#ef4444";
  const glow =
    score >= 80 ? "drop-shadow(0 0 8px rgba(16,185,129,0.6))" :
    score >= 65 ? "drop-shadow(0 0 8px rgba(6,182,212,0.6))" :
    score >= 50 ? "drop-shadow(0 0 8px rgba(245,158,11,0.6))" :
                  "drop-shadow(0 0 8px rgba(239,68,68,0.6))";

  return (
    <div className="relative w-40 h-40 flex-shrink-0">
      <svg
        width="160" height="160"
        viewBox="0 0 160 160"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle cx="80" cy="80" r={R} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        {/* Arc */}
        <circle
          cx="80" cy="80" r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: "stroke-dashoffset 1.6s cubic-bezier(0.34,1.56,0.64,1)",
            filter: glow,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>
          {displayScore}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ── Dimension bar ─────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ className?: string; style?: CSSProperties }>;

const DIMENSION_META: Array<{
  key: keyof AiensieScores;
  label: string;
  Icon: IconComponent;
  color: string;
}> = [
  { key: "disciplineScore",         label: "Discipline",          Icon: Target,    color: "#06b6d4" },
  { key: "riskControlScore",        label: "Risk Control",        Icon: Shield,    color: "#10b981" },
  { key: "consistencyScore",        label: "Consistency",         Icon: Activity,  color: "#f59e0b" },
  { key: "emotionalStabilityScore", label: "Emotional Stability", Icon: Brain,     color: "#a78bfa" },
  { key: "decisionQualityScore",    label: "Decision Quality",    Icon: TrendingUp,color: "#38bdf8" },
];

function DimensionBar({
  label, score, color, Icon, delay,
}: {
  label: string; score: number; color: string; Icon: IconComponent; delay: number;
}) {
  const [width, setWidth] = useState(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setWidth(score);
      let n = 0;
      const iv = setInterval(() => {
        n += score / 40;
        if (n >= score) { setDisplay(score); clearInterval(iv); }
        else setDisplay(Math.floor(n));
      }, 16);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div className="flex items-center gap-3 group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-foreground/80">{label}</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color }}>
            {display}<span className="text-muted-foreground font-normal">/100</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: color,
              boxShadow: `0 0 6px ${color}80`,
              transition: `width 1s ease ${delay}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Pattern badge ─────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  low:    { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-800/60", dot: "bg-emerald-400" },
  medium: { bg: "bg-amber-950/60",   text: "text-amber-400",   border: "border-amber-800/60",   dot: "bg-amber-400" },
  high:   { bg: "bg-red-950/60",     text: "text-red-400",     border: "border-red-800/60",     dot: "bg-red-400" },
};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/60 rounded-xl border border-border/40 p-3 text-center">
      <p className="text-xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ScoreReport({ report, exchange, tradeCount, onReset }: ScoreReportProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const { aiensieScore, label, traderType, persona, scores, metrics, detectedPatterns, strengths, weaknesses, actionPlan } = report;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const winRatePct     = `${(metrics.winRate * 100).toFixed(1)}%`;
  const payoffRatio    = metrics.payoffRatio.toFixed(2);
  const profitFactor   = metrics.profitFactor.toFixed(2);
  const maxConsecLoss  = String(metrics.maxConsecutiveLosses);

  return (
    <div ref={topRef} className="space-y-6">

      {/* ── Score header card ── */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

          {/* Ring */}
          <ScoreRing score={aiensieScore} />

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                {label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                {exchange}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                {tradeCount} trades
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {traderType}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto sm:mx-0">
              {persona}
            </p>
          </div>
        </div>

        {/* Key stats row */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-border/40">
          <StatCard label="Win Rate"     value={winRatePct}   />
          <StatCard label="Payoff Ratio" value={payoffRatio}  />
          <StatCard label="Profit Factor"value={profitFactor} />
          <StatCard label="Max Losses"   value={maxConsecLoss}/>
        </div>
      </div>

      {/* ── Dimension scores ── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-5 uppercase tracking-widest text-muted-foreground">
          Performance Dimensions
        </h3>
        <div className="space-y-4">
          {DIMENSION_META.map(({ key, label: dimLabel, Icon, color }, i) => (
            <DimensionBar
              key={key}
              label={dimLabel}
              score={scores[key]}
              color={color}
              Icon={Icon}
              delay={i * 120}
            />
          ))}
        </div>
      </div>

      {/* ── Behavioral patterns ── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Behavioral Patterns
        </h3>
        {detectedPatterns.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">
              No significant behavioral patterns detected. Clean trading psychology.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {detectedPatterns.map((p) => {
              const s = SEVERITY_STYLES[p.severity] ?? SEVERITY_STYLES.medium;
              return (
                <div
                  key={p.name}
                  className={`p-4 rounded-xl border ${s.bg} ${s.border}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                    <span className={`text-sm font-semibold ${s.text}`}>{p.name}</span>
                    <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${s.border} ${s.text}`}>
                      {p.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-3.5">{p.evidence}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Strengths / Weaknesses ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Strengths
          </h3>
          <ul className="space-y-2.5">
            {strengths.map((s) => (
              <li key={s} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Areas to Improve
          </h3>
          {weaknesses.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No significant weaknesses detected.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground/80">{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Action plan ── */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Action Plan
        </h3>
        <ol className="space-y-3">
          {actionPlan.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm text-foreground/80 leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* ── Disclaimer ── */}
      <div className="flex items-start gap-2.5 p-4 rounded-xl bg-card border border-border/40">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Aiensie analyzes trade patterns for behavioral insights only. This is not
          financial advice. Past trading patterns do not guarantee future performance.
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onReset}
          variant="outline"
          className="flex-1 h-12"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Assessment
        </Button>
        <Button className="flex-1 h-12 glow-primary">
          Upgrade for Full Report
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
