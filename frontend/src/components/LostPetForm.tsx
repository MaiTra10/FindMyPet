import { motion } from "motion/react";
import { useState } from "react";
import { MapPin, Camera, Send } from "lucide-react";
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
import { useUser } from "../components/UserContext";

export function LostPetForm() {
  const [date, setDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const { authUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);

    // Convert fields into expected JSON format
    const petData = {
      name: formData.get("name") as string,
      animalType: formData.get("animalType") as string,
      gender: formData.get("gender") ? (formData.get("gender") as string) : undefined,
      breed: formData.get("breed") ? [(formData.get("breed") as string)] : [],
      color: formData.get("color") ? [(formData.get("color") as string)] : [],
      age: formData.get("age") ? (formData.get("age") as string) : undefined,
      dateLost: date ? date.toISOString() : new Date().toISOString(),
      location: location,
      postalCode: formData.get("postalCode") ? (formData.get("postalCode") as string) : undefined,
      locationCoords: locationCoords,
      city: formData.get("city") as string,
      provinceOrState: formData.get("provinceOrState") as string,
      country: formData.get("country") as string,
      description: description,
    };

    try {
      const response = await fetch(`https://hw36ag81i6.execute-api.us-west-2.amazonaws.com/test/lost-listing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authUser?.raw}`,
        },
        body: JSON.stringify(petData),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error("Error response:", err);
        throw new Error(err.error || "Failed to submit lost pet report");
      }

      const result = await response.json();
      console.log("Lost Pet Created:", result);

      toast.success("Lost pet report submitted successfully!");
      (e.target as HTMLFormElement).reset();
      setDate(undefined);
      setDescription("");
      setLocation("");
      setLocationCoords(null);
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

        {/* Gender */}
        <div>
          <Label htmlFor="gender">Gender</Label>
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
        <Label>Date Lost *</Label>
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
