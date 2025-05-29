import express from "express";
import fetch from "node-fetch";

const app = express();

const MAX_RETRIES = 5;
const FIRST_API_BASE = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=";
const TARGET_URL = "https://tv.infinityapi.org/f/swarnavahini";

async function fetchWithRetry(url, retries) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      // Check if results exist and are not empty
      if (data.success && data.totalMatches > 0 && data.results && data.results.length > 0) {
        return data;
      }
      // If no results, wait a bit and retry
      await new Promise(r => setTimeout(r, 1000)); 
    } catch (err) {
      // Log error and retry
      console.error("Fetch attempt failed:", err.message);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error("Failed to get valid response after retries");
}

app.get("/api/my-tv", async (req, res) => {
  try {
    // 1. Fetch first API with retry to get the token URL
    const scrapeUrl = FIRST_API_BASE + encodeURIComponent(TARGET_URL);
    const scrapeData = await fetchWithRetry(scrapeUrl, MAX_RETRIES);

    // 2. Extract the URL from scrapeData
    const innerUrl = scrapeData.results[0].url;

    // 3. Fetch the inner tvstore API
    const innerRes = await fetch(innerUrl);
    if (!innerRes.ok) throw new Error("Failed to fetch inner URL");
    const innerData = await innerRes.json();

    // 4. Return innerData as the API response
    res.json(innerData);

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
