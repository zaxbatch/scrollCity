const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');
const BotPersona = require('../models/BotPersona');
const User = require('../models/User');
const Post = require('../models/Post');
const TrendingTopic = require('../models/TrendingTopic'); // new

// ─── Upload data ──────────────────────────────────────────

exports.uploadListings = async (req, res) => {
  try {
    const listings = req.body;
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

// ─── Trigger bot post ─────────────────────────────────────────

exports.triggerBotPost = async (req, res) => {
  try {
    const { botUsername } = req.body;
    if (!botUsername) return res.status(400).json({ error: 'botUsername required' });
    const botService = require('../services/botService');
    const post = await botService.postFromBot(botUsername);
    res.json({ message: `Bot ${botUsername} posted`, post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Data status ──────────────────────────────────────────────

exports.getDataStatus = async (req, res) => {
  try {
    const listings = await Listing.countDocuments();
    const stats = await MarketStat.countDocuments();
    const news = await NewsItem.countDocuments();
    const events = await Event.countDocuments();
    const bots = await BotPersona.countDocuments();
    const trending = await TrendingTopic.countDocuments();
    res.json({ listings, stats, news, events, bots, trending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Trending Topics CRUD ─────────────────────────────────────

// Get all active topics (or all if admin)
exports.getTrendingTopics = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: true };
    const topics = await TrendingTopic.find(filter).sort({ createdAt: -1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single topic
exports.getTrendingTopic = async (req, res) => {
  try {
    const topic = await TrendingTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new topic
exports.createTrendingTopic = async (req, res) => {
  try {
    const { headline, detail, source } = req.body;
    if (!headline || !detail) {
      return res.status(400).json({ error: 'Headline and detail are required' });
    }
    const topic = await TrendingTopic.create({ headline, detail, source, active: true });
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a topic
exports.updateTrendingTopic = async (req, res) => {
  try {
    const { headline, detail, source, active } = req.body;
    const topic = await TrendingTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    if (headline !== undefined) topic.headline = headline;
    if (detail !== undefined) topic.detail = detail;
    if (source !== undefined) topic.source = source;
    if (active !== undefined) topic.active = active;
    await topic.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a topic
exports.deleteTrendingTopic = async (req, res) => {
  try {
    const topic = await TrendingTopic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};