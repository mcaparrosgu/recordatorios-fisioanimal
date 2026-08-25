# AGENTS.md — Recordatorios Fisioanimal

## What this is

Google Apps Script project for automated dog physiotherapy appointment reminders. Single script file, no build system, no local tests.

## Key files

- `scripts/recordatorios.js` — the entire application (deployed to Google Apps Script)
- `tests/test-recordatorios.js` — unit tests for the pure functions (run with `node`)
- `docs/INSTALACION.md` — step-by-step setup guide for the user
- `docs/okf/` — project documentation (OKF format)

## How it works

1. User creates appointments in Google Calendar with dog names as titles
2. Script runs daily at 10:00 and 20:00 via Apps Script triggers
3. For each appointment, looks up the dog in Google Sheets "Clientes" tab
4. Sends email reminder to the dog owner (tutor), using the "Nombre de pila (saludo)" column for the greeting
5. Deduplicates by **Calendar event ID** (stored in Log column H) so two same-day appointments for the same dog don't cancel each other
6. Logs all activity to "Log" tab (batch write), sends a summary email to manager — always, even on a day with no appointments
7. On any fatal error, sends an alert email to the manager (no silent failures). If `EMAIL_ALERTA_ANDREA` is configured, also sends Andrea a simple, actionable message — for errors she can fix herself (renamed sheet), it gives her the steps instead of escalating to the manager.

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
- **Configuration:** All tunable values live in the `CONFIG` block at the top of the script. They can be overridden per-deployment via **Script properties** (Project Settings → Script properties) without editing code: `EMAIL_RESUMEN`, `EMAIL_ALERTA_ANDREA`, `LOGO_DRIVE_ID`, `SPREADSHEET_ID`, `HOJA_CLIENTES`, `HOJA_LOG`, `TZ`.
- **Sheet schema — Clientes:** `A Perro/a | B Tutor/a | C Nombre de pila (saludo) | D Email | E Teléfono | F Notas`. Column C (Nombre de pila) is optional but recommended for compound Spanish names (María José, Juan Carlos…). If empty, the script falls back to the first word of column B.
- **Sheet schema — Log:** `A Fecha | B Perro | C Tutor | D Email | E Estado | F Hora cita | G Ejecutado | H Id Evento`. Column H is auto-filled by the script with the Calendar event ID; never write to it manually.
- **Deduplication:** Keyed on the Calendar **event ID** (column H), NOT on the dog name. This means: two appointments for the same dog at different times each get their own reminder. Clear the Log to re-send reminders. If upgrading from an older version, clear the Log before the first run with the new code (old rows lack the event ID).
- **Tests copy-paste contract:** `tests/test-recordatorios.js` re-declares the pure functions (`normalizar`, `extraerNombre`, `levenshtein`, `buscarCliente`) by hand because Apps Script can't be imported into Node. **If you change one of these functions in the script, you MUST copy the change into the test file** or tests validate a stale copy. Functions that call Google APIs can't be unit-tested in Node — test them manually in Apps Script.
- **Email limit:** Gmail personal accounts allow 500 emails/day. This project stays well under that.
- **Testing in Apps Script:** Create test events in Calendar with dog names from the "Clientes" sheet. Check "Log" tab for results. To test the error alert, temporarily rename the "Clientes" tab and run — you should get an "⚠️ Error" email.
