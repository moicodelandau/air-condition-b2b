# ⚡ Tap & Record Notebook

A one-tap capture notebook. Hit a button, record a **voice note, video, photo, or text snippet**, and Claude instantly:

- **Summarizes** it (cleaning up speech-recognition noise)
- **Brainstorms** 3–5 concrete ideas that push the thought further
- **Categorizes** it automatically (reusing your existing categories)
- Tags it and suggests follow-up questions

Notes land in a feed you can filter by category. Tap **💡 More ideas** on any note for a deeper brainstorm round.

## How it works

Claude's API accepts **images natively but not audio/video files**, so capture happens in the browser:

| Capture | What's sent to Claude |
|---|---|
| 🎤 Voice | Live transcript via the Web Speech API |
| 📹 Video | Live transcript + up to 6 frames sampled from the camera as JPEGs |
| 📷 Photo | The image itself (downscaled to ≤1568px), analyzed with Claude vision |
| ✏️ Text | The typed note |

The Node server holds your API key and calls `claude-opus-4-8` with adaptive thinking and structured outputs (guaranteed-valid JSON: title, summary, category, tags, ideas, follow-ups). Notes are stored in `data/notes.json`.

## Run it

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # or `ant auth login`
npm start                              # http://localhost:3000
```

Without an API key the app still works — captures are saved to an **Inbox** category without AI processing.

### Options

- `PORT` — server port (default `3000`)
- `CLAUDE_MODEL` — override the model (default `claude-opus-4-8`)

## Desktop usage

The app is fully usable on a computer — just run it and open http://localhost:3000 in Chrome or Edge:

- **Keyboard shortcuts:** <kbd>V</kbd> voice · <kbd>R</kbd> video · <kbd>P</kbd> photo · <kbd>T</kbd> text · <kbd>Esc</kbd> cancel · <kbd>Enter</kbd>/<kbd>Space</kbd> stop & process · <kbd>Ctrl+Enter</kbd> save a text note
- **Photo** opens a live **webcam** preview with a capture button (falls back to a file picker if no webcam)
- **Drag & drop** an image file anywhere on the page, or **paste a screenshot** (Ctrl+V) — it's captured and processed immediately
- Wide-screen grid layout for the notes feed

## Phone usage

It's a PWA — open it on your phone and "Add to Home Screen" for an app-like one-tap experience. Camera/microphone access requires **HTTPS** (or `localhost`), so put it behind a TLS proxy or a tunnel (e.g. `cloudflared`, `ngrok`) when using it from a phone.

Live speech transcription uses the Web Speech API (Chrome, Edge, Safari). In browsers without it (e.g. Firefox), voice/video still record but you'll be prompted to add the content as text.
