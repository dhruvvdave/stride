import React from 'react';
import { Marker } from 'react-native-maps';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, OBSTACLE_SEVERITY } from '../../config/constants';

const ObstacleMarker = ({ obstacle, onPress }) => {
  const getMarkerColor = (severity) => {
    switch (severity) {
      case OBSTACLE_SEVERITY.LOW:
        return COLORS.success;
      case OBSTACLE_SEVERITY.MEDIUM:
        return COLORS.warning;
      case OBSTACLE_SEVERITY.HIGH:
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: obstacle.latitude,
        longitude: obstacle.longitude,
      }}
      onPress={() => onPress && onPress(obstacle)}
      tracksViewChanges={false}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: getMarkerColor(obstacle.severity) },
        ]}
      >
        <Text style={styles.markerText}>!</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ObstacleMarker;
