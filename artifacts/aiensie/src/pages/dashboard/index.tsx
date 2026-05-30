import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, FileText, Upload, ArrowUpRight, ArrowRight,
  AlertTriangle, CheckCircle2, Lock, Zap, Brain, Dna,
  ChevronRight, Printer, TrendingDown, Info,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  MOCK_USER, MOCK_REPORTS, SCORE_TREND,
} from "@/components/dashboard/mock-data";
import { MarketFilter, ActiveMarket } from "@/components/dashboard/market-filter";
import { Button } from "@/components/ui/button";

function ScoreMiniRing({ score }: { score: number }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => { const t = setTimeout(() => setProgress(score), 100); return () => clearTimeout(t); }, [score]);
  const R = 44;
  const circ = 2 * Math.PI * R;
  const offset = circ - (progress / 100) * circ;
  const color = score >= 80 ? "#10b981" : score >= 65 ? "#06b6d4" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="56" cy="56" r={R} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)", filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-primary">{payload[0].value}<span className="text-muted-foreground font-normal">/100</span></p>
    </div>
  );
}

const SMART_ALERTS = [
  { type: "warning",     message: "Revenge trading frequency increased this week. Review trades placed within 10 minutes of a loss." },
  { type: "improvement", message: "Position sizing consistency improved across your last 3 assessments." },
  { type: "insight",     message: "Emotional control scores are consistently lower during high-volatility sessions — a recurring pattern worth addressing." },
  { type: "improvement", message: "Risk consistency improved this month. Your risk/reward ratios are stabilising." },
  { type: "critical",    message: "Crypto behavior shows more impulsive entries on volatile days. Consider setting a hard trade limit." },
];

const ALERT_META: Record<string, { color: string; bg: string; border: string; label: string; Icon: React.ElementType }> = {
  improvement: { color: "#10b981", bg: "oklch(0.13 0.02 160 / 0.5)",  border: "rgba(16,185,129,0.18)",  label: "Improvement", Icon: CheckCircle2  },
  warning:     { color: "#f59e0b", bg: "oklch(0.13 0.02 60 / 0.5)",   border: "rgba(245,158,11,0.18)",   label: "Warning",     Icon: AlertTriangle  },
  critical:    { color: "#ef4444", bg: "oklch(0.13 0.02 20 / 0.5)",   border: "rgba(239,68,68,0.18)",    label: "Critical",    Icon: TrendingDown   },
  insight:     { color: "#38bdf8", bg: "oklch(0.13 0.015 220 / 0.5)", border: "rgba(56,189,248,0.18)",   label: "Insight",     Icon: Info           },
};

