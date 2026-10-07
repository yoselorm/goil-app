import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DEFAULT_GEOFENCE_RADIUS_METERS } from '../lib/geofencing';
import { colors, radius, spacing, typography } from '../src/theme';
import { Button } from './Button';
import { RadarRings } from './RadarRings';

interface PermissionsIntroProps {
  onEnable: () => void;
  onSkip: () => void;
}

export function PermissionsIntro({ onEnable, onSkip }: PermissionsIntroProps) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <RadarRings size={220} />
          <View style={styles.logoTile}>
            <Image
              source={require('../assets/goil-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.textBlock}>
          <Text style={[typography.headlineLg, styles.headline]}>
            Never Miss a GOIL Station On Your Route
          </Text>
          <Text style={[typography.bodyMd, styles.subtitle]}>
            Get alerted within {DEFAULT_GEOFENCE_RADIUS_METERS}m of a GOIL station with your
            preferred amenities — even when your phone is in your pocket.
          </Text>
        </View>

        <View style={styles.cards}>
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: colors.secondaryContainer }]}>
              <Ionicons name="locate" size={24} color={colors.secondary} />
            </View>
            <View style={styles.cardTextBlock}>
              <View style={styles.cardTitleRow}>
                <Text style={[typography.headlineSm, styles.cardTitle]}>Background Location</Text>
                <View style={styles.recommendedBadge}>
                  <Text style={[typography.labelStatus, styles.recommendedText]}>Recommended</Text>
                </View>
              </View>
              <Text style={[typography.bodySm, styles.cardBody]}>
                Choose "Always Allow" so geofencing keeps working even when the app is in the
                background.
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: colors.primaryFixed }]}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardTextBlock}>
              <Text style={[typography.headlineSm, styles.cardTitle]}>Local Push Alerts</Text>
              <Text style={[typography.bodySm, styles.cardBody]}>
                A notification fires the moment you enter a station's radius — generated entirely
                on your device.
              </Text>
            </View>
          </View>

          <View style={styles.noteBanner}>
            <Ionicons name="information-circle-outline" size={20} color={colors.outline} />
            <Text style={[typography.bodySm, styles.noteText]}>
              You can also choose "While Using App" — background proximity alerts will just stay
              off until you enable them later in Settings.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Enable Geofence & Notifications" icon="locate" onPress={onEnable} />
        <Button label="Maybe Later" variant="ghost" onPress={onSkip} />
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.secondary} />
          <Text style={[typography.bodySm, styles.trustText]}>
            100% On-Device · Zero Location Tracking
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  logoTile: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  headline: {
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 320,
  },
  cards: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBlock: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  cardTitle: {
    color: colors.onSurface,
  },
  recommendedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
  },
  recommendedText: {
    color: colors.onSecondaryContainer,
    fontSize: 10,
    lineHeight: 12,
  },
  cardBody: {
    color: colors.onSurfaceVariant,
    marginTop: 4,
  },
  noteBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  noteText: {
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  footer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  trustText: {
    color: colors.onSurfaceVariant,
  },
});
