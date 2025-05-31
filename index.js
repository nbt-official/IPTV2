const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/epg/:id', async (req, res) => {
  const epgId = req.params.id;

  try {
    const response = await axios.get(`https://slt-api.revlet.net/service/api/v1/page/content?path=epg/play/${epgId}`, {
      headers: {
        'box-id': '068f9635-ebf7-170b-da63-5063bafb255e',
        'session-id': '156cecc0-d726-4aa2-a326-dd53a9dda16b',
        'tenant-code': 'slt',
        'Origin': 'https://www.peotvgo.com',
        'Referer': 'https://www.peotvgo.com/',
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; SM-A065F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy API running at http://localhost:3000/api/epg/:id');
});
