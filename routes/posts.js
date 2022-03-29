var express = require('express');
var router = express.Router();

// Controller
const postController = require('../controllers/post');
const commentController = require('../controllers/comment');

// Get Posts
router.get('/', postController.getPosts);

// Get Post
router.get('/:postId', postController.getPost);

// Get Post Comments
router.get('/:postId/comments', commentController.getPostComments);

// Create Post
router.post('/create', postController.createPost);

// Create Comment
router.post('/:postId/comments/create', commentController.createComment);

// Update Post
router.post('/:postId/update', postController.updatePost);

// Update Comment
router.post('/:postId/comments/:commentId/update', commentController.updateComment);

// Delete Post
router.post('/:postId/delete', postController.deletePost);

module.exports = router;