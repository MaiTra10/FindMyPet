// Centralized API Service
// This file contains all API calls for the application
// Switch between mock and real backend by changing VITE_USE_MOCK_API in .env

import { API_CONFIG, getApiUrl } from './apiConfig';
import { toast } from 'sonner';

// Types for API requests
export interface CreateLostPetRequest {
  name: string;
  animalType: string;
  gender?: string;
  breed?: string;
  color: string;
  age?: string;
  dateLost: Date;
  location: string;
  description?: string;
  contact: string;
  photo?: File;
}

export interface CreateSightingRequest {
  animalType: string;
  color: string;
  gender?: string;
  breed?: string;
  age?: string;
  dateSpotted: Date;
  location: string;
  description: string;
  linkedPetId?: string;
  contact?: string;
  photo?: File;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to simulate API delay for mock mode
const mockDelay = () => new Promise(resolve => 
  setTimeout(resolve, API_CONFIG.MOCK_DELAY)
);

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(getApiUrl(endpoint), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// LOST PET API CALLS
// ============================================================================

export async function createLostPet(
  petData: CreateLostPetRequest,
  userEmail?: string
): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    // Mock implementation
    await mockDelay();
    console.log('Mock: Creating lost pet report', { petData, userEmail });
    return {
      success: true,
      data: {
        id: `pet-${Date.now()}`,
        ...petData,
        status: 'lost',
        createdAt: new Date().toISOString(),
      },
      message: 'Lost pet report submitted successfully!',
    };
  } else {
    // Real API call
    return apiCall(API_CONFIG.ENDPOINTS.CREATE_LOST_PET, {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  }
}

export async function updateLostPet(
  petId: string,
  updates: Partial<CreateLostPetRequest>
): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Updating lost pet', { petId, updates });
    return {
      success: true,
      data: { id: petId, ...updates },
      message: 'Pet updated successfully!',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.UPDATE_LOST_PET(petId), {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}

export async function deleteLostPet(petId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Deleting lost pet', { petId });
    return {
      success: true,
      message: 'Pet listing deleted successfully!',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.DELETE_LOST_PET(petId), {
      method: 'DELETE',
    });
  }
}

export async function getLostPets(filters?: any): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching lost pets with filters', filters);
    // In mock mode, this would return data from mockData.ts
    return {
      success: true,
      data: [],
      message: 'Using mock data from mockData.ts',
    };
  } else {
    const params = new URLSearchParams(filters);
    return apiCall(`${API_CONFIG.ENDPOINTS.LOST_PETS}?${params}`);
  }
}

export async function getLostPetById(petId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching lost pet by ID', { petId });
    return {
      success: true,
      data: null,
      message: 'Using mock data from mockData.ts',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.LOST_PET_BY_ID(petId));
  }
}

// ============================================================================
// SIGHTING API CALLS
// ============================================================================

export async function createSighting(
  sightingData: CreateSightingRequest,
  userEmail?: string
): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Creating sighting report', { sightingData, userEmail });
    return {
      success: true,
      data: {
        id: `sighting-${Date.now()}`,
        ...sightingData,
        createdAt: new Date().toISOString(),
      },
      message: 'Sighting report submitted successfully!',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.CREATE_SIGHTING, {
      method: 'POST',
      body: JSON.stringify(sightingData),
    });
  }
}

export async function getSightings(filters?: any): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching sightings with filters', filters);
    return {
      success: true,
      data: [],
      message: 'Using mock data from mockData.ts',
    };
  } else {
    const params = new URLSearchParams(filters);
    return apiCall(`${API_CONFIG.ENDPOINTS.SIGHTINGS}?${params}`);
  }
}

