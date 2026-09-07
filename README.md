# Recordatorios Fisioanimal

Sistema de recordatorios automáticos por email para clientas de fisioterapia canina. Funciona con Google Calendar + Sheets + Gmail + Drive, sin servidores externos ni coste.

## Estado

**Funcionando en entorno de pruebas (27/08: ejecución automática confirmada).** Los triggers disparan solos a las 10:00 y 20:00 y el resumen diario llega sin intervención manual. Los correos se envían en HTML con el logo de Fisioanimal incrustado. **Descubrimiento:** Andrea usa agenda física, no Google Calendar. El script lee las citas de Calendar. Andrea tiene que meter las citas en Google Calendar. Ver [`docs/GUIA-CUENTA-GOOGLE-ANDREA.md`](docs/GUIA-CUENTA-GOOGLE-ANDREA.md).

**Documentos de referencia:**
- [`docs/GUIA-CUENTA-GOOGLE-ANDREA.md`](docs/GUIA-CUENTA-GOOGLE-ANDREA.md) — guía completa para crear cuenta de Google de Andrea y configurar todo
- [`docs/HOJA-RUTA-ANDREA.md`](docs/HOJA-RUTA-ANDREA.md) — hoja de ruta completa: qué hacer sola, qué necesitas de ella, y la reunión paso a paso
- [`docs/HOJA-ANDREA-1PAGINA.md`](docs/HOJA-ANDREA-1PAGINA.md) — resumen de 1 página para que Andrea entienda el sistema
- **Google Docs formateados:**
  - Hoja ruta: https://docs.google.com/document/d/1fx75LmsxqJuK5bNU8THWLpBAvyfVPQjNf6aAb_kJnGE/edit
  - Plan trabajo: https://docs.google.com/document/d/1MEAoFyXhYPdExCP9iT-VTyN2JZJ_sa0j8NNaB73pvMo/edit
  - 1 página: https://docs.google.com/document/d/1QvIP-XyKxF1JaFTSOn6vhTrh836KSoAJICx_vlG0mt4/edit

## Qué hace

1. Andrea crea una cita en Google Calendar con el nombre del perro como título (después de anotarla en su agenda física)
2. El script busca al tutor en Google Sheets y le envía un email de recordatorio en HTML
3. Cada noche hace una segunda pasada por si hubo citas nuevas tras las 10:00
4. El gestor recibe un email-resumen con todo lo que pasó

## Características

- Email en **HTML** con logo incrustado (sin emojis con interrogantes)
- Mensaje personalizado: "Hola {nombre}, {perro} tiene cita mañana {dd/mm/aa} a las {hh:mm}h"
- Columna **"Nombre de pila (saludo)"** para saludar bien a nombres compuestos (María José, Juan Carlos…)
- Deduplicación por **ID de evento de Calendar**: dos citas del mismo perro a distintas horas no se anulan
- Log con todos los envíos y errores en la hoja "Log"
- Logo con fondo transparente procesado y subido a Google Drive
- Email de **alerta automática** si el script falla (no hay errores mudos). Si se configura el email de Andrea (`EMAIL_ALERTA_ANDREA`), ella también recibe un aviso **simple y con pasos** para arreglar lo que dependa de ella
- Resumen diario **siempre** (incluso si no hay citas, para saber que el script vive)
- Configuración centralizada en un bloque `CONFIG` (o Propiedades del script)

## Archivos clave

| Archivo | Qué es |
|---|---|
| `scripts/recordatorios.js` | El script completo (pegar en Apps Script desde la hoja) |
| `tests/test-recordatorios.js` | Pruebas de las funciones puras (ejecutar con `node`) |
| `logo_fisioanimal_transparent.png` | Logo con fondo transparente para el email |
| `docs/GUIA-CUENTA-GOOGLE-ANDREA.md` | Guía completa para crear cuenta de Google de Andrea (para principiante) |
| `docs/INSTALACION.md` | Guía paso a paso para instalar |
| `docs/HOJA-RUTA-ANDREA.md` | Hoja de ruta completa: qué hacer sola, qué necesitas de ella, y la reunión paso a paso |
| `docs/HOJA-ANDREA-1PAGINA.md` | Resumen de 1 página para que Andrea entienda el sistema |
| `docs/MEMORIA.md` | Síntesis del proyecto en lenguaje claro (qué, por qué y qué se arregló) |
| `docs/TAREAS-PENDIENTES.md` | Checklist completa del proyecto |
| `docs/okf/index.md` | Documentación técnica del proyecto (OKF) |
| `AGENTS.md` | Guía para agentes de código |

## Para empezar

Lee [`docs/INSTALACION.md`](docs/INSTALACION.md) — te lleva de la mano desde cero hasta tener los triggers funcionando.

## Tests

Las funciones puras (normalización, búsqueda de clientes, distancia de edición) tienen pruebas automáticas ejecutables con Node.js, sin necesidad de Apps Script:

```bash
node tests/test-recordatorios.js
```

## Contexto

- **Andrea**: fisioterapeuta canina. Agenda citas en su agenda física y en Google Calendar (para que el sistema las lea).
- **Gestor**: persona que instala y mantiene el sistema. Recibe los resúmenes.
