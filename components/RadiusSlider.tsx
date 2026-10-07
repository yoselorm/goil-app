import Slider from '@react-native-community/slider';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../src/theme';

interface RadiusSliderProps {
  label?: string;
  sublabel?: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  unit: string;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  formatValue?: (value: number) => string;
}

export function RadiusSlider({
  label,
  sublabel,
  value,
  minimumValue,
  maximumValue,
  step,
  unit,
  onValueChange,
  onSlidingComplete,
  formatValue,
}: RadiusSliderProps) {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <View style={styles.labelBlock}>
            <Text style={[typography.headlineSm, styles.label]}>{label}</Text>
            {sublabel ? <Text style={[typography.bodySm, styles.sublabel]}>{sublabel}</Text> : null}
          </View>
          <View style={styles.valueBlock}>
            <Text style={[typography.displayDistance, styles.value]}>
              {formatValue ? formatValue(value) : value}
            </Text>
            <Text style={[typography.labelDistanceUnit, styles.unit]}>{unit}</Text>
          </View>
        </View>
      )}
      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onSlidingComplete}
        minimumTrackTintColor={colors.primaryContainer}
        maximumTrackTintColor={colors.surfaceContainerHigh}
        thumbTintColor={colors.primaryContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  labelBlock: {
    flex: 1,
  },
  label: {
    color: colors.onSurface,
  },
  sublabel: {
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  valueBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  value: {
    fontSize: 26,
    lineHeight: 30,
    color: colors.primaryContainer,
  },
  unit: {
    color: colors.onSurface,
    textTransform: 'uppercase',
  },
});
