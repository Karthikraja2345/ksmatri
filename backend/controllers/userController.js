// backend/controllers/userController.js

const User = require('../models/userModel');
const mongoose = require('mongoose');

// --- GET The Logged-In User's Profile ---
const getMyProfile = async (req, res) => {
    try {
        // req.user.uid comes from the authMiddleware
        const user = await User.findOne({ firebaseUid: req.user.uid });
        if (!user) {
            // This case might happen if a user exists in Firebase but not our DB
            return res.status(404).json({ message: "User profile not found." });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching own profile:", error);
        res.status(500).json({ message: "Server error fetching profile." });
    }
};

// --- NEW FUNCTION: GET All Other Users (Potential Matches) ---
const getAllUsers = async (req, res) => {
    try {
        // Find all users EXCEPT the one whose firebaseUid matches the logged-in user
        const users = await User.find({ firebaseUid: { $ne: req.user.uid } });
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ message: "Server error fetching users." });
    }
};

// --- NEW FUNCTION: GET A SINGLE USER BY THEIR ID ---
const getUserById = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the URL parameter

        // Check if the provided ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // We can choose to not send sensitive info, like their email,
        // but for now, we'll send the whole profile.
        res.status(200).json(user);

    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Server error fetching user profile." });
    }
};


// --- NEW FUNCTION: UPDATE The Logged-In User's Profile ---
const updateMyProfile = async (req, res) => {
    try {
        const { uid } = req.user; // Get UID from middleware
        
        // We only want to allow users to update certain fields
        const { height, religion, aboutMe, education, occupation } = req.body;
        const allowedUpdates = { height, religion, aboutMe, education, occupation };

        // Find the user by their Firebase UID and update them
        // The { new: true } option ensures the updated document is returned
        const updatedUser = await User.findOneAndUpdate(
            { firebaseUid: uid },
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "Profile updated successfully.", user: updatedUser });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error during profile update." });
    }
};


module.exports = { getMyProfile, getAllUsers, getUserById, updateMyProfile }; // Export the new function