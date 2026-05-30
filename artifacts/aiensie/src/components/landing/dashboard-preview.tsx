import { TrendingUp, TrendingDown, Target, Shield, Activity, Brain, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";

const assessmentMetrics = [
  { label: "Discipline Score",     value: 82, maxValue: 100, icon: Target,   trend: "+12%", trendUp: true,  insight: "Strong rule adherence" },
  { label: "Risk Control",         value: 68, maxValue: 100, icon: Shield,   trend: "+5%",  trendUp: true,  insight: "Improving steadily"    },
  { label: "Consistency",          value: 78, maxValue: 100, icon: Activity, trend: "+8%",  trendUp: true,  insight: "Above average"         },
  { label: "Emotional Stability",  value: 71, maxValue: 100, icon: Brain,    trend: "+3%",  trendUp: true,  insight: "Room to improve"       },
];

const behaviorAlerts = [
  { type: "warning", behavior: "Revenge Trading",  detected: "2 instances this week",    severity: "Medium" },
  { type: "success", behavior: "Position Sizing",  detected: "100% compliant",           severity: "Good"   },
  { type: "warning", behavior: "Panic Exit",       detected: "1 early exit detected",    severity: "Low"    },
  { type: "success", behavior: "Trading Plan",     detected: "Following consistently",   severity: "Good"   },
];

const weeklyTrend = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 75 },
  { day: "Wed", score: 68 },
  { day: "Thu", score: 78 },
  { day: "Fri", score: 82 },
  { day: "Sat", score: 80 },
  { day: "Sun", score: 75 },
];

export function DashboardPreview() {
  return (
    <section id="dashboard" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-sm mb-4">
            <span className="text-muted-foreground">Assessment Dashboard</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Track Your Behavioral Progress
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Monitor your Aiensie Score and track improvements across all four behavioral dimensions
          </p>
        </FadeIn>

        <FadeIn delay={0.15} y={16}>
          <div className="glass rounded-2xl p-6 glow-primary">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border/50">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Your Assessment Overview</h3>
                <p className="text-sm text-muted-foreground">Weekly behavioral analysis report</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm">
                  <span className="font-semibold">Aiensie Score: 75</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/20 text-success text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+7% this week</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {assessmentMetrics.map((metric) => (
                <div key={metric.label} className="p-4 rounded-xl bg-secondary/50 border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <metric.icon className="h-5 w-5 text-primary" />
                    <div className={`flex items-center gap-1 text-xs ${metric.trendUp ? "text-success" : "text-destructive"}`}>
                      {metric.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span>{metric.trend}</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metric.value}
                    <span className="text-sm text-muted-foreground">/{metric.maxValue}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{metric.insight}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-4">Weekly Score Trend</h4>
                <div className="flex items-end justify-between h-32 gap-2">
                  {weeklyTrend.map((day) => (
                    <div key={day.day} className="flex flex-col items-center gap-2 flex-1">
                      <div
                        className="w-full bg-primary/80 rounded-t-sm transition-all duration-500"
                        style={{ height: `${day.score}%` }}
                      />
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-4">Behavior Monitoring</h4>
                <div className="space-y-3">
                  {behaviorAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${alert.type === "success" ? "bg-success" : "bg-warning"}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{alert.behavior}</p>
                          <p className="text-xs text-muted-foreground">{alert.detected}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${alert.type === "success" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                        {alert.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">AI Assessment Insight</p>
                  <p className="text-sm text-muted-foreground">
                    Your discipline score has improved significantly this week. Focus on risk control —
                    consider reducing position sizes during high volatility periods to improve your overall Aiensie Score.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3} className="text-center mt-8">
          <Link href="/dashboard">
            <Button size="lg" className="glow-primary">
              View Pro Dashboard Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
