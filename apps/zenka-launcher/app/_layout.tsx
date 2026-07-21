import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/hooks/useTheme';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <StatusBar style="light" />
          <Slot />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
