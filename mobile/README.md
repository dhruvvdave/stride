# Stride Mobile App

React Native mobile application for iOS and Android.

## 📱 Overview

The Stride mobile app is a production-ready React Native application that provides smooth navigation by helping users avoid speed bumps, potholes, and rough roads. Built with React Native 0.73, it features a complete navigation system, obstacle reporting, community leaderboard, and premium features.

## ✨ Features

### Core Features
- 🗺️ **Interactive Maps** - Real-time map with custom obstacle markers
- 🧭 **Smart Route Planning** - Compare smooth, standard, and fastest routes
- 📍 **Turn-by-Turn Navigation** - Live navigation with step-by-step guidance
- 📸 **Obstacle Reporting** - Report road obstacles with camera integration
- 🏆 **Community Leaderboard** - Compete with other users and earn points
- 👤 **User Profiles** - Track stats, achievements, and driving history

### Premium Features
- 🚗 **Vehicle Profiles** - Manage multiple vehicles with custom settings
- 🤖 **AI Obstacle Detection** - Automatic detection using phone sensors
- 📊 **Advanced Analytics** - Detailed insights about your driving
- 💾 **Unlimited Offline Maps** - Download maps for offline use

## 🏗️ Architecture

### Tech Stack
- **Framework**: React Native 0.73
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation 6 (Stack & Bottom Tabs)
- **Maps**: react-native-maps (Google Maps for Android, Apple Maps for iOS)
- **API Client**: Axios with JWT authentication
- **Storage**: AsyncStorage for offline data
- **UI Icons**: react-native-vector-icons (Material Icons)
- **Media**: react-native-image-picker for camera/gallery
- **Notifications**: Firebase Cloud Messaging
- **IAP**: react-native-iap for subscriptions

### Project Structure

```
mobile/
├── src/
│   ├── screens/           # Screen components (13 screens)
│   │   ├── MapScreen.js
│   │   ├── NavigationScreen.js
│   │   ├── RouteResultScreen.js
│   │   ├── SearchScreen.js
│   │   ├── ReportScreen.js
│   │   ├── ProfileScreen.js
│   │   ├── CommunityScreen.js
│   │   ├── SettingsScreen.js
│   │   ├── PremiumScreen.js
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── OnboardingScreen.js
│   │   └── VehicleFormScreen.js
│   ├── components/        # Reusable components
│   │   ├── Common/       # Button, Input, Card, Modal, LoadingSpinner
│   │   ├── Map/          # ObstacleMarker, RoutePolyline, UserLocationMarker
│   │   ├── Navigation/   # SearchBar, RouteCard
│   │   └── Profile/      # StatCard, AchievementBadge, VehicleCard
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.js
│   ├── services/          # API and service layer
│   │   ├── authService.js
│   │   ├── obstacleService.js
│   │   ├── routeService.js
│   │   ├── userService.js
│   │   └── uploadService.js
│   ├── store/            # Redux store
│   │   ├── index.js
│   │   └── slices/       # Redux slices
│   │       ├── authSlice.js
│   │       ├── mapSlice.js
│   │       ├── routeSlice.js
│   │       ├── userSlice.js
│   │       └── obstacleSlice.js
│   ├── config/           # Configuration files
│   │   ├── api.js
│   │   └── constants.js
│   └── utils/            # Utility functions
├── App.js                # Root component
├── index.js              # Entry point
├── package.json          # Dependencies
└── .env.example          # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- React Native development environment
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

1. **Install Dependencies**
```bash
cd mobile
npm install
```

2. **Set Up Environment Variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **iOS Setup** (macOS only)
```bash
cd ios
pod install
cd ..
```

### Running the App

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 📋 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
API_BASE_URL=http://localhost:3000/api

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=stride-app
CLOUDINARY_UPLOAD_PRESET=stride_obstacles

# Google Maps API Key (Android)
GOOGLE_MAPS_API_KEY_ANDROID=your_android_api_key_here

# Firebase Configuration
FIREBASE_APP_ID_ANDROID=your_firebase_android_app_id
FIREBASE_APP_ID_IOS=your_firebase_ios_app_id

# In-App Purchase Product IDs
IAP_PRODUCT_MONTHLY=com.stride.premium.monthly
IAP_PRODUCT_YEARLY=com.stride.premium.yearly
```

## 🔧 Platform-Specific Setup

### iOS Configuration

Add permissions to `ios/Stride/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show you on the map and provide navigation.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to provide turn-by-turn navigation.</string>
<key>NSCameraUsageDescription</key>
<string>We need camera access to let you take photos of obstacles.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to let you choose photos.</string>
```

### Android Configuration

Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

Add Google Maps API key to `android/app/src/main/AndroidManifest.xml`:

```xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
</application>
```

## 📦 Build for Production

### iOS

```bash
cd ios
pod install
cd ..

# Build for release
npx react-native run-ios --configuration Release
```

### Android

```bash
# Build APK
cd android
./gradlew assembleRelease

# Build AAB (for Play Store)
./gradlew bundleRelease
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## 📱 Screens

1. **Onboarding** - Introduction to app features
2. **Login/Register** - User authentication
3. **Map** - Main screen with obstacle markers
4. **Search** - Location search with autocomplete
5. **Route Result** - Compare 3 route options
6. **Navigation** - Turn-by-turn guidance
7. **Report** - Report obstacles with camera
8. **Profile** - User stats and achievements
9. **Community** - Leaderboard rankings
10. **Settings** - App preferences
11. **Premium** - Subscription upgrade
12. **Vehicle Form** - Add/edit vehicles

## 🔐 Security

- ✅ JWT authentication with auto-refresh
- ✅ Secure token storage with AsyncStorage
- ✅ Protected API routes
- ✅ Input validation on all forms
- ✅ CodeQL security scan passed (0 vulnerabilities)

## 📊 Performance

- Optimized renders with React.memo
- Efficient state updates with Redux Toolkit
- Image optimization with react-native-fast-image
- AsyncStorage for offline data persistence
- Lazy loading for better initial load time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Projects

- [Backend API](../backend) - Node.js/Express backend
- [Web App](../web) - React + Vite web application

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check the documentation
- Contact support team

## 🎉 Acknowledgments

- Built with React Native
- Maps by Google Maps (Android) and Apple Maps (iOS)
- Icons by Material Icons
- Backend API integration ready

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: December 2025
