import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { motion } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { TopRightAuth } from "./components/TopRightAuth";
import { WelcomeModal } from "./components/WelcomeModal";
import { Listings } from "./pages/Listings";
import { MapView } from "./pages/MapView";
import { Followed } from "./pages/Followed";
import { ReportPage } from "./pages/ReportPage";
import { PetDetails } from "./pages/PetDetails";
import { Profile } from "./pages/Profile";
import { PetType } from "./types/pet";
import logoImage from "figma:asset/2efd0e818f5722b9374e1fd5a951dc99b3656823.png";
import "./styles/globals.css";

// ========================================
// AUTHENTICATION MODE TOGGLE
// ========================================
// Set to true to use mock/guest authentication
// Set to false to use real Google OAuth authentication
export const USE_MOCK_AUTH = false;
// ========================================

// Google OAuth Client ID
// For frontend-only authentication (presentation/demo purposes)
// Make sure your Google Cloud Console has these authorized JavaScript origins:
// - http://localhost:5173 (or your local dev URL)
// - https://your-production-domain.com
const GOOGLE_CLIENT_ID = "545463699061-8ragccbe0lgfb662pco5qnj2q65v452t.apps.googleusercontent.com";

function AppContent() {
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("findmypet_welcome_seen");
    
    // Show welcome modal if not authenticated and hasn't seen it before
    if (!isLoading && !isAuthenticated && !hasSeenWelcome) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Logo */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.02 }}
        className="fixed left-6 top-6 z-50 w-24 h-24 rounded-2xl overflow-hidden bg-white shadow-2xl flex-shrink-0"
      >
        <img 
          src={logoImage} 
          alt="FindMyPet Logo" 
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Top Right Auth */}
      <TopRightAuth />

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />

      <Navbar 
        selectedPetType={selectedPetType} 
        onPetTypeChange={setSelectedPetType} 
      />
      <Routes>
        <Route path="/" element={<Listings selectedPetType={selectedPetType} />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/followed" element={<Followed />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/pet/:id" element={<PetDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider useMockAuth={USE_MOCK_AUTH}>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
