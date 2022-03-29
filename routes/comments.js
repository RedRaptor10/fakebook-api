const express = require('express');
const router = express.Router();

// Controller
const commentController = require('../controllers/comment');

// Get All Comments
router.get('/', commentController.getComments);

// Get Single Comment
router.get('/:commentId', commentController.getComment);

// Delete Comment
router.post('/:commentId/delete', commentController.deleteComment);

module.exports = router;