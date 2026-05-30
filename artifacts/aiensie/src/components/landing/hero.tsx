import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Shield, Target, Activity, Brain, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobeBackground } from "./globe-background";
import { motion } from "framer-motion";
import { generateReport } from "@workspace/aiensie-engine";
import { SAMPLE_TRADES } from "@workspace/aiensie-engine";
import type { AiensieReport } from "@workspace/aiensie-engine";

// ── Run scoring engine once (module-level, pure computation) ─────────────────
const REPORT: AiensieReport = generateReport(SAMPLE_TRADES);

// ── Score ring constants ──────────────────────────────────────────────────────
const RADIUS        = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ringOffset(score: number): number {
  return CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
}

const RING_DURATION = 1.8;
const RING_DELAY    = 0.3;
const RING_EASE: [number, number, number, number] = [0.34, 1.06, 0.64, 1];

// ── Metric card data (driven by report) ──────────────────────────────────────
interface MetricDef {
  icon: LucideIcon;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  glowColor: string;
  delay: number;
}

function buildMetrics(report: AiensieReport): MetricDef[] {
  const s = report.scores;
  return [
    {
      icon: Target,
      label: "Discipline",
      value: s.disciplineScore,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      glowColor: "oklch(0.7 0.15 250)",
      delay: 0.6,
    },
    {
      icon: Shield,
      label: "Risk Control",
      value: s.riskControlScore,
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      glowColor: "oklch(0.65 0.2 170)",
      delay: 0.75,
    },
    {
      icon: Activity,
      label: "Consistency",
      value: s.consistencyScore,
      iconBg: "bg-success/20",
      iconColor: "text-success",
      glowColor: "oklch(0.7 0.18 145)",
      delay: 0.9,
    },
    {
      icon: Brain,
      label: "Emotional Stability",
      value: s.emotionalStabilityScore,
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      glowColor: "oklch(0.75 0.12 80)",
      delay: 1.05,
    },
  ];
}

// ── MetricCard ────────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, iconBg, iconColor, glowColor, delay }: MetricDef) {
  const [display, setDisplay]   = useState(0);
  const [counting, setCounting] = useState(true);
  const rafRef = useRef<number>(0);
  const DURATION = 1100;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const progress = Math.min((ts - start) / DURATION, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          setCounting(false);
        }
      };
      rafRef.current = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, delay]);

  const numStyle = counting
    ? { textShadow: `0 0 10px ${glowColor}99, 0 0 20px ${glowColor}44`, transition: "text-shadow 0.3s ease" }
    : { textShadow: "none", transition: "text-shadow 0.5s ease" };

  return (
    <motion.div
      className="relative flex items-center gap-3 p-3 rounded-xl bg-secondary/50 overflow-hidden cursor-default"
      whileHover={{ boxShadow: `0 0 0 1px ${glowColor}55, 0 0 18px ${glowColor}18` }}
      transition={{ duration: 0.2 }}
    >
      {counting && (
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          initial={{ x: "-100%" }}
          animate={{ x: "180%" }}
          transition={{ duration: DURATION / 1000, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.06) 50%, transparent 100%)",
            width: "60%",
          }}
        />
      )}

      <motion.div
        className={`p-2 rounded-lg ${iconBg} flex-shrink-0`}
        whileHover={{ scale: 1.12 }}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </motion.div>

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground leading-snug">
          <motion.span
            style={numStyle}
            whileHover={{ filter: "brightness(1.25)" }}
            transition={{ duration: 0.15 }}
          >
            {display}
          </motion.span>
          <span className="text-xs font-normal text-muted-foreground">/100</span>
        </p>
      </div>
    </motion.div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function Hero() {
  const score   = REPORT.aiensieScore;
  const label   = REPORT.label;
  const metrics = buildMetrics(REPORT);
  const offset  = ringOffset(score);

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

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 text-balance">
              Know Your{" "}
              <span className="relative inline-block">
                <span
                  className="text-transparent bg-clip-text animate-gradient"
                  style={{
                    backgroundImage:
                      "linear-gradient(110deg, oklch(0.7 0.15 250) 0%, oklch(0.82 0.15 210) 35%, oklch(0.65 0.2 170) 60%, oklch(0.7 0.15 250) 100%)",
                    backgroundSize: "200% 200%",
                  }}
                >
                  Trading Mind
                </span>
                <span aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm">
                  <span
                    className="animate-heading-sheen absolute inset-y-0 w-[28%]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.12) 50%, transparent 100%)",
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
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />

            <div className="relative glass rounded-2xl p-8 glow-primary">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Your Aiensie Score</p>

                <div className="relative inline-flex items-center justify-center">
                  <svg
                    width="192"
                    height="192"
                    viewBox="0 0 192 192"
                    className="transform -rotate-90"
                    style={{ overflow: "visible" }}
                  >
                    <defs>
                      <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%"   stopColor="oklch(0.7 0.15 250)" />
                        <stop offset="100%" stopColor="oklch(0.65 0.2 170)" />
                      </linearGradient>
                      <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
                      </filter>
                    </defs>

                    {/* Track */}
                    <circle cx="96" cy="96" r={RADIUS} stroke="currentColor" strokeWidth="6" fill="none" className="text-secondary" />

                    {/* Glow trail */}
                    <motion.circle
                      cx="96" cy="96" r={RADIUS}
                      stroke="url(#heroGradient)"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      filter="url(#arcGlow)"
                      strokeDasharray={CIRCUMFERENCE}
                      style={{ opacity: 0.45 }}
                      initial={{ strokeDashoffset: CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: RING_DURATION, delay: RING_DELAY, ease: RING_EASE }}
                    />

                    {/* Main arc */}
                    <motion.circle
                      cx="96" cy="96" r={RADIUS}
                      stroke="url(#heroGradient)"
                      strokeWidth="7"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      initial={{ strokeDashoffset: CIRCUMFERENCE }}
                      animate={{ strokeDashoffset: offset }}
                      transition={{ duration: RING_DURATION, delay: RING_DELAY, ease: RING_EASE }}
                    />

                    {/* Tip dot */}
                    <motion.circle
                      cx={96}
                      cy={96 - RADIUS}
                      r={4.5}
                      fill="oklch(0.92 0.1 210)"
                      style={{
                        transformOrigin: "96px 96px",
                        filter: "drop-shadow(0 0 6px oklch(0.7 0.15 250)) drop-shadow(0 0 12px oklch(0.65 0.2 170 / 0.8))",
                      }}
                      initial={{ rotate: 0, opacity: 0 }}
                      animate={{ rotate: [0, (score / 100) * 360], opacity: [0, 1, 1, 0] }}
                      transition={{
                        duration: RING_DURATION,
                        delay: RING_DELAY,
                        ease: RING_EASE,
                        opacity: { times: [0, 0.05, 0.85, 1], duration: RING_DURATION, delay: RING_DELAY },
                      }}
                    />
                  </svg>

                  {/* Score text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className="text-5xl font-bold text-foreground leading-none"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: RING_DELAY + RING_DURATION * 0.6, ease: "easeOut" }}
                    >
                      {score}
                    </motion.span>
                    <motion.span
                      className="text-sm text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: RING_DELAY + RING_DURATION * 0.7 }}
                    >
                      /100
                    </motion.span>
                    <motion.span
                      className="text-xs text-primary font-medium mt-1 uppercase tracking-wide"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: RING_DELAY + RING_DURATION * 0.8 }}
                    >
                      {label}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Metric cards */}
              <div className="grid grid-cols-2 gap-3">
                {metrics.map((m) => (
                  <MetricCard key={m.label} {...m} />
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
