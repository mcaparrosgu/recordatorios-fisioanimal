# Log de cambios

## 2026-08-25 (avisos accionables para Andrea)

* **Alerta de error simple para Andrea:** nuevo `EMAIL_ALERTA_ANDREA` (en `CONFIG` o Script properties). Cuando está configurado, un fallo le envía a Andrea un email **simple y accionable** (no técnico) generado por `mensajeSimpleError()`:
  - Para errores que ella puede arreglar (pestaña "Clientes" o "Log" renombrada/borrada), le da los pasos concretos y **no la deriva al gestor**.
  - Para errores que no puede arreglar sola, la tranquiliza y la remite a quien mantiene el sistema.
  - El gestor sigue recibiendo el email técnico completo (con stack) siempre.
  - Mientras `EMAIL_ALERTA_ANDREA` esté vacío, no se envía nada a Andrea (comportamiento anterior). Se activa solo al rellenarlo.
* **Tests de `mensajeSimpleError`:** nueva suite (8 tests) que verifica los 3 caminos (Clientes, Log, desconocido) y que los errores arreglables por Andrea no la derivan al gestor. Total: 54 tests verdes.

## 2026-08-25 (revisión de calidad)

Revisión completa del proyecto tras una auditoría de código. Cambios:

* **Bug corregido — citas duplicadas mismo día:** la deduplicación pasaba por nombre de perro + fecha, lo que hacía que dos citas del mismo perro a distintas horas se anularan entre sí. Ahora se deduplica por **ID del evento de Calendar** (nueva columna H "Id Evento" en el Log). Cada cita es independiente.
* **Manejo de errores (no más fallos mudos):** `enviarRecordatorios()` ahora es un envoltorio con `try/catch` global. Si algo revienta (falta una pestaña, ID de logo inválido, hoja inaccesible), el gestor recibe un email de alerta con el error y la pila, en lugar de silencio.
* **Guard de hojas y spreadsheet:** validación al inicio de que las pestañas "Clientes" y "Log" existan, y de que el script se abra desde dentro de la hoja (no desde script.google.com suelto).
* **Resumen diario siempre:** el email-resumen se envía aunque no haya citas (mensaje "Hoy no hay citas programadas para mañana"), para confirmar que el script sigue vivo.
* **Aviso de fallo de logo:** si el logo no carga, el resumen lo indica con ⚠️ (antes era silencioso).
* **Columna "Nombre de pila" en Clientes:** nueva columna C para saludar bien a nombres compuestos (María José, Juan Carlos…). `extraerNombre(nombrePila, tutor)` prioriza esta columna y hace fallback a la primera palabra si está vacía.
* **Configuración centralizada:** bloque `CONFIG` al inicio del script con todos los valores tunables. Sobreescribible por **Propiedades del script** (Script properties) sin tocar el código, vía `obtenerConfig()`. Incluye `TZ` (zona horaria) que antes estaba repetida en varios puntos.
* **Rendimiento — Log en batch y Set:** el Log se carga una sola vez en un `Set` (O(1) por consulta) en vez de releerlo entero por cada evento, y la escritura se hace en una sola llamada `setValues()` en vez de un `appendRow` por fila.
* **Tests honestos:** arregladas las etiquetas de `tests/test-recordatorios.js` que mentían (un test "1 sustitución" probaba 0 cambios, "2 errores" probaba 1…). Ahora cada etiqueta describe lo que de verdad prueba. Actualizada la firma de `extraerNombre` y los datos de prueba. Documentado el contrato de sincronización (copiar a mano las funciones puras al editar el script). 46 tests, todos verdes.
* **Estado del proyecto aclarado:** el README ahora dice "Funcionando en entorno de pruebas" en lugar de "Funcionando", y apunta a `TAREAS-PENDIENTES.md` para el despliegue real.
* **Documentación sincronizada:** `INSTALACION.md`, `TAREAS-PENDIENTES.md`, `AGENTS.md`, `componente-script.md` y `architecture.md` actualizados con el nuevo esquema de columnas, la deduplicación por ID, el bloque `CONFIG` y los nuevos comportamientos.
* **Cabecera de columna aclarada:** "Nombre de pila" pasa a "Nombre de pila (saludo)" para que quede claro que es la palabra con la que empieza el saludo del email (no solo para nombres compuestos). El script lee por posición (columna C), así que la etiqueta es solo para humanos.
* **Tarea futura registrada:** cuando esté la cuenta de Andrea, el email de alerta de error debe llegar también a ella con instrucciones breves y sin tecnicismos (sección 10 de `TAREAS-PENDIENTES.md`).

