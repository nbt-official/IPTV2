import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/tvdrm", async (req, res) => {
  try {
    // 1. Get token URL from your scraper
    const scrapeUrl = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=https://tv.infinityapi.org/f/swarnavahini";
    const scrapeRes = await fetch(scrapeUrl);
    const scrapeJson = await scrapeRes.json();

    // 2. Check if scrape was successful
    if (!scrapeJson.success || !scrapeJson.results?.[0]?.url) {
      return res.status(502).json({ error: "Scraper failed or missing URL" });
    }

    const tvstoreUrl = scrapeJson.results[0].url;

    // 3. Fetch from tvstore and proxy JSON directly
    const tvstoreRes = await fetch(tvstoreUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      },
    });

    // 4. Set same headers and forward the JSON
    res.set("Content-Type", "application/json");
    const body = await tvstoreRes.text();

    // 5. Handle malformed response
    if (body.trim().startsWith("<")) {
      return res.status(500).json({
        error: "tvstore returned HTML instead of JSON",
        preview: body.slice(0, 300),
      });
    }

    return res.send(body); // raw JSON
  } catch (err) {
    res.status(500).json({ error: "Unexpected error", detail: err.message });
  }
});

app.listen(3000, () => {
  console.log("API ready at http://localhost:3000/api/tvdrm");
});
