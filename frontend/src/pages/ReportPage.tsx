import { motion } from "motion/react";
import { useState } from "react";
import { PawPrint, Eye, Lock } from "lucide-react";
import { LostPetForm } from "../components/LostPetForm";
import { SightingForm } from "../components/SightingForm";
import { LoginModal } from "../components/LoginModal";
import { PageHeader } from "../components/PageHeader";
import { useAuth } from "../contexts/AuthContext";

type FormType = "lost" | "sighting";

export function ReportPage() {
  const [formType, setFormType] = useState<FormType>("lost");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen ml-32 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen ml-32 p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6"
            >
              <Lock className="w-12 h-12 text-primary" />
            </motion.div>

            <h1 className="text-foreground mb-4">Sign In Required</h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Please sign in to report lost pets or sightings. This helps us maintain
              a trustworthy community and allows you to manage your reports.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoginModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-lg"
            >
              Sign In to Continue
            </motion.button>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-card rounded-2xl border border-border">
                <PawPrint className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="mb-2">Report Lost Pets</h3>
                <p className="text-sm text-muted-foreground">
                  Create detailed listings with photos and location to help find your
                  lost pet
                </p>
              </div>
              <div className="p-6 bg-card rounded-2xl border border-border">
                <Eye className="w-8 h-8 text-primary mb-3 mx-auto" />
                <h3 className="mb-2">Report Sightings</h3>
                <p className="text-sm text-muted-foreground">
                  Help reunite pets with their families by reporting sightings
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen ml-32 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <PageHeader
          subtitle="Help reunite lost pets with their families"
        />

        {/* Form Type Selector */}
        <div className="flex gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormType("lost")}
            className={`flex-1 p-6 rounded-3xl border transition-all ${
              formType === "lost"
                ? "bg-gradient-to-br from-primary to-accent text-white border-transparent shadow-lg"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <PawPrint
              className={`w-8 h-8 mx-auto mb-3 ${
                formType === "lost" ? "text-white" : "text-primary"
              }`}
            />
            <h3 className={formType === "lost" ? "text-white" : ""}>
              Report Lost Pet
            </h3>
            <p
              className={`text-sm mt-2 ${
                formType === "lost" ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              I've lost my pet and need help finding them
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormType("sighting")}
            className={`flex-1 p-6 rounded-3xl border transition-all ${
              formType === "sighting"
                ? "bg-gradient-to-br from-primary to-accent text-white border-transparent shadow-lg"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <Eye
              className={`w-8 h-8 mx-auto mb-3 ${
                formType === "sighting" ? "text-white" : "text-primary"
              }`}
            />
            <h3 className={formType === "sighting" ? "text-white" : ""}>
              Report Sighting
            </h3>
            <p
              className={`text-sm mt-2 ${
                formType === "sighting"
                  ? "text-white/80"
                  : "text-muted-foreground"
              }`}
            >
              I've seen a lost pet and want to help
            </p>
          </motion.button>
        </div>

        {/* Form Content */}
        <motion.div
          key={formType}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {formType === "lost" ? <LostPetForm /> : <SightingForm />}
        </motion.div>
      </motion.div>
    </div>
  );
}
