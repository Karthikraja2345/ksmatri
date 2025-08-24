// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { getMyProfile, getAllUsers, getUserById, updateMyProfile } = require('../controllers/userController'); // <-- Import new controller
const { verifyFirebaseToken } = require('../middleware/authMiddleware');

// All routes in this file are protected by the token verification middleware
 
// PUT /api/users/me -> Updates the logged-in user's own profile
router.put('/me', verifyFirebaseToken, updateMyProfile); // <-- ADD THIS LINE

// GET /api/users/me -> Fetches the logged-in user's own profile
router.get('/me', verifyFirebaseToken, getMyProfile);

// GET /api/users/ -> Fetches all other users for the dashboard
router.get('/', verifyFirebaseToken, getAllUsers);

// GET /api/users/:id -> Fetches a specific user's profile by their MongoDB _id
router.get('/:id', verifyFirebaseToken, getUserById); // <-- ADD THIS NEW ROUTE

module.exports = router;