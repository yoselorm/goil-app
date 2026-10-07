import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Station } from '../lib/types';
import { colors, radius, spacing, typography } from '../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

interface AmenityField {
  label: string;
  value: boolean;
  icon: IconName;
}

function buildFields(station: Station): AmenityField[] {
  return [
    { label: 'Vehicle Service', value: station.services.vehicleService, icon: 'construct-outline' },
    { label: 'Tyre Service', value: station.services.tyreService, icon: 'disc-outline' },
    { label: 'Washing Bay', value: station.services.washingBay, icon: 'water-outline' },
    { label: 'Go Café', value: station.amenities.goCafe, icon: 'cafe-outline' },
    { label: 'Go Card', value: station.amenities.goCard, icon: 'card-outline' },
    { label: 'Coupons', value: station.amenities.coupons, icon: 'pricetag-outline' },
    { label: 'Bank Cards', value: station.amenities.bankCards, icon: 'wallet-outline' },
    { label: 'Mobile Pay', value: station.amenities.mobilePay, icon: 'phone-portrait-outline' },
    { label: 'ATM', value: station.amenities.atm, icon: 'cash-outline' },
    { label: 'Pharmacy', value: station.amenities.pharmacy, icon: 'medkit-outline' },
    { label: 'Restaurant', value: station.amenities.restaurant, icon: 'restaurant-outline' },
    { label: 'LPG Exchange', value: station.amenities.lpgExchange, icon: 'flame-outline' },
  ];
}

export function AmenityGrid({ station }: { station: Station }) {
  const fields = buildFields(station);

  return (
    <View style={styles.grid}>
      {fields.map((field) => (
        <View key={field.label} style={styles.cell}>
          <View style={[styles.card, field.value ? styles.cardActive : styles.cardInactive]}>
            <View style={[styles.iconBox, field.value && styles.iconBoxActive]}>
              <Ionicons name={field.icon} size={18} color={field.value ? colors.onSecondary : colors.outline} />
            </View>
            <Text
              style={[
                typography.bodySm,
                styles.label,
                field.value ? styles.labelActive : styles.labelInactive,
              ]}
              numberOfLines={1}>
              {field.label}
            </Text>
            <Ionicons
              name={field.value ? 'checkmark-circle' : 'close-circle-outline'}
              size={16}
              color={field.value ? colors.secondary : colors.surfaceDim}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  cell: {
    width: '50%',
    padding: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm + 2,
    borderRadius: radius.md,
  },
  cardActive: {
    backgroundColor: colors.secondaryContainer,
  },
  cardInactive: {
    backgroundColor: colors.surfaceContainerLow,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm + 4,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: colors.secondary,
  },
  label: {
    flex: 1,
  },
  labelActive: {
    color: colors.onSecondaryContainer,
  },
  labelInactive: {
    color: colors.outline,
  },
});
