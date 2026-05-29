import { Link } from "wouter";
import { ArrowRight, Sparkles, Shield, Target, Activity, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobeBackground } from "./globe-background";

const PARTICLES = [
  { top: "10%",  left: "15%",  size: 2, delay: "0s",    dur: "4s",   dx: "-20px", dy: "-30px" },
  { top: "20%",  left: "80%",  size: 3, delay: "0.8s",  dur: "5s",   dx: "15px",  dy: "-40px" },
  { top: "75%",  left: "25%",  size: 2, delay: "1.6s",  dur: "4.5s", dx: "-15px", dy: "-25px" },
  { top: "80%",  left: "70%",  size: 3, delay: "0.4s",  dur: "3.8s", dx: "20px",  dy: "-35px" },
  { top: "45%",  left: "5%",   size: 2, delay: "2.2s",  dur: "5.2s", dx: "-12px", dy: "-28px" },
  { top: "30%",  left: "92%",  size: 2, delay: "1.2s",  dur: "4.2s", dx: "10px",  dy: "-32px" },
  { top: "60%",  left: "50%",  size: 2, delay: "3s",    dur: "4.8s", dx: "18px",  dy: "-20px" },
  { top: "15%",  left: "55%",  size: 3, delay: "0.6s",  dur: "5.5s", dx: "-16px", dy: "-38px" },
  { top: "85%",  left: "40%",  size: 2, delay: "2.8s",  dur: "4.3s", dx: "12px",  dy: "-30px" },
  { top: "50%",  left: "95%",  size: 2, delay: "1.8s",  dur: "5.1s", dx: "8px",   dy: "-22px" },
];

