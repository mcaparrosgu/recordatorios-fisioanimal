---
type: Guía
title: Preparar la reunión con Andrea — Guía para la gestora
description: Checklist, guion y configuración técnica completa para desplegar el sistema en la cuenta de Andrea en una sola sesión
tags: [reunión, andrea, despliegue, checklist, configuración]
generated:
  by: opencode
  at: 2026-09-24
status: pending
---

# Preparar la reunión con Andrea — Guía para la gestora

> **Para qué sirve:** esta es tu chuleta. Recoge todo lo que tienes que hacer **tú** antes, durante y después de la reunión para dejar el sistema funcionando en la cuenta de Andrea.
>
> **Diferencia con los demás documentos:**
> - `HOJA-RUTA-ANDREA.md` → el plan por fases y el guion extendido.
> - `GUIA-CUENTA-GOOGLE-ANDREA.md` → guía para *Andrea* (crear su cuenta y entender el sistema).
> - `HOJA-ANDREA-1PAGINA.md` → resumen de 1 página para *Andrea*.
> - **Este documento** → lo que haces *tú*, paso a paso, con los valores y comandos exactos.

> **Cómo funciona el sistema (para que no se te olvide):**
> - **10:00** → `enviarRecordatorios` prepara la pestaña **"WhatsApp"** (un enlace `wa.me` por cita) y envía email solo a las clientas **sin teléfono**.
> - **Andrea** (por la tarde) → abre la pestaña, toca el nombre del perro, se abre WhatsApp con el mensaje, envía y marca ✅.
> - **22:00** → `enviarRecordatoriosRefuerzo` refresca la pestaña (respetando los ✅) y envía **email de refuerzo** a quien tiene teléfono pero sigue sin marcar.
> - La deduplicación es por **ID del evento de Calendar** (no por nombre de perro).

---

## 0. Lo mínimo que tienes que tener claro

| Concepto | En una frase |
|---|---|
| De dónde salen las citas | Del **Google Calendar** de Andrea (no de su agenda física) |
| Cómo identifica al cliente | Por el **título del evento** = nombre del perro |
| Dónde está el cliente | Pestaña **"Clientes"** de su Google Sheet |
| Cómo se avisa | **WhatsApp** (principal) + **email** de seguridad |
| Quién recibe el resumen | Tú (`EMAIL_RESUMEN`) |
| Quién recibe avisos simples de error | Andrea (`EMAIL_ALERTA_ANDREA`), si lo rellenas |

---

## 1. Antes de la reunión (tú sola) — checklist

| ✅ | Tarea | Cómo |
|---|---|---|
| ☐ | Pasar los tests | `node tests/test-recordatorios.js` → deben pasar **97/97** |
| ☐ | Tener el script listo para pegar | `scripts/recordatorios.js` (cópialo a un sitio a mano: pendrive, correo, portapapeles) |
| ☐ | Tener el logo listo | `logo_fisioanimal_transparent.png` |
| ☐ | Decidir si creas tú la cuenta de Google o la crea ella | Recomendado: **la creas tú** `fisioanimal.recordatorios@gmail.com` y ella solo introduce el código SMS |
| ☐ | Repasar la convención de nombres | Ver Fase 2c de `HOJA-RUTA-ANDREA.md` y la sección 4 de aquí |
| ☐ | Leer esta guía entera una vez | Para no improvisar delante de ella |

> ⚠️ **Lo que NO puedes hacer desde tu cuenta:** pegar el script, crear los triggers y aceptar permisos tienen que hacerse **en la cuenta de Andrea** (ella delante, tú guiando). No se puede "instalar desde fuera".

---

## 2. Datos que necesitas de Andrea (pídelos por adelantado, por WhatsApp)

| Dato | Para qué |
|---|---|
| **Email de Andrea** | Rellenar `EMAIL_RESUMEN` y `EMAIL_ALERTA_ANDREA` |
| **Email que quiera para su cuenta de Google** | O le propones `fisioanimal.recordatorios@gmail.com` |
| **Lista de clientas**: perro, tutor/a, **nombre de pila (saludo)**, email, **teléfono** | Rellenar la pestaña "Clientes". El **teléfono es imprescindible** para el WhatsApp |
| **Que verifique la cuenta** (si la creas tú) | Solo introducir el código que Google manda por SMS |

> 💡 Muchas clientas no tendrán email o teléfono: rellena lo que haya. Sin teléfono → se le manda email; sin ninguno de los dos → sale "Sin ficha" y lo revisas.

---

## 3. Guion de la reunión (60-90 min)

