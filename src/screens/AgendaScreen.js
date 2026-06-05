import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/color';
import api from '../services/api';

export default function AgendaScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null); 
  
  // NUEVOS ESTADOS: Para manejar la fila de tareas pendientes
  const [pendingTasks, setPendingTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Función para ir a buscar las tareas en cola
  const fetchPendingTasks = async () => {
    setLoadingTasks(true);
    try {
      const response = await api.get('/tasks/pending');
      setPendingTasks(response.data);
    } catch (error) {
      console.error("Error cargando tareas pendientes:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Hacemos que recargue la lista cada vez que el usuario entra a esta pestaña
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPendingTasks();
      setResultado(null); // Limpiamos el mensaje de éxito anterior al volver a entrar
    });
    return unsubscribe;
  }, [navigation]);

  const handleGenerarAgenda = async () => {
    if (pendingTasks.length === 0) {
        Alert.alert('Aviso', 'No tienes tareas pendientes para agendar.');
        return;
    }

    setLoading(true);
    setResultado(null); 

    try {
      const hoy = new Date();
      const year = hoy.getFullYear();
      const month = String(hoy.getMonth() + 1).padStart(2, '0');
      const day = String(hoy.getDate()).padStart(2, '0');
      const fechaFormateada = `${year}-${month}-${day}`;

      const response = await api.post('/ai/generate-schedule', null, {
        params: { target_date: fechaFormateada }
      });

      setResultado({
        exito: true,
        mensaje: response.data.mensaje,
        tareas_agendadas: response.data.tareas_agendadas
      });

      // Recargamos la lista para que desaparezcan las tareas que ya se agendaron
      fetchPendingTasks();

      Alert.alert(
        '¡Magia Completada!',
        `La IA ha organizado ${response.data.tareas_agendadas} tarea(s) y sincronizado con Google Calendar.`,
        [
          { text: 'Ver mi Agenda', onPress: () => navigation.navigate('Inicio') }
        ]
      );

    } catch (error) {
      console.error("Error al generar agenda:", error);
      
      let mensajeError = "Hubo un problema al contactar a la IA.";
      if (error.response && error.response.data && error.response.data.detail) {
          mensajeError = error.response.data.detail;
      }
      
      setResultado({ exito: false, mensaje: mensajeError });
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
          Analiza tus niveles de energía, tus horarios y organiza tu día con la gracia de Dios.
        </Text>
      </View>

      {/* NUEVA SECCIÓN: Visualización de Tareas Pendientes */}
      <View style={styles.pendingCard}>
        <View style={styles.pendingHeader}>
            <Text style={styles.cardTitle}>Fila de Espera</Text>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingTasks.length}</Text>
            </View>
        </View>

        {loadingTasks ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }}/>
        ) : pendingTasks.length > 0 ? (
            <>
                <Text style={styles.pendingInstruction}>
                    Tienes tareas esperando ser organizadas. Corre el motor para acomodarlas en tu día.
                </Text>
                {pendingTasks.map((task) => (
                    <View key={task.id} style={styles.taskItem}>
                        <Text style={styles.taskItemTitle}>{task.title}</Text>
                        <Text style={styles.taskItemDetail}>
                            {task.duration_minutes} min • {task.is_flexible ? 'Flexible' : 'Fija'}
                        </Text>
                    </View>
                ))}
            </>
        ) : (
            <Text style={styles.emptyText}>
                No hay tareas pendientes. ¡Tu agenda está al día! 
                Ve a la pestaña de Inicio y dale al botón "+" para crear nuevas.
            </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sincronización</Text>
        <Text style={styles.cardText}>
          Al generar la agenda, los eventos se enviarán automáticamente a tu cuenta de Google Calendar.
        </Text>

        <TouchableOpacity 
          style={[styles.actionButton, pendingTasks.length === 0 && styles.actionButtonDisabled]} 
          onPress={handleGenerarAgenda}
          disabled={loading || pendingTasks.length === 0}
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
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  pendingCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 3,
    marginBottom: 15,
    borderTopWidth: 4,
    borderTopColor: colors.secondary,
  },
  pendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
  },
  badgeText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  pendingInstruction: {
    fontSize: 13,
    color: colors.textDark,
    marginBottom: 15,
    fontStyle: 'italic',
  },
  taskItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  taskItemTitle: {
    fontWeight: 'bold',
    color: colors.textDark,
    fontSize: 14,
  },
  taskItemDetail: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textLight,
    textAlign: 'center',
    marginVertical: 15,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 15,
    width: '100%',
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 5,
  },
  cardText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 20,
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#9CA3AF', 
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
      marginTop: 5,
      borderLeftWidth: 5,
  },
  resultSuccess: {
      backgroundColor: '#ECFDF5',
      borderLeftColor: colors.success,
  },
  resultError: {
      backgroundColor: '#FEF2F2',
      borderLeftColor: colors.danger,
  },
  resultTitle: {
      fontWeight: 'bold',
      fontSize: 15,
      marginBottom: 5,
      color: colors.textDark,
  },
  resultText: {
      fontSize: 13,
      color: colors.textDark,
  }
});