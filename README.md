# FindMyPet

> **A community-driven platform leveraging technology to reunite lost pets with their families, making cities more inclusive, safe, resilient, and sustainable.**

FindMyPet is a web application designed to address the critical challenge of lost pets in urban environments. By harnessing the power of community collaboration, geolocation technology, and modern web infrastructure, we create a resilient network that helps pet owners quickly locate their missing companions while reducing the burden on animal shelters and municipal resources.

---

## 🚀 Features

### **Minimum Viable Product (MVP)**

#### **Pet Listings**
- **Lost Pet Reports**: Pet owners can create detailed listings with:
  - Pet characteristics (name, type, breed, color, gender, age)
  - Last seen location with geocoordinates
  - Multiple photos
  - Description and identifying features
  - Date lost information

- **Sighting Reports**: Community members can report found animals with:
  - Animal type and physical characteristics
  - Location where spotted
  - Date and time of sighting
  - Photos and description
  - Optional linking to existing lost pet listings

#### **User Authentication**
- Google OAuth2 integration for secure, one-click sign-in
- User profile management
- JWT-based session management
- Automatic user creation on first login

#### **Listing Management**
- Create, read, update, and delete listings
- Mark listings as "Found" with automatic timestamp
- Ownership verification for updates/deletions
- Filter listings by:
  - Animal type
  - Location (city, province/state, country)
  - User's own listings
  - Status (Active, Found, Stale)

#### **Advanced Filtering & Search**
- Tag-based filtering (fur color, breed, animal type)
- Geographic filtering
- Date range filtering
- Pagination support (up to 100 items per page)

### **Future Enhancements (Post-MVP)**

- **User Messaging**: In-app communication system
- **Geolocation + Maps**: Interactive map view with radius markers and nearby listings visualization
- **User Rating System**: Gamification and trust/reputation system
- **Stale Listing Management**: Automatic greying out of listings older than 30 days
- **AI Features**: 
  - AI-powered pet matching and comparison
  - Route suggestions to nearby animal shelters
  - Automated shelter and rescue location integration
- **Social Media Integration**: Automated posting to Instagram, Facebook, etc.
- **Email/Phone Notifications**: Automated alerts for new sightings matching search criteria

---

## Architecture

### **Technology Stack**

#### **Frontend**
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Google Maps API** (via `@vis.gl/react-google-maps`) for map visualization

#### **Backend**
- **Go 1.25** for Lambda functions
- **AWS Lambda** for serverless compute
- **AWS API Gateway** for REST API
- **PostgreSQL** (via Supabase) for database
- **AWS S3** for image storage

#### **Infrastructure**
- **Terraform**: Infrastructure provisioning and management

### **System Architecture**

```
┌─────────────────┐
│   React Frontend │
│   (Vite + TS)    │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────┐
│  API Gateway     │
│  (REST API)      │
└────────┬────────┘
         │
         ├──────────┬──────────┬──────────┬──────────┐
         │          │          │          │          │
         ▼          ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Google │ │ Lost   │ │Sighting│ │ Image  │ │ Auth   │
    │ Login  │ │Listing │ │Listing │ │ Upload │ │        │
    │Lambda  │ │Lambda  │ │Lambda  │ │Lambda  │ │Lambda  │
    └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
        │          │          │          │          │
        └──────────┴──────────┴──────────┴──────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  (Supabase)  │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    AWS S3     │
                    │  (Images)     │
                    └──────────────┘
```

### **API Endpoints**

#### **Authentication**
- `POST /google-log-in` - Authenticate with Google OAuth token

#### **Lost Pet Listings**
- `GET /lost-listing` - Get all lost pet listings (with filters)
- `GET /lost-listing/{id}` - Get specific lost pet listing
- `POST /lost-listing` - Create new lost pet listing
- `PUT /lost-listing/{id}` - Update lost pet listing
- `DELETE /lost-listing/{id}` - Delete lost pet listing

#### **Sighting Listings**
- `GET /sighting-listing` - Get all sighting listings (with filters)
- `GET /sighting-listing/{id}` - Get specific sighting listing
- `POST /sighting-listing` - Create new sighting listing
- `PUT /sighting-listing/{id}` - Update sighting listing
- `DELETE /sighting-listing/{id}` - Delete sighting listing

#### **Image Upload**
- `POST /image-upload` - Generate presigned URL for S3 upload

---

## Project Structure

```
FindMyPet/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/          # Radix UI components
│   │   │   ├── AuthButton.tsx
│   │   │   ├── LostPetForm.tsx
│   │   │   ├── SightingForm.tsx
│   │   │   ├── LocationPicker.tsx
│   │   │   └── ...
│   │   ├── pages/           # Route pages
│   │   │   ├── Home.tsx
│   │   │   ├── Listings.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── PetDetails.tsx
│   │   │   └── ...
│   │   ├── types/           # TypeScript type definitions
│   │   └── lib/             # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── api/                 # Lambda function source code
│   │   ├── generic/         # Shared utilities
│   │   │   ├── authorizer.go
│   │   │   ├── responses.go
│   │   │   └── supabase.go
│   │   ├── google/
│   │   │   └── log-in/      # Google OAuth handler
│   │   ├── lost-listing/    # Lost pet CRUD operations
│   │   ├── sighting-listing/# Sighting CRUD operations
│   │   ├── image-upload/    # S3 presigned URL generator
│   │   └── go.mod
│   │
│   └── infra/               # Terraform infrastructure
│       ├── main.tf
│       ├── variables.tf
│       ├── providers.tf
│       └── modules/
│           ├── api-gateway/
│           ├── lambda/
│           └── s3-bucket/
│
└── README.md
```

---

## Setup & Installation

### **Prerequisites**

- **Node.js** 18+ and npm
- **Go** 1.25+
- **Terraform** (for infrastructure deployment)
- **AWS CLI** configured with appropriate credentials
- **Google OAuth** credentials
- **Supabase** account and database connection string

### **Frontend Setup**

```bash
cd frontend
npm install
npm run dev  # Development server on http://localhost:5173
npm run build  # Production build
```

### **Backend Setup**

#### **Environment Variables**

Create a `.env` file or set environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# AWS Configuration
AWS_REGION=us-west-2
S3_BUCKET_NAME=your-bucket-name
```

#### **Build Lambda Functions**

```bash
cd backend/api
./build.sh  # Builds all Lambda functions
```

#### **Deploy Infrastructure**

```bash
cd backend/infra
terraform init
terraform plan
terraform apply
```

### **Database Schema**

The application uses PostgreSQL with the following key tables:

- `users` - User accounts (email, name, picture)
- `cities` - City information (city_name, province_or_state, country)
- `locations` - Geographic locations (street_address, postal_code, latitude, longitude)
- `lost_listing` - Lost pet listings
- `sighting_listing` - Found pet sighting reports

---

## Key Features in Detail

### **Dual Listing System**

The platform supports two types of listings:

1. **Lost Pet Listings**: Created by pet owners when their pet goes missing
2. **Sighting Listings**: Created by community members who spot a potentially lost animal

This dual approach maximizes the chances of reunification by allowing both proactive searching and reactive reporting.
