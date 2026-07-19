const mongoose = require('mongoose');

const NewsItemSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  summary: { type: String, required: true },
  link: { type: String },
  category: { type: String, enum: ['Development', 'Economy', 'Policy', 'Community', 'Market'], default: 'Market' },
  source: { type: String, default: 'Local News' },
  publishedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NewsItem', NewsItemSchema);