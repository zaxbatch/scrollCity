const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  type: { type: String, enum: ['Open House', 'Community Meeting', 'Webinar', 'Other'], default: 'Other' },
  link: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Event', EventSchema);