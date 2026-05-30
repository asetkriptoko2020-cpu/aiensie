import { useState, useCallback } from "react";
import { Link } from "wouter";
import {
  Upload,
  FileText,
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  X,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ProcessingStep = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "processing" | "complete";
};

const initialSteps: ProcessingStep[] = [
  {
    id: 1,
    title: "Reading trade history",
    description: "Parsing and validating your trading data",
    status: "pending",
  },
  {
    id: 2,
    title: "Calculating risk metrics",
    description: "Analyzing position sizing and exposure patterns",
    status: "pending",
  },
  {
    id: 3,
    title: "Detecting behavioral patterns",
    description: "Identifying trading psychology indicators",
    status: "pending",
  },
  {
    id: 4,
    title: "Generating Aiensie Score",
    description: "Computing your comprehensive assessment",
    status: "pending",
  },
];

const marketGroups = [
  {
    label: "CEX",
    platforms: ["Binance", "OKX", "Bybit", "Coinbase", "KuCoin"],
  },
  {
    label: "DEX / Perpetuals",
    platforms: ["Hyperliquid", "dYdX", "GMX", "Uniswap", "Jupiter"],
  },
  {
    label: "Traditional Markets",
    platforms: ["Stocks", "Forex", "Options", "ETFs", "Futures"],
  },
];

export default function AssessmentPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(initialSteps);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile);
      } else {
        setError("Please upload a CSV file");
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile);
      } else {
        setError("Please upload a CSV file");
      }
    }
  }, []);

  const simulateProcessing = async () => {
    setIsProcessing(true);
    setError(null);
    for (let i = 0; i < initialSteps.length; i++) {
      setProcessingSteps((prev) =>
        prev.map((step, index) =>
          index === i ? { ...step, status: "processing" } : step
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
      setProcessingSteps((prev) =>
        prev.map((step, index) =>
          index === i ? { ...step, status: "complete" } : step
        )
      );
    }
  };

  const handleStartAssessment = () => {
    if (!file) {
      setError("Please upload your trading history CSV to continue");
      return;
    }
    simulateProcessing();
  };

  const resetUpload = () => {
    setFile(null);
    setIsProcessing(false);
    setProcessingSteps(initialSteps);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/aiensie-logo.png"
                alt="Aiensie"
                className="h-8 w-8 object-contain rounded-sm"
                style={{ filter: "brightness(1.05)" }}
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Aiensie
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to Home
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
              Start Your Assessment
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Upload your trading history to receive your personalized Aiensie
              Score and behavioral insights.
            </p>
          </div>

          {!isProcessing ? (
            <>
              {/* ── Supported Markets ── */}
              <div className="mb-8">
                <h2 className="text-sm font-medium text-foreground mb-1">
                  Supported Markets &amp; Platforms
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Export your trade history as CSV from any of the platforms below.
                </p>

                <div className="rounded-2xl border border-border/60 bg-card/40 p-5 space-y-4">
                  {marketGroups.map((group) => (
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
                    More integrations coming soon.
                  </p>
                </div>
              </div>

              {/* ── Upload zone ── */}
              <div className="mb-6">
                <h2 className="text-sm font-medium text-foreground mb-4">
                  Upload your trading history
                </h2>
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
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFile(null)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove file
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                          isDragging ? "bg-primary/20" : "bg-secondary"
                        }`}
                      >
                        <Upload
                          className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div>
                        <p className="text-foreground font-medium mb-1">
                          Drag and drop your CSV file here
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse files
                        </p>
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

              {/* ── Privacy note ── */}
              <div className="mb-6 p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <Lock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Privacy first.</span>{" "}
                  We never ask for your API key, private key, or brokerage login.
                  Your CSV is processed locally for behavioral analysis only.
                </p>
              </div>

              {/* ── Error ── */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* ── CTA ── */}
              <Button
                onClick={handleStartAssessment}
                disabled={!file}
                className="w-full h-14 text-lg glow-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Analyze My Trading Behavior
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* ── Export instructions ── */}
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
                    <span
                      key={tip}
                      className="px-3 py-1.5 rounded-full bg-card border border-border/60"
                    >
                      {tip}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ── Processing state ── */
            <div className="glass rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Analyzing your trading behavior
                </h2>
                <p className="text-muted-foreground">
                  This usually takes about 30 seconds
                </p>
              </div>

              <div className="space-y-4">
                {processingSteps.map((step, index) => (
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

              {processingSteps.every((s) => s.status === "complete") && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Assessment Complete
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your Aiensie Score has been calculated
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button className="glow-primary">
                      View Your Results
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={resetUpload}>
                      Start New Assessment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
