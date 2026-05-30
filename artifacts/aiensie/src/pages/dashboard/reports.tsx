import { useState } from "react";
import { Link } from "wouter";
import { FileText, Search, Lock, Zap, Calendar, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MOCK_REPORTS, MOCK_USER } from "@/components/dashboard/mock-data";
import { Button } from "@/components/ui/button";

const SEVERITY_COLOR: Record<string, string> = {
  high:   "#ef4444",
  medium: "#f59e0b",
  low:    "#10b981",
};

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const isProUser = MOCK_USER.plan === "pro";

  const filtered = MOCK_REPORTS.filter((r) =>
    r.exchange.toLowerCase().includes(search.toLowerCase()) ||
    r.traderType.toLowerCase().includes(search.toLowerCase()) ||
    r.label.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  function scoreColor(s: number) {
    return s >= 70 ? "#10b981" : s >= 55 ? "#06b6d4" : s >= 40 ? "#f59e0b" : "#ef4444";
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl space-y-5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Assessment Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{MOCK_REPORTS.length} reports · all time</p>
          </div>
          <Link href="/assessment">
            <Button size="sm" className="gap-2 rounded-xl">
              <Upload className="w-4 h-4" /> New Assessment
            </Button>
          </Link>
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by exchange, type, or label…"
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border/50 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* ── Reports grid ── */}
        <div className="space-y-3">
          {filtered.map((r, idx) => {
            const locked = !isProUser && idx >= 1;
            const color  = scoreColor(r.aiensieScore);

            return (
              <div key={r.id} className={`relative glass rounded-2xl overflow-hidden transition-all ${!locked ? "hover:border-border" : "opacity-70"}`}>
                {locked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
                       style={{ background: "oklch(0.09 0.005 280 / 0.85)", backdropFilter: "blur(4px)" }}>
                    <Lock className="w-5 h-5 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground mb-0.5">Pro feature</p>
                    <p className="text-xs text-muted-foreground mb-3">Upgrade to access all reports</p>
                    <Link href="/dashboard/upgrade">
                      <Button size="sm" className="gap-1.5 h-7 text-xs rounded-lg">
                        <Zap className="w-3 h-3" /> Upgrade
                      </Button>
                    </Link>
                  </div>
                )}

                <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Score */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl border border-border/40 bg-card/60 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold tabular-nums" style={{ color }}>{r.aiensieScore}</span>
                    <span className="text-[9px] text-muted-foreground">/100</span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-foreground">{r.traderType}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                            style={{ color, background: `${color}15`, borderColor: `${color}40` }}>
                        {r.label}
                      </span>
                      {r.patterns.length === 0 && (
                        <span className="text-[10px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full">
                          Clean Profile
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />
                        {new Date(r.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{r.exchange}</span>
                      <span>{r.tradeCount} trades</span>
                    </div>

                    {/* Patterns row */}
                    {r.patterns.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.patterns.map((p) => (
                          <span key={p.name} className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                                style={{ color: SEVERITY_COLOR[p.severity], background: `${SEVERITY_COLOR[p.severity]}15`, borderColor: `${SEVERITY_COLOR[p.severity]}40` }}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  <div className="hidden lg:flex items-center gap-6 text-center flex-shrink-0">
                    <div>
                      <p className="text-base font-semibold text-foreground tabular-nums">{(r.winRate * 100).toFixed(0)}%</p>
                      <p className="text-[10px] text-muted-foreground">Win Rate</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground tabular-nums">{r.profitFactor.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">Profit Factor</p>
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/dashboard/reports/${r.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl flex-shrink-0 text-xs">
                      View Report
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Free limit notice */}
        {!isProUser && (
          <div className="rounded-2xl p-4 border border-primary/20 flex items-center gap-4"
               style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 250 / 0.06), oklch(0.65 0.2 170 / 0.06))" }}>
            <Zap className="w-5 h-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Free plan: 1 report visible</p>
              <p className="text-xs text-muted-foreground">Upgrade to Pro for unlimited saved reports and PDF export.</p>
            </div>
            <Link href="/dashboard/upgrade">
              <Button size="sm" className="rounded-xl h-8 text-xs gap-1.5">
                Upgrade <Zap className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
