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
| A2 | Crear pestaña "Clientes" con cabeceras | ⏳ | Cabeceras fila 1: `Perro/a \| Tutor/a \| Nombre de pila \| Email \| Teléfono \| Notas` |
| A3 | Rellenar datos reales de clientas | ⏳ | **Puntos críticos:** (1) el nombre del perro en la hoja DEBE coincidir con cómo lo escribe Andrea en Calendar; (2) rellena "Nombre de pila" para nombres compuestos (María José, Juan Carlos…) o el email saludará mal |
| A4 | Crear pestaña "Log" con cabeceras | ⏳ | Cabeceras fila 1: `Fecha \| Perro \| Tutor \| Email \| Estado \| Hora cita \| Ejecutado \| Id Evento` (la última la rellena el script) |
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
| C2 | Borrar código por defecto → pegar `recordatorios.js` | ⏳ | Usar la versión con CONFIG, deduplicación por ID de evento y alerta de errores |
| C3 | Cambiar `EMAIL_RESUMEN` al email de Andrea | ⏳ | En el bloque `CONFIG` al principio del script, o vía Script properties |
| C4 | Cambiar `LOGO_DRIVE_ID` al ID de Drive de Andrea | ⏳ | En el bloque `CONFIG`, o vía Script properties (mismo ID del Paso B1) |
| C5 | (Opcional) Definir Script properties | ⏳ | ⚙️ Project Settings → Script properties: `EMAIL_RESUMEN`, `LOGO_DRIVE_ID`. Así no tocas el código al desplegar |
| C6 | Guardar → Ejecutar ▶️ | ⏳ | Primera ejecución: pedirá permisos ("Avanzado" → "Ir a..." → "Permitir") |
| C7 | Verificar que llega email-resumen a Andrea | ⏳ | Si no llega, revisar permisos de Gmail |

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
| E6 | Probar dos citas del mismo perro mismo día | ⏳ | Crear "Luna" a las 10:00 y "Luna" a las 17:00 → deben enviarse los DOS recordatorios (la deduplicación es por ID de evento, no por nombre) |
| E7 | Probar la alerta de fallo | ⏳ | Renombra la pestaña "Clientes" temporalmente → ejecuta → debe llegar un email de "⚠️ Error en recordatorios Fisioanimal". Restaura el nombre después |

---

## 7. Puesta en producción

| # | Tarea | Estado | Notas |
|---|---|---|---|
| F1 | Borrar Log de pruebas | ⏳ | Limpiar antes de empezar en serio. Necesario si actualizas desde una versión antigua del script (la nueva deduplicación usa el ID del evento) |
| F2 | Dejar solo datos reales en "Clientes" | ⏳ | Quitar los 5 registros ficticios |
| F3 | Confirmar que los triggers están activos | ⏳ | En Apps Script → Triggers, deben aparecer los dos |

---

## 8. Riesgos conocidos

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Andrea escribe mal el nombre del perro | Media | El script tiene fuzzy matching (un solo error de teclado) |
| Andrea tiene dos citas del mismo perro el mismo día | Media | La deduplicación ahora es por ID de evento de Calendar, no por nombre: cada cita es independiente |
| Andrea usa un formato distinto en Calendar ("Toby post-op" vs "Toby") | Alta | Acordar convención de nombres antes de empezar |
| Gmail bloquea envíos por spam | Baja | 500 emails/día, bien para un negocio pequeño |
| Google revoca permisos del script | Muy baja | Volver a autorizar en Apps Script |
| Andrea no acepta los permisos la primera vez | Media | Guiarla paso a paso: "Avanzado" → "Ir a... (no seguro)" → "Permitir" |
| El script falla (falta una pestaña, ID de logo mal) | Media | Ahora hay try/catch global: el gestor recibe un email de alerta con el error en vez de silencio |
| Logo no carga (ID incorrecto o archivo borrado) | Baja | El script envía sin logo (no rompe) y el resumen avisa con un ⚠️ para que se corrija el ID |
| Nombres compuestos mal saludados (María José) | Media | Nueva columna "Nombre de pila" (C); si se rellena, el saludo es correcto |

---

## 9. Archivos del proyecto

| Archivo | Qué es | Estado |
|---|---|---|
| `scripts/recordatorios.js` | Script con CONFIG, dedup por ID de evento, alerta de errores, resumen siempre | ✅ Actualizado |
| `tests/test-recordatorios.js` | Pruebas de funciones puras (46 tests, ejecutables con `node`) | ✅ Actualizado |
| `docs/INSTALACION.md` | Guía paso a paso de instalación | ✅ Actualizada |
| `docs/TAREAS-PENDIENTES.md` | Este documento | ✅ Creado |
| `docs/okf/` | Documentación técnica del proyecto | ✅ Completa |
| `logo_fisioanimal_transparent.png` | Logo para el email | ✅ Listo |
| `logo_fisioanimal.jpeg` | Logo original | ✅ Archivo histórico |
