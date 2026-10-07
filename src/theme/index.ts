// Design tokens transcribed from uiux/DESIGN.md — "Ghana Oil Mobility UI".
// Token names match the source front-matter (camelCased for valid JS identifiers).

export const colors = {
  surface: '#f9f9ff',
  surfaceDim: '#cfdaf2',
  surfaceBright: '#f9f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f0f3ff',
  surfaceContainer: '#e7eeff',
  surfaceContainerHigh: '#dee8ff',
  surfaceContainerHighest: '#d8e3fb',
  onSurface: '#111c2d',
  onSurfaceVariant: '#5a4136',
  inverseSurface: '#263143',
  inverseOnSurface: '#ecf1ff',
  outline: '#8e7164',
  outlineVariant: '#e2bfb0',
  surfaceTint: '#a14000',
  primary: '#a14000',
  onPrimary: '#ffffff',
  primaryContainer: '#ff6a00',
  onPrimaryContainer: '#571f00',
  inversePrimary: '#ffb694',
  secondary: '#0b6d3b',
  onSecondary: '#ffffff',
  secondaryContainer: '#9ef6b6',
  onSecondaryContainer: '#177341',
  tertiary: '#006d38',
  onTertiary: '#ffffff',
  tertiaryContainer: '#17af5f',
  onTertiaryContainer: '#00391a',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  primaryFixed: '#ffdbcc',
  primaryFixedDim: '#ffb694',
  onPrimaryFixed: '#351000',
  onPrimaryFixedVariant: '#7b2f00',
  secondaryFixed: '#9ef6b6',
  secondaryFixedDim: '#83d99c',
  onSecondaryFixed: '#00210e',
  onSecondaryFixedVariant: '#00522a',
  tertiaryFixed: '#77fca3',
  tertiaryFixedDim: '#59df89',
  onTertiaryFixed: '#00210d',
  onTertiaryFixedVariant: '#005228',
  background: '#f9f9ff',
  onBackground: '#111c2d',
  surfaceVariant: '#d8e3fb',
} as const;

interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: '400' | '500' | '600' | '700' | '800';
  lineHeight: number;
  letterSpacing?: number;
}

// letterSpacing converted from em (source) to px: em * fontSize.
export const typography: Record<string, TypeStyle> = {
  displayDistance: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
    letterSpacing: -1.2,
  },
  headlineLg: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.56,
  },
  headlineMd: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.22,
  },
  headlineSm: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  bodyLg: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodyMd: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  labelDistanceUnit: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.56,
  },
  labelStatus: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.24,
  },
  labelButton: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.15,
  },
};

// rem -> px at a 16px base.
export const radius = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const spacing = {
  gutter: 16,
  margin: 16,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
};

export const theme = { colors, typography, radius, spacing };
