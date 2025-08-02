import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import DashboardScreen from '../screens/DashboardScreen';
import PeriodScreen from '../screens/PeriodScreen';
import FoodScreen from '../screens/FoodScreen';
import SleepScreen from '../screens/SleepScreen';
import SymptomScreen from '../screens/SymptomScreen';

const Tab = createMaterialTopTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      swipeEnabled={true}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FEFEFE',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: Platform.OS === 'ios' ? 110 : 90,
          paddingBottom: Platform.OS === 'ios' ? 35 : 20,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#C8A8D8',
        tabBarInactiveTintColor: '#7F8C8D',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 4,
          textAlign: 'center',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 60,
        },
        tabBarShowIcon: true,
        tabBarIndicatorStyle: {
          backgroundColor: '#C8A8D8',
          height: 3,
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