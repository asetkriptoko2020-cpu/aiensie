import { AlertTriangle, TrendingDown, Zap, Scale, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const mistakes = [
  {
    icon: Zap,
    title: "Revenge Trading",
    description: "Trading impulsively after a loss to recover quickly, often leading to larger losses.",
    detection: "Detected by analyzing trade frequency and size changes post-loss",
    impact: "High",
    impactColor: "text-destructive",
    stat: "67%",
    statLabel: "of traders exhibit this behavior",
    indicators: [
      "Increased position sizes after losses",
      "Shorter time between trades after losing",
      "Deviation from normal trading patterns",
    ],
  },
  {
    icon: TrendingDown,
    title: "Overtrading",
    description: "Excessive trading driven by the urge to be in the market, regardless of opportunity quality.",
    detection: "Measured through trade frequency analysis and win-rate correlation",
    impact: "High",
    impactColor: "text-destructive",
    stat: "58%",
    statLabel: "report frequent overtrading",
    indicators: [
      "High trade volume with low selectivity",
      "Trading during low-quality setups",
      "Ignoring trading plan parameters",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Panic Exit",
    description: "Closing profitable positions too early due to fear, missing larger gains.",
    detection: "Identified by comparing exit timing to optimal profit targets",
    impact: "Medium",
    impactColor: "text-warning",
    stat: "73%",
    statLabel: "exit winners too early",
    indicators: [
      "Premature profit-taking patterns",
      "Exit at minor retracements",
      "Inconsistent hold times for winners",
    ],
  },
  {
    icon: Scale,
    title: "Emotional Sizing",
    description: "Adjusting position sizes based on emotions rather than risk management rules.",
    detection: "Analyzed through position size variance and correlation with recent P&L",
    impact: "High",
    impactColor: "text-destructive",
    stat: "52%",
    statLabel: "size positions emotionally",
    indicators: [
      "Larger sizes after winning streaks",
      "Smaller sizes after drawdowns",
      "Inconsistent risk per trade",
    ],
  },
];

export function BehavioralMistakes() {
  return (
    <section id="mistakes" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-destructive/5 to-background" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-muted-foreground">Behavioral Red Flags</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Common Trading Mistakes We Detect
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our AI continuously monitors for destructive trading patterns that hurt your
            performance and helps you break free from them.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mistakes.map((mistake, i) => (
            <FadeIn key={mistake.title} delay={0.1 + i * 0.1}>
              <div className="group p-6 rounded-2xl glass border border-border/50 transition-all duration-300 hover:border-destructive/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <mistake.icon className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-foreground">{mistake.title}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-destructive/10 ${mistake.impactColor}`}>
                        {mistake.impact} Impact
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{mistake.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 mb-4">
                  <span className="text-3xl font-bold text-foreground">{mistake.stat}</span>
                  <span className="text-sm text-muted-foreground">{mistake.statLabel}</span>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    How We Detect It
                  </p>
                  <p className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-3 border border-primary/10">
                    {mistake.detection}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Warning Signs
                  </p>
                  <ul className="space-y-2">
                    {mistake.indicators.map((indicator, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5} className="text-center mt-12">
          <div className="glass inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl">
            <div className="text-center sm:text-left">
              <p className="text-foreground font-semibold">Are you making these mistakes?</p>
              <p className="text-sm text-muted-foreground">Take the free assessment to find out</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
              Start Free Assessment
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
