// ============================================
// UI MANAGER - Toast, Music, Voice, Modals
// ============================================
console.log('✅ ui-manager.js loaded');

let backgroundMusic = null;
let musicEnabled = false;
let soundEffectsEnabled = true;
let strokeTipsEnabled = true;
let musicVolume = 0.25; // 25% default
let soundEffectsVolume = 0.30; // 30% default

// ========== TOAST NOTIFICATIONS ==========

function showToast(title, message, icon = '✅', duration = 3000) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    
    const toastIcon = toast.querySelector('.toast-icon');
    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    
    if (toastIcon) toastIcon.textContent = icon;
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    
    toast.classList.remove('hide');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
    }, duration);
}

// ========== COMPLETION SOUND ==========

function playCompletionSound() {
    // Check if sound effects are enabled (volume > 0)
    if (!soundEffectsEnabled || soundEffectsVolume === 0) {
        console.log('Sound effects muted, skipping completion sound');
        return;
    }
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(soundEffectsVolume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Could not play completion sound:', e);
    }
}

// ========== MUSIC CONTROL ==========

function initMusicControl() {
    backgroundMusic = document.getElementById('background-music');

    if (!backgroundMusic) {
        console.warn('Background music element not found');
        return;
    }

    // Determine initial state from the settings slider (if present)
    const musicVolumeSlider = document.getElementById('music-volume-slider');
    if (musicVolumeSlider) {
        const volume = parseInt(musicVolumeSlider.value, 10);
        musicVolume = (Number.isFinite(volume) ? volume : 25) / 100;
    }

    musicEnabled = musicVolume > 0;
    backgroundMusic.volume = musicVolume;
    backgroundMusic.loop = true;

    // Autoplay after the first user interaction (browser policy)
    const tryStart = () => {
        if (musicEnabled && backgroundMusic.paused) {
            backgroundMusic.play().catch(err => {
                console.log('Could not autoplay music:', err);
            });
        }
    };

    document.addEventListener('pointerdown', tryStart, { once: true });
    document.addEventListener('keydown', tryStart, { once: true });
    
    console.log('Music control initialized');
}


// ========== CHARACTER THUMBNAILS ==========

function generateCharacterThumbnail(char, charData) {
    const tempCanvas = document.createElement('canvas');
    const size = 100;
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    tempCtx.fillRect(0, 0, size, size);
    
    if (!charData || !charData.strokes || charData.strokes.length === 0) {
        console.warn(`No stroke data for character: ${char}`);
        return tempCanvas.toDataURL();
    }
    
    const totalStrokes = charData.strokes.length;
    tempCtx.strokeStyle = '#ffffff';
    tempCtx.lineWidth = totalStrokes > 10 ? 12 : 15;
    tempCtx.lineCap = 'round';
    tempCtx.lineJoin = 'round';
    
    charData.strokes.forEach(stroke => {
        if (!stroke || !Array.isArray(stroke)) return;
        
        tempCtx.beginPath();
        stroke.forEach((point, index) => {
            if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return;
            
            const x = (point.x / 1024) * size;
            const y = (point.y / 1024) * size;
            
            if (index === 0) {
                tempCtx.moveTo(x, y);
            } else {
                tempCtx.lineTo(x, y);
            }
        });
        tempCtx.stroke();
    });
    
    return tempCanvas.toDataURL();
}

function addThumbnailToContainer(char, imageDataUrl) {
    const container = document.getElementById('completed-characters-container');
    if (!container) return;
    
    const charDiv = document.createElement('div');
    charDiv.className = 'completed-character';
    charDiv.title = char;
    
    const img = document.createElement('img');
    img.src = imageDataUrl;
    img.alt = char;
    
    charDiv.appendChild(img);
    container.insertBefore(charDiv, container.firstChild);
    
    updateContainerWidth();
}

function updateContainerWidth() {
    const container = document.getElementById('completed-characters-container');
    if (!container) return;
    
    const numCharacters = container.children.length;
    const columns = Math.ceil(numCharacters / 20);
    container.style.gridTemplateColumns = `repeat(${columns}, 36px)`;
    container.style.width = `${columns * 36 + 20}px`;
}

