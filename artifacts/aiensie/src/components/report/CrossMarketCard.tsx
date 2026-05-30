import { motion } from "framer-motion";
import { Globe, TrendingUp, AlertTriangle, Lightbulb, Star } from "lucide-react";
import type { CrossMarketIntelligence, CrossMarketInsight, CrossMarketInsightType } from "@workspace/aiensie-engine";

interface Props {
  data: CrossMarketIntelligence;
}

const INSIGHT_META: Record<CrossMarketInsightType, { color: string; bg: string; border: string; Icon: React.ElementType; label: string }> = {
  strength:       { color: "#10b981", bg: "oklch(0.13 0.02 160 / 0.45)", border: "rgba(16,185,129,0.18)",  Icon: Star,          label: "Strength"       },
  risk:           { color: "#f59e0b", bg: "oklch(0.13 0.02 60 / 0.45)",  border: "rgba(245,158,11,0.18)",  Icon: AlertTriangle, label: "Risk"           },
  comparison:     { color: "#38bdf8", bg: "oklch(0.13 0.015 220 / 0.45)",border: "rgba(56,189,248,0.18)",  Icon: TrendingUp,    label: "Cross-Market"   },
  recommendation: { color: "#a78bfa", bg: "oklch(0.13 0.02 280 / 0.45)", border: "rgba(167,139,250,0.18)", Icon: Lightbulb,     label: "Recommendation" },
};

function InsightRow({ insight, index }: { insight: CrossMarketInsight; index: number }) {
  const meta = INSIGHT_META[insight.type];
  const Icon = meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.4 }}
      className="rounded-xl px-4 py-3.5 border flex items-start gap-3"
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
        <span className="text-xs text-foreground/80 leading-relaxed">{insight.text}</span>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <span className="text-[9px] font-bold tabular-nums" style={{ color: meta.color }}>
          {insight.confidence}%
        </span>
        <div className="w-10 h-0.5 rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: meta.color }}
            initial={{ width: 0 }}
            animate={{ width: `${insight.confidence}%` }}
            transition={{ delay: 0.3 + index * 0.08, duration: 0.6 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function CrossMarketCard({ data }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl border border-sky-500/20 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.12 0.015 220 / 0.95), oklch(0.1 0.01 240 / 0.95))",
        boxShadow: "0 0 40px oklch(0.65 0.15 220 / 0.05) inset",
      }}
    >
      {/* ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 55% 40% at 95% 5%, oklch(0.65 0.18 200 / 0.07), transparent)" }}
      />

      <div className="relative z-10 p-6">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-sky-500/25"
              style={{ background: "oklch(0.65 0.15 220 / 0.12)" }}
            >
              <Globe className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-sky-500/70 uppercase tracking-widest">Cross-Market Intelligence</p>
              <p className="text-sm font-semibold text-foreground">Behavioral profile for this market class</p>
            </div>
          </div>
          <div
            className="rounded-lg px-2.5 py-1 border border-sky-500/20 text-[10px] font-bold text-sky-400 uppercase tracking-widest"
            style={{ background: "oklch(0.65 0.15 220 / 0.1)" }}
          >
            {data.assetClass}
          </div>
        </div>

        {/* ── Market profile summary ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4 mb-4 border border-white/6"
          style={{ background: "oklch(0.13 0.01 220 / 0.55)" }}
        >
          <p className="text-[10px] font-bold text-sky-400/60 uppercase tracking-widest mb-2">Market Profile</p>
          <p className="text-xs text-foreground/75 leading-relaxed">{data.marketProfile}</p>
        </motion.div>

        {/* ── Execution + Primary Risk row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl p-4 border border-emerald-500/12"
            style={{ background: "oklch(0.13 0.015 160 / 0.4)" }}
          >
            <p className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mb-2">Execution Style</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{data.executionStyle}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-4 border border-amber-500/12"
            style={{ background: "oklch(0.13 0.015 60 / 0.4)" }}
          >
            <p className="text-[10px] font-bold text-amber-400/60 uppercase tracking-widest mb-2">Primary Behavioral Risk</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{data.primaryRisk}</p>
          </motion.div>
        </div>

        {/* ── Behavioral note ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="rounded-xl p-3.5 mb-5 border border-white/5 flex items-start gap-2.5"
          style={{ background: "oklch(0.12 0.008 220 / 0.6)" }}
        >
          <Lightbulb className="w-3.5 h-3.5 text-sky-400/60 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/60 leading-relaxed italic">{data.behavioralNote}</p>
        </motion.div>

        {/* ── Insights ── */}
        <div>
          <p className="text-[10px] font-bold text-sky-400/50 uppercase tracking-widest mb-3">Behavioral Intelligence</p>
          <div className="space-y-2.5">
            {data.insights.map((insight, i) => (
              <InsightRow key={i} insight={insight} index={i} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
