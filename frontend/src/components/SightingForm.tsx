import { motion } from "motion/react";
import React, { useState } from "react";
import { MapPin, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { LocationPicker } from "./LocationPicker";
import { ImageUpload } from "./ImageUpload";

export function SightingForm() {
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    
    const sightingData = {
      animalType: formData.get("animalType") as string,
      color: formData.get("color") as string,
      gender: formData.get("gender") as string,
      breed: formData.get("breed") as string,
      age: formData.get("age") as string,
      dateSpotted: date!,
      location: formData.get("location") as string,
      locationCoords: locationCoords,
      description: description,
      imageUrls: imageUrls,
      linkedPetId: formData.get("linkedId") as string,
      contact: formData.get("contact") as string,
    };

    // TODO: Replace with your API call
    try {
      // Example API call:
      // const response = await fetch('YOUR_API_ENDPOINT/sightings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...sightingData, type: 'Sighting' }),
      // });
      // 
      // if (response.ok) {
      //   toast.success("Sighting report submitted successfully!");
      //   (e.target as HTMLFormElement).reset();
      //   setDate(undefined);
      //   setDescription("");
      // } else {
      //   throw new Error('Failed to submit');
      // }

      console.log("Sighting Form Data:", sightingData);
      toast.info("TODO: Connect to your API to submit this form");
    } catch (error) {
      console.error('Error submitting sighting form:', error);
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
      <h3 className="text-foreground mb-4">Pet Sighting Information</h3>

      {/* Photo Upload */}
      <div>
        <Label>Photos of Pet (up to 4, if available)</Label>
        <div className="mt-2">
          <ImageUpload
            maxImages={4}
            onImagesChange={setImageUrls}
            existingImages={imageUrls}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Animal Type */}
        <div>
          <Label htmlFor="animalType">Animal Type *</Label>
          <Select name="animalType" required>
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

        {/* Color */}
        <div>
          <Label htmlFor="color">Color *</Label>
          <Input
            id="color"
            name="color"
            placeholder="e.g. Black and White"
            required
            className="mt-2"
          />
        </div>

        {/* Gender (if known) */}
        <div>
          <Label htmlFor="gender">Gender (if known)</Label>
          <Select name="gender">
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

        {/* Breed (if known) */}
        <div>
          <Label htmlFor="breed">Breed (if known)</Label>
          <Input
            id="breed"
            name="breed"
            placeholder="e.g. Labrador"
            className="mt-2"
          />
        </div>

        {/* Approximate Age */}
        <div>
          <Label htmlFor="age">Approximate Age (if known)</Label>
          <Input
            id="age"
            name="age"
            placeholder="e.g. Young, Adult"
            className="mt-2"
          />
        </div>
      </div>

      {/* Date Found */}
      <div>
        <Label>Date Spotted *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left mt-2"
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">Where Spotted *</Label>
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
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the pet you saw, its condition, behavior, and any other relevant details..."
          required
          className="mt-2 min-h-[120px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={300}
        />
        <p className="text-xs text-muted-foreground mt-2 text-right">
          {description.length}/300 characters
        </p>
      </div>

      {/* Link to Possible Match */}
      <div>
        <Label htmlFor="linkedId">Link to Possible Lost Pet (optional)</Label>
        <Input
          id="linkedId"
          name="linkedId"
          placeholder="Enter Pet ID if you think it matches a lost pet"
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-2">
          If you believe this matches a lost pet listing, enter the ID to link them
        </p>
      </div>

      {/* Contact Info */}
      <div>
        <Label htmlFor="contact">Your Contact Information</Label>
        <Input
          id="contact"
          name="contact"
          type="email"
          placeholder="Your email or phone number (optional)"
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
        {isSubmitting ? "Submitting..." : "Submit Sighting Report"}
      </motion.button>

      <p className="text-xs text-muted-foreground text-center">
        Your sighting will help reunite lost pets with their families
      </p>
    </motion.form>
  );
}
