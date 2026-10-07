import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { useCurrentLocation } from '../lib/useCurrentLocation';
import { colors, radius, spacing, typography } from '../src/theme';

export function LocationPermissionBanner() {
  const { permissionDenied } = useCurrentLocation();
  const [dismissed, setDismissed] = useState(false);

  if (!permissionDenied || dismissed) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="location-outline" size={20} color={colors.onErrorContainer} />
      <View style={styles.textBlock}>
        <Text style={[typography.bodyMd, styles.title]}>Location access is off</Text>
        <Text style={[typography.bodySm, styles.subtitle]}>
          Turn it on in Settings to see nearby stations, sort by distance, and get proximity
          alerts.
        </Text>
        <Pressable onPress={() => Linking.openSettings()} style={styles.settingsButton}>
          <Text style={[typography.labelButton, styles.settingsButtonText]}>Open Settings</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => setDismissed(true)} hitSlop={8}>
        <Ionicons name="close" size={18} color={colors.onErrorContainer} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.gutter,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.errorContainer,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.onErrorContainer,
  },
  subtitle: {
    color: colors.onErrorContainer,
  },
  settingsButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs + 2,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.onErrorContainer,
  },
  settingsButtonText: {
    color: colors.errorContainer,
  },
});
