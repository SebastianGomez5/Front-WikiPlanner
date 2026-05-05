import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/color';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AgendaScreen from '../screens/AgendaScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline'; // Icono para el perfil
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
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen
                name="CreateTask"
                component={CreateTaskScreen}
                options={{ headerShown: true, title: 'Nueva Tarea', headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' }}
            />
        </Stack.Navigator>
    );
}