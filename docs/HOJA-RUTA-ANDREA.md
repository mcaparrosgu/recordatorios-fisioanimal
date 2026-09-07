---
type: Guía
title: Hoja de ruta — Puesta en marcha con Andrea
description: Qué hacer sola, qué necesitas de ella, y la reunión paso a paso
tags: [reunión, andrea, despliegue, autonomía]
generated:
  by: opencode
  at: 2026-09-06
status: pending
---

# Hoja de ruta — Puesta en marcha con Andrea

> **Qué es esto:** guía completa para desplegar el sistema en la cuenta de Andrea. Cubre lo que puedes hacer sola, lo que necesitas de ella, y la reunión paso a paso.
>
> **Antes de ir:** lee esta hoja una vez entera. Si necesitas el detalle técnico de instalación, ve a `docs/INSTALACION.md`.
>
> **Google Docs formateados:**
> - Hoja de ruta: https://docs.google.com/document/d/1fx75LmsxqJuK5bNU8THWLpBAvyfVPQjNf6aAb_kJnGE/edit
> - 1 página para Andrea: https://docs.google.com/document/d/1QvIP-XyKxF1JaFTSOn6vhTrh836KSoAJICx_vlG0mt4/edit

---

## Fase 0 — Lo que puedes hacer tú sola (sin Andrea)

Estas tareas no necesitan a Andrea. Hazlas cuando quieras.

| ✅ | Tarea |
|---|---|
| ☐ | Ejecuta los tests: `node tests/test-recordatorios.js` |
| ☐ | Prepara la convención de nombres de perros (ver Fase 3) |
| ☐ | Prepara el borrador del email de recordatorio |
| ☐ | Ten el script listo para pegar (`scripts/recordatorios.js`) |
| ☐ | Crea la hoja "Fisioanimal Recordatorios" en tu propia cuenta como plantilla (ver `docs/INSTALACION.md` Paso 1) |

---

## Fase 1 — Lo que necesitas de ella (sin reunión)

Puedes conseguir estos datos por WhatsApp/mensaje, sin necesidad de sentarse contigo.

| ✅ | Dato | Por qué |
|---|---|---|
| ☐ | **Email de Andrea** | Para `EMAIL_RESUMEN` y `EMAIL_ALERTA_ANDREA` |
| ☐ | **Lista real de clientas** | Nombre del perro, nombre del tutor, email, nombre de pila (saludo) |
| ☐ | **Qué email quiere para la cuenta de Google** | O le pones uno tú: `fisioanimal.recordatorios@gmail.com` |
| ☐ | **Que verifique la cuenta de Google** (si la creas tú) | Solo necesita introducir el código que Google le envía por SMS |

> 💡 **Para pedir datos mejor:** pídele la lista de clientas por adelantado (una foto de su agenda, una tabla, lo que sea) y sube tú los datos a la hoja. En la reunión solo **revisáis** que esté bien.

---

## Fase 2 — La reunión (30-45 min)

### 2a. Arranque: explica en 1 minuto qué es esto

**Qué decir (sin tecnicismos):**

> "Te voy a montar un sistema para que a tus clientas les llegue un email automático recordándoles la cita de su perro, el día antes, a las 10 y a las 20 h. Tú solo escribes la cita en tu calendario como siempre (con el nombre del perro) y el sistema se encarga del resto."

### 2b. Montar la hoja de cálculo (la creáis juntas)

1. Crear la hoja en **sheets.google.com** → llamarla **"Fisioanimal Recordatorios"**
2. Crear pestaña **`Clientes`** con cabeceras en fila 1:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Perro/a | Tutor/a | Nombre de pila (saludo) | Email | Teléfono | Notas |

3. Crear pestaña **`Log`** con cabeceras en fila 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Fecha | Perro | Tutor | Email | Estado | Hora cita | Ejecutado | Id Evento |

> La columna **H (Id Evento)** la rellena el script sola. No se toca a mano.

4. **Rellenar los datos reales de clientas** (aquí es donde revisáis que todo esté bien).

**Punto crítico — la columna C "Nombre de pila (saludo)":**

> "Esta columna es la palabra con la que quieres que empiece el email. Si una clienta se llama 'María José López', aquí ponemos 'María José' para que salga 'Hola María José'. Si la dejamos vacía, el sistema coge la primera palabra del nombre y la saluda 'Hola María', que queda mal. Rellénala siempre."

**Punto crítico — compartir contigo:**

> Pídele que te dé acceso de **"Editor"** a la hoja (botón **Compartir**, arriba a la derecha) para que tú puedas pegar el script y ayudarla.

### 2c. LA REGLA DE ORO: convención de nombres de perros

**Esto es lo más importante de la reunión.** Antes de seguir, tenéis que quedar en **una** regla. El sistema busca al perro por su nombre tal como está en Calendar y en la hoja.

**Propónsela así:**

> "El nombre del perro que escribes en el calendario tiene que coincidir con el de la hoja. Si en el calendario pones 'Toby' y en la hoja está 'Toby', perfecto. Pero si algún día escribes 'Toby post-op', el sistema ya no lo reconoce como 'Toby'."

**Tabla de ejemplo:**

| Cómo escribe Andrea en Calendar | Coincide con la hoja "Toby"? | Resultado |
|---|---|---|
| `Toby` | ✅ Sí | Le llega el recordatorio |
| `toby` (minúscula) | ✅ Sí (tolerancia) | Le llega |
| `To By` (un fallo de teclado) | ✅ Sí (tolerancia) | Le llega |
| `Toby post-op` | ❌ No | **No le llega** |

**Regla que puedes proponer (la más simple):** el título del evento = solo el nombre del perro. Cualquier aclaración (operación, hora, etc.) va en la **descripción** del evento, no en el título.

