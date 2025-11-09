/**
 * API Template for FindMyPet
 * 
 * This file provides a template structure for your API integration.
 * Replace the placeholder URLs and implement your actual API calls.
 */

import { PetListing } from "../types/pet";

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = process.env.VITE_API_BASE_URL || "YOUR_API_BASE_URL_HERE";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const user = localStorage.getItem("findmypet_user");
  if (user) {
    const parsed = JSON.parse(user);
    return parsed.idToken || null;
  }
  return null;
};

// Helper function to create headers with auth
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

// ============================================
// Pet Listings API
// ============================================

/**
 * Fetch all pet listings
 * GET /api/pets
 */
export async function fetchAllPets(): Promise<PetListing[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pets: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pets:", error);
    throw error;
  }
}

/**
 * Fetch a single pet by ID
 * GET /api/pets/:id
 */
export async function fetchPetById(id: string): Promise<PetListing | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch pet: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching pet:", error);
    throw error;
  }
}

/**
 * Create a new pet listing (lost or sighting)
 * POST /api/pets
 */
export async function createPetListing(petData: Partial<PetListing>): Promise<PetListing> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(petData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create pet listing: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating pet listing:", error);
    throw error;
  }
}

/**
 * Update a pet listing
 * PUT /api/pets/:id
 */
export async function updatePetListing(id: string, updates: Partial<PetListing>): Promise<PetListing> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update pet listing: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating pet listing:", error);
    throw error;
  }
}

/**
 * Delete a pet listing
 * DELETE /api/pets/:id
 */
export async function deletePetListing(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete pet listing: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting pet listing:", error);
    throw error;
  }
}

// ============================================
// Follow/Unfollow API
// ============================================

/**
 * Follow a pet
 * POST /api/pets/:id/follow
 */
export async function followPet(petId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}/follow`, {
      method: "POST",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to follow pet: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error following pet:", error);
    throw error;
  }
}

/**
 * Unfollow a pet
 * DELETE /api/pets/:id/follow
 */
export async function unfollowPet(petId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/pets/${petId}/follow`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to unfollow pet: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error unfollowing pet:", error);
    throw error;
  }
}

/**
 * Fetch followed pets for current user
 * GET /api/users/me/followed
 */
export async function fetchFollowedPets(): Promise<PetListing[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/followed`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch followed pets: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching followed pets:", error);
    throw error;
  }
}

// ============================================
// User API
// ============================================

/**
 * Fetch current user's listings
 * GET /api/users/me/listings
 */
export async function fetchUserListings(): Promise<PetListing[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me/listings`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user listings: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user listings:", error);
    throw error;
  }
}

/**
 * Fetch user profile data
 * GET /api/users/me
 */
export async function fetchUserProfile(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

// ============================================
// Image Upload API
// ============================================

/**
 * Upload an image
 * POST /api/upload
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url; // Assuming the API returns { url: "..." }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

// ============================================
// Search & Filter API
// ============================================

/**
 * Search pets with filters
 * GET /api/pets/search?q=...&type=...&status=...
 */
export async function searchPets(params: {
  query?: string;
  type?: "Lost" | "Sighting";
  status?: "Active" | "Found" | "Stale";
  animalType?: string;
  location?: string;
}): Promise<PetListing[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.query) queryParams.append("q", params.query);
    if (params.type) queryParams.append("type", params.type);
    if (params.status) queryParams.append("status", params.status);
    if (params.animalType) queryParams.append("animalType", params.animalType);
    if (params.location) queryParams.append("location", params.location);

    const response = await fetch(`${API_BASE_URL}/pets/search?${queryParams}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search pets: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching pets:", error);
    throw error;
  }
}
