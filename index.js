import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/tvstore", async (req, res) => {
  try {
    // Step 1: Call the first API
    const firstApiUrl = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=https://tv.infinityapi.org/f/swarnavahini";

    const firstRes = await fetch(firstApiUrl);
    if (!firstRes.ok) throw new Error(`First API fetch error ${firstRes.status}`);

    const firstData = await firstRes.json();

    // Check if results exist
    if (!firstData.success || !firstData.results || firstData.results.length === 0) {
      return res.status(404).json({ success: false, message: "No results from first API" });
    }

    // Step 2: Extract the tvstore URL
    const tvstoreUrl = firstData.results[0].url;

    // Step 3: Call the tvstore API URL
    const tvstoreRes = await fetch(tvstoreUrl);
    if (!tvstoreRes.ok) throw new Error(`TVStore API fetch error ${tvstoreRes.status}`);

    // Step 4: Get JSON from tvstore API and respond with it
    const tvstoreData = await tvstoreRes.json();

    return res.json(tvstoreData);

  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
