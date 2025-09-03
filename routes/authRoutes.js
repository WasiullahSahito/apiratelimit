const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { authLimiter, loginThrottler } = require('../middleware/rateLimiter');

// Apply the stricter rate limiter to both signup and login
router.post('/signup', authLimiter, signup);

// Apply both the stricter limiter AND the login throttler.
// The order is important: limit first, then throttle.
router.post('/login', authLimiter, loginThrottler, login);

module.exports = router;