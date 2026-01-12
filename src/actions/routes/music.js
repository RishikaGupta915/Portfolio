import express from "express";
import { spawn } from "child_process";

const router = express.Router();

const isYouTubeUrl = (input) =>
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(input);

router.get("/stream", (req, res) => {
  const q = req.query.q;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Missing query parameter q" });
  }

  const target = isYouTubeUrl(q) ? q : `ytsearch1:${q}`;

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "no-cache");

  const yt = spawn("yt-dlp", [
    "-f",
    "bestaudio",
    "--extract-audio",
    "--audio-format",
    "mp3",
    "-o",
    "-",
    target,
  ]);

  yt.stdout.pipe(res);

  yt.stderr.on("data", (d) => {
    console.error("yt-dlp:", d.toString());
  });

  yt.on("close", () => res.end());

  req.on("close", () => {
    yt.kill("SIGKILL");
  });
});

export default router;
