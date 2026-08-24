---
type: Overview
title: Recordatorios Fisioanimal
description: Sistema de recordatorios automáticos por email HTML para clientas de fisioterapia canina
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

Sistema automatizado que envía emails de recordatorio en HTML a las clientas de Andrea (fisioterapeuta canina) antes de cada cita. Los correos incluyen el logo de Fisioanimal incrustado. Funciona 100% dentro del ecosistema de Google (Sheets + Calendar + Gmail + Drive) sin necesidad de servidores externos.

## Por qué existe

Andrea agendaba sus citas en Google Calendar pero no tenía un sistema para recordar a sus clientas. Las clientas olvidaban las citas o llegaban con desfase. Este sistema elimina ese problema automáticamente.

## Cómo funciona (resumen)

1. Andrea crea una cita en Google Calendar con el nombre del perro como título
2. El script busca automáticamente al tutor del perro en la base de datos (Google Sheets)
3. Envía un email HTML de recordatorio al tutor con fecha, hora, nombre del perro y logo
4. Si falta información (email, ficha), avisa a quien gestiona el sistema

## Para quién es

- **Andrea**: fisioterapeuta canina. Usa el sistema para agendar citas (Calendar) y mantener su base de clientes (Sheets).
- **Gestor(a)**: la persona que instaló y mantiene el sistema. Recibe los resúmenes diarios y resuelve incidencias.
