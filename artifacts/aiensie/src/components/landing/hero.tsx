import { Link } from "wouter";
import { ArrowRight, Sparkles, Shield, Target, Activity, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobeBackground } from "./globe-background";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <GlobeBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background/80 to-background pointer-events-none z-[1]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">AI-Powered Behavioral Assessment</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Know Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">
                Trading Mind
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 text-pretty max-w-xl">
              Aiensie measures and quantifies your trading behavior across 4 critical dimensions.
              Get your personalized assessment score and actionable insights to become a more disciplined trader.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
              <Link href="/assessment">
                <Button size="lg" className="glow-primary text-base px-8">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-base px-8">
                How It Works
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span>10,000+ traders assessed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>AI-powered analysis</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />

            <div className="relative glass rounded-2xl p-8 glow-primary">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Your Aiensie Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-secondary"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="url(#gradient)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="415 553"
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="oklch(0.7 0.15 250)" />
                        <stop offset="100%" stopColor="oklch(0.65 0.2 170)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-foreground">75</span>
                    <span className="text-sm text-muted-foreground">/100</span>
                    <span className="text-xs text-primary font-medium mt-1">GOOD</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Discipline</p>
                    <p className="text-sm font-semibold text-foreground">82/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-accent/20">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Control</p>
                    <p className="text-sm font-semibold text-foreground">68/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Activity className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Consistency</p>
                    <p className="text-sm font-semibold text-foreground">78/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Brain className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emotional Stability</p>
                    <p className="text-sm font-semibold text-foreground">71/100</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="text-primary font-medium">Sample Score</span> — Take the free assessment to get your personalized Aiensie Score
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
