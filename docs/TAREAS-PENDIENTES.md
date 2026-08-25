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

> **Leyenda de estados:**
> - ✅ Pruebas = validado en la cuenta de prueba (el mecanismo funciona). Habrá que repetirlo en la cuenta de Andrea al desplegar.
> - ⏳ Pruebas = pendiente de probar en tu cuenta de prueba (puedes hacerlo ya, sin necesitar a Andrea).
> - ⏳ Andrea = necesita los datos o la cuenta de Andrea (no se puede hacer todavía).
> - 🔨 Parcial = parte hecha y parte pendiente.

---

## 1. Datos que faltan de Andrea

| Dato | Estado | Notas |
|---|---|---|
| Email de Andrea (para `EMAIL_RESUMEN` y `EMAIL_ALERTA_ANDREA`) | ⏳ Andrea | Su mismo email vale para el resumen diario y para los avisos simples de error |
| Lista de clientas con datos reales | ⏳ Andrea | Nombre del perro, nombre del tutor, email del tutor, teléfono (opcional), notas (opcional) |
| ¿Andrea usa Gmail o Workspace? | ⏳ Andrea | Afecta límites de envío (Gmail: 500/día, Workspace: mayor) |

---

## 2. Base de datos en Google Sheets (lo crea la alumna)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| A1 | Crear hoja de cálculo en sheets.google.com | ✅ Pruebas | Hoja de prueba creada. En Andrea: crear "Fisioanimal Recordatorios" |
| A2 | Crear pestaña "Clientes" con cabeceras | ✅ Pruebas | Cabeceras fila 1: `Perro/a \| Tutor/a \| Nombre de pila (saludo) \| Email \| Teléfono \| Notas` |
| A3 | Rellenar datos reales de clientas | ⏳ Andrea | **Puntos críticos:** (1) el nombre del perro en la hoja DEBE coincidir con cómo lo escribe Andrea en Calendar; (2) rellena "Nombre de pila (saludo)" para que el saludo del email sea correcto (es la palabra con la que quieres que empiece: "María José", "Laura"…) o se cortará |
| A4 | Crear pestaña "Log" con cabeceras | ✅ Pruebas | Cabeceras fila 1: `Fecha \| Perro \| Tutor \| Email \| Estado \| Hora cita \| Ejecutado \| Id Evento` (la última la rellena el script) |
| A5 | Compartir la hoja contigo (gestor) | ⏳ Andrea | Permisos de "Editor" para que puedas pegar el script. En pruebas no aplica (es tu propia cuenta) |

### Convención de nombres de perros

El nombre del perro es la **clave de búsqueda**. Para que funcione:
- Andrea escribe "Toby" en Calendar → en la hoja debe poner "Toby" (columna A)
- Si Andrea escribe "Toby (post-op)" en Calendar, el script busca "toby (post-op)" y no encontraría "toby". **Acordad una regla clara.**
- El script tiene tolerancia a errores de escritura (un solo fallo de teclado), pero no a diferencias de formato.

---

## 3. Cuenta de Google de Andrea (lo hace la alumna o Andrea)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| B1 | Subir `logo_fisioanimal_transparent.png` a Drive de Andrea | ⏳ Andrea | Copiar el ID de la URL del archivo subido |
| B2 | Enviar el `LOGO_DRIVE_ID` nuevo | ⏳ Andrea | Yo actualizo el script con el nuevo ID |
| B3 | Dar permisos de acceso al gestor | ⏳ Andrea | Compartir hoja y/o Calendar con la cuenta que gestiona el sistema |

---

## 4. Instalación del script (lo hace la alumna o Andrea)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| C1 | Abrir la hoja → Extensiones → Apps Script | ✅ Pruebas | **Tiene** que abrirse desde la hoja, no desde script.google.com |
| C2 | Borrar código por defecto → pegar `recordatorios.js` | ✅ Pruebas | Última versión pegada (con CONFIG, dedup por ID de evento, alerta dual y `mensajeSimpleError`) |
| C3 | Cambiar `EMAIL_RESUMEN` al email de Andrea | ⏳ Andrea | En pruebas se usa el email de la alumna. En Andrea: en `CONFIG` o vía Script properties |
| C4 | Cambiar `LOGO_DRIVE_ID` al ID de Drive de Andrea | ✅ Pruebas | En pruebas usa el ID de tu Drive. En Andrea: ID del Paso B1 |
| C5 | (Opcional) Definir Script properties | ⏳ Andrea | ⚙️ Project Settings → Script properties. Para desplegar en Andrea sin tocar código: `EMAIL_RESUMEN`, `EMAIL_ALERTA_ANDREA`, `LOGO_DRIVE_ID`. Ver tarea G2 con instrucciones detalladas |
| C6 | Guardar → Ejecutar ▶️ | ✅ Pruebas | En pruebas ya ejecutado y con permisos concedidos. En Andrea: pedirá permisos ("Avanzado" → "Ir a..." → "Permitir") |
| C7 | Verificar que llega email-resumen a Andrea | ✅ Pruebas | Llegó en las pruebas. En Andrea: confirmar que llega a su email |

