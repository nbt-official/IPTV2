import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/tvdrm", async (req, res) => {
  try {
    const scrapeApi = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=https://tv.infinityapi.org/f/swarnavahini";

    // 1. Call the scrape API
    const scrapeRes = await fetch(scrapeApi);
    const scrapeData = await scrapeRes.json();

    if (!scrapeData.success || !scrapeData.results?.[0]?.url) {
      return res.status(500).json({ success: false, message: "Scrape API failed or returned no results." });
    }

    const tvstoreUrl = scrapeData.results[0].url;
    console.log("Got tvstore URL:", tvstoreUrl);

    // 2. Call the tvstore URL as plain text
    const tvstoreRes = await fetch(tvstoreUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0", // Avoid bot blocking
      },
    });

    const text = await tvstoreRes.text();
    const trimmed = text.trim();

    // 3. Check if HTML error
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      console.log("HTML returned instead of JSON:", trimmed.slice(0, 300));
      return res.status(500).json({
        success: false,
        message: "tvstore URL returned HTML instead of JSON. Maybe expired token?",
        preview: trimmed.slice(0, 200),
      });
    }

    // 4. Try parsing as JSON
    let json;
    try {
      json = JSON.parse(trimmed);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "tvstore response is not valid JSON",
        preview: trimmed.slice(0, 300),
      });
    }

    // 5. Return success
    return res.json(json);

  } catch (err) {
    console.error("Unexpected error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
