# 🚗 Autos Colombia - Sistema de Control de Acceso (Iteración 1)

Este repositorio contiene la primera iteración del diseño y arquitectura del sistema de información para el parqueadero "Autos Colombia". El enfoque de esta fase es la **Gestión de la Entrada y Salida de Vehículos**.

## 🏗️ Arquitectura del Sistema
El proyecto está diseñado bajo una arquitectura Cliente-Servidor separada en tres capas:
- **Frontend (Capa de Presentación):** Interfaz web responsiva para operarios.
- **Backend (Lógica de Negocio):** API REST para validación de cupos, cálculo de tiempos y gestión de mensualidades.
- **Base de Datos (Capa de Datos):** Motor relacional (PostgreSQL) garantizando integridad referencial.

## 📂 Estructura del Repositorio
- `/database`: Contiene los scripts DDL (`.sql`) para la inicialización de las tablas relacionales y restricciones.
- `/docs`: Contiene los artefactos de diseño de software (Diagramas UML, Mockups de interfaz y documento de requerimientos).
- `/frontend`: Esqueleto de la aplicación cliente.
- `/backend`: Esqueleto del servidor de aplicaciones.

## ⚙️ Historias de Usuario Abordadas (MVP)
1. Autenticación de operario.
2. Registro de entrada (validando cupos y estado de mensualidad).
3. Registro de salida (calculando tiempo de permanencia).
4. Visualización de vehículos activos en parqueadero.

> **Nota Académica:** Este repositorio refleja la estructura base y los modelos de datos de la Iteración 1, preparando el entorno para la codificación completa de las reglas de negocio en sprints posteriores.
