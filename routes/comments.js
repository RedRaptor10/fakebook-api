const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const commentController = require('../controllers/comment');

// Get All Comments
router.get('/', commentController.getComments);

// Get Single Comment
router.get('/:commentId', commentController.getComment);

// Delete Comment
router.post('/:commentId/delete',
    passport.authenticate('jwt', { session: false }),
    commentController.auth,
    commentController.deleteComment);

module.exports = router;