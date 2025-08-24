const express = require('express');
const router = express.Router();
const { registerUserInDb } = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// Route: POST /api/auth/register
// 1. First, our `verifyFirebaseToken` middleware runs.
// 2. If the token is valid, it calls `registerUserInDb`.
router.post('/register', verifyFirebaseToken, registerUserInDb);

module.exports = router;