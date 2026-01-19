// ============================================
// AUTHENTICATION & SAVE/LOAD SYSTEM
// ============================================

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Handle Google credential response (for production use)
function handleCredentialResponse(response) {
    try {
        const userObject = parseJwt(response.credential);
        console.log('User logged in:', userObject);
        onUserLogin(userObject);
        hideAuthModal();
    } catch (error) {
        console.error('Error handling credential response:', error);
    }
}

// Simulate Google login for demo (remove in production)
function simulateGoogleLogin() {
    const demoUser = {
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%238b5cf6"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">D</text></svg>'
    };
    onUserLogin(demoUser);
    hideAuthModal();
}

function onUserLogin(user) {
    currentUser = user;
    updateUserInfoDisplay(user);
    
    // Auto-save if in level complete screen
    const levelCompleteOverlay = document.getElementById('level-complete-overlay');
    if (levelCompleteOverlay && !levelCompleteOverlay.classList.contains('hidden')) {
        saveGameProgress();
        showToast('Progress Saved!', 'Your game progress has been saved successfully.', '💾');
    }
}

function updateUserInfoDisplay(user) {
    const userInfo = document.getElementById('user-info');
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    
    if (userInfo && userAvatar && userName) {
        userAvatar.src = user.picture || '';
        userName.textContent = user.name || user.email;
        userInfo.classList.remove('hidden');
    }
}

function handleLogout() {
    currentUser = null;
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.classList.add('hidden');
    }
    showToast('Logged Out', 'You have been logged out successfully.', '👋');
}

function checkUserLoginStatus() {
    // Check if user is already logged in (from previous session)
    // In production, you would check for valid session/token here
    // For demo, we can check localStorage for saved progress
    const savedProgress = localStorage.getItem('gameProgress');
    if (savedProgress) {
        console.log('Found saved progress:', savedProgress);
    }
}

function saveGameProgress() {
    if (!currentUser) {
        console.warn('Cannot save progress: user not logged in');
        return;
    }
    
    const progress = {
        userId: currentUser.email,
        currentLevel: currentLevel ? currentLevel.id : null,
        elapsedTime: timerElapsedSeconds,
        hp: currentHP,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem('gameProgress', JSON.stringify(progress));
        console.log('Game progress saved:', progress);
        showToast('Progress Saved!', 'Your game progress has been saved successfully.', '💾');
    } catch (error) {
        console.error('Error saving progress:', error);
        showToast('Save Failed', 'Could not save your progress. Please try again.', '❌');
    }
}

function loadGameProgress() {
    try {
        const savedData = localStorage.getItem('gameProgress');
        if (savedData) {
            const progress = JSON.parse(savedData);
            console.log('Loaded game progress:', progress);
            return progress;
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
    return null;
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Error parsing JWT:', e);
        return null;
    }
}

// LocalStorage functions for character index
function loadSavedCharacterIndex() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) {
            const index = parseInt(saved, 10);
            if (!isNaN(index) && index >= 0) {
                console.log(`Loaded saved character index: ${index}`);
                return index;
            }
        }
    } catch (e) {
        console.warn('Could not load saved character index:', e);
    }
    return 0;
}

function saveCharacterIndex(index) {
    try {
        localStorage.setItem(STORAGE_KEY, index.toString());
        console.log(`Saved character index: ${index}`);
    } catch (e) {
        console.warn('Could not save character index:', e);
    }
}
