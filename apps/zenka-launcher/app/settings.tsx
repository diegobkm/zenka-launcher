import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { intelligenceService, ZenkaSettings, defaultSettings } from '../src/services/IntelligenceService';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { currentTheme, currentTypography } = useTheme();
  const font = currentTypography.fontFamily;
  const router = useRouter();
  const [settings, setSettings] = useState<ZenkaSettings>(defaultSettings);

  useEffect(() => {
    intelligenceService.getSettings().then(setSettings);
  }, []);

  const toggleSetting = (key: keyof ZenkaSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    intelligenceService.saveSettings(updated);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: currentTheme.accent, fontSize: 18, fontFamily: font }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.text, fontFamily: font }]}>Inteligência & Bateria</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.settingTitle, { color: currentTheme.text, fontFamily: font }]}>
            Sugestões por Horário do Dia
          </Text>
          <Switch
            value={settings.enableTimeContext}
            onValueChange={() => toggleSetting('enableTimeContext')}
          />
        </View>
        <Text style={[styles.description, { fontFamily: font }]}>
          Reordena os apps com base no momento em que você costuma usá-los (Ex: Waze de manhã, Netflix à noite).
        </Text>
        <Text style={[styles.badge, styles.badgeLow, { fontFamily: font }]}>Consumo de Bateria: Quase Zero</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.settingTitle, { color: currentTheme.text, fontFamily: font }]}>
            Sugestões por Rede Wi-Fi
          </Text>
          <Switch
            value={settings.enableWifiContext}
            onValueChange={() => toggleSetting('enableWifiContext')}
          />
        </View>
        <Text style={[styles.description, { fontFamily: font }]}>
          Adapta seus aplicativos ao conectar no Wi-Fi de Casa ou do Trabalho.
        </Text>
        <Text style={[styles.badge, styles.badgeMedium, { fontFamily: font }]}>Consumo de Bateria: Baixo</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={[styles.settingTitle, { color: currentTheme.text, fontFamily: font }]}>
            Sugestões por Localização GPS
          </Text>
          <Switch
            value={settings.enableGpsContext}
            onValueChange={() => toggleSetting('enableGpsContext')}
          />
        </View>
        <Text style={[styles.description, { fontFamily: font }]}>
          Usa a localização exata do GPS para sugerir apps baseados em onde você está.
        </Text>
        <Text style={[styles.badge, styles.badgeHigh, { fontFamily: font }]}>Consumo de Bateria: Alto (Pode drenar)</Text>
      </View>

      <TouchableOpacity 
        style={styles.aboutButton}
        onPress={() => router.push('/about')}
      >
        <Text style={{ color: currentTheme.accent, fontSize: 16, fontWeight: 'bold', fontFamily: font }}>
          Sobre o Zenka Launcher ℹ️
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  header: { marginBottom: 30, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 20 },
  title: { fontSize: 22, fontWeight: 'bold' },
  card: {
    backgroundColor: '#252529',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingTitle: { fontSize: 16, fontWeight: '600', flex: 1, paddingRight: 10 },
  description: { color: '#AAA', fontSize: 14, marginBottom: 12, lineHeight: 20 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  badgeLow: { backgroundColor: '#2E7D32', color: '#FFF' },
  badgeMedium: { backgroundColor: '#F57C00', color: '#FFF' },
  badgeHigh: { backgroundColor: '#D32F2F', color: '#FFF' },
  aboutButton: {
    padding: 16,
    backgroundColor: '#252529',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
});
