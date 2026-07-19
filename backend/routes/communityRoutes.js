const express = require('express');
const { getCommunities, toggleJoin } = require('../controllers/communityController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', getCommunities);
router.post('/:id/join', auth, toggleJoin);

module.exports = router;