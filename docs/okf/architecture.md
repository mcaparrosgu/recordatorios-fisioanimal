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
Lee eventos de mañana del Calendar
        ↓
Carga logo desde Drive (una sola vez)
        ↓
Lee hoja "Clientes" → índice perro → tutor + email
        ↓
Por cada evento:
  Título del evento = nombre del perro
        ↓
Busca en hoja "Clientes":
  Nombre del perro (col A) → Tutor (col B) + Email (col C)
        ↓
┌─────────────────────────────────┐
│ ¿Hay email?                     │
│   SÍ → Enviar recordatorio HTML │
│        con logo incrustado      │
│   NO → Anotar en Log "Sin email"│
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│ ¿Está en la base?               │
│   SÍ → Procesar                 │
│   NO → Anotar en Log "Sin ficha"│
└─────────────────────────────────┘
        ↓
Registrar cada envío en hoja "Log"
        ↓
Enviar email-resumen HTML al gestor
```

## Triggers (ejecución automática)

| Trigger | Hora | Propósito |
|---|---|---|
| `enviarRecordatorios` | 10:00 diario | Primera pasada: envía recordatorios para citas de mañana |
| `enviarRecordatorios` | 20:00 diario | Segunda pasada: captura citas creadas después de las 10:00 |

## Deduplicación

El Log registra cada envío. La segunda pasada (20:00) verifica antes de reenviar:
- Si ya existe un registro con el mismo perro + misma fecha → no reenvía
- Si no existe → envía y registra

## Formato de email

Los correos se envían en **HTML** (`htmlBody`) con:
- Texto formateado (negrita en fecha y hora)
- Emoji 🐾 como entidad HTML (`&#128062;`)
- Logo incrustado como imagen inline (`inlineImages` con `cid:logo`)
- Texto plano como fallback para clientes que no soportan HTML

## Zona horaria

Configurada en `Europe/Madrid` (CET/CEST).

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
- El email de resumen va a una dirección conocida por el gestor
- El logo es público en Drive (solo lectura por ID); no contiene datos sensibles
