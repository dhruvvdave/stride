import React from 'react';
import { Marker } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../config/constants';

const UserLocationMarker = ({ coordinate }) => {
  if (!coordinate) {
    return null;
  }

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={false}
    >
      <View style={styles.outerCircle}>
        <View style={styles.innerCircle} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  outerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
});

export default UserLocationMarker;
