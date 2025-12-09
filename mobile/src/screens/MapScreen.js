import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import ObstacleMarker from '../components/Map/ObstacleMarker';
import UserLocationMarker from '../components/Map/UserLocationMarker';
import SearchBar from '../components/Navigation/SearchBar';
import GlassCard from '../components/common/GlassCard';
import { fetchObstacles, setUserLocation, setRegion } from '../store/slices/mapSlice';
import { COLORS } from '../theme/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { SPACING } from '../theme/spacing';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const MapScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { region, obstacles, userLocation } = useSelector((state) => state.map);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [mapRef, setMapRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    loadObstacles();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        dispatch(setUserLocation(newLocation));
        dispatch(
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          })
        );
        if (mapRef) {
          mapRef.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
        // Haptic feedback on success
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      },
      (error) => {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: 'Location Error',
          text2: 'Unable to get your location',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  };

  const loadObstacles = async () => {
    try {
      await dispatch(fetchObstacles()).unwrap();
    } catch (error) {
      console.error('Failed to load obstacles:', error);
    }
  };

  const handleObstaclePress = (obstacle) => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    Toast.show({
      type: 'info',
      text1: obstacle.type,
      text2: `Severity: ${obstacle.severity}`,
    });
  };

  const handleReportPress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigation.navigate('Report');
    }
  };

  const handleSearchFocus = () => {
    navigation.navigate('Search');
  };

  const handleSignIn = () => {
    setShowAuthModal(false);
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    setShowAuthModal(false);
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => setMapRef(ref)}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass
        loadingEnabled
      >
        {userLocation && <UserLocationMarker coordinate={userLocation} />}
        {obstacles.map((obstacle) => (
          <ObstacleMarker
            key={obstacle.id}
            obstacle={obstacle}
            onPress={handleObstaclePress}
          />
        ))}
      </MapView>

      {/* Translucent Header */}
      <View style={styles.topBar}>
        <GlassCard padding={SPACING.sm}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onClear={() => setSearchQuery('')}
            placeholder="Where to?"
          />
          
          {/* Guest User Prompt */}
          {!isAuthenticated && (
            <TouchableOpacity 
              onPress={() => setShowAuthModal(true)}
              style={styles.guestPrompt}
            >
              <Text style={styles.guestPromptText}>
                Sign in to save routes
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      </View>

      {/* Floating Action Buttons */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={getCurrentLocation}
      >
        <Icon name="my-location" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={handleReportPress}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Auth Modal */}
      <Modal
        visible={showAuthModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign In Required</Text>
            <Text style={styles.modalText}>
              Sign in to save routes, report obstacles, and unlock premium features.
            </Text>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleSignIn}
            >
              <Text style={styles.modalButtonTextPrimary}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={handleRegister}
            >
              <Text style={styles.modalButtonTextSecondary}>Create Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButtonClose}
              onPress={() => setShowAuthModal(false)}
            >
              <Text style={styles.modalButtonTextClose}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: SPACING.md,
    right: SPACING.md,
  },
  guestPrompt: {
    marginTop: SPACING.xs,
    alignItems: 'center',
  },
  guestPromptText: {
    fontSize: TYPOGRAPHY.fontSize.caption,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  myLocationButton: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 100,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reportButton: {
    position: 'absolute',
    right: SPACING.md,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.background.light,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.h3,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalText: {
    fontSize: TYPOGRAPHY.fontSize.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.body,
  },
  modalButton: {
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalButtonTextPrimary: {
    fontSize: TYPOGRAPHY.fontSize.button,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.inverse,
  },
  modalButtonTextSecondary: {
    fontSize: TYPOGRAPHY.fontSize.button,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  modalButtonClose: {
    marginTop: SPACING.xs,
    padding: SPACING.sm,
    alignItems: 'center',
  },
  modalButtonTextClose: {
    fontSize: TYPOGRAPHY.fontSize.bodySmall,
    color: COLORS.text.secondary,
  },
});

export default MapScreen;
