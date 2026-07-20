require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// ─── Helper: proxy to admin API ─────────────────────────────
const proxyToAdmin = async (req, res, endpoint, method = 'GET', body = null) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const baseUrl = process.env.API_BASE_URL || 'https://scroll-city.onrender.com/api/admin';

  if (!adminSecret) {
    return res.status(500).json({ error: 'ADMIN_SECRET not set in environment' });
  }

  try {
    const url = `${baseUrl}${endpoint}`;
    console.log(`📤 ${method} ${url}`);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': adminSecret
      }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Admin API error (${response.status}):`, data);
      return res.status(response.status).json({ error: data.error || 'Admin API error' });
    }

    res.json(data);
  } catch (err) {
    console.error('❌ Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Seed endpoint ──────────────────────────────────────────
app.post('/seed', async (req, res) => {
  const { listings, stats, news, events, media } = req.body;
  const adminSecret = process.env.ADMIN_SECRET;
  const baseUrl = process.env.API_BASE_URL || 'https://scroll-city.onrender.com/api/admin';

  if (!adminSecret) {
    return res.status(500).json({ error: 'ADMIN_SECRET not set in environment' });
  }

  const results = {};

  try {
    const sendBatch = async (endpoint, data) => {
      if (!data || data.length === 0) return { count: 0, response: 'No data' };
      const url = `${baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret
        },
        body: JSON.stringify(data)
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Upload to ${endpoint} failed: ${response.status} - ${text}`);
      }
      return { count: data.length, response: text };
    };

    results.listings = await sendBatch('/data/listings', listings);
    results.stats = await sendBatch('/data/stats', stats);
    results.news = await sendBatch('/data/news', news);
    results.events = await sendBatch('/data/events', events);
    results.media = await sendBatch('/data/media', media); // <-- NEW

    res.json({ success: true, results });
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin proxy endpoints ──────────────────────────────────

// Trending topics
app.get('/admin/trending', async (req, res) => {
  const query = req.query.all === 'true' ? '?all=true' : '';
  await proxyToAdmin(req, res, `/trending${query}`);
});
app.get('/admin/trending/:id', async (req, res) => {
  await proxyToAdmin(req, res, `/trending/${req.params.id}`);
});
app.post('/admin/trending', async (req, res) => {
  await proxyToAdmin(req, res, '/trending', 'POST', req.body);
});
app.put('/admin/trending/:id', async (req, res) => {
  await proxyToAdmin(req, res, `/trending/${req.params.id}`, 'PUT', req.body);
});
app.delete('/admin/trending/:id', async (req, res) => {
  await proxyToAdmin(req, res, `/trending/${req.params.id}`, 'DELETE');
});

// Bots
app.post('/admin/bots/trigger', async (req, res) => {
  await proxyToAdmin(req, res, '/bots/trigger', 'POST', req.body);
});

// Status
app.get('/admin/status', async (req, res) => {
  await proxyToAdmin(req, res, '/data/status');
});

// ─── Data CRUD proxy ──────────────────────────────────────────
app.get('/admin/data/:type', async (req, res) => {
  await proxyToAdmin(req, res, `/data/${req.params.type}`);
});
app.get('/admin/data/:type/:id', async (req, res) => {
  await proxyToAdmin(req, res, `/data/${req.params.type}/${req.params.id}`);
});
app.post('/admin/data/:type', async (req, res) => { // <-- NEW (for adding single items)
  await proxyToAdmin(req, res, `/data/${req.params.type}`, 'POST', req.body);
});
app.put('/admin/data/:type/:id', async (req, res) => {
  await proxyToAdmin(req, res, `/data/${req.params.type}/${req.params.id}`, 'PUT', req.body);
});
app.delete('/admin/data/:type/:id', async (req, res) => {
  await proxyToAdmin(req, res, `/data/${req.params.type}/${req.params.id}`, 'DELETE');
});
app.delete('/admin/data/:type', async (req, res) => {
  await proxyToAdmin(req, res, `/data/${req.params.type}`, 'DELETE');
});

// ─── Health ──────────────────────────────────────────────────
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => {
  console.log(`🚀 Local tool running at http://localhost:${PORT}`);
  console.log(`   Using API_BASE: ${process.env.API_BASE_URL || 'https://scroll-city.onrender.com/api/admin'}`);
});