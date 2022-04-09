const express = require('express');
const router = express.Router();
const passport = require('passport');

// Controller
const userController = require('../controllers/user');

// Get Users
router.get('/', userController.getUsers);

// Get User
router.get('/:username', userController.getUser);

// Get User From ID
router.get('/id/:userId', userController.getUserFromId);

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

// Get Friends
router.get('/:username/get-friends',
    passport.authenticate('jwt', { session: false }),
    userController.getFriends);

// Send Friend Request
router.post('/:username/send-request',
    passport.authenticate('jwt', { session: false }),
    userController.sendRequest);

// Delete Friend Request
router.post('/:username/delete-request/:type',
    passport.authenticate('jwt', { session: false }),
    userController.deleteRequest);

// Add Friend
router.post('/:username/add-friend',
    passport.authenticate('jwt', { session: false }),
    userController.addFriend);

// Delete Friend
router.post('/:username/delete-friend',
    passport.authenticate('jwt', { session: false }),
    userController.deleteFriend);

module.exports = router;