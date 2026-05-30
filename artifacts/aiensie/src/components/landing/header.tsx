import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Assessment", href: "#pillars" },
  { label: "Behaviors", href: "#mistakes" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 flex-shrink-0 flex items-center justify-center">
              <img
                src="/aiensie-logo.png"
                alt="Aiensie"
                className="h-8 w-8 object-contain rounded-sm"
                style={{ filter: "brightness(1.05)" }}
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Aiensie
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            <Link href="/assessment">
              <Button size="sm" className="glow-primary">
                Start Assessment
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-center">
                Sign In
              </Button>
              <Link href="/assessment">
                <Button className="w-full justify-center glow-primary">
                  Start Assessment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
