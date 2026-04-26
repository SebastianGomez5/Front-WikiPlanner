import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/color';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Resumen de Hoy</Text>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Gym (Ejemplo)</Text>
                <Text style={styles.cardTime}>19:00 - 20:30</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 10,
        borderLeftWidth: 5,
        borderLeftColor: colors.secondary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    cardTime: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 5,
    },
});