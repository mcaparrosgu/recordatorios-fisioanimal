---
type: Component
title: Script de recordatorios
description: Código fuente principal de la automatización de recordatorios
resource: ../scripts/recordatorios.js
tags: [google-apps-script, javascript, html-email, inline-images]
generated:
  by: opencode/okf-skill
  at: 2026-08-23T18:20:00Z
verified:
  by: humano:ganja
  at: 2026-08-24T17:30:00Z
status: stable
---

# Script de recordatorios

## Ubicación

`scripts/recordatorios.js`

## Funciones

### `enviarRecordatorios()`

Función principal. Se ejecuta con los triggers de 10:00 y 20:00.

**Qué hace:**
1. Calcula la fecha de mañana (`dd/MM/yy`)
2. Lee los eventos del Calendar para mañana
3. Carga el logo desde Google Drive (una sola vez por ejecución)
4. Construye un índice de clientes desde la hoja "Clientes"
5. Por cada evento:
   - Normaliza el título (quita tildes, minúsculas)
   - Busca en el índice de clientes (con fuzzy matching)
   - Si tiene email → envía recordatorio en HTML con logo incrustado
   - Si no tiene email → registra en Log
   - Si no está en la base → registra en Log
6. Verifica en el Log si ya se envió (deduplicación)
7. Envía email-resumen al gestor (también en HTML con logo)

### `normalizar(texto)`

Función principal. Se ejecuta con los triggers de 10:00 y 20:00.

**Qué hace:**
1. Calcula la fecha de mañana (`dd/MM/yy`)
2. Lee los eventos del Calendar para mañana
3. Carga el logo desde Google Drive (una sola vez por ejecución)
4. Construye un índice de clientes desde la hoja "Clientes"
5. Por cada evento:
   - Normaliza el título (quita tildes, minúsculas)
   - Busca en el índice de clientes
   - Si tiene email → envía recordatorio en HTML con logo incrustado
   - Si no tiene email → registra en Log
   - Si no está en la base → registra en Log
6. Verifica en el Log si ya se envió (deduplicación)
7. Envía email-resumen al gestor (también en HTML con logo)

### `normalizar(texto)`

Convierte texto a minúsculas, quita tildes y limpia espacios. Usada para comparar nombres de perros entre Calendar y Sheets.

**Ejemplo:** `"María Fernández"` → `"maria fernandez"`

### `extraerNombre(tutor)`

Sepa el nombre de pila del apellido. Divide el texto por espacios y toma el primer elemento.

**Ejemplo:** `"Laura Martín"` → `"Laura"`

### `buscarCliente(tituloNorm, clientes)`

Busca un cliente en la base con tolerancia a errores de escritura. Intenta tres estrategias en orden:

1. **Búsqueda exacta** — coincidencia directa en el índice.
2. **Búsqueda por prefijo** — si el título empieza por un nombre de la base (o viceversa), y solo hay un candidato.
3. **Distancia de Levenshtein ≤ 1** — un solo fallo de teclado (letra de más, de menos, o cambiada).

**Ejemplo:** Andrea escribe "Toby" en Calendar. En la hoja hay "Toby". → Match exacto.
**Ejemplo:** Andrea escribe "Tob" en Calendar. → Prefijo de "Toby". → Match.
**Ejemplo:** Andrea escribe "Tobyy" en Calendar. → Levenshtein = 1 con "Toby". → Match.

Si hay ambigüedad (varios candidatos), devuelve `null` y se registra como "Sin ficha".

### `levenshtein(a, b)`

Calcula la distancia de edición mínima entre dos strings. Para nombres de perros cortos (1-8 letras), con una distancia ≤ 1 se cubren la mayoría de errores de escritura reales.

### `buscarEnLog(hojaLog, perro, fecha)`

Busca en la hoja Log si ya se envió un recordatorio para un perro específico en una fecha dada. Devuelve `true` si ya existe (evita duplicados).

### `registrarLog(hojaLog, fecha, perro, tutor, email, estado, hora)`

Añade una fila a la hoja Log con el resultado del envío.

## Estructura de la hoja "Clientes"

| Columna | Campo | Índice JS | Tipo | Requerido |
|---|---|---|---|---|
| A | Perro/a | `[0]` | Texto | Sí (clave de búsqueda) |
| B | Tutor/a | `[1]` | Texto | Sí |
| C | Email | `[2]` | Email | Sí (para enviar) |
| D | Teléfono | `[3]` | Texto | No |
| E | Notas | `[4]` | Texto | No |

> El nombre del perro es la **clave de búsqueda**: debe coincidir con el título del evento en Calendar.

## Estructura de la hoja "Log"

| Columna | Campo | Tipo |
|---|---|---|
| A | Fecha | Texto (dd/MM/yy) |
| B | Perro | Texto |
| C | Tutor | Texto o "—" |
| D | Email | Email o "—" |
| E | Estado | Texto |
| F | Hora cita | Hora (HH:mm) |
| G | Ejecutado | Timestamp |

## Estados posibles en el Log

| Estado | Significado |
|---|---|
| OK Enviado | Recordatorio enviado correctamente |
| Sin email | El tutor está en la base pero no tiene email |
| Sin ficha | El nombre del perro no está en la base de datos |

## Formato del email de recordatorio

El correo se envía en **HTML** (`htmlBody`) con el logo incrustado como imagen inline (`inlineImages`).

**Asunto:** `Recordatorio: {perro} tiene cita mañana`

**Cuerpo HTML:**
```
Hola {nombre sin apellido},

{perro} tiene cita mañana {dd/MM/yy} a las {HH:mm}h 🐾

Si necesitas cambiar la hora, avísame lo antes posible.

¡Os espero!
— Andrea.
[logo_fisioanimal.png — 180px ancho]
```

**Cuerpo texto plano (fallback):** mismo texto sin HTML ni imagen.

## Logo

| Propiedad | Valor |
|---|---|
| Archivo original | `logo_fisioanimal.jpeg` (447×447, fondo amarillento) |
| Archivo procesado | `logo_fisioanimal_transparent.png` (447×447, fondo transparente) |
| Ubicación en Drive | `1AVtSCDT-UJ6U37Krze1T1st10-zfu9KB` |
| Procesamiento | Fondo crema RGB(240,253,235) → transparente. Transición suave en bordes anti-aliased. |
| Carga en el script | `DriveApp.getFileById(LOGO_DRIVE_ID).getBlob()` |
| Inserción en email | `<img src='cid:logo' width='180'>` + `inlineImages: { logo: blob }` |
| Fallback | Si el logo no carga, el email se envía sin imagen (no rompe) |

## Constantes configurables

| Variable | Valor actual | Propósito |
|---|---|---|
| `HOJA_CLIENTES` | `"Clientes"` | Nombre de la pestaña con la base de datos |
| `HOJA_LOG` | `"Log"` | Nombre de la pestaña con el historial |
| `EMAIL_RESUMEN` | `"mcaparrosgu@gmail.com"` | Email que recibe el resumen diario |
| `SPREADSHEET_ID` | `""` (vacío = hoja activa) | ID de la hoja si el script no está vinculado |
| `LOGO_DRIVE_ID` | `"1AVtSCDT-UJ6U37Krze1T1st10-zfu9KB"` | ID del logo en Google Drive |
