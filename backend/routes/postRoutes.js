const express = require('express');
const { getFeed, createPost, toggleLike, addComment, getComments } = require('../controllers/postController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', getFeed);
router.post('/', auth, createPost);
router.put('/:id/like', auth, toggleLike);
router.post('/:id/comments', auth, addComment);
router.get('/:id/comments', getComments);

module.exports = router;