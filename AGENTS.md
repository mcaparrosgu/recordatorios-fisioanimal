# AGENTS.md — Recordatorios Fisioanimal

## What this is

Google Apps Script project for automated dog physiotherapy appointment reminders. Single script file, no build system, no local tests.

## Key files

- `scripts/recordatorios.js` — the entire application (deployed to Google Apps Script)
- `tests/test-recordatorios.js` — unit tests for the pure functions (run with `node`)
- `docs/INSTALACION.md` — step-by-step setup guide for the user
- `docs/okf/` — project documentation (OKF format)
- `docs/PLAN-WHATSAPP.md` — detailed implementation plan for the WhatsApp `wa.me` flow

## How it works (nuevo flujo WhatsApp + email de seguridad)

1. User creates appointments in Google Calendar with dog names as titles
2. **Trigger 10:00** — `enviarRecordatorios()`:
   - Reads tomorrow's events from Calendar
   - Builds the "WhatsApp" tab with clickable `wa.me` links (dog name = link) and checkboxes for "Enviado"
   - Sends email **only to clients without phone** (their only channel)
   - Logs activity to "Log" tab, sends summary email to manager
3. **Andrea (afternoon)** — opens "WhatsApp" tab, taps dog name → WhatsApp opens with message pre-filled → sends → marks ✅
4. **Trigger 22:00** — `enviarRecordatoriosRefuerzo()`:
   - Refreshes "WhatsApp" tab (adds new, removes cancelled, **preserves ✅ checkboxes**)
   - Sends **refuerzo email** to clients with phone whose checkbox is still unchecked (WhatsApp not sent/failed)
   - Logs and sends summary
5. Deduplicates by **Calendar event ID** (Log column H) — prevents double sends across both triggers
6. On any fatal error, sends alert email to manager (no silent failures). If `EMAIL_ALERTA_ANDREA` is configured, also sends Andrea a simple, actionable message.

## Development workflow

**There is no local dev server for the Google APIs.** The script runs inside Google's Apps Script environment. The pure functions (no Google APIs) DO have unit tests runnable locally with Node.

To test or deploy:
1. Open the Google Sheet → **Extensions → Apps Script** (NOT script.google.com standalone, or `getActiveSpreadsheet()` returns null)
2. Paste code from `scripts/recordatorios.js`
3. Run manually (▶️) or let triggers execute

To run the unit tests (no Google account needed):
```bash
node tests/test-recordatorios.js
```

## Gotchas

- **No npm, no node, no local execution of the full script.** This is pure Google Apps Script (V8 runtime). Only the pure functions in `tests/` run under Node.
- **APIs used:** `CalendarApp`, `SpreadsheetApp`, `GmailApp`, `DriveApp`, `PropertiesService` — all Google built-ins, no imports needed.
- **Timezone:** Configurable via `CONFIG.TZ` (default `Europe/Madrid`). Used in every `Utilities.formatDate` call — change it in one place now.
- **Configuration:** All tunable values live in the `CONFIG` block at the top of the script. They can be overridden per-deployment via **Script properties** (Project Settings → Script properties) without editing code: `EMAIL_RESUMEN`, `EMAIL_ALERTA_ANDREA`, `LOGO_DRIVE_ID`, `SPREADSHEET_ID`, `HOJA_CLIENTES`, `HOJA_LOG`, `HOJA_WHATSAPP`, `TZ`, `PREFIJO_TELEFONO`.
- **Sheet schema — Clientes:** `A Perro/a | B Tutor/a | C Nombre de pila (saludo) | D Email | E Teléfono | F Notas`. Column C (Nombre de pila) is optional but recommended for compound Spanish names (María José, Juan Carlos…). If empty, the script falls back to the first word of column B.
- **Sheet schema — Log:** `A Fecha | B Perro | C Tutor | D Email | E Estado | F Hora cita | G Ejecutado | H Id Evento`. Column H is auto-filled by the script with the Calendar event ID; never write to it manually.
- **Sheet schema — WhatsApp:** `A Fecha cita | B Hora | C Perro (enlace wa.me) | D Tutor/a | E Teléfono | F Enviado (casilla) | G Id Evento (oculta)`. Column G is hidden and used for dedup/merge across triggers.
- **Deduplication:** Keyed on the Calendar **event ID** (Log column H and WhatsApp hidden column G), NOT on the dog name. This means: two appointments for the same dog at different times each get their own reminder. Clear the Log to re-send reminders. If upgrading from an older version, clear the Log before the first run with the new code (old rows lack the event ID).
- **Tests copy-paste contract:** `tests/test-recordatorios.js` re-declares the pure functions (`normalizar`, `extraerNombre`, `levenshtein`, `buscarCliente`, `normalizarTelefono`, `textoWhatsApp`, `buildWaLink`, `mensajeSimpleError`) by hand because Apps Script can't be imported into Node. **If you change one of these functions in the script, you MUST copy the change into the test file** or tests validate a stale copy. Functions that call Google APIs can't be unit-tested in Node — test them manually in Apps Script.
- **Email limit:** Gmail personal accounts allow 500 emails/day. This project stays well under that.
- **Testing in Apps Script:** Create test events in Calendar with dog names from the "Clientes" sheet. Check "Log" tab for results. To test the error alert, temporarily rename the "Clientes" tab and run — you should get an "⚠️ Error" email.

## Deployment steps (para la cuenta de Andrea)

1. Open Andrea's Google Sheet → **Extensions → Apps Script** (NOT script.google.com standalone).
2. Replace default code with `scripts/recordatorios.js`.
3. Configure via **Script properties** (⚙️ Project Settings → Script properties) — recommended to avoid code changes:
   - `EMAIL_RESUMEN` — manager's email for daily summary
   - `EMAIL_ALERTA_ANDREA` — Andrea's email for simple error alerts (optional)
   - `LOGO_DRIVE_ID` — Drive file ID of the logo (upload to Andrea's Drive first)
   - `TZ` — timezone (default `Europe/Madrid`)
   - `HOJA_CLIENTES`, `HOJA_LOG`, `HOJA_WHATSAPP`, `SPREADSHEET_ID` — only if sheet names differ
4. Save → **Run ▶️ `enviarRecordatorios`** once to grant OAuth permissions (accept "Advanced → Go to... → Allow").
5. Create two **Triggers** (⏰ icon):
   - `enviarRecordatorios` — Time-driven — Daily — 10:00 — Europe/Madrid
   - `enviarRecordatoriosRefuerzo` — Time-driven — Daily — 22:00 — Europe/Madrid
6. Populate "Clientes" tab with real data: Perro/a, Tutor/a, Nombre de pila, Email, **Teléfono** (required for WhatsApp), Notas.
7. Test: create tomorrow's event in Calendar with a dog name from "Clientes" → run ▶️ `enviarRecordatorios` → verify "WhatsApp" tab appears with clickable dog name → tap → WhatsApp opens with message → send → mark ✅.