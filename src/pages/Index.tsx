import { useState } from "react";
import { Header } from "@/components/Header";
import { WizardProgress } from "@/components/WizardProgress";
import { StepIntroduction } from "@/components/steps/StepIntroduction";
import { StepESV } from "@/components/steps/StepESV";
import { StepCRC } from "@/components/steps/StepCRC";
import { StepExhibits } from "@/components/steps/StepExhibits";
import { StepPreflight } from "@/components/steps/StepPreflight";
import { StepGenerate } from "@/components/steps/StepGenerate";

const STEPS = [
  { id: "intro", label: "Introduction" },
  { id: "esv", label: "Event Sequence" },
  { id: "crc", label: "CRC 2.111" },
  { id: "exhibits", label: "Exhibits" },
  { id: "preflight", label: "Preflight" },
  { id: "generate", label: "Generate" },
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [filingData, setFilingData] = useState({
    events: [],
    exhibits: [],
    compliance: {},
  });

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setFilingData((prev) => ({ ...prev, ...stepData }));
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepIntroduction onNext={handleNext} />;
      case 1:
        return <StepESV onNext={handleNext} onBack={handleBack} data={filingData.events} />;
      case 2:
        return <StepCRC onNext={handleNext} onBack={handleBack} data={filingData.compliance} />;
      case 3:
        return <StepExhibits onNext={handleNext} onBack={handleBack} data={filingData.exhibits} />;
      case 4:
        return <StepPreflight onNext={handleNext} onBack={handleBack} filingData={filingData} />;
      case 5:
        return <StepGenerate onBack={handleBack} filingData={filingData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <WizardProgress steps={STEPS} currentStep={currentStep} />
        <div className="mt-8">{renderStep()}</div>
      </main>
    </div>
  );
};

export default Index;
