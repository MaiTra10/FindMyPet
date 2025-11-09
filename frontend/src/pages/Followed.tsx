import { motion } from "motion/react";
import { Heart, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { PetCard } from "../components/PetCard";
import { PageHeader } from "../components/PageHeader";
import { mockPets } from "../utils/mockData";
import { getPetListings } from "../utils/localStorage";
import { PetListing } from "../types/pet";

export function Followed() {
  const [followedPets, setFollowedPets] = useState<PetListing[]>([]);

  useEffect(() => {
    const storedPets = getPetListings();
    const combinedPets = [...storedPets, ...mockPets];
    setFollowedPets(combinedPets.filter((pet) => pet.isFollowed));
  }, []);

  const handleToggleFollow = (id: string) => {
    setFollowedPets((prev) =>
      prev.map((pet) =>
        pet.id === id ? { ...pet, isFollowed: !pet.isFollowed } : pet
      )
    );
  };

  const activePets = followedPets.filter((pet) => pet.isFollowed);

  return (
    <div className="min-h-screen ml-32 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <PageHeader
          subtitle="Keep track of pets you're helping to find"
        />

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border rounded-3xl p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-foreground">Notifications Enabled</h4>
                <p className="text-sm text-muted-foreground">
                  You'll be notified when pets you follow are updated
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl"
            >
              Manage
            </motion.button>
          </div>
        </motion.div>

        {/* Results Count */}
        {activePets.length > 0 && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Following {activePets.length}{" "}
              {activePets.length === 1 ? "pet" : "pets"}
            </p>
          </div>
        )}

        {/* Pet Grid */}
        {activePets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                onToggleFollow={handleToggleFollow}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-foreground mb-2">No followed pets</h3>
            <p className="text-muted-foreground mb-6">
              Start following pets to keep track of them here
            </p>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl"
            >
              Browse Listings
            </motion.a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
