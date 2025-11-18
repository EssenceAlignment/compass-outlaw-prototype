import { LogOut, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import compassOutlawLogo from '@/assets/compass-outlaw-logo.png';

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="border-b border-border bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12">
              <img 
                src={compassOutlawLogo} 
                alt="Compass Outlaw Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-montserrat font-extrabold tracking-brand uppercase text-foreground">
                Compass Outlaw
              </h1>
              <p className="text-sm font-montserrat font-light tracking-wide text-muted-foreground">
                Professional Filing Package Generator v12
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-montserrat font-normal text-muted-foreground">{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="font-montserrat font-medium">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
