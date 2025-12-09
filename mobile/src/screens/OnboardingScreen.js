import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import Swiper from 'react-native-swiper';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Button from '../components/Common/Button';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const OnboardingScreen = ({ navigation }) => {
  const swiperRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const pages = [
    {
      icon: '👋',
      title: 'Welcome to Stride',
      description: 'Navigate smarter. Drive smoother. Experience the future of navigation.',
      color: colors.primary,
    },
    {
      icon: '🚧',
      title: 'Avoid Obstacles',
      description: 'Get real-time alerts for speed bumps, potholes, and rough roads. Choose the smoothest route.',
      color: colors.warning,
    },
    {
      icon: '🏆',
      title: 'Join the Community',
      description: 'Report obstacles, earn points, and climb the leaderboard. Help make roads better for everyone.',
      color: colors.success,
    },
    {
      icon: '⭐',
      title: 'Unlock Premium',
      description: 'AI-powered routing, advanced analytics, vehicle profiles, and unlimited offline maps.',
      color: colors.premium,
    },
  ];

  const handleNext = () => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    if (currentIndex < pages.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    handleGetStarted();
  };

  const handleGetStarted = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Map');
    });
  };

  const handleIndexChanged = (index) => {
    setCurrentIndex(index);
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Swiper
          ref={swiperRef}
          loop={false}
          onIndexChanged={handleIndexChanged}
          dot={<View style={styles.dot} />}
          activeDot={<View style={styles.activeDot} />}
          paginationStyle={styles.pagination}
        >
          {pages.map((page, index) => (
            <View key={index} style={styles.slide}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{page.icon}</Text>
              </View>
              <Text style={styles.title}>{page.title}</Text>
              <Text style={styles.description}>{page.description}</Text>
            </View>
          ))}
        </Swiper>

        <View style={styles.actions}>
          <Button
            title={currentIndex === pages.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.button}
          />
          {currentIndex < pages.length - 1 && (
            <Button
              title="Skip"
              onPress={handleSkip}
              variant="text"
              style={styles.skipButton}
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  content: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: typography.bold,
    color: colors.text.light,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  pagination: {
    bottom: 120,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
  actions: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
  button: {
    marginBottom: spacing.sm,
  },
  skipButton: {
    marginTop: spacing.xs,
  },
});

export default OnboardingScreen;
