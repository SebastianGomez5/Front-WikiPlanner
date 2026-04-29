import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/color';
import api from '../services/api';

export default function CreateTaskScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('');
    const [priority, setPriority] = useState('3'); // 1 a 5

    // Categorías y Niveles
    const [category, setCategory] = useState('Trabajo');
    const [energyLevel, setEnergyLevel] = useState('Medio');
    const [difficultyLevel, setDifficultyLevel] = useState('Media');

    const [isFlexible, setIsFlexible] = useState(true);

    // Manejo de Fechas
    const [deadline, setDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [loading, setLoading] = useState(false);

    // Función para guardar en la Base de Datos
    const handleCreateTask = async () => {
        if (!title || !duration) {
            Alert.alert('Datos incompletos', 'Por favor, ponle un título y una duración a tu tarea.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: title,
                description: "Creada desde el celular",
                duration_minutes: parseInt(duration),
                priority: parseInt(priority),
                category: category,
                energy_level: energyLevel,
                difficulty_level: difficultyLevel,
                is_flexible: isFlexible,
                deadline: deadline.toISOString() // Formato que entiende PostgreSQL
            };

            await api.post('/tasks/', payload);

            Alert.alert('Felicidades!!', 'Tarea creada exitosamente.', [
                { text: 'OK', onPress: () => navigation.goBack() } // Regresa a la pantalla anterior
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo crear la tarea. Revisa tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    // Componente auxiliar para crear botones de selección (tipo Radio Button)
    const SelectionButton = ({ current, value, onPress }) => (
        <TouchableOpacity
            style={[styles.selectBtn, current === value && styles.selectBtnActive]}
            onPress={() => onPress(value)}
        >
            <Text style={[styles.selectBtnText, current === value && styles.selectBtnTextActive]}>
                {value}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.card}>

                <Text style={styles.label}>¿Qué tienes que hacer?</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ej: Estudiar para el parcial"
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.label}>Duración (minutos)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 90"
                            keyboardType="numeric"
                            value={duration}
                            onChangeText={setDuration}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Prioridad (1 baja - 5 alta)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: 3"
                            keyboardType="numeric"
                            value={priority}
                            onChangeText={setPriority}
                        />
                    </View>
                </View>

                <Text style={styles.label}>Categoría</Text>
                <View style={styles.buttonGroup}>
                    {['Trabajo', 'Estudio', 'Salud', 'Ocio'].map(cat => (
                        <SelectionButton key={cat} current={category} value={cat} onPress={setCategory} />
                    ))}
                </View>

                <Text style={styles.label}>Energía Requerida</Text>
                <View style={styles.buttonGroup}>
                    {['Bajo', 'Medio', 'Alto'].map(en => (
                        <SelectionButton key={en} current={energyLevel} value={en} onPress={setEnergyLevel} />
                    ))}
                </View>

                <Text style={styles.label}>Fecha Límite (Deadline)</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{deadline.toLocaleDateString()} {deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === 'ios'); // En iOS se queda abierto, en Android se cierra solo
                            if (selectedDate) setDeadline(selectedDate);
                        }}
                    />
                )}

                <View style={styles.switchRow}>
                    <Text style={styles.label}>¿Es Flexible? (La IA la puede mover)</Text>
                    <Switch
                        value={isFlexible}
                        onValueChange={setIsFlexible}
                        trackColor={{ false: '#D1D5DB', true: colors.secondary }}
                        thumbColor={colors.surface}
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleCreateTask} disabled={loading}>
                    {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitButtonText}>Guardar Tarea</Text>}
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 15 },
    card: { backgroundColor: colors.surface, padding: 20, borderRadius: 15, elevation: 3 },
    label: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: 5, marginTop: 15 },
    input: { backgroundColor: colors.background, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', color: colors.textDark },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    buttonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    selectBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: colors.secondary, backgroundColor: colors.surface, marginBottom: 5 },
    selectBtnActive: { backgroundColor: colors.secondary },
    selectBtnText: { color: colors.secondary, fontWeight: 'bold', fontSize: 12 },
    selectBtnTextActive: { color: colors.surface },
    dateButton: { backgroundColor: colors.background, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    dateText: { color: colors.textDark, fontWeight: 'bold' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 20 },
    submitButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    submitButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 }
});