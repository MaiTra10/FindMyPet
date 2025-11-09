import { motion, AnimatePresence } from "motion/react";
import { Search, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleOwnerChoice = () => {
    // Store the choice so we don't show this again
    localStorage.setItem("findmypet_welcome_seen", "true");
    onClose();
    // Navigate to report page - they can choose lost pet form there
    navigate("/report");
  };

  const handleFinderChoice = () => {
    // Store the choice so we don't show this again
    localStorage.setItem("findmypet_welcome_seen", "true");
    onClose();
    // Navigate to report page - they can choose sighting form there
    navigate("/report");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-xl z-[60] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-3xl border border-border overflow-hidden max-w-lg w-full shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-border bg-gradient-to-br from-primary/10 to-accent/10">
            <div>
              <h2 className="text-foreground mb-1">Welcome to FindMyPet!</h2>
              <p className="text-sm text-muted-foreground">
                How can we help you today?
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Owner Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOwnerChoice}
              className="w-full p-6 bg-gradient-to-br from-primary/5 to-accent/5 hover:from-primary/10 hover:to-accent/10 rounded-2xl border-2 border-border hover:border-primary/50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground mb-1 group-hover:text-primary transition-colors">
                    I am an owner looking for a pet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create a listing for your lost pet and get help from the community
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Finder Option */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFinderChoice}
              className="w-full p-6 bg-gradient-to-br from-accent/5 to-primary/5 hover:from-accent/10 hover:to-primary/10 rounded-2xl border-2 border-border hover:border-accent/50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-foreground mb-1 group-hover:text-accent transition-colors">
                    I have found a lost pet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Report a sighting and help reunite a pet with their family
                  </p>
                </div>
              </div>
            </motion.button>

            {/* Skip Option */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  localStorage.setItem("findmypet_welcome_seen", "true");
                  onClose();
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Just browsing
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
