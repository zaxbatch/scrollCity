require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const communityRoutes = require('./routes/communityRoutes');

const app = express();

// ─── Connect to MongoDB ──────────────────────────────────────
connectDB();

// ─── CORS configuration ──────────────────────────────────────
// Allowed origins: your production frontend + localhost
const allowedOrigins = [
  'https://scrollcity.zerric.com',   // your custom domain
  'http://zerric.com',               // http variant (if needed)
  'https://zerric.com',              // https without subdomain
  'http://localhost:3000',           // local dev (Netlify)
  'http://localhost:5000',           // local dev (backend itself)
  'http://127.0.0.1:5500',           // VS Code Live Server
  undefined                          // allow requests with no origin (curl, mobile)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,                // allow cookies / authorization headers
  optionsSuccessStatus: 200
}));

// ─── Security & logging ──────────────────────────────────────
app.use(helmet());                  // security headers
app.use(morgan('dev'));             // request logging
app.use(express.json({ limit: '10mb' }));  // parse JSON bodies

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ─── Catch-all 404 for unknown routes ──────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Global error handler ────────────────────────────────────
app.use(errorHandler);

module.exports = app;