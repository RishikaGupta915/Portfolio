import express from "express";
import { spawn } from "child_process";

const router = express.Router();

router.get("/stream", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");

  const yt = spawn("yt-dlp", [
    "-f", "bestaudio/best",
    "--extract-audio",
    "--audio-format", "mp3",
    "-o", "-",
    url
  ]);

  yt.stdout.pipe(res);

  yt.stderr.on("data", () => {});
  yt.on("close", () => res.end());

  req.on("close", () => yt.kill("SIGKILL"));
});

export default router;
