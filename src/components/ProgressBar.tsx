import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import React, {useEffect } from 'react';
import { colors } from '../constants/theme';

interface Props {
  completion: number;
}

export function ProgressBar({ completion }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(completion / 100, {
      damping: 20,
      stiffness: 90,
    });
  }, [completion]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text style={styles.label}>{completion}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    width: 32,
    textAlign: 'right',
  },
});