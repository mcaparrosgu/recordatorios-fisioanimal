# PLAN — Recordatorios por WhatsApp (enlaces `wa.me`)

> Estado: ✅ **PLAN CERRADO — listo para construir**
> Creado: 07/09/2026
> Fuente: conversación de planificación (reuniones con Andrea).
> **Quién escriba/depliegue este plan debe leer también `AGENTS.md` (gotchas del proyecto) antes de tocar nada.**

---

## 0. Objetivo (por qué)

Andrea no confía en que sus clientas lean el email y prefiere WhatsApp. Hoy pierde
15–30 min/día enviando recordatorios a mano (copiar texto, cambiar hora, buscar contacto).

Queremos que el script **prepare** los recordatorios de WhatsApp (mensaje escrito + chat
correcto) y que Andrea solo pulse "enviar". El email queda como **red de seguridad**,
no como canal principal.

**Decisión de negocio cerrada:** Andrea NO paga nada por esto. Cero coste mensual.

**Decisión de diseño cerrada:** se usa el mecanismo oficial `https://wa.me/<num>?text=<msg>`
(un enlace que abre el chat con el mensaje escrito). **NO** se usa whatsapp-web.js (riesgo
de ban del número personal de Andrea), **NO** se usa CallMeBot (solo envía a tu propio
número y está "lleno"), **NO** se usa Business API (de pago).

---

## 1. Flujo objetivo (qué debe pasar cada día)

### Trigger 1 — 10:00
1. Leer del Calendar las citas de **mañana** (D+1). (Comportamiento actual, no cambiar.)
2. Construir la lista de la pestaña **"WhatsApp"** (crear la pestaña si no existe).
   Una fila por cita con: `Hora | Perro (enlace wa.me) | Tutor/a | Enviado ☐`.
3. Enviar email automático **solo a las clientas SIN teléfono** en la hoja
   (para esas, el WhatsApp es imposible → el email temprano es su única vía).
4. Registrar en "Log" y enviar resumen interno al gestor (alarma de vida — no tocar).

### Tarde — trabajo de Andrea (2 min)
5. Andrea abre la pestaña "WhatsApp", toca el nombre del perro → se abre WhatsApp con
   el mensaje escrito → pulsa enviar → marca la casilla ✅.

### Trigger 2 — 22:00
6. Refrescar la pestaña "WhatsApp":
   - Citas nuevas de mañana → añadirlas.
   - Citas canceladas → quitarlas.
   - **Conservar las casillas ✅ ya marcadas** (clave: actualizar por ID de evento,
     NO borrar y reescribir la pestaña entera — eso perdería las marcas y Andrea
     podría enviar el mismo recordatorio dos veces).
7. **Email de refuerzo** solo a las citas **con teléfono y casilla SIN marcar**
   (WhatsApp no se envió o falló: Andrea ocupada, enferma, o el enlace no funcionó).
8. Registrar en "Log" y enviar resumen interno al gestor.

### Casos que NO bloquean
- Clienta sin teléfono → email a las 10:00 (punto 3), sin fila "Enviado" pendiente de WhatsApp.
- Perro sin ficha en "Clientes" → fila de aviso en la pestaña + Log "Sin ficha" (igual que hoy).
- El email de refuerzo puede salir aunque Andrea ya avisara por teléfono → inofensivo, aceptado.

---

## 2. Cambios en `scripts/recordatorios.js`

### 2.1 CONFIG — añadir 2 claves
- `HOJA_WHATSAPP: "WhatsApp"` → nombre de la pestaña nueva.
- `PREFIJO_TELEFONO: "34"` → prefijo internacional por defecto (España).

### 2.2 Funciones puras NUEVAS (contrato para tests)
Deben ser funciones puras (sin APIs de Google), para poder testearlas con Node:

1. `normalizarTelefono(tel)` → `String`. Devuelve el número en formato internacional
   **sin** `+` y sin espacios/guiones/puntos/paréntesis (formato `wa.me`).
   - `"600 111 222"` → `"34600111222"` (añade PREFIJO_TELEFONO si no lo lleva)
   - `"+34 600 111 222"` → `"34600111222"` (quita `+`)
   - `"34600111222"` → `"34600111222"` (ya limpio)
   - `""`, `null`, basura sin dígitos (`"abc"`) → `""` (vacío → el script lo tratará como "sin teléfono")
   - Quitar también `00` inicial si aparece (p. ej. `"0034600111222"` → `"34600111222"`).

2. `textoWhatsApp(nombre, perro, fecha, hora)` → `String`. Mensaje corto, sin HTML, informal:
   `"Hola {nombre} 🐶 {perro} tiene sesión mañana ({fecha}) a las {hora}. Si necesitas cambiar la hora, avísame. ¡Os espero! — Andrea"`
   (fecha en formato `dd/mm` o el que use el script en el resumen; decidir uno y usarlo en todos los sitios).

3. `buildWaLink(tel, texto)` → `String`. Devuelve `"https://wa.me/" + tel + "?text=" + encodeURIComponent(texto)`.

### 2.3 Lógica en `ejecutarRecordatorios()`
- Lectura de "Clientes": ya existe la columna E (Teléfono) → usar `datosClientes[i][4]`.
- No borrar el bloque de email existente: **reutilizar** `GmailApp.sendEmail` con el mismo
  HTML/logo para los dos emails del nuevo flujo (10:00 a sin-teléfono, 22:00 a sin-marcar).
- Mantener la deduplicación por ID de evento (columna H del Log) para que un evento no
  procese su email dos veces entre las 10:00 y las 22:00. **Revisar** que el Log siga
  protegiendo: 10:00 marca el evento, 22:00 no reenvía el email temprano.
