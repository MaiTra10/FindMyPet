import { Home, Map, Heart, PlusCircle, Cat, Dog, Rabbit, Bird, PawPrint } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { ThemeSelector } from "./ThemeSelector";
import { useState } from "react";
import { PetType } from "../types/pet";

interface NavbarProps {
  selectedPetType: PetType | null;
  onPetTypeChange: (type: PetType | null) => void;
}

export function Navbar({ selectedPetType, onPetTypeChange }: NavbarProps) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: Home, label: "Listings", path: "/" },
    { icon: Map, label: "Map", path: "/map" },
    { icon: Heart, label: "Followed", path: "/followed" },
    { icon: PlusCircle, label: "Report", path: "/report" },
  ];

  const petTypes = [
    { type: "Cat" as PetType, icon: Cat, label: "Cat" },
    { type: "Dog" as PetType, icon: Dog, label: "Dog" },
    { type: "Bunny" as PetType, icon: Rabbit, label: "Bunny" },
    { type: "Bird" as PetType, icon: Bird, label: "Bird" },
    { type: "Other" as PetType, icon: PawPrint, label: "Other" },
  ];

  const currentPet = selectedPetType 
    ? petTypes.find(p => p.type === selectedPetType) 
    : null;
  const CurrentIcon = currentPet?.icon || PawPrint;

  return (
    <motion.nav
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
    >
      <div className="flex flex-col gap-4 p-4 bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-border">
        {/* Pet Type Selector */}
        <div className="flex items-center justify-center relative">
          {/* Main Pet Selector Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setIsExpanded(!isExpanded);
              // If clicking and there's a selected pet, clear it to show all
              if (!isExpanded && selectedPetType) {
                onPetTypeChange(null);
              }
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg cursor-pointer flex-shrink-0 ${
              selectedPetType 
                ? "bg-gradient-to-br from-primary to-accent" 
                : "bg-muted"
            }`}
          >
            <CurrentIcon className={`w-7 h-7 ${selectedPetType ? "text-white" : "text-foreground"}`} />
          </motion.div>

          {/* Expandable Pet Options - Float out to the right */}
          <AnimatePresence>
            {isExpanded && (
              <>
                {petTypes
                  .filter(pet => pet.type !== selectedPetType)
                  .map((pet, index) => {
                    const PetIcon = pet.icon;
                    return (
                      <motion.div
                        key={pet.type}
                        initial={{ opacity: 0, scale: 0, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0, x: -20 }}
                        transition={{ 
                          duration: 0.2,
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        style={{
                          position: 'absolute',
                          left: `${(index + 1) * 64}px`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        className="p-2 bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onPetTypeChange(pet.type);
                            setIsExpanded(false);
                          }}
                          className="w-10 h-10 rounded-full bg-muted hover:bg-gradient-to-br hover:from-primary hover:to-accent flex items-center justify-center shadow-md transition-all group relative"
                        >
                          <PetIcon className="w-5 h-5 text-foreground group-hover:text-white transition-colors" />
                          
                          {/* Tooltip - Above the button */}
                          <div className="absolute bottom-full mb-2 px-2 py-1 bg-card rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-border text-xs">
                            {pet.label}
                          </div>
                        </motion.button>
                      </motion.div>
                    );
                  })}
              </>
            )}
          </AnimatePresence>
        </div>

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
        <div className="w-full h-px bg-border" />

        {/* Theme Selector */}
        <div className="flex items-center justify-center">
          <ThemeSelector />
        </div>
      </div>
    </motion.nav>
  );
}
