const express = require('express');
const { signup, login, forgotPassword } = require('../controllers/authController');

const router = express.Router();

// Registers a new user account and returns a JWT.
router.post('/signup', signup);

// Authenticates an existing user and returns a JWT.
router.post('/login', login);

// Starts the password reset flow without exposing reset secrets or account existence.
router.post('/forgot-password', forgotPassword);

module.exports = router;
