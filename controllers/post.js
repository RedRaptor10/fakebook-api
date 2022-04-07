const Post = require('../models/post');
const User = require('../models/user');

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

    Post.find({ 'author': req.params.userId }, { 'password': 0 }) // Exclude password from db query
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
    // Process Post Submit
    (req, res, next) => {
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
                    'id': post._id,
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
];

// Update Post
exports.updatePost = [
    // Process Post Update
    (req, res, next) => {
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
];

// Like Post
exports.likePost = [
    // Process Post Like
    (req, res, next) => {
        // Add User id to Post likes array
        Post.findByIdAndUpdate(req.params.postId, { $addToSet: { likes: req.user.info.id } }, { new: true }, function(err, resultsPost) {
            if (err) { return next(err); }

            // Add Post id to User likedPosts array
            User.findByIdAndUpdate(req.user.info.id, { $addToSet: { likedPosts: req.params.postId } }, { new: true }, function(err, resultsUser) {
                if (err) { return next(err); }
                return res.json({
                    post: resultsPost,
                    user: resultsUser,
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
        Post.findByIdAndUpdate(req.params.postId, { $pull: { likes: req.user.info.id } }, { new: true }, function(err, resultsPost) {
            if (err) { return next(err); }

            // Remove Post id from User likedPosts array
            User.findByIdAndUpdate(req.user.info.id, { $pull: { likedPosts: req.params.postId } }, { new: true }, function(err, resultsUser) {
                if (err) { return next(err); }
                return res.json({
                    post: resultsPost,
                    user: resultsUser,
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