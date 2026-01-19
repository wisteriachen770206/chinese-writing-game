// ============================================
// AUTHENTICATION & SAVE/LOAD SYSTEM
// ============================================
console.log('✅ auth.js loaded');

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
        
        // Create user object with name as primary identifier
        const user = {
            name: userObject.name,
            email: userObject.email,
            picture: userObject.picture
        };
        
        onUserLogin(user);
        hideAuthModal();
    } catch (error) {
        console.error('Error handling credential response:', error);
        // Fall back to demo mode on error
        simulateGoogleLogin();
    }
}

// Make handleCredentialResponse globally accessible for Google Sign-In callback
window.handleCredentialResponse = handleCredentialResponse;

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
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
        console.error('localStorage not available');
        showToast('Save Failed', 'Storage not available on this device.', '❌');
        return;
    }
    
    const progress = {
        userName: currentUser.name,
        currentLevel: currentLevel ? currentLevel.id : null,
        elapsedTime: timerElapsedSeconds,
        hp: currentHP,
        timestamp: Date.now()
    };
    
    try {
        // Save to user-specific key using name
        const userKey = `gameProgress_${currentUser.name}`;
        localStorage.setItem(userKey, JSON.stringify(progress));
        
        // Also save to simple key for backward compatibility
        localStorage.setItem('gameProgress', JSON.stringify(progress));
        
        // Verify save worked by reading back
        const verification = localStorage.getItem(userKey);
        if (verification) {
            console.log('✅ Game progress saved successfully:', progress);
            showToast('Progress Saved!', 'Your game progress has been saved successfully.', '💾');
        } else {
            throw new Error('Save verification failed');
        }
    } catch (error) {
        console.error('❌ Error saving progress:', error);
        console.error('Error details:', error.name, error.message);
        
        // Check if it's a quota exceeded error (common on mobile)
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            showToast('Save Failed', 'Storage full. Clear browser data and try again.', '⚠️', 4000);
        } else {
            showToast('Save Failed', 'Could not save your progress. Please try again.', '❌');
        }
    }
}

function loadGameProgress() {
    try {
        // First, try to load from user-specific key if user is logged in
        if (currentUser && currentUser.name) {
            const userKey = `gameProgress_${currentUser.name}`;
            const userData = localStorage.getItem(userKey);
            if (userData) {
                const progress = JSON.parse(userData);
                console.log('Loaded game progress (user-specific):', progress);
                return progress;
            }
        }
        
        // Fall back to simple key (for backward compatibility and non-logged-in users)
        const savedData = localStorage.getItem('gameProgress');
        if (savedData) {
            const progress = JSON.parse(savedData);
            console.log('Loaded game progress (simple key):', progress);
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
