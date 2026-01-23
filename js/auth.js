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

// Sign in with CrazyGames
async function signInWithCrazyGames() {
    if (typeof getCrazyGamesUser !== 'function') {
        continueAsGuest();
        return;
    }
    
    try {
        const cgUser = await getCrazyGamesUser();
        
        if (cgUser && cgUser.username) {
            // User is logged in to CrazyGames
            const user = {
                name: cgUser.username,
                email: `${cgUser.username}@crazygames.com`,
                picture: cgUser.profilePictureUrl || generateAvatarFromName(cgUser.username),
                userId: cgUser.userId || cgUser.username
            };
            
            console.log('✅ CrazyGames user logged in:', user.name);
            onUserLogin(user);
            hideAuthModal();
        } else {
            // User not logged in to CrazyGames
            continueAsGuest();
        }
    } catch (error) {
        console.error('❌ Error signing in with CrazyGames:', error);
        continueAsGuest();
    }
}

// Continue as guest (no CrazyGames account)
function continueAsGuest() {
    const guestUser = {
        name: 'Guest Player',
        email: 'guest@local',
        picture: generateAvatarFromName('Guest'),
        isGuest: true
    };
    onUserLogin(guestUser);
    hideAuthModal();
}

// Generate avatar from name
function generateAvatarFromName(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const color = colors[colorIndex];
    
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="${encodeURIComponent(color)}"/><text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-family="Arial">${firstLetter}</text></svg>`;
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
}

function saveGameProgress() {
    if (!currentUser) {
        return;
    }
    
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
        console.error('localStorage not available');
        showToast('Save Failed', 'Storage not available on this device.', '❌');
        return;
    }
    
    // Find the NEXT level to play (not the one just completed)
    let nextLevelId = null;
    if (currentLevel && levelConfig && levelConfig.levels) {
        const currentLevelIndex = levelConfig.levels.findIndex(l => l.id === currentLevel.id);
        
        if (currentLevelIndex >= 0 && currentLevelIndex < levelConfig.levels.length - 1) {
            nextLevelId = levelConfig.levels[currentLevelIndex + 1].id;
        } else if (currentLevelIndex >= 0) {
            // Last level completed - save current level
            nextLevelId = currentLevel.id;
        } else {
            console.error('Cannot find currentLevel in levelConfig!');
        }
    } else {
        console.error('Missing data for save:', {
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
    
    try {
        // Save to user-specific key using name
        const userKey = `gameProgress_${currentUser.name}`;
        localStorage.setItem(userKey, JSON.stringify(progress));
        
        // Also save to simple key for backward compatibility
        localStorage.setItem('gameProgress', JSON.stringify(progress));
        
        // Verify save worked by reading back
        const verification = localStorage.getItem(userKey);
        if (verification) {
            showToast('Progress Saved!', 'Your game progress has been saved successfully.', '💾');
        } else {
            throw new Error('Save verification failed');
        }
    } catch (error) {
        console.error('Error saving progress:', error);
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
                return progress;
            }
        }
        
        // Fall back to simple key (for backward compatibility and non-logged-in users)
        const savedData = localStorage.getItem('gameProgress');
        if (savedData) {
            const progress = JSON.parse(savedData);
            return progress;
        }
    } catch (error) {
        console.error('Error loading progress:', error);
    }
    return null;
}

// Auto-login on page load
function autoLogin() {
    // Try to get CrazyGames user automatically
    if (typeof getCrazyGamesUser === 'function') {
        getCrazyGamesUser().then(cgUser => {
            if (cgUser && cgUser.username) {
                const user = {
                    name: cgUser.username,
                    email: `${cgUser.username}@crazygames.com`,
                    picture: cgUser.profilePictureUrl || generateAvatarFromName(cgUser.username),
                    userId: cgUser.userId || cgUser.username
                };
                onUserLogin(user);
            } else {
                // Silently use guest mode if not logged in
                continueAsGuest();
            }
        }).catch(() => {
            continueAsGuest();
        });
    } else {
        // CrazyGames SDK not available, use guest mode
        continueAsGuest();
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
    } catch (e) {
        // Silent fail
    }
}
