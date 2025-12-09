import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';

/**
 * GlassCard - A glass-morphism card component with backdrop blur effect
 * iOS: Uses translucent background
 * Android: Uses Material You theming
 */
const GlassCard = ({ 
  children, 
  style, 
  padding = SPACING.md,
  blur = true,
  elevation = 8,
}) => {
  return (
    <View 
      style={[
        styles.container,
        {
          padding,
          ...Platform.select({
            ios: {
              backgroundColor: blur ? 'rgba(255, 255, 255, 0.8)' : COLORS.background.light,
              backdropFilter: blur ? 'blur(20px)' : 'none',
            },
            android: {
              backgroundColor: COLORS.background.light,
              elevation,
            },
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
});

export default GlassCard;
