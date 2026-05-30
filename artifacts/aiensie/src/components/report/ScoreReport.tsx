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
  AlertTriangle,
  Zap,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiensieReport, AiensieScores, DetectedPattern } from "@workspace/aiensie-engine";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoreReportProps {
  report: AiensieReport;
  exchange: string;
  tradeCount: number;
  onReset: () => void;
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const [progress, setProgress]       = useState(0);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const tProgress = setTimeout(() => setProgress(score), 150);
    let start = 0;
    const duration = 1600;
    const step = 16;
    const increment = score / (duration / step);
    const tCount = setInterval(() => {
      start += increment;
      if (start >= score) { setDisplayScore(score); clearInterval(tCount); }
      else setDisplayScore(Math.floor(start));
    }, step);
    return () => { clearTimeout(tProgress); clearInterval(tCount); };
  }, [score]);

  const R            = 52;
  const circumference = 2 * Math.PI * R;
  const dashOffset   = circumference - (progress / 100) * circumference;
  const color =
    score >= 80 ? "#10b981" :
    score >= 65 ? "#06b6d4" :
    score >= 50 ? "#f59e0b" : "#ef4444";
  const glow =
    score >= 80 ? "drop-shadow(0 0 8px rgba(16,185,129,0.6))" :
    score >= 65 ? "drop-shadow(0 0 8px rgba(6,182,212,0.6))"  :
    score >= 50 ? "drop-shadow(0 0 8px rgba(245,158,11,0.6))" :
                  "drop-shadow(0 0 8px rgba(239,68,68,0.6))";

  return (
    <div className="relative w-40 h-40 flex-shrink-0">
      <svg width="160" height="160" viewBox="0 0 160 160"
        style={{ transform: "rotate(-90deg)" }}>
        <circle cx="80" cy="80" r={R} fill="none"
          stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
        <circle cx="80" cy="80" r={R} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.34,1.56,0.64,1)", filter: glow }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums" style={{ color }}>{displayScore}</span>
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
  sublabel: string;
  Icon: IconComponent;
  color: string;
}> = [
  { key: "disciplineScore",         label: "Discipline",          sublabel: "Position sizing & trade frequency",  Icon: Target,     color: "#06b6d4" },
  { key: "riskControlScore",        label: "Risk Control",        sublabel: "Payoff ratio & portfolio exposure",  Icon: Shield,     color: "#10b981" },
  { key: "consistencyScore",        label: "Consistency",         sublabel: "Win-rate stability & size variance", Icon: Activity,   color: "#f59e0b" },
  { key: "emotionalStabilityScore", label: "Emotional Stability", sublabel: "Behavioral & psychological control", Icon: Brain,      color: "#a78bfa" },
  { key: "decisionQualityScore",    label: "Decision Quality",    sublabel: "Expectancy & edge reliability",      Icon: TrendingUp, color: "#38bdf8" },
];

