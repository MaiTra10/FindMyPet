import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { PetCard } from "../components/PetCard";
import { FilterBar } from "../components/FilterBar";
import { AdvancedFilters, AdvancedFilterValues } from "../components/AdvancedFilters";
import { Input } from "../components/ui/input";
import { PageHeader } from "../components/PageHeader";
import { PetListing, PetType } from "../types/pet";
import { useUser } from "../components/UserContext";
import { AuthUser } from "../components/UserContext";

interface ListingsProps {
  selectedPetType: PetType | null;
}

export function Listings({ selectedPetType }: ListingsProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterValues>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [pets, setPets] = useState<PetListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const fetchPets = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();

        // --- Basic Filters ---
        if (selectedPetType) params.append("animalType", selectedPetType);
        if (searchQuery) params.append("search", searchQuery);

        // --- Filter Bar (Lost/Sighting, Active/Found/etc.) ---
        const typeFilter = activeFilters.find(f => ["Lost", "Sighting"].includes(f));
        const statusFilter = activeFilters.find(f => ["Recent", "Active", "Found", "Stale"].includes(f));
        if (typeFilter) params.append("type", typeFilter);
        if (statusFilter) params.append("status", statusFilter);

        // --- Advanced Filters ---
        if (advancedFilters.breed) params.append("breed", advancedFilters.breed);
        if (advancedFilters.location) params.append("location", advancedFilters.location);
        if (advancedFilters.gender && advancedFilters.gender !== "all") params.append("gender", advancedFilters.gender);
        if (advancedFilters.dateRange && advancedFilters.dateRange !== "all") params.append("dateRange", advancedFilters.dateRange);
        if (advancedFilters.ageRange && advancedFilters.ageRange !== "all") params.append("ageRange", advancedFilters.ageRange);

        console.log("Here is our user", authUser?.raw);

        // --- Build request URL ---
        const url = `https://hw36ag81i6.execute-api.us-west-2.amazonaws.com/test/lost-listing?${params.toString()}`;

        // --- Make GET request with JWT ---
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${authUser?.raw}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch pets");
        const data = await response.json();
        setPets(data.data);

      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, [selectedPetType, searchQuery, activeFilters, advancedFilters]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const handleClearFilters = () => {
    setActiveFilters([]);
  };

  const handleClearAdvanced = () => {
    setAdvancedFilters({});
  };

  const handleToggleFollow = (id: string) => {
    setPets((prev) =>
      prev.map((pet) =>
        pet.id === id ? { ...pet, isFollowed: !pet.isFollowed } : pet
      )
    );
  };

  const filteredPets = pets.filter((pet) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !pet.name.toLowerCase().includes(query) &&
        !pet.location.address.toLowerCase().includes(query) &&
        !pet.color.toLowerCase().includes(query) &&
        !pet.breed?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Pet type filter from sidebar
    if (selectedPetType && pet.animalType !== selectedPetType) {
      return false;
    }

    // Advanced Filters
    if (advancedFilters.breed) {
      const breedQuery = advancedFilters.breed.toLowerCase();
      if (!pet.breed?.toLowerCase().includes(breedQuery)) {
        return false;
      }
    }

    if (advancedFilters.location) {
      const locationQuery = advancedFilters.location.toLowerCase();
      if (!pet.location.address.toLowerCase().includes(locationQuery)) {
        return false;
      }
    }

    if (advancedFilters.gender && advancedFilters.gender !== "all") {
      if (pet.gender !== advancedFilters.gender) {
        return false;
      }
    }

    if (advancedFilters.dateRange && advancedFilters.dateRange !== "all") {
      const now = new Date();
      const petDate = pet.dateReported;
      const daysDiff = Math.floor((now.getTime() - petDate.getTime()) / (1000 * 60 * 60 * 24));

      switch (advancedFilters.dateRange) {
        case "today":
          if (daysDiff > 0) return false;
          break;
        case "week":
          if (daysDiff > 7) return false;
          break;
        case "month":
          if (daysDiff > 30) return false;
          break;
        case "3months":
          if (daysDiff > 90) return false;
          break;
      }
    }

    if (advancedFilters.ageRange && advancedFilters.ageRange !== "all" && pet.age) {
      const ageMatch = pet.age.match(/(\d+)/);
      if (ageMatch) {
        const ageYears = parseInt(ageMatch[0]);
        switch (advancedFilters.ageRange) {
          case "puppy":
            if (ageYears > 1) return false;
            break;
          case "young":
            if (ageYears < 1 || ageYears > 3) return false;
            break;
          case "adult":
            if (ageYears < 3 || ageYears > 7) return false;
            break;
          case "senior":
            if (ageYears < 7) return false;
            break;
        }
      }
    }

    // Type filters (Lost/Sighting)
    const typeFilters = activeFilters.filter((f) =>
      ["Lost", "Sighting"].includes(f)
    );
    if (typeFilters.length > 0 && !typeFilters.includes(pet.type)) {
      return false;
    }

    // Status filters
    const statusFilters = activeFilters.filter((f) =>
      ["Active", "Found", "Stale"].includes(f)
    );
    if (statusFilters.length > 0 && !statusFilters.includes(pet.status)) {
      return false;
    }

    return true;
  });

  // Sort by recent if filter is active
  const sortedPets = activeFilters.includes("Recent")
    ? [...filteredPets].sort(
      (a, b) => b.dateReported.getTime() - a.dateReported.getTime()
    )
    : filteredPets;

  return (
    <div className="min-h-screen ml-32 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <PageHeader
          subtitle="Help reunite lost pets with their families"
          extraContent={
            selectedPetType && (
              <h1 className="text-foreground">
                <span className="text-primary">
                  Showing {selectedPetType}s
                </span>
              </h1>
            )
          }
        />

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, location, breed, or color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 rounded-2xl bg-card border-border"
            />
          </div>

          {/* Advanced Filters */}
          <AdvancedFilters
            filters={advancedFilters}
            onFilterChange={setAdvancedFilters}
            onClearAdvanced={handleClearAdvanced}
          />

          {/* Filter Bar */}
          <FilterBar
            activeFilters={activeFilters}
            onFilterToggle={handleFilterToggle}
            onClearAll={handleClearFilters}
          />
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {sortedPets.length} {sortedPets.length === 1 ? "pet" : "pets"}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-muted-foreground">Loading pets...</p>
          </div>
        )}

        {/* Pet Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onToggleFollow={handleToggleFollow} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedPets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-foreground mb-2">No pets found</h3>
            <p className="text-muted-foreground">
              {pets.length === 0
                ? "No pet listings available. Add your API integration to load data."
                : "Try adjusting your filters or search query"}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
