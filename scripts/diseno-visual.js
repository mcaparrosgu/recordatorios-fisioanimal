// ============================================
// DISEÑO VISUAL — Recordatorios Fisioanimal
// Aplica el formato visual (colores pastel, tipografía, bandas alternas
// por fila, formato condicional de estado) a las hojas Clientes / WhatsApp
// / Log. No toca datos, triggers ni la lógica de recordatorios.js.
//
// Uso:
//   1. Abrir la hoja → Extensions → Apps Script (el mismo proyecto donde
//      vive recordatorios.js).
//   2. Crear un segundo archivo (botón "+" junto a "Files") y pegar este
//      código.
//   3. Ejecutar manualmente aplicarDisenoVisual() una vez (▶️).
//
// Es idempotente: se puede volver a ejecutar sin acumular bandas ni
// reglas duplicadas (por ejemplo tras clonar la hoja para otra clienta).
//
// Diseñado para uso principalmente desde móvil: fila de cabecera fija,
// altura de fila cómoda al tacto, tipografía Roboto (la fuente de
// sistema de Android, muy legible en pantallas pequeñas), colores
// pastel con una única nota de color más fuerte para estados que
// requieren atención (coral, nunca azul marino) y verde pastel para
// estados correctos.
// ============================================

var DISENO = {
  FUENTE: "Roboto",
  TEXTO_CUERPO: "#3C4043",
  TECNICO_GRIS: "#9AA0A6",
  BLANCO: "#FFFFFF",
  OK_FONDO: "#D7F2DE",
  OK_TEXTO: "#1E7B45",
  ATENCION_FONDO: "#FFE1D6",
  ATENCION_TEXTO: "#B54A28",
  // Un color base distinto por hoja para que se distingan de un vistazo;
  // el semáforo OK/ATENCION de arriba es el mismo en todas.
  CLIENTES: { header: "#4A86C7", banda: "#E8F1FB" }, // azules, a petición
  WHATSAPP: { header: "#4FA79C", banda: "#E4F5F2" }, // menta/turquesa
  LOG: { header: "#8073C4", banda: "#F1EEFB" } // lavanda
};

// Nombres de hoja: si tu instalación los ha renombrado, cambia aquí
// (o usa obtenerConfig si este archivo convive con recordatorios.js).
function nombreHoja_(clave, porDefecto) {
  if (typeof obtenerConfig === "function") {
    var valor = obtenerConfig(clave);
    if (valor) return valor;
  }
  return porDefecto;
}

function aplicarDisenoVisual() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  disenarClientes_(ss.getSheetByName(nombreHoja_("HOJA_CLIENTES", "Clientes")));
  disenarWhatsApp_(ss.getSheetByName(nombreHoja_("HOJA_WHATSAPP", "WhatsApp")));
  disenarLog_(ss.getSheetByName(nombreHoja_("HOJA_LOG", "Log")));
}

// --- Base común: congelado, altura de fila, anchos, bandas y tipografía ---
function disenarHojaBase_(sheet, numCols, headerHex, bandaHex, anchos) {
  if (!sheet) return; // hoja no encontrada: no interrumpir el resto
  var maxRows = sheet.getMaxRows();

  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(1);
  sheet.setHiddenGridlines(true);

  sheet.setRowHeight(1, 34);
  if (maxRows > 1) sheet.setRowHeights(2, maxRows - 1, 26);

  for (var c = 0; c < anchos.length; c++) {
    sheet.setColumnWidth(c + 1, anchos[c]);
  }

  // Bandas alternas nativas de Sheets: se retiran las existentes antes de
  // volver a aplicar, para poder re-ejecutar este script sin conflicto.
  sheet.getBandings().forEach(function (b) { b.remove(); });
  var rango = sheet.getRange(1, 1, maxRows, numCols);
  var banda = rango.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);
  banda.setHeaderRowColor(headerHex);
  banda.setFirstRowColor(DISENO.BLANCO);
  banda.setSecondRowColor(bandaHex);

  // Cabecera: negrita, blanca, centrada
  sheet.getRange(1, 1, 1, numCols)
    .setFontFamily(DISENO.FUENTE)
    .setFontSize(11)
    .setFontWeight("bold")
    .setFontColor(DISENO.BLANCO)
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);

  // Cuerpo: tipografía legible, gris cálido (no negro puro), wrap activo
  // para que ningún dato quede cortado en móvil.
  if (maxRows > 1) {
    sheet.getRange(2, 1, maxRows - 1, numCols)
      .setFontFamily(DISENO.FUENTE)
      .setFontSize(10)
      .setFontColor(DISENO.TEXTO_CUERPO)
      .setVerticalAlignment("middle")
      .setWrap(true);
  }
}

