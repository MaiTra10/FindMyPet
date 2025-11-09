import { motion } from "motion/react";
import { X, Clock, Activity, CheckCircle2, AlertCircle, AlertTriangle, Eye } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Separator } from "./ui/separator";

interface FilterBarProps {
  activeFilters: string[];
  onFilterToggle: (filter: string) => void;
  onClearAll: () => void;
}

const typeFilters: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Lost", label: "Lost", icon: AlertTriangle },
  { value: "Sighting", label: "Sighting", icon: Eye },
];

const statusFilters: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Recent", label: "Recent", icon: Clock },
  { value: "Active", label: "Active", icon: Activity },
  { value: "Found", label: "Found", icon: CheckCircle2 },
  { value: "Stale", label: "Stale", icon: AlertCircle },
];

export function FilterBar({
  activeFilters,
  onFilterToggle,
  onClearAll,
}: FilterBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Type Filter Buttons (Lost/Sighting) */}
        {typeFilters.map((filter) => {
          const isActive = activeFilters.includes(filter.value);
          const FilterIcon = filter.icon;

          return (
            <motion.button
              key={filter.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterToggle(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-card border border-border hover:border-primary/50"
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              <span className="text-sm">{filter.label}</span>
            </motion.button>
          );
        })}

        {/* Vertical Separator */}
        <div className="h-8 w-px bg-border flex-shrink-0 mx-1" />

        {/* Status Filter Buttons (Recent, Active, Found, Stale) */}
        {statusFilters.map((filter) => {
          const isActive = activeFilters.includes(filter.value);
          const FilterIcon = filter.icon;

          return (
            <motion.button
              key={filter.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterToggle(filter.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                isActive
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-card border border-border hover:border-primary/50"
              }`}
            >
              <FilterIcon className="w-4 h-4" />
              <span className="text-sm">{filter.label}</span>
            </motion.button>
          );
        })}

        {/* Clear All Button - moved to end */}
        {activeFilters.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-full transition-all flex-shrink-0 border border-border ml-auto"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear All</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
