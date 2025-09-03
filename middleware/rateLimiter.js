const { rateLimit, ipKeyGenerator } = require('express-rate-limit'); // <-- IMPORT IT HERE
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

        store = new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        });
        console.log('Connected to Redis for rate limiting.');
    } catch (error) {
        console.error('Could not connect to Redis. Falling back to in-memory store.', error);
        store = null;
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
    });
    res.status(options.statusCode).send(options.message);
};

// --- Middleware Definitions ---

// 1. Global Rate Limiter
const globalLimiter = rateLimit({
    store,
    windowMs: parseInt(process.env.GLOBAL_RATE_LIMIT_WINDOW_MIN) * 60 * 1000,
    max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_REQUESTS),
    message: {
        status: 429,
        message: `Too many requests from this IP, please try again after ${process.env.GLOBAL_RATE_LIMIT_WINDOW_MIN} minutes.`,
    },
    standardHeaders: 'draft-7',
    legacyHeaders: true,
    handler,
    skip,
});

// 2. Stricter Limiter for Auth Routes
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
const loginThrottler = slowDown({
    windowMs: parseInt(process.env.LOGIN_THROTTLE_WINDOW_MIN) * 60 * 1000,
    delayAfter: parseInt(process.env.LOGIN_THROTTLE_DELAY_AFTER),
    delayMs: (hits) => hits * parseInt(process.env.LOGIN_THROTTLE_DELAY_MS),
    skip,
    // Use the library's recommended key generator for IP addresses
    keyGenerator: ipKeyGenerator, // <-- THIS IS THE FIX
});

module.exports = {
    globalLimiter,
    authLimiter,
    loginThrottler,
};