---
type: Decision
title: Por qué Google Apps Script y no n8n
description: Decisión técnica de usar Apps Script en lugar de n8n u otras alternativas
tags: [decision, google-apps-script, n8n, arquitectura]
generated:
  by: opencode/okf-skill
  at: 2026-08-23T18:20:00Z
status: draft
---

# Decisión: Google Apps Script vs alternativas

## Contexto

Se necesitaba un sistema de recordatorios automáticos por email para dos negocios pequeños (Andrea: fisioterapia canina, Lola: psicología online). Requisitos:
- 100% gratis
- Interfaz amigable para ellas (nada técnico)
- Configurado por una tercera persona (el/la gestor/a)
- Cero mantenimiento para las dueñas

## Alternativas evaluadas

| Alternativa | Coste | Mantenimiento | Interfaz para ellas | Veredicto |
|---|---|---|---|---|
| **Google Apps Script** | 0 € siempre | Cero (Google lo ejecuta) | Ya usan Google (Calendar, Gmail) | ✅ **Elegida** |
| n8n Cloud Free | 0 € | Bajo (gestionado) | Dashboard n8n (necesita aprendizaje) | ❌ Fricción innecesaria |
| n8n self-hosted (VPS gratis) | 0 € (Oracle ARM) | Alto (sysadmin) | Dashboard n8n | ❌ Demasiado trabajo |
| n8n self-hosted (VPS de pago) | 5 €/mes | Medio (sysadmin) | Dashboard n8n | ❌ Coste innecesario |
| Make/Zapier Free | 0 € | Bajo | Dashboard de la plataforma | ❌ Límites muy bajos |

## Criterios de decisión

1. **Coste total de propiedad**: Apps Script = 0 € para siempre, sin sorpresas
2. **Curva de aprendizaje**: las amigas ya usan Google Calendar y Gmail; no necesitan aprender nada nuevo
3. **Mantenimiento**: Google gestiona servidores, updates, SSL, uptime. Cero carga para el gestor
4. **Simplicidad**: un solo ecosistema (Google), sin conectar servicios externos
5. **Escalabilidad futura**: si crece, se puede migrar a n8n/VPS; el diseño de datos (Sheets + Calendar) es transferible

## Consecuencias

### Positivas
- Cero coste para siempre
- Cero mantenimiento de infraestructura
- Las amigas no necesitan aprender nada nuevo
- El gestor puede manejar todo desde cualquier navegador

### Negativas
- Limitado a 500 emails/día (Gmail personal)
- Sin interfaz web personalizada (usamos Calendar y Sheets nativos)
- Apps Script no tiene alertas en tiempo real (usamos email-resumen)
- Si Google cambia la API de Apps Script, hay que adaptar

## Decisión

**Google Apps Script** es la solución correcta para este tamaño de negocio. Si en el futuro se necesita escalar (más de 500 emails/día, múltiples negocios, interfaz personalizada), se evaluará migrar a n8n self-hosted.
