
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  try {
    return import.meta?.env?.[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

export const API_CONFIG = {
  // Base URL for your backend API
  // In production, set VITE_API_BASE_URL in your .env file
  BASE_URL: getEnvVar('VITE_API_BASE_URL', 'http://localhost:3000/api'),
  
  // Toggle between mock and real API calls
  // Set VITE_USE_MOCK_API=false in .env to use real backend
  USE_MOCK: getEnvVar('VITE_USE_MOCK_API', 'true') !== 'false',
  
  // API Endpoints
  ENDPOINTS: {
    // Lost Pet endpoints
    LOST_PETS: '/lost-pets',
    LOST_PET_BY_ID: (id: string) => `/lost-pets/${id}`,
    CREATE_LOST_PET: '/lost-pets',
    UPDATE_LOST_PET: (id: string) => `/lost-pets/${id}`,
    DELETE_LOST_PET: (id: string) => `/lost-pets/${id}`,
    
    // Sighting endpoints
    SIGHTINGS: '/sightings',
    SIGHTING_BY_ID: (id: string) => `/sightings/${id}`,
    CREATE_SIGHTING: '/sightings',
    UPDATE_SIGHTING: (id: string) => `/sightings/${id}`,
    DELETE_SIGHTING: (id: string) => `/sightings/${id}`,
    
    // Follow endpoints
    FOLLOW_PET: (id: string) => `/pets/${id}/follow`,
    UNFOLLOW_PET: (id: string) => `/pets/${id}/unfollow`,
    FOLLOWED_PETS: '/followed-pets',
    
    // User endpoints
    USER_PROFILE: '/user/profile',
    USER_PETS: '/user/pets',
    USER_SIGHTINGS: '/user/sightings',
    
    // Upload endpoints
    UPLOAD_IMAGE: '/upload/image',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Mock delay to simulate network latency (milliseconds)
  MOCK_DELAY: 500,
};

// Helper to get full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
