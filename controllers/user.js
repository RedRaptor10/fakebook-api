const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nconf = require('nconf');

// Set up nconf
nconf.argv().env().file({ file: './config.json' });


// Check if user is authorized
exports.auth = (req, res, next) => {
    // Allow authorization if user is an admin OR if URL contains user's username
    if (req.user.info.admin || req.user.info.username == req.params.username) {
        return next();
    } else {
        return res.send('Unauthorized');
    }
};

// Get Users
exports.getUsers = function(req, res, next) {
    let sortby = '_id';
    let orderby = 'ascending';

    if (req.query.sort == 'username') { sortby = 'username'; }
    if (req.query.order == 'desc') { orderby = 'descending'; }

    User.find({}, { 'password': 0 }) // Exclude password from db query
    .sort({ [sortby]: orderby }) // Sort by (Default: id in ascending order)
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Get User
exports.getUser = function(req, res, next) {
    User.findOne({ 'username': req.params.username }, { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Get User From ID
exports.getUserFromId = function(req, res, next) {
    User.findOne({ '_id': req.params.userId }, { 'password': 0 }) // Exclude password from db query
    .exec(function(err, results) {
        if (err) { return next(err); }
        res.json(results);
    });
};

// Create User
exports.createUser = [
    // Process Sign Up
    (req, res, next) => {
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            friends: [],
            requests: {
                sent: [],
                received: []
            },
            likes: {
                posts: [],
                comments: []
            },
            public: req.body.public,
            admin: req.body.admin
        });

        // Check if username already exists
        User.findOne({ 'username': user.username })
        .exec(function(err, results) {
            if (err) { return next(err); }
            else if (results) {
                res.json({ message: 'Username already exists.' });
            } else {
                // Hash password
                bcrypt.hash(user.password, 10, (err, hashedPassword) => {
                    if (err) { return next(err); }
                    user.password = hashedPassword;

                    // Save user info to database
                    user.save(function(err) {
                        if (err) { return next(err); }
                        res.json({
                            user: {
                                _id: user._id,
                                email: user.email,
                                username: user.username,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                friends: user.friends,
                                requests: {
                                    sent: user.requests.sent,
                                    received: user.requests.received
                                },
                                likes: {
                                    posts: user.likes.posts,
                                    comments: user.likes.comments
                                },
                                public: user.public,
                                admin: user.admin
                            },
                            message: 'Success'
                        });
                    });
                });
            }
        });
    }
];

// Update User
exports.updateUser = [
    // Process User Update
    (req, res, next) => {
        const user = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            friends: req.body.friends,
            public: req.body.public,
            admin: req.body.admin
        });

        if (req.body.contact) { user.contact = req.body.contact; }
        if (req.body.pic) { user.pic = req.body.pic; }
        if (req.body.bio) { user.bio = req.body.bio; }
        if (req.body.requests) {
            user.requests.sent = req.body.requests.sent;
            user.requests.received = req.body.requests.received;
        }
        if (req.body.likes) {
            user.likes.posts = req.body.likes.posts;
            user.likes.comments = req.body.likes.comments;
        }

        // Clone user object & remove _id field for updating
        // The user object contains a new _id value, we want to update only the other field values
        let userClone = JSON.parse(JSON.stringify(user));
        delete userClone._id;

        // Check if username already exists AND is not same as previous username
        User.findOne({ 'username': user.username })
        .exec(function(err, results) {
            if (err) { return next(err); }
            else if (results && results.username != req.params.username) {
                res.json({ message: 'Username already exists.' });
            } else {
                // Hash password
                bcrypt.hash(user.password, 10, (err, hashedPassword) => {
                    if (err) { return next(err); }
                    user.password = hashedPassword;

                    // Update user info from database
                    User.findOneAndUpdate(
                        { 'username': req.params.username }, // Filter
                        userClone, // New values
                        { 'fields': { 'password': 0 }, // Exclude password from results
                          'new': true },
                        function(err, results) {
                            if (err) { return next(err); }
                            res.json({ user: results, message: 'Success' });
                        }
                    );
                });
            }
        });
    }
];

// Delete User
exports.deleteUser = function(req, res, next) {
    User.findOneAndRemove({ 'username': req.params.username }, function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Success' });
    });
};

// Send Friend Request
exports.sendRequest = function(req, res, next) {
    // Add User id to target User Received Requests array
    User.findOneAndUpdate(
        { 'username': req.params.username },
        { '$addToSet': { 'requests.received': req.user.info._id } },
        { 'fields': { 'password': 0 }, // Exclude password from results
          'new': true },
        function(err, target) {
            if (err) { next(err); }

            // Add target User id to User Sent Requests array
            User.findOneAndUpdate(
                { 'username': req.user.info.username },
                { '$addToSet': { 'requests.sent': target._id } },
                { 'fields': { 'password': 0 }, // Exclude password from results
                  'new': true },
                function(err, user) {
                    if (err) { next(err); }

                    // Update token
                    const token = jwt.sign({ info: user }, nconf.get('JWT_SECRET'), { expiresIn: nconf.get('JWT_EXP') });

                    res.json({ user, target, token, message: 'Success' });
                }
            );
        }
    );
};

