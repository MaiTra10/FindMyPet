import { motion, AnimatePresence } from "motion/react";
import { LogIn, LogOut, FileText, ChevronDown, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LoginModal } from "./LoginModal";
import { useUser } from "./UserContext";

export interface UserType {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export function AuthButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { authUser, setAuthUser } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isAuthenticated = !!authUser; // true if user object exists

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    setAuthUser(null); // automatically clears localStorage
    setIsOpen(false);
    navigate("/");
  };

  // If not authenticated, show sign in button
  if (!isAuthenticated) {
    return (
      <>
        <motion.button
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLoginModal(true)}
          className="fixed right-6 top-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-primary to-accent text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <LogIn className="w-5 h-5" />
          <span className="font-medium">Sign In</span>
        </motion.button>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(authUser) => {
            setAuthUser(authUser);
            setShowLoginModal(false);
          }}
        />
      </>
    );
  }

  // If authenticated, show user menu
  const initials = authUser.user.name
    ? authUser.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  return (
    <div className="fixed right-6 top-6 z-50" ref={menuRef}>
      <motion.button
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 bg-card/80 backdrop-blur-xl rounded-full shadow-lg border border-border hover:shadow-xl transition-shadow"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={authUser.user.picture} alt={authUser.user.name || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-left pr-1">
          <p className="text-sm font-medium leading-none mb-0.5">{authUser.user.name || "User"}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {authUser.user.email || ""}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
            }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-64 bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-lg overflow-hidden"
          >
            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/profile");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition-colors text-left"
              >
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">View Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navigate to user's reports page
                  console.log("My Reports clicked");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">My Reports</span>
              </button>

              <div className="w-full h-px bg-border my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
