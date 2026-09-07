// ============================================
// PRUEBAS — Funciones puras de recordatorios
// Ejecutar: node tests/test-recordatorios.js
// ============================================
//
// ⚠️ CONTRATO DE SINCRONIZACIÓN
// --------------------------------
// Estas pruebas copian a mano las funciones PURAS del script
// (normalizar, extraerNombre, levenshtein, buscarCliente) porque Apps
// Script no permite importar módulos. Si cambias una de esas funciones en
// scripts/recordatorios.js, DEBES copiarla aquí también o los tests
// validarán una versión desfasada. La regla: un cambio en el script →
// actualizar la copia aquí → volver a ejecutar `node tests/test-recordatorios.js`.
//
// Las funciones que usan APIs de Google (CalendarApp, SpreadsheetApp,
// GmailApp, DriveApp, PropertiesService) NO se pueden probar con node;
// se prueban a mano en Apps Script (ver docs/INSTALACION.md, Paso 4).
// ============================================

// --- Copia de las funciones puras del script principal ---

function normalizar(texto) {
  return texto.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// extraerNombre ahora recibe (nombrePila, tutor): prioriza la columna
// "Nombre de pila" y, si está vacía, hace fallback a la primera palabra
// del tutor. Así "María José López" saluda como "María José", no "María".
function extraerNombre(nombrePila, tutor) {
  if (nombrePila && nombrePila.toString().trim() !== "") {
    return nombrePila.toString().trim();
  }
  if (!tutor) return "";
  return tutor.toString().trim().split(" ")[0];
}

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
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + costo
      );
    }
  }
  return matrix[b.length][a.length];
}

// ============================================
// FUNCIONES PURAS PARA WHATSAPP (testeables con Node)
// ============================================

// Normaliza un teléfono a formato internacional sin + (p.ej. 34600111222).
// - Quita espacios, guiones, puntos, paréntesis.
// - Quita + inicial y 00 inicial.
// - Si no empieza por el PREFIJO_TELEFONO, lo añade.
// - Si queda vacío o sin dígitos, devuelve "".
function normalizarTelefono(tel, prefijo) {
  if (!tel) return "";
  var s = tel.toString().replace(/[\s\-\(\)\.]/g, "");
  // quita + o 00 inicial
  if (s.startsWith("+")) s = s.slice(1);
  else if (s.startsWith("00")) s = s.slice(2);
  // si ya tiene el prefijo (p.ej. 34...), déjalo
  if (prefijo && s.startsWith(prefijo)) return s;
  // si es 9 dígitos (móvil España sin prefijo), añade prefijo
  if (/^\d{9}$/.test(s) && prefijo) return prefijo + s;
  // si tiene dígitos pero no prefijo conocido, añade prefijo por seguridad
  if (/\d/.test(s) && prefijo) return prefijo + s;
  return "";
}

// Devuelve el texto del mensaje de WhatsApp (corto, sin HTML).
function textoWhatsApp(nombre, perro, fecha, hora) {
  return "Hola " + nombre + " 🐶 " + perro + " tiene sesión mañana (" + fecha + ") a las " + hora + ". Si necesitas cambiar la hora, avísame. ¡Os espero! — Andrea";
}

// Construye el enlace wa.me con el texto codificado.
function buildWaLink(tel, texto) {
  return "https://wa.me/" + tel + "?text=" + encodeURIComponent(texto);
}

// ============================================
// BÚSQUEDA FLEXIBLE DE CLIENTES
// ============================================

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

  return null;
}

// mensajeSimpleError: convierte un error técnico en un mensaje simple y
// accionable para una persona no técnica (Andrea). Es pura (no usa APIs de
// Google), así que la copiamos aquí para probarla con Node.
function mensajeSimpleError(error) {
  var msg = (error && error.message) ? error.message : String(error);

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

  return "Ha habido un problema con los recordatorios automáticos de hoy y no se han podido enviar.\n\n" +
    "No te preocupes, no se ha perdido ninguna cita. Como no estoy segura de la causa, " +
    "lo mejor es que avises a quien te instaló el sistema para que lo revise. " +
    "Mientras tanto, si necesitas enviar algún recordatorio urgente, puedes hacerlo a mano.";
}

// --- Framework de pruebas mínimo ---

var passed = 0;
var failed = 0;

