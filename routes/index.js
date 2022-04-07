const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const indexController = require('../controllers/index');

// Auth
router.get('/auth', passport.authenticate('jwt', { session: false }), (req, res) => { res.json(req.user.info); });

// Log In
router.post('/log-in', indexController.logIn);

// Log Out
router.get('/log-out', (req, res) => { req.logout(); });

// Test (Should only be accessible if logged in)
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res) => { res.json('Accessible route as you are logged in.') });

module.exports = router;