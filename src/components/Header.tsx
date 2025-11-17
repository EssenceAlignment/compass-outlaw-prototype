import { Scale } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <Scale className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">MANUS.IM PC 850 Utility</h1>
            <p className="text-sm text-muted-foreground">
              Professional Filing Package Generator v12
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
