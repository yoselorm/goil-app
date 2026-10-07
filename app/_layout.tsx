import '../global.css';
import 'react-native-gesture-handler';

import {
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as usePlusJakartaSansFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LaunchScreen } from '../components/LaunchScreen';
import { PermissionsIntro } from '../components/PermissionsIntro';
import { FilterProvider } from '../lib/FilterContext';
import { hasOnboarded, setOnboarded } from '../lib/onboarding';
import { RouteProvider } from '../lib/RouteContext';
import { useSettings } from '../lib/settingsStore';

SplashScreen.preventAutoHideAsync();

type BootPhase = 'checking' | 'permissions-intro' | 'launching' | 'ready';

export default function RootLayout() {
  const [jakartaLoaded] = usePlusJakartaSansFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [interLoaded] = useInterFonts({ Inter_600SemiBold, Inter_700Bold });
  const [phase, setPhase] = useState<BootPhase>('checking');
  const { updateSettings } = useSettings();

  const fontsLoaded = jakartaLoaded && interLoaded;

  useEffect(() => {
    hasOnboarded().then((onboarded) => setPhase(onboarded ? 'launching' : 'permissions-intro'));
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const handleEnable = useCallback(async () => {
    await setOnboarded();
    setPhase('launching');
  }, []);

  const handleSkip = useCallback(async () => {
    await setOnboarded();
    updateSettings({ backgroundMonitoringEnabled: false });
    setPhase('ready');
  }, [updateSettings]);

  const handleLaunchDone = useCallback(() => setPhase('ready'), []);

  if (!fontsLoaded || phase === 'checking') return null;

  return (
    <SafeAreaProvider>
      <FilterProvider>
        <RouteProvider>
          <StatusBar style="auto" />
          {phase === 'permissions-intro' && (
            <PermissionsIntro onEnable={handleEnable} onSkip={handleSkip} />
          )}
          {phase === 'launching' && <LaunchScreen onDone={handleLaunchDone} />}
          {phase === 'ready' && (
            <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          )}
        </RouteProvider>
      </FilterProvider>
    </SafeAreaProvider>
  );
}