---

## 5. Triggers automáticos (lo hace la alumna o Andrea)

| # | Tarea | Estado | Notas |
|---|---|---|---|
| D1 | Crear trigger: 10:00 diario | ✅ Pruebas | Creado. Función: `enviarRecordatorios`, Tipo: Diario, Hora: 10:00, TZ: Europe/Madrid |
| D2 | Crear trigger: 20:00 diario | ✅ Pruebas | Creado. Igual que D1 pero a las 20:00 |

---

## 6. Pruebas con datos reales

| # | Tarea | Estado | Notas |
|---|---|---|---|
| E1 | Crear 2-3 eventos de prueba en Calendar de Andrea | ✅ Pruebas | Eventos de prueba creados y procesados |
| E2 | Ejecutar script manualmente (▶️) | ✅ Pruebas | Ejecutado; los recordatorios llegaron |
| E3 | Revisar hoja Log | ✅ Pruebas | El Log registró los envíos |
| E4 | Verificar email-resumen | ✅ Pruebas | Llegó el resumen con el conteo |
| E5 | Probar caso de error (perro no existente) | ⏳ Pruebas | No confirmado todavía. Crear evento con un perro NO existente → comprobar "Sin ficha" en Log |
| E6 | Probar dos citas del mismo perro mismo día | ✅ Pruebas | Confirmado: llegaron los DOS recordatorios (dedup por ID de evento funciona) |
| E7 | Probar la alerta de fallo | ✅ Pruebas | Confirmado: llegaron los 2 emails (técnico al gestor + simple con pasos, simulando a Andrea con `EMAIL_ALERTA_ANDREA`). Renombró "Clientes" a "ClientesX" y restauró después |

---

## 7. Puesta en producción

| # | Tarea | Estado | Notas |
|---|---|---|---|
| F1 | Borrar Log de pruebas | ✅ Pruebas | Borrado al actualizar a la nueva versión (necesario: la nueva dedup usa el ID del evento) |
| F2 | Dejar solo datos reales en "Clientes" | ⏳ Andrea | Quitar los registros ficticios y meter los reales de Andrea |
| F3 | Confirmar que los triggers están activos | ✅ Pruebas | Los dos triggers aparecen en Apps Script → Triggers |

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
| Nombres compuestos mal saludados (María José) | Media | Nueva columna "Nombre de pila (saludo)" (C); si se rellena, el saludo es correcto |

---

## 9. Archivos del proyecto

| Archivo | Qué es | Estado |
|---|---|---|
| `scripts/recordatorios.js` | Script con CONFIG, dedup por ID de evento, alerta de errores, resumen siempre | ✅ Actualizado |
| `tests/test-recordatorios.js` | Pruebas de funciones puras (54 tests, ejecutables con `node`) | ✅ Actualizado |
| `docs/INSTALACION.md` | Guía paso a paso de instalación | ✅ Actualizada |
| `docs/TAREAS-PENDIENTES.md` | Este documento | ✅ Creado |
| `docs/okf/` | Documentación técnica del proyecto | ✅ Completa |
| `logo_fisioanimal_transparent.png` | Logo para el email | ✅ Listo |
| `logo_fisioanimal.jpeg` | Logo original | ✅ Archivo histórico |

---

## 10. Mejoras para cuando esté la cuenta de Andrea

| # | Mejora | Estado | Notas |
|---|---|---|---|
| G1 | El email de "⚠️ Error" también a Andrea | 🔨 Parcial | **Validado en pruebas** (llegaron los 2 correos: técnico al gestor + simple con pasos a "Andrea"). La parte del mensaje está terminada: `mensajeSimpleError()` da pasos concretos para los errores que ella puede arreglar (hoja "Clientes"/"Log" renombrada) y deriva al gestor solo para los que no. **Solo falta el email de Andrea** para activarlo en producción: basta con rellenar `EMAIL_ALERTA_ANDREA` (en `CONFIG` o por Script properties, ver G2). |
| G2 | Configurar email de Andrea por Script properties (opción B) | ⏳ Andrea | Para desplegar en la cuenta de Andrea **sin tocar el código**. Pasos: (1) En Apps Script, clic en ⚙️ **Project Settings** (barra izquierda). (2) Busca la sección **"Script properties"** → botón **"Edit script properties"** (o **"Add property"**). (3) Añade una fila por cada propiedad: nombre `EMAIL_RESUMEN` + valor = email de Andrea; otra `EMAIL_ALERTA_ANDREA` + valor = email de Andrea; otra `LOGO_DRIVE_ID` + valor = ID del logo en el Drive de Andrea. (4) Guarda. El script las leerá automáticamente (`obtenerConfig()`) y ya no hace falta editar el `CONFIG`. Así el mismo `.js` sirve para cualquier cuenta sin modificarse. |
