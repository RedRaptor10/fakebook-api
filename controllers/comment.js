const Comment = require('../models/comment');

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
    // Process Comment Submit
    (req, res, next) => {
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
                    'id': comment._id,
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
];

// Update Comment
exports.updateComment = [
    (req, res, next) => {
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
];

// Delete Comment
exports.deleteComment = function(req, res, next) {
    Comment.findByIdAndRemove(req.params.commentId, function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Success' });
    });
};