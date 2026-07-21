import { NativeModules, Platform, Linking } from 'react-native';

export interface AppInfo {
  id: string;
  name: string;
  packageName: string;
  icon?: string;
}

// Interface para o LauncherService com fallback seguro
class LauncherService {
  async getInstalledApps(): Promise<AppInfo[]> {
    if (Platform.OS !== 'android') {
      return this.getMockApps();
    }

    try {
      // Caso exista o módulo nativo configurado via Expo Native Module
      if (NativeModules.ZenkaLauncherModule) {
        const apps = await NativeModules.ZenkaLauncherModule.getInstalledApps();
        return apps;
      }
    } catch (e) {
      console.warn('Módulo nativo de launcher não encontrado, usando lista base:', e);
    }

    return this.getMockApps();
  }

  async launchApp(packageName: string): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        if (NativeModules.ZenkaLauncherModule) {
          await NativeModules.ZenkaLauncherModule.launchApp(packageName);
          return true;
        }
      } catch (e) {
        console.warn('Erro ao abrir app via módulo nativo:', e);
      }
    }

    // Fallback via intent ou Deep Link
    const supported = await Linking.canOpenURL(`${packageName}://`);
    if (supported) {
      await Linking.openURL(`${packageName}://`);
      return true;
    }

    return false;
  }

  private getMockApps(): AppInfo[] {
    return [
      { id: '1', name: 'WhatsApp', packageName: 'com.whatsapp' },
      { id: '2', name: 'Instagram', packageName: 'com.instagram.android' },
      { id: '3', name: 'Configurações', packageName: 'com.android.settings' },
      { id: '4', name: 'Agenda', packageName: 'com.google.android.calendar' },
      { id: '5', name: 'Calculadora', packageName: 'com.google.android.calculator' },
      { id: '6', name: 'Câmera', packageName: 'com.android.camera' },
      { id: '7', name: 'YouTube', packageName: 'com.google.android.youtube' },
      { id: '8', name: 'Chrome', packageName: 'com.android.chrome' },
    ];
  }
}

export const launcherService = new LauncherService();
