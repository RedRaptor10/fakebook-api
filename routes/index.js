const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const indexController = require('../controllers/index');
const userController = require('../controllers/user');

// Auth
router.get('/auth', passport.authenticate('jwt', { session: false }), (req, res) => { res.json(req.user.info); });

// Log In
router.post('/log-in', indexController.logIn);

// Log Out
router.get('/log-out', (req, res) => { req.logout(); });

// Get Friend Requests
router.get('/get-requests/:type',
    passport.authenticate('jwt', { session: false }),
    userController.getRequests);

// Test (Should only be accessible if logged in)
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => { res.json('Accessible route as you are logged in.') });

module.exports = router;