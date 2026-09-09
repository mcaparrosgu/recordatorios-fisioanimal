# Guía: Recordatorios Fisioanimal

> El sistema lee las citas de **Google Calendar** y envía emails de recordatorio a las clientas.
> Necesita una cuenta de Google (Sheets + Calendar + Drive + Gmail).

---

## Paso 1 — Crear la hoja de Google Sheets (2 min)

1. Ve a **sheets.google.com** (con la cuenta donde vaya el sistema)
2. Clic en el **+** (hoja en blanco)
3. Renómbrala a **`Fisioanimal Recordatorios`**
4. Renombra la pestaña de abajo como **`Clientes`**
5. En la **fila 1** escribe estas cabeceras:

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Perro/a | Tutor/a | Nombre de pila (saludo) | Email | Teléfono | Notas |

> **¿Para qué sirve "Nombre de pila (saludo)"?** Para saludar bien en el email. Si la clienta se llama "María José López", escribe "María José" aquí y el email dirá "Hola María José". Si lo dejas en blanco, el script usa la primera palabra del campo "Tutor/a" (saldría "Hola María", que corta el nombre compuesto).
>
> No es solo para nombres compuestos: para "Laura Martín" escribe "Laura". Es la palabra(s) con la que quieres que empiece el saludo del email.

6. Crea una **segunda pestaña** (+ abajo a la izquierda) → renómbrala **`Log`** → en la **fila 1** pon:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Fecha | Perro | Tutor | Email | Estado | Hora cita | Ejecutado | Id Evento |

> La columna **"Id Evento"** la rellena el script solo (con el ID interno de la cita en Calendar). Sirve para que no se reenvíe un recordatorio dos veces. No tienes que escribir nada ahí.

**Guarda** la hoja (Ctrl+S o ya se guarda sola).

---

## Paso 2 — Subir el logo a Google Drive (1 min)

1. Abre **drive.google.com** (misma cuenta)
2. Clic en **"+ Nuevo"** → **"Subir archivo"**
3. Selecciona **`logo_fisioanimal_transparent.png`** (de la carpeta del proyecto)
4. Haz doble clic en el archivo subido → copia el **ID** de la URL:
   ```
   https://drive.google.com/file/d/ESTE_ES_EL_ID/view
                                    ^^^^^^^^^^^^^^^
   ```

---

## Paso 3 — Pegar el script en Apps Script (3 min)

1. Abre tu **Google Sheet** (la que tiene las pestañas Clientes y Log)
2. Menú **Extensiones → Apps Script**
3. **Borra TODO** lo que pone por defecto
4. **Pega el código completo** del archivo `scripts/recordatorios.js`
5. En el bloque `CONFIG` al principio, cambia los valores:

```javascript
var CONFIG = {
  HOJA_CLIENTES: "Clientes",
  HOJA_LOG: "Log",
  EMAIL_RESUMEN: "TU_EMAIL",                // ← email de quien recibe el resumen
  EMAIL_ALERTA_ANDREA: "",                  // ← email de Andrea (vacío = no se envía)
  SPREADSHEET_ID: "",                       // ← déjalo vacío (se abre desde la hoja)
  LOGO_DRIVE_ID: "ESTE_ES_EL_ID",          // ← el ID del Paso 2
  TZ: "Europe/Madrid"
};
```

6. Clic en **💾 Guardar** → ponle nombre **`Recordatorios Fisioanimal`**

> **Alternativa sin tocar el código:** en Apps Script ve a **⚙️ Project Settings → Script properties** y añade:
> - `EMAIL_RESUMEN` → tu email
> - `EMAIL_ALERTA_ANDREA` → email de Andrea (cuando lo tengas)
> - `LOGO_DRIVE_ID` → el ID del logo

---

## Paso 4 — Ejecutar por primera vez (1 min)

1. Clic en **▶️ Ejecutar**
2. Google mostrará: ⚠️ "Esta app no está verificada"
3. **No te asustes:**
   - Clic en **"Avanzado"** (abajo, en letras pequeñas)
   - Clic en **"Ir a Recordatorios Fisioanimal (no seguro)"**
   - Clic en **"Permitir"**
4. El script se ejecutará y recibirás un email-resumen

---

## Paso 5 — Crear los triggers automáticos

En el editor de Apps Script:
1. Clic en el **reloj** ⏰ (Triggers, barra lateral izquierda)
2. Clic en **"+ Agregar trigger"** (abajo a la derecha)

### Trigger 1 — Mañana 10:00

| Campo | Valor |
|---|---|
| Función | `enviarRecordatorios` |
| Origen del evento | **Basado en tiempo** |
| Tipo de activador | **Diario** |
| Hora del día | **10:00** |
| Zona horaria | **Europe/Madrid** |

Clic en **Guardar**.

### Trigger 2 — Noche 22:00

Repite lo mismo pero con la función **`enviarRecordatoriosRefuerzo`** y hora **22:00**.

---

## Paso 6 — Rellenar la hoja con datos reales

1. En la pestaña **"Clientes"**, borra los datos de prueba
2. Rellena con los datos reales de las clientas:

| A (Perro/a) | B (Tutor/a) | C (Nombre de pila) | D (Email) | E (Teléfono) | F (Notas) |
|---|---|---|---|---|---|
| Toby | Laura Martín | Laura | laura@correo.com | 600... | Cadena cervical |

