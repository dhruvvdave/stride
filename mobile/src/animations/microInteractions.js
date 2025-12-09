import { Animated, Easing } from 'react-native';

// Micro-interactions for smooth animations (60fps target)

// Route selection animation
export const animateRouteSelection = (animatedValue, toValue = 1) => {
  return Animated.spring(animatedValue, {
    toValue,
    friction: 8,
    tension: 40,
    useNativeDriver: true,
  });
};

// Points earned animation
export const animatePointsEarned = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 1.2,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }),
  ]);
};

// Card press animation
export const animateCardPress = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }),
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }),
  ]);
};

// Fade in animation
export const animateFadeIn = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Slide up animation
export const animateSlideUp = (animatedValue, duration = 300) => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });
};

// Scale animation
export const animateScale = (animatedValue, toValue = 1, duration = 200) => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: Easing.ease,
    useNativeDriver: true,
  });
};

// Pulse animation (for notifications)
export const animatePulse = (animatedValue) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1.1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ])
  );
};

// Shake animation (for errors)
const SHAKE_OFFSET = 10;
const SHAKE_DURATION = 50;

export const animateShake = (animatedValue) => {
  return Animated.sequence([
    Animated.timing(animatedValue, { toValue: SHAKE_OFFSET, duration: SHAKE_DURATION, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -SHAKE_OFFSET, duration: SHAKE_DURATION, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: SHAKE_OFFSET, duration: SHAKE_DURATION, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: -SHAKE_OFFSET, duration: SHAKE_DURATION, useNativeDriver: true }),
    Animated.timing(animatedValue, { toValue: 0, duration: SHAKE_DURATION, useNativeDriver: true }),
  ]);
};

export default {
  animateRouteSelection,
  animatePointsEarned,
  animateCardPress,
  animateFadeIn,
  animateSlideUp,
  animateScale,
  animatePulse,
  animateShake,
};
