import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import ObstacleMarker from '../components/Map/ObstacleMarker';
import UserLocationMarker from '../components/Map/UserLocationMarker';
import SearchBar from '../components/Navigation/SearchBar';
import { fetchObstacles, setUserLocation, setRegion } from '../store/slices/mapSlice';
import { COLORS } from '../config/constants';

const MapScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { region, obstacles, userLocation } = useSelector((state) => state.map);
  const [mapRef, setMapRef] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    navigation.navigate('Report');
  };

  const handleSearchFocus = () => {
    navigation.navigate('Search');
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

      <View style={styles.topBar}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={handleSearchFocus}
          onClear={() => setSearchQuery('')}
          placeholder="Where to?"
        />
      </View>

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
    left: 16,
    right: 16,
  },
  myLocationButton: {
    position: 'absolute',
    right: 16,
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
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportButton: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default MapScreen;
