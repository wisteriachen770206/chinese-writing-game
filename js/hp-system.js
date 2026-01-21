// ============================================
// HP SYSTEM
// ============================================
console.log('✅ hp-system.js loaded');

function updateHPBar(newHP) {
    currentHP = Math.max(0, Math.min(maxHP, newHP));
    const hpPercentage = (currentHP / maxHP) * 100;
    
    const hpBarFill = document.getElementById('hp-bar-fill');
    const hpBarText = document.getElementById('hp-bar-text');
    
    if (hpBarFill && hpBarText) {
        hpBarFill.style.width = hpPercentage + '%';
        hpBarText.textContent = `${Math.round(currentHP)} / ${maxHP}`;
        
        // Change color based on HP percentage
        if (hpPercentage > 60) {
            hpBarFill.style.background = 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)';
        } else if (hpPercentage > 30) {
            hpBarFill.style.background = 'linear-gradient(90deg, #f1c40f 0%, #f39c12 100%)';
        } else {
            hpBarFill.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
        }
    }
    
    // Check for game over
    if (currentHP <= 0) {
        showGameOver();
    }
}

function showGameOver() {
    isGameOver = true;
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
    console.log('GAME OVER! HP reached 0.');
}

function restartGame() {
    isGameOver = false;
    
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
    
    showLevelSelection();
}

function applyDamage(damage) {
    const newHP = currentHP - damage;
    updateHPBar(newHP);
    console.log(`HP: ${Math.round(currentHP)} / ${maxHP} (Damage: ${damage.toFixed(2)})`);
}

function resetHP() {
    updateHPBar(maxHP);
}

function punishmentToHPDeduction(punishment) {
    if (punishment < 50) {
        return 0;
    }
    
    // Get difficulty settings
    const difficultySettings = getDifficultySettings();
    const multiplier = difficultySettings ? difficultySettings.punishmentMultiplier : 1;
    
    // Apply difficulty multiplier to HP deduction
    const baseDeduction = punishment / 10;
    const finalDeduction = baseDeduction * multiplier;
    
    console.log(`HP Deduction: ${finalDeduction.toFixed(2)} = ${baseDeduction.toFixed(2)} × ${multiplier} (${currentLevel?.difficulty || 'unknown'} difficulty)`);
    
    return finalDeduction;
}

function getDifficultySettings() {
    if (!currentLevel || !levelConfig || !levelConfig.difficulties) {
        return null;
    }
    
    const difficulty = currentLevel.difficulty || 'easy';
    return levelConfig.difficulties[difficulty];
}

function applyPerfectBonus() {
    const difficultySettings = getDifficultySettings();
    const bonus = difficultySettings ? difficultySettings.perfectHPBonus : 1;
    
    updateHPBar(currentHP + bonus);
    console.log(`✨ Perfect Stroke! HP +${bonus} (${currentLevel?.difficulty || 'unknown'} difficulty)`);
}
