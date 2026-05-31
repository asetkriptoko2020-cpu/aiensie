import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
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
  Sparkles,
  Lock,
  Dna,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiensieReport, AiensieScores, DetectedPattern } from "@workspace/aiensie-engine";
import { Link } from "wouter";
import { SessionIntelligenceCard }  from "@/components/report/SessionIntelligenceCard";
import { TraderArchetypeCard }      from "@/components/report/TraderArchetypeCard";
import { BehaviorEvolutionCard }    from "@/components/report/BehaviorEvolutionCard";
import CrossMarketCard              from "@/components/report/CrossMarketCard";
import { BehaviorTimeline }         from "@/components/report/BehaviorTimeline";
import { SessionHeatmap }           from "@/components/report/SessionHeatmap";
import { EmotionalEscalationCard }  from "@/components/report/EmotionalEscalationCard";
import { WowMoments }               from "@/components/report/WowMoments";
import { generateSmartAlerts }      from "@/lib/smart-alerts";
import { loadSavedReports, savedReportToMockReport } from "@/lib/report-store";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoreReportProps {
  report: AiensieReport;
  exchange: string;
  tradeCount: number;
  onReset: () => void;
  isPro?: boolean;
}

// ── Score ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const [progress, setProgress]         = useState(0);
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

  const R             = 52;
  const circumference = 2 * Math.PI * R;
  const dashOffset    = circumference - (progress / 100) * circumference;
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
        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
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

function scoreLabel(score: number): string {
  if (score >= 85) return "Elite";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Stable";
  if (score >= 30) return "Developing";
  return "Weak";
}

const DIMENSION_META: Array<{
  key: keyof AiensieScores;
  label: string;
  sublabel: string;
  Icon: IconComponent;
  color: string;
}> = [
  { key: "disciplineScore",         label: "Discipline",       sublabel: "Are you trading on your terms, or reacting to the market?",       Icon: Target,     color: "#06b6d4" },
  { key: "riskControlScore",        label: "Risk Control",     sublabel: "Do your wins recover more than your losses take away?",            Icon: Shield,     color: "#10b981" },
  { key: "consistencyScore",        label: "Trading Stability",sublabel: "Are you trading the same way each day, or all over the place?",    Icon: Activity,   color: "#f59e0b" },
  { key: "emotionalStabilityScore", label: "Emotional Control",sublabel: "Do you stay grounded after a loss, or does it change how you trade?", Icon: Brain,   color: "#a78bfa" },
  { key: "decisionQualityScore",    label: "Trade Quality",    sublabel: "Are your entries and exits serving you, or costing you?",          Icon: TrendingUp, color: "#38bdf8" },
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
            <span className="text-[11px] font-medium text-muted-foreground/60">{scoreLabel(score)}</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color }}>
              {display}<span className="text-muted-foreground text-xs font-normal">/100</span>
            </span>
          </div>
        </div>
        <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div className="absolute top-0 bottom-0 w-px bg-white/20 z-10"
               style={{ left: `${aiensieScore}%` }} />
          <div className="h-full rounded-full"
            style={{
              width: `${width}%`,
              background: color,
              boxShadow: `0 0 6px ${color}60`,
              transition: `width 1s ease ${delay}ms`,
            }} />
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
  bg: string; border: string; text: string; badge: string; dot: string;
  badgeLabel: string;
}> = {
  low:    { bg: "bg-emerald-950/50", border: "border-emerald-800/40", text: "text-emerald-400", badge: "bg-emerald-900/60 border-emerald-700/60", dot: "bg-emerald-400", badgeLabel: "Minor"   },
  medium: { bg: "bg-amber-950/50",   border: "border-amber-800/40",   text: "text-amber-400",   badge: "bg-amber-900/60 border-amber-700/60",   dot: "bg-amber-400",   badgeLabel: "Moderate" },
  high:   { bg: "bg-red-950/50",     border: "border-red-800/40",     text: "text-red-400",     badge: "bg-red-900/60 border-red-700/60",       dot: "bg-red-400",     badgeLabel: "Strong"   },
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
          {s.badgeLabel}
        </span>
      </div>
      <p className="text-xs text-foreground/70 mb-1.5 pl-[18px]">{pattern.description}</p>
      <p className={`text-[11px] pl-[18px] font-medium ${s.text} opacity-80`}>{pattern.evidence}</p>
    </div>
  );
}