### 3.1. Explicar en 1 minuto (5 min)
Dile: *"Te voy a montar un sistema que prepara el aviso de cada cita para que lo mandes por WhatsApp el día antes. Cada mañana tendrás la lista en una hoja: tocas el perro y se abre WhatsApp con el mensaje escrito. Por la noche, a quien no hayas avisado, le llega un email. Tú solo metes las citas en el calendario del móvil."*
(Frase completa en `HOJA-RUTA-ANDREA.md`, Fase 2a.)

### 3.2. Cuenta de Google (10 min)
- Si ya está creada y verificada, salta al 3.3.
- Si no: crear `fisioanimal.recordatorios@gmail.com` (instrucciones en `GUIA-CUENTA-GOOGLE-ANDREA.md`, Parte 2).
- Que la verifique con el SMS. **No sigas hasta que la cuenta funcione.**

### 3.3. Hoja de cálculo (15 min)
1. Con la cuenta de Andrea → **sheets.google.com** → hoja nueva → llamarla **"Fisioanimal Recordatorios"**.
2. Renombrar la primera pestaña a **`Clientes`** y poner cabeceras en la fila 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Perro/a | Tutor/a | Nombre de pila (saludo) | Email | Teléfono | Notas |

3. Crear pestaña **`Log`** con cabeceras:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Fecha | Perro | Tutor | Email | Estado | Hora cita | Ejecutado | Id Evento |

> La pestaña **"WhatsApp"** la crea el script sola en la primera ejecución. No hace falta crearla.

4. **Rellenar los datos reales** (esto es lo que más tiempo lleva; si puedes, tenlo ya preparado para pegar).
   - **Columna C obligatoria** cuando el nombre es compuesto ("María José", no "María").
   - **Teléfono** en formato español (9 dígitos sirve; el script añade el prefijo `34`).
5. Compartir contigo como **Editor** (botón Compartir).

### 3.4. Logo a su Drive (5 min)
1. drive.google.com (cuenta de Andrea) → subir `logo_fisioanimal_transparent.png`.
2. Abrir el archivo → copiar el **ID** de la URL: `.../file/d/`**`ID`**`/view`.
3. Apúntalo para el paso 3.5.

### 3.5. Pegar el script y configurar (15 min)
1. En la hoja de Andrea → **Extensiones → Apps Script** (¡desde la hoja, no desde script.google.com!).
2. Borrar el código por defecto → **pegar `scripts/recordatorios.js`** → Guardar.
3. Configurar por **Script properties** (⚙️ Project Settings → Script properties), **sin tocar el código**:

| Propiedad | Valor |
|---|---|
| `EMAIL_RESUMEN` | El email de Andrea |
| `EMAIL_ALERTA_ANDREA` | El email de Andrea (avisos simples de error) |
| `LOGO_DRIVE_ID` | El ID copiado en 3.4 |
| `TZ` | `Europe/Madrid` (opcional, es el valor por defecto) |
| `HOJA_CLIENTES` / `HOJA_LOG` / `HOJA_WHATSAPP` | Solo si les pones otro nombre a las pestañas |
| `SPREADSHEET_ID` | Solo si el script se ejecuta desde fuera de la hoja (normalmente vacío) |
| `PREFIJO_TELEFONO` | `34` (opcional, es el valor por defecto) |

4. Ejecutar ▶️ `enviarRecordatorios` una vez → aceptar permisos: **"Avanzado" → "Ir a … (no seguro)" → "Permitir"**.

### 3.6. Triggers (5 min)
⏰ icono **Triggers** → crear dos, ambos **Time-driven → Day timer**:

| Función | Hora | Zona |
|---|---|---|
| `enviarRecordatorios` | 10:00 | `Europe/Madrid` |
| `enviarRecordatoriosRefuerzo` | 22:00 | `Europe/Madrid` |

### 3.7. Prueba en directo (10 min)
1. Andrea (o tú con su cuenta) crea **un evento para mañana** en Calendar, título = un perro real de la hoja.
2. Ejecutar ▶️ `enviarRecordatorios`.
3. Comprobar: aparece la pestaña **"WhatsApp"** con una fila y el **nombre del perro como enlace**.
4. Tocar el nombre → WhatsApp se abre con el mensaje → enviar → marcar ✅.
5. Ver la fila en **Log** y que llega el **email-resumen**.

### 3.8. Cierre y acuerdos (5 min)
- Que Andrea entienda: **citas van al Calendar** y **título = nombre del perro**.
- Entrega y repasa la **`HOJA-ANDREA-1PAGINA.md`**.
- Apunta **por escrito** la convención de nombres acordada (con un ejemplo real).

---

## 4. Convención de nombres (lo que hay que fijar con ella)

**Regla general:** el título del evento = **solo el nombre del perro** (`Toby`).

