import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

async function fetchTvStoreUrl(scrapeUrl, maxRetries = 5, delayMs = 1000) {
  const scrapeApi = `https://symmetrical-space-rotary-phone-wrgrg69vqrrxhrpg-3000.app.github.dev/api/scrape?url=${encodeURIComponent(scrapeUrl)}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(scrapeApi);
      const data = await res.json();

      if (data.success && data.totalMatches > 0 && data.results[0]?.url) {
        return data.results[0].url;
      }

      console.log(`Attempt ${attempt} failed - no valid URL. Retrying...`);
      await new Promise((r) => setTimeout(r, delayMs));
    } catch (error) {
      console.error("Error fetching scrape API:", error);
    }
  }

  throw new Error("Failed to get a valid tvstore URL after retries");
}

app.get("/api/tv", async (req, res) => {
  const scrapeTargetUrl = "https://tv.infinityapi.org/f/swarnavahini";

  try {
    const tvStoreUrl = await fetchTvStoreUrl(scrapeTargetUrl);

    const response = await fetch(tvStoreUrl);
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const json = await response.json();
      res.json(json);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
