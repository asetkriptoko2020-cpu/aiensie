import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  TrendingUp,
  Globe,
  Settings,
  Zap,
  PlusCircle,
  LogOut,
  Brain,
  ArrowLeft,
} from "lucide-react";
import { MOCK_USER } from "./mock-data";

const NAV_ITEMS = [
  { label: "Overview",         icon: LayoutDashboard, href: "/dashboard"           },
  { label: "New Assessment",   icon: PlusCircle,      href: "/assessment"           },
  { label: "Reports",          icon: FileText,        href: "/dashboard/reports"    },
  { label: "Behavior Trends",  icon: TrendingUp,      href: "/dashboard/trends"     },
  { label: "Markets",          icon: Globe,           href: "/dashboard/markets"    },
  { label: "Settings",         icon: Settings,        href: "/dashboard/settings"   },
];

function isActive(location: string, href: string): boolean {
  if (href === "/dashboard") return location === "/dashboard";
  return location.startsWith(href);
}

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col border-r border-border/40 z-40"
           style={{ background: "oklch(0.1 0.006 280 / 0.95)", backdropFilter: "blur(16px)" }}>

      {/* ── Logo ── */}
      <Link href="/" className="flex items-center gap-2.5 px-5 h-16 border-b border-border/40 flex-shrink-0 hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
          <Brain className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-bold tracking-tight text-foreground">Aiensie</span>
        {MOCK_USER.plan === "pro" && (
          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 tracking-widest uppercase">
            Pro
          </span>
        )}
      </Link>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = isActive(location, href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                active
                  ? "bg-primary/12 text-primary border border-primary/20 font-medium"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* ── Back to Website ── */}
      <div className="px-3 pb-1">
        <Link href="/"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
          Back to Website
        </Link>
      </div>

      {/* ── Upgrade CTA ── */}
      <div className="px-3 pb-2">
        <Link href="/dashboard/upgrade"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm border border-primary/20 text-primary hover:bg-primary/10 transition-all cursor-pointer"
          style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 250 / 0.08), oklch(0.65 0.2 170 / 0.08))" }}>
          <Zap className="w-4 h-4" />
          Upgrade to Pro
        </Link>
      </div>

      {/* ── User ── */}
      <div className="px-3 py-3 border-t border-border/40 flex-shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{MOCK_USER.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{MOCK_USER.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{MOCK_USER.email}</p>
          </div>
          <Link href="/login">
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
