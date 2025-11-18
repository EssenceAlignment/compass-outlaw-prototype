import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import compassOutlawHomepage from "@/assets/compass-outlaw-homepage.png";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <img 
        src={compassOutlawHomepage} 
        alt="Compass Outlaw - Justice Is No Longer For Sale" 
        className="max-w-4xl w-full h-auto mb-8"
      />
      <button
        onClick={() => navigate("/auth")}
        className="font-montserrat font-extrabold text-2xl tracking-brand uppercase text-primary hover:text-primary/80 transition-colors"
      >
        ENTER
      </button>
    </div>
  );
};

export default Landing;
