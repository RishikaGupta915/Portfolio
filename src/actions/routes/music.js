import express from "express";
import { execFileSync } from "child_process";

const router = express.Router();

const searchCache = new Map();
const streamCache = new Map();
const SEARCH_TTL_MS = 30 * 60 * 1000;
const STREAM_TTL_MS = 2 * 60 * 60 * 1000;

//search filter
router.get("/search", (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Missing q" });
  const qKey = String(q).trim().toLowerCase();
  if (!qKey) return res.status(400).json({ error: "Missing q" });

  if (searchCache.has(qKey)) {
    return res.json(searchCache.get(qKey));
  }

  try {
    const args = [
      `ytsearch5:${qKey}`,
      "--dump-json",
      "--skip-download",
      "--no-warnings",
      "--ignore-errors",
    ];

    let output = "";
    try {
      output = execFileSync("yt-dlp", args, {
        encoding: "utf8",
        maxBuffer: 5 * 1024 * 1024,
      })
        .toString()
        .trim();
    } catch (err) {
      const partial = err?.stdout?.toString()?.trim();
      if (partial) {
        output = partial;
      } else {
        console.error(err);
        return res.status(500).json({ error: "Search failed" });
      }
    }

    if (!output) {
      searchCache.set(qKey, []);
      setTimeout(() => searchCache.delete(qKey), SEARCH_TTL_MS);
      return res.json([]);
    }

    const raw = output.split("\n");

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

    searchCache.set(qKey, results);
    setTimeout(() => searchCache.delete(qKey), SEARCH_TTL_MS);

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
    const args = ["-f", "bestaudio", "-g", String(url)];
    let audioUrl = "";

    try {
      audioUrl = execFileSync("yt-dlp", args, {
        encoding: "utf8",
        maxBuffer: 5 * 1024 * 1024,
      })
        .toString()
        .trim();
    } catch (err) {
      const partial = err?.stdout?.toString()?.trim();
      if (partial) {
        audioUrl = partial;
      } else {
        console.error(err);
        return res.status(500).send("Stream failed");
      }
    }

    if (!audioUrl) {
      return res.status(404).send("No audio stream found");
    }

    streamCache.set(url, audioUrl);
    setTimeout(() => streamCache.delete(url), STREAM_TTL_MS);

    res.redirect(audioUrl);
  } catch (e) {
    console.error(e);
    res.status(500).send("Stream failed");
  }
});

export default router;