> **Importante:** el nombre del perro en la columna A tiene que coincidir exactamente con el título del evento en Google Calendar. Si en Calendar pones "Toby", en la hoja tiene que poner "Toby".

---

## Paso 7 — Configurar Google Calendar

El sistema lee las citas de Google Calendar. Cada cita que se mete ahí se procesa automáticamente.

### Cómo meter una cita

**Desde el móvil:**
1. Abre la app **Google Calendar**
2. Toca **"+"** → **"Evento"**
3. **Título:** nombre del perro (ej: "Toby")
4. **Hora:** la hora de la cita
5. **Fecha:** la fecha de la cita
6. Toca **"Guardar"**

**Desde el ordenador:**
1. Ve a **calendar.google.com**
2. Haz clic en la hora del día → crea un evento
3. Título = nombre del perro
4. Guardar

### La regla de oro

> **El título del evento = SOLO el nombre del perro. Sin añadidos.**

- ✅ `Toby`
- ✅ `Luna`
- ❌ `Toby post-op` (el script no lo encuentra)
- ❌ `Cita Toby 10:00` (lo mismo)
- Si hay que anotar algo extra, va en la **descripción** del evento, no en el título.

---

## ⚠️ Nota importante: compatibilidad de runtime

Algunas cuentas de Google usan un **runtime V8 antiguo** que no tiene los métodos modernos de Sheets (`setRichTextValues`, `setCheckboxes`). El script ya usa **solo APIs compatibles**:

- **Enlaces `wa.me`** → fórmula `HYPERLINK` (no `setRichTextValues` / `RichTextValue`).
- **Casillas ✅** → `DataValidation` + `requireCheckbox()` (no `setCheckboxes`).

Si al ejecutar ves `TypeError: ... is not a function` en `setRichTextValues` o `setCheckboxes`, es que el runtime es antiguo — **el script ya usa la alternativa compatible**, no hace falta tocar nada.

---

## Listo ✅

A partir de ahora:

- Cada día a las **10:00** → prepara la pestaña **"WhatsApp"** con los recordatorios de mañana y **envía email** a las clientas que no tienen teléfono en la hoja (su única vía).
- Cada día a las **22:00** → **refresca la pestaña "WhatsApp"** (añade citas nuevas, quita canceladas, **respeta las casillas ✅ ya marcadas**) y **envía email de refuerzo** a las clientas con teléfono cuya casilla sigue sin marcar (WhatsApp no se envió).
- Los correos llegan en **HTML** con el logo de Fisioanimal incrustado.
- Tú recibes un **email-resumen** con todo lo que pasó (preparados, emails, refuerzos, sin ficha).
- Si algo falla (perro no encontrado, etc.), aparece en el Log y en el resumen.

---

## Próximos pasos (cuando Andrea tenga su cuenta)

1. **Abrir su hoja** → Extensiones → Apps Script (importante: desde la hoja, no desde script.google.com).
2. **Borrar el código por defecto** y pegar el contenido de `scripts/recordatorios.js`.
3. **Configurar `EMAIL_RESUMEN`** (y opcionalmente `EMAIL_ALERTA_ANDREA`, `LOGO_DRIVE_ID`) en el bloque `CONFIG` o, mejor, en **Script properties** (⚙️ Project Settings → Script properties) — así no toca el código al desplegar.
4. **Crear los dos triggers** (⏰ Triggers → + Agregar trigger):
   - Función: `enviarRecordatorios` — Diario — 10:00 — Europe/Madrid
   - Función: `enviarRecordatoriosRefuerzo` — Diario — 22:00 — Europe/Madrid
5. **Rellenar la pestaña "Clientes"** con los datos reales (Perro/a, Tutor/a, Nombre de pila, Email, Teléfono, Notas). El **teléfono es clave** para que el WhatsApp funcione.
6. **Probar**: crear un evento en Calendar para mañana con el nombre de un perro de la hoja → ejecutar ▶️ `enviarRecordatorios` → comprobar que aparece la pestaña "WhatsApp" con la fila → tocar el nombre del perro → WhatsApp se abre con el mensaje → enviar → marcar ✅.

---

## Documentos de referencia

- [`docs/GUIA-CUENTA-GOOGLE-ANDREA.md`](GUIA-CUENTA-GOOGLE-ANDREA.md) — guía completa para crear cuenta de Google de Andrea (para principiante)
- [`docs/HOJA-RUTA-ANDREA.md`](HOJA-RUTA-ANDREA.md) — hoja de ruta completa: qué hacer sola, qué necesitas de ella, y la reunión paso a paso
- [`docs/HOJA-ANDREA-1PAGINA.md`](HOJA-ANDREA-1PAGINA.md) — resumen de 1 página para que Andrea entienda el sistema
- [`docs/TAREAS-PENDIENTES.md`](TAREAS-PENDIENTES.md) — checklist completa del proyecto
- **Google Docs formateados:**
  - Hoja de ruta: https://docs.google.com/document/d/1fx75LmsxqJuK5bNU8THWLpBAvyfVPQjNf6aAb_kJnGE/edit
  - Plan trabajo: https://docs.google.com/document/d/1MEAoFyXhYPdExCP9iT-VTyN2JZJ_sa0j8NNaB73pvMo/edit
  - 1 página Andrea: https://docs.google.com/document/d/1QvIP-XyKxF1JaFTSOn6vhTrh836KSoAJICx_vlG0mt4/edit