function assert(nombre, resultado, esperado) {
  if (resultado === esperado) {
    passed++;
    console.log("  ✓ " + nombre);
  } else {
    failed++;
    console.log("  ✗ " + nombre);
    console.log("    Esperado: " + JSON.stringify(esperado));
    console.log("    Obtenido: " + JSON.stringify(resultado));
  }
}

// ============================================
// SUITE 1: normalizar()
// ============================================
console.log("\n=== normalizar() ===");

assert("minúsculas", normalizar("TOBY"), "toby");
assert("tildes", normalizar("María"), "maria");
assert("tildes compuestas", normalizar(" Pérez "), "perez");
assert("espacios extra", normalizar("  Toby  "), "toby");
assert("ñ se mantiene (sin tilde Unicode)", normalizar("Peña"), "pena");
assert("string vacío", normalizar(""), "");
assert("número pasado como string", normalizar(123), "123");
assert("caso normal", normalizar("Toby"), "toby");

// ============================================
// SUITE 2: extraerNombre() — con columna "Nombre de pila"
// ============================================
console.log("\n=== extraerNombre() ===");

// Prioriza la columna "Nombre de pila" cuando está rellena
assert("nombre de pila relleno → lo usa", extraerNombre("María José", "María José López"), "María José");
assert("nombre de pila simple", extraerNombre("Laura", "Laura Martín"), "Laura");
assert("nombre de pila con espacios extra", extraerNombre("  Carlos  ", "Carlos Ruiz"), "Carlos");

// Fallback: columna vacía → primera palabra del tutor
assert("columna vacía → fallback primer palabra", extraerNombre("", "Laura Martín"), "Laura");
assert("columna null → fallback", extraerNombre(null, "Carlos Ruiz"), "Carlos");
assert("columna undefined → fallback", extraerNombre(undefined, "María Fernández"), "María");
assert("ambos vacíos", extraerNombre("", ""), "");
assert("ambos null", extraerNombre(null, null), "");

// Caso problemático que motivó la columna nueva: nombre compuesto sin rellenar
// Aquí el fallback corta "María José" a "María" — por eso se recomienda
// rellenar la columna "Nombre de pila" para nombres compuestos.
assert("compuesto sin rellenar → fallback corta (limitación conocida)", extraerNombre("", "María José López"), "María");

// ============================================
// SUITE 3: levenshtein() — etiquetas honestas
// Cada test prueba EXACTAMENTE lo que dice su etiqueta.
// ============================================
console.log("\n=== levenshtein() ===");

assert("0 diferencias (iguales)", levenshtein("toby", "toby"), 0);
assert("1 sustitución real (b→d)", levenshtein("toby", "tody"), 1);
assert("1 inserción al final", levenshtein("toby", "tobyy"), 1);
assert("1 inserción al principio", levenshtein("toby", "xtoby"), 1);
assert("1 borrado al final", levenshtein("tobyy", "toby"), 1);
assert("1 borrado al principio", levenshtein("xtoby", "toby"), 1);
assert("1 cambio medio (letra cambiada)", levenshtein("toby", "topy"), 1);
assert("2 errores reales", levenshtein("toby", "txyy"), 2);
assert("3 errores", levenshtein("toby", "xozz"), 3);
assert("completamente distinto", levenshtein("toby", "luna"), 4);
assert("string vacío vs uno", levenshtein("", "toby"), 4);
assert("ambos vacíos", levenshtein("", ""), 0);

// ============================================
// SUITE 5: normalizarTelefono() — formatos reales
// ============================================
console.log("\n=== normalizarTelefono() ===");

var PREFIJO = "34";

// Espacios, guiones, paréntesis, puntos
assert("con espacios", normalizarTelefono("600 111 222", PREFIJO), "34600111222");
assert("con guiones", normalizarTelefono("600-111-222", PREFIJO), "34600111222");
assert("con paréntesis", normalizarTelefono("(600) 111 222", PREFIJO), "34600111222");
assert("con puntos", normalizarTelefono("600.111.222", PREFIJO), "34600111222");

// + inicial
assert("con +34", normalizarTelefono("+34 600 111 222", PREFIJO), "34600111222");
assert("con + y espacios", normalizarTelefono("+34600111222", PREFIJO), "34600111222");

// 00 inicial
assert("con 0034", normalizarTelefono("0034600111222", PREFIJO), "34600111222");

