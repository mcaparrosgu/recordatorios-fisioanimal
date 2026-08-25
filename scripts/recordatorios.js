// ============================================
// RECORDATORIOS — Fisioanimal
// Triggers: 10:00 y 20:00 diarios
// ============================================

// --- Configuración (editar al desplegar en otra cuenta) ---
// Estos valores se leen primero desde las Propiedades del script
// (Apps Script → ⚙️ Project Settings → Script properties), y si no
// están definidos ahí, se usan estos por defecto. Así puedes cambiar
// el email o el ID del logo sin tocar el código.
var CONFIG = {
  HOJA_CLIENTES: "Clientes",
  HOJA_LOG: "Log",
  EMAIL_RESUMEN: "mcaparrosgu@gmail.com",            // ← email de quien recibe el resumen diario y la alerta técnica
  EMAIL_ALERTA_ANDREA: "",                            // ← email de Andrea para avisos simples (vacío = no se envía todavía)
  SPREADSHEET_ID: "",                                 // ← vacío si el script se abre desde la hoja
  LOGO_DRIVE_ID: "1AVtSCDT-UJ6U37Krze1T1st10-zfu9KB", // ← ID del logo en Drive (cuenta de Drive)
  TZ: "Europe/Madrid"
};

// Lee una propiedad del script o, si no existe, el valor por defecto de CONFIG.
function obtenerConfig(clave) {
  var props = PropertiesService.getScriptProperties();
  var valor = props.getProperty(clave);
  return (valor !== null && valor !== "") ? valor : CONFIG[clave];
}

// ============================================
// FUNCIÓN PRINCIPAL (entry point de los triggers)
// ============================================
// Envoltorio con try/catch para que un fallo nunca sea mudo: si algo
// revienta, el gestor recibe un email de alerta en lugar de silencio.
function enviarRecordatorios() {
  var EMAIL_RESUMEN = obtenerConfig("EMAIL_RESUMEN");
  var EMAIL_ANDREA = obtenerConfig("EMAIL_ALERTA_ANDREA");
  try {
    ejecutarRecordatorios(
      obtenerConfig("HOJA_CLIENTES"),
      obtenerConfig("HOJA_LOG"),
      EMAIL_RESUMEN,
      obtenerConfig("SPREADSHEET_ID"),
      obtenerConfig("LOGO_DRIVE_ID"),
      obtenerConfig("TZ")
    );
  } catch (e) {
    // 1) Email técnico al gestor (siempre, para que pueda diagnosticar)
    try {
      GmailApp.sendEmail(
        EMAIL_RESUMEN,
        "⚠️ Error en recordatorios Fisioanimal",
        "El script falló al ejecutarse:\n\n" + e.message + "\n\n" +
        "Cosas a revisar:\n" +
        "- Que las pestañas 'Clientes' y 'Log' existen con sus cabeceras\n" +
        "- Que el script se abre desde dentro de la hoja (Extensiones → Apps Script)\n" +
        "- Que LOGO_DRIVE_ID apunta a un archivo válido de Drive\n\n" +
        "Stack:\n" + (e.stack || "")
      );
    } catch (e2) {
      // Si ni siquiera podemos avisar por email, el trigger de Apps Script
      // notificará al propietario por su canal interno.
    }
    // 2) Email simple a Andrea (solo si su email está configurado).
    //    Para errores que ella puede arreglar (hoja renombrada, etc.) le
    //    decimos el problema y cómo solucionarlo, sin derivarla al gestor.
    if (EMAIL_ANDREA) {
      try {
        GmailApp.sendEmail(
          EMAIL_ANDREA,
          "⚠️ Recordatorios Fisioanimal — aviso importante",
          mensajeSimpleError(e)
        );
      } catch (e3) {
        // Sin email a Andrea: el gestor ya fue avisado en el paso 1.
      }
    }
  }
}

