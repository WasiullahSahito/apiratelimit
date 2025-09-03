const express = require('express');
const router = express.Router();
const { getPublicData, getProtectedData } = require('../controllers/dataController');

// All routes in this file are protected by the globalLimiter we applied in server.js

router.get('/public', getPublicData);
router.get('/protected', getProtectedData);

module.exports = router;