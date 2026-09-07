---
type: Guía
title: Guía completa: crear cuenta de Google para Andrea y configurar el sistema
description: Todo lo que necesitas saber siendo principiante, paso a paso, desde cero
tags: [guía, google, cuenta, andrea, sheets, principiante]
generated:
  by: opencode
  at: 2026-09-06
status: pending
---

# Guía completa: crear cuenta de Google para Andrea y configurar el sistema

> Esta guía está escrita para una principiante total. Si algo no queda claro, pregunta.

---

## PARTE 1 — Crear una cuenta de Google para Andrea

### ¿Por qué necesita una cuenta de Google?

El sistema usa Google Sheets (base de datos de clientas), Google Drive (logo), Google Calendar (citas) y Gmail (enviar emails). Todo esto necesita una cuenta de Google. Andrea puede crear una nueva solo para Fisioanimal, sin mezclar con su correo personal.

### Paso a paso

1. Abre el navegador y ve a **accounts.google.com**
2. Clic en **"Crear cuenta"** → **"Para mi uso personal"**
3. Rellena:
   - **Nombre:** Andrea (o como quieras que aparezca en los emails)
   - **Apellido:** (su apellido o deja en blanco)
   - **Nombre de usuario:** `fisioanimal.recordatorios` (o cualquier cosa que recuerdes; esto será su email: fisioanimal.recordatorios@gmail.com)
   - **Contraseña:** Usa una contraseña fuerte que recuerdes. **Apúntala en un sitio seguro** (no en un archivo de git).
   - **Teléfono:** (opcional, pero Google lo pide a veces para verificar)
   - **Fecha de nacimiento:** (la que quieras, no tiene por qué ser la real)
   - **Sexo:** (la que quieras)
4. Google te enviará un código por SMS o email alternativo. Introdúcelo.
5. **Listo.** Ya tienes la cuenta: `fisioanimal.recordatorios@gmail.com` (o lo que hayas puesto).

### Después de crear la cuenta

- Abre **drive.google.com** con esa cuenta → verás el Drive vacío de Andrea
- Abre **sheets.google.com** → verás Google Sheets vacío
- Abre **calendar.google.com** → verás el calendario vacío de Andrea
- Abre **gmail.com** → verás la bandeja de entrada de Andrea

> **Tip:** si quieres trabajar con las dos cuentas a la vez (la tuya y la de Andrea), abre una ventana de incógnito (Ctrl+Shift+N) y allí inicia sesión con la cuenta de Andrea. Así tienes cada cuenta en una ventana.

---

## PARTE 2 — Entender qué es Google Sheets

Google Sheets es como Excel, pero en la nube (se guarda solo, puedes acceder desde cualquier ordenador).

### Conceptos básicos

- **Hoja de cálculo (Spreadsheet):** Es el archivo completo. Equivale a un libro de Excel.
- **Pestaña (Sheet):** Cada hoja dentro del archivo. Como las pestañas de abajo en Excel.
- **Celda:** Cada cuadrito donde escribes algo. Se identifica por columna (letra) y fila (número). Ejemplo: A1 es la primera celda de arriba a la izquierda.
- **Rango:** Un bloque de celdas. Ejemplo: A1:F1 es toda la primera fila.

### Qué vamos a crear

Una hoja de cálculo que se llama **"Fisioanimal Recordatorios"** con dos pestañas:

1. **"Clientes"** → datos de los perros y sus tutoras
2. **"Log"** → registro automático de los emails enviados

---

## PARTE 3 — Crear la hoja de Google Sheets

### Paso 1: Crear la hoja

1. Ve a **sheets.google.com** (con la cuenta de Andrea)
2. Clic en el **botón "+"** (esquina superior izquierda) → se abre una hoja en blanco
3. Haz clic en el nombre donde pone "Hoja de cálculo sin nombre" (arriba a la izquierda) y renómbrala a: **`Fisioanimal Recordatorios`**
4. Guarda sola (se guarda automáticamente)

### Paso 2: Crear la pestaña "Clientes"

1. Abajo a la izquierda verás una pestaña que dice "Hoja1". Haz clic derecho en ella
2. Selecciona **"Cambiar nombre"**
3. Escribe: **`Clientes`** (con C mayúscula, sin espacios)
4. En la **fila 1** (la primera), escribe estas cabeceras:

| Celda | Escribe |
|---|---|
| A1 | Perro/a |
| B1 | Tutor/a |
| C1 | Nombre de pila (saludo) |
| D1 | Email |
| E1 | Teléfono |
| F1 | Notas |

5. **Ejemplo con datos ficticios** (en las filas 2-6):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Toby | Laura Martín | Laura | laura@correo.com | 600123456 | Cadena cervical |
| Luna | Carlos Ruiz | Carlos | carlos@correo.com | 611987654 | Reconstrucción ligamento |
| Rocky | María José Fernández | María José | mariajose@correo.com | 622555111 | Post-operatorio |
| Milo | Ana López | Ana | ana@correo.com | 633222333 | Movilidad cadera |
| Bruno | Pedro Gómez | Pedro | | 644888999 | Sin email (prueba error) |

> **¿Qué es la columna C (Nombre de pila)?** Es la palabra(s) con la que quieres que empiece el saludo del email. Para "María José López" escribes "María José". Si lo dejas vacío, el email diría "Hola María" (corta el nombre). Siempre rellénala.

### Paso 3: Crear la pestaña "Log"

