const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controllers
const postController = require('../controllers/post');
const userController = require('../controllers/user');

// Get Search Posts
router.get('/posts',
    passport.authenticate('jwt', { session: false }),
    postController.getSearchPosts);

// Get Search Users
router.get('/users',
    passport.authenticate('jwt', { session: false }),
    userController.getSearchUsers);

module.exports = router;