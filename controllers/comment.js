const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { body, validationResult } = require('express-validator');

// Check if user is authorized
exports.auth = (req, res, next) => {
    // Allow authorization if user is an admin
    if (req.user.info.admin) {
        return next();
    }

    // Get Comment
    Comment.findOne({ '_id': req.params.commentId })
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }

        // Allow authorization if user is the comment author
        if (req.user.info.username == results.author.username) {
            return next();
        } else {
            return res.send('Unauthorized');
        }
    });
}

// Get Comments
exports.getComments = function(req, res, next) {
    Comment.find({})
    .sort({ '_id': 1 }) // Sort by id in ascending order
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Get Comment
exports.getComment = function(req, res, next) {
    Comment.findOne({ '_id': req.params.commentId })
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Get Post Comments
exports.getPostComments = function(req, res, next) {
    let sortby = '_id';
    let orderby = 'ascending';

    if (req.query.sort == 'date') { sortby = 'date'; }
    if (req.query.order == 'desc') { orderby = 'descending'; }

    Comment.find({'post': req.params.postId })
    .sort({ [sortby]: orderby }) // Sort by (Default: id in ascending order)
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Create Comment
exports.createComment = [
    // Validate and sanitize fields
    body('content', 'Comment cannot be empty.').trim().isLength({ min: 1 }).escape(),

    // Process Comment Submit
    (req, res, next) => {
        // Extract the validation errors from request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
        } else {
            const comment = new Comment ({
                post: req.params.postId,
                author: req.body.author,
                date: req.body.date,
                content: req.body.content,
                likes: req.body.likes
            });

            // Save comment to database
            comment.save(function(err) {
                if (err) { return next(err); }

                res.json({
                    comment: {
                        _id: comment._id,
                        post: comment.post._id,
                        author: comment.author._id,
                        date: comment.date,
                        content: comment.content,
                        likes: comment.likes
                    },
                    message: 'Success'
                });
            });
        }
    }
];

// Update Comment
exports.updateComment = [
    // Validate and sanitize fields
    body('content', 'Comment cannot be empty.').trim().isLength({ min: 1 }).escape(),

    (req, res, next) => {
        // Extract the validation errors from request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
        } else {
            const comment = new Comment ({
                _id: req.params.commentId,
                post: req.params.postId,
                author: req.body.author,
                date: req.body.date,
                content: req.body.content,
                likes: req.body.likes
            });

            // Save comment to database
            Comment.findByIdAndUpdate(req.params.commentId, comment, { new: true }, function(err, results) {
                if (err) { return next(err); }
                res.json({
                    comment: results,
                    message: 'Success'
                });
            });
        }
    }
];

// Like Comment
exports.likeComment = [
    // Process Comment Like
    (req, res, next) => {
        // Add User id to Comment likes array
        Comment.findByIdAndUpdate(req.params.commentId, { '$addToSet': { 'likes': req.user.info._id } }, { new: true }, function(err, comment) {
            if (err) { return next(err); }

            // Add Comment id to User liked comments array
            User.findByIdAndUpdate(req.user.info._id, { '$addToSet': { 'likes.comments': req.params.commentId } }, { new: true }, function(err, user) {
                if (err) { return next(err); }
                return res.json({
                    comment,
                    user,
                    message: 'Success'
                });
            });
        });
    }
];

// Unlike Comment
exports.unlikeComment = [
    // Process Comment Unlike
    (req, res, next) => {
        // Remove User id from Comment likes array
        Comment.findByIdAndUpdate(req.params.commentId, { '$pull': { 'likes': req.user.info._id } }, { new: true }, function(err, comment) {
            if (err) { return next(err); }

            // Remove Comment id from User liked comments array
            User.findByIdAndUpdate(req.user.info._id, { '$pull': { 'likes.comments': req.params.commentId } }, { new: true }, function(err, user) {
                if (err) { return next(err); }
                return res.json({
                    comment,
                    user,
                    message: 'Success'
                });
            });
        });
    }
];

// Delete Comment
exports.deleteComment = function(req, res, next) {
    Comment.findByIdAndRemove(req.params.commentId, function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Success' });
    });
};