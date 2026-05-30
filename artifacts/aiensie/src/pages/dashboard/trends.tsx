import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MONTHLY_DIMENSION_TREND, SCORE_TREND, MOCK_REPORTS } from "@/components/dashboard/mock-data";

const DIMENSION_COLORS: Record<string, string> = {
  "Discipline":       "#06b6d4",
  "Emotional Control":"#a78bfa",
  "Risk Control":     "#10b981",
  "Consistency":      "#f59e0b",
  "Decision Quality": "#38bdf8",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl p-3 text-xs shadow-xl space-y-1 min-w-[140px]">
      <p className="text-muted-foreground font-medium mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-primary">{payload[0].value}<span className="text-muted-foreground font-normal">/100</span></p>
    </div>
  );
}

const first = MOCK_REPORTS[0];
const last  = MOCK_REPORTS[MOCK_REPORTS.length - 1];

const IMPROVEMENTS = [
  { dim: "Discipline",        from: first.scores.discipline,         to: last.scores.discipline,         color: "#06b6d4" },
  { dim: "Risk Control",      from: first.scores.riskControl,        to: last.scores.riskControl,        color: "#10b981" },
  { dim: "Consistency",       from: first.scores.consistency,        to: last.scores.consistency,        color: "#f59e0b" },
  { dim: "Emotional Control", from: first.scores.emotionalStability, to: last.scores.emotionalStability, color: "#a78bfa" },
  { dim: "Decision Quality",  from: first.scores.decisionQuality,    to: last.scores.decisionQuality,    color: "#38bdf8" },
];

export default function TrendsPage() {
  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl space-y-5">

        {/* ── Header ── */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Behavior Trends</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            How your behavioral dimensions have evolved across {MOCK_REPORTS.length} assessments
          </p>
        </div>

        {/* ── Improvement summary ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {IMPROVEMENTS.map(({ dim, from, to, color }) => {
            const delta = to - from;
            return (
              <div key={dim} className="glass rounded-2xl p-4 text-center">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mb-1.5">{dim}</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color }}>{to}</p>
                <p className={`text-xs font-medium mt-0.5 ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {delta >= 0 ? "+" : ""}{delta} pts
                </p>
              </div>
            );
          })}
        </div>

        {/* ── Score trend ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Overall Score Progression</h3>
              <p className="text-[11px] text-muted-foreground">Aiensie score across all assessments</p>
            </div>
            <span className="ml-auto text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/30 px-2 py-1 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +{last.aiensieScore - first.aiensieScore} pts
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={SCORE_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ScoreTooltip />} />
              <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2.5}
                dot={{ fill: "#06b6d4", r: 4, strokeWidth: 0 }}
                activeDot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "rgba(6,182,212,0.3)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Dimension trend ── */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Behavioral Dimensions — Monthly</h3>
              <p className="text-[11px] text-muted-foreground">All 5 pillars tracked over time</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_DIMENSION_TREND} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(DIMENSION_COLORS).map(([name, color]) => (
                  <linearGradient key={name} id={`grad-${name.replace(/\s/g,"")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 90]} tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                formatter={(value) => <span style={{ color: "oklch(0.7 0 0)" }}>{value}</span>}
              />
              {Object.entries(DIMENSION_COLORS).map(([name, color]) => (
                <Area key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2}
                  fill={`url(#grad-${name.replace(/\s/g,"")})`} dot={false}
                  activeDot={{ fill: color, r: 4, strokeWidth: 0 }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
