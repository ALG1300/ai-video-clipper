import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { probeDuration, evenClipStarts, cutSegment, toVertical916 } from "./clipper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// storage paths
const STORAGE = path.join(__dirname, "storage");
const IN = path.join(STORAGE, "inputs");
const OUT = path.join(STORAGE, "outputs");
for (const dir of [STORAGE, IN, OUT]) if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// multer for uploads
const upload = multer({
  dest: IN,
  limits: {
    fileSize: 1024 * 1024 * 1024 // 1 GB (adjust if you want)
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "video/mp4") cb(null, true);
    else cb(new Error("Only MP4 videos are allowed."));
  }
});

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// upload endpoint → make clips
app.post("/api/upload", upload.single("video"), async (req, res) => {
  try {
    const clips = Math.min(Math.max(parseInt(req.body.clips || "4", 10), 1), 10);
    const clipLen = Math.min(Math.max(parseInt(req.body.clipLen || "20", 10), 5), 120);

    if (!req.file?.path) return res.status(400).send("No video file uploaded.");

    const jobId = nanoid(8);
    const jobBase = path.join(OUT, jobId);
    const rawDir = path.join(jobBase, "raw");
    const v916Dir = path.join(jobBase, "9x16");
    for (const d of [jobBase, rawDir, v916Dir]) if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

    const inputPath = req.file.path;

    const total = await probeDuration(inputPath);
    const starts = evenClipStarts(total, clipLen, clips);

    const results = [];
    for (let i = 0; i < starts.length; i++) {
      const s = starts[i];
      const rawOut = path.join(rawDir, `clip_${i + 1}.mp4`);
      const vOut = path.join(v916Dir, `clip_${i + 1}_9x16.mp4`);

      await cutSegment(inputPath, s, clipLen, rawOut);
      await toVertical916(rawOut, vOut);

      results.push({
        index: i + 1,
        startSec: s,
        len: clipLen,
        rawRel: relToPublic(rawOut),
        v916Rel: relToPublic(vOut)
      });
    }

    return res.send(renderResults(jobId, results));
  } catch (err) {
    console.error(err);
    res.status(500).send("Processing failed. Make sure ffmpeg is installed.");
  }
});

// expose /storage so browser can download finished files
app.use("/storage", express.static(path.join(__dirname, "storage"), { fallthrough: false }));

function relToPublic(absPath) {
  return `/storage/${path.relative(path.join(__dirname, "storage"), absPath).replace(/\\/g, "/")}`;
}

function renderResults(jobId, items) {
  const rows = items.map(it => `
    <li>
      <b>Clip ${it.index}</b> (start ${it.startSec}s, ${it.len}s)
      — <a href="${it.v916Rel}" download>Download 9:16</a>
      — <a href="${it.rawRel}" download>Original cut</a>
      <video src="${it.v916Rel}" controls muted style="display:block;width:300px;margin-top:8px"></video>
    </li>
  `).join("");

  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Results ${jobId}</title></head>
<body style="font-family:system-ui,Arial;margin:24px;max-width:900px">
<h2>Results for Job ${jobId}</h2>
<ol>${rows}</ol>
<p><a href="/">← Make more clips</a></p>
</body></html>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
