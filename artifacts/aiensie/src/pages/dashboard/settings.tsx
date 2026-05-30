import { useState } from "react";
import { User, Bell, Shield, Zap, Check } from "lucide-react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MOCK_USER } from "@/components/dashboard/mock-data";
import { Button } from "@/components/ui/button";

function SectionHeader({ icon: Icon, label }: { icon: React.ComponentType<{className?:string}>; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</h3>
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName]   = useState(MOCK_USER.name);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [saved, setSaved] = useState(false);

  const [notifs, setNotifs] = useState({
    weeklyReport: true,
    patternAlert: true,
    scoreUpdate:  false,
    newsletter:   false,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl space-y-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>

        {/* ── Profile ── */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader icon={User} label="Profile" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">{MOCK_USER.avatar}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{MOCK_USER.name}</p>
              <p className="text-xs text-muted-foreground">{MOCK_USER.email}</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">Member since {MOCK_USER.joinedDate}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-border/60 bg-card/60 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button onClick={handleSave} size="sm" className="gap-2 rounded-xl h-9">
              {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* ── Plan ── */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader icon={Zap} label="Subscription" />
          <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20"
               style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 250 / 0.07), oklch(0.65 0.2 170 / 0.07))" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground capitalize">{MOCK_USER.plan} Plan</p>
                <p className="text-[11px] text-muted-foreground">
                  {MOCK_USER.plan === "pro" ? "Renews monthly · Cancel anytime" : "Free forever"}
                </p>
              </div>
            </div>
            {MOCK_USER.plan === "pro" ? (
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border/40 hover:border-border">
                Manage
              </button>
            ) : (
              <Link href="/dashboard/upgrade">
                <Button size="sm" className="gap-1.5 rounded-xl h-8 text-xs">
                  <Zap className="w-3.5 h-3.5" /> Upgrade
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Notifications ── */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader icon={Bell} label="Notifications" />
          <div className="space-y-3">
            {[
              { key: "weeklyReport" as const, label: "Weekly behavior summary",    sub: "A digest of your trading patterns every Monday" },
              { key: "patternAlert" as const, label: "Pattern detection alerts",   sub: "Get notified when a new behavioral pattern is detected" },
              { key: "scoreUpdate"  as const, label: "Score milestone updates",    sub: "Notify me when I reach a new score tier" },
              { key: "newsletter"   as const, label: "Product updates & insights", sub: "Tips from our trading psychology team" },
            ].map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-card/40 border border-border/40">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                </div>
                <button
                  onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                  className={`relative w-10 h-5.5 rounded-full border transition-all flex-shrink-0 ${
                    notifs[key] ? "bg-primary border-primary/50" : "bg-card border-border/60"
                  }`}
                  style={{ height: "22px", width: "40px" }}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notifs[key] ? "left-[18px]" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security ── */}
        <div className="glass rounded-2xl p-6">
          <SectionHeader icon={Shield} label="Security" />
          <div className="space-y-2.5">
            <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card/40 border border-border/40 hover:border-border transition-all text-left">
              <div>
                <p className="text-sm font-medium text-foreground">Change password</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Update your account password</p>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-card/40 border border-border/40 hover:border-border transition-all text-left">
              <div>
                <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Add an extra layer of security</p>
              </div>
              <span className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/30 px-2 py-0.5 rounded-full font-bold">Off</span>
            </button>
            <button className="w-full flex items-center justify-between p-3.5 rounded-xl bg-red-950/20 border border-red-900/25 hover:border-red-800/50 transition-all text-left">
              <div>
                <p className="text-sm font-medium text-red-400">Delete account</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Permanently remove all data</p>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