// Ya tiene prefijo
assert("ya con prefijo 34", normalizarTelefono("34600111222", PREFIJO), "34600111222");

// 9 dígitos sin prefijo (móvil España)
assert("9 dígitos sin prefijo", normalizarTelefono("600111222", PREFIJO), "34600111222");
assert("9 dígitos con espacios", normalizarTelefono("600 111 222", PREFIJO), "34600111222");

// Vacíos y basura
assert("string vacío", normalizarTelefono("", PREFIJO), "");
assert("null", normalizarTelefono(null, PREFIJO), "");
assert("basura sin dígitos", normalizarTelefono("abc", PREFIJO), "");
assert("solo letras y símbolos", normalizarTelefono("---abc---", PREFIJO), "");
assert("undefined", normalizarTelefono(undefined, PREFIJO), "");

// Sin prefijo configurado
assert("sin prefijo configurado", normalizarTelefono("600111222", ""), "");

// ============================================
// SUITE 6: buildWaLink() — encoding correcto
// ============================================
console.log("\n=== buildWaLink() ===");

var telLimpio = "34600111222";

assert("texto simple", buildWaLink(telLimpio, "Hola mundo"),
  "https://wa.me/34600111222?text=Hola%20mundo");
assert("con acentos", buildWaLink(telLimpio, "María José"),
  "https://wa.me/34600111222?text=Mar%C3%ADa%20Jos%C3%A9");
assert("con emoji", buildWaLink(telLimpio, "Hola 🐶"),
  "https://wa.me/34600111222?text=Hola%20%F0%9F%90%B6");
assert("con saltos de línea", buildWaLink(telLimpio, "Hola\nMundo"),
  "https://wa.me/34600111222?text=Hola%0AMundo");
assert("URL ya codificada no se doble-codifica", buildWaLink(telLimpio, "a%20b"),
  "https://wa.me/34600111222?text=a%2520b");

// ============================================
// SUITE 7: textoWhatsApp() — formato del mensaje
// ============================================
console.log("\n=== textoWhatsApp() ===");

assert("mensaje completo", textoWhatsApp("María José", "Luna", "08/09", "10:30"),
  "Hola María José 🐶 Luna tiene sesión mañana (08/09) a las 10:30. Si necesitas cambiar la hora, avísame. ¡Os espero! — Andrea");
assert("sin nombre de pila (vacío)", textoWhatsApp("", "Toby", "09/09", "11:00"),
  "Hola  🐶 Toby tiene sesión mañana (09/09) a las 11:00. Si necesitas cambiar la hora, avísame. ¡Os espero! — Andrea");
assert("nombre simple", textoWhatsApp("Laura", "Rocky", "10/09", "12:00"),
  "Hola Laura 🐶 Rocky tiene sesión mañana (10/09) a las 12:00. Si necesitas cambiar la hora, avísame. ¡Os espero! — Andrea");

// ============================================
// SUITE 4: buscarCliente() — escenarios reales
// ============================================
console.log("\n=== buscarCliente() — escenarios reales ===");

// Base de clientes simulada (estructura nueva con nombrePila)
var clientes = {
  "toby": { perro: "Toby", tutor: "Laura Martín", nombrePila: "Laura", email: "laura@mail.com" },
  "luna": { perro: "Luna", tutor: "Carlos Ruiz", nombrePila: "Carlos", email: "carlos@mail.com" },
  "rocky": { perro: "Rocky", tutor: "María José Fernández", nombrePila: "María José", email: "maria@mail.com" },
  "milo": { perro: "Milo", tutor: "Ana López", nombrePila: "Ana", email: "ana@mail.com" },
  "bruno": { perro: "Bruno", tutor: "Pedro Gómez", nombrePila: "Pedro", email: "" },
  "max": { perro: "Max", tutor: "Lucía Sánchez", nombrePila: "Lucía", email: "lucia@mail.com" },
  "coco": { perro: "Coco", tutor: "Jorge Díaz", nombrePila: "Jorge", email: "jorge@mail.com" }
};

// --- Búsqueda exacta ---
assert("exacto: Toby", buscarCliente("toby", clientes).perro, "Toby");
assert("exacto: Luna", buscarCliente("luna", clientes).perro, "Luna");
assert("exacto: Rocky", buscarCliente("rocky", clientes).perro, "Rocky");