function DimensionBar({
  label, sublabel, score, color, Icon, delay, aiensieScore,
}: {
  label: string; sublabel: string; score: number; color: string;
  Icon: IconComponent; delay: number; aiensieScore: number;
}) {
  const [width, setWidth]     = useState(0);
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

  const delta     = score - aiensieScore;
  const deltaStr  = delta > 0 ? `+${delta}` : String(delta);
  const deltaColor = delta >= 0 ? "text-emerald-400" : "text-red-400";

  return (
    <div className="flex items-center gap-3 group py-0.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
           style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div>
            <span className="text-sm font-medium text-foreground/90">{label}</span>
            <span className="hidden sm:inline text-xs text-muted-foreground ml-2">{sublabel}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-[11px] font-medium tabular-nums ${deltaColor}`}>{deltaStr}</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color }}>
              {display}<span className="text-muted-foreground text-xs font-normal">/100</span>
            </span>
          </div>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
          {/* Reference line at Aiensie Score */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/20 z-10"
            style={{ left: `${aiensieScore}%` }}
          />
          <div
            className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: color,
              boxShadow: `0 0 6px ${color}60`,
              transition: `width 1s ease ${delay}ms`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, icon: Icon }: { label: string; icon: IconComponent }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </h3>
    </div>
  );
}

// ── Pattern card ──────────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<string, {
  bg: string; border: string; text: string; badge: string; dot: string; icon: string;
}> = {
  low:    { bg: "bg-emerald-950/50",  border: "border-emerald-800/40", text: "text-emerald-400",  badge: "bg-emerald-900/60 border-emerald-700/60",  dot: "bg-emerald-400",  icon: "✓" },
  medium: { bg: "bg-amber-950/50",    border: "border-amber-800/40",   text: "text-amber-400",    badge: "bg-amber-900/60 border-amber-700/60",     dot: "bg-amber-400",    icon: "△" },
  high:   { bg: "bg-red-950/50",      border: "border-red-800/40",     text: "text-red-400",      badge: "bg-red-900/60 border-red-700/60",          dot: "bg-red-400",      icon: "!" },
};

function PatternCard({ pattern }: { pattern: DetectedPattern }) {
  const s = SEVERITY_CONFIG[pattern.severity] ?? SEVERITY_CONFIG.medium;
  return (
    <div className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${s.dot}`} />
          <span className={`text-sm font-semibold ${s.text}`}>{pattern.name}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${s.badge} ${s.text}`}>
          {pattern.severity}
        </span>
      </div>
      <p className="text-xs text-foreground/70 mb-1.5 ml-4.5 pl-[18px]">{pattern.description}</p>
      <p className={`text-[11px] ml-4.5 pl-[18px] font-medium ${s.text} opacity-80`}>{pattern.evidence}</p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/60 rounded-xl border border-border/40 p-3 text-center">
      <p className="text-xl font-semibold text-foreground tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ── Strength / Weakness item ──────────────────────────────────────────────────

function StrengthItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-foreground/85 leading-relaxed">{text}</span>
    </li>
  );
}

function WeaknessItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-xl bg-red-950/20 border border-red-900/25">
      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-foreground/85 leading-relaxed">{text}</span>
    </li>
  );
}

// ── Action plan item ──────────────────────────────────────────────────────────

function ActionItem({ index, text }: { index: number; text: string }) {
  return (
    <li className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-border/40 hover:border-primary/30 transition-colors">
      <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
        {index}
      </span>
      <div className="flex-1">
        <span className="text-sm text-foreground/85 leading-relaxed">{text}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
    </li>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ScoreReport({ report, exchange, tradeCount, onReset }: ScoreReportProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const {
    aiensieScore, label, traderType, persona,
    scores, metrics, detectedPatterns, strengths, weaknesses, actionPlan,
  } = report;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const winRatePct    = `${(metrics.winRate * 100).toFixed(1)}%`;
  const payoffRatio   = metrics.payoffRatio.toFixed(2);
  const profitFactor  = metrics.profitFactor.toFixed(2);
  const maxConsecLoss = String(metrics.maxConsecutiveLosses);

  const highSeverityCount   = detectedPatterns.filter((p) => p.severity === "high").length;
  const mediumSeverityCount = detectedPatterns.filter((p) => p.severity === "medium").length;

  return (
    <div ref={topRef} className="space-y-5">

      {/* ── 1. Score header ── */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <ScoreRing score={aiensieScore} />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                {label}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                {exchange}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                {tradeCount} trades analysed
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{traderType}</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto sm:mx-0 leading-relaxed">{persona}</p>
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-border/40">
          <StatCard label="Win Rate"      value={winRatePct}   />
          <StatCard label="Payoff Ratio"  value={payoffRatio}  />
          <StatCard label="Profit Factor" value={profitFactor} />
          <StatCard label="Max Drawdown"  value={maxConsecLoss + " L"} />
        </div>
      </div>

      {/* ── 2. Performance Dimensions ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Performance Dimensions" icon={BarChart3} />
        <div className="space-y-4">
          {DIMENSION_META.map(({ key, label: dimLabel, sublabel, Icon, color }, i) => (
            <DimensionBar
              key={key}
              label={dimLabel}
              sublabel={sublabel}
              score={scores[key]}
              color={color}
              Icon={Icon}
              delay={i * 120}
              aiensieScore={aiensieScore}
            />
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/50 mt-4 pt-4 border-t border-border/30">
          The vertical line marks your overall Aiensie Score ({aiensieScore}) for reference.
          Scores above the line are strengths; below are growth areas.
        </p>
      </div>

      {/* ── 3. Detected Behavioral Patterns ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Detected Behavioral Patterns" icon={AlertTriangle} />

        {detectedPatterns.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-400">No significant patterns detected.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your trading shows clean psychological footprints. Maintain current discipline.
              </p>
            </div>
          </div>
        ) : (
          <>
            {(highSeverityCount > 0 || mediumSeverityCount > 0) && (
              <div className="flex flex-wrap gap-3 mb-4 p-3 rounded-xl bg-card/40 border border-border/40">
                {highSeverityCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    {highSeverityCount} high-severity
                  </span>
                )}
                {mediumSeverityCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {mediumSeverityCount} medium-severity
                  </span>
                )}
                {detectedPatterns.filter((p) => p.severity === "low").length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {detectedPatterns.filter((p) => p.severity === "low").length} low-severity
                  </span>
                )}
              </div>
            )}
            <div className="space-y-3">
              {detectedPatterns.map((p) => (
                <PatternCard key={p.name} pattern={p} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── 4. Key Strengths ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Key Strengths" icon={CheckCircle2} />
        <ul className="space-y-2.5">
          {strengths.map((s) => (
            <StrengthItem key={s} text={s} />
          ))}
        </ul>
      </div>

      {/* ── 5. Risk Weaknesses ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Risk Weaknesses" icon={XCircle} />
        {weaknesses.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">No critical weaknesses identified. Focus on sustaining current performance.</p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {weaknesses.map((w) => (
              <WeaknessItem key={w} text={w} />
            ))}
          </ul>
        )}
      </div>

      {/* ── 6. Personalised Action Plan ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Personalised Action Plan" icon={Zap} />
        <p className="text-xs text-muted-foreground mb-4 -mt-1">
          Prioritised steps based on your specific behavioral data. Start with step 1.
        </p>
        <ol className="space-y-2.5">
          {actionPlan.map((item, i) => (
            <ActionItem key={i} index={i + 1} text={item} />
          ))}
        </ol>
      </div>

      {/* ── 7. Disclaimer ── */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-card/40 border border-border/40">
        <Info className="w-4 h-4 text-muted-foreground/60 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          <span className="font-semibold text-muted-foreground">Disclaimer.</span>{" "}
          Aiensie provides behavioural insights based on pattern recognition in your historical trade data.
          This is not financial advice and does not constitute a recommendation to buy, sell, or hold any
          financial instrument. Past trading patterns do not guarantee future performance. Always apply
          your own judgement and seek qualified financial advice where appropriate.
        </p>
      </div>

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 pb-2">
        <Button onClick={onReset} variant="outline" className="flex-1 h-12">
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
