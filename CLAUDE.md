# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout — read this first

Despite the repo name (`air-condition-b2b`), this is a **multi-project repository**: each branch holds a completely independent project with **no shared git history** (disjoint root commits). Never merge or rebase these branches into each other.

| Branch | Project |
|---|---|
| `claude/mother-baby-care-center-6htzbh` (**default branch**) | "An Nhiên Care" — Vietnamese landing page for a mother & baby care center |
| `claude/ac-scanner-phone-sheet-vqxx0m` | AC Scanner — phone web app that scans air-conditioner barcodes into a Google Sheet |
| `claude/tap-record-notebook-4kpedy` | Tap & Record Notebook — Node/Express PWA that captures voice/video/photo/text notes and processes them with the Claude API |

To work on a project, base your branch on **that project's branch**, not the default branch. Each branch has its own README.md with setup detail — consult it before making changes.

There is no CI, no test suite, and no linter on any branch.

## Project 1: An Nhiên Care landing page (default branch)

Static site — plain HTML/CSS/JS, no build step, no dependencies. All user-facing text is **Vietnamese**; keep new copy in Vietnamese.

**Run:** open `index.html` directly, or `python3 -m http.server 8000`.

- `index.html` — entire page content (services, pricing `#bang-gia`, process, team, testimonials, FAQ, booking form). Business info (name "An Nhiên", hotline "0900 123 456") is hardcoded here.
- `css/style.css` — theme colors are CSS variables (`--primary`, `--accent`) at the top of the file.
- `js/main.js` — mobile nav toggle + booking form. Phone validation expects Vietnamese format (`/^0\d{9,10}$/`). Form submission is a **demo**: it saves to localStorage; a real deployment replaces that block with a `fetch()` to an API/Google Form/Zalo OA.
- `docs/` — marketing plan documents (Markdown + standalone HTML), not linked from the site.

## Project 2: AC Scanner (`claude/ac-scanner-phone-sheet-vqxx0m`)

Two decoupled halves connected only by a URL pasted at runtime:

1. `index.html` — single-file static app (all JS inline) run on a phone. Barcode scanning via the `html5-qrcode` CDN library. Offline-first: the Apps Script Web-app URL and a queue of unsent scans live in localStorage; scans POST as JSON to the URL and sync automatically when back online. `manifest.webmanifest` makes it installable. Must be served over HTTPS for camera access (README suggests GitHub Pages).
2. `apps-script/Code.gs` — Google Apps Script the user pastes into their own Sheet and deploys as a Web app. `doPost` appends a row to the "Scans" tab and saves base64 photos to a Drive folder ("AC Scanner Photos"); `doGet` answers the app's "Test connection" button. It is deployed manually by the user — changes here don't take effect until the user redeploys.

If you change the scan payload fields in `index.html`, update the matching column handling in `Code.gs` (and vice versa) — the sheet columns are: Timestamp, Serial, Brand, Model, Type, BTU, Location, Condition, Notes, Photo.

## Project 3: Tap & Record Notebook (`claude/tap-record-notebook-4kpedy`)

Node ≥18, ES modules, two dependencies (`express`, `@anthropic-ai/sdk`).

**Run:**
```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npm start        # http://localhost:3000
npm run dev      # node --watch
```
Without an API key the app degrades gracefully: captures are saved to an "Inbox" category with no AI processing.

- `server.js` — the whole backend: Express static host + JSON API, note storage, and Claude calls. Notes persist in `data/notes.json` (gitignored) via an atomic write queue (tmp file + rename). Claude calls use structured outputs against `NOTE_SCHEMA` (title/summary/category/tags/ideas/follow_ups); model defaults to `claude-opus-4-8`, overridable via `CLAUDE_MODEL`; port via `PORT`.
- `public/` — vanilla-JS PWA frontend (`app.js`, `sw.js` service worker, `manifest.json`). Media handling happens client-side because the Claude API takes images but not audio/video: voice → Web Speech API transcript, video → transcript + up to 6 sampled JPEG frames, photos → downscaled to ≤1568px.

The API key stays on the server; the frontend never calls Anthropic directly — preserve that boundary.
