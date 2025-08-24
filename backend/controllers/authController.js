const User = require('../models/userModel');

// This function is called AFTER Firebase has created the user.
// Its job is to create the corresponding profile in our MongoDB.
const registerUserInDb = async (req, res) => {
    try {
        // req.user is added by our verifyFirebaseToken middleware
        const { uid, email } = req.user;
        const { fullName, dob, gender, motherTongue, mobileNumber, location, religion } = req.body;

        // Check if user already exists in our DB
        const existingUser = await User.findOne({ firebaseUid: uid });
        if (existingUser) {
            return res.status(400).json({ message: 'User profile already exists.' });
        }

        const newUser = new User({
            firebaseUid: uid,
            email,
            fullName,
            dob,
            gender,
            motherTongue,
            mobileNumber,
            location,
            religion: religion || null
        });

        await newUser.save();
        res.status(201).json({ message: 'User profile created successfully in DB', user: newUser });

    } catch (error) {
        console.error("DB Registration Error:", error);
        res.status(500).json({ message: 'Server error during profile creation.' });
    }
};

module.exports = { registerUserInDb };