- Pestaña "WhatsApp": si `ss.getSheetByName(HOJA_WHATSAPP)` no existe → crear con
  `insertSheet()` + cabeceras. Cabeceras propuestas:
  `Fecha cita | Hora | Perro | Tutor/a | Teléfono (opcional visible) | Enviado`
  - El **nombre del perro es un enlace clicable** a `wa.me` usando **fórmula `HYPERLINK`** (compatible con todos los runtimes, incluido V8 antiguo).
  - Columna "Enviado" con **casillas de verificación** vía `DataValidation` + `requireCheckbox()` (compatible con todos los runtimes, incluido V8 antiguo).
  - Fila 1 opcional con instrucción para Andrea: "Toca el nombre del perro para abrir WhatsApp".
- Refresh de las 22:00: leer la pestaña, indexar filas existentes por **ID de evento**
  (guardar el ID en una columna oculta SI hace falta, o emparejar por perro+hora+fecha),
  y hacer merge: conservar marcas, añadir nuevos, eliminar cancelados.
- Estados del Log (adaptar): `"Listo WhatsApp"` / `"Email enviado (sin teléfono)"` /
  `"Email refuerzo (sin marcar)"` / `"Sin teléfono"` / `"Sin ficha"` — el constructor puede
  ajustar la redacción exacta pero debe distinguir los 5 casos.
- Resumen al gestor: mantener SIEMPRE (aunque no haya citas). Ajustar el contador:
  "Preparados: X · Emails 10:00: Y · Refuerzos 22:00: Z · Sin ficha: W".

### 2.4 Triggers finales
- **Únicos 2 triggers: 10:00 y 22:00.** Eliminar cualquier trigger antiguo a otra hora
  (p. ej. 20:00) al desplegar en la cuenta.
- No añadir más triggers a menos que el plan lo diga.

---

## 3. Tests (`tests/test-recordatorios.js`)

**Contrato de copia (obligatorio, ver AGENTS.md):** las funciones puras se re-declaran a mano
en el test file. Si se cambian en el script, se copian al test. Añadir:

- Las 3 funciones nuevas copiadas.
- Suite `normalizarTelefono`: `+34` con espacios, paréntesis, 9 dígitos sin prefijo,
  ya limpio, vacío, `null`, basura (`"abc"` → `""`), `00` inicial.
- Suite `buildWaLink`: acentos y espacios en el texto (encoding correcto), número limpio.
- Suite `textoWhatsApp`: saludo con nombre de pila, sin nombre (fallback), formato de fecha/hora.
- Verificación: `node tests/test-recordatorios.js` → todo ✅.

---

## 4. Documentación a actualizar

| Archivo | Cambio |
|---|---|
| `AGENTS.md` | Flujo nuevo (preparar + email de seguridad), pestaña "WhatsApp", triggers 10:00/22:00, regla de teléfonos, contrato de tests actualizado |
| `docs/INSTALACION.md` | Pestaña "WhatsApp" auto-creada (ya no es manual), qué ve/usuario Andrea, triggers nuevos, aviso de eliminar el antiguo |
| `docs/TAREAS-PENDIENTES.md` | G4 → "en curso · plan cerrado"; nota de G5 (duplicados) intacta (no bloquea) |
| `docs/GUIA-CUENTA-GOOGLE-ANDREA.md` (si procede) | Añadir sección del flujo WhatsApp |

---

## 5. Orden de construcción (respetar este orden)

1. Tests: escribir `normalizarTelefono`, `textoWhatsApp`, `buildWaLink` + suites → `node` verde.
2. Script: copiar las 3 funciones + cambios de CONFIG + lógica de la pestaña + emails nuevos.
3. Tests de nuevo (las funciones del script y del test siguen siendo la misma copia) → verde.
4. Documentación (tabla de la sección 4).
5. Prueba manual en la cuenta de PRUEBAS:
   - Crear evento de mañana con un perro de la hoja → ejecutar ▶️ → comprobar pestaña
     "WhatsApp" con fila + enlace clicable + casilla.
   - Probar caso sin teléfono y caso sin ficha → ver avisos.
   - Tocar el enlace → se abre WhatsApp con el mensaje (probar con tu propio número).
6. Despliegue en la cuenta de Andrea (cuando toque): pegar código, permisos, **solo**
   triggers 10:00 y 22:00, explicar el gesto a Andrea (toca → envía → marca).

---

## 6. Riesgos ya identificados (no rediseñar, solo respetarlos)

- Números mal formateados → `normalizarTelefono` devuelve `""` → tratado como "sin teléfono", nunca inventa.
- Pérdida de casillas ✅ → resuelto por el merge de las 22:00 (actualizar, no borrar).
- Doble aviso ocasional (email de refuerzo cuando Andrea ya avisó por teléfono) → aceptado, inofensivo.
- `wa.me` es canal oficial → sin riesgo de ban, funciona en móvil y WhatsApp Web.
- Privacidad: los teléfonos ya viven en la hoja de Andrea; no se exportan a ningún tercero.

---

## 7. Al implementar — prohibido y permitido

**Permitido:** ajustar nombres de variables, redacción de textos, estructura de helpers,
valores por defecto de CONFIG, siempre que el comportamiento de la sección 1 se cumpla.

**Prohibido:**
- Añadir dependencias externas, servidores, librerías o servicios de pago.
- Cambiar el canal a whatsapp-web.js / CallMeBot / Telegram / Business API.
- Borrar el email como red de seguridad (forma parte del diseño).
- Tocar el deduplicado por ID de evento sin actualizar esta sección del plan y el AGENTS.md.
- Escribir secretos en el repo.
- Sobre-ingeniería: si una decisión del plan parece resoluble más simple, aplicar la más simple y anotarlo en la bitácora.