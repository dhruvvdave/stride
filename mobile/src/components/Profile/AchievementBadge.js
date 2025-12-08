import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../../config/constants';

const AchievementBadge = ({ achievement }) => {
  const isUnlocked = achievement.unlocked;

  return (
    <View style={[styles.container, !isUnlocked && styles.locked]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: isUnlocked ? COLORS.success : '#E0E0E0' },
        ]}
      >
        <Icon
          name={achievement.icon || 'emoji-events'}
          size={32}
          color="#FFFFFF"
        />
      </View>
      <Text
        style={[styles.title, !isUnlocked && styles.lockedText]}
        numberOfLines={1}
      >
        {achievement.name}
      </Text>
      <Text
        style={[styles.description, !isUnlocked && styles.lockedText]}
        numberOfLines={2}
      >
        {achievement.description}
      </Text>
      {isUnlocked && achievement.unlockedAt && (
        <Text style={styles.date}>
          {new Date(achievement.unlockedAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  locked: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 4,
  },
  lockedText: {
    color: '#9E9E9E',
  },
  date: {
    fontSize: 10,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

export default AchievementBadge;
