---
type: Architecture
title: Arquitectura del sistema
description: Stack tecnológico y flujo de datos del sistema de recordatorios
tags: [google-apps-script, gmail, google-calendar, google-sheets, google-drive, html-email]
resource: ./architecture.md
generated:
  by: opencode/okf-skill
  at: 2026-08-23T18:20:00Z
verified:
  by: humano:ganja
  at: 2026-08-24T17:30:00Z
status: stable
---

# Arquitectura

## Stack tecnológico

| Componente | Herramienta | Propósito |
|---|---|---|
| Base de datos | Google Sheets | Almacena fichas de clientas (perro, tutor, email, teléfono) |
| Calendario | Google Calendar | Andrea registra citas (título = nombre del perro) |
| Motor de automatización | Google Apps Script | Ejecuta la lógica de recordatorios diariamente |
| Envío de emails | Gmail (servicio de Apps Script) | Envía los recordatorios en HTML con logo incrustado |
| Almacenamiento de logo | Google Drive | PNG con fondo transparente, cargado por ID en cada ejecución |

## Flujo de datos

```
Andrea crea cita en Calendar
        ↓
Apps Script se ejecuta a las 10:00 y 20:00
        ↓
enviarRecordatorios() → try/catch → ejecutarRecordatorios()
        ↓
Lee eventos de mañana del Calendar
        ↓
Carga logo desde Drive (una vez) · si falla, marca logoError
        ↓
Abre hoja · si faltan "Clientes" o "Log" → email de alerta
        ↓
Lee hoja "Clientes" → índice perro → tutor + nombre de pila + email
        ↓
Carga el Log UNA vez en memoria (Set por ID de evento)
        ↓
Por cada evento:
  1. ¿Su ID ya está en el Log? → saltar (deduplicación)
  2. Busca el perro (fuzzy: exacto → prefijo → Levenshtein ≤ 1)
        ↓
┌──────────────────────────────────┐
│ ¿Está en la base?                │
│   SÍ → ¿Tiene email?             │
│         SÍ → Enviar recordatorio │
│              HTML con logo       │
│         NO → "Sin email"         │
│   NO → "Sin ficha"               │
└──────────────────────────────────┘
        ↓
Acumula filas en memoria · marca el ID como procesado
        ↓
Escribe el Log en BATCH (1 sola llamada a Sheets)
        ↓
Enviar email-resumen HTML al gestor (SIEMPRE, aunque no haya citas)
```
## Triggers (ejecución automática)

| Trigger | Hora | Propósito |
|---|---|---|
| `enviarRecordatorios` | 10:00 diario | Primera pasada: envía recordatorios para citas de mañana |
| `enviarRecordatorios` | 20:00 diario | Segunda pasada: captura citas creadas después de las 10:00 |

## Deduplicación

El Log registra cada envío con el **ID del evento de Calendar** (columna H). La segunda pasada (20:00) carga el Log una sola vez en memoria y verifica antes de reenviar:

- Si el ID del evento ya está en el Log → no reenvía
- Si no está → envía y registra el ID

Al deduplicar por **ID de evento** (no por nombre de perro), dos citas del mismo perro a distintas horas el mismo día reciben cada una su recordatorio. También evita reenvíos en eventos que matchearon por fuzzy matching (el ID es estable aunque el nombre coincidiera por aproximación).

> Para reenviar recordatorios: borrar el Log. Al migrar desde una versión anterior, borrar el Log antes de la primera ejecución (los registros viejos no tienen ID de evento).

## Manejo de errores

- **Try/catch global:** `enviarRecordatorios()` envuelve toda la lógica en un `try/catch`. Si algo revienta (falta una pestaña, ID de logo inválido, hoja inaccesible), el gestor recibe un email de alerta con el error y la pila. No hay fallos mudos.
- **Guard de hojas:** si faltan las pestañas "Clientes" o "Log", se lanza un error claro con instrucciones.
- **Logo opcional:** si el logo no carga, los correos se envían sin imagen y el resumen avisa con ⚠️.

## Resumen diario

El email-resumen se envía **siempre**, aunque no haya citas mañana (mensaje: "Hoy no hay citas programadas para mañana"). Esto confirma que el script sigue activo: si un día no llega el resumen, algo ha fallado.

## Formato de email

Los correos se envían en **HTML** (`htmlBody`) con:
- Texto formateado (negrita en fecha y hora)
- Emoji 🐾 como entidad HTML (`&#128062;`)
- Logo incrustado como imagen inline (`inlineImages` con `cid:logo`)
- Texto plano como fallback para clientes que no soportan HTML

## Zona horaria

Configurable vía `CONFIG.TZ` (por defecto `Europe/Madrid`, CET/CEST). Se usa en todas las llamadas a `Utilities.formatDate` desde un único punto.

## Límites de la plataforma

| Recurso | Límite | Impacto |
|---|---|---|
| Gmail personal | 500 emails/día | Suficiente para un negocio pequeño de citas |
| Apps Script ejecuciones | 20.000/día | 2 ejecuciones/día = mínimo uso |
| Google Sheets celdas | 10 millones por hoja | Miles de clientas posibles |
| Google Calendar eventos | 500 por calendario | Sobrado |
| Apps Script inline images | Una por `cid:` key | Una imagen (logo) por email |

## Seguridad

- No se almacenan API keys ni contraseñas en el código
- El script usa los permisos de la cuenta de Google donde se instala
- Los emails salen desde la cuenta personal de Gmail (no hay servidor externo)
- El email de resumen y el ID del logo viven en el bloque `CONFIG` o en Propiedades del script, configurables por despliegue sin editar código
- El logo es público en Drive (solo lectura por ID); no contiene datos sensibles
