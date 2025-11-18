import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Trash2, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Exhibit {
  id: string;
  file: File | null;
  label: string;
  description: string;
}

interface StepExhibitsProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: any;
}

export const StepExhibits = ({ onNext, onBack, data }: StepExhibitsProps) => {
  const { toast } = useToast();
  const [exhibits, setExhibits] = useState<Exhibit[]>(
    data?.length > 0 ? data : []
  );

  const addExhibit = () => {
    setExhibits([
      ...exhibits,
      {
        id: Date.now().toString(),
        file: null,
        label: `Exhibit ${String.fromCharCode(65 + exhibits.length)}`,
        description: "",
      },
    ]);
  };

  const removeExhibit = (id: string) => {
    setExhibits(exhibits.filter((e) => e.id !== id));
  };

  const updateExhibit = (
    id: string,
    field: keyof Exhibit,
    value: string | File | null
  ) => {
    setExhibits(exhibits.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Only PDF files are accepted for exhibits",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Exhibits must be under 10MB",
          variant: "destructive",
        });
        return;
      }
    }
    updateExhibit(id, "file", file);
  };

  const handleNext = () => {
    onNext({ exhibits });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold tracking-tight text-foreground mb-2">
              Exhibit Processing
            </h2>
            <p className="font-montserrat font-light text-muted-foreground">
              Upload supporting documents as exhibits. Each will be properly bookmarked and
              formatted for e-filing compliance.
            </p>
          </div>

          <Alert className="border-legal-info bg-legal-info/5">
            <FileText className="h-5 w-5 text-legal-info" />
            <AlertDescription className="text-sm font-montserrat font-light">
              Exhibits must be in PDF format. The system will automatically bookmark each exhibit
              and convert to PDF/A format for archival compliance.
            </AlertDescription>
          </Alert>

          {exhibits.length === 0 ? (
            <Card className="p-8 border-dashed border-2 border-muted">
              <div className="text-center space-y-3">
                <FileUp className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="font-semibold text-foreground">No Exhibits Added</h3>
                  <p className="text-sm text-muted-foreground">
                    Add exhibits to support your petition (optional)
                  </p>
                </div>
                <Button onClick={addExhibit}>Add First Exhibit</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {exhibits.map((exhibit, index) => (
                <Card key={exhibit.id} className="p-4 border-muted">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary text-lg">
                            {String.fromCharCode(65 + index)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{exhibit.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {exhibit.file ? exhibit.file.name : "No file selected"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExhibit(exhibit.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`label-${exhibit.id}`}>Exhibit Label</Label>
                        <Input
                          id={`label-${exhibit.id}`}
                          value={exhibit.label}
                          onChange={(e) =>
                            updateExhibit(exhibit.id, "label", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`file-${exhibit.id}`}>PDF File</Label>
                        <Input
                          id={`file-${exhibit.id}`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) =>
                            handleFileChange(exhibit.id, e.target.files?.[0] || null)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`desc-${exhibit.id}`}>Description</Label>
                      <Input
                        id={`desc-${exhibit.id}`}
                        value={exhibit.description}
                        onChange={(e) =>
                          updateExhibit(exhibit.id, "description", e.target.value)
                        }
                        placeholder="Brief description of this exhibit..."
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {exhibits.length > 0 && (
            <Button variant="outline" onClick={addExhibit} className="w-full">
              <FileUp className="h-4 w-4 mr-2" />
              Add Another Exhibit
            </Button>
          )}

          <Alert className="border-legal-warning bg-legal-warning/5">
            <AlertCircle className="h-5 w-5 text-legal-warning" />
            <AlertDescription className="text-sm">
              <strong>Pro Tip:</strong> Exhibits will be automatically lettered (A, B, C...) and
              bookmarked in your final PDF package. Ensure each exhibit is relevant and properly
              described.
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Next: Preflight Check
        </Button>
      </div>
    </div>
  );
};