**Excepción — perros con el mismo nombre:** añade el nombre del tutor (`Luna María`). El separador da igual: espacio, coma, guion o guion bajo (`Luna María`, `Luna, María`, `Luna-María`, `Luna_María`). Si solo pone "Luna" habiendo varias, el sistema lo marca como **"Sin ficha"** (a propósito, para no avisar a la clienta equivocada).

| En Calendar | Resultado |
|---|---|
| `Toby` | ✅ Le llega |
| `toby` / `To by` | ✅ Tolerancia a mayúsculas y a 1 fallo de teclado |
| `Luna María` (perro repetido) | ✅ Va a la Luna de María |
| `Luna` (con varias "Luna") | ⚠️ "Sin ficha" — hay que añadir el tutor |
| `Toby post-op` | ❌ No le llega — la aclaración va en la **descripción** |

---

## 5. Verificación final (checklist de cierre)

| ✅ | Comprobación |
|---|---|
| ☐ | Cuenta de Google de Andrea activa y verificada |
| ☐ | Hoja "Fisioanimal Recordatorios" creada y compartida contigo como Editor |
| ☐ | Pestañas `Clientes` y `Log` con sus cabeceras |
| ☐ | Datos reales en `Clientes` (columna C y **teléfono** rellenos) |
| ☐ | Logo subido y `LOGO_DRIVE_ID` configurado |
| ☐ | Script pegado desde la hoja (no desde script.google.com) |
| ☐ | Script properties configuradas (`EMAIL_RESUMEN`, `EMAIL_ALERTA_ANDREA`, `LOGO_DRIVE_ID`) |
| ☐ | Permisos aceptados ("Avanzado" → "Ir a…" → "Permitir") |
| ☐ | Dos triggers creados: `enviarRecordatorios` 10:00 y `enviarRecordatoriosRefuerzo` 22:00 |
| ☐ | Prueba en directo superada (pestaña WhatsApp + Log + email-resumen) |
| ☐ | Convención de nombres acordada y **anotada** |
| ☐ | Andrea tiene su resumen de 1 página |

---

## 6. Después de la reunión (tú sola)

1. Actualizar **`docs/TAREAS-PENDIENTES.md`**: marcar lo completado y rellenar los datos que ya tengas (sección 1).
2. Anotar en la **bitácora** (`docs/bitacora.md`, si existe) lo acordado, sobre todo la **convención de nombres** y el **email de Andrea**.
3. Si al final no diste el email de Andrea en `EMAIL_ALERTA_ANDREA`, hazlo cuando lo tengas: es el único fleco que queda para activar el aviso simple de error (tarea **G1**).
4. (Opcional) Regenerar los **Google Docs formateados** si ha cambiado algo de las guías.

---

## 7. Problemas típicos y solución

| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `getActiveSpreadsheet()` devuelve null | Se abrió Apps Script desde script.google.com suelto | Abrir siempre desde la hoja: **Extensiones → Apps Script** |
| El evento sale como "⚠️ Sin ficha" | El título no coincide con ningún perro de "Clientes" | Revisar la convención de nombres (sección 4) |
| No llega nada a una clienta | Sin teléfono ni email en "Clientes" | Rellenar al menos uno de los dos |
| Andrea escribe solo "Luna" y hay varias | Falta el nombre del tutor | Que lo añada: `Luna María` |
| `TypeError: ... is not a function` en `setRichTextValues` / `setCheckboxes` | Runtime V8 antiguo | No es un bug: el script ya usa las alternativas compatibles (`HYPERLINK` + `DataValidation`) |
| El email llega sin logo | `LOGO_DRIVE_ID` incorrecto o archivo borrado | Volver a copiar el ID (no rompe nada: el email se envía igual) |
| No le llega el email-resumen | `EMAIL_RESUMEN` vacío o mal escrito | Revisar Script properties |
| "Error no verificada" al autorizar | Normal en scripts propios | "Avanzado" → "Ir a … (no seguro)" → "Permitir" |

---

## 8. Referencias

- [`docs/HOJA-RUTA-ANDREA.md`](HOJA-RUTA-ANDREA.md) — plan por fases y guion extendido
- [`docs/GUIA-CUENTA-GOOGLE-ANDREA.md`](GUIA-CUENTA-GOOGLE-ANDREA.md) — guía para Andrea (crear cuenta y configurar)
- [`docs/HOJA-ANDREA-1PAGINA.md`](HOJA-ANDREA-1PAGINA.md) — resumen para Andrea
- [`docs/INSTALACION.md`](INSTALACION.md) — pasos técnicos de instalación
- [`docs/TAREAS-PENDIENTES.md`](TAREAS-PENDIENTES.md) — checklist vivo de puesta en producción
- [`docs/PLAN-WHATSAPP.md`](PLAN-WHATSAPP.md) — detalle del flujo de WhatsApp
