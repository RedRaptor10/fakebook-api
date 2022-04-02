const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const userController = require('../controllers/user');

// Get Users
router.get('/', userController.getUsers);

// Get User
router.get('/:username', userController.getUser);

// Create User
router.post('/create', userController.createUser);

// Update User
router.post('/:username/update',
    passport.authenticate('jwt', { session: false }), // Check user login
    userController.auth, // Check if user is an admin or self
    userController.updateUser);

// Delete User
router.post('/:username/delete',
    passport.authenticate('jwt', { session: false }),
    userController.auth,
    userController.deleteUser);

// Send Friend Request
router.post('/:username/send-request',
    passport.authenticate('jwt', { session: false }),
    userController.sendRequest);

// Delete Friend Request
router.post('/:username/delete-request',
    passport.authenticate('jwt', { session: false }),
    userController.deleteRequest);

module.exports = router;