// js/main.js (FINAL REFACTORED VERSION)

import { firebaseConfig } from './config.js';
import { handleRegistration, handleLogin, handleLogout } from './services/auth.js';
import { protectPage, authReady } from './auth-guard.js';
import { apiGet, apiPut } from './services/api.js';

// Initialize Firebase App
firebase.initializeApp(firebaseConfig);

// --- Main Application Logic (Router) ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path === '/') {
        protectPage('register');
        initializeRegistrationPage();
    } else if (path.endsWith('login.html')) {
        protectPage('login');
        initializeLoginPage();
    } else if (path.endsWith('dashboard.html')) {
        protectPage('dashboard');
        initializeDashboardPage();
    } else if (path.endsWith('edit-profile.html')) {
        protectPage('edit-profile');
        initializeEditProfilePage();
    } else if (path.endsWith('profile.html')) {
        protectPage('profile');
        initializeProfilePage();
    }
});


// --- Helper Functions for UI Feedback (Unchanged) ---
const showLoader = (button) => {
    const textSpan = button.querySelector('span');
    const loader = document.createElement('div');
    loader.className = 'loader';
    button.classList.add('loading');
    button.disabled = true;
    if (textSpan) textSpan.style.visibility = 'hidden';
    button.appendChild(loader);
};

const hideLoader = (button) => {
    const textSpan = button.querySelector('span');
    const loader = button.querySelector('.loader');
    button.classList.remove('loading');
    button.disabled = false;
    if (textSpan) textSpan.style.visibility = 'visible';
    if (loader) loader.remove();
};

const showMessage = (message, isSuccess = false) => {
    const messageDiv = document.getElementById('message-display');
    if (!messageDiv) return;
    messageDiv.textContent = message;
    messageDiv.className = 'message-display';
    if (message) {
        messageDiv.classList.add(isSuccess ? 'success' : 'error');
    }
};


// --- REUSABLE HEADER INITIALIZER ---
function initializeHeader(myProfile) {
    const profileNameElement = document.querySelector('.profile-name');
    if (profileNameElement) profileNameElement.textContent = myProfile.fullName;

    const profilePicElement = document.querySelector('.main-header .profile-pic');
    if (profilePicElement) profilePicElement.src = myProfile.profilePhotoUrl || './assets/images/profile-placeholder.jpg';

    const dropdown = document.querySelector('.profile-dropdown');
    if (!dropdown) return;
    const clickableArea = dropdown.querySelector('.profile-summary-clickable');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (!clickableArea || !menu) return;

    clickableArea.addEventListener('click', (event) => {
        event.stopPropagation();
        menu.classList.toggle('active');
    });

    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await handleLogout();
            window.location.href = 'login.html';
        });
    }

    window.addEventListener('click', () => {
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
        }
    });
}


// --- Page Initializers (Updated to use initializeHeader correctly) ---

// --- initializeRegistrationPage (Unchanged) ---
function initializeRegistrationPage() {
    const form = document.getElementById('registration-form');
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage('');
        showLoader(submitButton);
        const formData = { fullName: form.fullName.value, dob: form.dob.value, gender: form.gender.value, religion: form.religion.value, motherTongue: form.motherTongue.value, mobileNumber: form.mobile.value, email: form.email.value, password: form.password.value, confirmPassword: form.confirmPassword.value, location: form.location.value };
        try {
            await handleRegistration(formData);
            await handleLogout();
            hideLoader(submitButton);
            showMessage('Registration Successful! Redirecting to login...', true);
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } catch (error) {
            hideLoader(submitButton);
            showMessage(error.message, false);
        }
    });
}

// --- initializeLoginPage (Unchanged) ---
function initializeLoginPage() {
    const form = document.getElementById('login-form');
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage('');
        showLoader(submitButton);
        const email = form.email.value;
        const password = form.password.value;
        try {
            await handleLogin(email, password);
            hideLoader(submitButton);
            showMessage('Login Successful! Redirecting to dashboard...', true);
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        } catch (error) {
            hideLoader(submitButton);
            showMessage(error.message, false);
        }
    });
}

