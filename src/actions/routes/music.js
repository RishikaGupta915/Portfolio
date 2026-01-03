import express from "express";
import { execSync } from "child_process";

const router = express.Router();

router.post("/getAudio", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    // Use yt-dlp to get a DIRECT M4A playback URL
    const command = `yt-dlp -f "bestaudio[ext=m4a]" -g "${url}"`;
    const audioUrl = execSync(command).toString().trim();

    return res.json({ audioUrl });
  } catch (err) {
    console.error("yt-dlp error:", err);
    return res.status(500).json({ error: "Could not extract audio" });
  }
});

export default router;
