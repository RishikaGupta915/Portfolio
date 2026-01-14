import express from "express";
import { execSync } from "child_process";

const router = express.Router();

const searchCache = new Map();
const streamCache = new Map();

//search filter
router.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing q" });

  if (searchCache.has(q)) {
    return res.json(searchCache.get(q));
  }

  try {
    const raw = execSync(
      `yt-dlp "ytsearch5:${q}" --dump-json --skip-download`
    )
      .toString()
      .trim()
      .split("\n");

    const results = raw
      .map((l) => JSON.parse(l))
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

    searchCache.set(q, results);
    setTimeout(() => searchCache.delete(q), 15 * 60 * 1000);

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

//stream 
router.get("/stream", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url");

  if (streamCache.has(url)) {
    return res.redirect(streamCache.get(url));
  }

  try {
    const audioUrl = execSync(
      `yt-dlp -f bestaudio -g "${url}"`
    )
      .toString()
      .trim();

    streamCache.set(url, audioUrl);
    setTimeout(() => streamCache.delete(url), 30 * 60 * 1000);

    res.redirect(audioUrl);
  } catch (e) {
    console.error(e);
    res.status(500).send("Stream failed");
  }
});

export default router;
