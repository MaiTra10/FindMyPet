import { motion, AnimatePresence } from "motion/react";
import { X, Shield, CheckCircle2, UserCircle2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, useMockAuth } = useAuth();

  const handleGuestLogin = async () => {
    try {
      // Create a guest/demo user
      const guestUser = {
        id: "guest-user-123",
        email: "guest@findmypet.com",
        name: "Guest User",
        picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=GuestUser",
      };

      await login("guest-token-123", guestUser);
      toast.success("Signed in as Guest!");
      onClose();
    } catch (error) {
      console.error("Guest login error:", error);
      toast.error("Failed to sign in. Please try again.");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userInfo = await userInfoResponse.json();

        // Create user object
        const userData = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        };

        console.log("Google user data received:", userData);
        
        try {
          await login(tokenResponse.access_token, userData);
          console.log("Login function completed");
          
          // Verify the user was saved
          const savedUser = localStorage.getItem("findmypet_user");
          console.log("User saved to localStorage:", savedUser);
          
          toast.success(`Welcome back, ${userInfo.name}!`);
          
          // Close modal and force a small delay for state propagation
          setTimeout(() => {
            onClose();
            // Force a re-render by checking the state
            console.log("Modal closed, login complete");
          }, 200);
        } catch (loginError) {
          console.error("Login function failed:", loginError);
          throw loginError;
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Failed to sign in with Google. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      toast.error("Failed to sign in with Google.");
    },
  });

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

            {/* Login Buttons */}
            <div className="space-y-4">
              {useMockAuth ? (
                // Mock/Guest Mode
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleGuestLogin}
                    className="w-full h-14 bg-gradient-to-br from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all shadow-lg text-base"
                  >
                    <UserCircle2 className="w-6 h-6 mr-2" />
                    Continue as Guest
                  </Button>
                </motion.div>
              ) : (
                // Real Google OAuth
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => handleGoogleLogin()}
                    className="w-full h-14 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 transition-all shadow-lg text-base"
                  >
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {useMockAuth ? "Guest Mode" : "Secure Sign In"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {useMockAuth
                    ? "Explore all features with a guest account. Your data will be saved locally. You can sign out anytime from your profile."
                    : "Sign in securely with your Google account. We only access your basic profile information."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