export default function DashboardOverview() {
  const [market, setMarket] = useState<ActiveMarket>("All");

  const filteredReports = market === "All"
    ? MOCK_REPORTS
    : MOCK_REPORTS.filter((r) => r.assetClass === market);

  const hasReports = filteredReports.length > 0;
  const latest   = hasReports ? filteredReports[filteredReports.length - 1] : null;
  const previous = hasReports && filteredReports.length > 1 ? filteredReports[filteredReports.length - 2] : null;
  const delta    = latest && previous ? latest.aiensieScore - previous.aiensieScore : 0;
  const isProUser = MOCK_USER.plan === "pro";

  const filteredTrend = filteredReports.map((r) => ({
    label: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: r.aiensieScore,
  }));

  const kpis = [
    { label: "Total Reports",  value: String(filteredReports.length), icon: FileText,   color: "#06b6d4" },
    { label: "Average Score",  value: filteredReports.length > 0 ? String(Math.round(filteredReports.reduce((s, r) => s + r.aiensieScore, 0) / filteredReports.length)) : "—", icon: TrendingUp, color: "#10b981" },
    { label: "Best Score",     value: filteredReports.length > 0 ? String(Math.max(...filteredReports.map(r => r.aiensieScore))) : "—", icon: ArrowUpRight, color: "#a78bfa" },
    { label: "This Month",     value: `${filteredReports.filter(r => r.date.startsWith("2024-05")).length} uploads`, icon: Upload, color: "#f59e0b" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-5 max-w-6xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Welcome back, {MOCK_USER.name.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/assessment">
            <Button size="sm" className="gap-2 rounded-xl">
              <Upload className="w-4 h-4" /> New Assessment
            </Button>
          </Link>
        </div>

        {/* ── Market Filters ── */}
        <MarketFilter value={market} onChange={setMarket} />

        {/* ── Empty state ── */}
        {!hasReports && (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-sm font-medium text-foreground mb-1">No {market} reports yet</p>
            <p className="text-xs text-muted-foreground">Upload a {market.toLowerCase()} trade history to see your overview.</p>
          </div>
        )}

        {hasReports && latest && (
          <>
            {/* ── Latest Score Hero ── */}
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <ScoreMiniRing score={latest.aiensieScore} />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                      {latest.label}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                      {latest.exchange} · {latest.assetClass}
                    </span>
                    {previous && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                        delta >= 0 ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40"
                                   : "text-red-400 bg-red-950/40 border border-red-800/40"
                      }`}>
                        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pts from last report
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{latest.traderType}</h2>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md leading-relaxed">{latest.persona}</p>

                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="flex items-start gap-2 text-xs text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{latest.mainStrength}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{latest.mainWeakness}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <Link href={`/dashboard/reports/${latest.id}`}>
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl w-full">
                      View Full Report <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl text-xs text-muted-foreground hover:text-foreground w-full"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-3.5 h-3.5" /> Export PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {kpis.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            {/* ── Score Trend ── */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Aiensie Score — Progress</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Your score across {filteredReports.length} {market === "All" ? "" : market + " "}assessments</p>
                </div>
                {filteredReports.length > 1 && (
                  <span className="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/30 px-2 py-1 rounded-full">
                    +{latest.aiensieScore - filteredReports[0].aiensieScore} pts overall
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={filteredTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[40, 100]} tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5}
                    dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }}
                    activeDot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "rgba(6,182,212,0.3)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── Smart Alerts ── */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Smart Alerts</h3>
                <span className="ml-auto text-[10px] text-muted-foreground/50 uppercase tracking-widest">AI-generated · updated daily</span>
              </div>
              <div className="space-y-2.5">
                {SMART_ALERTS.map(({ type, message }, i) => {
                  const meta = ALERT_META[type];
                  const Icon = meta.Icon;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl px-4 py-3 border"
                      style={{ background: meta.bg, borderColor: meta.border }}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: meta.color }} />
                      <div className="flex-1 min-w-0">
                        <span
                          className="text-[10px] font-bold uppercase tracking-widest mr-2"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <span className="text-xs text-foreground/80 leading-relaxed">{message}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Weekly AI Coaching ── */}
            <div className="rounded-2xl p-6 border border-cyan-500/20 relative overflow-hidden"
                 style={{ background: "linear-gradient(135deg, oklch(0.12 0.015 220 / 0.95), oklch(0.1 0.01 250 / 0.95))", boxShadow: "0 0 40px oklch(0.7 0.15 200 / 0.06) inset" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 90% 10%, oklch(0.7 0.18 200 / 0.07), transparent)" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-cyan-500/25" style={{ background: "oklch(0.7 0.15 200 / 0.12)" }}>
                    <Brain className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest">Weekly AI Coaching</p>
                    <p className="text-sm font-semibold text-foreground">Personalized behavioral analysis</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-xl p-4 border border-emerald-500/15" style={{ background: "oklch(0.15 0.015 160 / 0.4)" }}>
                    <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mb-3">Strengths</p>
                    <ul className="space-y-2.5">
                      {[
                        "Trade patience has improved — you're waiting for cleaner setups.",
                        "Risk consistency is stabilising across different market conditions.",
                      ].map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl p-4 border border-amber-500/15" style={{ background: "oklch(0.15 0.015 60 / 0.4)" }}>
                    <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-3">Areas to Watch</p>
                    <ul className="space-y-2.5">
                      {[
                        "Emotional re-entries still appear after losing trades.",
                        "Position sizing tends to expand during volatile sessions.",
                      ].map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl p-4 border border-cyan-500/15" style={{ background: "oklch(0.15 0.015 210 / 0.4)" }}>
                    <p className="text-[10px] font-bold text-cyan-400/60 uppercase tracking-widest mb-3">Focus This Week</p>
                    <div className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        After any losing trade, wait at least 15 minutes before re-entering. Let the emotion clear before the next decision.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Behavioral DNA ── */}
            <div className="rounded-2xl p-6 border border-violet-500/20 relative overflow-hidden"
                 style={{ background: "linear-gradient(135deg, oklch(0.12 0.015 280 / 0.95), oklch(0.1 0.01 260 / 0.95))", boxShadow: "0 0 40px oklch(0.65 0.2 280 / 0.05) inset" }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 50% 50% at 10% 90%, oklch(0.65 0.2 280 / 0.06), transparent)" }} />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-violet-500/25" style={{ background: "oklch(0.65 0.2 280 / 0.12)" }}>
                    <Dna className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-violet-400/70 uppercase tracking-widest">Behavioral DNA</p>
                    <p className="text-sm font-semibold text-foreground">Your psychological execution profile</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { signal: "You perform best in low-frequency, high-conviction environments. Overtrading consistently degrades your edge.", strength: 92 },
                    { signal: "Execution quality declines during impulsive sessions — your fastest decisions are rarely your best.", strength: 78 },
                    { signal: "Your strongest edge emerges during structured, trend-following conditions with clear entry criteria.", strength: 85 },
                    { signal: "Emotional decision-making intensifies in high-frequency sessions. Fewer trades tend to produce better outcomes.", strength: 71 },
                  ].map(({ signal, strength }, i) => (
                    <div key={i} className="rounded-xl p-4 border border-white/6 hover:border-violet-500/20 transition-colors"
                         style={{ background: "oklch(0.13 0.01 270 / 0.6)" }}>
                      <p className="text-xs text-foreground/85 leading-relaxed mb-3">{signal}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-white/8">
                          <div className="h-full rounded-full transition-all duration-700"
                               style={{ width: `${strength}%`, background: "linear-gradient(90deg, oklch(0.65 0.2 280), oklch(0.7 0.15 200))" }} />
                        </div>
                        <span className="text-[10px] font-bold text-violet-400/70 tabular-nums">{strength}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Bottom row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Recent Reports */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Recent Reports</h3>
                  <Link href="/dashboard/reports" className="text-xs text-primary hover:text-primary/80 transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {filteredReports.slice(-3).reverse().map((r) => {
                    const scoreColor = r.aiensieScore >= 70 ? "#10b981" : r.aiensieScore >= 55 ? "#06b6d4" : "#f59e0b";
                    return (
                      <Link key={r.id} href={`/dashboard/reports/${r.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:border-border transition-all cursor-pointer">
                          <div className="w-9 h-9 rounded-xl border border-border/40 bg-card/80 flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums" style={{ color: scoreColor }}>
                            {r.aiensieScore}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground/90 truncate">{r.traderType}</p>
                            <p className="text-[11px] text-muted-foreground">{r.exchange} · {r.assetClass} · {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {r.tradeCount} trades</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                style={{ color: scoreColor, background: `${scoreColor}15`, borderColor: `${scoreColor}40` }}>
                            {r.label}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Coaching insight / free upsell */}
              <div className="space-y-3">
                {/* Main focus */}
                <div className="glass rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">This Month's Focus</p>
                  <p className="text-sm font-semibold text-amber-400 mb-1">⚠ {latest.mainWeakness}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{latest.actionPlan[0]}</p>
                </div>

                {/* Best improvement */}
                <div className="glass rounded-2xl p-5">
                  <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Best Improvement</p>
                  <p className="text-sm font-semibold text-emerald-400 mb-1">✓ {latest.mainStrength}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your score improved {latest.aiensieScore - filteredReports[0].aiensieScore} points since your first assessment.
                  </p>
                </div>

                {/* Free user upsell */}
                {!isProUser && (
                  <div className="rounded-2xl p-5 border border-primary/20 relative overflow-hidden"
                       style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 250 / 0.06), oklch(0.65 0.2 170 / 0.06))" }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Unlock Pro Features</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Unlimited assessments, saved reports, PDF export, and historical trend tracking.
                        </p>
                        <Link href="/dashboard/upgrade">
                          <Button size="sm" className="gap-1.5 rounded-lg mt-3 h-8 text-xs">
                            <Zap className="w-3.5 h-3.5" /> Upgrade to Pro
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
