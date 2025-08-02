import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EndoCareProvider } from './src/context/EndoCareContext';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <EndoCareProvider>
        <NavigationContainer>
          <StatusBar style="auto" backgroundColor="#FAFAFA" />
          <BottomTabNavigator />
        </NavigationContainer>
      </EndoCareProvider>
    </SafeAreaProvider>
  );
}
