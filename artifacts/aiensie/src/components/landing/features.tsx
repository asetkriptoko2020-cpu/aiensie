import { Brain, BarChart3, Shield, Zap, Target, Clock } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";

const features = [
  {
    icon: Brain,
    title: "Deep Behavioral Analysis",
    description: "Our AI analyzes over 50 behavioral metrics from your trading history to build a comprehensive psychological profile.",
  },
  {
    icon: BarChart3,
    title: "Quantified Assessment",
    description: "Get a clear, numerical score across each behavioral dimension so you can track improvement over time.",
  },
  {
    icon: Shield,
    title: "Risk Behavior Monitoring",
    description: "Continuous monitoring of risk-taking patterns to identify when you deviate from healthy trading behavior.",
  },
  {
    icon: Zap,
    title: "Real-Time Alerts",
    description: "Receive alerts when our AI detects you entering a destructive behavioral pattern during trading.",
  },
  {
    icon: Target,
    title: "Personalized Insights",
    description: "Actionable recommendations tailored to your specific weaknesses and trading style to help you improve.",
  },
  {
    icon: Clock,
    title: "Progress Tracking",
    description: "Monitor your behavioral improvement over weeks and months with detailed trend analysis.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-4">
            <span className="text-muted-foreground">Assessment Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            How Aiensie Assesses Your Trading
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Advanced AI technology combined with behavioral finance research to give you
            the most comprehensive trading behavior assessment available.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={0.08 + i * 0.08}>
              <div className="group p-6 rounded-2xl glass border border-border/50 transition-all duration-300 hover:border-primary/50 h-full">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
