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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiensieReport, AiensieScores, DetectedPattern } from "@workspace/aiensie-engine";
import { SessionIntelligenceCard }  from "@/components/report/SessionIntelligenceCard";
import { TraderArchetypeCard }      from "@/components/report/TraderArchetypeCard";
import { BehaviorEvolutionCard }    from "@/components/report/BehaviorEvolutionCard";
import CrossMarketCard              from "@/components/report/CrossMarketCard";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScoreReportProps {
  report: AiensieReport;
  exchange: string;
  tradeCount: number;
  onReset: () => void;
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

// ── Smart Summary Card ────────────────────────────────────────────────────────

function SmartSummaryCard({ report }: { report: AiensieReport }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { aiensieScore, scores, metrics, detectedPatterns, smartSummary } = report;

  // Block 1 — Smart summary (behavior-conditional)
  // Block 2 — Main Risk
  const topPattern =
    detectedPatterns.find((p) => p.severity === "high") ??
    detectedPatterns.find((p) => p.severity === "medium") ??
    detectedPatterns[0];

  let riskText: string;
  if (topPattern) {
    const name = topPattern.name;
    riskText =
      name === "Revenge Trading Risk"       ? "Revenge trading is your most active risk. Re-entering after losses is driven by emotion, not edge." :
      name === "Holding Losses Too Long"    ? "Holding losers too long is compressing your results. Cutting losses faster would shift your numbers meaningfully." :
      name === "Overconfidence After Wins"  ? "Overconfidence after winning streaks is increasing your exposure at exactly the wrong moment." :
      name === "Overtrading"                ? `Trading too frequently at ${metrics.tradesPerActiveDay.toFixed(1)} trades/day is diluting your edge. Selectivity compounds.` :
      name === "Erratic Position Sizing"    ? "Inconsistent sizing means results depend more on luck than process. A fixed risk-per-trade rule fixes this immediately." :
      name === "Reliance on a Few Big Wins" ? "Your results lean heavily on a handful of large wins. The edge may be less repeatable than it appears." :
                                              topPattern.description;
  } else {
    const dimScores: [keyof AiensieScores, string][] = [
      ["disciplineScore",         "No major patterns detected. Greater trade selectivity is your highest-leverage next step."],
      ["riskControlScore",        "No major patterns detected. Improving your win-to-loss size ratio is the key adjustment."],
      ["consistencyScore",        "No major patterns detected. A more repeatable process would stabilize your results significantly."],
      ["emotionalStabilityScore", "No major patterns detected. Structured post-loss rules would reduce emotional variance in decisions."],
      ["decisionQualityScore",    "No major patterns detected. Entry and exit refinement is the clearest path to improvement."],
    ];
    const weakest = dimScores.reduce(
      (min, curr) => scores[curr[0]] < scores[min[0]] ? curr : min,
      dimScores[0],
    );
    riskText = weakest[1];
  }

  const coachText =
    aiensieScore >= 70 ? "The gap between here and consistently strong is narrow — stay process-focused and don't optimise for recent results." :
    aiensieScore >= 50 ? "The issues are specific, not systemic. One or two targeted changes can shift the trajectory quickly." :
                         "Start with process, not outcomes. Getting sizing and loss management right changes everything else downstream.";

  const blocks = [
    { title: "Behavioral Assessment", text: smartSummary },
    { title: "Main Risk",             text: riskText     },
    { title: "Coaching Insight",      text: coachText    },
  ];

  return (
    <div ref={ref} className="glass rounded-2xl p-6 overflow-hidden">
      <SectionHeader label="Behavioral Intelligence Summary" icon={Brain} />

      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div
            key={block.title}
            className="rounded-xl bg-card/50 border border-border/40 p-4"
            style={{
              opacity:    visible ? 1 : 0,
              transform:  visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.45s ease ${i * 120}ms, transform 0.45s ease ${i * 120}ms`,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-1.5">
              {block.title}
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">{block.text}</p>
          </div>
        ))}
      </div>

      <div
        className="mt-4 pt-4 border-t border-border/30 flex items-center gap-2"
        style={{
          opacity:    visible ? 1 : 0,
          transition: `opacity 0.45s ease ${blocks.length * 120 + 80}ms`,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
        <p className="text-[11px] text-muted-foreground/50 tracking-wide">
          Generated from {metrics.totalTrades} trades · Aiensie Behavioral Engine
        </p>
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

// ── Main component ────────────────────────────────────────────────────────────

export function ScoreReport({ report, exchange, tradeCount, onReset }: ScoreReportProps) {
  const topRef = useRef<HTMLDivElement>(null);
  const {
    aiensieScore, label, traderType, dynamicPersona,
    scores, metrics, detectedPatterns, strengths, weaknesses, actionPlan,
    sessionIntelligence, archetypeDNA, crossMarketIntelligence,
  } = report;

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const winRatePct   = `${(metrics.winRate * 100).toFixed(1)}%`;
  const avgWinStr    = `+${formatMoney(metrics.averageWin)}`;
  const avgLossStr   = `-${formatMoney(Math.abs(metrics.averageLoss))}`;
  const profitFactor = metrics.profitFactor.toFixed(2);
  const maxStreak    = String(metrics.maxConsecutiveLosses);

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

      {/* ── 3. Behavioral Intelligence Summary (Smart) ── */}
      <SmartSummaryCard report={report} />

      {/* ── 4. Detected Behavioral Patterns ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Detected Behavioral Patterns" icon={AlertTriangle} />

        {detectedPatterns.length === 0 ? (
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
                {detectedPatterns.filter((p) => p.severity === "low").length > 0 && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {detectedPatterns.filter((p) => p.severity === "low").length} minor {detectedPatterns.filter((p) => p.severity === "low").length === 1 ? "signal" : "signals"}
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

      {/* ── 5. Session Intelligence ── */}
      {sessionIntelligence && (
        <SessionIntelligenceCard data={sessionIntelligence} />
      )}

      {/* ── 6. Behavioral DNA / Archetype ── */}
      <TraderArchetypeCard data={archetypeDNA} />

      {/* ── 7. Cross-Market Intelligence ── */}
      <CrossMarketCard data={crossMarketIntelligence} />

      {/* ── 8. Behavior Evolution ── */}
      <BehaviorEvolutionCard currentReport={report} />

      {/* ── 8. Key Strengths ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="What You're Doing Well" icon={CheckCircle2} />
        <ul className="space-y-2.5">
          {strengths.map((s) => (
            <StrengthItem key={s} text={s} />
          ))}
        </ul>
      </div>

      {/* ── 9. Risk Weaknesses ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Where You're Losing Ground" icon={XCircle} />
        {weaknesses.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm text-emerald-400">
              No critical issues found. Focus on staying consistent.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {weaknesses.map((w) => (
              <WeaknessItem key={w} text={w} />
            ))}
          </ul>
        )}
      </div>

      {/* ── 10. Personalised Action Plan ── */}
      <div className="glass rounded-2xl p-6">
        <SectionHeader label="Your Action Plan" icon={Zap} />
        <p className="text-xs text-muted-foreground mb-4 -mt-1">
          Specific steps based on your trading data — not generic advice. Start with step 1.
        </p>
        <ol className="space-y-2.5">
          {actionPlan.map((item, i) => (
            <ActionItem key={i} index={i + 1} text={item} />
          ))}
        </ol>
      </div>

      {/* ── 11. Disclaimer ── */}
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
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade for Full Intelligence
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
