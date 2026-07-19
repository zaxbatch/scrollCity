const Community = require('../models/Community');

exports.getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('members', 'name username avatar');
    res.json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleJoin = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    const idx = community.members.indexOf(req.user._id);
    if (idx === -1) {
      community.members.push(req.user._id);
    } else {
      community.members.splice(idx, 1);
    }
    await community.save();
    res.json({ joined: idx === -1, memberCount: community.members.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};