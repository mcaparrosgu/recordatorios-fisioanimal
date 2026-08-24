# Log de cambios
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