async function loadPreviousCharactersThumbnails(startIndex) {
    const container = document.getElementById('completed-characters-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < startIndex && i < charactersToLearn.length; i++) {
        const char = charactersToLearn[i];
        const charData = loadCharacterDataFromStructure(char);
        
        if (charData) {
            const thumbnail = generateCharacterThumbnail(char, charData);
            addThumbnailToContainer(char, thumbnail);
        }
    }
}

// ========== SETTINGS MENU ==========

function initSettingsMenu() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsBtnLevelSelection = document.getElementById('settings-btn-level-selection');
    const settingsOverlay = document.getElementById('settings-overlay');
    const backToGameBtn = document.getElementById('back-to-game-btn');
    const gotoLevelSelectionBtn = document.getElementById('goto-level-selection-btn');
    const musicToggle = document.getElementById('music-toggle-setting');
    const soundEffectsToggle = document.getElementById('sound-effects-toggle');
    const strokeTipsToggle = document.getElementById('stroke-tips-toggle');
    
    if (!settingsOverlay) {
        console.warn('Settings overlay not found');
        return;
    }
    
    // Block the settings overlay from triggering game strokes
    // This prevents any touch in the overlay from being interpreted as strokes
    if (settingsOverlay) {
        const stopGameEvents = (e) => {
            // Always stop propagation to prevent game from receiving touches
            e.stopPropagation();
        };
        
        settingsOverlay.addEventListener('touchstart', stopGameEvents, { capture: true });
        settingsOverlay.addEventListener('touchmove', stopGameEvents, { capture: true });
        settingsOverlay.addEventListener('touchend', stopGameEvents, { capture: true });
    }
    
    // Pause game function
    function pauseGame() {
        isGamePaused = true;
        // Pause background music if playing
        if (backgroundMusic && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
        console.log('🔴 Game PAUSED');
    }
    
    // Resume game function
    function resumeGame() {
        isGamePaused = false;
        // Resume background music if it was enabled
        if (musicEnabled && backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(err => {
                console.log('Could not resume music:', err);
            });
        }
        console.log('▶️ Game RESUMED');
    }
    
    // Open settings menu from game screen
    if (settingsBtn) {
        let touchHandled = false;
        
        settingsBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            touchHandled = true;
            settingsOverlay.classList.remove('hidden');
            pauseGame();
            console.log('Settings menu opened from game (touch)');
            setTimeout(() => { touchHandled = false; }, 300);
        }, { passive: false });
        
        settingsBtn.addEventListener('click', (e) => {
            if (!touchHandled) {
                e.stopPropagation();
                settingsOverlay.classList.remove('hidden');
                pauseGame();
                console.log('Settings menu opened from game (click)');
            }
        });
    }
    
    // Open settings menu from level selection screen
    if (settingsBtnLevelSelection) {
        settingsBtnLevelSelection.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsOverlay.classList.remove('hidden');
            // No pause needed on level selection screen (not in game)
            console.log('Settings menu opened from level selection');
        });
    }
    
    // Close settings menu - back to game
    if (backToGameBtn) {
        const backToGame = () => {
            settingsOverlay.classList.add('hidden');
            resumeGame();
            console.log('Back to game');
        };
        backToGameBtn.addEventListener('click', backToGame);
        backToGameBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            backToGame();
        }, { passive: false });
    }
    
    // Go to level selection
    if (gotoLevelSelectionBtn) {
        const goToLevelSelection = () => {
            settingsOverlay.classList.add('hidden');
            // Leaving settings: ensure we don't keep music paused
            // (otherwise starting the next level won't auto-play the new track)
            resumeGame();
            showLevelSelection();
            console.log('Going to level selection');
        };
        gotoLevelSelectionBtn.addEventListener('click', goToLevelSelection);
        gotoLevelSelectionBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            goToLevelSelection();
        }, { passive: false });
    }
    
    // Stroke tips toggle
    if (strokeTipsToggle) {
        strokeTipsToggle.addEventListener('change', () => {
            strokeTipsEnabled = strokeTipsToggle.checked;
            console.log('Stroke Tips:', strokeTipsEnabled ? 'ON' : 'OFF');
            
            // Update stroke tip display based on new setting
            if (typeof hanziWriter !== 'undefined' && hanziWriter) {
                if (strokeTipsEnabled) {
                    updateStrokeTip(hanziWriter);
                } else {
                    hideStrokeTip();
                }
            }
        });
    }
    
    // Music volume slider
    const musicVolumeSlider = document.getElementById('music-volume-slider');
    const musicVolumeValue = document.getElementById('music-volume-value');
    const musicIcon = document.getElementById('music-icon');
    if (musicVolumeSlider && musicVolumeValue && musicIcon) {
        const updateMusicVolume = () => {
            const volume = parseInt(musicVolumeSlider.value);
            musicVolume = volume / 100; // Convert to 0-1 range
            musicVolumeValue.textContent = volume + '%';
            
            // Change icon based on volume
            if (volume === 0) {
                // Use SVG for muted music
                musicIcon.innerHTML = '<img src="https://cdn.jsdelivr.net/gh/wisteriachen770206/chinese-writing-game/res/no-music.svg" style="width: 24px; height: 24px; vertical-align: middle;">';
                musicEnabled = false;
                if (backgroundMusic) {
                    backgroundMusic.pause();
                }
            } else {
                musicIcon.textContent = '🎵'; // Music icon
                musicEnabled = true;
                if (backgroundMusic) {
                    backgroundMusic.volume = musicVolume;
                    if (backgroundMusic.paused) {
                        backgroundMusic.play().catch(err => {
                            console.log('Could not play music:', err);
                        });
                    }
                }
            }
            
            console.log('Music Volume:', volume + '%', musicEnabled ? 'ON' : 'MUTED');
        };
        
        musicVolumeSlider.addEventListener('input', updateMusicVolume);
        musicVolumeSlider.addEventListener('change', updateMusicVolume);
    }
    
    // Sound effects volume slider
    const soundEffectsVolumeSlider = document.getElementById('sound-effects-volume-slider');
    const soundEffectsVolumeValue = document.getElementById('sound-effects-volume-value');
    const soundEffectsIcon = document.getElementById('sound-effects-icon');
    if (soundEffectsVolumeSlider && soundEffectsVolumeValue && soundEffectsIcon) {
        const updateSoundEffectsVolume = () => {
            const volume = parseInt(soundEffectsVolumeSlider.value);
            soundEffectsVolume = volume / 100; // Convert to 0-1 range
            soundEffectsVolumeValue.textContent = volume + '%';
            
            // Change icon based on volume
            if (volume === 0) {
                soundEffectsIcon.textContent = '🔇'; // Muted icon only
                soundEffectsEnabled = false;
            } else {
                soundEffectsIcon.textContent = '🔊'; // Sound icon
                soundEffectsEnabled = true;
            }
            
            console.log('Sound Effects Volume:', volume + '%', soundEffectsEnabled ? 'ON' : 'MUTED');
        };
        
        soundEffectsVolumeSlider.addEventListener('input', updateSoundEffectsVolume);
        soundEffectsVolumeSlider.addEventListener('change', updateSoundEffectsVolume);
    }
    
    // Close on overlay click (outside content)
    const closeSettingsOnBackdrop = (e) => {
        if (e.target === settingsOverlay) {
            settingsOverlay.classList.add('hidden');
            // If we paused music/game when opening settings, resume it when closing.
            resumeGame();
        }
    };
    
    settingsOverlay.addEventListener('click', closeSettingsOnBackdrop);
    settingsOverlay.addEventListener('touchend', closeSettingsOnBackdrop, { passive: true });
    
    console.log('Settings menu initialized');
}

