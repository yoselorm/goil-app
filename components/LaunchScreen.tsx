import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setupGeofencing, type SetupStep } from '../lib/geofencing';
import { useSettings } from '../lib/settingsStore';
import { ZONES } from '../lib/stations';
import { useStations } from '../lib/useStations';
import packageJson from '../package.json';
import { colors, radius, spacing, typography } from '../src/theme';
import { RadarRings } from './RadarRings';

const STEP_COPY: Record<SetupStep, string> = {
  notifications: 'Requesting notification access...',
  'foreground-location': 'Acquiring GPS signal...',
  'background-location': 'Enabling background tracking...',
  'loading-zones': 'Loading station zones...',
  'registering-geofences': 'Initializing geofences...',
  ready: 'Stations ready',
  'permission-denied': 'Location access needed for live alerts',
};

const STEP_PROGRESS: Record<SetupStep, number> = {
  notifications: 0.15,
  'foreground-location': 0.35,
  'background-location': 0.55,
  'loading-zones': 0.7,
  'registering-geofences': 0.85,
  ready: 1,
  'permission-denied': 1,
};

interface LaunchScreenProps {
  onDone: () => void;
}

export function LaunchScreen({ onDone }: LaunchScreenProps) {
  const { stations } = useStations();
  const { settings } = useSettings();
  const [step, setStep] = useState<SetupStep>('notifications');
  const [registeredCount, setRegisteredCount] = useState<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    setupGeofencing((nextStep) => setStep(nextStep))
      .then((result) => setRegisteredCount(result.registeredCount))
      .finally(() => {
        setTimeout(onDone, 500);
      });
  }, [onDone]);

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${STEP_PROGRESS[step] * 100}%`, { duration: 400 }),
  }));

  const geofenceLabel =
    step === 'ready' && registeredCount !== null
      ? `${registeredCount} Geofences Active`
      : step === 'registering-geofences'
        ? 'Initializing Geofences...'
        : STEP_COPY[step];

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primaryFixed + '33', 'transparent']}
        style={[styles.glow, { top: -120, left: -70 }]}
      />
      <LinearGradient
        colors={[colors.secondaryFixed + '33', 'transparent']}
        style={[styles.glow, { top: -80, right: -70 }]}
      />

      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <View style={styles.pill}>
            <View style={styles.liveDot} />
            <Text style={[typography.labelStatus, styles.radarActiveText]}>RADAR ACTIVE</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <RadarRings size={280} />
          <View style={styles.logoTile}>
            <Image
              source={require('../assets/goil-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.textCluster}>
          <View style={styles.brandPill}>
            <Text style={[typography.labelStatus, styles.brandPillText]}>
              GHANA OIL COMPANY PLC
            </Text>
          </View>
          <Text style={[typography.headlineLg, styles.headline]}>GOIL Station Finder</Text>
          <Text style={[typography.bodyMd, styles.tagline]}>
            Good Energy for Life · Smart Proximity Radar
          </Text>

          <View style={styles.coveragePill}>
            <View style={styles.coverageDots}>
              <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
              <View style={[styles.dot, { backgroundColor: colors.primaryContainer }]} />
            </View>
            <Text style={[typography.labelButton, styles.coverageText]}>
              {stations.length} Stations Across {ZONES.length} Zones
            </Text>
          </View>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressStatus}>
              <Ionicons name="sync" size={14} color={colors.primaryContainer} />
              <Text style={[typography.bodySm, styles.progressText]}>{geofenceLabel}</Text>
            </View>
            <Text style={[typography.labelStatus, styles.progressPercent]}>
              {Math.round(STEP_PROGRESS[step] * 100)}%
            </Text>
          </View>

          <View style={styles.bentoRow}>
            <View style={styles.bentoTile}>
              <Ionicons name="shield-checkmark" size={18} color={colors.secondary} />
              <Text style={[typography.labelStatus, styles.bentoTitle]}>100% On-Device</Text>
              <Text style={[typography.bodySm, styles.bentoSubtitle]}>Zero Cloud Tracking</Text>
            </View>
            <View style={styles.bentoTile}>
              <Ionicons name="battery-charging" size={18} color={colors.primaryContainer} />
              <Text style={[typography.labelStatus, styles.bentoTitle]}>
                Smart {settings.geofenceRadiusMeters}m Wake
              </Text>
              <Text style={[typography.bodySm, styles.bentoSubtitle]}>Low Battery Drain</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="water" size={14} color={colors.secondary} />
            <Text style={[typography.labelStatus, styles.footerText]}>
              GOIL PLC · GHANA'S OIL MARKETING LEADER
            </Text>
          </View>
          <Text style={[typography.bodySm, styles.footerSubtext]}>
            Certified Quality Fuel · v{packageJson.version} (Expo 57)
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  radarActiveText: {
    color: colors.secondary,
    textTransform: 'uppercase',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  logoTile: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textCluster: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandPill: {
    backgroundColor: colors.secondaryFixed,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  brandPillText: {
    color: colors.onSecondaryFixed,
  },
  headline: {
    color: colors.onSurface,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  tagline: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: 280,
  },
  coveragePill: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  coverageDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  coverageText: {
    color: colors.onSurface,
  },
  progressBlock: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primaryContainer,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  progressText: {
    color: colors.onSurface,
    flexShrink: 1,
  },
  progressPercent: {
    color: colors.primary,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bentoTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  bentoTitle: {
    color: colors.onSurface,
    textAlign: 'center',
  },
  bentoSubtitle: {
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 2,
    paddingBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    opacity: 0.9,
  },
  footerText: {
    color: colors.onSurface,
  },
  footerSubtext: {
    color: colors.onSurfaceVariant,
  },
});
