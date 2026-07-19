const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, default: 'Louisville' },
  state: { type: String, default: 'KY' },
  zip: String,
  price: { type: Number, required: true },
  bedrooms: Number,
  bathrooms: Number,
  sqft: Number,
  propertyType: { type: String, enum: ['Residential', 'Commercial', 'Land', 'Multi-Family'], default: 'Residential' },
  status: { type: String, enum: ['Active', 'Under Contract', 'Sold', 'Pending'], default: 'Active' },
  description: String,
  images: [String],
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // you (the human agent)
  source: { type: String, default: 'Manual' }, // 'MLS', 'Manual', etc.
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', ListingSchema);