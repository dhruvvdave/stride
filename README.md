# Stride 🚗

> Navigate smarter. Drive smoother.

Stride is a freemium navigation app that finds optimal routes by avoiding speed bumps, potholes, and rough roads. Perfect for car enthusiasts, lowered vehicles, and anyone who values a comfortable driving experience.

## 🎯 Overview

Tired of jarring bumps and uncomfortable drives? Stride uses community-powered data and AI to route you around road obstacles, delivering the smoothest journey possible.

**Target Market**: Ontario, Canada (expanding)

## ✨ Features

### Free Tier
- 🗺️ **Core Navigation**: Turn-by-turn directions with obstacle avoidance
- 📍 **Obstacle Mapping**: Mark speed bumps, potholes, and rough roads
- 👥 **Community Features**: Upvote/downvote reports, view community data
- 🌍 **Enhanced Mapping**: Real-time traffic, satellite view, 3D buildings
- 🔗 **Data Integration**: Weather, construction, events data
- 📱 **Social Sharing**: Share routes and favorite locations
- 📊 **Basic Analytics**: Trip history and stats
- ♿ **Accessibility**: VoiceOver, dynamic text, high contrast
- 🚙 **CarPlay/Android Auto**: In-vehicle integration

### Premium Tier ($6.99/month or $59.99/year)
- 🚗 **Vehicle Profiles**: Custom clearance and suspension settings
- 🤖 **AI Obstacle Detection**: Automatic detection using accelerometer/gyroscope
- 🧠 **AI-Powered Routing**: Smart route optimization based on preferences
- 📈 **Advanced Analytics**: Detailed insights and export capabilities
- 👑 **Premium Social**: Verified badges, custom profiles
- 🚫 **Ad-Free Experience**: Clean, distraction-free interface
- 💬 **Priority Support**: Faster response times

## 🛠️ Tech Stack

### Mobile
- **React Native** - Cross-platform mobile development
- **React Native Maps** - Map rendering and interaction
- **Redux Toolkit** - State management
- **React Navigation** - Navigation framework

### Backend
- **Node.js + Express** - REST API server
- **PostgreSQL + PostGIS** - Geospatial database
- **Redis** - Caching and session management
- **Socket.io** - Real-time updates
- **JWT** - Authentication

### Web
- **React + Vite** - Web application
- **Leaflet** - Interactive maps
- **TailwindCSS** - Styling
- **Redux Toolkit** - State management

### Infrastructure
- **Railway** - Backend hosting
- **Vercel** - Web hosting
- **Supabase** - PostgreSQL database (alternative)

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL with PostGIS extension
- Redis
- React Native development environment (for mobile)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run migrate
npm run dev
```

### Mobile Setup
```bash
cd mobile
npm install
# iOS
npx pod-install
npm run ios
# Android
npm run android
```

### Web Setup
```bash
cd web
npm install
npm run dev
```

## 📋 Roadmap

### Phase 1: MVP (Months 1-3)
- Core navigation with obstacle avoidance
- Basic obstacle reporting and mapping
- User authentication
- Mobile app (iOS & Android)
- Basic web interface

### Phase 2: Community & Growth (Months 4-6)
- Community voting system
- Enhanced obstacle categories
- Social features (sharing, profiles)
- Premium tier launch
- Analytics dashboard

### Phase 3: AI & Scale (Months 7-12)
- AI obstacle detection
- AI-powered routing optimization
- Vehicle profile system
- Advanced analytics
- Geographic expansion beyond Ontario

## 📖 Documentation

- [Feature Specifications](docs/FEATURE_SPECS.md)
- [Monetization Strategy](docs/MONETIZATION.md)
- [Technical Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN_SYSTEM.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:
- Code of conduct
- Development setup
- Pull request process
- Coding standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Dhruv Dave** - [@dhruvvdave](https://github.com/dhruvvdave)

Project Link: [https://github.com/dhruvvdave/stride](https://github.com/dhruvvdave/stride)

---

Made with ❤️ for smooth drives everywhere
