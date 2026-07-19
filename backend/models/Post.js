const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userHandle: { type: String, required: true },
  userAvatar: { type: String, default: '' },
  content: { type: String, required: true },      // HTML allowed (sanitized)
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  isBot: { type: Boolean, default: false },
  image: { type: String },
  video: { type: String },                        // YouTube embed URL
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  shares: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);