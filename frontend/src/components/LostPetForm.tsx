import { motion } from "motion/react";
import { useState } from "react";
import { MapPin, Camera, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { savePetListing } from "../utils/localStorage";
import { LocationPicker } from "./LocationPicker";
import { PetListing } from "../types/pet";

export function LostPetForm() {
  const [dateLost, setDateLost] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [animalType, setAnimalType] = useState("");
  const [gender, setGender] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to submit a report");
      setIsSubmitting(false);
      return;
    }

    if (!animalType) {
      toast.error("Please select an animal type");
      return;
    }

    if (!dateLost.trim()) {
      toast.error("Please enter the date lost");
      return;
    }

    if (!location.trim()) {
      toast.error("Please enter the location where pet was lost");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      // Create new pet listing
      // Parse the date - try to create a valid Date object
      let reportedDate = new Date();
      if (dateLost.trim()) {
        const parsedDate = new Date(dateLost);
        if (!isNaN(parsedDate.getTime())) {
          reportedDate = parsedDate;
        }
      }

      const newListing: PetListing = {
        id: `listing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        type: "Lost",
        name: formData.get("name") as string,
        animalType: animalType as any,
        gender: (gender || "Unknown") as any,
        breed: formData.get("breed") as string || undefined,
        color: formData.get("color") as string,
        age: formData.get("age") as string || undefined,
        dateReported: reportedDate,
        location: {
          address: location,
          lat: locationCoords?.lat || 45.5152,
          lng: locationCoords?.lng || -122.6784,
        },
        status: "Active",
        imageUrl: imagePreview || undefined,
        description: description,
        contactInfo: formData.get("contact") as string,
        isFollowed: false,
        createdBy: user.email,
        postedBy: {
          name: user.name || "Anonymous",
          avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || "user")}`,
          joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          listingsCount: 1,
          verificationsCount: 0,
          activeListings: 1,
          sightingsReported: 0,
          followedPets: 0,
          daysActive: 30,
          badges: [],
        },
      };

      // Save to localStorage
      savePetListing(newListing);
      
      toast.success("Lost pet report submitted successfully! Your listing is now active and visible to the community.");
      
      // Reset form
      (e.target as HTMLFormElement).reset();
      setDateLost("");
      setDescription("");
      setLocation("");
      setLocationCoords(null);
      setAnimalType("");
      setGender("");
      setImagePreview(null);
      setImageFile(null);
      
    } catch (error) {
      console.error("Error submitting lost pet form:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-3xl p-8 space-y-6"
    >
      <h3 className="text-foreground mb-4">Lost Pet Information</h3>

      {/* Pet Photo Upload */}
      <div>
        <Label>Pet Photo</Label>
        {imagePreview ? (
          <div className="mt-2 relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-2xl"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 bg-destructive text-white p-2 rounded-full hover:bg-destructive/90 transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <label htmlFor="photo-upload" className="block">
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-2 border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
            >
              <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG up to 10MB
              </p>
            </motion.div>
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <Label htmlFor="name">Pet Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Eva"
            required
            className="mt-2"
          />
        </div>

        {/* Animal Type */}
        <div>
          <Label htmlFor="animalType">Animal Type *</Label>
          <Select value={animalType} onValueChange={setAnimalType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dog">Dog</SelectItem>
              <SelectItem value="Cat">Cat</SelectItem>
              <SelectItem value="Bunny">Bunny</SelectItem>
              <SelectItem value="Bird">Bird</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gender */}
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Breed */}
        <div>
          <Label htmlFor="breed">Breed</Label>
          <Input
            id="breed"
            name="breed"
            placeholder="e.g. Golden Retriever"
            className="mt-2"
          />
        </div>

        {/* Color */}
        <div>
          <Label htmlFor="color">Color *</Label>
          <Input
            id="color"
            name="color"
            placeholder="e.g. Golden, Brown"
            required
            className="mt-2"
          />
        </div>

        {/* Age */}
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            placeholder="e.g. 3 years"
            className="mt-2"
          />
        </div>
      </div>

      {/* Date Lost */}
      <div>
        <Label htmlFor="dateLost">Date Lost *</Label>
        <Input
          id="dateLost"
          name="dateLost"
          type="date"
          required
          className="mt-2"
          value={dateLost}
          onChange={(e) => setDateLost(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Select the date when your pet was lost
        </p>
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">Where Lost *</Label>
        <div className="relative mt-2">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="location"
            name="location"
            placeholder="Enter address or location"
            required
            className="pl-10"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsLocationPickerOpen(true)}
          className="mt-3 text-sm text-primary hover:underline"
        >
          📍 Pick location on map
        </motion.button>
      </div>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationSelect={(selectedLocation) => {
          setLocation(selectedLocation.address);
          setLocationCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng });
        }}
        initialLocation={locationCoords || undefined}
      />

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Any additional details that might help identify your pet..."
          className="mt-2 min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {description.length}/300 characters
        </p>
      </div>

      {/* Contact Info */}
      <div>
        <Label htmlFor="contact">Contact Information *</Label>
        <Input
          id="contact"
          name="contact"
          type="email"
          placeholder="Your email or phone number"
          required
          className="mt-2"
        />
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
        {isSubmitting ? "Submitting..." : "Submit Lost Pet Report"}
      </motion.button>

      <p className="text-xs text-muted-foreground text-center">
        Your listing will be marked as "Active" and visible to the community
      </p>
    </motion.form>
  );
}
