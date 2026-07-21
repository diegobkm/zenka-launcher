import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { typography } from '../theme/typography';

type ThemeMode = 'modern' | 'classicZ';

const THEME_KEY = '@zenka_theme_mode';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  currentTheme: typeof theme.colors.classicZ;
  currentTypography: typeof typography.classicZ;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'classicZ',
  setMode: () => {},
  currentTheme: theme.colors.classicZ,
  currentTypography: typography.classicZ,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<ThemeMode>('classicZ');
  const currentTheme = theme.colors[mode];
  const currentTypography = typography[mode];

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === 'modern' || stored === 'classicZ') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, currentTheme, currentTypography }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
