// Micro-interactions and animations for mobile app
import { Animated, Easing } from 'react-native';

// Fade in animation
export const fadeIn = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Fade out animation
export const fadeOut = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Scale animation (for buttons, cards)
export const scaleIn = (animatedValue, duration = 200) => {
  return Animated.spring(animatedValue, {
    toValue: 1,
    friction: 5,
    tension: 40,
    useNativeDriver: true,
  });
};

export const scaleOut = (animatedValue, duration = 200) => {
  return Animated.spring(animatedValue, {
    toValue: 0.95,
    friction: 5,
    tension: 40,
    useNativeDriver: true,
  });
};

// Slide in from bottom (for bottom sheets)
export const slideInFromBottom = (animatedValue, duration = 300) => {
  return Animated.spring(animatedValue, {
    toValue: 0,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  });
};

export const slideOutToBottom = (animatedValue, screenHeight, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: screenHeight,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Pulse animation (for notifications, warnings)
export const pulse = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: true,
    }),
  ]);
};

// Shake animation (for errors)
export const shake = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: -10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 10,
      duration: 50,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 50,
      useNativeDriver: true,
    }),
  ]);
};

// Route selection animation
export const routeSelectionAnimation = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.05,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }),
  ]);
};

// Points earned animation (for gamification)
export const pointsEarnedAnimation = (animatedValue) => {
  return Animated.parallel([
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(2),
      useNativeDriver: true,
    }),
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]),
  ]);
};

export default {
  fadeIn,
  fadeOut,
  scaleIn,
  scaleOut,
  slideInFromBottom,
  slideOutToBottom,
  pulse,
  shake,
  routeSelectionAnimation,
  pointsEarnedAnimation,
};
