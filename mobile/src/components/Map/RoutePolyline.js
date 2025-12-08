import React from 'react';
import { Polyline } from 'react-native-maps';
import { COLORS } from '../../config/constants';

const RoutePolyline = ({ coordinates, routeType = 'standard' }) => {
  const getRouteColor = () => {
    switch (routeType) {
      case 'smooth':
        return COLORS.success;
      case 'fastest':
        return COLORS.primary;
      case 'standard':
      default:
        return COLORS.warning;
    }
  };

  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  return (
    <Polyline
      coordinates={coordinates}
      strokeColor={getRouteColor()}
      strokeWidth={4}
      lineCap="round"
      lineJoin="round"
    />
  );
};

export default RoutePolyline;
