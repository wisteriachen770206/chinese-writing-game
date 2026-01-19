// ============================================
// UI MANAGER - Toast, Music, Voice, Modals
// ============================================
console.log('✅ ui-manager.js loaded');

let backgroundMusic = null;
let musicEnabled = false;

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
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
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
    const musicToggle = document.getElementById('music-toggle');
    
    if (!backgroundMusic || !musicToggle) {
        console.warn('Music elements not found');
        return;
    }
    
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    
    musicToggle.classList.add('active');
    musicEnabled = true;
    
    backgroundMusic.volume = 0.25;
    backgroundMusic.loop = true;
    
    musicToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        musicEnabled = !musicEnabled;
        
        if (musicEnabled) {
            musicToggle.classList.add('active');
            backgroundMusic.play().catch(err => {
                console.log('Could not play music:', err);
            });
        } else {
            musicToggle.classList.remove('active');
            backgroundMusic.pause();
        }
    });
    
    document.addEventListener('click', function startMusic() {
        if (musicEnabled && backgroundMusic.paused) {
            backgroundMusic.play().catch(err => {
                console.log('Could not autoplay music:', err);
            });
        }
    }, { once: true });
    
    console.log('Music control initialized');
}

// ========== VOICE BUTTON (TTS) ==========

function initVoiceButton() {
    const voiceBtn = document.getElementById('voice-btn');
    
    if (!voiceBtn) {
        console.warn('Voice button not found');
        return;
    }
    
    voiceBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        if (!character) {
            console.log('No character to read');
            return;
        }
        
        console.log(`Reading character: ${character}`);
        
        try {
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(character);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.7;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onstart = () => {
                console.log(`Started speaking: ${character}`);
                voiceBtn.style.background = 'rgba(74, 222, 128, 0.3)';
            };
            
            utterance.onend = () => {
                console.log(`Finished speaking: ${character}`);
                voiceBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            };
            
            utterance.onerror = (e) => {
                console.log('Error speaking:', e);
                voiceBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            };
            
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.error('Error reading character:', e);
        }
    });
    
    console.log('Voice button initialized');
}

// ========== MOBILE TOP BAR AUTO-HIDE ==========

function initTopBarAutoHide() {
    const topBar = document.getElementById('top-bar');
    const trigger = document.querySelector('.top-bar-trigger');
    
    if (!topBar || !trigger) return;
    
    let hideTimeout = null;
    
    const showTopBar = () => {
        topBar.classList.add('visible');
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
        hideTimeout = setTimeout(() => {
            topBar.classList.remove('visible');
        }, 3000);
    };
    
    const hideTopBar = () => {
        topBar.classList.remove('visible');
    };
    
    trigger.addEventListener('click', showTopBar);
    trigger.addEventListener('touchstart', showTopBar);
    
    document.addEventListener('click', (e) => {
        if (!topBar.contains(e.target) && !trigger.contains(e.target)) {
            hideTopBar();
        }
    });
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
