const mongoose = require('mongoose');

const MediaItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  type: { 
    type: String, 
    enum: ['video', 'image', 'gallery'], 
    default: 'video' 
  },
  url: { type: String, required: true }, // YouTube URL or image URL
  thumbnail: { type: String, default: '' },
  source: { type: String, default: 'Manual' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MediaItem', MediaItemSchema);