const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');
const BotPersona = require('../models/BotPersona');
const User = require('../models/User');
const Post = require('../models/Post');

// ─── Upload data ──────────────────────────────────────────
exports.uploadListings = async (req, res) => {
  try {
    const listings = req.body; // expects array of listing objects
    if (!Array.isArray(listings)) {
      return res.status(400).json({ error: 'Expected array of listings' });
    }
    const inserted = await Listing.insertMany(listings);
    res.json({ message: `Inserted ${inserted.length} listings` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadStats = async (req, res) => {
  try {
    const stats = req.body;
    if (!Array.isArray(stats)) return res.status(400).json({ error: 'Expected array' });
    const inserted = await MarketStat.insertMany(stats);
    res.json({ message: `Inserted ${inserted.length} market stats` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadNews = async (req, res) => {
  try {
    const news = req.body;
    if (!Array.isArray(news)) return res.status(400).json({ error: 'Expected array' });
    const inserted = await NewsItem.insertMany(news);
    res.json({ message: `Inserted ${inserted.length} news items` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadEvents = async (req, res) => {
  try {
    const events = req.body;
    if (!Array.isArray(events)) return res.status(400).json({ error: 'Expected array' });
    const inserted = await Event.insertMany(events);
    res.json({ message: `Inserted ${inserted.length} events` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Trigger bot post ─────────────────────────────────────
exports.triggerBotPost = async (req, res) => {
  try {
    const { botUsername } = req.body;
    // This will be called from the bot service; we'll implement later
    // For now, we'll just call a function from botService
    const botService = require('../services/botService');
    await botService.postFromBot(botUsername);
    res.json({ message: `Bot ${botUsername} posted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Status ──────────────────────────────────────────────
exports.getDataStatus = async (req, res) => {
  try {
    const listings = await Listing.countDocuments();
    const stats = await MarketStat.countDocuments();
    const news = await NewsItem.countDocuments();
    const events = await Event.countDocuments();
    const bots = await BotPersona.countDocuments();
    res.json({ listings, stats, news, events, bots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};