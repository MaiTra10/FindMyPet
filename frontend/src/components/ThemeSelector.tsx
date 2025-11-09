import { Palette, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

type ThemeColor = "pink" | "brown" | "blue" | "green";
type ThemeMode = "light" | "dark";

interface Theme {
  color: ThemeColor;
  mode: ThemeMode;
}

const themeOptions: { color: ThemeColor; name: string; lightColor: string; darkColor: string }[] = [
  { color: "pink", name: "Pink", lightColor: "#e879f9", darkColor: "#c084fc" },
  { color: "brown", name: "Brown", lightColor: "#8d6e63", darkColor: "#a1887f" },
  { color: "blue", name: "Blue", lightColor: "#0ea5e9", darkColor: "#38bdf8" },
  { color: "green", name: "Green", lightColor: "#22c55e", darkColor: "#4ade80" },
];

export function ThemeSelector() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>({ color: "brown", mode: "light" });

  useEffect(() => {
    // Load saved theme from localStorage, default to brown
    const savedColor = (localStorage.getItem("themeColor") as ThemeColor) || "brown";
    const savedMode = (localStorage.getItem("themeMode") as ThemeMode) || "light";
    
    setCurrentTheme({ color: savedColor, mode: savedMode });
    applyTheme(savedColor, savedMode);
  }, []);

  const applyTheme = (color: ThemeColor, mode: ThemeMode) => {
    const html = document.documentElement;
    
    // Remove all theme classes
    html.classList.remove("dark", "theme-brown", "theme-blue", "theme-green");
    
    // Apply color theme class
    if (color !== "pink") {
      html.classList.add(`theme-${color}`);
    }
    
    // Apply dark mode if needed
    if (mode === "dark") {
      html.classList.add("dark");
    }
    
    // Save to localStorage
    localStorage.setItem("themeColor", color);
    localStorage.setItem("themeMode", mode);
  };

  const handleThemeChange = (color: ThemeColor, mode: ThemeMode) => {
    setCurrentTheme({ color, mode });
    applyTheme(color, mode);
    setIsExpanded(false);
  };

  const toggleMode = () => {
    const newMode = currentTheme.mode === "light" ? "dark" : "light";
    handleThemeChange(currentTheme.color, newMode);
  };

  const currentThemeOption = themeOptions.find((t) => t.color === currentTheme.color);
  const currentColor = currentTheme.mode === "light" 
    ? currentThemeOption?.lightColor 
    : currentThemeOption?.darkColor;

  return (
    <div className="relative">
      {/* Main Theme Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="w-5 h-5 text-white" />
      </motion.button>

      {/* Expanded Theme Options */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border p-3 min-w-[200px]"
          >
            <div className="space-y-3">
              {/* Light/Dark Mode Toggle */}
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs text-muted-foreground">Mode</span>
                <motion.button
                  onClick={toggleMode}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-accent transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {currentTheme.mode === "light" ? (
                    <>
                      <Sun className="w-4 h-4" />
                      <span className="text-xs">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      <span className="text-xs">Dark</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Theme Color Options */}
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Colors</span>
                <div className="grid grid-cols-2 gap-2">
                  {themeOptions.map((theme) => {
                    const isActive = currentTheme.color === theme.color;
                    const displayColor = currentTheme.mode === "light" 
                      ? theme.lightColor 
                      : theme.darkColor;
                    
                    return (
                      <motion.button
                        key={theme.color}
                        onClick={() => handleThemeChange(theme.color, currentTheme.mode)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                          isActive 
                            ? "bg-accent ring-2 ring-primary" 
                            : "bg-muted hover:bg-accent"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className="w-4 h-4 rounded-full shadow-inner"
                          style={{ backgroundColor: displayColor }}
                        />
                        <span className="text-xs">{theme.name}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
