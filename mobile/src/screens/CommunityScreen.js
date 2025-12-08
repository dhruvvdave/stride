import React, { useEffect, useState } from 'react';
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
import Card from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { fetchLeaderboard } from '../store/slices/userSlice';
import { COLORS } from '../config/constants';

const CommunityScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { leaderboard, loading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    try {
      await dispatch(fetchLeaderboard(period)).unwrap();
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  const periods = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all', label: 'All Time' },
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return COLORS.primary;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
      </View>

      <View style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.periodButton,
              period === p.id && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p.id)}
          >
            <Text
              style={[
                styles.periodText,
                period === p.id && styles.periodTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.userId === user?.id;
          const rank = index + 1;

          return (
            <Card
              key={entry.userId}
              style={[
                styles.leaderboardCard,
                isCurrentUser && styles.currentUserCard,
              ]}
            >
              <View style={styles.rankContainer}>
                {getRankIcon(rank) ? (
                  <Text style={styles.rankIcon}>{getRankIcon(rank)}</Text>
                ) : (
                  <View
                    style={[
                      styles.rankBadge,
                      { backgroundColor: getRankColor(rank) },
                    ]}
                  >
                    <Text style={styles.rankText}>{rank}</Text>
                  </View>
                )}
              </View>

              <View style={styles.avatar}>
                <Icon name="person" size={32} color={COLORS.primary} />
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {entry.name}
                  {isCurrentUser && ' (You)'}
                </Text>
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Icon name="emoji-events" size={14} color="#FFD700" />
                    <Text style={styles.statText}>{entry.points} pts</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Icon name="report" size={14} color={COLORS.warning} />
                    <Text style={styles.statText}>
                      {entry.obstaclesReported} reports
                    </Text>
                  </View>
                </View>
              </View>

              {entry.isPremium && (
                <View style={styles.premiumBadge}>
                  <Icon name="stars" size={16} color="#FFD700" />
                </View>
              )}
            </Card>
          );
        })}

        {leaderboard.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="leaderboard" size={64} color="#9E9E9E" />
            <Text style={styles.emptyText}>No leaderboard data yet</Text>
            <Text style={styles.emptySubtext}>
              Start reporting obstacles to climb the ranks!
            </Text>
          </View>
        )}
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
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankIcon: {
    fontSize: 28,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  premiumBadge: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default CommunityScreen;
