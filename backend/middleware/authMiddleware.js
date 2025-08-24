const admin = require('firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).send('Unauthorized: No token provided.');
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // Adds user info (uid, email) to the request object
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized: Invalid token.');
    }
};

module.exports = { verifyFirebaseToken };