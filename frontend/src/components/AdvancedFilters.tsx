import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp, SlidersHorizontal, MapPin, Calendar, Tag } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export interface AdvancedFilterValues {
  breed?: string;
  location?: string;
  gender?: string;
  dateRange?: string;
  ageRange?: string;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterValues;
  onFilterChange: (filters: AdvancedFilterValues) => void;
  onClearAdvanced: () => void;
}

export function AdvancedFilters({
  filters,
  onFilterChange,
  onClearAdvanced,
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterUpdate = (key: keyof AdvancedFilterValues, value: string) => {
    if (value === "all" || value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFilterChange(newFilters);
    } else {
      onFilterChange({ ...filters, [key]: value });
    }
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all mb-4"
      >
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <span className="text-foreground">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </motion.button>

      {/* Expanded Filter Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-2xl p-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Breed Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Breed
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Golden Retriever"
                    value={filters.breed || ""}
                    onChange={(e) => handleFilterUpdate("breed", e.target.value)}
                    className="rounded-xl bg-background border-border"
                  />
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Portland, OR"
                    value={filters.location || ""}
                    onChange={(e) => handleFilterUpdate("location", e.target.value)}
                    className="rounded-xl bg-background border-border"
                  />
                </div>

                {/* Gender Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Gender</label>
                  <Select
                    value={filters.gender || "all"}
                    onValueChange={(value) => handleFilterUpdate("gender", value)}
                  >
                    <SelectTrigger className="rounded-xl bg-background border-border">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Posted
                  </label>
                  <Select
                    value={filters.dateRange || "all"}
                    onValueChange={(value) => handleFilterUpdate("dateRange", value)}
                  >
                    <SelectTrigger className="rounded-xl bg-background border-border">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="3months">Past 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Age Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Age Range</label>
                  <Select
                    value={filters.ageRange || "all"}
                    onValueChange={(value) => handleFilterUpdate("ageRange", value)}
                  >
                    <SelectTrigger className="rounded-xl bg-background border-border">
                      <SelectValue placeholder="All Ages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="puppy">Adolescent (0-1 year)</SelectItem>
                      <SelectItem value="young">Young (1-3 years)</SelectItem>
                      <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                      <SelectItem value="senior">Senior (7+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Advanced Filters Button */}
              {activeFilterCount > 0 && (
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={onClearAdvanced}
                    className="rounded-xl"
                  >
                    Clear Advanced Filters
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
