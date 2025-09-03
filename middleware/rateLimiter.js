const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { RedisStore } = require('rate-limit-redis');
const { createClient } = require('redis');

// --- Optional Redis Store for Distributed Scaling ---
let store = null;
if (process.env.REDIS_URL) {
    try {
        const redisClient = createClient({
            url: process.env.REDIS_URL,
        });
        redisClient.connect().catch(console.error);

        // Use RedisStore for express-rate-limit
        store = new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        });
        console.log('Connected to Redis for rate limiting.');
    } catch (error) {
        console.error('Could not connect to Redis. Falling back to in-memory store.', error);
        store = null; // Fallback to MemoryStore
    }
}

// --- Whitelist Configuration ---
const whitelist = process.env.RATE_LIMIT_WHITELIST ? process.env.RATE_LIMIT_WHITELIST.split(',') : [];

const skip = (req, res) => whitelist.includes(req.ip);

// --- Custom Handler for Logging ---
const handler = (req, res, next, options) => {
    const message = `Rate limit exceeded for ${req.ip}. Path: ${req.path}`;
    console.warn({
        message,
        ip: req.ip,
        path: req.path,
        method: req.method,
        limit: options.limit,
        windowMs: options.windowMs,
    });
    res.status(options.statusCode).send(options.message);
};

// --- Middleware Definitions ---

// 1. Global Rate Limiter
// Applied to all requests. Limits to 100 requests per 15 minutes.
const globalLimiter = rateLimit({
    store,
    windowMs: parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MIN) * 60 * 1000,
    max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_REQUESTS),
    message: {
        status: 429,
        message: `Too many requests from this IP, please try again after ${process.env.GLOBAL_RATE_LIMIT_WINDOW_MIN} minutes.`,
    },
    standardHeaders: 'draft-7', // Recommended standard for RateLimit-* headers
    legacyHeaders: true, // Also include X-RateLimit-* headers for compatibility
    handler,
    skip,
});

// 2. Stricter Limiter for Auth Routes
// Applied to /api/auth/*. Limits to 10 requests per 10 minutes.
const authLimiter = rateLimit({
    store,
    windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MIN) * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS),
    message: {
        status: 429,
        message: `Too many attempts on authentication routes, please try again after ${process.env.AUTH_RATE_LIMIT_WINDOW_MIN} minutes.`,
    },
    standardHeaders: 'draft-7',
    legacyHeaders: true,
    handler,
    skip,
});

// 3. Login Throttler (Brute-force protection)
// Slows down responses by 500ms for each attempt after the 5th failed login attempt.
const loginThrottler = slowDown({
    // Note: express-slow-down uses an in-memory store by default.
    // For a distributed environment, you'd need a custom Redis store for this as well.
    windowMs: parseInt(process.env.LOGIN_THROTTLE_WINDOW_MIN) * 60 * 1000,
    delayAfter: parseInt(process.env.LOGIN_THROTTLE_DELAY_AFTER),
    delayMs: (hits) => hits * parseInt(process.env.LOGIN_THROTTLE_DELAY_MS),
    skip,
    // Key generator to identify the user, typically by IP or email.
    keyGenerator: (req, res) => {
        return req.ip; // Or req.body.email for more specific throttling
    },
});

module.exports = {
    globalLimiter,
    authLimiter,
    loginThrottler,
};