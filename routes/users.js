var express = require('express');
var router = express.Router();

// Controller
const userController = require('../controllers/user');

// Get Users
router.get('/', userController.getUsers);

// Get User
router.get('/:username', userController.getUser);

// Create User
router.post('/create', userController.createUser);

// Update User
router.post('/:username/update', userController.updateUser);

// Delete User
router.post('/:username/delete', userController.deleteUser);

module.exports = router;