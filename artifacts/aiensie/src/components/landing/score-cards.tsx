import { useState } from "react";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const scoreCards = [
  {
    title: "Overall Aiensie Score",
    score: 75,
    maxScore: 100,
    change: "+7",
    positive: true,
    description: "Your comprehensive trading behavior assessment score",
    breakdown: [
      { label: "Discipline", value: 82 },
      { label: "Risk Control", value: 68 },
      { label: "Consistency", value: 78 },
      { label: "Emotional Stability", value: 71 },
    ],
  },
  {
    title: "Behavioral Risk Index",
    score: 28,
    maxScore: 100,
    change: "-12",
    positive: true,
    description: "Lower is better - measures destructive trading patterns",
    breakdown: [
      { label: "Revenge Trading", value: 18 },
      { label: "Overtrading", value: 25 },
      { label: "Panic Exit", value: 35 },
      { label: "Emotional Sizing", value: 32 },
    ],
  },
  {
    title: "Improvement Potential",
    score: 89,
    maxScore: 100,
    change: "+4",
    positive: true,
    description: "Your potential for behavioral improvement based on patterns",
    breakdown: [
      { label: "Learning Rate", value: 92 },
      { label: "Pattern Awareness", value: 85 },
      { label: "Adaptability", value: 88 },
      { label: "Self-Correction", value: 90 },
    ],
  },
];

export function ScoreCards() {
  const [activeCard, setActiveCard] = useState(0);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-4">
            <span className="text-muted-foreground">Your Assessment Results</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Comprehensive Score Breakdown
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Three key metrics that give you a complete picture of your trading behavior
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {scoreCards.map((card, index) => (
            <div
              key={card.title}
              className={`p-6 rounded-2xl glass cursor-pointer transition-all duration-300 ${
                activeCard === index
                  ? "border-primary glow-primary"
                  : "border-border/50 hover:border-primary/50"
              }`}
              onClick={() => setActiveCard(index)}
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  card.positive
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                }`}>
                  {card.positive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {card.change}
                </div>
              </div>

              <div className="relative flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(card.score / card.maxScore) * 352} 352`}
                      className="text-primary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground">{card.score}</span>
                    <span className="text-xs text-muted-foreground">/{card.maxScore}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center mb-4">
                {card.description}
              </p>

              <div className="space-y-2">
                {card.breakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
            Get your detailed score breakdown
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
