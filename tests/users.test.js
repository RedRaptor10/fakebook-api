const request = require('supertest');
const express = require('express');
const { startMongoServer, stopMongoServer } = require('./mongoConfigTesting');
const seeds = require('./seeds');

require('../passport');

const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');

const app = express(); // Set up a separate express app

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);

let token;
let user;
let target;

beforeAll(async () => {
    await startMongoServer();

    // Populate database with mock data

    // Seed database
    seeds.seed(3, 0, 0);

    // Create Users
    let response = await request(app)
    .post('/api/users/create')
    .send({
        email: 'test1@test.com',
        username: 'test1',
        password: 'test1',
        firstName: 'test1',
        lastName: 'test1',
        public: true,
        admin: false
    });

    user = response.body.user;

    response = await request(app)
    .post('/api/users/create')
    .send({
        email: 'test2@test.com',
        username: 'test2',
        password: 'test2',
        firstName: 'test2',
        lastName: 'test2',
        public: true,
        admin: false
    });

    target = response.body.user;

    // Log In
    response = await request(app)
    .post('/api/log-in')
    .send({
        email: 'test1@test.com',
        password: 'test1'
    });

    token = response.body.token;
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

// Get Users
test('GET /api/users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toEqual(5);
});

// Get User
test('GET /api/users/:username', async () => {
    const response = await request(app).get('/api/users/test1');
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.username).toEqual('test1');
});

// Send Friend Request
test('POST /api/users/:username/send-request', async () => {
    const response = await request(app).post('/api/users/test2/send-request')
    .set('Authorization', 'Bearer ' + token);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.target.requests.received).toEqual([user._id]);
    expect(response.body.user.requests.sent).toEqual([target._id]);
});

// Delete Sent Friend Request
test('POST /api/users/:username/delete-request/:type', async () => {
    const response = await request(app).post('/api/users/test2/delete-request/sent')
    .set('Authorization', 'Bearer ' + token);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.target.requests.received).toEqual([]);
    expect(response.body.user.requests.sent).toEqual([]);
});

// Add Friend
test('POST /api/users/:username/add-friend', async () => {
    const response = await request(app).post('/api/users/test2/add-friend')
    .set('Authorization', 'Bearer ' + token);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.target.friends).toEqual([user._id]);
    expect(response.body.user.friends).toEqual([target._id]);
});

// Delete Friend
test('POST /api/users/:username/delete-friend', async () => {
    const response = await request(app).post('/api/users/test2/delete-friend')
    .set('Authorization', 'Bearer ' + token);
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.target.friends).toEqual([]);
    expect(response.body.user.friends).toEqual([]);
});

// Update User
test('POST /api/users/:username/update', async () => {
    const response = await request(app).post('/api/users/test1/update')
    .set('Authorization', 'Bearer ' + token)
    .send({
        username: 'test',
        password: 'test'
    });
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.user.username).toEqual('test');
});

// Delete User
test('POST /api/users/:username/delete', async () => {
    const response = await request(app).post('/api/users/test1/delete')
    .set('Authorization', 'Bearer ' + token);
    expect(response.body.message).toEqual('Success');
});

afterAll(async () => {
    await stopMongoServer();
});