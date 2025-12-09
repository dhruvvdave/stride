// API Configuration
export const API_BASE_URL = process.env.API_BASE_URL || 
  (__DEV__ ? 'http://localhost:3000/api' : 'https://api.stride.com/api');

// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'stride-app';
export const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || 'stride_obstacles';

// Map Configuration
export const DEFAULT_MAP_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Obstacle Types
export const OBSTACLE_TYPES = {
  SPEED_BUMP: 'speed_bump',
  POTHOLE: 'pothole',
  ROUGH_ROAD: 'rough_road',
  CONSTRUCTION: 'construction',
  OTHER: 'other',
};

// Obstacle Severity
export const OBSTACLE_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Route Types
export const ROUTE_TYPES = {
  SMOOTH: 'smooth',
  STANDARD: 'standard',
  FASTEST: 'fastest',
};

// Premium Features
export const PREMIUM_FEATURES = {
  VEHICLE_PROFILES: 'vehicle_profiles',
  AI_DETECTION: 'ai_detection',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  UNLIMITED_OFFLINE: 'unlimited_offline',
};

// IAP Product IDs
export const IAP_PRODUCTS = {
  IOS: {
    MONTHLY: 'com.stride.premium.monthly',
    YEARLY: 'com.stride.premium.yearly',
  },
  ANDROID: {
    MONTHLY: 'com.stride.premium.monthly',
    YEARLY: 'com.stride.premium.yearly',
  },
};

// Theme Colors (updated to match design spec)
export const COLORS = {
  primary: '#0066FF',
  secondary: '#757575',
  success: '#00C853',
  warning: '#FF9500',
  danger: '#FF3B30',
  background: {
    light: '#FFFFFF',
    dark: '#000000', // OLED black
  },
  text: {
    light: '#212121',
    dark: '#F5F5F5',
  },
  card: {
    light: '#FFFFFF',
    dark: '#2C2C2E',
  },
};

// Permissions
export const PERMISSIONS = {
  LOCATION: 'location',
  CAMERA: 'camera',
  PHOTOS: 'photos',
};