// --- initializeDashboardPage (Corrected) ---
async function initializeDashboardPage() {
    try {
        await authReady();
        const myProfile = await apiGet('/users/me');
        initializeHeader(myProfile); // Initialize the header first

        const profilesGrid = document.querySelector('.profiles-grid');
        const users = await apiGet('/users/');
        profilesGrid.innerHTML = '';
        if (users.length === 0) {
            profilesGrid.innerHTML = `<p>No other users have registered yet. Check back soon!</p>`;
            return;
        }
        users.forEach(user => {
            const getAge = dobString => {
                const today = new Date();
                const birthDate = new Date(dobString);
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
                return age;
            };
            const userAge = getAge(user.dob);
            const card = document.createElement('div');
            card.className = 'profile-card';
            card.innerHTML = `
                <div class="card-image"><img src="${user.profilePhotoUrl || './assets/images/profile-placeholder.jpg'}" alt="Profile Photo">
                ${user.membership.plan !== 'free' ? `<div class="premium-badge"><i class='bx bxs-star'></i> Premium</div>` : ''}</div>
                <div class="card-body"><h3>${user.fullName}, ${userAge}</h3><p class="location"><i class='bx bxs-map'></i> ${user.location}</p>
                <p class="summary">${user.motherTongue}, ${user.religion || 'Not specified'}</p><div class="card-actions">
                <button class="action-btn btn-like"><i class='bx bxs-heart'></i> Like</button><button class="action-btn btn-shortlist"><i class='bx bxs-playlist-add'></i> Shortlist</button>
                <button class="action-btn btn-message" disabled><i class='bx bxs-message-rounded-dots'></i> Message</button></div></div>
                <a href="./profile.html?id=${user._id}" class="view-profile-link">View Full Profile</a>`;
            profilesGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Failed to initialize dashboard:", error);
        const profilesGrid = document.querySelector('.profiles-grid');
        if (profilesGrid) {
            profilesGrid.innerHTML = `<p style="color: var(--error-color);">Could not load user profiles. Please try again later.</p>`;
        }
    }
}

// --- initializeProfilePage (Corrected) ---
async function initializeProfilePage() {
    try {
        await authReady();
        const myProfile = await apiGet('/users/me');
        initializeHeader(myProfile); // Initialize the header first

        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        if (!userId) { document.body.innerHTML = '<h1>Error: No user ID provided.</h1>'; return; }
        const user = await apiGet(`/users/${userId}`);
        const getAge = (dobString) => {
            const today = new Date();
            const birthDate = new Date(dobString);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            return age;
        };
        const userAge = getAge(user.dob);
        document.querySelector('.profile-header .profile-name').textContent = user.fullName;
        document.querySelector('.profile-picture').src = user.profilePhotoUrl || './assets/images/profile-placeholder.jpg';
        document.querySelector('.profile-meta').textContent = `${userAge} Years, ${user.religion || 'Religion not specified'}, ${user.location}`;
        document.querySelector('.profile-occupation').innerHTML = `<i class='bx bxs-briefcase'></i> ${user.occupation || 'Occupation not specified'}`;
        const premiumBadge = document.querySelector('.profile-summary .premium-badge');
        if (user.membership.plan !== 'free' && premiumBadge) { premiumBadge.style.display = 'flex'; } else if (premiumBadge) { premiumBadge.style.display = 'none'; }
        const aboutMeText = document.querySelector('.about-me-text');
        if (user.aboutMe) { aboutMeText.textContent = `"${user.aboutMe}"`; } else { aboutMeText.textContent = "This user has not written a summary yet."; aboutMeText.style.fontStyle = 'normal'; }
        document.querySelector('#about .details-grid').innerHTML = `
            <div class="detail-item"><span>Mother Tongue</span><strong>${user.motherTongue}</strong></div><div class="detail-item"><span>Marital Status</span><strong>Never Married</strong></div>
            <div class="detail-item"><span>Email</span><strong>${user.email}</strong></div><div class="detail-item"><span>Location</span><strong>${user.location}</strong></div>
            <div class="detail-item"><span>Gender</span><strong>${user.gender}</strong></div><div class="detail-item"><span>Height</span><strong>${user.height ? `${user.height} cm` : 'Not specified'}</strong></div>`;
        document.querySelector('#career .details-grid').innerHTML = `
            <div class="detail-item"><span>Highest Education</span><strong>${user.education || 'Not specified'}</strong></div><div class="detail-item"><span>Occupation</span><strong>${user.occupation || 'Not specified'}</strong></div>
            <div class="detail-item"><span>Annual Income</span><strong>Not specified</strong></div>`;
        const aboutTabLink = document.querySelector('.tab-link[data-tab="about"]');
        if(aboutTabLink) { aboutTabLink.textContent = `About ${user.fullName.split(' ')[0]}`; }
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        tabLinks.forEach(link => {
            link.addEventListener('click', () => {
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                link.classList.add('active');
                const tabId = link.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    } catch (error) {
        console.error("Failed to load profile page:", error);
        document.querySelector('.profile-page-container').innerHTML = `<h1 style="color: var(--error-color);">Could not load user profile. It may not exist or an error occurred.</h1>`;
    }
}

// --- initializeEditProfilePage (Corrected) ---
async function initializeEditProfilePage() {
    try {
        await authReady();
        const myProfile = await apiGet('/users/me');
        initializeHeader(myProfile); // Initialize the header first

        const form = document.getElementById('edit-profile-form');
        if (!form) return;

        form.fullName.value = myProfile.fullName;
        form.email.value = myProfile.email;
        form.height.value = myProfile.height || '';
        form.religion.value = myProfile.religion || '';
        form.aboutMe.value = myProfile.aboutMe || '';
        form.education.value = myProfile.education || '';
        form.occupation.value = myProfile.occupation || '';
        
        const submitButton = form.querySelector('.btn-save');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            showMessage('');
            showLoader(submitButton);
            const updatedData = {
                height: form.height.value,
                religion: form.religion.value,
                aboutMe: form.aboutMe.value,
                education: form.education.value,
                occupation: form.occupation.value,
            };
            try {
                await apiPut('/users/me', updatedData);
                hideLoader(submitButton);
                showMessage('Profile updated successfully! Redirecting...', true);
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } catch (error) {
                hideLoader(submitButton);
                showMessage(error.message, false);
            }
        });
    } catch (error) {
        console.error("Failed to initialize edit profile page:", error);
        document.querySelector('.edit-profile-container').innerHTML = `<h1 style="color: var(--error-color);">Could not load your profile for editing.</h1>`;
    }
}