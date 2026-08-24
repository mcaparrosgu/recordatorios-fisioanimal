# AGENTS.md — Recordatorios Fisioanimal

## What this is

Google Apps Script project for automated dog physiotherapy appointment reminders. Single script file, no build system, no local tests.

## Key files

- `scripts/recordatorios.js` — the entire application (deployed to Google Apps Script)
- `docs/INSTALACION.md` — step-by-step setup guide for the user
- `docs/okf/` — project documentation (OKF format)

## How it works

1. User creates appointments in Google Calendar with dog names as titles
2. Script runs daily at 10:00 and 20:00 via Apps Script triggers
3. For each appointment, looks up the dog in Google Sheets "Clientes" tab
4. Sends email reminder to the dog owner (tutor)
5. Logs all activity to "Log" tab, sends summary email to manager

## Development workflow

**There is no local dev server.** The script runs inside Google's Apps Script environment.

To test or deploy:
1. Open `script.google.com`
2. Paste code from `scripts/recordatorios.js`
3. Run manually (▶️) or let triggers execute

## Gotchas

- **No npm, no node, no local execution.** This is pure Google Apps Script (V8 runtime).
- **APIs used:** `CalendarApp`, `SpreadsheetApp`, `GmailApp` — all Google built-ins, no imports needed.
- **Timezone:** Hardcoded to `Europe/Madrid`. If changing region, update all `Utilities.formatDate` calls.
- **Deduplication:** Uses the "Log" sheet to avoid resending. Clear the Log to re-send reminders.
- **Email limit:** Gmail personal accounts allow 500 emails/day. This project stays well under that.
- **Testing:** Create test events in Calendar with dog names from the "Clientes" sheet. Check "Log" tab for results.
