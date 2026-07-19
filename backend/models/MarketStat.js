const mongoose = require('mongoose');

const MarketStatSchema = new mongoose.Schema({
  metric: { type: String, required: true }, // e.g., 'Median Home Price', 'Days on Market'
  value: { type: String, required: true },  // e.g., '$285,000', '28 days'
  region: { type: String, default: 'Louisville, KY' },
  date: { type: Date, default: Date.now },
  source: { type: String, default: 'Local MLS' },
  category: { type: String, enum: ['Price', 'Inventory', 'Sales', 'Rental', 'Economic'], default: 'Price' }
});

module.exports = mongoose.model('MarketStat', MarketStatSchema);