import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#1C1C1E' : '#F5F5F5',
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>
            Stride 🚗
          </Text>
          <Text style={[styles.tagline, isDarkMode && styles.taglineDark]}>
            Navigate smarter. Drive smoother.
          </Text>
          <View style={styles.card}>
            <Text style={[styles.heading, isDarkMode && styles.headingDark]}>
              Welcome to Stride!
            </Text>
            <Text style={[styles.text, isDarkMode && styles.textDark]}>
              The navigation app that finds optimal routes by avoiding speed
              bumps, potholes, and rough roads.
            </Text>
          </View>
          <View style={styles.card}>
            <Text style={[styles.heading, isDarkMode && styles.headingDark]}>
              Getting Started
            </Text>
            <Text style={[styles.text, isDarkMode && styles.textDark]}>
              This is the starter template for the Stride mobile app.
            </Text>
            <Text style={[styles.text, isDarkMode && styles.textDark]}>
              Start building amazing features for smooth navigation!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 8,
  },
  titleDark: {
    color: '#F5F5F5',
  },
  tagline: {
    fontSize: 17,
    color: '#616161',
    textAlign: 'center',
    marginBottom: 32,
  },
  taglineDark: {
    color: '#9E9E9E',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  headingDark: {
    color: '#F5F5F5',
  },
  text: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
    marginBottom: 8,
  },
  textDark: {
    color: '#E0E0E0',
  },
});

export default App;
