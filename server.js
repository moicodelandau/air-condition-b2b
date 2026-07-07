import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");
const PORT = process.env.PORT || 3000;
const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = new Anthropic();

// ---------- note storage (single JSON file) ----------

async function loadNotes() {
  try {
    return JSON.parse(await fs.readFile(NOTES_FILE, "utf8"));
  } catch {
    return [];
  }
}

let writeQueue = Promise.resolve();
function saveNotes(notes) {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = NOTES_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(notes, null, 2));
    await fs.rename(tmp, NOTES_FILE);
  });
  return writeQueue;
}

// ---------- Claude processing ----------

const NOTE_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Short, punchy title for this note (max 8 words)",
    },
    summary: {
      type: "string",
      description:
        "Clean, well-written summary of the captured content in 1-3 sentences. Fix speech-recognition errors from context.",
    },
    category: {
      type: "string",
      description:
        "Single best category. Reuse an existing category when one fits; otherwise create a concise new one (1-2 words, Title Case).",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "2-5 short lowercase topic tags",
    },
    ideas: {
      type: "array",
      items: { type: "string" },
      description:
        "3-5 brainstormed ideas that build on this note: next steps, angles to explore, connections, improvements. Each one concrete and actionable.",
    },
    follow_ups: {
      type: "array",
      items: { type: "string" },
      description: "1-3 open questions worth thinking about later",
    },
  },
  required: ["title", "summary", "category", "tags", "ideas", "follow_ups"],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You process quick captures from a personal tap-and-record notebook. Each capture is a raw voice transcript, video (transcript + frames), photo, or typed note — often fragmentary, mid-thought, or containing speech-recognition errors.

Your job:
1. Understand what the person was trying to capture (clean up transcription noise from context).
2. Summarize it clearly.
3. Brainstorm genuinely useful ideas that push the thought further — be a sharp thinking partner, not a paraphraser.
4. File it under one category. Prefer reusing the user's existing categories; only create a new category when nothing fits.`;

async function processCapture({ type, transcript, text, images, existingCategories }) {
  const content = [];

  for (const img of images || []) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType || "image/jpeg",
        data: img.data,
      },
    });
  }

  const parts = [`Capture type: ${type}`];
  if (existingCategories?.length) {
    parts.push(`Existing categories: ${existingCategories.join(", ")}`);
  }
  if (transcript) parts.push(`Voice transcript:\n${transcript}`);
  if (text) parts.push(`Typed note:\n${text}`);
  if (images?.length && type === "video") {
    parts.push(`The ${images.length} image(s) above are frames sampled from the recorded video.`);
  }
  if (images?.length && type === "image") {
    parts.push("The image above is the captured photo. Describe what matters in it as part of the summary.");
  }
  content.push({ type: "text", text: parts.join("\n\n") });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    output_config: { format: { type: "json_schema", schema: NOTE_SCHEMA } },
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return JSON.parse(textBlock.text);
}

// ---------- API ----------

app.get("/api/notes", async (_req, res) => {
  res.json(await loadNotes());
});

app.post("/api/notes", async (req, res) => {
  const { type, transcript, text, images, thumbnail } = req.body || {};
  if (!["voice", "video", "image", "text"].includes(type)) {
    return res.status(400).json({ error: "type must be voice, video, image, or text" });
  }
  if (!transcript && !text && !(images && images.length)) {
    return res.status(400).json({ error: "capture is empty" });
  }

  const notes = await loadNotes();
  const existingCategories = [...new Set(notes.map((n) => n.category).filter(Boolean))];

  const note = {
    id: crypto.randomUUID(),
    type,
    createdAt: new Date().toISOString(),
    transcript: transcript || null,
    text: text || null,
    thumbnail: thumbnail || null,
  };

  try {
    const ai = await processCapture({ type, transcript, text, images, existingCategories });
    Object.assign(note, ai, { processed: true });
  } catch (err) {
    console.error("Claude processing failed:", err.message);
    Object.assign(note, {
      processed: false,
      processingError: err.message,
      title: (transcript || text || "Untitled capture").slice(0, 60),
      summary: transcript || text || "",
      category: "Inbox",
      tags: [],
      ideas: [],
      follow_ups: [],
    });
  }

  notes.unshift(note);
  await saveNotes(notes);
  res.json(note);
});

app.post("/api/notes/:id/brainstorm", async (req, res) => {
  const notes = await loadNotes();
  const note = notes.find((n) => n.id === req.params.id);
  if (!note) return res.status(404).json({ error: "note not found" });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              ideas: {
                type: "array",
                items: { type: "string" },
                description: "5-8 fresh, deeper brainstormed ideas, distinct from the previous ones",
              },
            },
            required: ["ideas"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `Go deeper on this note. Previous ideas are listed — do not repeat them.\n\n` +
                `Title: ${note.title}\nSummary: ${note.summary}\n` +
                `Original capture: ${note.transcript || note.text || "(image only)"}\n` +
                `Previous ideas:\n${(note.ideas || []).map((i) => "- " + i).join("\n")}`,
            },
          ],
        },
      ],
    });
    const textBlock = response.content.find((b) => b.type === "text");
    const { ideas } = JSON.parse(textBlock.text);
    note.ideas = [...(note.ideas || []), ...ideas];
    await saveNotes(notes);
    res.json(note);
  } catch (err) {
    console.error("Brainstorm failed:", err.message);
    res.status(502).json({ error: err.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  const notes = await loadNotes();
  const next = notes.filter((n) => n.id !== req.params.id);
  if (next.length === notes.length) return res.status(404).json({ error: "note not found" });
  await saveNotes(next);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Tap & Record notebook running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "Note: ANTHROPIC_API_KEY is not set. Captures will be saved to Inbox without AI processing " +
        "(the SDK will also try ANTHROPIC_AUTH_TOKEN or an `ant auth login` profile)."
    );
  }
});
