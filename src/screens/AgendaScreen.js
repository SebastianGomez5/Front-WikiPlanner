import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/color';

export default function AgendaScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Toda tu Agenda</Text>
            <Text style={styles.subtitle}>Aquí veremos los bloques calculados por la IA.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
        marginTop: 10,
    },
});