export async function updateSighting(
  sightingId: string,
  updates: Partial<CreateSightingRequest>
): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Updating sighting', { sightingId, updates });
    return {
      success: true,
      data: { id: sightingId, ...updates },
      message: 'Sighting updated successfully!',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.UPDATE_SIGHTING(sightingId), {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
}

export async function deleteSighting(sightingId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Deleting sighting', { sightingId });
    return {
      success: true,
      message: 'Sighting deleted successfully!',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.DELETE_SIGHTING(sightingId), {
      method: 'DELETE',
    });
  }
}

// ============================================================================
// FOLLOW API CALLS
// ============================================================================

export async function followPet(
  petId: string,
  userId: string
): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Following pet', { petId, userId });
    return {
      success: true,
      message: 'Now following this pet!',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.FOLLOW_PET(petId), {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

export async function unfollowPet(
  petId: string,
  userId: string
): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Unfollowing pet', { petId, userId });
    return {
      success: true,
      message: 'Unfollowed pet',
    };
  } else {
    return apiCall(API_CONFIG.ENDPOINTS.UNFOLLOW_PET(petId), {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }
}

export async function getFollowedPets(userId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching followed pets', { userId });
    return {
      success: true,
      data: [],
      message: 'Using mock data from mockData.ts',
    };
  } else {
    return apiCall(`${API_CONFIG.ENDPOINTS.FOLLOWED_PETS}?userId=${userId}`);
  }
}

// ============================================================================
// USER API CALLS
// ============================================================================

/**
 * Get full user profile including stats and badges
 * Returns comprehensive user information including:
 * - Basic info (name, email, avatar)
 * - Statistics (listingsCount, verificationsCount, activeListings, sightingsReported, followedPets, daysActive)
 * - Earned badges
 */
export async function getUserProfile(userId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching user profile', { userId });
    return {
      success: true,
      data: {
        id: userId,
        name: 'Mock User',
        email: 'mock@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        joinedDate: new Date('2023-01-15'),
        listingsCount: 5,
        verificationsCount: 8,
        activeListings: 3,
        sightingsReported: 10,
        followedPets: 6,
        daysActive: 300,
        badges: [
          {
            id: 'first-listing',
            name: 'First Step',
            description: 'Created your first listing',
            earned: true,
            color: 'from-yellow-400 to-orange-400',
            icon: 'Star',
          },
          {
            id: 'helper-5',
            name: 'Community Helper',
            description: 'Helped 5 people find their pets',
            earned: true,
            color: 'from-pink-400 to-rose-400',
            icon: 'Heart',
          },
        ],
      },
    };
  } else {
    return apiCall(`${API_CONFIG.ENDPOINTS.USER_PROFILE}?userId=${userId}`);
  }
}

export async function getUserPets(userId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching user pets', { userId });
    return {
      success: true,
      data: [],
      message: 'Using mock data from mockData.ts',
    };
  } else {
    return apiCall(`${API_CONFIG.ENDPOINTS.USER_PETS}?userId=${userId}`);
  }
}

export async function getUserSightings(userId: string): Promise<ApiResponse> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Fetching user sightings', { userId });
    return {
      success: true,
      data: [],
      message: 'Using mock data from mockData.ts',
    };
  } else {
    return apiCall(`${API_CONFIG.ENDPOINTS.USER_SIGHTINGS}?userId=${userId}`);
  }
}

// ============================================================================
// FILE UPLOAD API CALLS
// ============================================================================

export async function uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
  if (API_CONFIG.USE_MOCK) {
    await mockDelay();
    console.log('Mock: Uploading image', { fileName: file.name });
    // Return a mock URL
    return {
      success: true,
      data: {
        url: URL.createObjectURL(file),
      },
      message: 'Image uploaded successfully (mock)',
    };
  } else {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE), {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Helper to handle API responses with toast notifications
export function handleApiResponse(
  response: ApiResponse,
  successMessage?: string,
  errorMessage?: string
): boolean {
  if (response.success) {
    if (successMessage || response.message) {
      toast.success(successMessage || response.message);
    }
    return true;
  } else {
    toast.error(errorMessage || response.error || 'An error occurred');
    return false;
  }
}
