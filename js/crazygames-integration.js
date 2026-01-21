// ============================================
// CRAZYGAMES SDK INTEGRATION
// ============================================
console.log('✅ crazygames-integration.js loaded');

let crazygamesSDK = null;
let isSDKInitialized = false;

// Initialize CrazyGames SDK
async function initCrazyGamesSDK() {
    if (typeof window.CrazyGames === 'undefined') {
        console.warn('CrazyGames SDK not available');
        return false;
    }
    
    try {
        crazygamesSDK = window.CrazyGames.SDK;
        await crazygamesSDK.init();
        isSDKInitialized = true;
        console.log('✅ CrazyGames SDK initialized');
        
        // Signal that gameplay is starting
        crazygamesSDK.game.gameplayStart();
        
        return true;
    } catch (error) {
        console.error('Failed to initialize CrazyGames SDK:', error);
        return false;
    }
}

// Show midgame ad (during level transitions)
async function showMidgameAd() {
    if (!isSDKInitialized) {
        console.warn('CrazyGames SDK not initialized');
        return;
    }
    
    try {
        console.log('📺 Showing midgame ad...');
        // Pause game before ad
        if (typeof isGamePaused !== 'undefined') {
            isGamePaused = true;
        }
        
        await crazygamesSDK.ad.requestAd('midgame');
        
        console.log('✅ Midgame ad completed');
        
        // Resume game after ad
        if (typeof isGamePaused !== 'undefined') {
            isGamePaused = false;
        }
    } catch (error) {
        console.error('Error showing midgame ad:', error);
        // Resume game even if ad fails
        if (typeof isGamePaused !== 'undefined') {
            isGamePaused = false;
        }
    }
}

// Show rewarded ad (for bonuses like extra HP)
async function showRewardedAd() {
    if (!isSDKInitialized) {
        console.warn('CrazyGames SDK not initialized');
        return false;
    }
    
    try {
        console.log('📺 Showing rewarded ad...');
        await crazygamesSDK.ad.requestAd('rewarded');
        console.log('✅ Rewarded ad completed - user gets reward');
        return true;
    } catch (error) {
        console.error('Error showing rewarded ad:', error);
        return false;
    }
}

// Call when level starts
function onLevelStartCG() {
    if (!isSDKInitialized) return;
    
    try {
        crazygamesSDK.game.gameplayStart();
        console.log('🎮 CrazyGames: Gameplay started');
    } catch (error) {
        console.error('Error calling gameplayStart:', error);
    }
}

// Call when level ends or user goes to menu
function onLevelStopCG() {
    if (!isSDKInitialized) return;
    
    try {
        crazygamesSDK.game.gameplayStop();
        console.log('⏸️ CrazyGames: Gameplay stopped');
    } catch (error) {
        console.error('Error calling gameplayStop:', error);
    }
}

// Call when player does something good (perfect stroke, level complete)
function onHappyTimeCG() {
    if (!isSDKInitialized) return;
    
    try {
        crazygamesSDK.game.happytime();
        console.log('😊 CrazyGames: Happy time event');
    } catch (error) {
        console.error('Error calling happytime:', error);
    }
}

// Show banner ad
function showBannerAd() {
    if (!isSDKInitialized) return;
    
    try {
        crazygamesSDK.banner.requestBanner([
            {
                id: 'banner-container',
                width: 728,
                height: 90
            }
        ]);
        console.log('📺 Banner ad requested');
    } catch (error) {
        console.error('Error showing banner:', error);
    }
}

// Get CrazyGames user information
async function getCrazyGamesUser() {
    if (!isSDKInitialized) {
        console.warn('CrazyGames SDK not initialized');
        return null;
    }
    
    try {
        const user = await crazygamesSDK.user.getUser();
        console.log('👤 CrazyGames user:', user);
        return user;
    } catch (error) {
        console.error('Error getting CrazyGames user:', error);
        return null;
    }
}

// Show account link modal (for guest users to create account)
function showAccountLinkModal() {
    if (!isSDKInitialized) return;
    
    try {
        crazygamesSDK.user.showAuthPrompt();
        console.log('🔐 Showing CrazyGames account prompt');
    } catch (error) {
        console.error('Error showing auth prompt:', error);
    }
}

// Initialize SDK when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCrazyGamesSDK);
} else {
    initCrazyGamesSDK();
}
