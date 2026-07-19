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
  propertyType: {
    type: String,
    enum: [
      'Residential',
      'Single Family',      // added
      'Condo/Townhouse',    // added
      'Commercial',
      'Land',
      'Multi-Family'
    ],
    default: 'Residential'
  },
  status: {
    type: String,
    enum: ['Active', 'Under Contract', 'Sold', 'Pending', 'Closed'],
    default: 'Active'
  },
  description: String,
  images: [String],
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, default: 'Manual' },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', ListingSchema);