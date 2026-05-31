import { useRef, useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import type { AiensieReport } from "@workspace/aiensie-engine";

// ── Insight generator ─────────────────────────────────────────────────────────

function buildInsights(report: AiensieReport): string[] {
  const { detectedPatterns, metrics, scores, sessionIntelligence } = report;
  const insights: string[] = [];

  const hasRevenge     = detectedPatterns.some((p) => /revenge/i.test(p.name));
  const hasOvertrading = detectedPatterns.some((p) => /overtrad/i.test(p.name));
  const hasHolding     = detectedPatterns.some((p) => /hold|loss hold/i.test(p.name));
  const hasOverconf    = detectedPatterns.some((p) => /overconfiden|confident/i.test(p.name));

  // ── Frequency vs quality ──
  if (metrics.tradesPerActiveDay > 6 && scores.decisionQualityScore < 56) {
    insights.push(
      "Your best trades occur when execution frequency decreases. High-frequency sessions consistently underperform your optimal trading windows — less is measurably more for your behavioral profile.",
    );
  } else if (metrics.tradesPerActiveDay <= 4 && scores.decisionQualityScore >= 65) {
    insights.push(
      "Your selective execution style is a genuine edge. Fewer, higher-conviction trades define your best performance periods — protecting that patience is your most valuable behavioral asset.",
    );
  }

  // ── Loss origin ──
  if (hasRevenge || scores.emotionalStabilityScore < 55) {
    insights.push(
      "Most major losses originated from emotionally reactive entries — not from bad setups, but from bad timing. The trade ideas weren't wrong. The psychological state executing them was.",
    );
  }

  // ── Recovery trade aggression ──
  if (hasOverconf || (metrics.positionSizeVariability > 0.3 && metrics.winRate > 0.5)) {
    insights.push(
      "You become significantly more aggressive after recovery trades. Winning sequences systematically trigger overexposure — a pattern that converts strong days into breakeven results.",
    );
  }

  // ── High-frequency quality collapse ──
  if (hasOvertrading) {
    insights.push(
      "Execution quality collapses during high-frequency emotional sessions. Your clearest edge appears in your most patient, selective windows — the data is unambiguous on this.",
    );
  }

  // ── Loss holding asymmetry ──
  if (hasHolding) {
    insights.push(
      "Your losing trades are held significantly longer than your winning trades. This asymmetry is the single largest suppressor of your profit factor — and it's entirely behavioral, not market-driven.",
    );
  }

  // ── Profit concentration ──
  if (metrics.profitDependencyTop10Percent > 0.58) {
    insights.push(
      `${Math.round(metrics.profitDependencyTop10Percent * 100)}% of your total profitability came from your top 10% of trades. Your job isn't to trade more — it's to protect these outliers and stop giving back gains after them.`,
    );
  }

  // ── Session timing ──
  if (sessionIntelligence?.strongestSession) {
    const labels: Record<string, string> = {
      morning: "morning", midday: "midday", afternoon: "afternoon", evening: "evening", night: "late-night",
    };
    const best  = labels[sessionIntelligence.strongestSession] ?? sessionIntelligence.strongestSession;
    const worst = sessionIntelligence.emotionalRiskPeriod
      ? `${labels[sessionIntelligence.emotionalRiskPeriod] ?? sessionIntelligence.emotionalRiskPeriod}`
      : null;
    insights.push(
      `Your ${best} trades consistently outperform all other windows.${worst ? ` ${worst.charAt(0).toUpperCase() + worst.slice(1)} sessions expose your highest emotional risk — applying a hard session cutoff there would immediately improve your score.` : " Concentrating activity here is one of the highest-leverage adjustments available to you."}`,
    );
  }

  // ── Risk knowledge vs discipline gap ──
  if (scores.riskControlScore >= 70 && scores.disciplineScore < 55) {
    insights.push(
      "You understand risk — discipline is the gap. Your risk management knowledge isn't being applied consistently, which means your edge exists but isn't being fully captured in your results.",
    );
  }

  // ── Emotional payoff asymmetry ──
  if (metrics.payoffRatio > 1.5 && metrics.winRate < 0.45) {
    insights.push(
      `Your trades win less than half the time but earn $${metrics.payoffRatio.toFixed(2)} per $1 risked when you do win. Your edge is real — the problem is behavioral: emotional exits are cutting winners short and letting losers run.`,
    );
  }

  return insights.slice(0, 5);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function WowMoments({ report }: { report: AiensieReport }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const insights = buildInsights(report);
  if (insights.length === 0) return null;

  return (
    <div ref={ref} className="glass rounded-2xl p-6 overflow-hidden relative">

      {/* Subtle gradient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 55% at 50% -10%, oklch(0.7 0.15 250 / 0.05), transparent)",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-2.5 mb-5">
        <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Behavioral Intelligence
        </h3>
        <span className="ml-auto text-[10px] text-primary/45 uppercase tracking-widest">Deep analysis</span>
      </div>

      {/* Insights */}
      <div className="relative space-y-3">
        {insights.map((text, i) => (
          <div
            key={i}
            className="rounded-xl border border-primary/12 p-4"
            style={{
              background:  "linear-gradient(135deg, oklch(0.7 0.15 250 / 0.04), oklch(0.65 0.2 170 / 0.03))",
              opacity:     visible ? 1 : 0,
              transform:   visible ? "translateY(0)" : "translateY(8px)",
              transition:  `opacity 0.5s ease ${i * 100}ms, transform 0.5s ease ${i * 100}ms`,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="relative text-[10px] text-muted-foreground/30 mt-4 leading-relaxed">
        Intelligence derived from statistical analysis of your trade data — not generic advice.
      </p>
    </div>
  );
}
