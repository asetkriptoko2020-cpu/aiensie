import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

const plans = [
  {
    name: "Free Assessment",
    price: "$0",
    period: "One-time",
    description: "Get your baseline Aiensie Score",
    features: [
      "Complete behavioral assessment",
      "Aiensie Score calculation",
      "4 pillar breakdown",
      "Basic recommendations",
      "One-time report",
    ],
    cta: "Start Free Assessment",
    popular: false,
  },
  {
    name: "Trader Pro",
    price: "$79",
    period: "/month",
    description: "Continuous behavioral monitoring",
    features: [
      "Unlimited assessments",
      "Real-time behavior tracking",
      "Pattern detection alerts",
      "Weekly progress reports",
      "Personalized improvement plan",
      "1-on-1 coaching session/month",
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
  },
  {
    name: "Trading Firm",
    price: "Custom",
    period: "Contact us",
    description: "For prop firms and institutions",
    features: [
      "Everything in Trader Pro",
      "Team behavior analytics",
      "Trader risk profiling",
      "API & data integration",
      "Custom assessment criteria",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-4">
            <span className="text-muted-foreground">Pricing Plans</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Invest in Your Trading Psychology
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Start with a free assessment and upgrade when you are ready for continuous improvement
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={0.1 + i * 0.12}>
              <div
                className={`relative p-6 lg:p-8 rounded-2xl glass transition-all duration-300 h-full flex flex-col ${
                  plan.popular
                    ? "border-primary glow-primary scale-105"
                    : "border-border/50 hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${plan.popular ? "glow-primary" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
