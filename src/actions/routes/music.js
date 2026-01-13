import express from "express";
import { spawn , execSync  } from "child_process";

const router = express.Router();

const isYouTubeUrl = (input) =>
  /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(input);

router.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing q" });

  try {
    const cmd = `yt-dlp "ytsearch5:${q}" --dump-json --skip-download`;
    const raw = execSync(cmd).toString().trim().split("\n");

    const results = raw
      .map((line) => JSON.parse(line))
      .filter((v) => {
        if (!v.duration || v.duration < 60) return false;
        if (v.duration > 10 * 60) return false;
        if (v.is_live) return false;
        if (/reaction|remix|cover/i.test(v.title)) return false;
        return true;
      })
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        title: v.title,
        channel: v.channel,
        duration: v.duration,
        thumbnail: v.thumbnail,
        url: `https://youtu.be/${v.id}`,
      }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/stream", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Transfer-Encoding", "chunked");

  const yt = spawn("yt-dlp", [
    "-f", "bestaudio",
    "--extract-audio",
    "--audio-format", "mp3",
    "-o", "-",
    url,
  ]);

  yt.stdout.pipe(res);

  yt.stderr.on("data", () => {});
  yt.on("close", () => res.end());

  req.on("close", () => yt.kill("SIGKILL"));
});



export default router;
