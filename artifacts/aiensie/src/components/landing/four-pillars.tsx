import { Target, Shield, Activity, Brain, ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const pillars = [
  {
    icon: Target,
    title: "Discipline",
    score: 82,
    description: "Measures your ability to follow trading rules, stick to your plan, and avoid impulsive decisions.",
    color: "primary",
    metrics: [
      "Plan adherence rate",
      "Entry/exit rule compliance",
      "Position sizing accuracy",
      "Trading schedule consistency",
    ],
  },
  {
    icon: Shield,
    title: "Risk Control",
    score: 68,
    description: "Evaluates how well you manage risk exposure, use stop-losses, and protect your capital.",
    color: "accent",
    metrics: [
      "Stop-loss utilization",
      "Risk/reward ratio adherence",
      "Maximum drawdown behavior",
      "Portfolio diversification",
    ],
  },
  {
    icon: Activity,
    title: "Consistency",
    score: 78,
    description: "Tracks the stability of your trading patterns and results over time.",
    color: "success",
    metrics: [
      "Win rate stability",
      "Strategy consistency",
      "Time-based patterns",
      "Performance variance",
    ],
  },
  {
    icon: Brain,
    title: "Emotional Stability",
    score: 71,
    description: "Assesses your psychological resilience and ability to maintain composure during trading.",
    color: "warning",
    metrics: [
      "Post-loss behavior",
      "Winning streak management",
      "Market volatility response",
      "Decision timing patterns",
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", ring: "text-primary" },
  accent:  { bg: "bg-accent/10",  text: "text-accent",  border: "border-accent/30",  ring: "text-accent"  },
  success: { bg: "bg-success/10", text: "text-success", border: "border-success/30", ring: "text-success" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30", ring: "text-warning" },
};

export function FourPillars() {
  return (
    <section id="pillars" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-4">
            <span className="text-muted-foreground">The Aiensie Framework</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            4 Pillars of Trading Behavior
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our AI assesses your trading behavior across four critical dimensions to give you
            a comprehensive understanding of your trading psychology.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, i) => {
            const colors = colorMap[pillar.color];
            return (
              <FadeIn key={pillar.title} delay={0.1 + i * 0.1}>
                <div
                  className={`group p-6 rounded-2xl glass border ${colors.border} transition-all duration-300 hover:border-opacity-60`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <pillar.icon className={`h-6 w-6 ${colors.text}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{pillar.title}</h3>
                        <p className="text-sm text-muted-foreground">Behavioral Dimension</p>
                      </div>
                    </div>

                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-secondary" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none"
                          strokeDasharray={`${(pillar.score / 100) * 176} 176`}
                          strokeLinecap="round"
                          className={colors.ring}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-foreground">{pillar.score}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{pillar.description}</p>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      What We Measure
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {pillar.metrics.map((metric) => (
                        <div key={metric} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className={`h-3.5 w-3.5 ${colors.text}`} />
                          <span className="text-muted-foreground">{metric}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        <FadeIn delay={0.5} className="text-center mt-12">
          <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
            Learn more about our methodology
            <ArrowRight className="h-4 w-4" />
          </button>
        </FadeIn>
      </div>
    </section>
  );
}
