const Listing = require('../models/Listing');
const MarketStat = require('../models/MarketStat');
const NewsItem = require('../models/NewsItem');
const Event = require('../models/Event');
const BotPersona = require('../models/BotPersona');
const User = require('../models/User');
const Post = require('../models/Post');
const TrendingTopic = require('../models/TrendingTopic');

// ─── Helper to get model by type ─────────────────────────────
function getModel(type) {
  switch (type) {
    case 'listings': return Listing;
    case 'stats': return MarketStat;
    case 'news': return NewsItem;
    case 'events': return Event;
    default: throw new Error('Invalid type');
  }
}

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

exports.getTrendingTopics = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { active: true };
    const topics = await TrendingTopic.find(filter).sort({ createdAt: -1 });
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTrendingTopic = async (req, res) => {
  try {
    const topic = await TrendingTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.deleteTrendingTopic = async (req, res) => {
  try {
    const topic = await TrendingTopic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Generic CRUD for data types ──────────────────────────────

exports.getItems = async (req, res) => {
  try {
    const model = getModel(req.params.type);
    const items = await model.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItem = async (req, res) => {
  try {
    const model = getModel(req.params.type);
    const item = await model.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const model = getModel(req.params.type);
    const item = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const model = getModel(req.params.type);
    const item = await model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearItems = async (req, res) => {
  try {
    const model = getModel(req.params.type);
    await model.deleteMany({});
    res.json({ message: 'All items cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};