// Regla de formato condicional de "semáforo" (verde=OK / coral=atención)
// reutilizada en las hojas WhatsApp y Log.
function reglaTexto_(rango, contiene, esOk) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains(contiene)
    .setBackground(esOk ? DISENO.OK_FONDO : DISENO.ATENCION_FONDO)
    .setFontColor(esOk ? DISENO.OK_TEXTO : DISENO.ATENCION_TEXTO)
    .setBold(true)
    .setRanges([rango])
    .build();
}

function reglaFormula_(rango, formula, esOk) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(formula)
    .setBackground(esOk ? DISENO.OK_FONDO : DISENO.ATENCION_FONDO)
    .setFontColor(esOk ? DISENO.OK_TEXTO : DISENO.ATENCION_TEXTO)
    .setBold(true)
    .setRanges([rango])
    .build();
}

// --- Clientes: A Perro/a | B Tutor/a | C Nombre de pila | D Email | E Teléfono | F Notas ---
function disenarClientes_(sheet) {
  if (!sheet) return;
  var anchos = [100, 140, 130, 200, 110, 240];
  disenarHojaBase_(sheet, anchos.length, DISENO.CLIENTES.header, DISENO.CLIENTES.banda, anchos);

  var maxRows = sheet.getMaxRows();
  if (maxRows > 1) {
    sheet.getRange(2, 5, maxRows - 1, 1).setHorizontalAlignment("center"); // Teléfono
  }
}

// --- WhatsApp: A Fecha cita | B Hora | C Perro | D Tutor/a | E Teléfono | F Enviado (casilla) | G Id Evento (oculta) ---
function disenarWhatsApp_(sheet) {
  if (!sheet) return;
  var anchos = [100, 70, 100, 140, 110, 90, 220];
  disenarHojaBase_(sheet, anchos.length, DISENO.WHATSAPP.header, DISENO.WHATSAPP.banda, anchos);

  var maxRows = sheet.getMaxRows();
  if (maxRows > 1) {
    sheet.getRange(2, 1, maxRows - 1, 2).setHorizontalAlignment("center"); // Fecha cita, Hora
    sheet.getRange(2, 5, maxRows - 1, 2).setHorizontalAlignment("center"); // Teléfono, Enviado
    sheet.getRange(2, 7, maxRows - 1, 1) // Id Evento: columna técnica de dedup, discreta
      .setFontColor(DISENO.TECNICO_GRIS)
      .setFontSize(9);

    // "Enviado" es una casilla (DataValidation requireCheckbox), no texto:
    // se colorea por su valor TRUE/FALSE, no por contenido de texto.
    var rangoEnviado = sheet.getRange(2, 6, maxRows - 1, 1);
    sheet.setConditionalFormatRules([
      reglaFormula_(rangoEnviado, "=F2=TRUE", true),
      reglaFormula_(rangoEnviado, "=F2=FALSE", false)
    ]);
  }
}

// --- Log: A Fecha | B Perro | C Tutor | D Email | E Estado | F Hora cita | G Ejecutado | H Id Evento ---
function disenarLog_(sheet) {
  if (!sheet) return;
  var anchos = [90, 160, 140, 190, 130, 90, 110, 220];
  disenarHojaBase_(sheet, anchos.length, DISENO.LOG.header, DISENO.LOG.banda, anchos);

  var maxRows = sheet.getMaxRows();
  if (maxRows > 1) {
    sheet.getRange(2, 1, maxRows - 1, 1).setHorizontalAlignment("center"); // Fecha
    sheet.getRange(2, 5, maxRows - 1, 3).setHorizontalAlignment("center"); // Estado, Hora cita, Ejecutado
    sheet.getRange(2, 7, maxRows - 1, 2) // Ejecutado + Id Evento: técnicas, discretas
      .setFontColor(DISENO.TECNICO_GRIS)
      .setFontSize(9);

    var rangoEstado = sheet.getRange(2, 5, maxRows - 1, 1);
    sheet.setConditionalFormatRules([
      reglaTexto_(rangoEstado, "Listo", true),
      reglaTexto_(rangoEstado, "Sin", false)
    ]);
  }
}
