const { faker } = require('@faker-js/faker');
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');

const generateUser = () =>  {
    return new User({
        username: faker.internet.userName(),
        password: faker.datatype.string(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        public: true,
        admin: false
    });
};

const generatePost = (user) =>  {
    return new Post({
        author: user.id,
        date: faker.date.between(),
        content: faker.random.words(),
        public: true
    });
};

const generateComment = (user, post) =>  {
    return new Comment({
        post: post.id,
        author: user.id,
        date: faker.date.between(),
        content: faker.random.words(),
        public: true
    });
};

const seed = (totalUsers, totalPosts, totalComments) => {
    const users = [];
    const posts = [];
    const comments = [];

    // Generate Users
    for (let i = 0; i < totalUsers; i++) {
        users.push(generateUser());
    }

    // Generate Posts (NOTE: Must have at least 1 user)
    if (users.length > 0) {
        for (let i = 0; i < totalPosts; i++) {
            posts.push(generatePost(users[0]));
        }

        // Generate Comments (NOTE: Must have at least 1 user and 1 post)
        if (posts.length > 0) {
            for (let i = 0; i < totalComments; i++) {
                comments.push(generateComment(users[0], posts[0]));
            }
        }
    }

    // Save Generated Data to Database
    users.forEach(user => {
        user.save(function(err) {
            if (err) { return err; }
        });
    });

    posts.forEach(post => {
        post.save(function(err) {
            if (err) { return err; }
        });
    });

    comments.forEach(comment => {
        comment.save(function(err) {
            if (err) { return err; }
        });
    });

    return;
};

module.exports = { seed };