// Function to check if sound effects are enabled
function isSoundEffectsEnabled() {
    return soundEffectsEnabled;
}

// Function to check if stroke tips are enabled
function isStrokeTipsEnabled() {
    return strokeTipsEnabled;
}

// ========== STROKE TIP CANVAS ==========

/**
 * Draws the current stroke in a small canvas as a visual tip
 * @param {HTMLCanvasElement} tipCanvas - The small canvas element to draw on
 * @param {Array} strokePoints - Array of points for the stroke (e.g., from medians data)
 * @param {Object} options - Optional configuration
 * @param {string} options.strokeColor - Color of the stroke (default: '#4ade80')
 * @param {number} options.lineWidth - Width of the stroke line (default: 3)
 * @param {number} options.padding - Padding around the stroke (default: 10)
 */
function drawStrokeTip(tipCanvas, strokePoints, options = {}) {
    if (!tipCanvas || !strokePoints || strokePoints.length === 0) {
        console.warn('Invalid canvas or stroke points for tip');
        return;
    }
    
    const ctx = tipCanvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context for stroke tip');
        return;
    }
    
    // Default options
    const strokeColor = options.strokeColor || '#4ade80';
    const lineWidth = options.lineWidth || 3;
    const padding = options.padding || 10;
    
    // Clear canvas
    ctx.clearRect(0, 0, tipCanvas.width, tipCanvas.height);
    
    // Find bounding box of the stroke
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    strokePoints.forEach(point => {
        if (point && typeof point.x === 'number' && typeof point.y === 'number') {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
    });
    
    // Calculate scale to fit stroke in canvas with padding
    const strokeWidth = maxX - minX;
    const strokeHeight = maxY - minY;
    const availableWidth = tipCanvas.width - (padding * 2);
    const availableHeight = tipCanvas.height - (padding * 2);
    
    const scale = Math.min(
        availableWidth / strokeWidth,
        availableHeight / strokeHeight
    );
    
    // Calculate offset to center the stroke
    const offsetX = (tipCanvas.width - (strokeWidth * scale)) / 2 - (minX * scale);
    const offsetY = (tipCanvas.height - (strokeHeight * scale)) / 2 - (minY * scale);
    
    // Draw the stroke
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    strokePoints.forEach((point, index) => {
        if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return;
        
        const x = point.x * scale + offsetX;
        // Flip Y-axis: subtract from canvas height to invert
        const y = tipCanvas.height - (point.y * scale + offsetY);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
}

/**
 * Draws the current stroke from HanziWriter instance in a tip canvas
 * @param {HTMLCanvasElement} tipCanvas - The small canvas element to draw on
 * @param {Object} writerInstance - The HanziWriter instance
 * @param {Object} options - Optional configuration (same as drawStrokeTip)
 */
function drawCurrentStrokeTip(tipCanvas, writerInstance, options = {}) {
    if (!writerInstance || !writerInstance.strokeData || !writerInstance.strokeData.rawCharData) {
        console.warn('Invalid writer instance for stroke tip');
        return;
    }
    
    const medians = writerInstance.strokeData.rawCharData.medians;
    if (!medians || medians.length === 0) {
        console.warn('No stroke data available for tip');
        return;
    }
    
    const currentIndex = writerInstance.currentStrokeIndex;
    if (currentIndex >= medians.length) {
        console.warn('Current stroke index out of bounds');
        return;
    }
    
    // Get current stroke points (convert from array format to {x, y} objects)
    const currentStrokeArray = medians[currentIndex];
    const strokePoints = currentStrokeArray.map(point => ({
        x: point[0],
        y: point[1]
    }));
    
    drawStrokeTip(tipCanvas, strokePoints, options);
}

/**
 * Updates the stroke tip display based on current game state
 * @param {Object} writerInstance - The HanziWriter instance
 */
function updateStrokeTip(writerInstance) {
    const container = document.getElementById('stroke-tip-container');
    const canvas = document.getElementById('stroke-tip-canvas');
    
    if (!container || !canvas) {
        console.warn('Stroke tip elements not found');
        return;
    }
    
    // Check if stroke tips are enabled
    if (!strokeTipsEnabled) {
        container.classList.add('hidden');
        return;
    }
    
    // Check if we have a valid writer instance with strokes remaining
    if (!writerInstance || 
        !writerInstance.strokeData || 
        !writerInstance.strokeData.rawCharData ||
        writerInstance.currentStrokeIndex >= writerInstance.totalStrokes) {
        container.classList.add('hidden');
        return;
    }
    
    // Show the container and draw the current stroke tip
    container.classList.remove('hidden');
    drawCurrentStrokeTip(canvas, writerInstance, {
        strokeColor: '#4ade80',
        lineWidth: 4,
        padding: 15
    });
}

/**
 * Hides the stroke tip display
 */
function hideStrokeTip() {
    const container = document.getElementById('stroke-tip-container');
    if (container) {
        container.classList.add('hidden');
    }
}
