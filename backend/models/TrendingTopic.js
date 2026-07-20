const mongoose = require('mongoose');

const TrendingTopicSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  detail: { type: String, required: true },
  source: { type: String, default: 'GLAR' },
  active: { type: Boolean, default: true },
  url: { type: String, default: '' }, // NEW
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrendingTopic', TrendingTopicSchema);