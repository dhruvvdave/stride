import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Card from '../Common/Card';
import { COLORS } from '../../config/constants';

const RouteCard = ({ route, routeType, selected, onSelect }) => {
  const getRouteIcon = () => {
    switch (routeType) {
      case 'smooth':
        return 'wb-sunny';
      case 'fastest':
        return 'flash-on';
      case 'standard':
      default:
        return 'navigation';
    }
  };

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

  const getRouteTitle = () => {
    switch (routeType) {
      case 'smooth':
        return 'Smooth Route';
      case 'fastest':
        return 'Fastest Route';
      case 'standard':
      default:
        return 'Standard Route';
    }
  };

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.7}>
      <Card style={[styles.card, selected && styles.selectedCard]}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: getRouteColor() }]}>
            <Icon name={getRouteIcon()} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{getRouteTitle()}</Text>
            <Text style={styles.subtitle}>
              {route.distance} • {route.duration}
            </Text>
          </View>
          {selected && (
            <Icon name="check-circle" size={24} color={COLORS.success} />
          )}
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Smoothness</Text>
            <Text style={styles.statValue}>{route.smoothnessScore}%</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Obstacles</Text>
            <Text style={styles.statValue}>{route.obstacleCount}</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
});

export default RouteCard;
