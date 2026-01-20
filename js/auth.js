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
    console.log('🔵 simulateGoogleLogin called');
    const demoUser = {
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%238b5cf6"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">D</text></svg>'
    };
    console.log('🔵 Demo user created:', demoUser);
    onUserLogin(demoUser);
    hideAuthModal();
    console.log('✅ simulateGoogleLogin completed');
}

function onUserLogin(user) {
    console.log('🔵 onUserLogin called with user:', user);
    currentUser = user;
    updateUserInfoDisplay(user);
    
    // Auto-save if in level complete screen
    const levelCompleteOverlay = document.getElementById('level-complete-overlay');
    console.log('🔵 Level complete overlay:', levelCompleteOverlay ? 'exists' : 'NOT FOUND');
    console.log('🔵 Overlay visible:', levelCompleteOverlay && !levelCompleteOverlay.classList.contains('hidden'));
    
    if (levelCompleteOverlay && !levelCompleteOverlay.classList.contains('hidden')) {
        console.log('✅ Auto-saving progress...');
        saveGameProgress();
        showToast('Progress Saved!', 'Your game progress has been saved successfully.', '💾');
    } else {
        console.log('⚠️ Not auto-saving: overlay not visible or not found');
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
    console.log('🔵 saveGameProgress called');
    console.log('🔵 currentUser:', currentUser);
    
    if (!currentUser) {
        console.warn('❌ Cannot save progress: user not logged in');
        return;
    }
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
        console.error('❌ localStorage not available');
        showToast('Save Failed', 'Storage not available on this device.', '❌');
        return;
    }
    
    console.log('✅ localStorage is available');
    
    // Find the NEXT level to play (not the one just completed)
    let nextLevelId = null;
    if (currentLevel && levelConfig && levelConfig.levels) {
        console.log('🔵 currentLevel:', currentLevel.id);
        const currentLevelIndex = levelConfig.levels.findIndex(l => l.id === currentLevel.id);
        console.log('🔵 currentLevelIndex:', currentLevelIndex);
        console.log('🔵 Total levels:', levelConfig.levels.length);
        
        if (currentLevelIndex >= 0 && currentLevelIndex < levelConfig.levels.length - 1) {
            nextLevelId = levelConfig.levels[currentLevelIndex + 1].id;
            console.log('✅ Saving NEXT level as continue point:', nextLevelId);
        } else if (currentLevelIndex >= 0) {
            // Last level completed - save current level
            nextLevelId = currentLevel.id;
            console.log('✅ Last level completed - saving:', nextLevelId);
        } else {
            console.error('❌ Cannot find currentLevel in levelConfig!');
        }
    } else {
        console.error('❌ Missing data for save:', {
            hasCurrentLevel: !!currentLevel,
            hasLevelConfig: !!levelConfig,
            hasLevels: !!(levelConfig && levelConfig.levels)
        });
    }
    
    const progress = {
        userName: currentUser.name,
        currentLevel: nextLevelId,  // Save the NEXT level to play
        hp: currentHP,
        timestamp: Date.now()
    };
    
    // Warn if nextLevelId is null
    if (!nextLevelId) {
        console.warn('⚠️ nextLevelId is null - save will not have a valid continue level');
    }
    
    console.log('🔵 About to save progress:', progress);
    
    try {
        // Save to user-specific key using name
        const userKey = `gameProgress_${currentUser.name}`;
        console.log('🔵 Saving to key:', userKey);
        localStorage.setItem(userKey, JSON.stringify(progress));
        
        // Also save to simple key for backward compatibility
        localStorage.setItem('gameProgress', JSON.stringify(progress));
        console.log('🔵 Saved to both keys');
        
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
    console.log('🔵 loadGameProgress called');
    console.log('🔵 currentUser:', currentUser);
    try {
        // First, try to load from user-specific key if user is logged in
        if (currentUser && currentUser.name) {
            const userKey = `gameProgress_${currentUser.name}`;
            console.log('🔵 Trying to load from key:', userKey);
            const userData = localStorage.getItem(userKey);
            if (userData) {
                const progress = JSON.parse(userData);
                console.log('✅ Loaded game progress (user-specific):', progress);
                return progress;
            } else {
                console.log('⚠️ No data found for user-specific key:', userKey);
            }
        }
        
        // Fall back to simple key (for backward compatibility and non-logged-in users)
        console.log('🔵 Trying to load from simple key: gameProgress');
        const savedData = localStorage.getItem('gameProgress');
        if (savedData) {
            const progress = JSON.parse(savedData);
            console.log('✅ Loaded game progress (simple key):', progress);
            return progress;
        } else {
            console.log('⚠️ No data found for simple key');
        }
    } catch (error) {
        console.error('❌ Error loading progress:', error);
    }
    console.log('❌ loadGameProgress returning null');
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
