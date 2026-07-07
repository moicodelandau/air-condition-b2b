/* Tap & Record — one-tap capture, processed by Claude on the server. */

const $ = (id) => document.getElementById(id);
const feed = $("feed");
const statusEl = $("status");
const categoryBar = $("categoryBar");

let notes = [];
let activeCategory = "All";

// ---------- status ----------
function setStatus(msg, busy = false) {
  statusEl.textContent = msg || "";
  statusEl.classList.toggle("busy", busy);
}

// ---------- rendering ----------
const TYPE_ICON = { voice: "🎤", video: "📹", image: "📷", text: "✏️" };

function render() {
  const cats = ["All", ...new Set(notes.map((n) => n.category).filter(Boolean))];
  categoryBar.innerHTML = "";
  for (const c of cats) {
    const chip = document.createElement("button");
    chip.className = "chip" + (c === activeCategory ? " active" : "");
    chip.textContent = c;
    chip.onclick = () => { activeCategory = c; render(); };
    categoryBar.appendChild(chip);
  }
  if (!cats.includes(activeCategory)) activeCategory = "All";

  const visible = activeCategory === "All" ? notes : notes.filter((n) => n.category === activeCategory);
  feed.innerHTML = "";
  $("empty")?.remove();
  if (!visible.length) {
    feed.innerHTML = `<div class="empty"><p>Nothing captured yet.</p><p>Tap a button below — Claude will summarize, brainstorm, and file it.</p></div>`;
    return;
  }
  for (const n of visible) feed.appendChild(noteCard(n));
}

function noteCard(n) {
  const el = document.createElement("article");
  el.className = "note" + (n.pending ? " pending" : "");
  el.dataset.id = n.id || "";

  const time = n.createdAt
    ? new Date(n.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  el.innerHTML = `
    <div class="note-head">
      <span class="note-type">${TYPE_ICON[n.type] || "📝"}</span>
      <span class="note-title"></span>
      <span class="note-time">${time}</span>
    </div>
    ${n.category ? `<span class="note-cat"></span>` : ""}
    ${n.thumbnail ? `<img class="note-thumb" alt="capture" />` : ""}
    <p class="note-summary"></p>
    ${n.tags?.length ? `<div class="note-tags"></div>` : ""}
    ${n.ideas?.length ? `
      <details class="ideas">
        <summary>${n.ideas.length} idea${n.ideas.length > 1 ? "s" : ""} from Claude</summary>
        <ul></ul>
        ${n.follow_ups?.length ? `<div class="followups"></div>` : ""}
      </details>` : ""}
    ${n.pending ? "" : `
      <div class="note-actions">
        <button class="act-more">💡 More ideas</button>
        <button class="act-del">🗑 Delete</button>
      </div>`}
  `;

  el.querySelector(".note-title").textContent = n.title || "Processing…";
  if (n.category) el.querySelector(".note-cat").textContent = n.category;
  if (n.thumbnail) el.querySelector(".note-thumb").src = n.thumbnail;
  el.querySelector(".note-summary").textContent = n.summary || n.transcript || n.text || "";
  if (n.tags?.length) el.querySelector(".note-tags").textContent = n.tags.map((t) => "#" + t).join("  ");
  if (n.ideas?.length) {
    const ul = el.querySelector("details.ideas ul");
    for (const idea of n.ideas) {
      const li = document.createElement("li");
      li.textContent = idea;
      ul.appendChild(li);
    }
    if (n.follow_ups?.length) {
      el.querySelector(".followups").textContent = "Worth asking: " + n.follow_ups.join(" · ");
    }
  }

  el.querySelector(".act-del")?.addEventListener("click", async () => {
    await fetch(`/api/notes/${n.id}`, { method: "DELETE" });
    notes = notes.filter((x) => x.id !== n.id);
    render();
  });
  el.querySelector(".act-more")?.addEventListener("click", async (e) => {
    e.target.textContent = "💡 Thinking…";
    try {
      const res = await fetch(`/api/notes/${n.id}/brainstorm`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      notes = notes.map((x) => (x.id === updated.id ? updated : x));
      render();
    } catch (err) {
      setStatus("Brainstorm failed: " + err.message);
      e.target.textContent = "💡 More ideas";
    }
  });

  return el;
}

// ---------- submit a capture ----------
async function submitCapture(payload) {
  const pending = { ...payload, pending: true, createdAt: new Date().toISOString(), id: "pending-" + Date.now() };
  notes.unshift(pending);
  render();
  setStatus("Sending to Claude…", true);
  try {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    const note = await res.json();
    notes = notes.map((n) => (n.id === pending.id ? note : n));
    setStatus(note.processed ? "Filed under " + note.category : "Saved (AI offline → Inbox)");
  } catch (err) {
    notes = notes.filter((n) => n.id !== pending.id);
    setStatus("Failed: " + err.message);
  }
  render();
  setTimeout(() => setStatus(""), 4000);
}

// ---------- speech recognition (voice + video) ----------
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

function startTranscription(onUpdate) {
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = navigator.language || "en-US";
  let finalText = "";
  rec.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript + " ";
      else interim += r[0].transcript;
    }
    onUpdate(finalText, interim);
  };
  rec.onerror = () => {};
  // Chrome stops recognition after silence — restart while recording.
  rec.onend = () => { if (rec._active) try { rec.start(); } catch {} };
  rec._active = true;
  rec.start();
  return {
    stop() {
      rec._active = false;
      try { rec.stop(); } catch {}
      return finalText.trim();
    },
  };
}

