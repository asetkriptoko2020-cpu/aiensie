export const MARKET_OPTIONS = ["All", "Crypto", "Stocks", "Forex", "ETF", "Options"] as const;
export type ActiveMarket = typeof MARKET_OPTIONS[number];

interface Props {
  value: ActiveMarket;
  onChange: (m: ActiveMarket) => void;
  className?: string;
}

export function MarketFilter({ value, onChange, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {MARKET_OPTIONS.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium whitespace-nowrap ${
            value === m
              ? "bg-primary/15 text-primary border-primary/30"
              : "text-muted-foreground border-border/40 bg-card/40 hover:bg-white/5 hover:text-foreground"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
