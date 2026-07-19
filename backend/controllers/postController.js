const Post = require('../models/Post');
const Comment = require('../models/Comment');
const sanitizeHtml = require('sanitize-html');

// Sanitize content to allow only safe HTML (YouTube iframes, text, images)
const cleanContent = (html) => {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'img', 'iframe', 'span', 'div'],
    allowedAttributes: {
      'a': ['href', 'target'],
      'img': ['src', 'alt', 'width', 'height'],
      'iframe': ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
      'div': ['class'],
      'span': ['class']
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com']
  });
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name username avatar')
      .populate('comments')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, image, video, community } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });
    const sanitized = cleanContent(content);
    const post = await Post.create({
      user: req.user._id,
      userName: req.user.name,
      userHandle: req.user.username,
      userAvatar: req.user.avatar,
      content: sanitized,
      image: image || '',
      video: video || '',
      community: community || null,
      isBot: false
    });
    await post.populate('user', 'name username avatar');
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = await Comment.create({
      post: post._id,
      user: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar,
      text
    });
    post.comments.push(comment._id);
    await post.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};