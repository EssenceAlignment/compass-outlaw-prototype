import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface PreflightCheck {
  id: string;
  label: string;
  status: "pending" | "running" | "passed" | "failed" | "warning";
  message?: string;
}

interface StepPreflightProps {
  onNext: () => void;
  onBack: () => void;
  filingData: any;
}

export const StepPreflight = ({ onNext, onBack, filingData }: StepPreflightProps) => {
  const [checks, setChecks] = useState<PreflightCheck[]>([
    { id: "esv", label: "Event Sequence Validation", status: "pending" },
    { id: "crc", label: "CRC 2.111 Compliance", status: "pending" },
    { id: "exhibits", label: "Exhibit Processing", status: "pending" },
    { id: "pdf", label: "PDF/A Conversion", status: "pending" },
    { id: "bookmarks", label: "PDF Bookmarking", status: "pending" },
    { id: "metadata", label: "Document Metadata", status: "pending" },
    { id: "size", label: "File Size Validation", status: "pending" },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runPreflightChecks = async () => {
    setIsRunning(true);
    setProgress(0);

    for (let i = 0; i < checks.length; i++) {
      const check = checks[i];
      
      // Update status to running
      setChecks((prev) =>
        prev.map((c) => (c.id === check.id ? { ...c, status: "running" } : c))
      );

      // Simulate check execution
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Determine result based on filing data
      let status: "passed" | "failed" | "warning" = "passed";
      let message = "";

      switch (check.id) {
        case "esv":
          if (!filingData.events || filingData.events.length === 0) {
            status = "warning";
            message = "No events provided - proceeding without ESV";
          }
          break;
        case "exhibits":
          if (!filingData.exhibits || filingData.exhibits.length === 0) {
            status = "warning";
            message = "No exhibits attached - proceeding without exhibits";
          }
          break;
      }

      setChecks((prev) =>
        prev.map((c) => (c.id === check.id ? { ...c, status, message } : c))
      );

      setProgress(((i + 1) / checks.length) * 100);
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runPreflightChecks();
  }, []);

  const allPassed = checks.every((c) => c.status === "passed" || c.status === "warning");
  const hasFailures = checks.some((c) => c.status === "failed");
  const hasWarnings = checks.some((c) => c.status === "warning");

  const getStatusIcon = (status: PreflightCheck["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-legal-success" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-legal-warning" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Preflight Verification
            </h2>
            <p className="text-muted-foreground">
              Running comprehensive checks to ensure your filing package meets all requirements.
            </p>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Running preflight checks...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="space-y-3">
            {checks.map((check) => (
              <Card
                key={check.id}
                className={`p-4 transition-all ${
                  check.status === "running"
                    ? "border-primary shadow-md"
                    : check.status === "passed"
                    ? "border-legal-success/30"
                    : check.status === "warning"
                    ? "border-legal-warning/30"
                    : check.status === "failed"
                    ? "border-destructive/30"
                    : "border-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{check.label}</h3>
                    {check.message && (
                      <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {!isRunning && allPassed && !hasWarnings && (
            <Alert className="border-legal-success bg-legal-success/5">
              <CheckCircle className="h-5 w-5 text-legal-success" />
              <AlertDescription className="text-sm">
                <strong>All checks passed!</strong> Your filing package is ready for generation.
              </AlertDescription>
            </Alert>
          )}

          {!isRunning && hasWarnings && !hasFailures && (
            <Alert className="border-legal-warning bg-legal-warning/5">
              <AlertTriangle className="h-5 w-5 text-legal-warning" />
              <AlertDescription className="text-sm">
                <strong>Preflight completed with warnings.</strong> Review warnings above before
                proceeding. You may continue if these are expected.
              </AlertDescription>
            </Alert>
          )}

          {!isRunning && hasFailures && (
            <Alert className="border-destructive bg-destructive/5">
              <XCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-sm">
                <strong>Preflight failed.</strong> Address the issues above before proceeding to
                package generation.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={isRunning || hasFailures}>
          {isRunning ? "Running Checks..." : "Generate Package"}
        </Button>
      </div>
    </div>
  );
};
