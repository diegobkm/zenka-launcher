import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

export interface AppUsageStats {
  packageName: string;
  count: number;
  timeSlotCounts: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  wifiCounts: Record<string, number>;
}

export interface ZenkaSettings {
  enableTimeContext: boolean;
  enableWifiContext: boolean;
  enableGpsContext: boolean;
}

const STATS_KEY = '@zenka_app_stats';
const SETTINGS_KEY = '@zenka_settings';

export const defaultSettings: ZenkaSettings = {
  enableTimeContext: true,
  enableWifiContext: false,
  enableGpsContext: false,
};

class IntelligenceService {
  private getTimeSlot(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'night';
  }

  private async getCurrentWifi(): Promise<string> {
    if (Platform.OS !== 'android') return '';
    try {
      if (NativeModules.ZenkaLauncherModule) {
        return await NativeModules.ZenkaLauncherModule.getCurrentWifiSSID();
      }
    } catch {
      return '';
    }
    return '';
  }

  async getSettings(): Promise<ZenkaSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  async saveSettings(settings: ZenkaSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Erro ao salvar configuracoes:', e);
    }
  }

  async recordAppLaunch(packageName: string): Promise<void> {
    try {
      const settings = await this.getSettings();
      const statsRaw = await AsyncStorage.getItem(STATS_KEY);
      const statsMap: Record<string, AppUsageStats> = statsRaw ? JSON.parse(statsRaw) : {};

      const currentSlot = this.getTimeSlot();
      const appStat: AppUsageStats = statsMap[packageName] || {
        packageName,
        count: 0,
        timeSlotCounts: { morning: 0, afternoon: 0, evening: 0, night: 0 },
        wifiCounts: {},
      };

      appStat.count += 1;

      if (settings.enableTimeContext) {
        appStat.timeSlotCounts[currentSlot] += 1;
      }

      if (settings.enableWifiContext) {
        const ssid = await this.getCurrentWifi();
        if (ssid) {
          appStat.wifiCounts[ssid] = (appStat.wifiCounts[ssid] || 0) + 1;
        }
      }

      statsMap[packageName] = appStat;
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(statsMap));
    } catch (e) {
      console.warn('Erro ao registrar uso:', e);
    }
  }

  async rankApps<T extends { packageName: string }>(apps: T[]): Promise<T[]> {
    try {
      const settings = await this.getSettings();
      const statsRaw = await AsyncStorage.getItem(STATS_KEY);
      if (!statsRaw) return apps;

      const statsMap: Record<string, AppUsageStats> = JSON.parse(statsRaw);
      const currentSlot = this.getTimeSlot();

      let currentWifi = '';
      if (settings.enableWifiContext) {
        currentWifi = await this.getCurrentWifi();
      }

      return [...apps].sort((a, b) => {
        const statA = statsMap[a.packageName];
        const statB = statsMap[b.packageName];

        if (!statA && !statB) return 0;
        if (!statA) return 1;
        if (!statB) return -1;

        let scoreA = statA.count;
        let scoreB = statB.count;

        if (settings.enableTimeContext) {
          scoreA += statA.timeSlotCounts[currentSlot] * 3;
          scoreB += statB.timeSlotCounts[currentSlot] * 3;
        }

        if (settings.enableWifiContext && currentWifi) {
          scoreA += (statA.wifiCounts?.[currentWifi] || 0) * 2;
          scoreB += (statB.wifiCounts?.[currentWifi] || 0) * 2;
        }

        return scoreB - scoreA;
      });
    } catch {
      return apps;
    }
  }
}

export const intelligenceService = new IntelligenceService();
