import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Button from '../components/Common/Button';
import RouteCard from '../components/Navigation/RouteCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { selectRoute, startNavigation } from '../store/slices/routeSlice';
import { COLORS } from '../config/constants';

const RouteResultScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { routes, selectedRoute, origin, destination, loading } = useSelector(
    (state) => state.route
  );
  const [selected, setSelected] = useState('smooth');

  useEffect(() => {
    if (routes.smooth) {
      setSelected('smooth');
      dispatch(selectRoute(routes.smooth));
    }
  }, [routes]);

  const handleSelectRoute = (routeType) => {
    setSelected(routeType);
    dispatch(selectRoute(routes[routeType]));
  };

  const handleStartNavigation = () => {
    if (!selectedRoute) {
      Toast.show({
        type: 'error',
        text1: 'No Route Selected',
        text2: 'Please select a route to start navigation',
      });
      return;
    }

    dispatch(startNavigation());
    navigation.navigate('Navigation');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Route</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.routeInfo}>
          <View style={styles.locationRow}>
            <Icon name="trip-origin" size={20} color={COLORS.success} />
            <Text style={styles.locationText} numberOfLines={1}>
              {origin?.address || 'Starting point'}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="place" size={20} color={COLORS.danger} />
            <Text style={styles.locationText} numberOfLines={1}>
              {destination?.address || 'Destination'}
            </Text>
          </View>
        </View>

        <View style={styles.routesContainer}>
          <Text style={styles.sectionTitle}>Compare Routes</Text>

          {routes.smooth && (
            <RouteCard
              route={routes.smooth}
              routeType="smooth"
              selected={selected === 'smooth'}
              onSelect={() => handleSelectRoute('smooth')}
            />
          )}

          {routes.standard && (
            <RouteCard
              route={routes.standard}
              routeType="standard"
              selected={selected === 'standard'}
              onSelect={() => handleSelectRoute('standard')}
            />
          )}

          {routes.fastest && (
            <RouteCard
              route={routes.fastest}
              routeType="fastest"
              selected={selected === 'fastest'}
              onSelect={() => handleSelectRoute('fastest')}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Start Navigation"
          onPress={handleStartNavigation}
          style={styles.startButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    padding: 16,
  },
  routeInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    marginLeft: 12,
  },
  routesContainer: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  startButton: {
    marginBottom: 0,
  },
});

export default RouteResultScreen;
