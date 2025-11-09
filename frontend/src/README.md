# FindMyPet 🐾

A community-driven pet finding application that helps reunite lost pets with their families. Built with React, TypeScript, and Tailwind CSS with interactive Google Maps integration.

## ✨ Features

### Core Functionality
- 🔍 **Browse Lost Pets & Sightings** - View detailed listings with photos, descriptions, and locations
- 🗺️ **Interactive Map** - Visualize pet locations with Google Maps integration
- 📍 **Report Lost Pets** - Create detailed reports with photos and location data
- 👀 **Report Sightings** - Help others by reporting pet sightings
- ❤️ **Follow System** - Track pets you're interested in helping
- 👤 **User Profiles** - Comprehensive profiles with stats and badges

### UI Features
- 🎨 **Theme System** - 4 color schemes (Amber, Emerald, Blue, Purple) with light/dark modes
- 📱 **Responsive Design** - Works beautifully on mobile, tablet, and desktop
- 🎯 **Advanced Filtering** - Filter by type, animal, status, date range, and more
- 🎭 **Smooth Animations** - Motion (Framer Motion) for delightful interactions
- 🎨 **Modern UI** - shadcn/ui components with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Maps API key (for map functionality)
- Your own backend API (or implement one)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add your API keys to .env
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
# VITE_API_BASE_URL=your-backend-api-url

# Start development server
npm run dev
```

The app will run at `http://localhost:5173`

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS 4.0
- Vite
- Motion (Framer Motion)
- shadcn/ui components
- Lucide React icons

**Map:**
- Google Maps (@vis.gl/react-google-maps)
- Location picker with geocoding

**Charts & Visualization:**
- Recharts
- Progress indicators

### Project Structure

```
findmypet/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── figma/          # Helper components
│   ├── PetCard.tsx     # Pet listing card
│   ├── Navbar.tsx      # Main navigation
│   ├── FilterBar.tsx   # Filtering system
│   ├── LostPetForm.tsx # Lost pet form
│   ├── SightingForm.tsx# Sighting report form
│   └── ...
├── pages/              # Page components
│   ├── Listings.tsx    # Main listings page
│   ├── MapView.tsx     # Interactive map
│   ├── PetDetails.tsx  # Individual pet details
│   ├── Profile.tsx     # User profile
│   ├── Followed.tsx    # Followed pets
│   └── ReportPage.tsx  # Report form page
├── lib/                # Utilities and templates
│   └── apiTemplate.ts  # API integration template
├── types/              # TypeScript types
│   └── pet.ts          # Pet & user types
├── utils/              # Helper functions
│   └── mockData.ts     # Empty (ready for your data)
├── styles/             # Global styles
│   └── globals.css     # Tailwind + theme system
└── public/             # Static assets
```

## 🔌 Backend Integration

**All mock data and authentication have been removed.** The app is now a clean slate ready for your own backend implementation.

### What You Need to Implement

1. **Authentication System**
   - User registration/login
   - Session management
   - Protected routes (optional)

2. **Pet Listings API**
   - `GET /api/pets` - List all pets
   - `GET /api/pets/:id` - Get pet details
   - `POST /api/pets` - Create pet listing
   - `PUT /api/pets/:id` - Update listing
   - `DELETE /api/pets/:id` - Delete listing

3. **Follow System**
   - `POST /api/pets/:id/follow` - Follow a pet
   - `DELETE /api/pets/:id/follow` - Unfollow a pet
   - `GET /api/users/me/followed` - Get followed pets

4. **User Profile**
   - `GET /api/users/me` - Get current user
   - `GET /api/users/me/listings` - Get user's listings

5. **File Upload**
   - `POST /api/upload` - Upload pet images

### API Template

Check `/lib/apiTemplate.ts` for a complete template with all the endpoints and functions you'll need. The file includes:

- Example API functions
- Authentication header handling
- Error handling patterns
- TypeScript types

### Where to Add Your API Calls

