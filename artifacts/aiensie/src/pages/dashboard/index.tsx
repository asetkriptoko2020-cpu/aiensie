import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  TrendingUp, FileText, Upload, ArrowUpRight, ArrowRight,
  AlertTriangle, CheckCircle2, Lock, Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import {
  MOCK_USER, MOCK_REPORTS, SCORE_TREND,
} from "@/components/dashboard/mock-data";
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

export default function DashboardOverview() {
  const latest   = MOCK_REPORTS[MOCK_REPORTS.length - 1];
  const previous = MOCK_REPORTS[MOCK_REPORTS.length - 2];
  const delta    = latest.aiensieScore - previous.aiensieScore;
  const isProUser = MOCK_USER.plan === "pro";

  const kpis = [
    { label: "Total Reports",  value: String(MOCK_REPORTS.length), icon: FileText,   color: "#06b6d4" },
    { label: "Average Score",  value: String(Math.round(MOCK_REPORTS.reduce((s, r) => s + r.aiensieScore, 0) / MOCK_REPORTS.length)), icon: TrendingUp, color: "#10b981" },
    { label: "Best Score",     value: String(Math.max(...MOCK_REPORTS.map(r => r.aiensieScore))), icon: ArrowUpRight, color: "#a78bfa" },
    { label: "This Month",     value: `${MOCK_REPORTS.filter(r => r.date.startsWith("2024-05")).length} uploads`, icon: Upload, color: "#f59e0b" },
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
                  {latest.exchange}
                </span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                  delta >= 0 ? "text-emerald-400 bg-emerald-950/40 border border-emerald-800/40"
                             : "text-red-400 bg-red-950/40 border border-red-800/40"
                }`}>
                  {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)} pts from last report
                </span>
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
            <Link href={`/dashboard/reports/${latest.id}`}>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl flex-shrink-0">
                View Full Report <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
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
              <p className="text-xs text-muted-foreground mt-0.5">Your score across all {MOCK_REPORTS.length} assessments</p>
            </div>
            <span className="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/30 px-2 py-1 rounded-full">
              +{latest.aiensieScore - MOCK_REPORTS[0].aiensieScore} pts overall
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={SCORE_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
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
              {MOCK_REPORTS.slice(-3).reverse().map((r) => {
                const scoreColor = r.aiensieScore >= 70 ? "#10b981" : r.aiensieScore >= 55 ? "#06b6d4" : "#f59e0b";
                return (
                  <Link key={r.id} href={`/dashboard/reports/${r.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/40 hover:border-border transition-all cursor-pointer">
                      <div className="w-9 h-9 rounded-xl border border-border/40 bg-card/80 flex items-center justify-center flex-shrink-0 text-sm font-bold tabular-nums" style={{ color: scoreColor }}>
                        {r.aiensieScore}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground/90 truncate">{r.traderType}</p>
                        <p className="text-[11px] text-muted-foreground">{r.exchange} · {new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {r.tradeCount} trades</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border`}
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
                Your score improved {latest.aiensieScore - MOCK_REPORTS[0].aiensieScore} points since your first assessment.
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
      </div>
    </DashboardLayout>
  );
}
