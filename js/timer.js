// ============================================
// TIMER SYSTEM
// ============================================

function startTimer() {
    timerStartTime = Date.now();
    timerElapsedSeconds = 0;
    updateTimerDisplay();
    
    // Update timer every second
    timerInterval = setInterval(() => {
        timerElapsedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    stopTimer();
    timerElapsedSeconds = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const timerText = document.getElementById('timer-text');
    if (timerText) {
        const minutes = Math.floor(timerElapsedSeconds / 60);
        const seconds = timerElapsedSeconds % 60;
        timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
}
