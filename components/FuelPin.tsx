import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

import { colors } from '../src/theme';

interface FuelPinProps {
  color: string;
  muted?: boolean;
  selected?: boolean;
}

export function FuelPin({ color, muted, selected }: FuelPinProps) {
  const pinColor = selected ? colors.secondary : muted ? colors.surfaceDim : color;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badge,
          selected && styles.badgeSelected,
          { backgroundColor: pinColor },
        ]}>
        <MaterialIcons
          name="local-gas-station"
          size={selected ? 18 : 16}
          color={muted && !selected ? colors.onSurfaceVariant : colors.onPrimary}
        />
      </View>
      <View style={[styles.point, selected && styles.pointSelected, { borderTopColor: pinColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeSelected: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
  },
  point: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pointSelected: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
  },
});
