import { motion } from "motion/react";
import { MapPin, Navigation, Dog, Cat, Rabbit, Bird, PawPrint, Layers } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { mockPets } from "../utils/mockData";
import { getPetListings } from "../utils/localStorage";
import { PetListing } from "../types/pet";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { PageHeader } from "../components/PageHeader";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";

// IMPORTANT: Replace with your actual Google Maps API key
// Get one at: https://developers.google.com/maps/documentation/javascript/get-api-key
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

export function MapView() {
  const [selectedPet, setSelectedPet] = useState<PetListing | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 45.5152, lng: -122.6784 });
  const [zoom, setZoom] = useState(12);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [allPets, setAllPets] = useState<PetListing[]>([]);

  // Load all pets from localStorage and mockData
  useEffect(() => {
    const storedPets = getPetListings();
    const combinedPets = [...storedPets, ...mockPets];
    setAllPets(combinedPets);
  }, []);

  // Filter to show all pets or just active ones
  const displayedPets = useMemo(() => {
    return showOnlyActive 
      ? allPets.filter(pet => pet.status === "Active")
      : allPets;
  }, [showOnlyActive, allPets]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Found":
        return "bg-blue-500";
      case "Stale":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getTypeIcon = (type: string): LucideIcon => {
    switch (type) {
      case "Dog":
        return Dog;
      case "Cat":
        return Cat;
      case "Bunny":
        return Rabbit;
      case "Bird":
        return Bird;
      default:
        return PawPrint;
    }
  };

  // Get marker color based on status
  const getMarkerColor = (pet: PetListing) => {
    if (pet.status === "Active") return "#22c55e"; // green-500
    if (pet.status === "Found") return "#3b82f6"; // blue-500
    return "#9ca3af"; // gray-400
  };

  // Center map on user's location
  const handleCenterOnUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setZoom(14);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <div className="min-h-screen ml-32 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <PageHeader
          subtitle="View all lost pets and sightings on an interactive map"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-3xl border border-border overflow-hidden h-[700px] relative"
            >
              {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY" ? (
                // Mock Map View
                <div className="h-full relative">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-accent/10">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 grid grid-cols-12 grid-rows-12">
                      {Array.from({ length: 144 }).map((_, i) => (
                        <div key={i} className="border-r border-b border-border/10" />
                      ))}
                    </div>
                  </div>

                  {/* Mock Map Pins */}
                  <div className="relative h-full p-8">
                    {displayedPets.map((pet, index) => (
                      <motion.button
                        key={pet.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedPet(pet)}
                        className={`absolute cursor-pointer ${
                          selectedPet?.id === pet.id ? "z-10" : ""
                        }`}
                        style={{
                          left: `${15 + (index % 6) * 14}%`,
                          top: `${15 + Math.floor(index / 4) * 18}%`,
                        }}
                      >
                        <div className="relative">
                          <MapPin
                            className={`w-10 h-10 ${
                              selectedPet?.id === pet.id
                                ? "text-primary fill-primary"
                                : pet.status === "Active"
                                ? "text-green-500 fill-green-500"
                                : pet.status === "Found"
                                ? "text-blue-500 fill-blue-500"
                                : "text-gray-400 fill-gray-400"
                            }`}
                          />
                          <div className="absolute top-2 left-1/2 -translate-x-1/2">
                            {(() => {
                              const IconComponent = getTypeIcon(pet.animalType);
                              return <IconComponent className="w-3 h-3 text-white" />;
                            })()}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Map Note */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-card/95 backdrop-blur-sm rounded-xl border border-border px-4 py-3 shadow-lg">
                      <p className="text-sm text-muted-foreground text-center">
                        <span className="text-primary">Google Maps API key required</span> for interactive map
                      </p>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Get your key at{" "}
                        <a
                          href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Google Maps Platform
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCenterOnUser}
                      className="p-4 bg-card rounded-full shadow-lg border border-border hover:bg-accent/10 transition-colors"
                      title="Center on my location"
                    >
                      <Navigation className="w-5 h-5 text-primary" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowOnlyActive(!showOnlyActive)}
                      className={`p-4 rounded-full shadow-lg border transition-colors ${
                        showOnlyActive
                          ? "bg-primary text-white border-primary"
                          : "bg-card border-border hover:bg-accent/10"
                      }`}
                      title={showOnlyActive ? "Showing active only" : "Showing all"}
                    >
                      <Layers className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                // Real Google Maps
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                  <Map
                    defaultCenter={mapCenter}
                    center={mapCenter}
                    defaultZoom={zoom}
                    zoom={zoom}
                    onCenterChanged={(e) => {
                      if (e.detail.center) {
                        setMapCenter(e.detail.center);
                      }
                    }}
                    onZoomChanged={(e) => {
                      if (e.detail.zoom) {
                        setZoom(e.detail.zoom);
                      }
                    }}
                    mapId="pet-finder-map"
                    gestureHandling="greedy"
                    disableDefaultUI={false}
                  >
                    {displayedPets.map((pet) => (
                      <Marker
                        key={pet.id}
                        position={{ lat: pet.location.lat, lng: pet.location.lng }}
                        onClick={() => setSelectedPet(pet)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: getMarkerColor(pet),
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                        }}
                      />
                    ))}
                  </Map>

                  {/* Controls */}
                  <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCenterOnUser}
                      className="p-4 bg-card rounded-full shadow-lg border border-border hover:bg-accent/10 transition-colors"
                      title="Center on my location"
                    >
                      <Navigation className="w-5 h-5 text-primary" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowOnlyActive(!showOnlyActive)}
                      className={`p-4 rounded-full shadow-lg border transition-colors ${
                        showOnlyActive
                          ? "bg-primary text-white border-primary"
                          : "bg-card border-border hover:bg-accent/10"
                      }`}
                      title={showOnlyActive ? "Showing active only" : "Showing all"}
                    >
                      <Layers className="w-5 h-5" />
                    </motion.button>
                  </div>
                </APIProvider>
              )}
            </motion.div>

            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-card rounded-2xl border border-border p-4"
            >
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Active ({displayedPets.filter(p => p.status === "Active").length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Found ({displayedPets.filter(p => p.status === "Found").length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400" />
                  <span className="text-sm text-muted-foreground">Stale ({displayedPets.filter(p => p.status === "Stale").length})</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Pet Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-3xl border border-border p-6 sticky top-8">
              <h3 className="text-foreground mb-4">
                {selectedPet ? "Pet Details" : "Select a Pin"}
              </h3>

              {selectedPet ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Image */}
                  {selectedPet.imageUrl && (
                    <div className="rounded-2xl overflow-hidden h-48">
                      <ImageWithFallback
                        src={selectedPet.imageUrl}
                        alt={selectedPet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-foreground">{selectedPet.name}</h4>
                      <Badge className={`${getStatusColor(selectedPet.status)} text-white border-0`}>
                        {selectedPet.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {selectedPet.type === "Lost" ? "Lost Pet" : "Sighting"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      ID: {selectedPet.id}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{selectedPet.animalType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Color:</span>
                        <span>{selectedPet.color}</span>
                      </div>
                      {selectedPet.breed && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Breed:</span>
                          <span>{selectedPet.breed}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground flex-1">
                          {selectedPet.location.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Date:</span>
                        <span>{selectedPet.dateReported.toLocaleDateString()}</span>
                      </div>
                    </div>

                    {selectedPet.description && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        {selectedPet.description}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <Link to={`/pet/${selectedPet.id}`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl"
                    >
                      View Full Details
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📍</div>
                  <p className="text-muted-foreground text-sm">
                    Click on any pin to view pet details
                  </p>
                  <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                    <p>Showing {displayedPets.length} pets</p>
                    <p>{displayedPets.filter(p => p.type === "Lost").length} Lost Pets</p>
                    <p>{displayedPets.filter(p => p.type === "Sighting").length} Sightings</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
