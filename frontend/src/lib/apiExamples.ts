

import { 
  createLostPet, 
  createSighting, 
  followPet, 
  unfollowPet,
  getLostPets,
  handleApiResponse,
  uploadImage
} from './api';


export async function exampleCreateLostPet(formData: FormData, userEmail: string) {
  const petData = {
    name: formData.get('name') as string,
    animalType: formData.get('animalType') as string,
    color: formData.get('color') as string,
    dateLost: new Date(formData.get('dateLost') as string),
    location: formData.get('location') as string,
    description: formData.get('description') as string,
    contact: formData.get('contact') as string,
  };

  const response = await createLostPet(petData, userEmail);
  
  // Option 1: Use helper to automatically show toast
  if (handleApiResponse(response, 'Pet report created successfully!')) {
    console.log('Success! Pet ID:', response.data?.id);
    return response.data;
  }
  
  // Option 2: Handle manually
  if (response.success) {
    console.log('Created pet:', response.data);
    return response.data;
  } else {
    console.error('Error:', response.error);
    return null;
  }
}

// ============================================================================
// EXAMPLE 2: Fetching and Filtering Lost Pets
// ============================================================================

export async function exampleFetchFilteredPets() {
  const filters = {
    animalType: 'Dog',
    status: 'lost',
    location: 'San Francisco',
  };

  const response = await getLostPets(filters);
  
  if (response.success) {
    const pets = response.data;
    console.log('Found pets:', pets);
    return pets;
  }
  
  return [];
}

// ============================================================================
// EXAMPLE 3: Following/Unfollowing a Pet
// ============================================================================

export async function exampleToggleFollow(petId: string, userId: string, isCurrentlyFollowing: boolean) {
  const response = isCurrentlyFollowing 
    ? await unfollowPet(petId, userId)
    : await followPet(petId, userId);
  
  handleApiResponse(
    response,
    isCurrentlyFollowing ? 'Unfollowed' : 'Now following this pet!'
  );
  
  return response.success;
}

// ============================================================================
// EXAMPLE 4: Uploading Images
// ============================================================================

export async function exampleUploadPetPhoto(file: File) {
  const response = await uploadImage(file);
  
  if (response.success && response.data) {
    console.log('Uploaded to:', response.data.url);
    return response.data.url;
  }
  
  return null;
}

// ============================================================================
// EXAMPLE 5: Component Integration - Pet Card with Follow Button
// ============================================================================

/**
 * Example component code showing how to integrate follow functionality
 */
export const examplePetCardComponent = `
import { useState } from 'react';
import { followPet, unfollowPet, handleApiResponse } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export function PetCard({ pet }) {
  const [isFollowing, setIsFollowing] = useState(pet.isFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleToggleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow pets');
      return;
    }
    
    setIsLoading(true);
    
    const response = isFollowing
      ? await unfollowPet(pet.id, user.id)
      : await followPet(pet.id, user.id);
    
    if (handleApiResponse(response)) {
      setIsFollowing(!isFollowing);
    }
    
    setIsLoading(false);
  };
  
  return (
    <div>
      <h3>{pet.name}</h3>
      <button onClick={handleToggleFollow} disabled={isLoading}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
}
`;

// ============================================================================
// EXAMPLE 6: Component Integration - Listings Page with Filters
// ============================================================================

export const exampleListingsComponent = `
import { useState, useEffect } from 'react';
import { getLostPets } from '../lib/api';

export function Listings() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    animalType: '',
    status: 'lost',
  });
  
  useEffect(() => {
    fetchPets();
  }, [filters]);
  
  const fetchPets = async () => {
    setLoading(true);
    const response = await getLostPets(filters);
    
    if (response.success) {
      setPets(response.data || []);
    }
    
    setLoading(false);
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <FilterBar onFilterChange={handleFilterChange} />
      <div className="grid">
        {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
      </div>
    </div>
  );
}
`;

// ============================================================================
// EXAMPLE 7: Form with Image Upload
// ============================================================================

export const exampleFormWithImageUpload = `
import { useState } from 'react';
import { createLostPet, uploadImage, handleApiResponse } from '../lib/api';

export function LostPetFormWithUpload() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    setUploading(true);
    
    // Upload image first
    const uploadResponse = await uploadImage(file);
    
    if (uploadResponse.success && uploadResponse.data) {
      setImageUrl(uploadResponse.data.url);
      handleApiResponse(uploadResponse, 'Image uploaded!');
    }
    
    setUploading(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    
    const petData = {
      name: formData.get('name') as string,
      // ... other fields
      photoUrl: imageUrl, // Use uploaded image URL
    };
    
    const response = await createLostPet(petData);
    handleApiResponse(response, 'Pet created!');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleImageSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Preview" />}
      {/* other form fields */}
      <button type="submit" disabled={uploading}>Submit</button>
    </form>
  );
}
`;

// ============================================================================
// EXAMPLE 8: Error Handling Patterns
// ============================================================================

export async function exampleErrorHandling() {
  // Pattern 1: Let handleApiResponse show the error
  const response1 = await createLostPet({} as any);
  handleApiResponse(response1); // Automatically shows error toast
  
  // Pattern 2: Custom error handling
  const response2 = await createLostPet({} as any);
  if (!response2.success) {
    console.error('Custom error handling:', response2.error);
    // Show custom error UI
    return;
  }
  
  // Pattern 3: Try-catch for additional safety
  try {
    const response3 = await createLostPet({} as any);
    if (response3.success) {
      // Success logic
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    // This shouldn't normally happen as API calls handle errors internally
  }
}

// ============================================================================
// EXAMPLE 9: Loading States
// ============================================================================

export const exampleLoadingStates = `
import { useState } from 'react';
import { createLostPet } from '../lib/api';

export function FormWithLoading() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await createLostPet(data);
      
      if (response.success) {
        // Handle success
      }
    } finally {
      setIsSubmitting(false); // Always reset loading state
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
`;

// ============================================================================
// EXAMPLE 10: Optimistic Updates
// ============================================================================

export const exampleOptimisticUpdate = `
import { useState } from 'react';
import { followPet } from '../lib/api';

export function PetCardOptimistic({ pet }) {
  const [isFollowing, setIsFollowing] = useState(pet.isFollowing);
  
  const handleFollow = async () => {
    // Optimistic update - update UI immediately
    const previousState = isFollowing;
    setIsFollowing(true);
    
    const response = await followPet(pet.id, user.id);
    
    if (!response.success) {
      // Revert on failure
      setIsFollowing(previousState);
      toast.error('Failed to follow pet');
    }
  };
  
  return <button onClick={handleFollow}>Follow</button>;
}
`;
