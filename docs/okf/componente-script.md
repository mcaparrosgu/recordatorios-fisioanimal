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
  at: 2026-08-25T19:00:00Z
status: stable
---

# Script de recordatorios

## Ubicación

`scripts/recordatorios.js`

## Estructura del código

El script se divide en tres partes:

1. **Bloque `CONFIG`** — valores configurables (nombres de pestañas, email de resumen, ID del logo, zona horaria). Se pueden sobreescribir con Propiedades del script sin tocar el código.
2. **`enviarRecordatorios()`** — punto de entrada de los triggers. Es un envoltorio con `try/catch`: si la lógica revienta, el gestor recibe un email de alerta en lugar de un fallo mudo.
3. **`ejecutarRecordatorios(...)`** — la lógica principal, aislada para que el `try/catch` la cubra.

## Funciones

### `enviarRecordatorios()`

Punto de entrada de los triggers de 10:00 y 20:00. Lee la configuración (Script properties → `CONFIG`), llama a `ejecutarRecordatorios()` dentro de un `try/catch` y, si algo falla, envía:

1. Un email **técnico** al gestor (`EMAIL_RESUMEN`) con el error y la pila (siempre).
2. Un email **simple y accionable** a Andrea (`EMAIL_ALERTA_ANDREA`) —solo si su email está configurado— con el problema explicado en cristiano y los pasos para arreglarlo ella misma cuando sea posible (p. ej. que renombró la hoja "Clientes"). Para errores que no puede arreglar sola, la deriva al gestor con honestidad.

### `mensajeSimpleError(error)`

Convierte un error técnico en un mensaje sencillo para una persona no técnica (Andrea). Para errores arreglables por ella (pestaña "Clientes" o "Log" renombrada/borrada) devuelve los pasos concretos; para el resto, un aviso que la tranquiliza y la deriva al gestor.

**Es una función pura** (no usa APIs de Google), así que tiene tests en `tests/test-recordatorios.js`.

### `ejecutarRecordatorios(...)`

Lógica principal. **Qué hace:**

1. Calcula la fecha de mañana (`dd/MM/yy`)
2. Lee los eventos del Calendar para mañana
3. Carga el logo desde Google Drive (una vez); si falla, marca `logoError` y continúa sin imagen
4. Abre la hoja de cálculo; si no existe o faltan las pestañas `Clientes`/`Log`, lanza un error (cubierto por el `try/catch` externo)
5. Construye un índice de clientes desde la hoja "Clientes"
6. Carga el Log **una sola vez** en un `Set` (clave = ID del evento de Calendar)
7. Por cada evento:
   - Si su ID ya está en el Log → lo salta (deduplicación)
   - Busca el perro en el índice (con fuzzy matching)
   - Si tiene email → envía recordatorio en HTML con logo
   - Si no tiene email → acumula fila "Sin email"
   - Si no está en la base → acumula fila "Sin ficha"
   - Marca el ID como procesado (evita reenvío dentro de la misma pasada)
8. Escribe el Log en **batch** (una sola llamada a Sheets, no una por fila)
9. Envía email-resumen al gestor **siempre**, incluso si no hubo actividad (para confirmar que el script vive)

### `normalizar(texto)`

Convierte texto a minúsculas, quita tildes y limpia espacios. Usada para comparar nombres de perros entre Calendar y Sheets.

**Ejemplo:** `"María Fernández"` → `"maria fernandez"`

### `extraerNombre(nombrePila, tutor)`

Devuelve el nombre de pila para el saludo del email. Prioriza la columna "Nombre de pila" (C); si está vacía, hace fallback a la primera palabra del campo "Tutor/a".

**Ejemplo:** `("María José", "María José López")` → `"María José"` (usa la columna)
**Ejemplo:** `("", "Laura Martín")` → `"Laura"` (fallback a la primera palabra)

> Esta función existió para resolver el problema de los nombres compuestos españoles: "María José López" saludado como "María" cortaba el nombre. La columna "Nombre de pila" lo soluciona sin adivinar.

### `buscarCliente(tituloNorm, clientes)`

Busca un cliente en la base con tolerancia a errores de escritura. Tres estrategias en orden:

1. **Búsqueda exacta** — coincidencia directa en el índice.
2. **Búsqueda por prefijo** — si el título empieza por un nombre de la base (o viceversa), y solo hay un candidato.
3. **Distancia de Levenshtein ≤ 1** — un solo fallo de teclado.

Si hay ambigüedad (varios candidatos), devuelve `null` y se registra como "Sin ficha".

### `levenshtein(a, b)`

Distancia de edición mínima entre dos strings. Para nombres de perros cortos (1-8 letras), con distancia ≤ 1 se cubren la mayoría de errores de escritura reales.

### `obtenerConfig(clave)`

Lee una propiedad del script (Project Settings → Script properties) y, si no está definida, devuelve el valor por defecto del bloque `CONFIG`. Permite configurar cada despliegue sin editar el código.

## Estructura de la hoja "Clientes"