// Convierte un error técnico en un mensaje simple y accionable para una
// persona no técnica (Andrea). Para errores que ella puede arreglar
// (hoja renombrada, pestaña borrada) le da los pasos concretos; para
// errores que no puede arreglar sola, la deriva al gestor con honestidad.
function mensajeSimpleError(error) {
  var msg = (error && error.message) ? error.message : String(error);

  // Error que Andrea puede arreglar: renombró o borró la pestaña "Clientes"
  if (msg.indexOf("No existe la pestaña 'Clientes'") !== -1) {
    return "Parece que la pestaña con tus clientas ha cambiado de nombre o se ha borrado, " +
      "y por eso no se han podido enviar los recordatorios de hoy.\n\n" +
      "Cómo arreglarlo (tarda 1 minuto):\n" +
      "1. Abre tu hoja de cálculo de Fisioanimal.\n" +
      "2. Comprueba que hay una pestaña llamada exactamente 'Clientes' " +
      "(con C mayúscula y sin espacios delante ni detrás).\n" +
      "3. Si la tienes con otro nombre, haz clic derecho en la pestaña → Cambiar nombre → escribe 'Clientes'.\n" +
      "4. ¡Listo! Mañana a las 10:00 y a las 20:00 los recordatorios volverán a enviarse solos.\n\n" +
      "Si tenías citas para mañana y ya no se ha enviado algún recordatorio, entra en Apps Script " +
      "(Extensiones → Apps Script) y pulsa ▶️ para enviarlos ahora mismo.";
  }

  // Error que Andrea puede arreglar: renombró o borró la pestaña "Log"
  if (msg.indexOf("No existe la pestaña 'Log'") !== -1) {
    return "Parece que la pestaña 'Log' (donde se apuntan los envíos) ha cambiado de nombre " +
      "o se ha borrado, y por eso no se han podido enviar los recordatorios de hoy.\n\n" +
      "Cómo arreglarlo (tarda 1 minuto):\n" +
      "1. Abre tu hoja de cálculo de Fisioanimal.\n" +
      "2. Crea una pestaña nueva llamada exactamente 'Log' (con L mayúscula, sin espacios).\n" +
      "3. En la fila 1, escribe estas cabeceras: " +
      "Fecha | Perro | Tutor | Email | Estado | Hora cita | Ejecutado | Id Evento\n" +
      "4. ¡Listo! Mañana todo volverá a funcionar solo.\n\n" +
      "Si tenías citas para mañana y ya no se ha enviado algún recordatorio, entra en Apps Script " +
      "(Extensiones → Apps Script) y pulsa ▶️ para enviarlos ahora mismo.";
  }

  // Error no reconocido: Andrea no puede arreglarlo sola → derivar al gestor
  return "Ha habido un problema con los recordatorios automáticos de hoy y no se han podido enviar.\n\n" +
    "No te preocupes, no se ha perdido ninguna cita. Como no estoy segura de la causa, " +
    "lo mejor es que avises a quien te instaló el sistema para que lo revise. " +
    "Mientras tanto, si necesitas enviar algún recordatorio urgente, puedes hacerlo a mano.";
}

