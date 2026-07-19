const mongoose = require('mongoose');

const BotPersonaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  niche: { type: String, enum: ['General', 'Finance', 'Market Data', 'Construction', 'Neighborhood', 'Investment'], default: 'General' },
  postFrequency: { type: Number, default: 60 }, // minutes between posts
  active: { type: Boolean, default: true },
  lastPostAt: { type: Date }
});

module.exports = mongoose.model('BotPersona', BotPersonaSchema);