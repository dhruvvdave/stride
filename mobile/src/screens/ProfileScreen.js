import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import StatCard from '../components/Profile/StatCard';
import AchievementBadge from '../components/Profile/AchievementBadge';
import VehicleCard from '../components/Profile/VehicleCard';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import {
  fetchUserStats,
  fetchAchievements,
  fetchVehicles,
  removeVehicle,
} from '../store/slices/userSlice';
import { deleteVehicle } from '../services/userService';
import { COLORS } from '../config/constants';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, achievements, vehicles, loading } = useSelector(
    (state) => state.user
  );

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      await Promise.all([
        dispatch(fetchUserStats()).unwrap(),
        dispatch(fetchAchievements()).unwrap(),
        dispatch(fetchVehicles()).unwrap(),
      ]);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const isPremium = user?.subscription_status === 'active';

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Icon name="person" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="stars" size={14} color="#FFD700" />
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={24} color="#212121" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="directions"
            label="Distance"
            value={`${(stats.totalDistance / 1000).toFixed(1)} km`}
            color={COLORS.primary}
          />
          <StatCard
            icon="report"
            label="Reports"
            value={stats.obstaclesReported || 0}
            color={COLORS.warning}
          />
          <StatCard
            icon="emoji-events"
            label="Points"
            value={stats.points || 0}
            color={COLORS.success}
          />
          <StatCard
            icon="leaderboard"
            label="Rank"
            value={`#${stats.rank || '-'}`}
            color={COLORS.secondary}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionSubtitle}>
              {achievements.filter((a) => a.unlocked).length}/{achievements.length}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {achievements.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicles</Text>
            {isPremium && (
              <TouchableOpacity
                onPress={() => navigation.navigate('VehicleForm')}
              >
                <Icon name="add-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
          {!isPremium ? (
            <View style={styles.premiumPrompt}>
              <Icon name="lock" size={32} color="#9E9E9E" />
              <Text style={styles.premiumPromptText}>
                Upgrade to Premium to manage vehicle profiles
              </Text>
              <Button
                title="Upgrade Now"
                onPress={() => navigation.navigate('Premium')}
                size="small"
                style={styles.upgradeButton}
              />
            </View>
          ) : vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onEdit={() =>
                  navigation.navigate('VehicleForm', { vehicle })
                }
                onDelete={async () => {
                  try {
                    await deleteVehicle(vehicle.id);
                    dispatch(removeVehicle(vehicle.id));
                    Toast.show({
                      type: 'success',
                      text1: 'Vehicle Deleted',
                      text2: 'Vehicle has been removed',
                    });
                  } catch (error) {
                    Toast.show({
                      type: 'error',
                      text1: 'Delete Failed',
                      text2: error.message || 'Failed to delete vehicle',
                    });
                  }
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="directions-car-filled" size={48} color="#9E9E9E" />
              <Text style={styles.emptyText}>No vehicles added yet</Text>
              <Button
                title="Add Vehicle"
                onPress={() => navigation.navigate('VehicleForm')}
                size="small"
                variant="secondary"
              />
            </View>
          )}
        </View>
      </ScrollView>
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
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  achievementsScroll: {
    paddingVertical: 8,
  },
  premiumPrompt: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  premiumPromptText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 12,
  },
  upgradeButton: {
    marginTop: 8,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    marginVertical: 12,
  },
});

export default ProfileScreen;
