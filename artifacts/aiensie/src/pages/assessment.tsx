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
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Platform = {
  id: string;
  name: string;
  logo: string;
  format: string;
};

const platforms: Platform[] = [
  { id: "binance", name: "Binance", logo: "B", format: "CSV" },
  { id: "bybit", name: "Bybit", logo: "By", format: "CSV" },
  { id: "okx", name: "OKX", logo: "O", format: "CSV" },
  { id: "hyperliquid", name: "Hyperliquid", logo: "HL", format: "CSV" },
  { id: "metatrader", name: "MetaTrader", logo: "MT", format: "CSV/HTML" },
];

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

export default function AssessmentPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
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

    for (let i = 0; i < processingSteps.length; i++) {
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
    if (!selectedPlatform || !file) {
      setError("Please select a platform and upload your trading history");
      return;
    }
    simulateProcessing();
  };

  const resetUpload = () => {
    setFile(null);
    setSelectedPlatform(null);
    setIsProcessing(false);
    setProcessingSteps(initialSteps);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/aiensie-logo.png"
                alt="Aiensie"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Aiensie
              </span>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
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
              <div className="mb-8">
                <h2 className="text-sm font-medium text-foreground mb-4">
                  Select your trading platform
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {platforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        selectedPlatform === platform.id
                          ? "border-primary bg-primary/10 glow-primary"
                          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          selectedPlatform === platform.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {platform.logo}
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {platform.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {platform.format}
                      </span>
                      {selectedPlatform === platform.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-sm font-medium text-foreground mb-4">
                  Upload trading history
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

              <div className="mb-8 p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Your data is secure
                  </p>
                  <p className="text-sm text-muted-foreground">
                    We never ask for your API key or private key. Your trading
                    history is processed securely and used only for behavioral
                    analysis.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                onClick={handleStartAssessment}
                disabled={!selectedPlatform || !file}
                className="w-full h-14 text-lg glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Free Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </>
          ) : (
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Step {index + 1}
                        </span>
                      </div>
                      <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {processingSteps.every((step) => step.status === "complete") && (
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

          {!isProcessing && (
            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                How to export your trading history
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <span className="px-3 py-1.5 rounded-full bg-card border border-border">
                  Binance: Orders &gt; Trade History &gt; Export
                </span>
                <span className="px-3 py-1.5 rounded-full bg-card border border-border">
                  Bybit: Assets &gt; Spot &gt; Order History
                </span>
                <span className="px-3 py-1.5 rounded-full bg-card border border-border">
                  OKX: Assets &gt; Order Center &gt; Export
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
