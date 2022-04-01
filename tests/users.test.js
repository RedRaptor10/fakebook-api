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

beforeAll(async () => {
    await startMongoServer();

    // Populate database with mock data

    // Seed database
    seeds.seed(4, 0, 0);

    // Create User
    await request(app)
    .post('/api/users/create')
    .send({
        username: 'test',
        password: 'test',
        firstName: 'test',
        lastName: 'test',
        public: true,
        admin: false
    });

    // Log In
    const response = await request(app)
    .post('/api/log-in')
    .send({
        username: 'test',
        password: 'test'
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
    const response = await request(app).get('/api/users/test');
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.username).toEqual('test');
});

// Update User
test('POST /api/users/:username/update', async () => {
    const response = await request(app).post('/api/users/test/update')
    .set('Authorization', 'Bearer ' + token)
    .send({
        username: 'test2',
        password: 'test'
    });
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(response.body.user.username).toEqual('test2');
});

// Delete User
test('POST /api/users/:username/delete', async () => {
    const response = await request(app).post('/api/users/test/delete')
    .set('Authorization', 'Bearer ' + token);
    expect(response.body.message).toEqual('Success');
});

afterAll(async () => {
    await stopMongoServer();
});