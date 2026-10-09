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

A diferencia de las herramientas convencionales de agenda que utilizan modelos estáticos y rígidos, esta aplicación se conecta con un **motor de inferencia basado en Inteligencia Artificial (Problemas de Satisfacción de Restricciones - CSP)** con heurísticas de búsqueda y aprendizaje adaptativo. 

La interfaz proporciona una experiencia de usuario centrada en la **Inteligencia Artificial Explicable (XAI)**, permitiendo al usuario no solo recibir un horario optimizado, sino comprender en lenguaje natural las razones por las cuales cada tarea fue asignada a una franja horaria determinada, visualizar su balance de tiempo y sincronizarse fluidamente con **Google Calendar**.

---

## ✨ Características Principales

- 🧠 **Inteligencia Artificial Explicable (XAI - Explainable AI)**:
  - **Insignia de Confianza (`✨ XX%`)**: Cada bloque de tiempo asignado por la IA muestra su nivel de certidumbre basado en la satisfacción de restricciones y penalizaciones.
  - **Explicación Contextual en Lenguaje Natural**: Al tocar una tarea en `HomeScreen`, se abre el modal de decisión con una tarjeta explicativa: *"¿Por qué la IA eligió esta hora?"*, desglosando si la decisión obedeció a preferencias de momento del día, picos de energía, equilibrio ocio/trabajo, prevención de colisiones o hábitos previos aprendidos.
- 📅 **Agenda Diaria Inteligente (`HomeScreen`)**:
  - Vista cronológica de bloques de tiempo y eventos externos (Google Calendar).
  - **Banner de Tareas en Espera**: Notificación interactiva cuando existen tareas creadas pendientes en la fila que aún no han sido procesadas por el motor.
  - Modal de retroalimentación para marcar tareas como completadas a tiempo o reprogramarlas (alimentando el modelo de aprendizaje por refuerzo).
- ⚡ **Motor IA & Fila de Espera (`AgendaScreen`)**:
  - Fila interactiva de tareas pendientes clasificadas por prioridad y flexibilidad.
  - Botón de disparo para generación y optimización de la agenda con el motor CSP.
  - **Ventana de Resultados con Sugerencias Accionables**: Resumen visual con barra de desplazamiento que, además de listar tareas asignadas y no agendadas, ofrece recomendaciones prácticas para liberar franjas horarias saturadas.
- 📊 **Métricas, Analíticas & Balance de Vida (`StatsScreen`)**:
  - Indicadores de **Tasa de Adherencia** y **Tasa de Aceptación** de sugerencias.
  - **Balance Ocio / Productividad Multidimensional**: Selector interactivo de periodos para analizar la distribución horaria por **Día**, **Semana** o **Mes**.
- ✏️ **Gestión y Creación de Tareas con Validación Temporal (`CreateTaskScreen` / `EditTaskScreen`)**:
  - Creación de tareas con categorías (Trabajo, Estudio, Salud, Hogar, Ocio), niveles de energía (Bajo, Medio, Alto) y momentos preferidos.
  - **Prevención de Horas Pasadas**: Para tareas del día actual, el selector bloquea o alerta sobre franjas horarias pasadas para evitar incongruencias temporales.
- 👤 **Perfil y Google Calendar (`ProfileScreen`)**:
  - Configuración de franjas de disponibilidad y jornada laboral.
  - Vinculación segura de cuenta de Google con sincronización bidireccional automática.

---

## 🛠️ Arquitectura y Tecnologías

| Categoría | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Core Framework** | React Native `0.81.5` | Framework para desarrollo nativo en iOS y Android |
| **Plataforma / Tooling** | Expo SDK `~54.0` | Entorno de desarrollo, pruebas y empaquetado |
| **Navegación** | React Navigation `v7` | Stack Navigator y Bottom Tab Navigator |
| **Cliente HTTP** | Axios `^1.15.2` | Manejo de peticiones asíncronas con interceptores JWT |
| **Persistencia Local** | AsyncStorage | Almacenamiento seguro del token de sesión |
| **Componentes de UI** | Ionicons, DateTimePicker | Iconografía y selectores nativos de fecha y hora |

---

## 📂 Estructura del Código Fuente

```text
Front-WikiPlanner/
├── assets/                      # Recursos gráficos, logotipos e iconos
├── src/
│   ├── navigation/              # Rutas y navegación de la aplicación
│   │   └── AppNavigator.js      # Navegadores Stack y Bottom Tabs
│   ├── screens/                 # Pantallas principales de la interfaz
│   │   ├── LoginScreen.js          # Autenticación de usuario
│   │   ├── RegisterScreen.js       # Registro de nuevos usuarios
│   │   ├── HomeScreen.js           # Agenda del día, XAI ("¿Por qué?") y banner de espera
│   │   ├── AgendaScreen.js         # Fila de tareas, ejecución CSP y sugerencias de saturación
│   │   ├── StatsScreen.js          # KPIs, adherencia y balance temporal (día/semana/mes)
│   │   ├── ProfileScreen.js        # Ajustes de jornada laboral y Google Calendar
│   │   ├── CreateTaskScreen.js     # Formulario de tarea con validación de horarios pasados
│   │   └── EditTaskScreen.js       # Modificación de tareas existentes
│   ├── services/                # Servicios y comunicación con la API
│   │   └── api.js               # Cliente Axios configurado con Interceptors JWT
│   └── theme/                   # Sistema de diseño y colores
│       └── color.js             # Paleta de colores consistente
├── App.js                       # Raíz de la aplicación React Native
├── app.json                     # Configuración de la aplicación Expo
├── package.json                 # Dependencias y scripts de ejecución
└── README.md                    # Documentación del proyecto Frontend
```

---

## 🚀 Requisitos Previos e Instalación

### Requisitos Técnicos
- **Node.js**: Versión `v18.x` o superior
- **NPM** o **Yarn**
- **Dispositivo Móvil**: Aplicación **Expo Go** instalada en Android / iOS, o un Emulador oficial configurado.
- **Backend WikiPlanner**: Servidor FastAPI en ejecución (`http://localhost:8000` o URL pública de `ngrok`).

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
   Abre el archivo [src/services/api.js](file:///c:/Users/User/Desktop/TG/Front-WikiPlanner/src/services/api.js) y configura la dirección de tu backend:
   ```javascript
   // Si pruebas localmente en red Wi-Fi:
   const API_BASE_URL = 'http://<TU_IP_LOCAL>:8000/api';

   // O si utilizas un túnel público ngrok:
   const API_BASE_URL = 'https://tu-dominio-ngrok.ngrok-free.dev/api';
   ```

4. **Iniciar el servidor de desarrollo**:
   ```bash
   npx expo start
   ```

5. **Visualizar en el dispositivo**:
   - Abre la app **Expo Go** en tu teléfono y escanea el código QR mostrado en la terminal.
   - O presiona `a` en la terminal para abrir directamente en el emulador de Android.

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
