const Post = require('../models/post');
const User = require('../models/user');
const { body, validationResult } = require('express-validator');

// Check if user is authorized
exports.auth = (req, res, next) => {
    // Allow authorization if user is an admin
    if (req.user.info.admin) {
        return next();
    }

    // Get Post
    Post.findOne({ '_id': req.params.postId })
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }

        // Allow authorization if user is the post author
        if (req.user.info.username == results.author.username) {
            return next();
        } else {
            return res.send('Unauthorized');
        }
    });
}

// Get Posts
exports.getPosts = function(req, res, next) {
    let sortby = '_id';
    let orderby = 'ascending';

    if (req.query.sort == 'date') { sortby = 'date'; }
    if (req.query.order == 'desc') { orderby = 'descending'; }

    Post.find({})
    .sort({ [sortby]: orderby }) // Sort by (Default: id in ascending order)
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Get User Posts
exports.getUserPosts = function(req, res, next) {
    let sortby = '_id';
    let orderby = 'ascending';

    if (req.query.sort == 'date') { sortby = 'date'; }
    if (req.query.order == 'desc') { orderby = 'descending'; }

    Post.find({ 'author': req.params.userId })
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Get Post
exports.getPost = function(req, res, next) {
    Post.findOne({ '_id': req.params.postId })
    .populate('author', { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Create Post
exports.createPost = [
    // Validate and sanitize fields
    body('content', 'Post cannot be empty.').trim().isLength({ min: 1 }).escape(),

    // Process Post Submit
    (req, res, next) => {
        // Extract the validation errors from request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
        } else {
            const post = new Post({
                author: req.body.author,
                date: req.body.date,
                content: req.body.content,
                image: req.body.image,
                likes: [],
                comments: [],
                public: req.body.public
            });

            // Save post to database
            post.save(function(err) {
                if (err) { return next(err); }
                res.json({
                    post: {
                        _id: post._id,
                        author: post.author._id,
                        date: post.date,
                        content: post.content,
                        image: post.image,
                        likes: post.likes,
                        comments: post.comments,
                        public: post.public
                    },
                    message: 'Success'
                });
            });
        }
    }
];

// Update Post
exports.updatePost = [
    // Validate and sanitize fields
    body('content', 'Post cannot be empty.').trim().isLength({ min: 1 }).escape(),

    // Process Post Update
    (req, res, next) => {
        // Extract the validation errors from request
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
        } else {
            const post = new Post({
                _id: req.params.postId,
                author: req.body.author,
                date: req.body.date,
                content: req.body.content,
                image: req.body.image,
                likes: req.body.likes,
                comments: req.body.comments,
                public: req.body.public
            });

            // Save post to database
            Post.findByIdAndUpdate(req.params.postId, post, { new: true }, function(err, results) {
                if (err) { return next(err); }
                res.json({
                    post: results,
                    message: 'Success'
                });
            });
        }
    }
];

// Like Post
exports.likePost = [
    // Process Post Like
    (req, res, next) => {
        // Add User id to Post likes array
        Post.findByIdAndUpdate(req.params.postId, { '$addToSet': { 'likes': req.user.info._id } }, { new: true }, function(err, post) {
            if (err) { return next(err); }

            // Add Post id to User liked posts array
            User.findByIdAndUpdate(req.user.info._id, { '$addToSet': { 'likes.posts': req.params.postId } }, { new: true }, function(err, user) {
                if (err) { return next(err); }
                return res.json({
                    post,
                    user,
                    message: 'Success'
                });
            });
        });
    }
];

// Unlike Post
exports.unlikePost = [
    // Process Post Unlike
    (req, res, next) => {
        // Remove User id from Post likes array
        Post.findByIdAndUpdate(req.params.postId, { '$pull': { 'likes': req.user.info._id } }, { new: true }, function(err, post) {
            if (err) { return next(err); }

            // Remove Post id from User liked posts array
            User.findByIdAndUpdate(req.user.info._id, { '$pull': { 'likes.posts': req.params.postId } }, { new: true }, function(err, user) {
                if (err) { return next(err); }
                return res.json({
                    post,
                    user,
                    message: 'Success'
                });
            });
        });
    }
];

// Delete Post
exports.deletePost = function(req, res, next) {
    Post.findByIdAndRemove(req.params.postId, function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Success' });
    });
};