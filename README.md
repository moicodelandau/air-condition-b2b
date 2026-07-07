# AC Scanner 📱❄️ → Google Sheet

A phone-friendly web app for scanning air-conditioner units in the field and
logging them straight into a Google Sheet. No app store, no server — just a
web page and a Google Apps Script.

**What it does**

- 📷 Scans barcodes / QR codes on AC unit labels with the phone camera
  (serial numbers, model stickers, asset tags).
- 📝 Captures unit details: brand, model, type (split / VRF / cassette / …),
  BTU capacity, location, condition, notes.
- 🖼️ Optional photo of the nameplate — saved to Google Drive and linked in
  the sheet.
- 📊 Every scan is appended as a row in your Google Sheet, with a timestamp.
- 📴 Works offline — scans are queued on the phone and synced automatically
  when the connection is back.
- ⚠️ Warns if the same serial was already scanned on this device.

---

## Setup (one time, ~5 minutes)

### 1. Create the Google Sheet endpoint

1. Create a new [Google Sheet](https://sheets.new) (name it anything, e.g.
   "AC Inventory").
2. In the sheet: **Extensions → Apps Script**.
3. Delete the placeholder code and paste the entire contents of
   [`apps-script/Code.gs`](apps-script/Code.gs).
4. Click **Deploy → New deployment**, choose type **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Authorize when prompted, then **copy the Web app URL** (it ends with
   `/exec`).

> The URL is unguessable but public — anyone with it could add rows.
> Don't share it beyond your team. To rotate it, create a new deployment.

### 2. Host the scanner page

The scanner is a single static page (`index.html`). Easiest option —
**GitHub Pages**:

1. In this repo: **Settings → Pages → Source: Deploy from a branch**,
   pick your branch and `/ (root)`.
2. Open the published URL on your phone.

(Any static hosting works — Netlify, Vercel, an intranet server. It must be
served over **HTTPS**, otherwise the browser blocks camera access.)

### 3. Connect them

1. Open the scanner page on your phone — the settings dialog opens
   automatically (or tap ⚙️).
2. Paste the Web app URL, tap **Test connection**, then **Save**.
3. On Android/Chrome you can use "Add to Home screen" to get an app-like
   icon.

---

## Daily use

1. Tap **📷 Start scanning** and point the camera at the unit's barcode.
   The serial number fills in automatically (beep + vibration).
   No barcode? Just type the serial by hand.
2. Fill in whatever details you want — only the serial is required.
3. Optionally snap a photo of the nameplate.
4. Tap **✅ Save to sheet** — the row appears in your Google Sheet instantly.

If there's no signal (basements, machine rooms…), scans are stored on the
phone and a yellow **"waiting to sync"** bar appears. They upload
automatically when you're back online, or tap **Sync now**.

## Sheet columns

| Timestamp | Serial | Brand | Model | Type | BTU | Location | Condition | Notes | Photo |
|-----------|--------|-------|-------|------|-----|----------|-----------|-------|-------|

Photos land in a Drive folder called **"AC Scanner Photos"**, linked from the
Photo column.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The scanner app (single page, runs on the phone) |
| `apps-script/Code.gs` | Google Apps Script — receives scans, writes to the sheet |
| `manifest.webmanifest` | Lets the page install as a home-screen app |
