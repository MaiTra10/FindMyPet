import { motion } from "motion/react";
import { useState } from "react";
import { PawPrint, Eye } from "lucide-react";
import { LostPetForm } from "../components/LostPetForm";
import { SightingForm } from "../components/SightingForm";
import { PageHeader } from "../components/PageHeader";
import { UserProvider } from "../components/UserContext";

type FormType = "lost" | "sighting";

export function ReportPage() {
  const [formType, setFormType] = useState<FormType>("lost");

  // TODO: Add your own authentication check here if you want to protect this page
  // Example:
  // const isAuthenticated = checkYourAuthStatus();
  // if (!isAuthenticated) {
  //   return <div>Please sign in to report pets</div>;
  // }

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
            className={`flex-1 p-6 rounded-3xl border transition-all ${formType === "lost"
              ? "bg-gradient-to-br from-primary to-accent text-white border-transparent shadow-lg"
              : "bg-card border-border hover:border-primary/50"
              }`}
          >
            <PawPrint
              className={`w-8 h-8 mx-auto mb-3 ${formType === "lost" ? "text-white" : "text-primary"
                }`}
            />
            <h3 className={formType === "lost" ? "text-white" : ""}>
              Report Lost Pet
            </h3>
            <p
              className={`text-sm mt-2 ${formType === "lost" ? "text-white/80" : "text-muted-foreground"
                }`}
            >
              I've lost my pet and need help finding them
            </p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFormType("sighting")}
            className={`flex-1 p-6 rounded-3xl border transition-all ${formType === "sighting"
              ? "bg-gradient-to-br from-primary to-accent text-white border-transparent shadow-lg"
              : "bg-card border-border hover:border-primary/50"
              }`}
          >
            <Eye
              className={`w-8 h-8 mx-auto mb-3 ${formType === "sighting" ? "text-white" : "text-primary"
                }`}
            />
            <h3 className={formType === "sighting" ? "text-white" : ""}>
              Report Sighting
            </h3>
            <p
              className={`text-sm mt-2 ${formType === "sighting"
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
          <UserProvider>
            {formType === "lost" ? <LostPetForm /> : <SightingForm />}
          </UserProvider>
        </motion.div>
      </motion.div>
    </div>
  );
}
