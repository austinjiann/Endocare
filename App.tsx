import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AlertProvider } from './src/context/AlertContext';
import { EndoCareProvider } from './src/context/EndoCareContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AlertProvider>
        <EndoCareProvider>
          <NavigationContainer>
            <StatusBar style="auto" backgroundColor="#FAFAFA" />
            <BottomTabNavigator />
          </NavigationContainer>
        </EndoCareProvider>
      </AlertProvider>
    </SafeAreaProvider>
  );
}
