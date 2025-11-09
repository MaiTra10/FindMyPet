import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, X, Check, Navigation } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

// IMPORTANT: Replace with your actual Google Maps API key
// Get one at: https://developers.google.com/maps/documentation/javascript/get-api-key
// Or set VITE_GOOGLE_MAPS_API_KEY in your .env file
const GOOGLE_MAPS_API_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) || 
  "YOUR_GOOGLE_MAPS_API_KEY";

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function LocationPicker({ isOpen, onClose, onLocationSelect, initialLocation }: LocationPickerProps) {
  // Default to Portland, OR
  const defaultCenter = initialLocation || { lat: 45.5152, lng: -122.6784 };
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  // Handle map click
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setSelectedPosition({ lat, lng });
      reverseGeocode(lat, lng);
    }
  }, [reverseGeocode]);

  // Confirm location selection
  const handleConfirm = () => {
    if (selectedPosition && address) {
      onLocationSelect({
        address,
        lat: selectedPosition.lat,
        lng: selectedPosition.lng,
      });
      onClose();
    }
  };

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter({ lat, lng });
          setSelectedPosition({ lat, lng });
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Pick Location on Map
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Click anywhere on the map to select a location
          </p>
        </DialogHeader>

        <div className="relative">
          {/* Map Container */}
          <div className="h-[500px] w-full bg-muted">
            {GOOGLE_MAPS_API_KEY === "YOUR_GOOGLE_MAPS_API_KEY" ? (
              // Mock map when no API key
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/10 relative">
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border-r border-b border-border/10" />
                  ))}
                </div>
                <div className="relative z-10 text-center p-8 bg-card/90 rounded-2xl border border-border shadow-lg max-w-md">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                  <h3 className="mb-2">Google Maps API Key Required</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    To use the interactive map, please add your Google Maps API key to the LocationPicker component.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Get your API key at: <br />
                    <a 
                      href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Google Maps Platform
                    </a>
                  </p>
                  <div className="mt-6">
                    <Input
                      placeholder="Enter address manually"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mb-4"
                    />
                    <Button
                      onClick={() => {
                        if (address) {
                          onLocationSelect({
                            address,
                            lat: defaultCenter.lat,
                            lng: defaultCenter.lng,
                          });
                          onClose();
                        }
                      }}
                      className="w-full"
                      disabled={!address}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Use This Address
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Real Google Maps
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  defaultCenter={mapCenter}
                  center={mapCenter}
                  defaultZoom={13}
                  onClick={handleMapClick}
                  mapId="location-picker-map"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  clickableIcons={false}
                >
                  {selectedPosition && (
                    <Marker
                      position={selectedPosition}
                      animation={google.maps.Animation.DROP}
                    />
                  )}
                </Map>
              </APIProvider>
            )}
          </div>

          {/* Current Location Button */}
          {GOOGLE_MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleGetCurrentLocation}
              className="absolute top-4 right-4 p-3 bg-card rounded-full shadow-lg border border-border hover:bg-accent/10 transition-colors"
              title="Get current location"
            >
              <Navigation className="w-5 h-5 text-primary" />
            </motion.button>
          )}
        </div>

        {/* Address Display & Actions */}
        <div className="p-6 space-y-4 border-t border-border">
          {selectedPosition && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {isLoadingAddress ? (
                      <span className="text-muted-foreground">Loading address...</span>
                    ) : address ? (
                      address
                    ) : (
                      <span className="text-muted-foreground">Click on the map to select a location</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!selectedPosition || !address || isLoadingAddress}
              className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirm Location
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
