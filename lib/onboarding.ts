import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'goil.onboarded';

export async function hasOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}
