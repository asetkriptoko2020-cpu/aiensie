import { Lock, Zap, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MARKET_BREAKDOWN, MOCK_USER } from "@/components/dashboard/mock-data";
import { Button } from "@/components/ui/button";

export default function MarketsPage() {
  const isProUser = MOCK_USER.plan === "pro";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl space-y-5">

        {/* ── Header ── */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Cross-Market Analysis</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Compare your behavioral patterns across asset classes
          </p>
        </div>

        {/* ── Pro gate banner ── */}
        <div className="rounded-2xl p-4 border border-primary/20 flex items-center gap-4"
             style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 250 / 0.06), oklch(0.65 0.2 170 / 0.06))" }}>
          <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Multi-market behavioral tracking</p>
            <p className="text-xs text-muted-foreground">
              Upload trade histories from different asset classes to compare your psychology across markets.
            </p>
          </div>
          {!isProUser && (
            <Link href="/dashboard/upgrade">
              <Button size="sm" className="rounded-xl h-8 text-xs gap-1.5 flex-shrink-0">
                <Zap className="w-3.5 h-3.5" /> Upgrade
              </Button>
            </Link>
          )}
        </div>

        {/* ── Market cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MARKET_BREAKDOWN.map((m) => {
            const locked = m.locked && !isProUser;
            return (
              <div key={m.market} className={`glass rounded-2xl p-5 relative overflow-hidden transition-all ${locked ? "opacity-60" : ""}`}>
                {locked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
                       style={{ background: "oklch(0.09 0.005 280 / 0.8)", backdropFilter: "blur(3px)" }}>
                    <Lock className="w-5 h-5 text-muted-foreground mb-1.5" />
                    <p className="text-xs font-semibold text-foreground mb-0.5">Pro feature</p>
                    <p className="text-[11px] text-muted-foreground mb-2.5">Upload {m.market.toLowerCase()} history to unlock</p>
                    <Link href="/dashboard/upgrade">
                      <Button size="sm" className="h-7 text-xs gap-1 rounded-lg">
                        <Zap className="w-3 h-3" /> Upgrade
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{m.market}</p>
                      <p className="text-[11px] text-muted-foreground">{m.exchanges}</p>
                    </div>
                  </div>
                  {m.reports > 0 && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      m.trend.startsWith("+") ? "text-emerald-400 bg-emerald-950/40 border-emerald-800/30" : "text-muted-foreground bg-card/60 border-border/40"
                    }`}>
                      {m.trend}
                    </span>
                  )}
                </div>

                {m.reports > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card/60 rounded-xl border border-border/40 p-3 text-center">
                      <p className="text-xl font-bold text-primary tabular-nums">{m.reports}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Reports</p>
                    </div>
                    <div className="bg-card/60 rounded-xl border border-border/40 p-3 text-center">
                      <p className="text-xl font-bold text-foreground tabular-nums">{m.avgScore}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Avg Score</p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground/60">No data yet</p>
                    <p className="text-[11px] text-muted-foreground/40 mt-0.5">Upload a {m.market.toLowerCase()} trade history to begin</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Coming soon hint ── */}
        <div className="rounded-2xl border border-border/30 p-5 text-center">
          <p className="text-sm font-medium text-foreground mb-1">More exchanges coming soon</p>
          <p className="text-xs text-muted-foreground">
            Aiensie will support direct API connections for automatic trade history sync — no CSV uploads needed.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
