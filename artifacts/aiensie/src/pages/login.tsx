import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Brain, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [, navigate]      = useLocation();
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate("/dashboard"), 900);
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden p-12"
           style={{ background: "linear-gradient(135deg, oklch(0.1 0.01 280), oklch(0.12 0.015 260))" }}>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5"
             style={{ backgroundImage: "linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
             style={{ background: "radial-gradient(circle, oklch(0.7 0.15 250), transparent 70%)" }} />

        <div className="relative z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">Aiensie</span>
          </div>

          {/* Center copy */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Behavioral Trading Intelligence
            </div>
            <h1 className="text-3xl font-bold text-foreground leading-tight mb-4">
              Your trading psychology,<br />finally decoded.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Aiensie analyzes your trade history to surface the behavioral patterns that separate consistent traders from reactive ones.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { value: "5",    label: "Behavioral Dimensions" },
                { value: "12+",  label: "Pattern Types Detected" },
                { value: "100",  label: "Point Scoring System" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-muted-foreground/50">
            Your data is processed locally. Nothing is uploaded to external servers.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">Aiensie</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-8">
            Access your behavioral trading intelligence dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-3.5 rounded-xl border border-border/60 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted-foreground">Password</label>
                <button type="button" className="text-[11px] text-primary hover:text-primary/80 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-border/60 bg-card/60 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold rounded-xl mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Google placeholder */}
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full h-11 rounded-xl border border-border/60 bg-card/60 text-sm text-muted-foreground hover:bg-card hover:text-foreground hover:border-border transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[11px] text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/assessment" className="text-primary hover:text-primary/80 transition-colors">
              Try a free assessment
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
