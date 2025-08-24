// js/auth-guard.js

/**
 * The primary function to manage authentication state across the application.
 * It returns a Promise that resolves with the user object if logged in,
 * or rejects and handles redirection if not logged in.
 */
export function authReady() {
    return new Promise((resolve, reject) => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            unsubscribe(); // Stop listening after we get the first result
            if (user) {
                // User is signed in.
                resolve(user);
            } else {
                // No user is signed in.
                reject('User not authenticated.');
            }
        });
    });
}

/**
 * Page protection logic that uses the authReady promise.
 * @param {string} currentPage - 'dashboard', 'login', 'register', etc.
 */
export async function protectPage(currentPage) {
    try {
        await authReady(); // Wait for Firebase to confirm login
        console.log(`AuthGuard: User is logged in. Access granted to ${currentPage}.`);

        // If a logged-in user is on an auth page, redirect them away.
        if (currentPage === 'login' || currentPage === 'register') {
            window.location.replace('dashboard.html');
        }

    } catch (error) { // This catch block runs if authReady() rejects (user is not logged in)
        console.log(`AuthGuard: ${error}. Access denied.`);

        // If a non-logged-in user tries to access a protected page, redirect them.
        if (currentPage !== 'login' && currentPage !== 'register') {
            window.location.replace('login.html');
        }
    }
}