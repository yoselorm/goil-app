import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../src/theme';

function PulseRing({ size, color, delay }: { size: number; color: string; delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }), -1)
    );
  }, [progress, delay]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 0.7 + progress.value * 0.5 }],
    opacity: (1 - progress.value) * 0.5,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        { width: size, height: size, borderRadius: size / 2, borderColor: color },
        style,
      ]}
    />
  );
}

export function RadarRings({ size = 288 }: { size?: number }) {
  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      <PulseRing size={size} color={colors.primary} delay={0} />
      <PulseRing size={size * 0.78} color={colors.secondary} delay={800} />

      <View
        style={[
          styles.glow,
          {
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: (size * 0.6) / 2,
            backgroundColor: colors.primaryFixed,
          },
        ]}
      />

      <Svg
        width={size * 0.9}
        height={size * 0.9}
        viewBox="0 0 260 260"
        style={StyleSheet.absoluteFill}>
        <Circle
          cx={130}
          cy={130}
          r={116}
          fill="none"
          stroke={colors.outlineVariant}
          strokeOpacity={0.4}
          strokeWidth={1.5}
          strokeDasharray="6 8"
        />
        <Circle
          cx={130}
          cy={130}
          r={92}
          fill="none"
          stroke={colors.secondary}
          strokeOpacity={0.25}
          strokeWidth={2}
          strokeDasharray="4 6"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  glow: {
    position: 'absolute',
    opacity: 0.2,
  },
});
