# Guía: Recordatorios Fisioanimal

## Paso 1 — Crear la hoja de Google Sheets (2 min)

1. Ve a **sheets.google.com**
2. Clic en el **+** (hoja en blanco)
3. Renombra la hoja (pestaña abajo) como **`Clientes`**
4. En la **fila 1** escribe estas cabeceras:

| A | B | C | D | E |
|---|---|---|---|---|
| Perro/a | Tutor/a | Email | Teléfono | Notas |

5. En las filas 2-6, mete estos datos de PRUEBA (el email es tuyo para probar):

| A | B | C | D | E |
|---|---|---|---|---|
| Toby | Laura Martín | mcaparrosgu@gmail.com | 600123456 | Cadena cervical |
| Luna | Carlos Ruiz | mcaparrosgu@gmail.com | 611987654 | Reconstrucción ligamento |
| Rocky | María Fernández | mcaparrosgu@gmail.com | 622555111 | Post-operatorio |
| Milo | Ana López | mcaparrosgu@gmail.com | 633222333 | Movilidad cadera |
| Bruno | Pedro Gómez | | 644888999 | Sin email (prueba error) |

6. Crea una **segunda pestaña** (+ abajo a la izquierda) → renómbrala **`Log`** → en la **fila 1** pon:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Fecha | Perro | Tutor | Email | Estado | Hora cita | Ejecutado |

**Guarda** la hoja (Ctrl+S o ya se guarda sola).

---

## Paso 2 — Crear eventos de prueba en tu Calendar (1 min)

1. Ve a **calendar.google.com**
2. Crea **3 eventos para MAÑANA**:

| Título del evento | Hora |
|---|---|
| Toby | 10:00 |
| Luna | 14:00 |
| Rocky | 17:00 |

> **El título del evento = el nombre del perro exacto** (tal como está en la hoja).

---

## Paso 3 — Subir el logo a Google Drive (1 min)

1. Abre **drive.google.com**
2. Arrastra el archivo **`logo_fisioanimal.png`** (fondo transparente) a Drive
3. Ábrelo → copia el **ID** de la URL:
   ```
   https://drive.google.com/file/d/ESTE_ES_EL_ID/view
   ```
4. Pega ese ID en la línea del script:
   ```javascript
   var LOGO_DRIVE_ID = "ESTE_ES_EL_ID";
   ```

> Si no tienes el PNG con fondo transparente, usa `logo_fisioanimal_transparent.png` de esta carpeta.

---

## Paso 4 — Instalar el script (3 min)

1. Abre tu **Google Sheet** (la que tiene las pestañas Clientes y Log)
2. Menú **Extensiones → Apps Script**
3. **Borra TODO** lo que pone por defecto
4. **Pega el código completo** del archivo `scripts/recordatorios.js`
5. Clic en **💾 Guardar** → ponle nombre **`Recordatorios Fisioanimal`**
6. Clic en **▶️ Ejecutar**

> **Importante:** El script debe abrirse desde dentro de la hoja (Extensiones → Apps Script), no desde script.google.com suelto. Si no, `SpreadsheetApp.getActiveSpreadsheet()` devuelve `null`.

### La primera vez pedirá permisos:

Google mostrará: ⚠️ "Esta app no está verificada"

**No te asustes.** Sigue estos pasos:
1. Clic en **"Avanzado"** (abajo a la izquierda, en letras pequeñas)
2. Clic en **"Ir a Recordatorios Fisioanimal (no seguro)"**
3. Clic en **"Permitir"**

El script se ejecutará y recibirás un email-resumen.

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

### Trigger 2 — Noche 20:00

Repite lo mismo pero con hora **20:00**.

---

## Listo ✅

A partir de ahora:
- Cada día a las **10:00** → envía recordatorios para las citas de mañana
- Cada día a las **20:00** → segunda pasada (para citas creadas después de las 10:00)
- Los correos llegan en **HTML** con el logo de Fisioanimal incrustado (sin emojis raros)
- Tú recibes un **email-resumen** con todo lo que pasó
- Si algo falla (email faltante, perro no encontrado), aparece en el Log y en tu resumen

## Cuando vayas a usarlo con Andrea:

1. Repite el Paso 1 con los datos REALES de sus clientas
2. Sube el logo a la cuenta de Drive de Andrea y actualiza `LOGO_DRIVE_ID`
3. Repite el Paso 4 (pegar el script) en la cuenta de Google de Andrea
4. Repite el Paso 5 (triggers) en la cuenta de Andrea
5. El email de resumen cámbialo al de Andrea (`EMAIL_RESUMEN`)
