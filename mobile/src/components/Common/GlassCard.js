import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors } from '../theme/colors';

const GlassCard = ({ 
  children, 
  style,
  blurAmount = 10,
  blurType = 'light',
  dark = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <BlurView
        style={styles.blur}
        blurType={dark ? 'dark' : blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={dark ? colors.background.dark : colors.background.light}
      >
        <View style={[styles.content, dark ? styles.contentDark : styles.contentLight]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  blur: {
    borderRadius: 16,
  },
  content: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  contentLight: {
    backgroundColor: colors.glassBackground,
  },
  contentDark: {
    backgroundColor: colors.glassBackgroundDark,
  },
});

export default GlassCard;
