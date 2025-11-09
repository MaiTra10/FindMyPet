import { motion, AnimatePresence } from "motion/react";
import { X, Shield, CheckCircle2, UserCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";
import { UserType } from "./AuthButton";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void; // function that takes a UserType
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const navigate = useNavigate();

  type LoginResult = {
    user: UserType;
    raw: string;
  };

  async function loginWithGoogle(
    googleCredential: string
  ): Promise<LoginResult | null> {
    try {
      const response = await fetch(
        "https://hw36ag81i6.execute-api.us-west-2.amazonaws.com/test/google-log-in",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: googleCredential }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        const decoded: any = jwtDecode(data.token);
        const user: UserType = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
        };
        return { user, raw: data.token };
      } else {
        console.error("Login failed:", data.message || data.error);
        return null;
      }
    } catch (error) {
      console.error("Network or other error:", error);
      return null;
    }
  }

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
                {/* <Button
                  onClick={handleLogin}
                  className="w-full h-14 bg-gradient-to-br from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90 transition-all shadow-lg text-base"
                >
                  <UserCircle2 className="w-6 h-6 mr-2" />
                  Sign In
                </Button> */}
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    const token = credentialResponse.credential;
                    const result = await loginWithGoogle(token);
                    if (result) {
                      onLoginSuccess(result);
                      navigate("/");
                      onClose();
                    }
                  }}
                  onError={() => console.log("Login Failed")}
                  auto_select={true}
                />
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