// ============================================
// LÓGICA PRINCIPAL
// ============================================
function ejecutarRecordatorios(HOJA_CLIENTES, HOJA_LOG, EMAIL_RESUMEN, SPREADSHEET_ID, LOGO_DRIVE_ID, TZ) {
  // --- Fecha de mañana ---
  var manana = new Date();
  manana.setDate(manana.getDate() + 1);
  var fechaStr = Utilities.formatDate(manana, TZ, "dd/MM/yy");

  // --- Leer eventos de mañana del Calendar ---
  var calendar = CalendarApp.getDefaultCalendar();
  var eventos = calendar.getEventsForDay(manana);

  // --- Cargar logo desde Drive (una sola vez) ---
  var logoBlob = null;
  var logoError = false;
  try {
    logoBlob = DriveApp.getFileById(LOGO_DRIVE_ID).getBlob();
  } catch (e) {
    // Si no puede cargar el logo, los correos se envían sin imagen
    // y el resumen avisará del fallo.
    logoError = true;
  }

  // --- Abrir hoja de cálculo ---
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      "No se pudo abrir la hoja de cálculo. Ejecuta el script desde DENTRO de la hoja " +
      "(Extensiones → Apps Script), no desde script.google.com suelto."
    );
  }

  var hojaClientes = ss.getSheetByName(HOJA_CLIENTES);
  var hojaLog = ss.getSheetByName(HOJA_LOG);
  if (!hojaClientes) {
    throw new Error("No existe la pestaña '" + HOJA_CLIENTES + "'. Créala con las cabeceras (ver docs/INSTALACION.md).");
  }
  if (!hojaLog) {
    throw new Error("No existe la pestaña '" + HOJA_LOG + "'. Créala con las cabeceras (ver docs/INSTALACION.md).");
  }

  // --- Leer base de clientes y construir índice ---
  // Orden de columnas en "Clientes":
  //   A Perro/a | B Tutor/a | C Nombre de pila | D Email | E Teléfono | F Notas
  var datosClientes = hojaClientes.getDataRange().getValues();
  var clientes = {};
  for (var i = 1; i < datosClientes.length; i++) {
    var perro = normalizar(datosClientes[i][0]); // Columna A: nombre del perro (clave)
    if (!perro) continue; // fila vacía
    clientes[perro] = {
      perro: datosClientes[i][0],       // A
      tutor: datosClientes[i][1],       // B
      nombrePila: datosClientes[i][2],  // C (nombre de pila para el saludo)
      email: datosClientes[i][3],       // D
      telefono: datosClientes[i][4]     // E
    };
  }

  // --- Cargar el Log UNA sola vez en un Set (clave = ID del evento de Calendar) ---
  // La deduplicación se basa en el ID del evento, no en el nombre del perro:
  // así dos citas del mismo perro a distintas horas no se anulan entre sí.
  var logDatos = hojaLog.getDataRange().getValues();
  var logSet = {};
  for (var k = 1; k < logDatos.length; k++) {
    var evIdPrevio = logDatos[k][7]; // Columna H: Id Evento
    if (evIdPrevio) logSet[evIdPrevio] = true;
  }

  // --- Procesar cada evento ---
  var enviados = 0;
  var sinEmail = 0;
  var sinMatch = 0;
  var filasLog = []; // acumula filas para escritura batch (1 sola llamada a Sheets)

  for (var j = 0; j < eventos.length; j++) {
    var evento = eventos[j];
    var titulo = evento.getTitle().trim();
    var tituloNorm = normalizar(titulo);
    var hora = Utilities.formatDate(evento.getStartTime(), TZ, "HH:mm");
    var eventId = evento.getId();

    // ¿Ya se procesó este evento (en la pasada de las 10:00 o antes)?
    if (logSet[eventId]) {
      continue;
    }

    // Buscar en la base de clientes (con tolerancia a errores de escritura)
    var cliente = buscarCliente(tituloNorm, clientes);

    if (cliente) {
      if (cliente.email && cliente.email.toString().trim() !== "") {
        // --- ENVIAR RECORDATORIO ---
        var nombre = extraerNombre(cliente.nombrePila, cliente.tutor);
        var asunto = "Recordatorio: " + cliente.perro + " tiene cita mañana";

        var textoPlano = "Hola " + nombre + ", " + cliente.perro + " tiene cita mañana " + fechaStr + " a las " + hora + "h.\n" +
          "Si necesitas cambiar la hora, avísame lo antes posible.\n" +
          "¡Os espero! - Andrea.";

        var html = "<div style='font-family: Arial, sans-serif; font-size: 15px; color: #333333; max-width: 500px;'>" +
          "<p>Hola " + nombre + ",</p>" +
          "<p>" + cliente.perro + " tiene cita mañana <strong>" + fechaStr + "</strong> a las <strong>" + hora + "h</strong> &#128062;</p>" +
          "<p>Si necesitas cambiar la hora, avísame lo antes posible.</p>" +
          "<p>¡Os espero!<br>— Andrea.</p>";

        if (logoBlob) {
          html += "<img src='cid:logo' width='180' style='margin-top: 10px;' />";
        }
        html += "</div>";

        var opciones = { htmlBody: html };
        if (logoBlob) {
          opciones.inlineImages = { logo: logoBlob };
        }

        GmailApp.sendEmail(cliente.email, asunto, textoPlano, opciones);
        filasLog.push([fechaStr, cliente.perro, cliente.tutor, cliente.email, "OK Enviado", hora, new Date(), eventId]);
        logSet[eventId] = true; // evita reenvío dentro de la misma pasada
        enviados++;
      } else {
        // Tiene ficha pero sin email
        filasLog.push([fechaStr, cliente.perro, cliente.tutor, "—", "Sin email", hora, new Date(), eventId]);
        logSet[eventId] = true;
        sinEmail++;
      }
    } else {
      // No encontró el perro en la base de datos
      filasLog.push([fechaStr, titulo, "—", "—", "Sin ficha", hora, new Date(), eventId]);
      logSet[eventId] = true;
      sinMatch++;
    }
  }

  // --- Escritura batch del Log (1 sola llamada a Sheets, no N) ---
  if (filasLog.length > 0) {
    var primeraFila = hojaLog.getLastRow() + 1;
    hojaLog.getRange(primeraFila, 1, filasLog.length, filasLog[0].length).setValues(filasLog);
  }

  // --- Enviar resumen al gestor (siempre, aunque no haya actividad) ---
  // Así Andrea sabe que el script sigue vivo aunque no haya citas.
  var total = enviados + sinEmail + sinMatch;
  var sinCitas = (total === 0);
  var notaLogo = logoError ? " ⚠️ El logo no cargó (revisa LOGO_DRIVE_ID en Drive)." : "";

  var cuerpoResumen = sinCitas
    ? "Hoy no hay citas programadas para mañana." + notaLogo
    : "Enviados: " + enviados + " · Sin email: " + sinEmail + " · Sin ficha: " + sinMatch + ". Revisa la pestaña Log para más detalles." + notaLogo;

  var resumenTexto = "Resumen recordatorios — " + fechaStr + "\n\n" + cuerpoResumen;

  var resumenHtml = "<div style='font-family: Arial, sans-serif; font-size: 15px; color: #333333;'>" +
    "<h3>Resumen recordatorios — " + fechaStr + "</h3>";
  if (sinCitas) {
    resumenHtml += "<p>Hoy no hay citas programadas para mañana.</p>";
  } else {
    resumenHtml += "<p>Enviados: <strong>" + enviados + "</strong><br>" +
      "Sin email: <strong>" + sinEmail + "</strong><br>" +
      "Sin ficha en base: <strong>" + sinMatch + "</strong></p>" +
      "<p>Revisa la pestaña Log para más detalles.</p>";
  }
  if (logoError) {
    resumenHtml += "<p>⚠️ El logo no cargó. Revisa el LOGO_DRIVE_ID en Drive.</p>";
  }
  if (logoBlob) {
    resumenHtml += "<img src='cid:logo' width='180' style='margin-top: 10px;' />";
  }
  resumenHtml += "</div>";

  var opcionesResumen = { htmlBody: resumenHtml };
  if (logoBlob) {
    opcionesResumen.inlineImages = { logo: logoBlob };
  }

  GmailApp.sendEmail(EMAIL_RESUMEN, "Resumen recordatorios Fisioanimal", resumenTexto, opcionesResumen);
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Quita tildes, pasa a minúsculas y limpia espacios
function normalizar(texto) {
  return texto.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Devuelve el nombre de pila para el saludo del email.
// Prioriza la columna "Nombre de pila" (columna C); si está vacía,
// hace fallback al primer palabra del campo Tutor/a.
// Así "María José López" saluda como "María José" (no "María") cuando se
// rellena la columna, y sigue funcionando si se deja en blanco.
function extraerNombre(nombrePila, tutor) {
  if (nombrePila && nombrePila.toString().trim() !== "") {
    return nombrePila.toString().trim();
  }
  if (!tutor) return "";
  return tutor.toString().trim().split(" ")[0];
}

// ============================================
// BÚSQUEDA FLEXIBLE DE CLIENTES
// ============================================

// Busca un cliente con tolerancia a errores de escritura.
// Orden de prioridad:
//   1. Búsqueda exacta
//   2. Búsqueda por prefijo (si hay un solo candidato)
//   3. Distancia de Levenshtein ≤ 1 (un solo fallo de teclado)
function buscarCliente(tituloNorm, clientes) {
  // 1. Búsqueda exacta
  if (clientes[tituloNorm]) {
    return clientes[tituloNorm];
  }

  // 2. Búsqueda por prefijo
  var candidatosPrefijo = [];
  var claves = Object.keys(clientes);
  for (var i = 0; i < claves.length; i++) {
    if (claves[i].indexOf(tituloNorm) === 0 || tituloNorm.indexOf(claves[i]) === 0) {
      candidatosPrefijo.push(clientes[claves[i]]);
    }
  }
  if (candidatosPrefijo.length === 1) {
    return candidatosPrefijo[0];
  }

  // 3. Distancia de Levenshtein ≤ 1
  var candidatosLevenshtein = [];
  for (var j = 0; j < claves.length; j++) {
    if (levenshtein(tituloNorm, claves[j]) <= 1) {
      candidatosLevenshtein.push(clientes[claves[j]]);
    }
  }
  if (candidatosLevenshtein.length === 1) {
    return candidatosLevenshtein[0];
  }

  // No se encontró o hay ambigüedad
  return null;
}

// Distancia de Levenshtein (número mínimo de ediciones para convertir a en b)
// Funciona bien para palabras cortas (< 20 caracteres)
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  var matrix = [];
  for (var i = 0; i <= b.length; i++) matrix[i] = [i];
  for (var j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (var i = 1; i <= b.length; i++) {
    for (var j = 1; j <= a.length; j++) {
      var costo = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // borrado
        matrix[i][j - 1] + 1,       // inserción
        matrix[i - 1][j - 1] + costo // sustitución
      );
    }
  }
  return matrix[b.length][a.length];
}
