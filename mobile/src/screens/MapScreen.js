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
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import ObstacleMarker from '../components/Map/ObstacleMarker';
import UserLocationMarker from '../components/Map/UserLocationMarker';
import SearchBar from '../components/Navigation/SearchBar';
import GlassCard from '../components/Common/GlassCard';
import { fetchObstacles, setUserLocation, setRegion } from '../store/slices/mapSlice';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
  const [showGuestModal, setShowGuestModal] = useState(false);

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
    // Show obstacle details or navigate to detail view
    Toast.show({
      type: 'info',
      text1: obstacle.type,
      text2: `Severity: ${obstacle.severity}`,
    });
  };

  const handleReportPress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    if (!isAuthenticated) {
      setShowGuestModal(true);
    } else {
      navigation.navigate('Report');
    }
  };

  const handleSearchFocus = () => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    navigation.navigate('Search');
  };

  const handleCenterLocation = () => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    getCurrentLocation();
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

      {/* Translucent Search Bar with Glass Effect */}
      <View style={styles.topBar}>
        <GlassCard style={styles.glassSearchCard}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onClear={() => setSearchQuery('')}
            placeholder="Where to?"
          />
          {/* Guest prompt */}
          {!isAuthenticated && (
            <TouchableOpacity 
              style={styles.guestPrompt}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.guestPromptText}>
                <Text style={styles.guestPromptLink}>Sign in</Text> to save routes
              </Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      </View>

      {/* Floating Action Buttons */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleCenterLocation}
      >
        <Icon name="my-location" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={handleReportPress}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Guest Modal */}
      <Modal
        visible={showGuestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGuestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign In Required</Text>
            <Text style={styles.modalText}>
              Sign in to report obstacles and unlock premium features.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowGuestModal(false);
                navigation.navigate('Login');
              }}
            >
              <Text style={styles.modalButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => setShowGuestModal(false)}
            >
              <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    top: 60,
    left: spacing.md,
    right: spacing.md,
  },
  glassSearchCard: {
    padding: spacing.md,
  },
  guestPrompt: {
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  guestPromptText: {
    fontSize: typography.small,
    color: colors.gray600,
  },
  guestPromptLink: {
    color: colors.primary,
    fontWeight: typography.semibold,
  },
  myLocationButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: 100,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reportButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background.light,
    borderRadius: 16,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: typography.bold,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  modalText: {
    fontSize: typography.body,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalButtonText: {
    fontSize: typography.button,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: typography.button,
    fontWeight: typography.semibold,
    color: colors.primary,
  },
});

export default MapScreen;
