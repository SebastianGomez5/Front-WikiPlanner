import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

export default function AgendaScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null); // Aquí guardaremos la respuesta de la IA

    const handleGenerarAgenda = async () => {
        setLoading(true);
        setResultado(null); // Limpiamos resultados anteriores

        try {
            // 1. Calculamos la fecha de HOY en formato YYYY-MM-DD para enviarla al backend
            const hoy = new Date();
            // Formateamos manualmente para evitar problemas de zona horaria (ej: 2026-04-29)
            const year = hoy.getFullYear();
            const month = String(hoy.getMonth() + 1).padStart(2, '0');
            const day = String(hoy.getDate()).padStart(2, '0');
            const fechaFormateada = `${year}-${month}-${day}`;

            // 2. Llamamos al cerebro de la IA
            // Fíjate que le pasamos la fecha como parámetro en la URL, igual que hacíamos en Swagger
            const response = await api.post('/ai/generate-schedule', null, {
                params: { target_date: fechaFormateada }
            });

            // 3. Guardamos la respuesta exitosa
            setResultado({
                exito: true,
                mensaje: response.data.mensaje,
                tareas_agendadas: response.data.tareas_agendadas
            });

            // 4. Le avisamos al usuario y lo mandamos de vuelta al inicio para que vea los resultados
            Alert.alert(
                '¡Magia Completada!',
                `La IA ha organizado ${response.data.tareas_agendadas} tarea(s) y sincronizado con Google Calendar.`,
                [
                    { text: 'Ver mi Agenda', onPress: () => navigation.navigate('Inicio') }
                ]
            );

        } catch (error) {
            console.error("Error al generar agenda:", error);

            // Capturamos el error específico del backend si existe
            let mensajeError = "Hubo un problema al contactar a la IA.";
            if (error.response && error.response.data && error.response.data.detail) {
                mensajeError = error.response.data.detail;
            }

            setResultado({
                exito: false,
                mensaje: mensajeError
            });

            Alert.alert('Aviso', mensajeError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>

            <View style={styles.headerContainer}>
                <Text style={styles.title}>Motor de Inteligencia</Text>
                <Text style={styles.subtitle}>
                    Presiona el botón para que el algoritmo analice tus tareas pendientes, tus niveles de energía y las restricciones de tu día.
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Estado de Sincronización</Text>
                <Text style={styles.cardText}>
                    Al generar la agenda, los eventos se enviarán automáticamente a tu cuenta de Google Calendar asociada.
                </Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleGenerarAgenda}
                    disabled={loading}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color={colors.surface} size="small" />
                            <Text style={styles.loadingText}>Pensando y agendando...</Text>
                        </View>
                    ) : (
                        <Text style={styles.actionButtonText}>Generar Agenda Inteligente</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Mostramos un pequeño reporte si la IA ya se ejecutó */}
            {resultado && (
                <View style={[styles.resultCard, resultado.exito ? styles.resultSuccess : styles.resultError]}>
                    <Text style={styles.resultTitle}>{resultado.exito ? '✅ Resultado Exitoso' : '❌ Información'}</Text>
                    <Text style={styles.resultText}>{resultado.mensaje}</Text>
                </View>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 20,
        alignItems: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: colors.textLight,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: colors.surface,
        padding: 25,
        borderRadius: 15,
        width: '100%',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textDark,
        marginBottom: 10,
    },
    cardText: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 25,
        lineHeight: 20,
    },
    actionButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: colors.surface,
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingText: {
        color: colors.surface,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 10,
    },
    resultCard: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        borderLeftWidth: 5,
    },
    resultSuccess: {
        backgroundColor: '#ECFDF5', // Verde muy clarito
        borderLeftColor: colors.success,
    },
    resultError: {
        backgroundColor: '#FEF2F2', // Rojo muy clarito
        borderLeftColor: colors.danger,
    },
    resultTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
        color: colors.textDark,
    },
    resultText: {
        fontSize: 14,
        color: colors.textDark,
    }
});