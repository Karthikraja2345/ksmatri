const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    motherTongue: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    location: { type: String, required: true },
    religion: String, // Optional
    profilePhotoUrl: String, // Will be added later
    membership: {
        plan: { type: String, default: 'free', enum: ['free', 'premium', 'premium-plus'] },
    },
    role: { type: String, default: 'user', enum: ['user', 'admin'] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);