## 2026-08-25
* **Búsqueda flexible de clientes (fuzzy matching)**: Nuevas funciones `buscarCliente()` y `levenshtein()` para tolerar errores de escritura al escribir el nombre del perro en Calendar. Estrategia: exacto → prefijo → Levenshtein ≤ 1. Si hay ambigüedad, no matchea (seguro).
* **Documento de tareas pendientes**: Creado `docs/TAREAS-PENDIENTES.md` con checklist completa para la puesta en producción (datos de Andrea, hoja, triggers, pruebas, riesgos).
* **Fix de bug**: Corregido `blob` → `logoBlob` en el inlineImages del email de recordatorio (error que impedía enviar el logo).

## 2026-08-24 (actualizado)
* **Renombrado**: Proyecto pasa de "Recordatorios Andrea" a "Recordatorios Fisioanimal". Andrea pasa a ser el nombre de la persona (fisiotherapeuta) y Fisioanimal la marca. Repo: `recordatorios-fisioanimal`.


## 2026-08-24
* **Corrección de columnas**: El código original esperaba Tutor en A y Perro en D; la hoja real tiene Perro en A y Teléfono en D. Mapeo corregido.
* **Fix de error null**: `SpreadsheetApp.getActiveSpreadsheet()` devolvía `null` cuando el script se abría desde script.google.com. Solucionado abriendo el editor desde la hoja (Extensiones → Apps Script).
* **Email HTML**: Sustituido el cuerpo de texto plano por `htmlBody`. Los emojis (🐾) ahora se renderizan correctamente en todos los clientes de correo.
* **Mensaje reescrito**: Nuevo formato solicitado por la usuaria: "Hola {nombre sin apellido}, {perro} tiene cita mañana {dd/mm/aa} a las {hh:mm}h 🐾".
* **Función `extraerNombre()`**: Nueva función auxiliar que separa el nombre de pila del apellido (ej: "Laura Martín" → "Laura").
* **Logo incrustado**: Procesado el logo original (`logo_fisioanimal.jpeg`) para eliminar el fondo amarillento (RGB 240,253,235 → transparente). Subido a Google Drive como PNG. Incrustado en el email vía `inlineImages` con `cid:logo`.
* **Log sin emojis**: Los estados del Log pasaron de "✅ Enviado" a "OK Enviado" para evitar problemas de renderizado.
* **Formato de fecha**: Cambiado de `dd/MM/yyyy` a `dd/MM/yy` (ej: "25/08/26").
* **Documentación actualizada**: Guía de instalación reescrita con el orden de columnas correcto, paso del logo y flujo de apertura desde la hoja.

## 2026-08-23
* **Inicialización**: Bundle OKF creado por opencode a partir del análisis del proyecto.
* **Diseño del sistema**: Se definió la arquitectura (Google Sheets + Calendar + Apps Script) tras evaluar n8n, VPS, Make y Zapier.
* **Script principal**: Escrita la función `enviarRecordatorios()` con triggers a las 10:00 y 20:00, deduplicación vía Log, y email-resumen al gestor.
* **Datos de prueba**: Creada hoja "Clientes" con 5 registros ficticios (fisioterapia canina) y hoja "Log" vacía.
* **Documentación**: Creados los conceptos OKF: overview, architecture, componente-script, decision-tech.