Look for `TODO` comments in these files:
- `/pages/Listings.tsx` (line ~22)
- `/pages/MapView.tsx` (line ~35)
- `/pages/Followed.tsx` (line ~15)
- `/pages/PetDetails.tsx` (line ~25)
- `/pages/Profile.tsx` (line ~54)
- `/components/LostPetForm.tsx` (submit handler)
- `/components/SightingForm.tsx` (submit handler)

### Authentication

Add your own authentication system:

1. Create auth context or use state management
2. Add login/logout components
3. Add auth button to App.tsx (see TODO comment on line 52)
4. Include auth tokens in API requests

The app works without authentication - it just won't persist data until you connect your backend.

## 🎨 Theming

### Color Schemes

Choose from 4 beautiful themes:
- 🟡 **Amber** (warm, welcoming)
- 🟢 **Emerald** (fresh, natural)
- 🔵 **Blue** (trustworthy, calm)
- 🟣 **Purple** (creative, modern)

Each theme supports **light** and **dark** modes.

### Customization

Themes are defined in `styles/globals.css` using CSS custom properties. Users can switch themes via the theme selector in the navbar.

## 🏆 Gamification System

The app includes a comprehensive badge system (frontend only):

| Badge | Requirement | Icon |
|-------|-------------|------|
| ⭐ First Step | Create first listing | Star |
| ❤️ Community Helper | Help 5 people | Heart |
| 🏆 Guardian Angel | Help 10 people | Trophy |
| 📍 Eagle Eye | Report 5 sightings | MapPin |
| 📍 Neighborhood Watch | Report 10 sightings | MapPin |
| ⚡ Dedicated Member | Active 30+ days | Zap |
| 👥 Pet Advocate | Follow 10 pets | Users |

Badge logic should be implemented in your backend.

## 🛠️ Development

### Environment Variables

```env
# Google Maps (Required for map functionality)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Your Backend API
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development Workflow

1. **UI Development** - Works immediately without backend
2. **Backend Integration** - Add API calls to replace TODO comments
3. **Authentication** - Implement your own auth system
4. **Testing** - Test all features with your backend

## 📦 Build & Deploy

### Build for Production

```bash
npm run build
```

Output in `/dist` directory.

### Environment Configuration

Update `.env` for production:

```env
VITE_GOOGLE_MAPS_API_KEY=your-production-maps-key
VITE_API_BASE_URL=https://api.yourdomain.com/v1
```

### Deployment Platforms

**Frontend (Static hosting):**
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Backend (API):**
- Node.js on any cloud provider
- Serverless (AWS Lambda, Vercel Functions)
- Traditional hosting (Heroku, DigitalOcean, etc.)

## 📊 Data Types

All TypeScript types are defined in `/types/pet.ts`:

```typescript
interface PetListing {
  id: string;
  type: "Lost" | "Sighting";
  name: string;
  animalType: "Dog" | "Cat" | "Bunny" | "Bird" | "Other";
  gender?: "Male" | "Female" | "Unknown";
  breed?: string;
  color: string;
  age?: string;
  dateReported: Date;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  status: "Active" | "Found" | "Stale";
  imageUrl?: string;
  description: string;
  isFollowed?: boolean;
  postedBy: UserInfo;
}
```

See the file for complete type definitions.

## 🗺️ Current Status

### ✅ Complete
- Modern, responsive UI with animations
- Theme system with 4 color schemes + dark mode
- Google Maps integration with markers and popups
- Advanced filtering and search
- Form validation with character counters
- Gamification badges (frontend display)
- Profile system with stats display

### ⏳ Ready for Your Implementation
- Backend API
- Authentication system
- Database integration
- Image upload to cloud storage
- Real-time features (optional)
- Email notifications (optional)

## 🙏 Acknowledgments

- Icons: [Lucide React](https://lucide.dev/)
- UI Components: [shadcn/ui](https://ui.shadcn.com/)
- Maps: [Google Maps](https://developers.google.com/maps)
- Animation: [Motion (Framer Motion)](https://motion.dev/)
- See [Attributions.md](./Attributions.md) for image credits

---

**Built with ❤️ to help reunite pets with their families**

**Ready for your backend integration! 🚀**
