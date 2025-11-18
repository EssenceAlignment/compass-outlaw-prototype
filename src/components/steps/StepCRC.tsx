import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FileText, CheckCircle, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { analyzePetitionText, FormattingSuggestion } from "@/services/geminiService";

interface StepCRCProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: any;
}

const CRC_REQUIREMENTS = [
  {
    id: "font",
    label: "Font: Arial or Palatino, 12-point minimum",
    detail: "Main text must use approved fonts at specified size",
  },
  {
    id: "margins",
    label: "Margins: 1-inch top/bottom, 1.5-inch left, 1-inch right",
    detail: "Standard California court margin requirements",
  },
  {
    id: "spacing",
    label: "Line Spacing: Double-spaced for pleadings",
    detail: "Body text must be double-spaced per CRC 2.111",
  },
  {
    id: "pagination",
    label: "Pagination: All pages numbered consecutively",
    detail: "Page numbers required on all pages except cover",
  },
  {
    id: "caption",
    label: "Caption: Proper court heading and case information",
    detail: "Include court name, case number, and party names",
  },
  {
    id: "signature",
    label: "Signature Block: Proper formatting with verification",
    detail: "Include typed name, address, phone, and signature line",
  },
];

export const StepCRC = ({ onNext, onBack, data }: StepCRCProps) => {
  const [compliance, setCompliance] = useState<Record<string, boolean>>(data?.compliance || {});
  const [petitionText, setPetitionText] = useState<string>(data?.petitionText || "");
  const [suggestions, setSuggestions] = useState<FormattingSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const allChecked = CRC_REQUIREMENTS.every((req) => compliance[req.id]);
  const checkedCount = Object.values(compliance).filter(Boolean).length;

  const handleCheckChange = (id: string, checked: boolean) => {
    setCompliance((prev) => ({ ...prev, [id]: checked }));
  };

  const handleValidate = async () => {
    if (!petitionText.trim()) {
      toast({
        title: "No text to analyze",
        description: "Please enter your petition text before validating.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setSuggestions([]);

    try {
      const result = await analyzePetitionText(petitionText);
      setSuggestions(result.suggestions);
      
      if (result.suggestions.length === 0) {
        toast({
          title: "Analysis complete",
          description: "No formatting issues detected. Your petition appears to meet CRC 2.111 requirements.",
        });
      } else {
        toast({
          title: "Analysis complete",
          description: `Found ${result.suggestions.length} formatting suggestion${result.suggestions.length !== 1 ? 's' : ''}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze petition text",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    onNext({ compliance, petitionText, suggestions });
  };

  const getSeverityStyles = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-legal-error',
          bg: 'bg-legal-error/5',
          icon: <AlertCircle className="h-5 w-5 text-legal-error flex-shrink-0" />,
          iconColor: 'text-legal-error'
        };
      case 'warning':
        return {
          border: 'border-legal-warning',
          bg: 'bg-legal-warning/5',
          icon: <AlertTriangle className="h-5 w-5 text-legal-warning flex-shrink-0" />,
          iconColor: 'text-legal-warning'
        };
      case 'info':
        return {
          border: 'border-legal-info',
          bg: 'bg-legal-info/5',
          icon: <Info className="h-5 w-5 text-legal-info flex-shrink-0" />,
          iconColor: 'text-legal-info'
        };
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              CRC 2.111 Compliance Check
            </h2>
            <p className="text-muted-foreground">
              Verify that your petition meets California Rules of Court formatting requirements.
            </p>
          </div>

          <Alert className="border-legal-info bg-legal-info/5">
            <FileText className="h-5 w-5 text-legal-info" />
            <AlertDescription className="text-sm">
              Review each requirement below. The system will format your final document to meet these
              standards automatically.
            </AlertDescription>
          </Alert>

          <Card className="p-4 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Compliance Progress</h3>
                <p className="text-sm text-muted-foreground">
                  {checkedCount} of {CRC_REQUIREMENTS.length} requirements acknowledged
                </p>
              </div>
              <div className="text-3xl font-bold text-primary">
                {Math.round((checkedCount / CRC_REQUIREMENTS.length) * 100)}%
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            {CRC_REQUIREMENTS.map((req) => (
              <Card key={req.id} className="p-4 border-muted hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={req.id}
                    checked={compliance[req.id] || false}
                    onCheckedChange={(checked) => handleCheckChange(req.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={req.id}
                      className="font-medium text-foreground cursor-pointer leading-relaxed"
                    >
                      {req.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{req.detail}</p>
                  </div>
                  {compliance[req.id] && (
                    <CheckCircle className="h-5 w-5 text-legal-success flex-shrink-0 mt-1" />
                  )}
                </div>
              </Card>
            ))}
          </div>

          {!allChecked && (
            <Alert className="border-legal-warning bg-legal-warning/5">
              <AlertTriangle className="h-5 w-5 text-legal-warning" />
              <AlertDescription className="text-sm">
                Please acknowledge all CRC 2.111 requirements before proceeding. The system will
                automatically format your document to meet these standards.
              </AlertDescription>
            </Alert>
          )}

          {allChecked && (
            <Alert className="border-legal-success bg-legal-success/5">
              <CheckCircle className="h-5 w-5 text-legal-success" />
              <AlertDescription className="text-sm">
                All CRC 2.111 requirements acknowledged. Your document will be formatted accordingly.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      <Card className="p-6 shadow-lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              AI-Powered Formatting Analysis
            </h3>
            <p className="text-sm text-muted-foreground">
              Paste your petition text below to receive real-time formatting suggestions from our AI assistant.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="petitionText" className="text-sm font-medium">
              Petition Text
            </Label>
            <Textarea
              id="petitionText"
              value={petitionText}
              onChange={(e) => setPetitionText(e.target.value)}
              placeholder="Paste your petition text here for AI-powered formatting analysis..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleValidate}
            disabled={isAnalyzing || !petitionText.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Validate Formatting
              </>
            )}
          </Button>

          {suggestions.length > 0 && (
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">
                  Formatting Suggestions ({suggestions.length})
                </h4>
              </div>

              {suggestions.map((suggestion, index) => {
                const styles = getSeverityStyles(suggestion.severity);
                return (
                  <Card
                    key={index}
                    className={`p-4 ${styles.border} ${styles.bg} transition-colors`}
                  >
                    <div className="flex gap-3">
                      {styles.icon}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-semibold text-foreground">
                            {suggestion.section}
                          </h5>
                          <span className={`text-xs font-medium uppercase ${styles.iconColor}`}>
                            {suggestion.severity}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <strong>Issue:</strong> {suggestion.issue}
                        </p>
                        <p className="text-sm text-foreground">
                          <strong>Suggestion:</strong> {suggestion.suggestion}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!allChecked}>
          Next: Exhibits
        </Button>
      </div>
    </div>
  );
};
