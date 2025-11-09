import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { Navbar } from "./components/Navbar";
import { AuthButton } from "./components/AuthButton";
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

function AppContent() {
  const [selectedPetType, setSelectedPetType] = useState<PetType | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem("findmypet_welcome_seen");
    
    // Show welcome modal if not seen before
    if (!hasSeenWelcome) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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

      {/* Auth Button - Sign In / User Menu */}
      <AuthButton />

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
    <Router>
      <AppContent />
    </Router>
  );
}
