import type { AiensieScores, TradeMetrics, DetectedPattern } from "./types.js";

/**
 * Generates a behavior-conditional smart summary paragraph.
 * Replaces repetitive/static writing with intelligent conditional prose
 * based on the actual combination of detected patterns and dimension scores.
 */
export function generateSmartSummary(
  overall: number,
  scores: AiensieScores,
  metrics: TradeMetrics,
  patterns: DetectedPattern[],
  exchange?: string,
): string {
  const { disciplineScore, emotionalStabilityScore, consistencyScore, riskControlScore } = scores;

  const hasRevenge     = patterns.find((p) => p.name === "Revenge Trading Risk");
  const hasOverconf    = patterns.find((p) => p.name === "Overconfidence After Wins");
  const hasOvertrading = patterns.find((p) => p.name === "Overtrading");
  const hasLossHold    = patterns.find((p) => p.name === "Holding Losses Too Long");
  const hasSizeInst    = patterns.find((p) => p.name === "Erratic Position Sizing");

  const highSevCount   = patterns.filter((p) => p.severity === "high").length;
  const isCrypto       = !exchange || exchange.toLowerCase().includes("binance") ||
                          exchange.toLowerCase().includes("bybit") || exchange.toLowerCase().includes("okx") ||
                          exchange.toLowerCase().includes("hyperliquid") || exchange.toLowerCase().includes("sample");

  const sentences: string[] = [];

  // ── Conditional block: dual-high patterns ────────────────────────────────
  if (hasRevenge?.severity === "high" && hasOvertrading?.severity === "high") {
    sentences.push(
      "Your recent trading activity suggests emotionally reactive execution patterns — high re-entry frequency after losses combined with an elevated overall trade count signals that decisions are being driven by emotion more than edge.",
    );
  } else if (hasRevenge?.severity === "high" && hasSizeInst?.severity === "high") {
    sentences.push(
      "The combination of impulsive re-entry after losses and erratic position sizing suggests that emotional state is directly influencing how much you risk — a particularly costly pattern because the largest positions tend to coincide with the worst emotional moments.",
    );
  } else if (hasOverconf?.severity === "high" && hasLossHold?.severity === "high") {
    sentences.push(
      "Two opposing emotional biases are compressing your results: you size up aggressively after wins, then hold too long when those positions turn against you. The asymmetry is working against you on both sides.",
    );
  }

  // ── Conditional block: positive combination ───────────────────────────────
  if (consistencyScore >= 72 && emotionalStabilityScore >= 70 && !hasRevenge) {
    sentences.push(
      "Your execution process is becoming increasingly repeatable and structured — consistent sizing and stable emotional control across sessions are the hallmarks of a trader building a genuine, durable edge.",
    );
  } else if (disciplineScore >= 75 && riskControlScore >= 72 && patterns.length === 0) {
    sentences.push(
      "No behavioral distortions are present at a significant level — a clean psychological profile across all dimensions. The focus now is protecting this foundation as market conditions change.",
    );
  }

  // ── Conditional block: improving emotional stability ──────────────────────
  if (emotionalStabilityScore >= 65 && emotionalStabilityScore < 80 && !hasRevenge && hasOvertrading) {
    sentences.push(
      "Emotional control is a relative strength here — but the trading frequency suggests you're still finding it difficult to stay out of the market when conditions aren't ideal.",
    );
  } else if (emotionalStabilityScore >= 70 && !hasRevenge && !hasOverconf) {
    sentences.push(
      "Emotional discipline is a genuine advantage in this profile. The absence of revenge entries and streak-driven sizing reflects a level of self-regulation that directly protects capital during difficult sessions.",
    );
  }

  // ── Conditional block: volatility / asset class effect ───────────────────
  if (isCrypto && hasSizeInst && metrics.positionSizeVariability > 0.45) {
    sentences.push(
      "Execution quality appears sensitive to volatility — erratic sizing patterns are a common signal that crypto market swings are influencing risk decisions in real-time rather than following a predetermined rule.",
    );
  }

  // ── Conditional block: consistency improving ──────────────────────────────
  if (!hasSizeInst && metrics.positionSizeVariability < 0.2 && consistencyScore >= 65) {
    sentences.push(
      "Position sizing is notably consistent — a frequently underrated dimension. Stable sizing means that performance reflects actual decision quality, not variance in how much was risked per trade.",
    );
  }

  // ── Conditional block: high volatility performance drag ──────────────────
  if (hasOvertrading && hasRevenge && highSevCount >= 2) {
    sentences.push(
      "The data suggests that high-frequency environments are particularly challenging for this behavioral profile. Execution quality declines noticeably when market activity is elevated — consider a stricter daily trade limit as a structural constraint.",
    );
  }

  // ── Fallback: score-based tonal summary ──────────────────────────────────
  if (sentences.length === 0) {
    if (overall >= 80) {
      sentences.push(
        "The behavioral profile across this dataset is strong — disciplined execution, controlled emotional response, and a consistent process. The work now is maintaining standards as market conditions shift.",
      );
    } else if (overall >= 65) {
      sentences.push(
        "The behavioral foundation is solid with identifiable room to improve. The issues are specific and addressable — targeted adjustments in one or two areas would produce meaningful score movement.",
      );
    } else if (overall >= 50) {
      sentences.push(
        "The behavioral record reveals a pattern that is common at this stage: the gap between strategy understanding and consistent execution. Narrowing that gap is entirely achievable with structured focus.",
      );
    } else {
      sentences.push(
        "The trading record reflects a set of behavioral patterns that are actively working against performance. Recognizing them clearly — which this assessment provides — is the essential first step toward correcting them.",
      );
    }
  }

  return sentences.join(" ");
}
