// ============================================
// RECORDATORIOS — Fisioanimal
// Triggers: 10:00 y 20:00 diarios
// ============================================

function enviarRecordatorios() {
  var HOJA_CLIENTES = "Clientes";
  var HOJA_LOG = "Log";
  var EMAIL_RESUMEN = "mcaparrosgu@gmail.com";
  var SPREADSHEET_ID = ""; // Solo si el script NO está abierto desde la hoja
  var LOGO_DRIVE_ID = "1AVtSCDT-UJ6U37Krze1T1st10-zfu9KB"; // logo_fisioanimal.png (fondo transparente)

  // --- Fecha de mañana ---
  var manana = new Date();
  manana.setDate(manana.getDate() + 1);
  var fechaStr = Utilities.formatDate(manana, "Europe/Madrid", "dd/MM/yy");

  // --- Leer eventos de mañana del Calendar ---
  var calendar = CalendarApp.getDefaultCalendar();
  var eventos = calendar.getEventsForDay(manana);

  // --- Cargar logo desde Drive (una sola vez) ---
  var logoBlob = null;
  try {
    logoBlob = DriveApp.getFileById(LOGO_DRIVE_ID).getBlob();
  } catch (e) {
    // Si no puede cargar el logo, los correos se envían sin imagen
  }

  // --- Leer base de clientes y construir índice ---
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var hojaClientes = ss.getSheetByName(HOJA_CLIENTES);
  var hojaLog = ss.getSheetByName(HOJA_LOG);
  var datosClientes = hojaClientes.getDataRange().getValues();
  var clientes = {};

  for (var i = 1; i < datosClientes.length; i++) {
    var perro = normalizar(datosClientes[i][0]); // Columna A: nombre del perro
    clientes[perro] = {
      perro: datosClientes[i][0],     // Columna A: nombre del perro
      tutor: datosClientes[i][1],     // Columna B: nombre del tutor
      email: datosClientes[i][2],     // Columna C: email
      telefono: datosClientes[i][3]   // Columna D: teléfono
    };
  }

  // --- Procesar cada evento ---
  var enviados = 0;
  var sinEmail = 0;
  var sinMatch = 0;

  for (var j = 0; j < eventos.length; j++) {
    var evento = eventos[j];
    var titulo = evento.getTitle().trim();
    var tituloNorm = normalizar(titulo);
    var hora = Utilities.formatDate(evento.getStartTime(), "Europe/Madrid", "HH:mm");

    // ¿Ya se le envió en la pasada anterior (10:00)?
    if (buscarEnLog(hojaLog, tituloNorm, fechaStr)) {
      continue;
    }

    // Buscar en la base de clientes (con tolerancia a errores de escritura)
    var cliente = buscarCliente(tituloNorm, clientes);

    if (cliente) {
      if (cliente.email && cliente.email.toString().trim() !== "") {
        // --- ENVIAR RECORDATORIO ---
        var nombre = extraerNombre(cliente.tutor);
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
        registrarLog(hojaLog, fechaStr, cliente.perro, cliente.tutor, cliente.email, "OK Enviado", hora);
        enviados++;
      } else {
        // Tiene ficha pero sin email
        registrarLog(hojaLog, fechaStr, cliente.perro, cliente.tutor, "—", "Sin email", hora);
        sinEmail++;
      }
    } else {
      // No encontró el perro en la base de datos
      registrarLog(hojaLog, fechaStr, titulo, "—", "—", "Sin ficha", hora);
      sinMatch++;
    }
  }

  // --- Enviar resumen a ti ---
  if (enviados + sinEmail + sinMatch > 0) {
    var resumenTexto = "Resumen recordatorios — " + fechaStr + "\n\n" +
      "Enviados: " + enviados + "\n" +
      "Sin email: " + sinEmail + "\n" +
      "Sin ficha en base: " + sinMatch + "\n\n" +
      "Revisa la pestana Log para mas detalles.";

    var resumenHtml = "<div style='font-family: Arial, sans-serif; font-size: 15px; color: #333333;'>" +
      "<h3>Resumen recordatorios — " + fechaStr + "</h3>" +
      "<p>Enviados: <strong>" + enviados + "</strong><br>" +
      "Sin email: <strong>" + sinEmail + "</strong><br>" +
      "Sin ficha en base: <strong>" + sinMatch + "</strong></p>" +
      "<p>Revisa la pestana Log para mas detalles.</p>";

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

// Extrae el nombre de pila (sin apellido)
function extraerNombre(tutor) {
  if (!tutor) return "";
  return tutor.toString().trim().split(" ")[0];
}

// Registra una fila en el Log
function registrarLog(hojaLog, fecha, perro, tutor, email, estado, hora) {
  hojaLog.appendRow([fecha, perro, tutor, email, estado, hora, new Date()]);
}

// Busca en el Log si ya se envió recordatorio para ese perro ese día
function buscarEnLog(hojaLog, perro, fecha) {
  var datos = hojaLog.getDataRange().getValues();
  for (var i = 1; i < datos.length; i++) {
    if (normalizar(datos[i][1]) === perro && datos[i][0] === fecha) {
      return true;
    }
  }
  return false;
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
