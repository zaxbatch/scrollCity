require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const communityRoutes = require('./routes/communityRoutes');

const app = express();

// ─── FIX: Trust Render's proxy ──────────────────
app.set('trust proxy', 1);

// ─── Connect to MongoDB ──────────────────────────
connectDB();

// ─── CORS configuration ──────────────────────────
const allowedOrigins = [
  'https://scrollcity.zerric.com',
  'http://zerric.com',
  'https://zerric.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5500'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// ─── Security & logging ──────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// ─── Rate limiting ───────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ─── API routes ───────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/communities', communityRoutes);

// ─── Health check ────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ─── 404 handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ─── Global error handler ────────────────────────
app.use(errorHandler);

module.exports = app;