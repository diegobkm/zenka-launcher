import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const { currentTheme, currentTypography } = useTheme();
  const router = useRouter();
  const font = currentTypography.fontFamily;

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: currentTheme.accent, fontSize: 18, fontFamily: font }}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentTheme.text, fontFamily: font }]}>Sobre o Zenka Launcher</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.appName, { color: currentTheme.accent, fontFamily: font }]}>Zenka Launcher</Text>
        <Text style={[styles.version, { fontFamily: font }]}>Versão 0.1.0 (Beta)</Text>
        <Text style={[styles.description, { fontFamily: font }]}>
          Um launcher minimalista, ultraleve e inteligente desenvolvido com foco no desempenho e na agilidade.
          Inspirado na usabilidade clássica por gestos e adaptado aos padrões modernos do Android.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: font }]}>Diferenciais</Text>
        <Text style={[styles.bullet, { fontFamily: font }]}>• Reconhecimento de gestos (Scribble) na tela.</Text>
        <Text style={[styles.bullet, { fontFamily: font }]}>• Consumo zero de bateria em segundo plano.</Text>
        <Text style={[styles.bullet, { fontFamily: font }]}>• Classificação contextual por horário e uso.</Text>
        <Text style={[styles.bullet, { fontFamily: font }]}>• Suporte ao tema clássico e moderno.</Text>
      </View>

      <View style={styles.card}>
        <Text style={[styles.sectionTitle, { color: currentTheme.text, fontFamily: font }]}>Privacidade</Text>
        <Text style={[styles.description, { fontFamily: font }]}>
          O Zenka Launcher respeita a sua privacidade. Todo o histórico de uso dos aplicativos e dados contextuais são armazenados 100% no seu dispositivo e nunca são enviados para servidores externos.
        </Text>
      </View>
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
  appName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  version: { color: '#888', fontSize: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  description: { color: '#AAA', fontSize: 14, lineHeight: 22 },
  bullet: { color: '#CCC', fontSize: 14, lineHeight: 24 },
});
