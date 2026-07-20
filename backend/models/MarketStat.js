const mongoose = require('mongoose');

const MarketStatSchema = new mongoose.Schema({
  metric: { type: String, required: true },
  value: { type: String, required: true },
  region: { type: String, default: 'Louisville, KY' },
  date: { type: Date, default: Date.now },
  source: { type: String, default: 'Local MLS' },
  category: {
    type: String,
    enum: ['Price', 'Inventory', 'Sales', 'Rental', 'Economic'],
    default: 'Price'
  },
  url: { type: String, default: '' } // NEW: optional URL
}, {
  timestamps: true
});

module.exports = mongoose.model('MarketStat', MarketStatSchema);