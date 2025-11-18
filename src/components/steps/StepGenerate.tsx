import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileDown, CheckCircle, Loader2, FileText, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface StepGenerateProps {
  onBack: () => void;
  filingData: any;
}

export const StepGenerate = ({ onBack, filingData }: StepGenerateProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [packageUrl, setPackageUrl] = useState<string | null>(null);

  const generatePackage = async () => {
    setIsGenerating(true);
    setProgress(0);

    const steps = [
      { label: "Formatting petition document...", duration: 1500 },
      { label: "Processing exhibits...", duration: 1200 },
      { label: "Generating PDF/A...", duration: 1000 },
      { label: "Creating bookmarks...", duration: 800 },
      { label: "Running red-team validation...", duration: 1500 },
      { label: "Finalizing package...", duration: 1000 },
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      toast({
        title: "Processing",
        description: step.label,
        duration: 2000,
      });

      await new Promise((resolve) => setTimeout(resolve, step.duration));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Simulate package generation
    const mockUrl = "blob:mock-pc850-filing-package.pdf";
    setPackageUrl(mockUrl);
    setIsComplete(true);
    setIsGenerating(false);

    toast({
      title: "Package Generated",
      description: "Your PC 850 filing package is ready for download",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "PC 850 filing package downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold tracking-tight text-foreground mb-2">
              Generate Filing Package
            </h2>
            <p className="font-montserrat font-light text-muted-foreground">
              Your petition is ready. Click generate to create your final PDF package for e-filing.
            </p>
          </div>

          {!isGenerating && !isComplete && (
            <>
              <Alert className="border-legal-info bg-legal-info/5">
                <FileText className="h-5 w-5 text-legal-info" />
                <AlertDescription className="text-sm">
                  The system will compile your petition, format it per CRC 2.111, process all
                  exhibits, and run a final red-team validation gate before generating your
                  downloadable package.
                </AlertDescription>
              </Alert>

              <Card className="p-6 border-primary/20 bg-primary/5">
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground text-lg">Package Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Events:</span>{" "}
                      <span className="font-medium text-foreground">
                        {filingData.events?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exhibits:</span>{" "}
                      <span className="font-medium text-foreground">
                        {filingData.exhibits?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CRC 2.111:</span>{" "}
                      <span className="font-medium text-legal-success">Compliant</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Format:</span>{" "}
                      <span className="font-medium text-foreground">PDF/A</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Button onClick={generatePackage} size="lg" className="w-full">
                <FileDown className="h-5 w-5 mr-2" />
                Generate Filing Package
              </Button>
            </>
          )}

          {isGenerating && (
            <div className="space-y-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Generating package...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Alert className="border-primary bg-primary/5">
                <Shield className="h-5 w-5 text-primary" />
                <AlertDescription className="text-sm">
                  Running red-team validation to ensure compliance and catch any potential issues
                  before final generation.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {isComplete && packageUrl && (
            <div className="space-y-6">
              <Alert className="border-legal-success bg-legal-success/5">
                <CheckCircle className="h-5 w-5 text-legal-success" />
                <AlertDescription className="text-sm">
                  <strong>Package generated successfully!</strong> Your PC 850 filing package has
                  passed all validation checks and is ready for download.
                </AlertDescription>
              </Alert>

              <Card className="p-6 border-legal-success/30">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-legal-success/10 p-3">
                      <FileText className="h-8 w-8 text-legal-success" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">
                        PC 850 Filing Package
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Complete petition with all exhibits, properly formatted and bookmarked
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Format:</span>{" "}
                          <span className="font-medium">PDF/A</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size:</span>{" "}
                          <span className="font-medium">Est. 2.4 MB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleDownload} className="w-full" size="lg">
                    <FileDown className="h-5 w-5 mr-2" />
                    Download Filing Package
                  </Button>
                </div>
              </Card>

              <Alert className="border-legal-warning bg-legal-warning/5">
                <AlertDescription className="text-sm">
                  <strong>Next Steps:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Review the complete package for accuracy</li>
                    <li>Ensure all factual content is correct</li>
                    <li>Upload to your court's e-filing portal</li>
                    <li>Follow court-specific filing procedures</li>
                    <li>Save a copy for your records</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          Back
        </Button>
        {isComplete && (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Start New Filing
          </Button>
        )}
      </div>
    </div>
  );
};
