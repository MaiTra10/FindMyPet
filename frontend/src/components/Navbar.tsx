import { Home, Heart, Sparkles, Info, Cat } from "lucide-react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Heart, label: "Favorites", path: "#" },
    { icon: Sparkles, label: "Gallery", path: "#" },
    { icon: Info, label: "About", path: "#" },
  ];

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
    >
      <div className="flex flex-col gap-4 p-4 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center mb-2"
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Cat className="w-6 h-6 text-white" />
          </div>
        </motion.div>

        {/* Nav Items */}
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={index} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group cursor-pointer p-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-primary to-accent shadow-lg"
                    : "hover:bg-muted"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-white" : "text-foreground"
                  }`}
                />

                {/* Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-card rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border">
                  <p className="text-sm">{item.label}</p>
                </div>
              </motion.div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-full h-px bg-border my-2" />

        {/* Theme Toggle */}
        <div className="flex items-center justify-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ThemeToggle />
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
