import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
}

interface WizardProgressProps {
  steps: Step[];
  currentStep: number;
}

export const WizardProgress = ({ steps, currentStep }: WizardProgressProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  index < currentStep && "border-accent bg-accent text-accent-foreground",
                  index === currentStep && "border-primary bg-primary text-primary-foreground scale-110",
                  index > currentStep && "border-muted bg-background text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center whitespace-nowrap",
                  index === currentStep && "text-primary font-bold",
                  index < currentStep && "text-accent",
                  index > currentStep && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-2 transition-all",
                  index < currentStep ? "bg-accent" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