const metrics = [
  {
    icon: Target,
    label: "Discipline",
    value: "82",
    colorClass: "text-primary",
    bgClass: "bg-primary/20",
    iconClass: "text-primary",
    cardAnim: "animate-neon-card",
    barColor: "oklch(0.7 0.15 250)",
    pct: 82,
    shineClass: "animate-shine",
  },
  {
    icon: Shield,
    label: "Risk Control",
    value: "68",
    colorClass: "text-accent",
    bgClass: "bg-accent/20",
    iconClass: "text-accent",
    cardAnim: "animate-accent-card",
    barColor: "oklch(0.65 0.2 170)",
    pct: 68,
    shineClass: "animate-shine-delay-1",
  },
  {
    icon: Activity,
    label: "Consistency",
    value: "78",
    colorClass: "text-success",
    bgClass: "bg-success/20",
    iconClass: "text-success",
    cardAnim: "animate-success-card",
    barColor: "oklch(0.7 0.18 145)",
    pct: 78,
    shineClass: "animate-shine-delay-2",
  },
  {
    icon: Brain,
    label: "Emotional Stability",
    value: "71",
    colorClass: "text-warning",
    bgClass: "bg-warning/20",
    iconClass: "text-warning",
    cardAnim: "animate-warning-card",
    barColor: "oklch(0.75 0.12 80)",
    pct: 71,
    shineClass: "animate-shine-delay-3",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <GlobeBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background/80 to-background pointer-events-none z-[1]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left column ── */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-8">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">AI-Powered Behavioral Assessment</span>
            </div>

            {/* Headline with light-sweep on "Trading Mind" */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Know Your{" "}
              {/* Outer span: keeps layout, relative for overflow clip */}
              <span className="relative inline-block">
                {/* Gradient text */}
                <span
                  className="text-transparent bg-clip-text animate-heading-gradient"
                  style={{
                    backgroundImage:
                      "linear-gradient(100deg, oklch(0.7 0.15 250) 0%, oklch(0.85 0.18 200) 30%, oklch(0.65 0.2 170) 55%, oklch(0.85 0.18 200) 75%, oklch(0.7 0.15 250) 100%)",
                    backgroundSize: "300% 300%",
                    filter: "drop-shadow(0 0 12px oklch(0.7 0.15 250 / 0.4))",
                  }}
                >
                  Trading Mind
                </span>
                {/* Light sweep stripe */}
                <span
                  aria-hidden
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                >
                  <span
                    className="animate-text-sweep absolute inset-y-0 w-[35%]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, oklch(0.95 0.05 220 / 0.35) 40%, oklch(1 0 0 / 0.55) 50%, oklch(0.95 0.05 220 / 0.35) 60%, transparent 100%)",
                      mixBlendMode: "overlay",
                    }}
                  />
                </span>
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

          {/* ── Right column — Score card ── */}
          <div className="relative">
            {/* Ambient glow blob */}
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />

            <div className="relative glass rounded-2xl p-8 glow-primary">

              {/* ── Score ring ── */}
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Your Aiensie Score</p>

                <div className="relative inline-flex items-center justify-center">
                  {/* Outer ambient ring */}
                  <div
                    className="absolute rounded-full animate-neon-ring pointer-events-none"
                    style={{
                      width: 200,
                      height: 200,
                      background:
                        "radial-gradient(circle, oklch(0.7 0.15 250 / 0.06) 60%, transparent 75%)",
                    }}
                  />

                  {/* SVG progress ring */}
                  <svg
                    className="w-48 h-48 transform -rotate-90 animate-neon-ring"
                    style={{ overflow: "visible" }}
                  >
                    {/* Track */}
                    <circle
                      cx="96" cy="96" r="88"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-secondary"
                    />
                    {/* Active arc */}
                    <circle
                      cx="96" cy="96" r="88"
                      stroke="url(#heroGradient)"
                      strokeWidth="7"
                      fill="none"
                      strokeDasharray="415 553"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="oklch(0.7 0.15 250)" />
                        <stop offset="100%" stopColor="oklch(0.65 0.2 170)" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Score content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
                    {/* Scan line */}
                    <div
                      aria-hidden
                      className="absolute left-0 right-0 h-[2px] animate-score-scan pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, oklch(0.7 0.15 250 / 0.8) 30%, oklch(0.9 0.1 200 / 0.9) 50%, oklch(0.7 0.15 250 / 0.8) 70%, transparent)",
                        boxShadow: "0 0 8px oklch(0.7 0.15 250 / 0.6)",
                      }}
                    />

                    {/* Digital score number */}
                    <span
                      className="digital-number animate-digital-flicker animate-score-glow leading-none"
                      style={{
                        fontSize: "3.25rem",
                        color: "oklch(0.92 0.08 220)",
                      }}
                    >
                      75
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                    <span
                      className="digital-number animate-label-pulse mt-1"
                      style={{
                        fontSize: "0.6rem",
                        color: "oklch(0.7 0.15 250)",
                        letterSpacing: "0.18em",
                      }}
                    >
                      GOOD
                    </span>
                  </div>

                  {/* Floating particles */}
                  {PARTICLES.map((p, i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="particle"
                      style={{
                        top: p.top,
                        left: p.left,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                        animationDuration: p.dur,
                        "--dx": p.dx,
                        "--dy": p.dy,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>

              {/* ── Metric cards ── */}
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m, i) => (
                  <div
                    key={m.label}
                    className={`relative flex flex-col gap-2 p-3 rounded-xl bg-secondary/50 overflow-hidden ${m.cardAnim} transition-all duration-300 hover:bg-secondary/70`}
                  >
                    {/* Icon + label + value row */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${m.bgClass}`}>
                        <m.icon className={`h-4 w-4 ${m.iconClass}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p
                          className={`digital-number text-sm font-semibold ${m.colorClass}`}
                          style={{
                            textShadow: `0 0 8px ${m.barColor}99`,
                          }}
                        >
                          {m.value}
                          <span className="text-xs font-normal text-muted-foreground">/100</span>
                        </p>
                      </div>
                    </div>

                    {/* Animated progress bar */}
                    <div className="relative h-1 rounded-full overflow-hidden bg-secondary">
                      {/* Fill */}
                      <div
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                          width: `${m.pct}%`,
                          background: `linear-gradient(90deg, ${m.barColor}, ${m.barColor}cc)`,
                          boxShadow: `0 0 6px ${m.barColor}80`,
                        }}
                      />
                      {/* Shine sweep */}
                      <div
                        aria-hidden
                        className={`absolute top-0 h-full w-[30%] ${m.shineClass}`}
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55) 50%, transparent)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground text-center">
                  <span className="text-primary font-medium">Sample Score</span>
                  {" "}— Take the free assessment to get your personalized Aiensie Score
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
