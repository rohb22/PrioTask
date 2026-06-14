import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, typography, radius } from '../constants/theme';
import { useHaptics } from '../hooks/useHaptics';

export type SortField = 'recommended' | 'difficulty' | 'priority' | 'deadline';
export type SortDirection = 'asc' | 'desc';

interface Props {
  visible: boolean;
  field: SortField;
  direction: SortDirection;
  onChangeField: (f: SortField) => void;
  onChangeDirection: (d: SortDirection) => void;
  onClose: () => void;
}

const FIELDS: { key: SortField; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'difficulty',  label: 'Difficulty'  },
  { key: 'priority',    label: 'Priority'    },
  { key: 'deadline',    label: 'Deadline'    },
];

export function SortSheet({ visible, field, direction, onChangeField, onChangeDirection, onClose }: Props) {
  const haptics = useHaptics();
  const translateY = useSharedValue(300);

  React.useEffect(() => {
    translateY.value = withSpring(visible ? 0 : 300, { damping: 20, stiffness: 120 });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.handle} />

        <Text style={styles.sectionLabel}>SORT BY</Text>

        {FIELDS.map(f => {
          const active = field === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.row, active && styles.rowActive]}
              onPress={() => {
                haptics.light();
                onChangeField(f.key);
              }}
            >
              <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>
                {f.label}
              </Text>
              {active && f.key !== 'recommended' && (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    onChangeDirection(direction === 'asc' ? 'desc' : 'asc');
                  }}
                  style={styles.dirBtn}
                >
                  <Text style={styles.dirText}>
                    {direction === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </Text>
                </Pressable>
              )}
            </Pressable>
          );
        })}

        <Pressable style={styles.doneBtn} onPress={onClose}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    ...typography.sectionLabel,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowActive: {
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  rowLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dirBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  dirText: {
    fontSize: 12,
    color: colors.accent,
  },
  doneBtn: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doneText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});