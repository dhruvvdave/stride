import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import Button from '../components/Common/Button';
import { COLORS } from '../config/constants';

const OnboardingScreen = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      icon: '🗺️',
      title: 'Smart Route Planning',
      description: 'Find the smoothest routes by avoiding speed bumps, potholes, and rough roads.',
    },
    {
      icon: '📍',
      title: 'Report Obstacles',
      description: 'Help the community by reporting road obstacles with your camera.',
    },
    {
      icon: '🏆',
      title: 'Earn Achievements',
      description: 'Get points, unlock achievements, and climb the leaderboard.',
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.navigate('Login');
    }
  };

  const handleSkip = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>{pages[currentPage].icon}</Text>
          <Text style={styles.title}>{pages[currentPage].title}</Text>
          <Text style={styles.description}>{pages[currentPage].description}</Text>
        </View>

        <View style={styles.pagination}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          <Button
            title={currentPage === pages.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.button}
          />
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="text"
            style={styles.skipButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  icon: {
    fontSize: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  actions: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 12,
  },
  skipButton: {
    marginTop: 4,
  },
});

export default OnboardingScreen;
