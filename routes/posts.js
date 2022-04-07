const express = require('express');
const router = express.Router();
const passport = require('passport');

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
router.post('/create',
    passport.authenticate('jwt', { session: false }),
    postController.createPost);

// Create Comment
router.post('/:postId/comments/create',
    passport.authenticate('jwt', { session: false }),
    commentController.createComment);

// Update Post
router.post('/:postId/update',
    passport.authenticate('jwt', { session: false }),
    postController.auth,
    postController.updatePost);

// Update Comment
router.post('/:postId/comments/:commentId/update',
    passport.authenticate('jwt', { session: false }),
    commentController.auth,
    commentController.updateComment);

// Get User Posts
router.get('/users/:userId',
    passport.authenticate('jwt', { session: false }),
    postController.getUserPosts);

// Like Post
router.post('/:postId/like',
    passport.authenticate('jwt', { session: false }),
    postController.likePost);

// Unlike Post
router.post('/:postId/unlike',
    passport.authenticate('jwt', { session: false }),
    postController.unlikePost);

// Like Comment
router.post('/:postId/comments/:commentId/like',
    passport.authenticate('jwt', { session: false }),
    commentController.likeComment);

// Unlike Comment
router.post('/:postId/comments/:commentId/unlike',
    passport.authenticate('jwt', { session: false }),
    commentController.unlikeComment);

// Delete Post
router.post('/:postId/delete',
    passport.authenticate('jwt', { session: false }),
    postController.auth,
    postController.deletePost);

module.exports = router;