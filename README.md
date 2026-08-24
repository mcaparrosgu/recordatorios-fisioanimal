# Recordatorios Fisioanimal

Sistema de recordatorios automáticos por email para clientas de fisioterapia canina. Funciona con Google Calendar + Sheets + Gmail + Drive, sin servidores externos ni coste.

## Estado

Funcionando. Los correos se envían en HTML con el logo de Fisioanimal incrustado.

## Qué hace

1. Andrea crea una cita en Google Calendar con el nombre del perro como título
2. El script busca al tutor en Google Sheets y le envía un email de recordatorio en HTML
3. Cada noche hace una segunda pasada por si hubo citas nuevas tras las 10:00
4. El gestor recibe un email-resumen con todo lo que pasó

## Características

- Email en **HTML** con logo incrustado (sin emojis con interrogantes)
- Mensaje personalizado: "Hola {nombre}, {perro} tiene cita mañana {dd/mm/aa} a las {hh:mm}h"
- Deduplicación: la pasada de las 20:00 no reenvía lo que ya envió la de las 10:00
- Log con todos los envíos y errores en la hoja "Log"
- Logo con fondo transparente procesado y subido a Google Drive

## Archivos clave

| Archivo | Qué es |
|---|---|
| `scripts/recordatorios.js` | El script completo (pegar en Apps Script desde la hoja) |
| `logo_fisioanimal_transparent.png` | Logo con fondo transparente para el email |
| `docs/INSTALACION.md` | Guía paso a paso para instalar |
| `docs/okf/index.md` | Documentación técnica del proyecto (OKF) |
| `AGENTS.md` | Guía para agentes de código |

## Para empezar

Lee [`docs/INSTALACION.md`](docs/INSTALACION.md) — te lleva de la mano desde cero hasta tener los triggers funcionando.

## Contexto

- **Andrea**: fisioterapeuta canina. Agenda citas en Calendar con el nombre del perro.
- **Gestor**: persona que instala y mantiene el sistema. Recibe los resúmenes.
