import express from "express";
import fetch from "node-fetch";
import zlib from "zlib";

const app = express();

app.get("/api/drm", async (req, res) => {
  try {
    // 1. Get token from your scraper
    const scrapeUrl = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=https://tv.infinityapi.org/f/swarnavahini";
    const scrapeRes = await fetch(scrapeUrl);
    const scrapeJson = await scrapeRes.json();

    if (!scrapeJson.success || !scrapeJson.results?.[0]?.url) {
      return res.status(502).json({ error: "Scraper failed or token missing" });
    }

    const tvstoreUrl = scrapeJson.results[0].url;

    // 2. Fetch original API response with proper headers
    const tvstoreRes = await fetch(tvstoreUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14; SM-A065F)",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br",
        "Origin": "https://tv.infinityapi.org",
        "Referer": "https://tv.infinityapi.org/",
      }
    });

    // 3. Read and decompress the response if needed
    const encoding = tvstoreRes.headers.get("content-encoding");
    let buffer = await tvstoreRes.buffer();

    if (encoding === "gzip") {
      buffer = zlib.gunzipSync(buffer);
    } else if (encoding === "br") {
      buffer = zlib.brotliDecompressSync(buffer);
    }

    // 4. Set headers & send raw JSON
    res.setHeader("Content-Type", "application/json");
    res.send(buffer.toString("utf-8"));

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal error", detail: err.message });
  }
});

app.listen(3000, () => {
  console.log("Proxy API running at http://localhost:3000/api/tvdrm");
});
