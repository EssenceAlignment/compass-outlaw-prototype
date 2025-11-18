import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  date: string;
  description: string;
}

interface StepESVProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: any;
}

export const StepESV = ({ onNext, onBack, data }: StepESVProps) => {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(
    data?.length > 0 ? data : [{ id: "1", date: "", description: "" }]
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const addEvent = () => {
    setEvents([...events, { id: Date.now().toString(), date: "", description: "" }]);
  };

  const removeEvent = (id: string) => {
    if (events.length > 1) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const updateEvent = (id: string, field: "date" | "description", value: string) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const validateSequence = () => {
    const errors: string[] = [];
    const sortedEvents = [...events]
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Check for missing dates
    const missingDates = events.filter((e) => !e.date);
    if (missingDates.length > 0) {
      errors.push(`${missingDates.length} event(s) missing dates`);
    }

    // Check for chronological order
    for (let i = 1; i < sortedEvents.length; i++) {
      if (sortedEvents[i].date < sortedEvents[i - 1].date) {
        errors.push("Events are not in chronological order");
        break;
      }
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      toast({
        title: "Validation Passed",
        description: "Event sequence is chronologically valid",
      });
      return true;
    } else {
      toast({
        title: "Validation Failed",
        description: errors.join(", "),
        variant: "destructive",
      });
      return false;
    }
  };

  const handleNext = () => {
    if (validateSequence()) {
      onNext({ events });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold tracking-tight text-foreground mb-2">
              Event Sequence Verification (ESV)
            </h2>
            <p className="font-montserrat font-light text-muted-foreground">
              Enter all relevant events in your case. The system will verify chronological order and
              flag any date inconsistencies.
            </p>
          </div>

          <Alert className="border-legal-info bg-legal-info/5">
            <Calendar className="h-5 w-5 text-legal-info" />
            <AlertDescription className="text-sm">
              Enter dates in chronological order. ESV will validate that all events form a
              logically consistent timeline.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {events.map((event, index) => (
              <Card key={event.id} className="p-4 border-muted">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`date-${event.id}`}>Event Date</Label>
                      <Input
                        id={`date-${event.id}`}
                        type="date"
                        value={event.date}
                        onChange={(e) => updateEvent(event.id, "date", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`desc-${event.id}`}>Event Description</Label>
                      <Input
                        id={`desc-${event.id}`}
                        type="text"
                        value={event.description}
                        onChange={(e) => updateEvent(event.id, "description", e.target.value)}
                        placeholder="e.g., Arrest, Arraignment, Trial..."
                        className="w-full"
                      />
                    </div>
                  </div>
                  {events.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEvent(event.id)}
                      className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Button variant="outline" onClick={addEvent} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another Event
          </Button>

          {validationErrors.length > 0 && (
            <Alert className="border-legal-warning bg-legal-warning/5">
              <AlertTriangle className="h-5 w-5 text-legal-warning" />
              <AlertDescription>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {validationErrors.length === 0 && events.every((e) => e.date) && (
            <Alert className="border-legal-success bg-legal-success/5">
              <CheckCircle className="h-5 w-5 text-legal-success" />
              <AlertDescription className="text-sm">
                All events have valid dates. Ready to proceed.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={validateSequence}>
            Validate Sequence
          </Button>
          <Button onClick={handleNext}>Next: CRC 2.111</Button>
        </div>
      </div>
    </div>
  );
};
