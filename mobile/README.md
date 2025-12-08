# Stride Mobile App

React Native mobile application for iOS and Android.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- React Native development environment
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

```bash
npm install
```

### iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
npm run ios
```

### Android Setup

```bash
npm run android
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

## Project Structure

```
src/
├── screens/         # Screen components
├── components/      # Reusable components
│   ├── Map/        # Map-related components
│   ├── Navigation/ # Navigation components
│   ├── Reporting/  # Reporting components
│   └── Common/     # Common/shared components
├── navigation/      # Navigation configuration
├── services/        # API and service layer
├── store/           # Redux store
│   ├── actions/    # Redux actions
│   └── reducers/   # Redux reducers
└── utils/          # Utility functions
```

## License

MIT
