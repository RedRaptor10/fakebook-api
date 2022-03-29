var express = require('express');
var router = express.Router();

// Controller
const postController = require('../controllers/post');

// Get Posts
router.get('/', postController.getPosts);

// Get Post
router.get('/:postId', postController.getPost);

// Create Post
router.post('/create', postController.createPost);

// Update Post
router.post('/:postId/update', postController.updatePost);

// Delete Post
router.post('/:postId/delete', postController.deletePost);

module.exports = router;