// ── Locked feature teaser ─────────────────────────────────────────────────────

type IconComponent2 = React.ComponentType<{ className?: string; style?: CSSProperties }>;

function LockedFeatureTeaser({ title, description, icon: Icon, accent }: {
  title: string;
  description: string;
  icon: IconComponent2;
  accent: string;
}) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden border border-border/60">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 50% at 5% 50%, ${accent}08, transparent)` }}
      />
      <div className="relative z-10 flex items-center gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ background: `${accent}12`, borderColor: `${accent}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Lock className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
            <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Pro Feature</p>
          </div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: {
  label: string; value: string; sub?: string;
}) {
  return (
    <div className="bg-card/60 rounded-xl border border-border/40 p-3 text-center flex flex-col gap-0.5">
      <p className="text-xl font-semibold text-foreground tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-xs font-medium text-muted-foreground/70 tabular-nums">{sub}</p>}
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function formatMoney(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 10000) return `$${(abs / 1000).toFixed(1)}k`;
  if (abs >= 100)   return `$${Math.round(abs)}`;
  if (abs >= 10)    return `$${abs.toFixed(1)}`;
  return `$${abs.toFixed(2)}`;
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

// ── Smart Alerts meta ─────────────────────────────────────────────────────────

const ALERT_META: Record<string, { color: string; bg: string; border: string; label: string; Icon: React.ElementType }> = {
  improvement: { color: "#10b981", bg: "oklch(0.13 0.02 160 / 0.5)",  border: "rgba(16,185,129,0.18)",  label: "Improvement", Icon: CheckCircle2  },
  warning:     { color: "#f59e0b", bg: "oklch(0.13 0.02 60 / 0.5)",   border: "rgba(245,158,11,0.18)",   label: "Warning",     Icon: AlertTriangle  },
  critical:    { color: "#ef4444", bg: "oklch(0.13 0.02 20 / 0.5)",   border: "rgba(239,68,68,0.18)",    label: "Critical",    Icon: TrendingDown   },
  insight:     { color: "#38bdf8", bg: "oklch(0.13 0.015 220 / 0.5)", border: "rgba(56,189,248,0.18)",   label: "Insight",     Icon: Info           },
};

// ── Main component ────────────────────────────────────────────────────────────

export function ScoreReport({ report, exchange, tradeCount, onReset, isPro = false }: ScoreReportProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const {
    aiensieScore, label, traderType, dynamicPersona,
    scores, metrics, detectedPatterns, strengths, weaknesses, actionPlan,
    sessionIntelligence, archetypeDNA, crossMarketIntelligence,
  } = report;

  const freePatterns   = detectedPatterns.slice(0, 2);
  const freeStrengths  = strengths.slice(0, 2);
  const freeWeaknesses = weaknesses.slice(0, 2);
  const freeActions    = actionPlan.slice(0, 3);

  const activePatterns   = isPro ? detectedPatterns : freePatterns;
  const activeStrengths  = isPro ? strengths        : freeStrengths;
  const activeWeaknesses = isPro ? weaknesses       : freeWeaknesses;

  const smartAlerts = isPro
    ? generateSmartAlerts(loadSavedReports().map(savedReportToMockReport))
    : [];
  const activeActions    = isPro ? actionPlan        : freeActions;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const winRatePct   = `${(metrics.winRate * 100).toFixed(1)}%`;
  const avgWinStr    = `+${formatMoney(metrics.averageWin)}`;
  const avgLossStr   = `-${formatMoney(Math.abs(metrics.averageLoss))}`;
  const profitFactor = metrics.profitFactor.toFixed(2);
  const maxStreak    = String(metrics.maxConsecutiveLosses);

  const highSeverityCount   = activePatterns.filter((p) => p.severity === "high").length;
  const mediumSeverityCount = activePatterns.filter((p) => p.severity === "medium").length;

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
              {dynamicPersona && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full border text-violet-400 border-violet-500/30 bg-violet-900/20">
                  {dynamicPersona.archetype}
                </span>
              )}
            </div>

            {/* Dynamic persona title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {dynamicPersona ? dynamicPersona.title : traderType}
            </h2>

            {/* Tone tags */}
            {dynamicPersona?.tone && (
              <p className="text-[11px] text-muted-foreground/50 mb-2 tracking-wide">
                {dynamicPersona.tone}
              </p>
            )}

            {/* Dynamic persona summary */}
            <p className="text-sm text-muted-foreground max-w-sm mx-auto sm:mx-0 leading-relaxed">
              {dynamicPersona ? dynamicPersona.summary : report.persona}
            </p>

            {/* Persona confidence */}
            {dynamicPersona && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 max-w-[120px] h-1 rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-violet-400/60"
                    style={{ width: `${dynamicPersona.confidence}%`, transition: "width 1s ease 0.5s" }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground/40 tabular-nums">
                  {dynamicPersona.confidence}% confidence
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-6 pt-6 border-t border-border/40">
          <StatCard label="Win Rate"         value={winRatePct} />
          <StatCard label="Avg Win / Avg Loss" value={avgWinStr} sub={avgLossStr} />
          <StatCard label="Earned per $1 Lost" value={`$${profitFactor}`} />
          <StatCard label="Worst Losing Streak" value={`${maxStreak} trades`} />
        </div>
      </div>

      {/* ── 2. Performance Dimensions ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Your Trading Scores" icon={BarChart3} />
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
      </div>

      {/* ── 3. Detected Behavioral Patterns ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Detected Behavioral Patterns" icon={AlertTriangle} />

        {activePatterns.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-400">No significant patterns detected.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your trading shows clean psychological footprints — keep doing what you're doing.
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
                    {highSeverityCount} strong {highSeverityCount === 1 ? "pattern" : "patterns"}
                  </span>
                )}
                {mediumSeverityCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {mediumSeverityCount} moderate {mediumSeverityCount === 1 ? "pattern" : "patterns"}
                  </span>
                )}
                {activePatterns.filter((p) => p.severity === "low").length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {activePatterns.filter((p) => p.severity === "low").length} minor{" "}
                    {activePatterns.filter((p) => p.severity === "low").length === 1 ? "signal" : "signals"}
                  </span>
                )}
                {!isPro && detectedPatterns.length > 2 && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                    <Lock className="w-3 h-3" />
                    +{detectedPatterns.length - 2} more in Pro
                  </span>
                )}
              </div>
            )}
            <div className="space-y-3">
              {activePatterns.map((p) => (
                <PatternCard key={p.name} pattern={p} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Pro: Emotional Escalation Detector ── */}
      {isPro && (
        <EmotionalEscalationCard report={report} />
      )}

      {/* ── Pro: Trader Archetype / Behavioral DNA ── */}
      {isPro && (
        <TraderArchetypeCard data={archetypeDNA} />
      )}

      {/* ── Pro: Behavior Timeline ── */}
      {isPro && (
        <BehaviorTimeline report={report} />
      )}

      {/* ── Pro: Session Intelligence ── */}
      {isPro && sessionIntelligence && (
        <SessionIntelligenceCard data={sessionIntelligence} />
      )}

      {/* ── Pro: Execution Heatmap ── */}
      {isPro && (
        <SessionHeatmap data={sessionIntelligence} />
      )}

      {/* ── Pro: Cross-Market Intelligence ── */}
      {isPro && crossMarketIntelligence && (
        <CrossMarketCard data={crossMarketIntelligence} />
      )}

      {/* ── Pro: Behavior Evolution ── */}
      {isPro && (
        <BehaviorEvolutionCard currentReport={report} />
      )}

      {/* ── Pro: Smart Alerts ── */}
      {isPro && smartAlerts.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Smart Alerts</h3>
            <span className="ml-auto text-[10px] text-muted-foreground/50 uppercase tracking-widest">AI-generated</span>
          </div>
          <div className="space-y-2.5">
            {smartAlerts.map(({ type, message }, i) => {
              const meta = ALERT_META[type] ?? ALERT_META.insight;
              const Icon = meta.Icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl px-4 py-3 border"
                  style={{ background: meta.bg, borderColor: meta.border }}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: meta.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-widest mr-2" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-foreground/80 leading-relaxed">{message}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Pro: Behavioral Intelligence (Wow Moments) ── */}
      {isPro && (
        <WowMoments report={report} />
      )}

      {/* ── 4. Key Strengths ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="What You're Doing Well" icon={CheckCircle2} />
        <ul className="space-y-2.5">
          {activeStrengths.map((s) => (
            <StrengthItem key={s} text={s} />
          ))}
        </ul>
      </div>

      {/* ── 5. Risk Weaknesses ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Where You're Losing Ground" icon={XCircle} />
        {activeWeaknesses.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">
              No critical issues found. Focus on staying consistent.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {activeWeaknesses.map((w) => (
              <WeaknessItem key={w} text={w} />
            ))}
          </ul>
        )}
      </div>

      {/* ── 6. Action Plan ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Your Action Plan" icon={Zap} />
        <p className="text-xs text-muted-foreground mb-4 -mt-1">
          Specific steps based on your trading data — not generic advice. Start with step 1.
        </p>
        <ol className="space-y-2.5">
          {activeActions.map((item, i) => (
            <ActionItem key={i} index={i + 1} text={item} />
          ))}
        </ol>
      </div>

      {/* ── 7. Locked Pro feature teasers (Free only) ── */}
      {!isPro && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <Lock className="w-3.5 h-3.5 text-muted-foreground/40" />
            <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
              Unlock with Pro
            </p>
          </div>
          <LockedFeatureTeaser
            title="Emotional Escalation Detector"
            description="See every revenge trade, panic exit, and overconfidence spike — with severity levels and psychological explanations."
            icon={AlertTriangle}
            accent="#ef4444"
          />
          <LockedFeatureTeaser
            title="Behavior Timeline"
            description="Replay your session as a chronological behavioral story — from the first trade to emotional drawdown and recovery."
            icon={Activity}
            accent="#06b6d4"
          />
          <LockedFeatureTeaser
            title="Execution Heatmap"
            description="See exactly when you trade well and when your discipline breaks — mapped across morning, afternoon, and late-night sessions."
            icon={BarChart3}
            accent="#f59e0b"
          />
          <LockedFeatureTeaser
            title="Behavioral Intelligence Insights"
            description="Deep pattern analysis that tells you exactly why your best trades happen — and what's silently suppressing your results."
            icon={Sparkles}
            accent="#a78bfa"
          />
          <LockedFeatureTeaser
            title="Unlock Behavioral DNA in Pro"
            description="See your full psychological execution profile, edge profile, and trader archetype signals."
            icon={Dna}
            accent="#a78bfa"
          />
          <LockedFeatureTeaser
            title="Track Your Progress Over Time"
            description="Compare behavioral scores across multiple assessments and watch how your discipline evolves."
            icon={TrendingUp}
            accent="#06b6d4"
          />
        </div>
      )}

      {/* ── 8. Disclaimer ── */}
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

      {/* ── Actions (Free only) ── */}
      {!isPro && (
        <div className="flex flex-col sm:flex-row gap-3 pb-2">
          <Button onClick={onReset} variant="outline" className="flex-1 h-12">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full h-12 glow-primary">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade for Full Intelligence
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
