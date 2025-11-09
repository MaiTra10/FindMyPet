import { motion, AnimatePresence } from "motion/react";
import { X, Shield, CheckCircle2, UserCircle2 } from "lucide-react";
import { Button } from "./ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const handleLogin = async () => {
    // TODO: Add your login logic here
    console.log("Login button clicked - implement your auth logic");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-3xl border border-border overflow-hidden max-w-md w-full"
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-foreground mb-1">Sign In to FindMyPet</h3>
              <p className="text-sm text-muted-foreground">
                Create postings and help find lost pets
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Report Lost Pets</p>
                  <p className="text-xs text-muted-foreground">
                    Create listings for your lost pets
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Report Sightings</p>
                  <p className="text-xs text-muted-foreground">
                    Help others by reporting pet sightings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Track Your Reports</p>
                  <p className="text-xs text-muted-foreground">
                    Manage all your postings in one place
                  </p>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="space-y-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleLogin}
                  className="w-full h-14 bg-gradient-to-br from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all shadow-lg text-base"
                >
                  <UserCircle2 className="w-6 h-6 mr-2" />
                  Sign In
                </Button>
              </motion.div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Secure Sign In
                </p>
                <p className="text-xs text-muted-foreground">
                  Sign in securely with your account. We only access your basic profile information.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