// ---------- recording overlay plumbing ----------
const overlay = $("recordOverlay");
const preview = $("preview");
const pulse = $("pulse");
const timerEl = $("timer");
const liveEl = $("liveTranscript");

let rec = null; // { stream, transcriber, timerId, mode, frames, canceled }

function openOverlay(mode) {
  overlay.hidden = false;
  preview.hidden = mode !== "video";
  pulse.hidden = mode === "video";
  liveEl.textContent = SR ? "" : "⚠️ Live transcription not supported in this browser — recording anyway; describe it in a text note if needed.";
  timerEl.textContent = "0:00";
}

function closeOverlay() {
  overlay.hidden = true;
  if (rec) {
    clearInterval(rec.timerId);
    rec.stream?.getTracks().forEach((t) => t.stop());
    rec = null;
  }
  preview.srcObject = null;
}

function startTimer() {
  const t0 = Date.now();
  return setInterval(() => {
    const s = Math.floor((Date.now() - t0) / 1000);
    timerEl.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }, 500);
}

// ---------- voice ----------
$("btnVoice").onclick = async () => {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    // Recognition can still work without our own stream in some browsers; require mic though.
    setStatus("Microphone access denied");
    return;
  }
  openOverlay("voice");
  const transcriber = startTranscription((final, interim) => {
    liveEl.textContent = final + interim;
  });
  rec = { stream, transcriber, timerId: startTimer(), mode: "voice" };
};

// ---------- video ----------
$("btnVideo").onclick = async () => {
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 } },
      audio: true,
    });
  } catch {
    setStatus("Camera access denied");
    return;
  }
  openOverlay("video");
  preview.srcObject = stream;
  const frames = [];
  const grabFrame = () => {
    if (!preview.videoWidth) return;
    if (frames.length >= 6) return;
    frames.push(frameToJpeg(preview));
  };
  const frameTimer = setInterval(grabFrame, 4000);
  setTimeout(grabFrame, 800); // early first frame
  const transcriber = startTranscription((final, interim) => {
    liveEl.textContent = final + interim;
  });
  rec = { stream, transcriber, timerId: startTimer(), mode: "video", frames, frameTimer };
};

function frameToJpeg(video, maxW = 1024) {
  const scale = Math.min(1, maxW / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

$("btnStop").onclick = () => {
  if (!rec) return closeOverlay();
  const { transcriber, mode, frames, frameTimer } = rec;
  if (frameTimer) clearInterval(frameTimer);
  if (mode === "video" && frames && preview.videoWidth && frames.length < 6) {
    frames.push(frameToJpeg(preview)); // final frame
  }
  const transcript = transcriber ? transcriber.stop() : "";
  closeOverlay();

  if (mode === "voice") {
    if (!transcript) return setStatus("Nothing heard — try again");
    submitCapture({ type: "voice", transcript });
  } else {
    const images = (frames || []).map(dataUrlToImage);
    if (!transcript && !images.length) return setStatus("Nothing captured — try again");
    submitCapture({
      type: "video",
      transcript: transcript || undefined,
      images,
      thumbnail: frames?.[0] || null,
    });
  }
};

$("btnCancel").onclick = () => {
  rec?.transcriber?.stop();
  if (rec?.frameTimer) clearInterval(rec.frameTimer);
  closeOverlay();
};

function dataUrlToImage(dataUrl) {
  const [head, data] = dataUrl.split(",");
  return { mediaType: head.match(/data:(.*?);/)[1], data };
}

// ---------- photo ----------
$("btnPhoto").onclick = () => $("photoInput").click();
$("photoInput").onchange = async (e) => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  const dataUrl = await downscaleImage(file, 1568);
  const thumb = await downscaleImage(file, 640);
  submitCapture({ type: "image", images: [dataUrlToImage(dataUrl)], thumbnail: thumb });
};

function downscaleImage(file, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// ---------- text ----------
$("btnText").onclick = () => {
  $("textOverlay").hidden = false;
  $("textInput").value = "";
  $("textInput").focus();
};
$("btnTextCancel").onclick = () => { $("textOverlay").hidden = true; };
$("btnTextSave").onclick = () => {
  const text = $("textInput").value.trim();
  $("textOverlay").hidden = true;
  if (text) submitCapture({ type: "text", text });
};

// ---------- init ----------
(async function init() {
  try {
    notes = await (await fetch("/api/notes")).json();
  } catch {
    notes = [];
  }
  render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
