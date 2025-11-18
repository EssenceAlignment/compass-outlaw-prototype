import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, FileText, Shield, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StepIntroductionProps {
  onNext: () => void;
}

export const StepIntroduction = ({ onNext }: StepIntroductionProps) => {
  return (
    <div className="space-y-6">
      <Card className="p-8 shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-montserrat font-bold tracking-tight text-foreground mb-2">
              PC 850 Petition Filing Utility
            </h2>
            <p className="text-lg font-montserrat font-light leading-relaxed text-muted-foreground">
              Professional-grade formatting and packaging system for California Penal Code § 850 Petitions
            </p>
          </div>

          <Alert className="border-legal-info bg-legal-info/5">
            <Shield className="h-5 w-5 text-legal-info" />
            <AlertDescription className="text-sm">
              <strong>Important:</strong> This utility provides formatting and procedural assistance only.
              It does NOT provide legal advice, strategy, or substantive guidance. Consult with an attorney
              for legal counsel.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4 border-accent/20 bg-accent/5">
              <FileText className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-montserrat font-semibold text-foreground mb-2">Document Preparation</h3>
              <p className="text-sm font-montserrat font-light text-muted-foreground">
                Format your petition according to California Rules of Court 2.111 standards
              </p>
            </Card>

            <Card className="p-4 border-accent/20 bg-accent/5">
              <CheckCircle className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-montserrat font-semibold text-foreground mb-2">Compliance Verification</h3>
              <p className="text-sm font-montserrat font-light text-muted-foreground">
                Automated preflight checks ensure your filing meets all technical requirements
              </p>
            </Card>

            <Card className="p-4 border-accent/20 bg-accent/5">
              <Shield className="h-8 w-8 text-accent mb-3" />
              <h3 className="font-montserrat font-semibold text-foreground mb-2">Red-Team Validation</h3>
              <p className="text-sm font-montserrat font-light text-muted-foreground">
                Final validation gate catches errors before e-filing submission
              </p>
            </Card>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-montserrat font-semibold text-foreground">This utility will guide you through:</h3>
            <ul className="space-y-2 text-sm font-montserrat font-light text-muted-foreground">
...
            </ul>
          </div>

          <Alert className="border-legal-warning bg-legal-warning/5">
            <AlertCircle className="h-5 w-5 text-legal-warning" />
            <AlertDescription className="text-sm">
              <strong>Pro Per Notice:</strong> While this system automates formatting and technical
              compliance, you remain responsible for the accuracy of all factual content and the legal
              sufficiency of your petition. Review all generated documents carefully before filing.
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="min-w-32">
          Begin Setup
        </Button>
      </div>
    </div>
  );
};
