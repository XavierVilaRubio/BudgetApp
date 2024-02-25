import '../global.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { SplashScreen, Stack } from 'expo-router';
import * as SQLite from 'expo-sqlite/next';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { loadDatabase } from '../lib/db';

import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
};

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const theme = await AsyncStorage.getItem('theme');
      if (!theme) {
        AsyncStorage.setItem('theme', colorScheme);
        setIsColorSchemeLoaded(true);
        return;
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light';
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme);

        setIsColorSchemeLoaded(true);
        return;
      }
      setIsColorSchemeLoaded(true);
    })()
      .catch(() => {
        setIsColorSchemeLoaded(true);
      })
      .finally(() => {
        SplashScreen.hideAsync();
      });

    loadDatabase();
  }, []);

  // Only render the app when the color scheme is loaded.
  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <React.Suspense
        fallback={
          <View style={{ flex: 1 }}>
            <ActivityIndicator size="large" />
            <Text>Loading Database...</Text>
          </View>
        }>
        <SQLite.SQLiteProvider databaseName="mySQLiteDB.db" useSuspense>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <Stack />
        </SQLite.SQLiteProvider>
      </React.Suspense>
    </ThemeProvider>
  );
}
