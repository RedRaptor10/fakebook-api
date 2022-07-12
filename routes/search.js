const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const postController = require('../controllers/post');

// Get Search Posts
router.get('/:category',
    passport.authenticate('jwt', { session: false }),
    postController.getSearchPosts);

module.exports = router;