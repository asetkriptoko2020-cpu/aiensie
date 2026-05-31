import { useState, useCallback, useRef } from "react";
import { Link, useSearch, useLocation } from "wouter";
import Papa from "papaparse";
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  X,
  Lock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectAndParse, generateReport, SAMPLE_TRADES } from "@workspace/aiensie-engine";
import type { AiensieReport } from "@workspace/aiensie-engine";
import { ScoreReport }        from "@/components/report/ScoreReport";
import { saveReportSnapshot } from "@/lib/behavior-memory";
import {
  saveFullReport,
  replaceReport,
  detectDuplicateReport,
  type DuplicateMatch,
  type DuplicateTag,
} from "@/lib/report-store";

// ── Types ──────────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "processing" | "complete";

interface ProcessingStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
}

type ParseResult = ReturnType<typeof detectAndParse>;

interface ProcessFileOpts {
  tag?:                  DuplicateTag;
  replaceId?:            string;
  precomputedParseResult?: ParseResult;
}

type Phase =
  | { name: "upload" }
  | { name: "processing" }
  | { name: "duplicate"; match: DuplicateMatch; file: File; parseResult: ParseResult }
  | { name: "complete"; report: AiensieReport; exchange: string; tradeCount: number }
  | { name: "error"; message: string };

// ── Constants ──────────────────────────────────────────────────────────────────

const INITIAL_STEPS: ProcessingStep[] = [
  { id: 1, title: "Reading trade history",        description: "Parsing and validating your trading data",              status: "pending" },
  { id: 2, title: "Detecting exchange format",     description: "Identifying CSV structure and data source",            status: "pending" },
  { id: 3, title: "Normalizing trades",           description: "Standardizing records for cross-asset analysis",       status: "pending" },
  { id: 4, title: "Calculating risk metrics",     description: "Analyzing position sizing and exposure patterns",      status: "pending" },
  { id: 5, title: "Generating Aiensie Score",     description: "Computing your comprehensive behavioral assessment",   status: "pending" },
];

