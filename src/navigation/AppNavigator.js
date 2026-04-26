import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/color';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AgendaScreen from '../screens/AgendaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Configuramos las pestañas inferiores (Bottom Tabs)
function MainTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Inicio') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Agenda') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.secondary,
                tabBarInactiveTintColor: colors.textLight,
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: colors.surface,
                headerTitleStyle: { fontWeight: 'bold' },
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} />
            <Tab.Screen name="Agenda" component={AgendaScreen} />
        </Tab.Navigator>
    );
}

// 2. Configuramos la pila principal (Stack) que controla el Login
export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        </Stack.Navigator>
    );
}