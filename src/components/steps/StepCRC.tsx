import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [compliance, setCompliance] = useState<Record<string, boolean>>(data || {});

  const allChecked = CRC_REQUIREMENTS.every((req) => compliance[req.id]);
  const checkedCount = Object.values(compliance).filter(Boolean).length;

  const handleCheckChange = (id: string, checked: boolean) => {
    setCompliance((prev) => ({ ...prev, [id]: checked }));
  };

  const handleNext = () => {
    onNext({ compliance });
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
