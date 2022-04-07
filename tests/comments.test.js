const request = require('supertest');
const express = require('express');
const { startMongoServer, stopMongoServer } = require('./mongoConfigTesting');
const seeds = require('./seeds');

require('../passport');

const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
const postsRouter = require('../routes/posts');
const commentsRouter = require('../routes/comments');

const app = express(); // Set up a separate express app

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

let token;
let user;
let post;
let comment;

beforeAll(async () => {
    await startMongoServer();

    // Populate database with mock data

    // Seed database
    seeds.seed(1, 1, 4);

    // Create User
    let response = await request(app)
    .post('/api/users/create')
    .send({
        email: 'test@test.com',
        username: 'test',
        password: 'test',
        firstName: 'test',
        lastName: 'test',
        public: true,
        admin: false
    });

    user = response.body.user;

    // Log In
    response = await request(app)
    .post('/api/log-in')
    .send({
        email: 'test@test.com',
        password: 'test'
    });

    token = response.body.token;

    // Create Post
    response = await request(app)
    .post('/api/posts/create')
    .set('Authorization', 'Bearer ' + token)
    .send({
        author: user._id,
        date: new Date(),
        content: 'test',
        image: 'test',
        public: true
    });

    post = response.body.post;

    // Create Comment
    response = await request(app)
    .post('/api/posts/' + post._id + '/comments/create')
    .set('Authorization', 'Bearer ' + token)
    .send({
        post: post._id,
        author: user._id,
        date: new Date(),
        content: 'test',
        public: true
    });

    comment = response.body.comment;
});

/* Template
test('This is a test', done => {
    request(app).get('/')
        .expect('Content-Type', /json/)
        .expect(200, done);

test('This is an async/await test', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-type']).toMatch(/json/);
});*/

// Get Comments
test('GET /api/comments', async () => {
    const response = await request(app).get('/api/comments');
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toEqual(5);
});

// Get Comment
test('GET /api/comments/:commentId', async () => {
    const response = await request(app).get('/api/comments/' + comment._id);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body._id).toEqual(comment._id);
});

// Delete Post
test('POST /api/comments/:commentId/delete', async () => {
    const response = await request(app).post('/api/comments/' + comment._id + '/delete')
    .set('Authorization', 'Bearer ' + token);
    expect(response.body.message).toEqual('Success');
});

afterAll(async () => {
    await stopMongoServer();
});