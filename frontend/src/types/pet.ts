export type PetType = "Dog" | "Cat" | "Bunny" | "Bird" | "Other";
export type Gender = "Male" | "Female" | "Unknown";
export type PetStatus = "Active" | "Stale" | "Found";
export type ListingType = "Lost" | "Sighting";

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress?: number;
  requirement?: number;
  color: string;
  icon: string; // Icon name from lucide-react
}

export interface PosterInfo {
  name: string;
  avatar: string;
  joinedDate: Date;
  listingsCount: number;
  verificationsCount: number; // Number of people helped (successful matches, reunifications)
  // Extended profile information
  activeListings: number;
  sightingsReported: number;
  followedPets: number;
  daysActive: number;
  badges: UserBadge[];
}

export interface PetListing {
	id: string;
	type: ListingType;
	name: string;
	animalType: PetType;
	gender: Gender;
	breed?: string;
	color: string;
	age?: string;
	dateReported: Date;
	location: Location;
	status: PetStatus;
	imageUrl?: string; // Deprecated: use imageUrls instead
	imageUrls?: string[]; // Array of image URLs (max 4)
	description?: string;
	contactInfo?: string;
	isFollowed?: boolean;
	createdBy?: string;
	postedBy?: PosterInfo;
}
