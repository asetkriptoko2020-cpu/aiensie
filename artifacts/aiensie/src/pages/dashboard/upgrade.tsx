import { Check, X, Zap, Lock } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MOCK_USER } from "@/components/dashboard/mock-data";
import { Button } from "@/components/ui/button";

const FREE_FEATURES = [
  { label: "1 assessment report",             free: true,  pro: true  },
  { label: "5 behavioral dimension scores",   free: true,  pro: true  },
  { label: "Pattern detection",               free: true,  pro: true  },
  { label: "Action plan",                     free: true,  pro: true  },
  { label: "Unlimited assessments",           free: false, pro: true  },
  { label: "Saved reports history",           free: false, pro: true  },
  { label: "Score trend tracking",            free: false, pro: true  },
  { label: "Behavioral dimension trends",     free: false, pro: true  },
  { label: "PDF report export",               free: false, pro: true  },
  { label: "Cross-market analysis",           free: false, pro: true  },
  { label: "Month-over-month comparison",     free: false, pro: true  },
  { label: "Personalized action plan history",free: false, pro: true  },
  { label: "Priority support",               free: false, pro: true  },
];

export default function UpgradePage() {
  const isAlreadyPro = MOCK_USER.plan === "pro";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl space-y-6">

        {/* ── Header ── */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            Aiensie Pro
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Unlock your full trading intelligence
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Pro gives you unlimited assessments, saved reports, historical trend tracking, and PDF export — everything you need to systematically improve.
          </p>
        </div>

        {/* ── Pricing cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Free */}
          <div className="glass rounded-2xl p-6">
            <div className="mb-5">
              <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">$0</span>
                <span className="text-sm text-muted-foreground mb-1.5">/ forever</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Get started with a single behavioral assessment.</p>
            </div>
            {!isAlreadyPro ? (
              <div className="w-full h-10 rounded-xl border border-border/60 flex items-center justify-center text-sm text-muted-foreground">
                Current plan
              </div>
            ) : (
              <div className="w-full h-10 rounded-xl border border-border/40 flex items-center justify-center text-sm text-muted-foreground/50">
                Free tier
              </div>
            )}
          </div>

          {/* Pro */}
          <div className="rounded-2xl p-6 relative overflow-hidden border border-primary/30"
               style={{ background: "linear-gradient(135deg, oklch(0.12 0.015 260), oklch(0.14 0.02 250))" }}>
            {/* Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 pointer-events-none"
                 style={{ background: "radial-gradient(circle, oklch(0.7 0.15 250), transparent 70%)", transform: "translate(30%, -30%)" }} />

            <div className="relative z-10 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Pro</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 uppercase tracking-widest">Most Popular</span>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-foreground">$29</span>
                <span className="text-sm text-muted-foreground mb-1.5">/ month</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">Full behavioral intelligence platform.</p>
            </div>

            {isAlreadyPro ? (
              <div className="relative z-10 w-full h-10 rounded-xl border border-primary/40 bg-primary/10 flex items-center justify-center text-sm text-primary font-medium">
                ✓ Current plan
              </div>
            ) : (
              <Button className="relative z-10 w-full h-10 rounded-xl text-sm font-semibold gap-2">
                <Zap className="w-4 h-4" /> Upgrade to Pro
              </Button>
            )}
          </div>
        </div>

        {/* ── Feature table ── */}
        <div className="glass rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 px-5 py-3 border-b border-border/40">
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest col-span-1">Feature</p>
            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest text-center">Free</p>
            <p className="text-xs font-bold text-primary uppercase tracking-widest text-center">Pro</p>
          </div>
          {FREE_FEATURES.map((f, i) => (
            <div key={f.label} className={`grid grid-cols-3 px-5 py-3.5 items-center ${i < FREE_FEATURES.length - 1 ? "border-b border-border/30" : ""}`}>
              <p className="text-sm text-foreground/85 col-span-1">{f.label}</p>
              <div className="flex justify-center">
                {f.free
                  ? <Check className="w-4 h-4 text-emerald-400" />
                  : <X className="w-4 h-4 text-muted-foreground/30" />}
              </div>
              <div className="flex justify-center">
                <Check className="w-4 h-4 text-primary" />
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ / reassurance ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Cancel anytime",      body: "No lock-in. Cancel from your settings page instantly." },
            { title: "Private by design",   body: "Your trade data is processed locally. Nothing is stored on external servers." },
            { title: "Instant access",      body: "Pro features activate immediately after upgrade. No waiting." },
          ].map((c) => (
            <div key={c.title} className="glass rounded-2xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">{c.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
