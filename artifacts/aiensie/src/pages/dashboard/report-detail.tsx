import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, ChevronRight, BarChart3, Brain, Zap, Printer } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MOCK_REPORTS } from "@/components/dashboard/mock-data";
import { getSavedReportById, savedReportToMockReport } from "@/lib/report-store";
import { Button } from "@/components/ui/button";

const DIMENSIONS = [
  { key: "discipline"        as const, label: "Discipline",        color: "#06b6d4" },
  { key: "riskControl"       as const, label: "Risk Control",       color: "#10b981" },
  { key: "consistency"       as const, label: "Trading Stability",  color: "#f59e0b" },
  { key: "emotionalStability"as const, label: "Emotional Control",  color: "#a78bfa" },
  { key: "decisionQuality"   as const, label: "Trade Quality",      color: "#38bdf8" },
];

function scoreLabel(s: number) {
  if (s >= 85) return "Elite";
  if (s >= 70) return "Strong";
  if (s >= 50) return "Stable";
  if (s >= 30) return "Developing";
  return "Weak";
}

function DimBar({ label, score, color }: { label: string; score: number; color: string }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(score), 120); return () => clearTimeout(t); }, [score]);
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-medium text-foreground/90">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/60">{scoreLabel(score)}</span>
            <span className="text-sm font-semibold tabular-nums" style={{ color }}>
              {score}<span className="text-muted-foreground text-xs font-normal">/100</span>
            </span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/5">
          <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, boxShadow: `0 0 6px ${color}60`, transition: "width 1s ease" }} />
        </div>
      </div>
    </div>
  );
}

function formatMoney(n: number) {
  const a = Math.abs(n);
  return a >= 10000 ? `$${(a/1000).toFixed(1)}k` : a >= 100 ? `$${Math.round(a)}` : `$${a.toFixed(2)}`;
}

const SEVERITY_CONFIG = {
  high:   { bg: "bg-red-950/50",   border: "border-red-800/40",   text: "text-red-400",   badge: "Strong"   },
  medium: { bg: "bg-amber-950/50", border: "border-amber-800/40", text: "text-amber-400", badge: "Moderate" },
  low:    { bg: "bg-emerald-950/50",border:"border-emerald-800/40",text:"text-emerald-400",badge: "Minor"    },
};

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const savedLookup = params.id ? getSavedReportById(params.id) : null;
  const report =
    savedLookup
      ? savedReportToMockReport(savedLookup)
      : MOCK_REPORTS.find((r) => r.id === params.id);

  if (!report) {
    return (
      <DashboardLayout>
        <div className="p-6 flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Report not found.</p>
          <Link href="/dashboard/reports"><Button variant="outline" size="sm">Back to Reports</Button></Link>
        </div>
      </DashboardLayout>
    );
  }

  const scoreColor = report.aiensieScore >= 70 ? "#10b981" : report.aiensieScore >= 55 ? "#06b6d4" : report.aiensieScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl space-y-5">

        {/* ── Back + meta + Export ── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/reports">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Reports
              </button>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs text-muted-foreground">
              {new Date(report.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl text-xs h-8 flex-shrink-0"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" /> Export PDF
          </Button>
        </div>

        {/* ── Score header ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Ring */}
            <div className="w-24 h-24 flex-shrink-0 relative">
              <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="48" cy="48" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                <circle cx="48" cy="48" r="38" fill="none" stroke={scoreColor} strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 38}
                  strokeDashoffset={2 * Math.PI * 38 * (1 - report.aiensieScore / 100)}
                  style={{ filter: `drop-shadow(0 0 5px ${scoreColor}80)` }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: scoreColor }}>{report.aiensieScore}</span>
                <span className="text-[9px] text-muted-foreground">/100</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary border border-primary/30">
                  {report.label}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                  {report.exchange} · {report.assetClass}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border/60 text-muted-foreground">
                  {report.tradeCount} trades
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{report.traderType}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{report.persona}</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6 pt-5 border-t border-border/40">
            {[
              { label: "Win Rate",          value: `${(report.winRate * 100).toFixed(1)}%` },
              { label: "Avg Win / Avg Loss", value: `+${formatMoney(report.avgWin)}`, sub: `-${formatMoney(Math.abs(report.avgLoss))}` },
              { label: "Earned per $1 Lost", value: `$${report.profitFactor.toFixed(2)}` },
              { label: "Worst Loss Streak",  value: `${report.maxLossStreak} trades` },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-card/60 rounded-xl border border-border/40 p-3 text-center">
                <p className="text-lg font-semibold text-foreground tabular-nums leading-tight">{value}</p>
                {sub && <p className="text-xs text-muted-foreground/70 tabular-nums">{sub}</p>}
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dimension scores ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Trading Scores</h3>
          </div>
          <div className="space-y-4">
            {DIMENSIONS.map(({ key, label, color }) => (
              <DimBar key={key} label={label} score={report.scores[key]} color={color} />
            ))}
          </div>
        </div>

        {/* ── Behavioral Patterns ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Detected Behavioral Patterns</h3>
          </div>
          {report.patterns.length === 0 ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-400">No significant patterns detected.</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your trading shows clean psychological footprints — keep doing what you're doing.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {report.patterns.map((p) => {
                const s = SEVERITY_CONFIG[p.severity];
                return (
                  <div key={p.name} className={`rounded-xl border p-4 ${s.bg} ${s.border}`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-sm font-semibold ${s.text}`}>{p.name}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${s.text}`}
                            style={{ background: `${s.text === "text-red-400" ? "rgb(127 29 29 / 0.4)" : s.text === "text-amber-400" ? "rgb(120 53 15 / 0.4)" : "rgb(6 78 59 / 0.4)"}` }}>
                        {s.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Strengths / Weaknesses ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">What You're Doing Well</h3>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/85 leading-relaxed">{report.mainStrength}</span>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-4 h-4 text-red-400" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Where to Improve</h3>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-red-950/20 border border-red-900/25">
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-foreground/85 leading-relaxed">{report.mainWeakness}</span>
            </div>
          </div>
        </div>

        {/* ── Action Plan ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Action Plan</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Specific steps based on your trading data.</p>
          <ol className="space-y-2.5">
            {report.actionPlan.map((item, i) => (
              <li key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card/60 border border-border/40 hover:border-primary/30 transition-colors">
                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/85 leading-relaxed flex-1">{item}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
              </li>
            ))}
          </ol>
        </div>

        {/* ── Disclaimer ── */}
        <p className="text-[10px] text-muted-foreground/40 text-center leading-relaxed pb-2">
          Aiensie Score is a behavioral assessment tool and does not constitute financial advice.
          Past performance is not indicative of future results. For educational purposes only.
        </p>
      </div>
    </DashboardLayout>
  );
}
