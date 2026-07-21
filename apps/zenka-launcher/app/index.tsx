import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { ScribbleCanvas } from '../src/components/ScribbleCanvas';
import { launcherService, AppInfo } from '../src/services/LauncherService';
import { intelligenceService } from '../src/services/IntelligenceService';
import { useRouter } from 'expo-router';

export default function Index() {
  const { currentTheme, currentTypography, setMode, mode } = useTheme();
  const router = useRouter();
  const [searchFilter, setSearchFilter] = useState('');
  const [apps, setApps] = useState<AppInfo[]>([]);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    const installed = await launcherService.getInstalledApps();
    const ranked = await intelligenceService.rankApps(installed);
    setApps(ranked);
  };

  const filteredApps = searchFilter
    ? apps.filter((app) => app.name.toUpperCase().startsWith(searchFilter))
    : apps;

  const handleLetterDrawn = (letter: string) => {
    setSearchFilter(letter);
  };

  const clearSearch = () => {
    setSearchFilter('');
  };

  const handleAppPress = async (packageName: string, name: string) => {
    await intelligenceService.recordAppLaunch(packageName);
    const success = await launcherService.launchApp(packageName);
    if (!success) {
      Alert.alert('Zenka Launcher', `Não foi possível abrir o app ${name} diretamente.`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      {/* Tela de desenho de letras (Scribble) cobrindo a UI */}
      <ScribbleCanvas onLetterDrawn={handleLetterDrawn} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.accent, fontFamily: currentTypography.fontFamily }]}>Zenka Launcher</Text>
        
        {searchFilter !== '' && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearBadge}>
            <Text style={[{ color: '#FFF', fontFamily: currentTypography.fontFamily }]}>Filtro: {searchFilter} (Limpar)</Text>
          </TouchableOpacity>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            onPress={() => setMode(mode === 'classicZ' ? 'modern' : 'classicZ')}
            style={styles.themeButton}
          >
            <Text style={{ color: currentTheme.text, fontFamily: currentTypography.fontFamily }}>Tema: {mode}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={styles.settingsButton}
          >
            <Text style={{ color: currentTheme.accent, fontFamily: currentTypography.fontFamily }}>Configurações ⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredApps}
        keyExtractor={(item) => item.id || item.packageName}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.appItem}
            onPress={() => handleAppPress(item.packageName, item.name)}
          >
            <Text style={[styles.appText, { color: currentTheme.text, fontFamily: currentTypography.fontFamily }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  header: { zIndex: 20, alignItems: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 10 },
  clearBadge: { padding: 8, backgroundColor: '#FF5252', borderRadius: 12, marginBottom: 10 },
  actionsRow: { flexDirection: 'row', gap: 15, marginBottom: 10 },
  themeButton: { padding: 8, alignItems: 'center' },
  settingsButton: { padding: 8, alignItems: 'center' },
  appItem: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#333', zIndex: 20 },
  appText: { fontSize: 18 },
});
