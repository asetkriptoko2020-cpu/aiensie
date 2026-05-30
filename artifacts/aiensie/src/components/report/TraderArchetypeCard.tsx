import { useRef, useState, useEffect } from "react";
import { Dna } from "lucide-react";
import type { TraderArchetypeDNA } from "@workspace/aiensie-engine";

// ── Confidence bar ────────────────────────────────────────────────────────────

function ConfidenceBar({ confidence, visible, delay }: {
  confidence: number; visible: boolean; delay: number;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setWidth(confidence), delay);
      return () => clearTimeout(t);
    }
  }, [visible, confidence, delay]);

  const color =
    confidence >= 85 ? "#10b981" :
    confidence >= 75 ? "#06b6d4" :
    confidence >= 65 ? "#a78bfa" : "#f59e0b";

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="flex-1 h-1 rounded-full bg-white/6">
        <div
          className="h-full rounded-full"
          style={{
            width:      `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            boxShadow:  `0 0 6px ${color}50`,
            transition: "width 0.9s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{confidence}%</span>
    </div>
  );
}

// ── Signal card ───────────────────────────────────────────────────────────────

function SignalCard({ text, confidence, index, visible }: {
  text: string; confidence: number; index: number; visible: boolean;
}) {
  return (
    <div
      className="rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-colors"
      style={{
        background:   "oklch(0.13 0.01 270 / 0.6)",
        opacity:      visible ? 1 : 0,
        transform:    visible ? "translateY(0)" : "translateY(8px)",
        transition:   `opacity 0.45s ease ${index * 100}ms, transform 0.45s ease ${index * 100}ms`,
      }}
    >
      <p className="text-xs text-foreground/85 leading-relaxed">{text}</p>
      <ConfidenceBar confidence={confidence} visible={visible} delay={index * 100 + 200} />
    </div>
  );
}

// ── Archetype badge ───────────────────────────────────────────────────────────

function ArchetypeBadge({ label, isPrimary }: { label: string; isPrimary: boolean }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border"
      style={{
        color:       isPrimary ? "#a78bfa" : "#6b7280",
        background:  isPrimary ? "oklch(0.65 0.2 280 / 0.12)" : "oklch(0.13 0.005 270 / 0.6)",
        borderColor: isPrimary ? "rgba(167,139,250,0.3)" : "rgba(255,255,255,0.08)",
      }}
    >
      {isPrimary && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mr-1.5" />}
      {label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TraderArchetypeCard({ data }: { data: TraderArchetypeDNA }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="rounded-2xl p-6 border border-violet-500/20 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, oklch(0.12 0.015 280 / 0.95), oklch(0.1 0.01 260 / 0.95))",
        boxShadow:  "0 0 40px oklch(0.65 0.2 280 / 0.05) inset",
      }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 50% at 10% 90%, oklch(0.65 0.2 280 / 0.06), transparent)" }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-violet-500/25"
              style={{ background: "oklch(0.65 0.2 280 / 0.12)" }}
            >
              <Dna className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-400/70 uppercase tracking-widest">Behavioral DNA</p>
              <p className="text-sm font-semibold text-foreground">Your psychological execution profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ArchetypeBadge label={data.primaryArchetype} isPrimary={true} />
            {data.secondaryArchetype && (
              <ArchetypeBadge label={data.secondaryArchetype} isPrimary={false} />
            )}
          </div>
        </div>

        {/* Edge profile */}
        <div
          className="rounded-xl px-4 py-3 mb-5 border border-violet-500/15"
          style={{
            background:   "oklch(0.65 0.2 280 / 0.07)",
            opacity:      visible ? 1 : 0,
            transition:   "opacity 0.4s ease",
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400/60 mb-1">Edge Profile</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{data.edgeProfile}</p>
        </div>

        {/* DNA signals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.signals.map((signal, i) => (
            <SignalCard
              key={i}
              text={signal.text}
              confidence={signal.confidence}
              index={i}
              visible={visible}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2"
          style={{
            opacity:    visible ? 1 : 0,
            transition: "opacity 0.4s ease 0.5s",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400/40" />
          <p className="text-[11px] text-muted-foreground/50 tracking-wide">
            Generated from behavioral pattern analysis · Aiensie DNA Engine
          </p>
        </div>
      </div>
    </div>
  );
}
