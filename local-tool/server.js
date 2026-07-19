require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// ─── Forward parsed data to Admin API ──────────────────────
app.post('/seed', async (req, res) => {
  const { listings, stats, news, events } = req.body;
  const adminSecret = process.env.ADMIN_SECRET;
  const baseUrl = process.env.API_BASE_URL || 'https://scroll-city.onrender.com/api/admin';

  console.log('🔐 Using admin secret:', adminSecret ? '✅ set' : '❌ MISSING');
  console.log('🌐 Using API base URL:', baseUrl);

  if (!adminSecret) {
    return res.status(500).json({ error: 'ADMIN_SECRET not set in environment' });
  }

  const results = {};

  try {
    const sendBatch = async (endpoint, data) => {
      if (!data || data.length === 0) return { count: 0, response: 'No data' };
      const url = `${baseUrl}${endpoint}`;
      console.log(`📤 POST ${url} with ${data.length} items`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify(data)
      });

      const text = await response.text();
      console.log(`📥 Response ${response.status}:`, text.slice(0, 200));

      if (!response.ok) {
        throw new Error(`Upload to ${endpoint} failed: ${response.status} - ${text}`);
      }
      return { count: data.length, response: text };
    };

    results.listings = await sendBatch('/data/listings', listings);
    results.stats = await sendBatch('/data/stats', stats);
    results.news = await sendBatch('/data/news', news);
    results.events = await sendBatch('/data/events', events);

    res.json({ success: true, results });
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`🚀 Local tool running at http://localhost:${PORT}`);
  console.log(`   Using API_BASE: ${process.env.API_BASE_URL || 'https://scroll-city.onrender.com/api/admin'}`);
});