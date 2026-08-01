# 📱 WikiPlanner - Frontend (React Native / Expo)

> **Sistema Inteligente Adaptativo para la Gestión y Optimización del Tiempo**  
> *Trabajo de Grado - Universidad del Valle (Escuela de Ingeniería de Sistemas y Computación)*

---

[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.35-000000?logo=expo&logoColor=white)](https://expo.dev/)
[![React Navigation](https://img.shields.io/badge/React_Navigation-v7-6b52ae?logo=react-router&logoColor=white)](https://reactnavigation.org/)
[![Axios](https://img.shields.io/badge/Axios-^1.15.2-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)
[![License](https://img.shields.io/badge/License-Academic-blue.svg)]()

---

## 📌 Descripción del Proyecto

**WikiPlanner App** es la aplicación móvil cliente (Frontend) del proyecto de investigación enfocado en la reprogramación y optimización dinámica de actividades personales.

A diferencia de las herramientas convencionales de agenda que utilizan modelos estáticos y rígidos, esta aplicación se conecta con un **motor de inferencia basado en Inteligencia Artificial (Problemas de Satisfacción de Restricciones - CSP)** y heurísticas de búsqueda. Permite al usuario gestionar sus tareas pendientes, visualizar su cronograma diario inteligente, ejecutar la generación de agenda optimizada y monitorear métricas de productividad y bienestar digital.

---

## ✨ Características Principales

- 🔐 **Autenticación y Sesión Segura**: Registro e inicio de sesión con tokens JWT y almacenamiento persistente mediante `AsyncStorage`.
- 📅 **Agenda Diaria Inteligente (`HomeScreen`)**: Visualización dinámica de bloques de tiempo y tareas asignadas para la jornada actual.
- ⚡ **Motor IA (`AgendaScreen`)**:
  - Fila de espera interactiva de tareas pendientes.
  - Disparo y ejecución del motor de optimización CSP para generación de horarios sin solapamientos.
  - Resumen del resultado de agendamiento y detalle de tareas no agendadas con justificación contextual.
  - Sincronización bidireccional automática con **Google Calendar**.
- 📊 **Métricas & Analíticas (`StatsScreen`)**:
  - Indicadores de Tasa de Adherencia y Tasa de Aceptación del plan generado.
  - Feedback sobre el aprendizaje del sistema respecto a los hábitos del usuario.
- 👤 **Perfil y Configuración (`ProfileScreen`)**:
  - Definición de rangos de disponibilidad (horarios de trabajo y descanso).
  - Estado de vinculación y sincronización con cuenta de Google Calendar.
- ✏️ **Gestión de Tareas Flexibles y Fijas (`CreateTaskScreen` / `EditTaskScreen`)**:
  - Creación, edición y eliminación de tareas especificando duración, nivel de energía requerido y flexibilidad horaria.

---

## 🛠️ Arquitectura y Tecnologías

| Categoría | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Core Framework** | React Native `0.81.5` | Framework de desarrollo de apps móviles nativas |
| **Plataforma / Tooling** | Expo SDK `~54.0` | Entorno de ejecución, compilación y empaquetado |
| **Navegación** | React Navigation `v7` | Navegación por Stack y Pestañas Inferiores (*Bottom Tabs*) |
| **Cliente HTTP** | Axios `^1.15.2` | Comunicación asíncrona e interceptores JWT con el Backend |
| **Almacenamiento Local** | `@react-native-async-storage` | Persistencia del token de sesión en el dispositivo |
| **Componentes de UI** | Expo Vector Icons (`Ionicons`), DatetimePicker | Iconografía adaptable y selectores de fecha/hora |

---

## 📂 Estructura del Código Fuente

```text
Front-WikiPlanner/
├── assets/                  # Recursos gráficos, fuentes e iconos de la aplicación
├── src/
│   ├── navigation/          # Configuración de rutas y navegadores principales
│   │   └── AppNavigator.js  # Stack Navigator + Main Bottom Tab Navigator
│   ├── screens/             # Componentes de pantalla completos
│   │   ├── LoginScreen.js      # Inicio de sesión de usuario
│   │   ├── RegisterScreen.js   # Registro de nuevo usuario
│   │   ├── HomeScreen.js       # Pestaña "Inicio" - Agenda y bloques del día
│   │   ├── AgendaScreen.js     # Pestaña "Motor IA" - Fila de espera y ejecución CSP
│   │   ├── StatsScreen.js      # Pestaña "Métricas" - Indicadores y gráficos
│   │   ├── ProfileScreen.js    # Pestaña "Perfil" - Preferencias y Google Calendar
│   │   ├── CreateTaskScreen.js # Formulario de nueva tarea
│   │   └── EditTaskScreen.js   # Edición y ajuste de tareas existentes
│   ├── services/            # Servicios de integración y comunicación API
│   │   └── api.js           # Instancia de Axios configurada con Interceptors
│   └── theme/               # Tokens de diseño y paleta de colores global
│       └── color.js
├── App.js                   # Punto de entrada de la aplicación React Native
├── app.json                 # Archivo de configuración de Expo
├── package.json             # Dependencias y scripts del proyecto
└── README.md                # Documentación del proyecto Frontend
```

---

## 🚀 Requisitos Previos e Instalación

### Requisitos Técnicos
- **Node.js**: Version `v18.x` o superior
- **NPM** o **Yarn**
- **Expo Go App** (disponible en App Store / Google Play Store) o un **Emulador Android / Simulador iOS**.
- **Backend WikiPlanner**: Servidor FastAPI en ejecución (`http://localhost:8000`).

### Pasos de Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd TG/Front-WikiPlanner
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar la URL de la API Backend**:
   Abre el archivo [src/services/api.js](file:///c:/Users/User/Desktop/TG/Front-WikiPlanner/src/services/api.js) y ajusta la dirección IP de tu máquina local en la red local (o la URL de túnel como `ngrok`):
   ```javascript
   const API_BASE_URL = 'http://<TU_IP_LOCAL>:8000/api';
   // Ejemplo con túnel ngrok: 'https://siren-charcoal-existing.ngrok-free.dev/api'
   ```

4. **Iniciar la aplicación en modo desarrollo**:
   ```bash
   npx expo start
   ```

5. **Ejecutar en el dispositivo**:
   - Escanea el código QR generado en la terminal utilizando la aplicación **Expo Go** en tu celular.
   - Presiona `a` para abrir en el emulador de Android o `w` para la versión Web.

---

## 🎓 Información Académica del Proyecto

- **Título del Trabajo de Grado**: *Implementación de un sistema inteligente adaptativo para la gestión y optimización del tiempo.*
- **Autor**: Juan Sebastián Gómez Agudelo (*Código: 2259474*)
- **Director**: MSc. Joshua David Triana Madrid, Ing.
- **Institución**: Universidad del Valle - Sede Tuluá
- **Facultad**: Facultad de Ingeniería
- **Escuela**: Escuela de Ingeniería de Sistemas y Computación
- **Año**: 2025 - 2026

---

## 📄 Licencia

Este proyecto ha sido desarrollado con fines exclusivamente académicos e investigativos en el marco del programa de Ingeniería de Sistemas y Computación de la **Universidad del Valle**.
