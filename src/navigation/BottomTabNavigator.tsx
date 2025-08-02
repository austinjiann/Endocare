import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import PeriodScreen from '../screens/PeriodScreen';
import FoodScreen from '../screens/FoodScreen';
import SleepScreen from '../screens/SleepScreen';
import SymptomScreen from '../screens/SymptomScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FEFEFE',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: Platform.OS === 'ios' ? 88 : 65,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#FF6B9D',
        tabBarInactiveTintColor: '#7F8C8D',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Period"
        component={PeriodScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Food"
        component={FoodScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sleep"
        component={SleepScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="moon" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Symptoms"
        component={SymptomScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medical" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}