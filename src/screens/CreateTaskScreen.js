import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../theme/color';
import api from '../services/api';

export default function CreateTaskScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [durationHours, setDurationHours] = useState(1);
    const [durationMinutes, setDurationMinutes] = useState(0);

    const totalDurationMinutes = (durationHours * 60) + durationMinutes;
    const [priority, setPriority] = useState('3');

    const [category, setCategory] = useState('Trabajo');
    const [energyLevel, setEnergyLevel] = useState('Medio');
    const [difficultyLevel, setDifficultyLevel] = useState('Media');

    const [isFlexible, setIsFlexible] = useState(true);
    const [targetDate, setTargetDate] = useState(new Date());

    const [preferredTime, setPreferredTime] = useState('Cualquier');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('date');
    const [loading, setLoading] = useState(false);

    const handleCreateTask = async () => {
        if (!title) {
            Alert.alert('Datos incompletos', 'Por favor, ponle un título a tu tarea.');
            return;
        }

        if (totalDurationMinutes <= 0) {
            Alert.alert('Duración inválida', 'La tarea debe durar al menos 15 minutos.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: title,
                description: isFlexible ? "Tarea flexible" : "Evento fijo",
                duration_minutes: totalDurationMinutes,
                priority: parseInt(priority),
                category: category,
                energy_level: energyLevel,
                difficulty_level: difficultyLevel,
                is_flexible: isFlexible,
                deadline: isFlexible ? targetDate.toISOString() : null,
                fixed_start_time: !isFlexible ? targetDate.toISOString() : null,
                preferred_time_of_day: isFlexible ? preferredTime : "Cualquier" // Enviamos la preferencia
            };

            await api.post('/tasks/', payload);

            Alert.alert('¡Felicidades!', 'Actividad creada exitosamente.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo crear la actividad. Revisa tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (event.type === 'dismissed') return;
        if (selectedDate) setTargetDate(selectedDate);
    };

    const showMode = (currentMode) => {
        setPickerMode(currentMode);
        setShowDatePicker(true);
    };

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
                    placeholder={isFlexible ? "Ej: Estudiar para el parcial" : "Ej: Cita Médica / Partido"}
                    value={title}
                    onChangeText={setTitle}
                />

                <View style={styles.switchRow}>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.label}>¿Es una tarea flexible?</Text>
                        <Text style={styles.helperText}>
                            {isFlexible
                                ? "La IA buscará el mejor momento para hacerla."
                                : "Es un evento fijo. Se agendará a la hora exacta que le digas."}
                        </Text>
                    </View>
                    <Switch
                        value={isFlexible}
                        onValueChange={setIsFlexible}
                        trackColor={{ false: '#D1D5DB', true: colors.secondary }}
                        thumbColor={colors.surface}
                    />
                </View>

                {isFlexible && (
                    <View>
                        <Text style={styles.label}>Momento Ideal (Lapso sugerido)</Text>
                        <View style={styles.buttonGroup}>
                            {['Cualquier', 'Mañana', 'Tarde', 'Noche'].map(time => (
                                <SelectionButton key={time} current={preferredTime} value={time} onPress={setPreferredTime} />
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.label}>
                    {isFlexible ? "Fecha Límite (Plazo máximo)" : "Fecha y Hora de Inicio Exacta"}
                </Text>
                <View style={styles.row}>
                    <TouchableOpacity style={[styles.dateButton, { flex: 1, marginRight: isFlexible ? 0 : 10 }]} onPress={() => showMode('date')}>
                        <Text style={styles.dateText}>{targetDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    {!isFlexible && (
                        <TouchableOpacity style={[styles.dateButton, { flex: 1 }]} onPress={() => showMode('time')}>
                            <Text style={styles.dateText}>{targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.label}>Duración</Text>
                <View style={styles.durationRow}>
                    <View style={styles.durationBlock}>
                        <Text style={styles.durationBlockLabel}>Horas</Text>
                        <View style={styles.stepperRow}>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => setDurationHours(Math.max(0, durationHours - 1))}
                            >
                                <Text style={styles.stepperBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperValue}>{durationHours}</Text>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => setDurationHours(Math.min(12, durationHours + 1))}
                            >
                                <Text style={styles.stepperBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.durationBlock}>
                        <Text style={styles.durationBlockLabel}>Minutos</Text>
                        <View style={styles.stepperRow}>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => setDurationMinutes(durationMinutes === 0 ? 45 : durationMinutes - 15)}
                            >
                                <Text style={styles.stepperBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.stepperValue}>{durationMinutes}</Text>
                            <TouchableOpacity
                                style={styles.stepperBtn}
                                onPress={() => setDurationMinutes(durationMinutes === 45 ? 0 : durationMinutes + 15)}
                            >
                                <Text style={styles.stepperBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text style={styles.durationSummary}>
                    Total: {durationHours > 0 ? `${durationHours}h ` : ''}{durationMinutes}min
                    {totalDurationMinutes === 0 && ' (selecciona una duración)'}
                </Text>

                <Text style={[styles.label, { opacity: isFlexible ? 1 : 0.5 }]}>Prioridad (1-5)</Text>
                <TextInput
                    style={[styles.input, { opacity: isFlexible ? 1 : 0.5 }]}
                    placeholder="Ej: 3"
                    keyboardType="numeric"
                    value={priority}
                    onChangeText={setPriority}
                    editable={isFlexible}
                />

                <Text style={styles.label}>Categoría</Text>
                <View style={styles.buttonGroup}>
                    {['Trabajo', 'Estudio', 'Salud', 'Hogar', 'Ocio'].map(cat => (
                        <SelectionButton key={cat} current={category} value={cat} onPress={setCategory} />
                    ))}
                </View>

                <Text style={styles.label}>Energía Requerida</Text>
                <View style={styles.buttonGroup}>
                    {['Bajo', 'Medio', 'Alto'].map(en => (
                        <SelectionButton key={en} current={energyLevel} value={en} onPress={setEnergyLevel} />
                    ))}
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={targetDate}
                        mode={pickerMode}
                        display="default"
                        onChange={onChangeDate}
                    />
                )}

                <TouchableOpacity style={styles.submitButton} onPress={handleCreateTask} disabled={loading}>
                    {loading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.submitButtonText}>Guardar Actividad</Text>}
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: 15 },
    card: { backgroundColor: colors.surface, padding: 20, borderRadius: 15, elevation: 3 },
    label: { fontSize: 14, fontWeight: 'bold', color: colors.primary, marginBottom: 5, marginTop: 15 },
    helperText: { fontSize: 11, color: colors.textLight, marginTop: 2, fontStyle: 'italic' },
    input: { backgroundColor: colors.background, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', color: colors.textDark },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    buttonGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    selectBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: colors.secondary, backgroundColor: colors.surface, marginBottom: 5 },
    selectBtnActive: { backgroundColor: colors.secondary },
    selectBtnText: { color: colors.secondary, fontWeight: 'bold', fontSize: 12 },
    selectBtnTextActive: { color: colors.surface },
    dateButton: { backgroundColor: colors.background, padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    dateText: { color: colors.textDark, fontWeight: 'bold' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    submitButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    submitButtonText: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
    durationRow: { flexDirection: 'row', gap: 15, marginBottom: 5 },
    durationBlock: { flex: 1, backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', padding: 12, alignItems: 'center' },
    durationBlockLabel: { fontSize: 12, color: colors.textLight, marginBottom: 8, fontWeight: '600' },
    stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    stepperBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    stepperBtnText: { color: colors.surface, fontSize: 18, fontWeight: 'bold', marginTop: -2 },
    stepperValue: { fontSize: 18, fontWeight: 'bold', color: colors.textDark, minWidth: 24, textAlign: 'center' },
    durationSummary: { textAlign: 'center', fontSize: 13, color: colors.primary, fontWeight: '600', marginTop: 8, marginBottom: 5 },
});