| Columna | Campo | Índice JS | Tipo | Requerido |
|---|---|---|---|---|
| A | Perro/a | `[0]` | Texto | Sí (clave de búsqueda) |
| B | Tutor/a | `[1]` | Texto | Sí |
| C | Nombre de pila (saludo) | `[2]` | Texto | No (recomendado para el saludo) |
| D | Email | `[3]` | Email | Sí (para enviar) |
| E | Teléfono | `[4]` | Texto | No |
| F | Notas | `[5]` | Texto | No |

> El nombre del perro (A) es la **clave de búsqueda**: debe coincidir con el título del evento en Calendar (con tolerancia a un error de teclado).
> La columna C (Nombre de pila) es opcional pero recomendada: si está vacía, el saludo usa la primera palabra de B.

## Estructura de la hoja "Log"

| Columna | Campo | Índice JS | Tipo |
|---|---|---|---|
| A | Fecha | `[0]` | Texto (dd/MM/yy) |
| B | Perro | `[1]` | Texto |
| C | Tutor | `[2]` | Texto o "—" |
| D | Email | `[3]` | Email o "—" |
| E | Estado | `[4]` | Texto |
| F | Hora cita | `[5]` | Hora (HH:mm) |
| G | Ejecutado | `[6]` | Timestamp |
| H | Id Evento | `[7]` | Texto (ID de Calendar, auto-rellenado) |

> La columna H la rellena el script con el ID interno del evento de Calendar. **No escribir manualmente.** Es la clave de deduplicación.

## Estados posibles en el Log

| Estado | Significado |
|---|---|
| OK Enviado | Recordatorio enviado correctamente |
| Sin email | El tutor está en la base pero no tiene email |
| Sin ficha | El nombre del perro no está en la base de datos |

## Deduplicación

Se basa en el **ID del evento de Calendar** (columna H del Log), no en el nombre del perro. Implicaciones:

- Dos citas del mismo perro a distintas horas el mismo día → se envían los DOS recordatorios (cada evento tiene su propio ID).
- La segunda pasada (20:00) no reenvía lo que ya envió la de las 10:00 (mismo evento = mismo ID).
- Un evento con error de escritura que matchea por fuzzy → no se reenvía (el ID es estable aunque el nombre coincida por aproximación).
- Para reenviar recordatorios: borrar el Log.

> **Migración:** si actualizas desde una versión anterior del script (que deduplicaba por nombre), borra el Log antes de la primera ejecución con la nueva versión. Los registros viejos no tienen ID de evento.

## Formato del email de recordatorio

El correo se envía en **HTML** (`htmlBody`) con el logo incrustado como imagen inline (`inlineImages`).

**Asunto:** `Recordatorio: {perro} tiene cita mañana`

**Cuerpo HTML:**
```
Hola {nombre de pila},

{perro} tiene cita mañana {dd/MM/yy} a las {HH:mm}h 🐾

Si necesitas cambiar la hora, avísame lo antes posible.

¡Os espero!
— Andrea.
[logo_fisioanimal.png — 180px ancho]
```

**Cuerpo texto plano (fallback):** mismo texto sin HTML ni imagen.

## Resumen diario

Se envía **siempre** al gestor, incluso si no hay citas mañana (mensaje: "Hoy no hay citas programadas para mañana"). Así se confirma que el script sigue activo. Si el logo no cargó, el resumen incluye un aviso `⚠️`.

## Logo

| Propiedad | Valor |
|---|---|
| Archivo original | `logo_fisioanimal.jpeg` (447×447, fondo amarillento) |
| Archivo procesado | `logo_fisioanimal_transparent.png` (447×447, fondo transparente) |
| Ubicación en Drive | configurable vía `CONFIG.LOGO_DRIVE_ID` |
| Carga en el script | `DriveApp.getFileById(LOGO_DRIVE_ID).getBlob()` |
| Inserción en email | `<img src='cid:logo' width='180'>` + `inlineImages: { logo: blob }` |
| Fallback | Si el logo no carga, el email se envía sin imagen (no rompe) y el resumen avisa con ⚠️ |

## Constantes configurables

Viven en el bloque `CONFIG` al inicio del script y pueden sobreescribirse con **Propiedades del script** (Apps Script → ⚙️ Project Settings → Script properties):

| Variable | Por defecto | Propósito |
|---|---|---|
| `HOJA_CLIENTES` | `"Clientes"` | Nombre de la pestaña con la base de datos |
| `HOJA_LOG` | `"Log"` | Nombre de la pestaña con el historial |
| `EMAIL_RESUMEN` | `"mcaparrosgu@gmail.com"` | Email del gestor: recibe el resumen diario y la alerta técnica |
| `EMAIL_ALERTA_ANDREA` | `""` (vacío = no se envía) | Email de Andrea para avisos simples y accionables. Se activa cuando se rellena |
| `SPREADSHEET_ID` | `""` (vacío = hoja activa) | ID de la hoja si el script no está vinculado |
| `LOGO_DRIVE_ID` | ID del logo | ID del logo en Google Drive |
| `TZ` | `"Europe/Madrid"` | Zona horaria para todas las fechas |
