---
type: Overview
title: Recordatorios Fisioanimal
description: Sistema de recordatorios automáticos para clientas de fisioterapia canina (WhatsApp con email de seguridad)
tags: [google-apps-script, gmail, google-calendar, google-sheets, google-drive, automacion]
generated:
  by: opencode/okf-skill
  at: 2026-08-23T18:20:00Z
verified:
  by: humano:ganja
  at: 2026-08-24T17:30:00Z
status: stable
---

# Recordatorios Fisioanimal

## Qué es

Sistema automatizado que prepara el recordatorio de cada cita para las clientas de Andrea (fisioterapeuta canina). La vía principal es **WhatsApp**: cada mañana se genera una pestaña con un enlace `wa.me` por cita que Andrea abre y envía. Como **email de seguridad**, envía correos HTML (con el logo de Fisioanimal) a las clientas sin teléfono a las 10:00 y a quien no se haya avisado a las 22:00. Funciona 100% dentro del ecosistema de Google (Sheets + Calendar + Gmail + Drive) sin necesidad de servidores externos.

## Por qué existe

Andrea agendaba sus citas en una agenda física pero no tenía un sistema para recordar a sus clientas. Las clientas olvidaban las citas o llegaban con desfase. Este sistema elimina ese problema automáticamente: lee las citas que Andrea mete en Google Calendar y prepara el aviso por WhatsApp (o email, si no hay teléfono).

## Cómo funciona (resumen)

1. Andrea crea una cita en Google Calendar con el nombre del perro como título
2. El script busca automáticamente al tutor del perro en la base de datos (Google Sheets)
3. Prepara la pestaña "WhatsApp" con un enlace `wa.me` por cita (y envía email a las clientas sin teléfono)
4. A las 22:00 refresca la pestaña y envía email de refuerzo a quien sigue sin avisar
5. Si falta información (teléfono, ficha), avisa a quien gestiona el sistema

## Para quién es

- **Andrea**: fisioterapeuta canina. Agenda citas en su agenda física y en Google Calendar (para que el sistema las lea). Mantiene su base de clientes en Google Sheets.
- **Gestor(a)**: la persona que instaló y mantiene el sistema. Recibe los resúmenes diarios y resuelve incidencias.
