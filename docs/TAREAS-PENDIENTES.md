---
type: Checklist
title: Tareas pendientes — Puesta en producción
description: Todo lo que falta para que la automatización funcione en la cuenta de Andrea
tags: [checklist, pendiente, despliegue]
generated:
  by: opencode
  at: 2026-08-25
status: pending
---

# Tareas pendientes — Puesta en producción

> Documento vivo. Se actualiza a medida que se completen las tareas.

---

## 1. Datos que faltan de Andrea

| Dato | Estado | Notas |
|---|---|---|
| Email de Andrea (para `EMAIL_RESUMEN`) | ⏳ Pendiente | Necesito su email exacto para actualizar el script |
| Lista de clientas con datos reales | ⏳ Pendiente | Nombre del perro, nombre del tutor, email del tutor, teléfono (opcional), notas (opcional) |
| ¿Andrea usa Gmail o Workspace? | ⏳ Pendiente | Afecta límites de envío (Gmail: 500/día, Workspace: mayor) |

---

## 2. Base de datos en Google Sheets (lo crea la alumna)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| A1 | Crear hoja de cálculo en sheets.google.com | ⏳ | Nombre sugerido: "Fisioanimal Recordatorios" |
| A2 | Crear pestaña "Clientes" con cabeceras | ⏳ | Cabeceras fila 1: `Perro/a \| Tutor/a \| Email \| Teléfono \| Notas` |
| A3 | Rellenar datos reales de clientas | ⏳ | **Punto crítico:** el nombre del perro en la hoja DEBE coincidir con cómo lo escribe Andrea en Calendar |
| A4 | Crear pestaña "Log" con cabeceras | ⏳ | Cabeceras fila 1: `Fecha \| Perro \| Tutor \| Email \| Estado \| Hora cita \| Ejecutado` |
| A5 | Compartir la hoja contigo (gestor) | ⏳ | Permisos de "Editor" para que puedas pegar el script |

### Convención de nombres de perros

El nombre del perro es la **clave de búsqueda**. Para que funcione:
- Andrea escribe "Toby" en Calendar → en la hoja debe poner "Toby" (columna A)
- Si Andrea escribe "Toby (post-op)" en Calendar, el script busca "toby (post-op)" y no encontraría "toby". **Acordad una regla clara.**
- El script tiene tolerancia a errores de escritura (un solo fallo de teclado), pero no a diferencias de formato.

---

## 3. Cuenta de Google de Andrea (lo hace la alumna o Andrea)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| B1 | Subir `logo_fisioanimal_transparent.png` a Drive de Andrea | ⏳ | Copiar el ID de la URL del archivo subido |
| B2 | Enviar el `LOGO_DRIVE_ID` nuevo | ⏳ | Yo actualizo el script con el nuevo ID |
| B3 | Dar permisos de acceso al gestor | ⏳ | Compartir hoja y/o Calendar con la cuenta que gestiona el sistema |

---

## 4. Instalación del script (lo hace la alumna o Andrea)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| C1 | Abrir la hoja → Extensiones → Apps Script | ⏳ | **Tiene** que abrirse desde la hoja, no desde script.google.com |
| C2 | Borrar código por defecto → pegar `recordatorios.js` | ⏳ | Usar la versión actualizada con fuzzy matching |
| C3 | Cambiar `EMAIL_RESUMEN` al email de Andrea | ⏳ | O esperar a que yo lo actualice con el ID correcto |
| C4 | Cambiar `LOGO_DRIVE_ID` al ID de Drive de Andrea | ⏳ | O esperar a que yo lo actualice |
| C5 | Guardar → Ejecutar ▶️ | ⏳ | Primera ejecución: pedirá permisos ("Avanzado" → "Ir a..." → "Permitir") |
| C6 | Verificar que llega email-resumen a Andrea | ⏳ | Si no llega, revisar permisos de Gmail |

---

## 5. Triggers automáticos (lo hace la alumna o Andrea)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| D1 | Crear trigger: 10:00 diario | ⏳ | Función: `enviarRecordatorios`, Tipo: Diario, Hora: 10:00, TZ: Europe/Madrid |
| D2 | Crear trigger: 20:00 diario | ⏳ | Igual pero a las 20:00 |

---

## 6. Pruebas con datos reales

| # | Tarea | Estado | Notas |
|---|---|---|---|
| E1 | Crear 2-3 eventos de prueba en Calendar de Andrea | ⏳ | Usar nombres de perros que estén en la hoja "Clientes" |
| E2 | Ejecutar script manualmente (▶️) | ⏳ | Verificar que llegan emails de recordatorio |
| E3 | Revisar hoja Log | ⏳ | Comprobar que se registraron envíos |
| E4 | Verificar email-resumen | ⏳ | Debe llegar el conteo de enviados / sin email / sin ficha |
| E5 | Probar caso de error | ⏳ | Crear evento con un perro NO existente → comprobar "Sin ficha" en Log |

---

## 7. Puesta en producción

| # | Tarea | Estado | Notas |
|---|---|---|---|
| F1 | Borrar Log de pruebas | ⏳ | Limpiar antes de empezar en serio |
| F2 | Dejar solo datos reales en "Clientes" | ⏳ | Quitar los 5 registros ficticios |
| F3 | Confirmar que los triggers están activos | ⏳ | En Apps Script → Triggers, deben aparecer los dos |

---

## 8. Riesgos conocidos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Andrea escribe mal el nombre del perro | Media | El script ahora tiene fuzzy matching (un solo error de teclado) |
| Andrea usa un formato distinto en Calendar ("Toby post-op" vs "Toby") | Alta | Acordar convención de nombres antes de empezar |
| Gmail bloquea envíos por spam | Baja | 500 emails/día, bien para un negocio pequeño |
| Google revoca permisos del script | Muy baja | Volver a autorizar en Apps Script |
| Andrea no acepta los permisos la primera vez | Media | Guiarla paso a paso: "Avanzado" → "Ir a... (no seguro)" → "Permitir" |
| Logo no carga (ID incorrecto o archivo borrado) | Baja | El script envía sin logo (no rompe), pero hay que corregir el ID |

---

## 9. Archivos del proyecto

| Archivo | Qué es | Estado |
|---|---|---|
| `scripts/recordatorios.js` | Script completo con fuzzy matching | ✅ Actualizado |
| `docs/INSTALACION.md` | Guía paso a paso de instalación | ✅ Lista |
| `docs/TAREAS-PENDIENTES.md` | Este documento | ✅ Creado |
| `docs/okf/` | Documentación técnica del proyecto | ✅ Completa |
| `logo_fisioanimal_transparent.png` | Logo para el email | ✅ Listo |
| `logo_fisioanimal.jpeg` | Logo original | ✅ Archivo histórico |
