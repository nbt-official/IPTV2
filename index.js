import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/stv", async (req, res) => {
  try {
    const scrapeApiUrl = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=https://tv.infinityapi.org/f/swarnavahini";

    // Step 1: Get tvstore URL
    const scrapeRes = await fetch(scrapeApiUrl);
    const scrapeData = await scrapeRes.json();

    if (!scrapeData.success || !scrapeData.results || scrapeData.results.length === 0) {
      return res.status(404).json({ success: false, message: "No tvstore URL found" });
    }

    const tvstoreUrl = scrapeData.results[0].url;

    // Step 2: Fetch the tvstore result as text
    const tvstoreRes = await fetch(tvstoreUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0", // prevent being blocked as bot
      }
    });

    const text = await tvstoreRes.text();

    // Step 3: Detect if HTML was returned instead of JSON
    if (text.startsWith("<!DOCTYPE html") || text.startsWith("<html")) {
      return res.status(500).json({
        success: false,
        message: "tvstore URL returned HTML instead of JSON. Token might be expired."
      });
    }

    // Step 4: Try parsing JSON
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "tvstore response was not valid JSON",
        preview: text.slice(0, 100)
      });
    }

    // Success
    return res.json(json);

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
