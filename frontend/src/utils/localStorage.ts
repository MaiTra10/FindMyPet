import { PetListing } from "../types/pet";

const PETS_STORAGE_KEY = "findmypet_listings";

// Get all pet listings from localStorage
export function getPetListings(): PetListing[] {
  try {
    const stored = localStorage.getItem(PETS_STORAGE_KEY);
    if (!stored) return [];
    
    const pets = JSON.parse(stored);
    // Convert date strings back to Date objects
    return pets.map((pet: any) => ({
      ...pet,
      dateReported: new Date(pet.dateReported),
      postedBy: pet.postedBy ? {
        ...pet.postedBy,
        joinedDate: new Date(pet.postedBy.joinedDate),
      } : undefined,
    }));
  } catch (error) {
    console.error("Error reading pet listings from localStorage:", error);
    return [];
  }
}

// Save a new pet listing to localStorage
export function savePetListing(pet: PetListing): PetListing {
  try {
    const pets = getPetListings();
    pets.push(pet);
    localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(pets));
    return pet;
  } catch (error) {
    console.error("Error saving pet listing to localStorage:", error);
    throw error;
  }
}

// Update an existing pet listing
export function updatePetListing(id: string, updates: Partial<PetListing>): PetListing | null {
  try {
    const pets = getPetListings();
    const index = pets.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    pets[index] = { ...pets[index], ...updates };
    localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(pets));
    return pets[index];
  } catch (error) {
    console.error("Error updating pet listing:", error);
    return null;
  }
}

// Delete a pet listing
export function deletePetListing(id: string): boolean {
  try {
    const pets = getPetListings();
    const filtered = pets.filter(p => p.id !== id);
    localStorage.setItem(PETS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error deleting pet listing:", error);
    return false;
  }
}

// Get a single pet listing by ID
export function getPetById(id: string): PetListing | null {
  const pets = getPetListings();
  return pets.find(p => p.id === id) || null;
}
