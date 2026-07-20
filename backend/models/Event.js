const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  location: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  type: {
    type: String,
    enum: ['Open House', 'Community Meeting', 'Webinar', 'Other'],
    default: 'Other'
  },
  url: { type: String, default: '' }, // NEW
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);