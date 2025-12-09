import React, { useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Swiper from 'react-native-swiper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import ConfettiCannon from 'react-native-confetti-cannon';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const OnboardingScreen = ({ navigation }) => {
  const swiperRef = useRef(null);
  const confettiRef = useRef(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pages = [
    {
      icon: '👋',
      title: 'Welcome to Stride',
      description: 'Navigate smarter. Drive smoother. Experience the future of road navigation with AI-powered route planning.',
      color: COLORS.primary,
    },
    {
      icon: '🚗',
      title: 'Avoid Obstacles',
      description: 'Get real-time alerts for speed bumps, potholes, and rough roads. Choose routes optimized for your vehicle.',
      color: COLORS.warning,
    },
    {
      icon: '🌟',
      title: 'Join the Community',
      description: 'Report obstacles, help others, and earn points. Climb the leaderboard and unlock achievements.',
      color: COLORS.success,
    },
    {
      icon: '💎',
      title: 'Go Premium',
      description: 'Unlock AI-powered routes, vehicle profiles, advanced analytics, and priority support.',
      color: COLORS.premium,
    },
  ];

  const handleIndexChanged = (index) => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    
    // Scale animation on page change
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGetStarted = () => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
    // Trigger confetti
    if (confettiRef.current) {
      confettiRef.current.start();
    }
    // Navigate after a short delay
    setTimeout(() => {
      navigation.replace('Map');
    }, 1000);
  };

  const handleSkip = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    navigation.replace('Map');
  };

  const handleNext = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    if (swiperRef.current) {
      swiperRef.current.scrollBy(1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      <Swiper
        ref={swiperRef}
        loop={false}
        dot={<View style={styles.dot} />}
        activeDot={<View style={styles.activeDot} />}
        paginationStyle={styles.pagination}
        onIndexChanged={handleIndexChanged}
      >
        {pages.map((page, index) => (
          <View key={index} style={styles.slide}>
            <Animated.View 
              style={[
                styles.iconContainer,
                { 
                  backgroundColor: `${page.color}20`,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={styles.icon}>{page.icon}</Text>
            </Animated.View>
            
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.description}>{page.description}</Text>
          </View>
        ))}
      </Swiper>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            if (swiperRef.current) {
              const currentIndex = swiperRef.current.state.index;
              if (currentIndex === pages.length - 1) {
                handleGetStarted();
              } else {
                handleNext();
              }
            }
          }}
        >
          <Text style={styles.buttonText}>
            {swiperRef.current?.state?.index === pages.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipButtonText: {
    fontSize: TYPOGRAPHY.fontSize.bodySmall,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  iconContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  icon: {
    fontSize: 100,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.h2,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.body,
    paddingHorizontal: SPACING.lg,
  },
  pagination: {
    bottom: 120,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[300],
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginHorizontal: 4,
  },
  actions: {
    position: 'absolute',
    bottom: 40,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.button,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.inverse,
  },
});

export default OnboardingScreen;
