import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import RoutePolyline from '../components/Map/RoutePolyline';
import UserLocationMarker from '../components/Map/UserLocationMarker';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { stopNavigation, nextStep } from '../store/slices/routeSlice';
import { COLORS } from '../config/constants';

const NavigationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { selectedRoute, navigationState, origin, destination } = useSelector(
    (state) => state.route
  );
  const { userLocation } = useSelector((state) => state.map);

  const currentStep = selectedRoute?.steps?.[navigationState.currentStep] || {};
  const totalSteps = selectedRoute?.steps?.length || 0;

  const handleStopNavigation = () => {
    dispatch(stopNavigation());
    navigation.goBack();
  };

  const handleNextStep = () => {
    if (navigationState.currentStep < totalSteps - 1) {
      dispatch(nextStep());
    } else {
      handleStopNavigation();
    }
  };

  const getDirectionIcon = (direction) => {
    const iconMap = {
      left: 'turn-left',
      right: 'turn-right',
      straight: 'arrow-upward',
      'slight-left': 'subdirectory-arrow-left',
      'slight-right': 'subdirectory-arrow-right',
    };
    return iconMap[direction] || 'navigation';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: origin?.latitude || 37.7749,
            longitude: origin?.longitude || -122.4194,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={false}
          showsCompass
          followsUserLocation
        >
          {userLocation && <UserLocationMarker coordinate={userLocation} />}
          {selectedRoute?.coordinates && (
            <RoutePolyline
              coordinates={selectedRoute.coordinates}
              routeType="smooth"
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleStopNavigation}
        >
          <Icon name="close" size={24} color="#212121" />
        </TouchableOpacity>
      </View>

      <View style={styles.navigationPanel}>
        <Card style={styles.instructionCard}>
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.directionIcon,
                { backgroundColor: COLORS.primary },
              ]}
            >
              <Icon
                name={getDirectionIcon(currentStep.direction)}
                size={32}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.instruction}>
                {currentStep.instruction || 'Follow the route'}
              </Text>
              <Text style={styles.distance}>
                In {currentStep.distance || '0 m'}
              </Text>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((navigationState.currentStep + 1) / totalSteps) * 100
                  }%`,
                },
              ]}
            />
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>ETA</Text>
              <Text style={styles.statValue}>
                {Math.ceil(navigationState.timeRemaining / 60) || 0} min
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>
                {(navigationState.distanceRemaining / 1000).toFixed(1) || 0} km
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Step</Text>
              <Text style={styles.statValue}>
                {navigationState.currentStep + 1}/{totalSteps}
              </Text>
            </View>
          </View>
        </Card>

        <Button
          title="Next Step"
          onPress={handleNextStep}
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
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
  navigationPanel: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  instructionCard: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  directionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepInfo: {
    flex: 1,
  },
  instruction: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#757575',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  nextButton: {
    marginBottom: 0,
  },
});

export default NavigationScreen;