const MARKET_GROUPS = [
  { label: "CEX",                  platforms: ["Binance", "OKX", "Bybit", "Coinbase", "KuCoin"] },
  { label: "DEX / Perpetuals",     platforms: ["Hyperliquid", "dYdX", "GMX", "Uniswap", "Jupiter"] },
  { label: "Traditional Markets",  platforms: ["Stocks", "Forex", "Options", "ETFs", "Futures"] },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target?.result as string ?? "");
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const [file, setFile]           = useState<File | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [phase, setPhase]         = useState<Phase>({ name: "upload" });
  const [steps, setSteps]         = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [location, navigate] = useLocation();
  const search        = useSearch();
  const fromDashboard =
    new URLSearchParams(search).get("from") === "dashboard" ||
    location === "/dashboard/new-assessment" ||
    location.startsWith("/dashboard/new-assessment/");
  const exitHref      = fromDashboard ? "/dashboard" : "/";

  // ── File handling ──────────────────────────────────────────────────────────

  const acceptFile = useCallback((f: File) => {
    if (f.type === "text/csv" || f.name.endsWith(".csv")) {
      setFile(f);
      setUploadError(null);
    } else {
      setUploadError("Please upload a CSV file");
    }
  }, []);

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true);  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); }, []);
  const handleDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, [acceptFile]);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
  }, [acceptFile]);

  // ── Processing ─────────────────────────────────────────────────────────────

  const setStepStatus = (index: number, status: StepStatus) =>
    setSteps((prev) => prev.map((s, i) => i === index ? { ...s, status } : s));

  const processFile = async (csvFile: File, opts?: ProcessFileOpts) => {
    setPhase({ name: "processing" });
    setSteps(INITIAL_STEPS);

    try {
      // ── Step 1: Read file ──
      setStepStatus(0, "processing");
      let parseResult: ParseResult;

      if (opts?.precomputedParseResult) {
        // Resuming after duplicate dialog — skip re-parsing
        parseResult = opts.precomputedParseResult;
        await delay(300);
        setStepStatus(0, "complete");
        setStepStatus(1, "processing");
        await delay(250);
      } else {
        const [text] = await Promise.all([readFileText(csvFile), delay(500)]);
        console.log("[Aiensie] File read complete — size:", text.length, "chars");
        setStepStatus(0, "complete");

        // ── Step 2: Detect exchange & parse ──
        setStepStatus(1, "processing");
        parseResult = await new Promise<ParseResult>(
          (resolve, reject) => {
            Papa.parse<Record<string, string>>(text, {
              header:         true,
              skipEmptyLines: true,
              complete: (results) => {
                try {
                  console.log("[Aiensie] PapaParse complete — rows:", results.data.length);
                  resolve(detectAndParse(results.data));
                } catch (e) {
                  reject(e);
                }
              },
              error: reject,
            });
          }
        );

        // ── Duplicate detection ──
        const dup = detectDuplicateReport(parseResult.tradeCount, parseResult.exchangeLabel);
        if (dup) {
          setPhase({ name: "duplicate", match: dup, file: csvFile, parseResult });
          return;
        }
      }

      await delay(350);

      console.log("[Aiensie] Parse result:", {
        exchange:  parseResult.exchange,
        label:     parseResult.exchangeLabel,
        trades:    parseResult.tradeCount,
        skipped:   parseResult.skippedRows,
        warnings:  parseResult.warnings,
      });

      setStepStatus(1, "complete");

      // ── Only fail on truly unsupported format (0 trades) ──
      if (parseResult.trades.length === 0) {
        const headers = parseResult.warnings.join(" ");
        setPhase({
          name:    "error",
          message: `Unsupported CSV format — no valid trades could be parsed. ${headers}\n\nMake sure your CSV includes at least a symbol, side/direction, and PnL column.`,
        });
        return;
      }

      if (parseResult.trades.length < 5) {
        setPhase({
          name:    "error",
          message: `Only ${parseResult.trades.length} completed trade${parseResult.trades.length === 1 ? "" : "s"} found in your ${parseResult.exchangeLabel} export. Please ensure you export your full closed trade history (at least 5 trades required).`,
        });
        return;
      }

      // ── Step 3: Normalize ──
      setStepStatus(2, "processing");
      await delay(600);
      setStepStatus(2, "complete");

      // ── Step 4: Risk metrics ──
      setStepStatus(3, "processing");
      await delay(700);
      setStepStatus(3, "complete");

      // ── Step 5: Score ──
      setStepStatus(4, "processing");
      const report = generateReport(parseResult.trades, parseResult.exchangeLabel);

      console.log("[Aiensie] Generated report:", {
        aiensieScore:            report.aiensieScore,
        label:                   report.label,
        traderType:              report.traderType,
        dynamicPersona:          report.dynamicPersona.title,
        disciplineScore:         report.scores.disciplineScore,
        riskControlScore:        report.scores.riskControlScore,
        consistencyScore:        report.scores.consistencyScore,
        emotionalStabilityScore: report.scores.emotionalStabilityScore,
        decisionQualityScore:    report.scores.decisionQualityScore,
        detectedPatterns:        report.detectedPatterns.map((p) => `${p.name} (${p.severity})`),
        sessionIntelligence:     !!report.sessionIntelligence,
      });

      await delay(800);
      setStepStatus(4, "complete");
      await delay(600);

      // ── Save to behavior memory (snapshot) and full report store ──
      // Only persist when uploading from the dashboard; the public free assessment is ephemeral.
      if (fromDashboard) {
        saveReportSnapshot(report, parseResult.exchangeLabel, parseResult.tradeCount);
        let savedId: string;
        if (opts?.replaceId) {
          const saved = replaceReport(opts.replaceId, report, parseResult.exchangeLabel, parseResult.tradeCount, opts.tag ?? "updated-report");
          savedId = saved.id;
        } else {
          const saved = saveFullReport(report, parseResult.exchangeLabel, parseResult.tradeCount, opts?.tag);
          savedId = saved.id;
        }
        navigate(`/dashboard/reports/${savedId}`);
        return;
      }

      setPhase({
        name:       "complete",
        report,
        exchange:   parseResult.exchangeLabel,
        tradeCount: parseResult.tradeCount,
      });
    } catch (err) {
      console.error("[Aiensie] Processing error:", err);
      setPhase({
        name:    "error",
        message: "Failed to process your CSV. Please check the file and try again.",
      });
    }
  };

  // ── Sample mode ────────────────────────────────────────────────────────────

  const runSampleMode = async () => {
    setFile(null);
    setUploadError(null);
    setPhase({ name: "processing" });
    setSteps(INITIAL_STEPS);

    console.log("[Aiensie] Sample mode — loading", SAMPLE_TRADES.length, "mock trades");

    await delay(400);
    setStepStatus(0, "complete");

    await delay(350);
    setStepStatus(1, "complete");

    await delay(600);
    setStepStatus(2, "complete");

    await delay(700);
    setStepStatus(3, "complete");

    setStepStatus(4, "processing");
    const report = generateReport(SAMPLE_TRADES, "Sample Data");

    console.log("[Aiensie] Sample report:", {
      aiensieScore:    report.aiensieScore,
      label:           report.label,
      dynamicPersona:  report.dynamicPersona.title,
      traderType:      report.traderType,
      detectedPatterns: report.detectedPatterns.map((p) => `${p.name} (${p.severity})`),
      sessionIntelligence: !!report.sessionIntelligence,
    });

    await delay(800);
    setStepStatus(4, "complete");
    await delay(600);

    // Only persist when in dashboard context; public sample mode is ephemeral.
    if (fromDashboard) {
      saveReportSnapshot(report, "Sample Data", SAMPLE_TRADES.length);
      const saved = saveFullReport(report, "Sample Data", SAMPLE_TRADES.length);
      navigate(`/dashboard/reports/${saved.id}`);
      return;
    }

    setPhase({
      name:       "complete",
      report,
      exchange:   "Sample Data",
      tradeCount: SAMPLE_TRADES.length,
    });
  };

  const handleStartAssessment = () => {
    if (!file) { setUploadError("Please upload your trading history CSV to continue"); return; }
    processFile(file);
  };

  const resetUpload = () => {
    setFile(null);
    setPhase({ name: "upload" });
    setSteps(INITIAL_STEPS);
    setUploadError(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href={exitHref} className="flex items-center gap-2.5">
              <img
                src="/aiensie-logo.png"
                alt="Aiensie"
                className="h-8 w-8 object-contain rounded-sm"
                style={{ filter: "brightness(1.05)" }}
              />
              <span className="text-xl font-bold tracking-tight text-foreground">Aiensie</span>
            </Link>
            <Link href={exitHref}>
              <Button variant="ghost" size="sm">
                {fromDashboard ? "← Dashboard" : "← Back to Home"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Page header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {phase.name === "complete"
                ? "Your Assessment Results"
                : phase.name === "duplicate"
                  ? "Duplicate Detected"
                  : "Start Your Assessment"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {phase.name === "complete"
                ? "Here is your personalized Aiensie Score and behavioral breakdown."
                : phase.name === "duplicate"
                  ? "We found a similar report already in your history."
                  : "Upload your trading history to receive your personalized Aiensie Score and behavioral insights."}
            </p>
          </div>

          {/* ── UPLOAD phase ── */}
          {phase.name === "upload" && (
            <>
              {/* Supported platforms */}
              <div className="mb-8">
                <h2 className="text-sm font-medium text-foreground mb-1">Supported Markets &amp; Platforms</h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Export your trade history as CSV from any of the platforms below.
                </p>
                <div className="rounded-2xl border border-border/60 bg-card/40 p-5 space-y-4">
                  {MARKET_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.platforms.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/60 border border-border/60 text-foreground/80 hover:border-primary/40 hover:text-foreground transition-colors"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                    More integrations coming soon. Generic CSV with symbol, side &amp; PnL columns also supported.
                  </p>
                </div>
              </div>

              {/* Upload zone */}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-foreground mb-4">Upload your trading history</h2>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all text-center ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : file
                        ? "border-success bg-success/5"
                        : "border-border hover:border-primary/50 bg-card/50"
                  }`}
                >
                  {file ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-success" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => setFile(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-2" />Remove file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-primary/20" : "bg-secondary"}`}>
                        <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-foreground font-medium mb-1">Drag and drop your CSV file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse files</p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy note */}
              <div className="mb-6 p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Privacy first.</span>{" "}
                  We never ask for your API key, private key, or brokerage login.
                  Your CSV is processed locally in your browser — nothing is uploaded to a server.
                </p>
              </div>

              {/* Upload error */}
              {uploadError && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{uploadError}</p>
                </div>
              )}

              {/* Primary CTA */}
              <Button
                onClick={handleStartAssessment}
                disabled={!file}
                className="w-full h-14 text-lg glow-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Analyze My Trading Behavior
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Sample mode divider */}
              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t border-border/60" />
                <span className="mx-4 text-xs text-muted-foreground">or try a demo</span>
                <div className="flex-1 border-t border-border/60" />
              </div>

              {/* Sample data button */}
              <Button
                variant="outline"
                onClick={runSampleMode}
                className="w-full h-12 text-base border-primary/30 hover:border-primary/60 hover:bg-primary/5"
              >
                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                Use Sample Trading Data
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                See a full assessment using 80 pre-built mock trades — no CSV required.
              </p>

              {/* Export instructions */}
              <div className="mt-10 text-center">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">
                  How to export your trading history
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  {[
                    "Binance: Orders › Trade History › Export",
                    "Bybit: Assets › Order History › Export",
                    "OKX: Assets › Order Center › Export",
                    "Hyperliquid: Portfolio › Export CSV",
                  ].map((tip) => (
                    <span key={tip} className="px-3 py-1.5 rounded-full bg-card border border-border/60">
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── DUPLICATE WARNING phase ── */}
          {phase.name === "duplicate" && (
            <div className="glass rounded-2xl p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-800/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Similar Report Detected</h2>
                  <p className="text-sm text-muted-foreground">
                    This upload appears similar to an existing report in your history.
                    How would you like to proceed?
                  </p>
                </div>
              </div>

              {/* Existing report details */}
              <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-1.5 text-sm">
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-2">Existing Report</p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Exchange</span>
                  <span className="text-foreground font-medium">{phase.match.exchange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trades</span>
                  <span className="text-foreground font-medium">{phase.match.tradeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className="text-foreground font-medium">{phase.match.score}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span className="text-foreground font-medium">
                    {new Date(phase.match.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Similarity</span>
                  <span className="text-amber-400 font-semibold">{phase.match.similarity}%</span>
                </div>
              </div>

              {/* Choices */}
              <div className="space-y-3">
                <Button
                  className="w-full h-12 justify-start gap-3 text-sm"
                  onClick={() =>
                    processFile(phase.file, {
                      tag: "updated-report",
                      replaceId: phase.match.id,
                      precomputedParseResult: phase.parseResult,
                    })
                  }
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold">Replace Existing</p>
                    <p className="text-xs opacity-75">Update the old report with this new upload</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start gap-3 text-sm"
                  onClick={() =>
                    processFile(phase.file, {
                      tag: "re-uploaded-session",
                      precomputedParseResult: phase.parseResult,
                    })
                  }
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold">Keep Both</p>
                    <p className="text-xs opacity-75 text-muted-foreground">Save as a separate report alongside the existing one</p>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
                  onClick={resetUpload}
                >
                  Cancel Upload
                </Button>
              </div>
            </div>
          )}

          {/* ── PROCESSING phase ── */}
          {phase.name === "processing" && (
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Analyzing your trading behavior
                </h2>
                <p className="text-muted-foreground">Processing your data locally — no uploads required</p>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                      step.status === "processing"
                        ? "bg-primary/10 border border-primary/30"
                        : step.status === "complete"
                          ? "bg-success/5 border border-success/20"
                          : "bg-card border border-border"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {step.status === "processing" ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : step.status === "complete" ? (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                      <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COMPLETE phase ── */}
          {phase.name === "complete" && (
            <>
              {fromDashboard && (
                <div className="mb-6 flex justify-start">
                  <Link href="/dashboard/reports">
                    <Button variant="outline" size="sm" className="gap-2 rounded-xl">
                      ← View in Dashboard
                    </Button>
                  </Link>
                </div>
              )}
              <ScoreReport
                report={phase.report}
                exchange={phase.exchange}
                tradeCount={phase.tradeCount}
                onReset={resetUpload}
              />
            </>
          )}

          {/* ── ERROR phase ── */}
          {phase.name === "error" && (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/15 mb-5">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Unable to Process File</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed whitespace-pre-line">
                {phase.message}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={resetUpload} className="glow-primary">
                  Try Another File
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={runSampleMode}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Sample Data Instead
                </Button>
                <Button variant="outline" asChild>
                  <Link href={exitHref}>{fromDashboard ? "Back to Dashboard" : "Return Home"}</Link>
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
