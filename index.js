import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/api/tvdrm", async (req, res) => {
  try {
    const scrapeApiUrl = "https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=https://tv.infinityapi.org/f/swarnavahini";

    // Call the scrape API
    const scrapeRes = await fetch(scrapeApiUrl);
    if (!scrapeRes.ok) throw new Error(`Scrape API returned status ${scrapeRes.status}`);

    const scrapeData = await scrapeRes.json();

    if (!scrapeData.success || !scrapeData.results || scrapeData.results.length === 0) {
      return res.status(404).json({ success: false, message: "No tvstore URL found" });
    }

    // Extract the tvstore API URL
    const tvstoreUrl = scrapeData.results[0].url;

    // Call the tvstore API URL
    const tvstoreRes = await fetch(tvstoreUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0",  // sometimes helps avoid bot blocking
      },
    });

    if (!tvstoreRes.ok) throw new Error(`TVstore API returned status ${tvstoreRes.status}`);

    // Parse the DRM JSON response from tvstore API
    const tvstoreData = await tvstoreRes.json();

    // Return the DRM JSON data directly
    return res.json(tvstoreData);

  } catch (err) {
    console.error("Error in /api/tvdrm:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