// --- Búsqueda por prefijo ---
assert("prefijo: 'Tob' → Toby", buscarCliente("tob", clientes).perro, "Toby");
assert("prefijo: 'Lu' → Luna", buscarCliente("lu", clientes).perro, "Luna");
assert("prefijo: 'Roc' → Rocky", buscarCliente("roc", clientes).perro, "Rocky");
assert("prefijo: 'Mil' → Milo", buscarCliente("mil", clientes).perro, "Milo");

// --- Levenshtein: errores de escritura comunes ---
assert("typo: 'Tobyy' → Toby (1 letra de más)", buscarCliente("tobyy", clientes).perro, "Toby");
assert("typo: 'Lna' → Luna (falta una letra)", buscarCliente("lna", clientes).perro, "Luna");
assert("typo: 'Cocoo' → Coco (1 letra de más)", buscarCliente("cocoo", clientes).perro, "Coco");
assert("typo: 'Mila' → Milo (1 letra cambiada)", buscarCliente("mila", clientes).perro, "Milo");

// --- Casos que NO deben matchear ---
assert("inexistente: 'firulais' → null", buscarCliente("firulais", clientes), null);
assert("inexistente: 'abc' → null", buscarCliente("abc", clientes), null);
assert("vacío → null", buscarCliente("", clientes), null);

// --- Ambigüedad: varios candidatos ---
var clientesAmbiguos = {
  "coco": { perro: "Coco", tutor: "Jorge", nombrePila: "Jorge", email: "jorge@mail.com" },
  "coca": { perro: "Coca", tutor: "Laura", nombrePila: "Laura", email: "laura@mail.com" }
};
assert("ambigüedad prefijo: 'coc' con 2 candidatos → null", buscarCliente("coc", clientesAmbiguos), null);
assert("ambigüedad exacto: 'coca' → Coca (exacto)", buscarCliente("coca", clientesAmbiguos).perro, "Coca");
assert("ambigüedad Levenshtein: 'cocoo' → Coco (1 error, único candidato)", buscarCliente("cocoo", clientesAmbiguos).perro, "Coco");

// ============================================
// SUITE 5: mensajeSimpleError() — avisos para Andrea
// Comprueba que los errores que ella puede arreglar le dan pasos
// concretos y NO la derivan al gestor; los que no puede arreglar sí.
// ============================================
console.log("\n=== mensajeSimpleError() — avisos para Andrea ===");

// Error arreglable por Andrea: pestaña Clientes renombrada/borrada
var errClientes = new Error("No existe la pestaña 'Clientes'. Créala con las cabeceras (ver docs/INSTALACION.md).");
var msgClientes = mensajeSimpleError(errClientes);
assert("Clientes: menciona la pestaña Clientes", msgClientes.indexOf("'Clientes'") !== -1, true);
assert("Clientes: da pasos para arreglarlo", msgClientes.indexOf("Cómo arreglarlo") !== -1, true);
assert("Clientes: NO la deriva al gestor (ella lo arregla)", msgClientes.indexOf("avises a quien te instaló") === -1, true);

// Error arreglable por Andrea: pestaña Log renombrada/borrada
var errLog = new Error("No existe la pestaña 'Log'. Créala con las cabeceras (ver docs/INSTALACION.md).");
var msgLog = mensajeSimpleError(errLog);
assert("Log: menciona la pestaña Log", msgLog.indexOf("'Log'") !== -1, true);
assert("Log: da pasos para arreglarlo", msgLog.indexOf("Cómo arreglarlo") !== -1, true);
assert("Log: NO la deriva al gestor (ella lo arregla)", msgLog.indexOf("avises a quien te instaló") === -1, true);

// Error NO arreglable por Andrea: la deriva al gestor con honestidad
var errDesconocido = new Error("Exceeded daily email quota");
var msgDesc = mensajeSimpleError(errDesconocido);
assert("Desconocido: la deriva al gestor", msgDesc.indexOf("avises a quien te instaló") !== -1, true);
assert("Desconocido: la tranquiliza (no se ha perdido nada)", msgDesc.indexOf("no se ha perdido ninguna cita") !== -1, true);

// ============================================
// RESUMEN
// ============================================
console.log("\n" + "=".repeat(40));
console.log("Resultados: " + passed + " pasaron, " + failed + " fallaron");
console.log("=".repeat(40));

if (failed > 0) {
  process.exit(1);
} else {
  console.log("¡Todas las pruebas pasaron!\n");
}
