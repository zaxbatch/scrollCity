const mongoose = require('mongoose');

const NewsItemSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  summary: { type: String, required: true },
  url: { type: String, default: '' }, // replaces 'link'
  category: {
    type: String,
    enum: ['Development', 'Economy', 'Policy', 'Community', 'Market'],
    default: 'Market'
  },
  source: { type: String, default: 'Local News' },
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('NewsItem', NewsItemSchema);