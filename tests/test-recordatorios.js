// ============================================
// PRUEBAS — Funciones de recordatorios
// Ejecutar: node tests/test-recordatorios.js
// ============================================

// --- Copiar funciones del script principal ---

function normalizar(texto) {
  return texto.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extraerNombre(tutor) {
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
assert("ñ", normalizar("Peña"), "pena"); // Ñ no tiene tilde Unicode, se mantiene
assert("string vacío", normalizar(""), "");
assert("número", normalizar(123), "123");
assert("normal", normalizar("Toby"), "toby");

// ============================================
// SUITE 2: extraerNombre()
// ============================================
console.log("\n=== extraerNombre() ===");

assert("nombre + apellido", extraerNombre("Laura Martín"), "Laura");
assert("solo nombre", extraerNombre("Carlos"), "Carlos");
assert("sin apellido", extraerNombre("María Fernández"), "María");
assert("vacío", extraerNombre(""), "");
assert("null", extraerNombre(null), "");
assert("undefined", extraerNombre(undefined), "");

// ============================================
// SUITE 3: levenshtein()
// ============================================
console.log("\n=== levenshtein() ===");

assert("iguales", levenshtein("toby", "toby"), 0);
assert("1 sustitución", levenshtein("toby", "toby"), 0);
assert("1 sustitución real", levenshtein("toby", "tobyy"), 1);
assert("1 inserción", levenshtein("luna", "luna"), 0);
assert("1 borrado", levenshtein("luna", "lun"), 1);
assert("completamente distinto", levenshtein("toby", "luna"), 4);
assert("string vacío vs uno", levenshtein("", "toby"), 4);
assert("ambos vacíos", levenshtein("", ""), 0);
assert("1 cambio medio", levenshtein("toby", "toby"), 0);
assert("letra cambiada", levenshtein("toby", "topy"), 1);
assert("letra de más al final", levenshtein("toby", "tobyy"), 1);
assert("letra de menos al final", levenshtein("tobyy", "toby"), 1);
assert("letra de más al principio", levenshtein("toby", "xtoby"), 1);
assert("2 errores", levenshtein("toby", "toyy"), 1);
assert("3 errores", levenshtein("toby", "xozz"), 3);

// ============================================
// SUITE 4: buscarCliente() — Escenarios reales
// ============================================
console.log("\n=== buscarCliente() — escenarios reales ===");

// Base de clientes simulada (como la que tendría Andrea)
var clientes = {
  "toby": { perro: "Toby", tutor: "Laura Martín", email: "laura@mail.com" },
  "luna": { perro: "Luna", tutor: "Carlos Ruiz", email: "carlos@mail.com" },
  "rocky": { perro: "Rocky", tutor: "María Fernández", email: "maria@mail.com" },
  "milo": { perro: "Milo", tutor: "Ana López", email: "ana@mail.com" },
  "bruno": { perro: "Bruno", tutor: "Pedro Gómez", email: "" },
  "max": { perro: "Max", tutor: "Lucía Sánchez", email: "lucia@mail.com" },
  "coco": { perro: "Coco", tutor: "Jorge Díaz", email: "jorge@mail.com" }
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
assert("typo: 'Tobyy' → Toby", buscarCliente("tobyy", clientes).perro, "Toby");
assert("typo: 'Lna' → Luna (falta una letra)", buscarCliente("lna", clientes).perro, "Luna");
assert("typo: 'Lun' → Luna", buscarCliente("lun", clientes).perro, "Luna"); // prefijo
assert("typo: 'Rock' → Rocky", buscarCliente("rock", clientes).perro, "Rocky"); // prefijo
assert("typo: 'Cocoo' → Coco", buscarCliente("cocoo", clientes).perro, "Coco");
assert("typo: 'Mila' → Milo (letra cambiada)", buscarCliente("mila", clientes).perro, "Milo");
assert("typo: 'Toby' → Toby (exacto)", buscarCliente("toby", clientes).perro, "Toby");

// --- Casos que NO deben matchear ---
assert("inexistente: 'firulais' → null", buscarCliente("firulais", clientes), null);
assert("inexistente: 'abc' → null", buscarCliente("abc", clientes), null);
assert("vacío → null", buscarCliente("", clientes), null);

// --- Ambigüedad: Levenshtein con múltiples candidatos ---
// "coc" es prefijo de "coco" y "coca" → ambiguo, devuelve null
var clientesAmbiguos = {
  "coco": { perro: "Coco", tutor: "Jorge", email: "jorge@mail.com" },
  "coca": { perro: "Coca", tutor: "Laura", email: "laura@mail.com" }
};
assert("ambigüedad prefijo: 'coc' con 2 candidatos → null", buscarCliente("coc", clientesAmbiguos), null);
assert("ambigüedad exacto: 'coca' → Coca (exacto)", buscarCliente("coca", clientesAmbiguos).perro, "Coca");
assert("ambigüedad Levenshtein: 'cocoo' → Coco (1 error, único candidato)", buscarCliente("cocoo", clientesAmbiguos).perro, "Coco");

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
