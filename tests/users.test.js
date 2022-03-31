const request = require('supertest');
const express = require('express');
const { startMongoServer, stopMongoServer } = require('./mongoConfigTesting');

const usersRouter = require('../routes/users');

const app = express(); // Set up a separate express app

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/', usersRouter);

beforeAll(async () => {
    await startMongoServer();

    // Insert mock data
    await request(app)
        .post('/create')
        .set('Accept', 'application/json')
        .send({
            username: 'test',
            password: 'test',
            firstName: 'test',
            lastName: 'test',
            public: true,
            admin: false
        });
});

/* Template
test('This is a test', done => {
    request(app).get('/')
        .expect('Content-Type', /json/)
        .expect(200, done);

async/await
test('This is an async/await test', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-type']).toMatch(/json/);
});*/

test('GET /api/users', async () => {
    const response = await request(app).get('/');
    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.status).toEqual(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toEqual(1);
});

afterAll(async () => {
    await stopMongoServer();
});