1. Clic en el **"+"** que hay junto a la pestaña "Clientes" (abajo a la izquierda)
2. Aparece una nueva pestaña. Cambia su nombre a: **`Log`** (con L mayúscula)
3. En la **fila 1** escribe estas cabeceras:

| Celda | Escribe |
|---|---|
| A1 | Fecha |
| B1 | Perro |
| C1 | Tutor |
| D1 | Email |
| E1 | Estado |
| F1 | Hora cita |
| G1 | Ejecutado |
| H1 | Id Evento |

> **No rellenes nada más en Log.** El script lo hace automáticamente.

---

## PARTE 4 — Subir el logo a Drive de Andrea

1. Ve a **drive.google.com** con la cuenta de Andrea
2. Clic en **"+ Nuevo"** → **"Subir archivo"**
3. Selecciona el archivo `logo_fisioanimal_transparent.png` (está en la carpeta del proyecto)
4. Espera a que se suba
5. Haz doble clic en el archivo → se abre en una ventana nueva
6. Mira la **URL** en la barra del navegador:
   ```
   https://drive.google.com/file/d/1AVtSCDT-UJ6U37Krze1T1st10-zfu9KB/view
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       ESTE ES EL ID
   ```
7. Copia solo la parte entre `/d/` y `/view` (el ID)
8. Apunta ese ID: lo necesitarás más tarde

---

## PARTE 5 — Configurar Google Calendar de Andrea

El sistema lee las citas de Google Calendar. Andrea tiene que meter ahí cada cita que anote en su agenda física.

### El calendario ya existe

Cuando creaste la cuenta de Andrea, Google ya creó un calendario por defecto. No hay que crear nada. Solo hay que enseñarle a meter eventos.

### Enseñarle a crear eventos

**Desde el móvil (que es lo que usará):**

1. Descarga la app **Google Calendar** (gratis, App Store / Google Play)
2. Inicia sesión con la cuenta de Andrea (`fisioanimal.recordatorios@gmail.com`)
3. Para crear una cita: toca el **botón "+"** → **"Evento"**
4. Rellena:
   - **Título:** el nombre del perro (ej: "Toby")
   - **Hora:** la hora de la cita
   - **Fecha:** la fecha de la cita
5. Toca **"Guardar"**

**Desde el ordenador:**

1. Ve a **calendar.google.com**
2. Haz clic en la hora del día → crea un evento
3. Título = nombre del perro
4. Guardar

### La regla de oro (para que funcione)

> **El título del evento en Calendar = SOLO el nombre del perro. Sin añadidos.**

- ✅ `Toby`
- ✅ `Luna`
- ❌ `Toby post-op` (el script busca "toby post-op" y no encuentra "toby")
- ❌ `Cita Toby 10:00` (lo mismo)
- Si hay que anotar algo extra (operación, observaciones), va en la **descripción** del evento, no en el título.

### Preguntas frecuentes que le harás a Andrea

**¿Y si me equivoco al escribir el nombre?**
El script tiene tolerancia a errores pequeños (un fallo de teclado). Pero si escribes "Toby" en Calendar y en la hoja tienes "Toby", tiene que coincidir exacto.

**¿Puedo poner el nombre del perro y la hora?**
No. Solo el nombre. La hora se pone en el campo de hora del evento. Si pones "Toby 10:00" en el título, el script no lo encuentra.

**¿Qué pasa si cancelo una cita?**
Borra el evento de Calendar. El script no la procesará.

**¿Y si la clienta cambia de hora?**
Modifica la hora del evento en Calendar. El script cogerá la nueva hora.

**¿Necesito internet para crear eventos?**
Sí, pero solo para crearlos. Una vez creados, se guardan en la nube.

---

## PARTE 6 — Instalar el script y probar

Para los pasos técnicos (pegar el script, CONFIG, ejecutar, aceptar permisos, crear triggers, probar), sigue la guía de instalación:

👉 **[`docs/INSTALACION.md`](INSTALACION.md)** — Pasos 3 a 7

---

## PARTE 7 — Lo que le puedes decir a Andrea (sin tecnicismos)

Cuando le expliques el sistema, dile algo como:

> "Te he montado un sistema que te avisa a las clientas por email el día anterior a la cita. Tú solo tienes que meter las citas en el calendario del móvil (Google Calendar). El resto lo hace solo. Si un día algo falla, te llega un email con los pasos para arreglarlo. No tienes que hacer nada técnico."

Si te pregunta por qué no puede seguir con su agenda física:

> "Puedes seguir usándola, pero para que el sistema sepa qué citas tienes, tiene que estar en el ordenador. Lo más fácil es que después de anotar en tu agenda, también lo metas en el calendario. Es un segundo y ya está."

---

## PARTE 8 — Si algo falla

Para errores comunes y su solución, ve a la sección "Que no cunda el pánico" en [`docs/HOJA-RUTA-ANDREA.md`](HOJA-RUTA-ANDREA.md).

---

## Documentos de referencia

- [`docs/INSTALACION.md`](INSTALACION.md) — guía técnica de instalación (pasos 3-7: script, CONFIG, triggers, Calendar, probar)
- [`docs/HOJA-RUTA-ANDREA.md`](HOJA-RUTA-ANDREA.md) — hoja de ruta completa para la reunión con Andrea
- [`docs/HOJA-ANDREA-1PAGINA.md`](HOJA-ANDREA-1PAGINA.md) — resumen de 1 página para Andrea
- [`docs/TAREAS-PENDIENTES.md`](TAREAS-PENDIENTES.md) — checklist completa del proyecto
