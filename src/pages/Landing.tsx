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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <img 
        src={compassOutlawHomepage} 
        alt="Compass Outlaw - Justice Is No Longer For Sale" 
        className="max-w-4xl w-full h-auto cursor-pointer animate-fade-in hover:scale-[1.02] transition-transform duration-300"
        onClick={() => navigate("/auth")}
      />
    </div>
  );
};

export default Landing;
