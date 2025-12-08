# Stride Web Application

A production-ready React + Vite web application for Stride - the smart navigation app that finds optimal routes by avoiding obstacles.

## 🚀 Features

### Core Features
- **Smart Navigation** - Leaflet-based interactive map with OpenStreetMap
- **Obstacle Mapping** - Report and view speed bumps, potholes, and road hazards
- **Route Planning** - Compare smooth, standard, and fastest route options
- **Turn-by-Turn Navigation** - Active navigation with step-by-step instructions
- **User Profiles** - Track stats, achievements, and progress
- **Community Features** - Leaderboards and car clubs
- **Premium Subscription** - Stripe integration for premium features

### Technical Features
- React 18 with React Router for routing
- Redux Toolkit for state management
- Tailwind CSS for styling (following design system)
- Leaflet for interactive maps
- Axios for API communication
- JWT authentication
- Hot-toast notifications
- Responsive design (mobile/tablet/desktop)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your values
# VITE_API_BASE_URL=http://localhost:3000
# VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
# VITE_STRIPE_PRICE_ID=your_price_id
```

### Running the App

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (Button, Input, Card, Modal)
│   ├── layout/          # Layout components (Header, Sidebar, Footer)
│   ├── map/             # Map-related components
│   ├── navigation/      # Navigation components
│   ├── reporting/       # Obstacle reporting components (ReportObstacleModal)
│   ├── profile/         # Profile components
│   └── community/       # Community components
├── pages/               # Page components
│   ├── Home.jsx         # Landing page
│   ├── Login.jsx        # Authentication
│   ├── Register.jsx     # User registration
│   ├── Map.jsx          # Main map view
│   ├── RouteResult.jsx  # Route comparison
│   ├── Navigation.jsx   # Turn-by-turn navigation
│   ├── Profile.jsx      # User profile
│   ├── Community.jsx    # Leaderboard
│   ├── Settings.jsx     # Account settings
│   └── Premium.jsx      # Premium upgrade
├── store/               # Redux store
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── mapSlice.js
│       ├── routeSlice.js
│       ├── obstacleSlice.js
│       └── userSlice.js
├── services/            # API services
│   ├── api.js           # Axios configuration with JWT
│   ├── auth.js
│   ├── obstacles.js
│   ├── routing.js
│   ├── users.js
│   └── stripe.js
├── App.jsx              # Main app component with routing
├── main.jsx             # App entry point
└── index.css            # Global styles with Tailwind
```

## 🎨 Design System

Following the design system defined in `docs/DESIGN_SYSTEM.md`:

- **Primary Blue**: #2196F3
- **Success Green**: #4CAF50
- **Warning Orange**: #FF9800
- **Danger Red**: #F44336
- **Typography**: Inter font family
- **Spacing**: 4px grid system
- **Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)

## 🔐 Authentication

JWT authentication flow:
1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent with all API requests via Axios interceptor
5. Auto-redirect to login on 401 responses

## 🗺️ Map Integration

- **Library**: Leaflet + React-Leaflet
- **Tiles**: OpenStreetMap
- **Features**: User location tracking, obstacle markers, route visualization

## 💳 Stripe Integration

Premium subscription via Stripe Checkout with webhooks for subscription updates.

## 🌐 Configuration

Environment variables (see `.env.example`):

```bash
# Backend API
VITE_API_BASE_URL=http://localhost:3000

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PRICE_ID=price_...

# Map
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Cloudinary (for image uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📱 Responsive Design

Fully responsive with three breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## License

MIT

---

Built with ❤️ for smooth drives everywhere