> **Firmad el acuerdo entre las dos**, incluso anótalo en la hoja "Notas" o en un correo de confirmación. Evita el 90% de los fallos futuros.

### 2d. Subir el logo a la cuenta de Andrea

1. Abrir **drive.google.com**
2. Subir `logo_fisioanimal_transparent.png` (arrastrar)
3. Abrir el archivo → copiar el **ID** de la URL:
   ```
   https://drive.google.com/file/d/ESTE_ES_EL_ID/view
   ```
4. Pegar ese ID en `LOGO_DRIVE_ID` (en `CONFIG` o en **Script properties**)

> Si no tenéis el PNG a mano, podéis hacer este paso después: **sin logo el sistema sigue funcionando**, solo que el email sale sin imagen.

---

## Fase 3 — Instalar y probar (lo hacéis juntas, 10 min)

Para los pasos técnicos detallados (pegar el script, CONFIG, triggers), sigue `docs/INSTALACION.md` (Pasos 3-5). Aquí solo el resumen:

1. Abrir la hoja → **Extensiones → Apps Script**
2. Borrar el contenido por defecto → pegar `scripts/recordatorios.js`
3. Configurar el CONFIG (email de Andrea, logo ID)
4. Guardar → Ejecutar ▶️ → Aceptar permisos ("Avanzado" → "Ir a..." → "Permitir")
5. Crear dos triggers: **10:00** y **20:00** diarios, función `enviarRecordatorios`

**Verificar que funciona:** revisar la hoja **Log** (deben aparecer filas) y comprobar que llega el **email-resumen**.

---

## Fase 4 — Probar con casos reales (10 min)

| Prueba | Cómo | Qué esperar |
|---|---|---|
| Cita normal | Andrea crea 1 evento con un perro de la hoja para mañana | Llega el email de recordatorio |
| **Perro que no existe** | Crear evento con un perro que NO esté en la hoja | En el Log sale "Sin ficha" — no rompe nada |
| **Dos citas del mismo perro el mismo día** | Crear 2 eventos distintos el mismo día | **Le llegan los dos** recordatorios (cada cita es independiente) |
| **Saludo de nombre compuesto** | Una clienta con "Nombre de pila (saludo)" relleno | El email la saluda bien |

> 💡 Para probar sin molestar a las clientas reales, usa **tu email** en la columna D (Email) de la hoja durante las pruebas.

---

## Fase 5 — Lo que le puedes decir a Andrea (sin tecnicismos)

Sin tecnicismos:

> "Te he montado un sistema que te avisa a las clientas por email el día anterior a la cita. Tú solo tienes que meter las citas en el calendario del móvil. El resto lo hace solo. Si un día algo falla, te llega un email con los pasos para arreglarlo."

Si te pregunta por qué tiene que usar el calendario del móvil:

> "Para que el sistema sepa qué citas tienes, tiene que estar en el ordenador. Lo más fácil es que después de anotar en tu agenda, también lo metas en el calendario. Es un segundo y ya está."

**Enseñarle a meter citas (3-5 min):**
1. Descarga Google Calendar en el móvil
2. Inicia sesión con la cuenta de Fisioanimal
3. Toca "+" → "Evento" → nombre del perro → hora → guardar
4. **Regla:** el título = solo el nombre del perro

> **Esto es lo que más costará de cambiar** porque Andrea tiene que acostumbrarse a meter las citas en el móvil después de anotarlas en su agenda.

---

## Fase 6 — Cerrar: qué confirmar antes de irte

**Checklist final:**

| ✅ | Pendiente de verificar |
|---|---|
| ☐ | Email de Andrea configurado (`EMAIL_RESUMEN` + `EMAIL_ALERTA_ANDREA` *opcional*) |
| ☐ | Logo subido con su ID (`LOGO_DRIVE_ID`) |
| ☐ | Hoja "Clientes" con datos reales y columna C (saludo) rellena |
| ☐ | Hoja compartida contigo como Editor |
| ☐ | Script pegado y ejecutado correctamente |
| ☐ | Permisos aceptados (aviso "no verificada") superado |
| ☐ | Dos triggers creados (10:00 y 20:00) |
| ☐ | Log con registros de la prueba |
| ☐ | **Convención de nombres acordada** entre las dos |
| ☐ | Email-resumen llegando a Andrea |

**Qué dejarle por escrito:**
1. La **regla de nombres de perros** (un ejemplo claro).
2. Qué debe hacer si renombra/borra la pestaña "Clientes" o "Log" (el sistema ya le avisa con pasos).
3. Que los recordatorios funcionan solos, pero si un día falla, **revise el Log** y avísele.

---

## Que no cunda el pánico: errores típicos

| Problema | Causa probable | Solución |
|---|---|---|
| El email sale "Hola María" en vez de "Hola María José" | Columna C (saludo) vacía | Rellenar columna C |
| No llega recordatorio para un perro | Nombre del perro no coincide entre Calendar y hoja | Revisar la convención de nombres (Fase 2c) |
| No llega **ningún** email | Pestaña "Clientes" renombrada o borrada | Renombrarla exactamente "Clientes" |
| El email sale sin logo | `LOGO_DRIVE_ID` incorrecto o borrado | Revisar el ID del archivo en Drive |
| El aviso "no verificada" al ejecutar | Normal en apps propias | Avanzado → Ir a... → Permitir |
| Mismo perro dos veces el mismo día solo recibe UN recordatorio | (debería recibir 2 si son citas distintas) | La dedup es por ID de evento; si pasa, revisar el Log |

---

> **Después de la reunión (en casa, tú sola):** actualiza `docs/TAREAS-PENDIENTES.md` marcando lo que se haya completado, y apunta en la bitácora lo que hayáis acordado (especialmente la convención de nombres y el email de Andrea).