// Delete Friend Request
exports.deleteRequest = function(req, res, next) {
    let userRequests;
    let targetRequests;

    // Set requests arrays to remove requests from
    if (req.params.type == 'sent') {
        userRequests = 'requests.sent';
        targetRequests = 'requests.received';
    } else if (req.params.type == 'received') {
        userRequests = 'requests.received';
        targetRequests = 'requests.sent';
    }

    // Remove User id from target User Sent/Received Requests array
    User.findOneAndUpdate(
        { 'username': req.params.username },
        { '$pull': { [targetRequests]: req.user.info._id } },
        { 'fields': { 'password': 0 }, // Exclude password from results
          'new': true },
        function(err, target) {
            if (err) { next(err); }

            // Remove target User id from User Sent/Received Requests array
            User.findOneAndUpdate(
                { 'username': req.user.info.username },
                { '$pull': { [userRequests]: target._id } },
                { 'fields': { 'password': 0 }, // Exclude password from results
                  'new': true },
                function(err, user) {
                    if (err) { next(err); }

                    // Update token
                    const token = jwt.sign({ info: user }, nconf.get('JWT_SECRET'), { expiresIn: nconf.get('JWT_EXP') });

                    res.json({ user, target, token, message: 'Success' });
                }
            );
        }
    );
};

// Add Friend
exports.addFriend = function(req, res, next) {
    // Add User id to target User Friends array, then remove User id from target User Sent Requests array
    User.findOneAndUpdate(
        { 'username': req.params.username },
        { '$addToSet': { 'friends': req.user.info._id },
          '$pull': { 'requests.sent': req.user.info._id } },
        { 'fields': { 'password': 0 }, // Exclude password from results
          'new': true },
        function(err, target) {
            if (err) { next(err); }

            // Add target User id to User Friends array, then remove target User id from User Received Requests array
            User.findOneAndUpdate(
                { 'username': req.user.info.username },
                { '$addToSet': { 'friends': target._id },
                  '$pull': { 'requests.received': target._id } },
                { 'fields': { 'password': 0 }, // Exclude password from results
                  'new': true },
                function(err, user) {
                    if (err) { next(err); }

                    // Update token
                    const token = jwt.sign({ info: user }, nconf.get('JWT_SECRET'), { expiresIn: nconf.get('JWT_EXP') });

                    res.json({ user, target, token, message: 'Success' });
                }
            );
        }
    );
};

// Delete Friend
exports.deleteFriend = function(req, res, next) {
    // Delete User id from target User Friends array
    User.findOneAndUpdate(
        { 'username': req.params.username },
        { '$pull': { 'friends': req.user.info._id } },
        { 'fields': { 'password': 0 }, // Exclude password from results
          'new': true },
        function(err, target) {
            if (err) { next(err); }

            // Delete target User id from User Friends array
            User.findOneAndUpdate(
                { 'username': req.user.info.username },
                { '$pull': { 'friends': target._id } },
                { 'fields': { 'password': 0 }, // Exclude password from results
                  'new': true },
                function(err, user) {
                    if (err) { next(err); }

                    // Update token
                    const token = jwt.sign({ info: user }, nconf.get('JWT_SECRET'), { expiresIn: nconf.get('JWT_EXP') });

                    res.json({ user, target, token, message: 'Success' });
                }
            );
        }
    );
};

// Get Friends
exports.getFriends = [
    (req, res, next) => {
        // Get User's Friends array
        User.findOne({ 'username': req.params.username }, { 'password': 0 }) // Exclude password from db query
        .exec(function(err, results) {
            if (err) { return next(err); }
            res.locals.friends = results.friends; // Save Friends array as local variable and pass to next middleware
            next();
        });
    },

    (req, res, next) => {
        // Find all Users where their id is in User's Friends array
        User.find(
        { '_id': { '$in': res.locals.friends } },
        { 'email': 0, 'password': 0, 'contact': 0, 'bio': 0, 'friends': 0, 'requests': 0, 'likes': 0, 'public': 0, 'admin': 0 },
        function(err, results) {
            if (err) { next(err); }
            res.json(results);
        });
    }
];

// Get Friend Requests
exports.getRequests = function(req, res, next) {
    let requests;
    if (req.params.type == 'sent') {
        requests = req.user.info.requests.sent;
    } else if (req.params.type == 'received') {
        requests = req.user.info.requests.received;
    }

    // Find all Users where their id is in User's Sent/Received Requests array
    User.find(
    { '_id': { '$in': requests } },
    { 'email': 0, 'password': 0, 'contact': 0, 'bio': 0, 'friends': 0, 'requests': 0, 'likes': 0, 'public': 0, 'admin': 0 },
    function(err, results) {
        if (err) { next(err); }
        res.json(results);
    });
};