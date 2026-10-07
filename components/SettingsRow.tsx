import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../src/theme';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}

export function SettingsRow({ icon, iconColor = colors.secondary, title, subtitle, right, onPress }: SettingsRowProps) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={styles.row}>
      <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
      <View style={styles.textBlock}>
        <Text style={[typography.bodyLg, styles.title]}>{title}</Text>
        {subtitle ? <Text style={[typography.bodySm, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={colors.outline} /> : null)}
    </Wrapper>
  );
}

export function SettingsToggleRow({
  icon,
  iconColor,
  title,
  subtitle,
  value,
  onValueChange,
}: Omit<SettingsRowProps, 'right' | 'onPress'> & { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <SettingsRow
      icon={icon}
      iconColor={iconColor}
      title={title}
      subtitle={subtitle}
      right={
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.surfaceDim, true: colors.primaryContainer }}
          thumbColor={colors.surfaceContainerLowest}
        />
      }
    />
  );
}

export function SettingsSectionLabel({ icon, title }: { icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[typography.labelStatus, styles.sectionLabelText]}>{title}</Text>
    </View>
  );
}

export function SettingsCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SettingsDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
  },
  icon: {
    marginRight: spacing.sm + 2,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.onSurface,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  sectionLabelText: {
    color: colors.outline,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceContainer,
    marginHorizontal: spacing.md,
  },
});
