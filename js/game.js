        // ============================================
        // GAME.JS - Core game logic, levels, and HanziWriter
        // 
        // DEPENDENCIES (loaded before this file):
        // - game-state.js: All global variables
        console.log('✅ game.js starting to load...');
        // - timer.js: Timer functions  
        // - hp-system.js: HP and damage functions
        // - auth.js: Authentication and save/load
        // - ui-manager.js: UI interactions
        // ============================================
        
        // Level loading and selection functions
        async function loadLevelConfig() {
            try {
                // Add cache-busting parameter to force reload of latest data
                const response = await fetch(`level_config.json?v=${Date.now()}`);
                levelConfig = await response.json();
                console.log('Level config loaded:', levelConfig);
                return levelConfig;
            } catch (error) {
                console.error('Error loading level config:', error);
                return null;
            }
        }
        
        function displayLevelSelection(searchQuery = '', append = false) {
            const levelsGrid = document.getElementById('levels-grid');
            const showMoreBtn = document.getElementById('show-more-btn');
            if (!levelsGrid || !levelConfig) return;
            
            // If not appending, clear grid and reset counter
            if (!append) {
                levelsGrid.innerHTML = '';
                displayedLevelsCount = 0;
            }
            
            // Check for saved progress (works with or without user login)
            const savedProgress = loadGameProgress();
            console.log('🔵 displayLevelSelection - savedProgress:', savedProgress);
            let savedLevelId = savedProgress ? savedProgress.currentLevel : null;
            console.log('🔵 displayLevelSelection - savedLevelId:', savedLevelId);
            
            const totalLevels = levelConfig.levels.length;
            
            // Determine the continue level (next level after saved)
            let continueLevelIndex = null;
            let nextLevelId = null;
            if (savedLevelId) {
                const savedLevelIndex = levelConfig.levels.findIndex(l => l.id === savedLevelId);
                console.log('🔵 displayLevelSelection - savedLevelIndex:', savedLevelIndex);
                if (savedLevelIndex >= 0 && savedLevelIndex < totalLevels - 1) {
                    continueLevelIndex = savedLevelIndex + 1;
                    nextLevelId = levelConfig.levels[continueLevelIndex].id;
                    console.log('✅ Continue level found:', nextLevelId, 'at index', continueLevelIndex);
                } else if (savedLevelIndex >= 0) {
                    console.log('⚠️ Last level completed - no next level to continue');
                } else {
                    console.log('❌ Saved level not found in levelConfig');
                }
            } else {
                console.log('⚠️ No saved level found in progress');
            }
            
            let levelsToDisplay = [];
            
            // If there's a search query, filter levels by name
            if (searchQuery.trim() !== '') {
                const query = searchQuery.toLowerCase();
                const searchResults = levelConfig.levels.filter(level => 
                    level.name.toLowerCase().includes(query) ||
                    level.description.toLowerCase().includes(query)
                );
                
                // Show first 5 search results
                levelsToDisplay = searchResults.slice(0, 5);
                
                console.log(`Search results for "${searchQuery}": ${searchResults.length} levels found, showing first 5`);
            } else {
                // No search - show 5 evenly-spaced representative levels
                const spacing = Math.floor(totalLevels / 5);
                for (let i = 0; i < 5; i++) {
                    const idx = i * spacing;
                    if (idx < totalLevels) {
                        levelsToDisplay.push(levelConfig.levels[idx]);
                    }
                }
                
                console.log(`Showing 6 levels (1 continue + 5 representative) from ${totalLevels} total:`);
                if (continueLevelIndex !== null) {
                    console.log(`  Continue level: #${continueLevelIndex + 1} (ID: ${nextLevelId})`);
                }
            }
            
            // Display continue level FIRST (if exists)
            if (continueLevelIndex !== null) {
                const continueLevel = levelConfig.levels[continueLevelIndex];
                const card = document.createElement('div');
                card.className = `level-card difficulty-${continueLevel.difficulty} saved-level`;
                card.setAttribute('id', 'saved-level-card');
                
                card.innerHTML = `
                    <div class="saved-badge">📍 Continue</div>
                    <div class="level-id">${continueLevel.id}</div>
                    <div class="level-name">${continueLevel.name}</div>
                    <div class="level-description">${continueLevel.description}</div>
                    <div class="level-stats">
                        <div class="level-stat">
                            <div class="level-stat-label">Characters</div>
                            <div class="level-stat-value">${continueLevel.numCharacters}</div>
                        </div>
                        <div class="level-stat">
                            <div class="level-stat-label">Level</div>
                            <div class="level-stat-value">#${continueLevelIndex + 1}</div>
                        </div>
                        <div class="level-stat">
                            <div class="level-stat-label">HP</div>
                            <div class="level-stat-value">${continueLevel.maxHP}</div>
                        </div>
                    </div>
                    <div class="level-difficulty ${continueLevel.difficulty}">${continueLevel.difficulty.toUpperCase()}</div>
                    <button class="level-start-btn" onclick="startLevel('${continueLevel.id}')">Start Level</button>
                `;
                levelsGrid.appendChild(card);
            }
            
            // Display the levels (search results or representative levels)
            levelsToDisplay.forEach((level) => {
                const levelIndex = levelConfig.levels.findIndex(l => l.id === level.id);
                
                const card = document.createElement('div');
                card.className = `level-card difficulty-${level.difficulty}`;
                
                card.innerHTML = `
                    <div class="level-id">${level.id}</div>
                    <div class="level-name">${level.name}</div>
                    <div class="level-description">${level.description}</div>
                    <div class="level-stats">
                        <div class="level-stat">
                            <div class="level-stat-label">Characters</div>
                            <div class="level-stat-value">${level.numCharacters}</div>
                        </div>
                        <div class="level-stat">
                            <div class="level-stat-label">Level</div>
                            <div class="level-stat-value">#${levelIndex + 1}</div>
                        </div>
                        <div class="level-stat">
                            <div class="level-stat-label">HP</div>
                            <div class="level-stat-value">${level.maxHP}</div>
                        </div>
                    </div>
                    <div class="level-difficulty ${level.difficulty}">${level.difficulty.toUpperCase()}</div>
                    <button class="level-start-btn" onclick="startLevel('${level.id}')">Start Level</button>
                `;
                levelsGrid.appendChild(card);
            });
            
            // Scroll to continue level after a short delay (only when not appending and not searching)
            if (nextLevelId && !append && searchQuery.trim() === '') {
                setTimeout(() => {
                    const continueCard = document.getElementById('saved-level-card');
                    if (continueCard) {
                        continueCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 300);
            }
        }
        
        async function startLevel(levelId) {
            const level = levelConfig.levels.find(l => l.id === levelId);
            if (!level) {
                console.error(`Level ${levelId} not found`);
                return;
            }
            
            currentLevel = level;
            
            // Set characters from level first
            charactersToLearn = level.characters.split('');
            
            // Load all_strokes.json if not already loaded
            if (Object.keys(allCharactersData).length === 0) {
                console.log('Loading all_strokes.json for level...');
                const loaded = await loadStrokesDataFromFile();
                if (!loaded) {
                    alert('Failed to load all_strokes.json. Please make sure the file exists.');
                    return;
                }
            }
            
            // Validate that all characters in this level are available
            const missingCharacters = [];
            for (const char of charactersToLearn) {
                if (!allCharactersData[char]) {
                    missingCharacters.push(char);
                }
            }
            
            if (missingCharacters.length > 0) {
                alert(`Cannot start level: The following characters are not found in all_strokes.json:\n${missingCharacters.join(', ')}\n\nAvailable characters: ${Object.keys(allCharactersData).join(', ')}`);
                console.error('Missing characters:', missingCharacters);
                console.log('Available characters in all_strokes.json:', Object.keys(allCharactersData));
                return;
            }
            
            // Hide level selection
            const levelSelection = document.getElementById('level-selection-overlay');
            if (levelSelection) {
                levelSelection.classList.add('hidden');
            }
            
            // Show HP bar and timer
            const hpBar = document.getElementById('hp-bar-container');
            const timer = document.getElementById('timer-container');
            if (hpBar) hpBar.classList.add('visible');
            if (timer) timer.classList.add('visible');
            
            currentCharacterIndex = 0;
            
            // Clear completed characters display
            const completedContainer = document.getElementById('completed-characters-container');
            if (completedContainer) {
                completedContainer.innerHTML = '';
            }
            
            // Set dynamic grid layout for mobile based on character count
            setCompletedCharactersLayout(level.numCharacters);
            
            // Set HP
            maxHP = level.maxHP;
            currentHP = maxHP;
            updateHPBar(maxHP);
            
            // Reset game state
            isGameOver = false;
            appInitialized = false; // Reset app initialization flag
            
            // Reset score counters
            perfectStrokesCount = 0;
            notGoodStrokesCount = 0;
            
            resetTimer();
            startTimer();
            
            console.log(`Starting Level ${level.id}: ${level.name}`);
            console.log(`Characters: ${level.characters}`);
            console.log(`HP: ${level.maxHP}`);
            
            // Initialize the game with the characters from this level only
            // Pass true to skip loading ToWriteText.txt
            await initializeApp(true);
        }
        
        function showLevelSelection() {
            const levelSelection = document.getElementById('level-selection-overlay');
            if (levelSelection) {
                levelSelection.classList.remove('hidden');
            }
            
            // Hide HP bar and timer
            const hpBar = document.getElementById('hp-bar-container');
            const timer = document.getElementById('timer-container');
            if (hpBar) hpBar.classList.remove('visible');
            if (timer) timer.classList.remove('visible');
        }
        
        function hideLevelSelection() {
            const levelSelection = document.getElementById('level-selection-overlay');
            if (levelSelection) {
                levelSelection.classList.add('hidden');
            }

            // Show HP bar and timer
            const hpBar = document.getElementById('hp-bar-container');
            const timer = document.getElementById('timer-container');
            if (hpBar) hpBar.classList.add('visible');
            if (timer) timer.classList.add('visible');
        }
        
        function setCompletedCharactersLayout(numCharacters) {
            const completedContainer = document.getElementById('completed-characters-container');
            if (!completedContainer) return;
            
            const isMobile = window.innerWidth < 768;
            let columns, rows;
            
            if (isMobile) {
                // MOBILE (VERTICAL) LAYOUT
                if (numCharacters <= 28) {
                    // For 28 or fewer characters: columns = numCharacters / 4, rows = 4
                    columns = Math.ceil(numCharacters / 4);
                    rows = 4;
                } else {
                    // For more than 28 characters: columns = 7, rows grow automatically
                    columns = 7;
                    rows = 'auto'; // Will grow as needed
                }
                
                // Apply mobile grid layout (row-based)
                completedContainer.style.gridAutoFlow = 'row';
                completedContainer.style.gridTemplateColumns = `repeat(${columns}, 36px)`;
                completedContainer.style.gridTemplateRows = ''; // Clear template rows
                completedContainer.style.gridAutoRows = '36px'; // Each row is 36px as added
                completedContainer.style.gridAutoColumns = ''; // Clear auto columns
                completedContainer.style.width = `calc(${columns} * 36px + 20px)`; // Set explicit width
                completedContainer.style.minWidth = `calc(${columns} * 36px + 20px)`;
                completedContainer.style.maxWidth = `calc(${columns} * 36px + 20px)`;
                completedContainer.style.height = 'auto'; // Allow height to grow
                completedContainer.style.minHeight = '56px'; // Min height (padding + 1 row)
                completedContainer.style.direction = 'ltr';
                
                console.log(`Mobile layout: ${numCharacters} chars → ${columns} columns, rows grow dynamically`);
            } else {
                // DESKTOP (HORIZONTAL) LAYOUT
                if (numCharacters > 28) {
                    // For more than 28 characters: rows = 7, columns grow automatically
                    rows = 7;
                    columns = 'auto'; // Will grow as needed
                } else {
                    // For 28 or fewer characters: rows = numCharacters / 4, columns = 4
                    rows = Math.ceil(numCharacters / 4);
                    columns = 4;
                }
                
                // Apply desktop grid layout (column-based)
                completedContainer.style.gridAutoFlow = 'column';
                completedContainer.style.gridTemplateRows = rows === 'auto' ? 'repeat(7, 36px)' : `repeat(${rows}, 36px)`;
                completedContainer.style.gridTemplateColumns = ''; // CLEAR columns constraint
                completedContainer.style.gridAutoColumns = '36px'; // Each column is 36px as added
                completedContainer.style.gridAutoRows = ''; // Clear auto rows
                completedContainer.style.width = ''; // CLEAR fixed width
                completedContainer.style.minWidth = ''; // CLEAR min width
                completedContainer.style.maxWidth = ''; // CLEAR max width
                completedContainer.style.height = 'fit-content'; // Allow height to grow
                completedContainer.style.direction = 'rtl'; // New columns appear on the left
                
                console.log(`Desktop layout: ${numCharacters} chars → ${rows} rows, columns grow dynamically`);
            }
        }
        
        function onLevelComplete() {
            console.log('🎉 onLevelComplete called');
            console.log('🔵 currentUser at level complete:', currentUser);
            stopTimer();
            
            const timeStr = `${Math.floor(timerElapsedSeconds / 60)}:${String(timerElapsedSeconds % 60).padStart(2, '0')}`;
            const hpLeft = Math.round(currentHP);
            
            // Find next level
            const currentLevelIndex = levelConfig.levels.findIndex(l => l.id === currentLevel.id);
            const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < levelConfig.levels.length - 1 
                ? levelConfig.levels[currentLevelIndex + 1] 
                : null;
            
            // Calculate level score
            const scoreData = calculateLevelScore();
            
            // Update level complete overlay with current level info
            const overlay = document.getElementById('level-complete-overlay');
            const subtitle = document.getElementById('level-complete-subtitle');
            const timeDisplay = document.getElementById('level-complete-time');
            const charsDisplay = document.getElementById('level-complete-chars');
            const scoreDisplay = document.getElementById('level-complete-score-value');
            const nextInfo = document.getElementById('level-complete-next-info');
            const nextBtn = document.getElementById('level-complete-next-btn');
            
            if (subtitle) {
                subtitle.textContent = `Level ${currentLevel.id}: ${currentLevel.name}`;
            }
            
            if (timeDisplay) {
                timeDisplay.textContent = timeStr;
            }
            
            if (charsDisplay) {
                charsDisplay.textContent = currentLevel.numCharacters;
            }
            
            if (scoreDisplay) {
                // Display score as whole number between 1-100 (no % symbol)
                const scoreNumber = Math.round(scoreData.score);
                scoreDisplay.textContent = `${scoreNumber}`;
                // Add detailed tooltip showing HP and accuracy breakdown
                scoreDisplay.title = `Score: ${scoreData.score.toFixed(1)}%\nPerfect: ${scoreData.perfectStrokes} | Not Good: ${scoreData.notGoodStrokes}\nAccuracy: ${scoreData.accuracy.toFixed(1)}% | HP: ${hpLeft}/${maxHP} (${scoreData.hpPercentage.toFixed(1)}%)`;
            }
            
            if (nextLevel) {
                if (nextInfo) {
                    nextInfo.textContent = `Ready for Level ${nextLevel.id}?`;
                }
                if (nextBtn) {
                    nextBtn.textContent = `Next: ${nextLevel.name}`;
                    nextBtn.style.display = 'block';
                }
            } else {
                // All levels completed
                if (nextInfo) {
                    nextInfo.textContent = '🏆 You completed ALL levels! 🏆';
                }
                if (nextBtn) {
                    nextBtn.style.display = 'none';
                }
            }
            
            // Handle save progress button visibility and auto-save
            const saveBtn = document.getElementById('level-complete-save-btn');
            if (currentUser) {
                // User is logged in - check if they have saved progress
                const existingProgress = loadGameProgress();
                
                if (existingProgress) {
                    // User has saved before - auto-save and hide button
                    saveGameProgress();
                    if (saveBtn) {
                        saveBtn.style.display = 'none';
                    }
                    // Show save status
                    const saveStatus = document.getElementById('level-complete-save-status');
                    if (saveStatus) {
                        saveStatus.style.display = 'block';
                    }
                    showToast('Auto-Saved!', 'Your progress has been automatically saved.', '💾', 2500);
                } else {
                    // First time - show save button
                    if (saveBtn) {
                        saveBtn.style.display = 'block';
                    }
                }
            } else {
                // User not logged in - show save button for manual save
                console.log('User not logged in - showing save button...');
                if (saveBtn) {
                    saveBtn.style.display = 'block';
                }
            }
            
            // Show overlay FIRST
            if (overlay) {
                overlay.classList.remove('hidden');
            }
            
            // THEN auto-create demo user and save (after overlay is visible)
            if (!currentUser) {
                // Use setTimeout(0) to defer to next tick, ensuring overlay is rendered
                setTimeout(() => {
                    console.log('🔵 Auto-creating demo user for first level complete...');
                    simulateGoogleLogin();
                    // Save will happen automatically in onUserLogin callback
                    // Hide save button and show status after auto-save
                    setTimeout(() => {
                        if (saveBtn) {
                            saveBtn.style.display = 'none';
                        }
                        const saveStatus = document.getElementById('level-complete-save-status');
                        if (saveStatus) {
                            saveStatus.style.display = 'block';
                        }
                    }, 100);
                }, 0);
            }
        }
        
        function hideLevelComplete() {
            const overlay = document.getElementById('level-complete-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
            // Reset save status display
            const saveStatus = document.getElementById('level-complete-save-status');
            if (saveStatus) {
                saveStatus.style.display = 'none';
            }
        }

        // Calculate level score based on performance
        function calculateLevelScore() {
            const totalStrokes = perfectStrokesCount + notGoodStrokesCount;
            
            // Avoid division by zero
            if (totalStrokes === 0) {
                return {
                    score: 0,
                    accuracy: 0,
                    hpPercentage: 0,
                    perfectStrokes: 0,
                    notGoodStrokes: 0,
                    totalStrokes: 0
                };
            }
            
            // Calculate accuracy percentage (perfect / total)
            const accuracyPercentage = (perfectStrokesCount / totalStrokes) * 100;
            
            // Calculate HP percentage
            const hpPercentage = (currentHP / maxHP) * 100;
            
            // Final score: accuracy × HP percentage
            const finalScore = (accuracyPercentage / 100) * hpPercentage;
            
            console.log(`Level Score Calculation:`);
            console.log(`  Perfect strokes: ${perfectStrokesCount}`);
            console.log(`  Not good strokes: ${notGoodStrokesCount}`);
            console.log(`  Total strokes: ${totalStrokes}`);
            console.log(`  Accuracy: ${accuracyPercentage.toFixed(2)}%`);
            console.log(`  HP: ${currentHP.toFixed(2)} / ${maxHP} (${hpPercentage.toFixed(2)}%)`);
            console.log(`  Final Score: ${finalScore.toFixed(2)}%`);
            
            return {
                score: finalScore,
                accuracy: accuracyPercentage,
                hpPercentage: hpPercentage,
                perfectStrokes: perfectStrokesCount,
                notGoodStrokes: notGoodStrokesCount,
                totalStrokes: totalStrokes
            };
        }

        // ========== AUTHENTICATION & SAVE/LOAD FUNCTIONS ==========
        
        // currentUser is declared in game-state.js

        // Show toast notification
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function showToast(title, message, icon = '✅', duration = 3000) {
            const toast = document.getElementById('toast-notification');
            const toastIcon = toast.querySelector('.toast-icon');
            const toastTitle = toast.querySelector('.toast-title');
            const toastMessage = toast.querySelector('.toast-message');
            
            if (toast && toastIcon && toastTitle && toastMessage) {
                toastIcon.textContent = icon;
                toastTitle.textContent = title;
                toastMessage.textContent = message;
                
                // Show toast
                toast.classList.remove('hide');
                toast.classList.add('show');
                
                // Hide after duration
                setTimeout(() => {
                    toast.classList.remove('show');
                    toast.classList.add('hide');
                }, duration);
            }
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        /* ===== DUPLICATE FUNCTION - Already defined in auth.js =====
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
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function handleCredentialResponse(response) {
            // Decode the JWT token to get user info
            const userInfo = parseJwt(response.credential);
            currentUser = {
                id: userInfo.sub,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
            };
            
            onUserLogin(currentUser);
        }

        // Simulate Google login for demo (remove in production)
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function simulateGoogleLogin() {
            // Demo user data
            currentUser = {
                id: 'demo_user_' + Date.now(),
                name: 'Demo User',
                email: 'demo@example.com',
                picture: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="%238b5cf6"/><text x="50" y="65" text-anchor="middle" fill="white" font-size="40">👤</text></svg>'
            };
            
            onUserLogin(currentUser);
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        function onUserLogin(user) {
            // Hide auth modal
            hideAuthModal();
            
            // Save user info to localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Update UI to show user info
            updateUserInfoDisplay(user);
            
            // Save current game progress
            saveGameProgress();
            
            // Show success notification
            showToast('Progress Saved!', 'Your game progress has been saved successfully.', '💾', 3000);
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        function updateUserInfoDisplay(user) {
            const userInfo = document.getElementById('user-info');
            const userName = document.getElementById('user-name');
            const userAvatar = document.getElementById('user-avatar');
            
            if (userInfo && userName && userAvatar) {
                userName.textContent = user.name;
                userAvatar.src = user.picture;
                userInfo.classList.remove('hidden');
            }
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        function handleLogout() {
            if (confirm('Are you sure you want to logout?')) {
                currentUser = null;
                localStorage.removeItem('currentUser');
                
                const userInfo = document.getElementById('user-info');
                if (userInfo) {
                    userInfo.classList.add('hidden');
                }
                
                showToast('Logged Out', 'You have been logged out successfully.', '👋', 3000);
            }
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        function checkUserLoginStatus() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                try {
                    currentUser = JSON.parse(savedUser);
                    updateUserInfoDisplay(currentUser);
                } catch (e) {
                    console.error('Error loading user info:', e);
                }
            }
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        function saveGameProgress() {
            if (!currentUser) {
                showToast('Sign In Required', 'Please sign in to save your progress!', '⚠️', 3000);
                showAuthModal();
                return;
            }

            const gameProgress = {
                userId: currentUser.id,
                timestamp: new Date().toISOString(),
                currentLevel: currentLevel ? currentLevel.id : null,
                currentCharacterIndex: currentCharacterIndex,
                charactersToLearn: charactersToLearn,
                completedCharacters: Array.from(document.querySelectorAll('.completed-character')).map(el => el.textContent),
                currentHP: currentHP,
                maxHP: maxHP,
                elapsedTime: timerElapsedSeconds
            };

            // Save to localStorage with user-specific key
            const saveKey = `gameProgress_${currentUser.id}`;
            localStorage.setItem(saveKey, JSON.stringify(gameProgress));
            
            console.log('Game progress saved:', gameProgress);
            return gameProgress;
        }

        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====

        function loadGameProgress() {
            if (!currentUser) {
                console.log('No user logged in, cannot load progress');
                return null;
            }

            const saveKey = `gameProgress_${currentUser.id}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (savedData) {
                try {
                    const progress = JSON.parse(savedData);
                    console.log('Game progress loaded:', progress);
                    return progress;
                } catch (e) {
                    console.error('Error loading game progress:', e);
                    return null;
                }
            }
            
            return null;
        }

        // Parse JWT token
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
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

        // ========== END AUTHENTICATION & SAVE/LOAD FUNCTIONS ==========
        
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        
        /* ===== DUPLICATE FUNCTION - Already defined in hp-system.js =====
        function updateHPBar(newHP) {
            currentHP = Math.max(0, Math.min(maxHP, newHP));
            const hpPercentage = (currentHP / maxHP) * 100;
            
            const hpBarFill = document.getElementById('hp-bar-fill');
            const hpBarText = document.getElementById('hp-bar-text');
            
            if (hpBarFill && hpBarText) {
                hpBarFill.style.width = hpPercentage + '%';
                hpBarText.textContent = `${Math.round(currentHP)} / ${maxHP}`;
                
                // Change color based on HP percentage (using game color scheme)
                if (hpPercentage > 60) {
                    hpBarFill.style.background = 'linear-gradient(90deg, #3498db 0%, #2980b9 100%)'; // Blue shield/secondary bar
                } else if (hpPercentage > 30) {
                    hpBarFill.style.background = 'linear-gradient(90deg, #f1c40f 0%, #f39c12 100%)'; // Yellow warning
                } else {
                    hpBarFill.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)'; // Red HP bar (danger)
                }
            }
            
            // Check for game over
            if (currentHP <= 0) {
                showGameOver();
            }
        }
        ===== END DUPLICATE FUNCTION ===== */
        
        /* ===== DUPLICATE FUNCTION - Already defined in hp-system.js =====
        
        function showGameOver() {
            isGameOver = true;
            stopTimer();
            const overlay = document.getElementById('game-over-overlay');
            if (overlay) {
                overlay.classList.remove('hidden');
            }
            console.log('GAME OVER! HP reached 0.');
        }
        
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        
        function restartGame() {
            // Reset game over flag
            isGameOver = false;
            
            // Hide game over overlay
            const overlay = document.getElementById('game-over-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
            
            // Stop timer
            stopTimer();
            
            // Show level selection screen
            showLevelSelection();
        }
        
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        
        function applyDamage(damage) {
            const newHP = currentHP - damage;
            updateHPBar(newHP);
            console.log(`HP: ${Math.round(currentHP)} / ${maxHP} (Damage: ${damage.toFixed(2)})`);
        }
        
        
        function resetHP() {
            updateHPBar(maxHP);
        }
        ===== END DUPLICATE FUNCTION ===== */
        
        /* ===== DUPLICATE FUNCTION - Already defined in hp-system.js =====
        // Function to convert punishment to HP deduction
        function punishmentToHPDeduction(punishment) {
            if (punishment < 50) {
                return 0;
            } else {
                return punishment / 10;
            }
        }
        
        // Function to generate completion sound effect using Web Audio API
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function playCompletionSound() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Create a pleasant completion sound
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
        
        // Load saved character index from localStorage
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
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
            return 0; // Default to first character
        }
        
        // Save current character index to localStorage
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function saveCharacterIndex(index) {
            try {
                localStorage.setItem(STORAGE_KEY, index.toString());
                console.log(`Saved character index: ${index}`);
            } catch (e) {
                console.warn('Could not save character index:', e);
            }
        }
        
        // Generate thumbnail for a character from stroke data
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function generateCharacterThumbnail(char, charData) {
            if (!charData || !charData.rawCharData || !charData.rawCharData.medians) {
                console.warn(`Cannot generate thumbnail for ${char}: missing stroke data`);
                return null;
            }
            
            // Create a temporary canvas to draw the character
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 420; // Use same size as main canvas
            tempCanvas.height = 420;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) return null;
            
            // Clear canvas
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            const medians = charData.rawCharData.medians;
            const totalStrokes = charData.totalStrokes || medians.length;
            
            // Set drawing style
            tempCtx.strokeStyle = '#1C1C1C'; // Drawing color
            // Use thinner strokes for characters with more than 10 strokes
            const lineWidth = totalStrokes > 10 ? 12 : 15;
            tempCtx.lineWidth = lineWidth;
            tempCtx.lineCap = 'round';
            tempCtx.lineJoin = 'round';
            
            const canvasSize = tempCanvas.width;
            const dataWidth = 900;
            const dataHeight = 900;
            const strokeHalfWidth = lineWidth / 2;
            const padding = Math.max(strokeHalfWidth + 10, canvasSize * 0.1);
            const availableSize = canvasSize - (padding * 2);
            const scale = availableSize / Math.max(dataWidth, dataHeight);
            const offsetX = (canvasSize - (dataWidth * scale)) / 2;
            const offsetY = (canvasSize - (dataHeight * scale)) / 2;
            
            // Draw all strokes
            for (let i = 0; i < medians.length; i++) {
                const strokePoints = medians[i];
                if (!strokePoints || strokePoints.length === 0) continue;
                
                const canvasPoints = strokePoints.map(([x, y]) => {
                    return {
                        x: x * scale + offsetX,
                        y: (dataHeight - y) * scale + offsetY
                    };
                });
                
                tempCtx.beginPath();
                tempCtx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
                for (let j = 1; j < canvasPoints.length; j++) {
                    tempCtx.lineTo(canvasPoints[j].x, canvasPoints[j].y);
                }
                tempCtx.stroke();
            }
            
            // Create thumbnail canvas (36x36)
            const thumbnailCanvas = document.createElement('canvas');
            thumbnailCanvas.width = 36;
            thumbnailCanvas.height = 36;
            const thumbnailCtx = thumbnailCanvas.getContext('2d');
            
            // Scale down to 36x36
            thumbnailCtx.drawImage(tempCanvas, 0, 0, 36, 36);
            
            // Convert to image data URL
            return thumbnailCanvas.toDataURL('image/png');
        }
        
        // Add thumbnail to container
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function addThumbnailToContainer(char, imageDataUrl) {
            const container = document.getElementById('completed-characters-container');
            if (!container) return;
            
            const img = document.createElement('img');
            img.src = imageDataUrl;
            img.alt = char;
            
            const completedDiv = document.createElement('div');
            completedDiv.className = 'completed-character';
            completedDiv.appendChild(img);
            
            container.appendChild(completedDiv);
            
            // Update container width based on number of columns
            updateContainerWidth();
        }
        
        // Update container width based on number of columns
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function updateContainerWidth() {
            const container = document.getElementById('completed-characters-container');
            if (!container) return;
            
            // Calculate number of columns (20 rows per column)
            const columnCount = Math.ceil(container.children.length / 20);
            const columnWidth = 36; // Each character is 36px wide
            const containerPadding = 20; // 10px left + 10px right
            const containerWidth = (columnCount * columnWidth) + containerPadding;
            
            container.style.width = `${containerWidth}px`;
            container.style.minWidth = `${containerWidth}px`;
            container.style.maxWidth = `${containerWidth}px`;
        }
        
        // Load previous characters' thumbnails when resuming
        async function loadPreviousCharactersThumbnails(startIndex) {
            if (startIndex <= 0) return; // No previous characters
            
            console.log(`Loading thumbnails for previous ${startIndex} characters...`);
            
            for (let i = 0; i < startIndex; i++) {
                const char = charactersToLearn[i];
                const charData = charactersStrokeDataList.find(c => c.character === char);
                
                if (charData) {
                    const thumbnail = generateCharacterThumbnail(char, charData);
                    if (thumbnail) {
                        addThumbnailToContainer(char, thumbnail);
                        console.log(`Loaded thumbnail for character ${i + 1}: ${char}`);
                    }
                } else {
                    console.warn(`Could not find data for character ${i + 1}: ${char}`);
                }
            }
            
            // Update container width based on columns
            const container = document.getElementById('completed-characters-container');
            if (container) {
                container.style.overflow = 'hidden';
                updateContainerWidth();
            }
        }
        
        // Background music control
        let backgroundMusic = null;
        let musicEnabled = false;
        
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        
        /* ===== DUPLICATE FUNCTION - Already defined in ui-manager.js =====
        function initMusicControl() {
            backgroundMusic = document.getElementById('background-music');
            const musicToggle = document.getElementById('music-toggle');
            
            if (!backgroundMusic || !musicToggle) {
                console.warn('Music elements not found');
                return;
            }
            
            // Stop any existing audio first (in case of page refresh)
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0; // Reset to beginning
            
            // Set initial state
            musicToggle.classList.add('active');
            musicEnabled = true;
            
            // Try to play music (may require user interaction)
            backgroundMusic.volume = 0.25; // Set volume to 25%
            backgroundMusic.loop = true; // Ensure looping is enabled
            
            // Toggle music on/off
            musicToggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling to drag detection
                e.preventDefault();
                musicEnabled = !musicEnabled;
                
                if (musicEnabled) {
                    musicToggle.classList.add('active');
                    backgroundMusic.play().catch(err => {
                        console.log('Could not play music:', err);
                        // If autoplay fails, user will need to interact first
                    });
                } else {
                    musicToggle.classList.remove('active');
                    backgroundMusic.pause();
                }
            });
            
            // Try to start music after first user interaction
            document.addEventListener('click', function startMusic() {
                if (musicEnabled && backgroundMusic.paused) {
                    backgroundMusic.play().catch(err => {
                        console.log('Could not autoplay music:', err);
                    });
                }
                // Remove listener after first click
                document.removeEventListener('click', startMusic);
            }, { once: true });
            
            console.log('Music control initialized');
        }
        ===== END DUPLICATE FUNCTION ===== */
        
        // Initialize voice button to read current character
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function initVoiceButton() {
            const voiceBtn = document.getElementById('voice-btn');
            
            if (!voiceBtn) {
                console.warn('Voice button not found');
                return;
            }
            
            voiceBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event from bubbling to drag detection
                e.preventDefault();
                
                if (!character) {
                    console.log('No character to read');
                    return;
                }
                
                console.log(`Reading character: ${character}`);
                
                try {
                    // Cancel any ongoing speech
                    window.speechSynthesis.cancel();
                    
                    // Create new utterance
                    const utterance = new SpeechSynthesisUtterance(character);
                    utterance.lang = 'zh-CN'; // Chinese language
                    utterance.rate = 0.7; // Slower for clarity
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
                    console.log('Could not speak character:', e);
                }
            });
            
            console.log('Voice button initialized');
        }
        
        
        // allCharactersData is declared in game-state.js
        
        /**
         * Structured storage for stroke data - NEW STRUCTURE
         * 
         * CharacterStrokeData structure:
         * {
         *   character: string,           // The Chinese character
         *   unicode: number,             // Unicode code point
         *   unicodeHex: string,         // Unicode in hex format
         *   timestamp: string,          // ISO 8601 timestamp
         *   version: string,            // Data structure version
         *   source: string,             // Data source
         *   totalStrokes: number,       // Total number of strokes
         *   strokes: StrokeData[],      // Array of processed stroke data
         *   rawCharData: object         // Original unprocessed data
         * }
         * 
         * StrokeData structure:
         * {
         *   index: number,              // Stroke index (0-based)
         *   points: Point[],            // All points along stroke path
         *   pointCount: number,         // Number of points
         *   startPoint: Point,           // {x, y} - starting point (first point)
         *   endPoint: Point,            // {x, y} - ending point (farthest point from start)
         *   direction: {dx, dy},        // Direction vector (in screen coordinates)
         *   angle: number,              // Angle in radians (in screen coordinates)
         *   angleDegrees: number,       // Angle in degrees (in screen coordinates)
         *   length: number,             // Total stroke length
         *   distanceToNext: number,     // Distance to next stroke's start point
         *   coordinateSystem: {         // Coordinate system info
         *     origin: string,           // "bottom-left" or "top-left"
         *     conversionHeight: number, // Reference height (e.g., 900)
         *     converted: boolean        // Whether converted to screen space
         *   },
         *   source: string,             // Data source: 'medians', 'path', 'points'
         *   processed: boolean,         // Whether processed
         *   rawData: any                // Original raw stroke data
         * }
         */
        
        // List to store first 5 characters in new structure
        let charactersStrokeDataList = [];
        
        // newHanziWriter class is now defined in hanzi-writer.js
        // Create global instance (hanziWriter is declared in game-state.js)
        hanziWriter = new newHanziWriter();

            // Function to calculate stroke angle from points
            function calculateStrokeAngle(points) {
                if (!points || points.length < 2) {
                    return null;
                }
                
                const startPoint = points[0];
                
                // Find the point with maximum distance from start point
                let maxDistance = 0;
                let endPoint = startPoint;
                
                for (let i = 1; i < points.length; i++) {
                    const point = points[i];
                    const dx = point.x - startPoint.x;
                    const dy = point.y - startPoint.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        endPoint = point;
                    }
                }
                
                // Convert stroke coordinates from bottom-left origin to screen coordinates (top-left origin)
                // Stroke coordinates: (0,0) at bottom-left, y increases upward
                // Screen coordinates: (0,0) at top-left, y increases downward
                // Use 900 as the reference height for conversion
                const conversionHeight = 900;
                
                // Convert stroke points to screen coordinates
                const startPointScreen = {
                    x: startPoint.x,
                    y: conversionHeight - startPoint.y  // Flip y-axis
                };
                
                const endPointScreen = {
                    x: endPoint.x,
                    y: conversionHeight - endPoint.y  // Flip y-axis
                };
                
                // Calculate direction vector in screen coordinates
                const dx = endPointScreen.x - startPointScreen.x;
                const dy = endPointScreen.y - startPointScreen.y;
                
                // Calculate angle in radians using atan2 (consistent method)
                // Using screen coordinates: (0,0) at top-left, y increases downward
                const angle = Math.atan2(dy, dx);
                const angleDegrees = angle * 180 / Math.PI;
                
                // Calculate approximate length
                let length = 0;
                for (let i = 1; i < points.length; i++) {
                    const prev = points[i - 1];
                    const curr = points[i];
                    length += Math.sqrt(
                        Math.pow(curr.x - prev.x, 2) + 
                        Math.pow(curr.y - prev.y, 2)
                    );
                }
                
                return {
                    startPoint: startPoint,
                    endPoint: endPoint,
                    direction: { dx, dy },
                    angle: angle,
                    angleDegrees: angleDegrees,
                    length: length
                };
            }
            
            // Function to process and store stroke data
            function processStrokeData(charData) {
                if (!charData || !charData.strokes) {
                    console.log('No stroke data to process');
                    return;
                }
                
                hanziWriter.strokeData.rawCharData = charData;
                hanziWriter.strokeData.strokes = [];
                hanziWriter.totalStrokes = charData.strokes.length;
                
                // Helper function to parse SVG path
                function parseSVGPath(pathString) {
                    if (!pathString) return null;
                    const commands = pathString.match(/[MLml][\s]*([\d\.\-]+)[\s]*([\d\.\-]+)/g);
                    if (!commands || commands.length === 0) return null;
                    
                    const points = [];
                    for (let cmd of commands) {
                        const coords = cmd.match(/[\d\.\-]+/g);
                        if (coords && coords.length >= 2) {
                            points.push({ 
                                x: parseFloat(coords[0]), 
                                y: parseFloat(coords[1]) 
                            });
                        }
                    }
                    return points.length > 0 ? points : null;
                }
                
                // Process each stroke
                for (let i = 0; i < charData.strokes.length; i++) {
                    const rawStroke = charData.strokes[i];
                    const processedStroke = {
                        index: i,
                        rawData: rawStroke,  // Keep original data for reference
                        
                        // Extracted points
                        points: null,  // All points along the stroke
                        startPoint: null,  // {x, y}
                        endPoint: null,    // {x, y}
                        
                        // Calculated properties
                        direction: null,    // {dx, dy}
                        angle: null,        // angle in radians
                        angleDegrees: null, // angle in degrees
                        length: null,       // approximate stroke length
                        
                        // Metadata
                        source: null  // Which property was used: 'medians', 'path', 'points'
                    };
                    
                    // Try to extract points from different sources
                    let extractedPoints = null;
                    
                    // Try medians first (common in HanziWriter)
                    if (rawStroke.medians && rawStroke.medians.length > 0) {
                        extractedPoints = rawStroke.medians.map(m => ({ x: m[0], y: m[1] }));
                        processedStroke.source = 'medians';
                    } 
                    // Try path (SVG path data)
                    else if (rawStroke.path) {
                        extractedPoints = parseSVGPath(rawStroke.path);
                        processedStroke.source = 'path';
                    }
                    // Try points array
                    else if (rawStroke.points && rawStroke.points.length > 0) {
                        extractedPoints = rawStroke.points.map(p => {
                            if (Array.isArray(p)) {
                                return { x: p[0], y: p[1] };
                            }
                            return p;
                        });
                        processedStroke.source = 'points';
                    }
                    
                    // If we got points, process them
                    if (extractedPoints && extractedPoints.length > 0) {
                        processedStroke.points = extractedPoints;
                        
                        // Calculate stroke angle using the separate function
                        const angleData = calculateStrokeAngle(extractedPoints);
                        if (angleData) {
                            processedStroke.startPoint = angleData.startPoint;
                            processedStroke.endPoint = angleData.endPoint;
                            processedStroke.direction = angleData.direction;
                            processedStroke.angle = angleData.angle;
                            processedStroke.angleDegrees = angleData.angleDegrees;
                            processedStroke.length = angleData.length;
                        }
                    }
                    
                    hanziWriter.strokeData.strokes.push(processedStroke);
                }
                
                hanziWriter.strokeData.initialized = true;
                console.log('Stroke data processed:', hanziWriter.strokeData);
                console.log(`Processed ${hanziWriter.strokeData.strokes.length} strokes`);
            }
            
            // Fallback function for browsers without File System Access API
            function downloadFile(jsonString, fileName = null) {
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName || `stroke_data_${character}_${Date.now()}.json`;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Clean up
                URL.revokeObjectURL(url);
                
                console.log(`File downloaded as: ${link.download}`);
            }
            

            // Button click handlers
            function attachButtonHandler() {
                const btn = document.getElementById('next-stroke-btn');
                if (btn) {
                    // Remove any existing handlers
                    btn.onclick = null;
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('=== BUTTON CLICKED ===');
                        drawNextStroke();
                    });
                    console.log('✓ Button click handler attached');
                    return true;
                } else {
                    console.error('✗ Button not found!');
                    return false;
                }
            }
            
            // Try to attach immediately
            if (!attachButtonHandler()) {
                // If button not found, try again after DOM is ready
                setTimeout(() => {
                    if (attachButtonHandler()) {
                        console.log('Button handler attached on retry');
                    }
                }, 100);
            }
            
        console.log('✅ Past button handler attachment');
        
        // Load all characters into new structure (in order from ToWriteText.txt)
        function loadAllCharactersIntoStructure() {
            // Clear existing data to prevent duplicates
            if (charactersStrokeDataList.length > 0) {
                console.log('Clearing existing structure data...');
                charactersStrokeDataList = [];
            }
            
            // charactersToLearn is already populated from ToWriteText.txt in order
            console.log(`Loading ${charactersToLearn.length} characters into new structure (in order from ToWriteText.txt)...`);
            
            for (let i = 0; i < charactersToLearn.length; i++) {
                const char = charactersToLearn[i];
                console.log(`Processing character ${i + 1}/${charactersToLearn.length}: ${char}`);
                
                if (!allCharactersData[char]) {
                    console.warn(`Character ${char} not found in allCharactersData`);
                    continue;
                }
                
                const charData = allCharactersData[char];
                
                // Calculate totalStrokes from available sources
                let calculatedTotalStrokes = 0;
                if (charData.totalStrokes && charData.totalStrokes > 0) {
                    calculatedTotalStrokes = charData.totalStrokes;
                } else if (charData.strokes && charData.strokes.length > 0) {
                    calculatedTotalStrokes = charData.strokes.length;
                } else if (charData.rawCharData && charData.rawCharData.strokes && charData.rawCharData.strokes.length > 0) {
                    calculatedTotalStrokes = charData.rawCharData.strokes.length;
                }
                
                // Create structured data entry
                const structuredData = {
                    character: char,
                    unicode: char.charCodeAt(0),
                    unicodeHex: char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
                    timestamp: new Date().toISOString(),
                    version: '1.0',
                    source: 'all_strokes.json',
                    totalStrokes: calculatedTotalStrokes,
                    strokes: charData.strokes || [],
                    rawCharData: charData.rawCharData || null
                };
                
                // If strokes array is empty but we have rawCharData, we'll process it on demand
                if (structuredData.strokes.length === 0 && structuredData.rawCharData) {
                    console.log(`Character ${char} has no pre-processed strokes, will process from rawCharData when needed`);
                }
                
                if (calculatedTotalStrokes === 0) {
                    console.warn(`Character ${char} has totalStrokes = 0! This may cause issues.`);
                    console.log('charData:', charData);
                }
                
                charactersStrokeDataList.push(structuredData);
                console.log(`Added ${char} to structure list with ${structuredData.totalStrokes} strokes`);
            }
            
            console.log(`Loaded ${charactersStrokeDataList.length} characters into structure list`);
        }
        
        console.log('✅ Checkpoint 1: Defined loadAllCharactersIntoStructure');
        
        // Load ToWriteText.txt to get characters in order
        async function loadCharactersFromTextFile() {
            try {
                console.log('Fetching ToWriteText.txt...');
                const response = await fetch('ToWriteText.txt');
                if (response.ok) {
                    const text = await response.text();
                    // Extract all characters in order, including duplicates
                    charactersToLearn = Array.from(text).filter(char => {
                        // Keep Chinese characters and other non-whitespace characters
                        return char.trim().length > 0 && char !== '\n' && char !== '\r';
                    });
                    console.log(`Loaded ${charactersToLearn.length} characters from ToWriteText.txt in order`);
                    console.log('First 20 characters:', charactersToLearn.slice(0, 20).join(''));
                    return true;
                } else {
                    console.error(`Failed to load ToWriteText.txt: ${response.status}`);
                    return false;
                }
            } catch (error) {
                console.error('Error loading ToWriteText.txt:', error);
                return false;
            }
        }
        
        // Load all_strokes.json first, then load all characters into new structure
        async function initializeApp(skipTextFile = false) {
            // If skipTextFile is true, we're coming from level selection and charactersToLearn is already set
            if (!skipTextFile) {
                console.log('Initializing app - loading ToWriteText.txt...');
                const textLoaded = await loadCharactersFromTextFile();
                if (!textLoaded) {
                    alert('Failed to load ToWriteText.txt. Please make sure the file exists in the same directory.');
                    return;
                }
            } else {
                console.log('Initializing app - using characters from selected level...');
                console.log('Characters to learn:', charactersToLearn.join(''));
            }
            
            console.log('Initializing app - loading all_strokes.json...');
            const loaded = await loadStrokesDataFromFile();
            if (!loaded) {
                alert('Failed to load all_strokes.json. Please make sure the file exists in the same directory.');
                return;
            }
            
            // Load all characters into new structure (in order from ToWriteText.txt or level)
            console.log('Loading all characters into new structure...');
            loadAllCharactersIntoStructure();
            
            // Log the loaded structure
            console.log(`Loaded ${charactersStrokeDataList.length} characters into new structure`);
            
            // Set initial character
            if (charactersToLearn.length > 0) {
                // When starting from level selection, always start from first character (index 0)
                const startIndex = skipTextFile ? 0 : loadSavedCharacterIndex();
                // Make sure the saved index is valid
                const validIndex = Math.min(startIndex, charactersToLearn.length - 1);
                
                // Load thumbnails for previous characters if resuming (skip if from level selection)
                if (!skipTextFile && validIndex > 0) {
                    await loadPreviousCharactersThumbnails(validIndex);
                }
                
                // Update main canvas position after loading thumbnails
                setTimeout(() => {
                    updateMainCanvasPosition();
                }, 100);
                
                // Also update on window resize
                window.addEventListener('resize', updateMainCanvasPosition);
                
                character = charactersToLearn[validIndex];
                // Start processing from saved character (or first if none saved)
                processSingleCharacter(validIndex);
            } else {
                alert('No characters available');
            }
        }
        
        console.log('✅ Checkpoint 2: Defined loadCharactersFromTextFile and initializeApp');
        
        // Stop audio when page is about to unload (refresh/close)
        window.addEventListener('beforeunload', function() {
            if (backgroundMusic) {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
            }
        });
        
        // Initialize top bar auto-hide functionality for mobile
        /* ===== DUPLICATE FUNCTION - Already defined in separate module =====
        function initTopBarAutoHide() {
            // Only enable on mobile (< 768px)
            if (window.innerWidth >= 768) return;
            
            const topBar = document.querySelector('.top-bar');
            const trigger = document.querySelector('.top-bar-trigger');
            let hideTimeout;
            
            // Show top bar
            function showTopBar() {
                topBar.classList.add('visible');
                
                // Auto-hide after 3 seconds
                clearTimeout(hideTimeout);
                hideTimeout = setTimeout(() => {
                    topBar.classList.remove('visible');
                }, 3000);
            }
            
            // Hide top bar immediately
            function hideTopBar() {
                clearTimeout(hideTimeout);
                topBar.classList.remove('visible');
            }
            
            // Show on trigger area touch/hover
            if (trigger) {
                trigger.addEventListener('touchstart', showTopBar);
                trigger.addEventListener('mouseenter', showTopBar);
            }
            
            // Show on top bar touch/hover - restart hide timer
            if (topBar) {
                topBar.addEventListener('touchstart', (e) => {
                    e.stopPropagation();
                    showTopBar();
                });
                topBar.addEventListener('mouseenter', () => {
                    showTopBar();
                });
                topBar.addEventListener('mouseleave', () => {
                    // Start hide timer when mouse leaves
                    clearTimeout(hideTimeout);
                    hideTimeout = setTimeout(() => {
                        topBar.classList.remove('visible');
                    }, 3000);
                });
            }
            
            // Show initially for 3 seconds
            showTopBar();
        }
        ===== END DUPLICATE FUNCTION ===== */
        
        // Initialize music control and app when page loads
        async function initPage() {
            console.log('🚀 initPage() called');
            // Stop any existing audio instances first
            if (backgroundMusic) {
                backgroundMusic.pause();
                backgroundMusic.currentTime = 0;
            }
            // Initialize HP bar
            console.log('Initializing HP bar...');
            updateHPBar(maxHP);
            // Initialize restart button
            const restartBtn = document.getElementById('restart-btn');
            if (restartBtn) {
                restartBtn.addEventListener('click', restartGame);
            }
            
            // Initialize level complete buttons
            const levelCompleteRestartBtn = document.getElementById('level-complete-restart-btn');
            const levelCompleteNextBtn = document.getElementById('level-complete-next-btn');
            const levelCompleteMenuBtn = document.getElementById('level-complete-menu-btn');
            
            if (levelCompleteRestartBtn) {
                levelCompleteRestartBtn.addEventListener('click', () => {
                    hideLevelComplete();
                    // Restart the current level
                    if (currentLevel) {
                        startLevel(currentLevel.id);
                    }
                });
            }
            
            if (levelCompleteNextBtn) {
                levelCompleteNextBtn.addEventListener('click', () => {
                    console.log('🔵 Next Level button clicked');
                    hideLevelComplete();
                    
                    // Find next level
                    const currentLevelIndex = levelConfig.levels.findIndex(l => l.id === currentLevel.id);
                    const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < levelConfig.levels.length - 1 
                        ? levelConfig.levels[currentLevelIndex + 1] 
                        : null;
                    
                    if (nextLevel) {
                        startLevel(nextLevel.id);
                    } else {
                        // Last level - wait for save to complete before showing level selection
                        setTimeout(() => {
                            console.log('🔵 Last level completed - showing level selection');
                            showLevelSelection();
                            displayLevelSelection('', false);
                        }, 400);
                    }
                });
            }
            
            if (levelCompleteMenuBtn) {
                levelCompleteMenuBtn.addEventListener('click', () => {
                    console.log('🔵 Level Select button clicked');
                    hideLevelComplete();
                    
                    // Wait a bit to ensure auto-save is complete
                    setTimeout(() => {
                        console.log('🔵 Showing level selection and refreshing display');
                        showLevelSelection();
                        // Refresh the level display to show Continue card
                        displayLevelSelection('', false);
                    }, 400);
                });
            }

            // Initialize save progress button
            const levelCompleteSaveBtn = document.getElementById('level-complete-save-btn');
            if (levelCompleteSaveBtn) {
                levelCompleteSaveBtn.addEventListener('click', () => {
                    // If user not logged in, auto-login with demo mode for seamless mobile experience
                    if (!currentUser) {
                        console.log('Auto-creating demo user for save...');
                        simulateGoogleLogin();
                        // Save will happen in onUserLogin callback
                    } else {
                        // User already logged in, show modal for confirmation
                        showAuthModal();
                    }
                });
            }

            // Initialize auth modal buttons
            const authCancelBtn = document.getElementById('auth-cancel-btn');
            const googleSigninBtn = document.getElementById('google-signin-btn');
            
            if (authCancelBtn) {
                authCancelBtn.addEventListener('click', hideAuthModal);
            }

            if (googleSigninBtn) {
                googleSigninBtn.addEventListener('click', () => {
                    // Check if we're in local development (localhost or file://)
                    const isLocalDev = window.location.hostname === 'localhost' || 
                                      window.location.hostname === '127.0.0.1' || 
                                      window.location.protocol === 'file:';
                    
                    if (isLocalDev) {
                        // Use demo login for local development
                        console.log('Local development detected - using demo login');
                        simulateGoogleLogin();
                    } else {
                        // In production, try Google Sign-In
                        if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                            console.log('Initializing Google Sign-In...');
                            google.accounts.id.initialize({
                                client_id: document.querySelector('meta[name="google-signin-client_id"]')?.content,
                                callback: handleCredentialResponse
                            });
                            // Show the One Tap dialog
                            google.accounts.id.prompt((notification) => {
                                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                                    // Fall back to demo mode if One Tap fails
                                    console.warn('Google One Tap not displayed, using demo mode');
                                    simulateGoogleLogin();
                                }
                            });
                        } else {
                            // Fall back to demo mode if Google Sign-In not loaded
                            console.warn('Google Sign-In library not loaded - using demo mode');
                            simulateGoogleLogin();
                        }
                    }
                });
            }

            // Initialize logout button
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }

            // Check if user is already logged in
            checkUserLoginStatus();
            
            initMusicControl();
            initVoiceButton();
            initTopBarAutoHide();
            
            // Load level config and show level selection
            console.log('Loading level config...');
            await loadLevelConfig();
            console.log('Level config loaded:', levelConfig ? 'SUCCESS' : 'FAILED');
            if (levelConfig) {
                console.log('Displaying level selection...');
                displayLevelSelection();
                initLevelSearch();
                showLevelSelection();
                console.log('✅ Game initialized successfully!');
            } else {
                alert('Failed to load level configuration. Please check level_config.json file.');
            }
        }
        
        // Initialize level search functionality
        function initLevelSearch() {
            const searchInput = document.getElementById('level-search-input');
            
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    const searchQuery = e.target.value;
                    displayLevelSelection(searchQuery);
                });
                
                // Clear search when level selection is shown
                searchInput.value = '';
            }
        }
        
        console.log('✅ Checkpoint 3: Defined initPage and initLevelSearch');
        console.log('📋 Document ready state:', document.readyState);
        if (document.readyState === 'loading') {
            console.log('⏳ Waiting for DOMContentLoaded...');
            document.addEventListener('DOMContentLoaded', initPage);
        } else {
            console.log('✅ DOM already loaded, calling initPage()...');
            initPage();
        }
        
        /**
         * Load character data from the new structure list
         */
        function loadCharacterDataFromStructure(char) {
            // Find character in the structured list
            const structuredCharData = charactersStrokeDataList.find(c => c.character === char);
            
            if (!structuredCharData) {
                console.error(`Character ${char} not found in charactersStrokeDataList`);
                console.error('Available characters in structure:', charactersStrokeDataList.map(c => c.character));
                return false;
            }
            
            console.log(`Loading character data from structure for: ${char}`);
            console.log(`Found structured data: ${structuredCharData.totalStrokes} strokes`);
            
            // Update strokeData with structured data
            hanziWriter.strokeData.character = structuredCharData.character;
            hanziWriter.strokeData.rawCharData = structuredCharData.rawCharData || null;
            
            console.log(`loadCharacterDataFromStructure: rawCharData for ${char}:`, hanziWriter.strokeData.rawCharData ? 'exists' : 'null');
            if (hanziWriter.strokeData.rawCharData) {
                console.log('✓ rawCharData loaded successfully');
                console.log('rawCharData keys:', Object.keys(hanziWriter.strokeData.rawCharData));
                if (hanziWriter.strokeData.rawCharData.strokes) {
                    console.log(`✓ rawCharData has ${hanziWriter.strokeData.rawCharData.strokes.length} strokes`);
                } else {
                    console.warn('✗ rawCharData has no strokes array');
                }
            } else {
                console.error('✗ rawCharData is null! This will cause problems.');
                console.log('structuredCharData.rawCharData:', structuredCharData.rawCharData ? 'exists' : 'null');
            }
            
            // Convert structured strokes to format expected by existing code
            hanziWriter.strokeData.strokes = structuredCharData.strokes.map(stroke => ({
                index: stroke.index,
                rawData: stroke.rawData || null,
                points: stroke.points || null,
                startPoint: stroke.startPoint,
                endPoint: stroke.endPoint,
                direction: stroke.direction,
                angle: stroke.angle,
                angleDegrees: stroke.angleDegrees,
                length: stroke.length,
                distanceToNext: stroke.distanceToNext,
                source: stroke.source
            }));
            
            hanziWriter.totalStrokes = structuredCharData.totalStrokes || (hanziWriter.strokeData.strokes ? hanziWriter.strokeData.strokes.length : 0);
            hanziWriter.strokeData.initialized = true;
            hanziWriter.currentStrokeIndex = 0;
            hanziWriter.drawnStrokes = [];
            
            console.log(`Successfully loaded ${char} from structure with ${hanziWriter.totalStrokes} strokes`);
            console.log(`totalStrokes set to: ${hanziWriter.totalStrokes}`);
            return true;
        }
        
        /**
         * Legacy function - kept for backward compatibility
         * Now uses the new structure list
         */
        function loadCharacterData(char) {
            // Try to load from new structure first
            if (charactersStrokeDataList.length > 0) {
                return loadCharacterDataFromStructure(char);
            }
            
            // Fallback to old method if structure list is empty
            console.log(`Loading character data for: ${char} (fallback to allCharactersData)`);
            console.log(`Available characters:`, Object.keys(allCharactersData));
            
            if (allCharactersData[char]) {
                const charData = allCharactersData[char];
                console.log(`Found data for ${char}:`, charData);
                hanziWriter.strokeData.rawCharData = charData.rawCharData || null;
                
                // If strokes array is empty but we have rawCharData, process it
                if (charData.strokes && charData.strokes.length > 0) {
                    console.log(`Using pre-processed strokes for ${char}:`, charData.strokes.length);
                    hanziWriter.strokeData.strokes = charData.strokes.map(stroke => ({
                        index: stroke.index,
                        rawData: stroke.rawData || null,
                        points: stroke.points || null,
                        startPoint: stroke.startPoint,
                        endPoint: stroke.endPoint,
                        direction: stroke.direction,
                        angle: stroke.angle,
                        angleDegrees: stroke.angleDegrees,
                        length: stroke.length,
                        source: stroke.source
                    }));
                    hanziWriter.totalStrokes = charData.totalStrokes || hanziWriter.strokeData.strokes.length;
                } else if (charData.rawCharData) {
                    // Process rawCharData to extract stroke information
                    console.log(`Processing rawCharData for character: ${char}`);
                    processStrokeData(charData.rawCharData);
                    hanziWriter.totalStrokes = hanziWriter.strokeData.strokes.length;
                    console.log(`Processed ${hanziWriter.totalStrokes} strokes for ${char}`);
                } else {
                    console.error(`No stroke data available for character: ${char}`);
                    console.error('charData:', charData);
                    return false;
                }
                
                hanziWriter.strokeData.initialized = true;
                hanziWriter.currentStrokeIndex = 0;
                hanziWriter.drawnStrokes = [];
                hanziWriter.isAnimating = false;
                console.log(`Successfully loaded ${char} with ${hanziWriter.totalStrokes} strokes`);
                return true;
            } else {
                console.error(`Character ${char} not found in allCharactersData`);
                console.error('Available characters:', Object.keys(allCharactersData));
                return false;
            }
        }
        
        async function loadStrokesDataFromFile() {
            // Load stroke data from all_strokes.json file
            try {
                console.log('Fetching all_strokes.json...');
                // Add cache-busting parameter to force reload of latest data
                const response = await fetch(`data/all_strokes.json?v=${Date.now()}`);
                console.log('Response status:', response.status, response.statusText);
                
                if (response.ok) {
                    const loadedData = await response.json();
                    console.log('Parsed JSON data. Keys:', Object.keys(loadedData));
                    
                    if (loadedData.characters && typeof loadedData.characters === 'object') {
                        allCharactersData = loadedData.characters;
                        const charCount = Object.keys(allCharactersData).length;
                        console.log(`Successfully loaded ${charCount} characters from all_strokes.json`);
                        console.log('First few characters:', Object.keys(allCharactersData).slice(0, 10));
                        return true;
                    } else {
                        console.error('Invalid data format. Expected "characters" object.');
                        console.error('Data structure:', Object.keys(loadedData));
                    }
                } else {
                    console.error(`HTTP error: ${response.status} ${response.statusText}`);
                }
                return false;
            } catch (error) {
                console.error('Error loading all_strokes.json:', error);
                console.error('Error details:', error.message, error.stack);
                return false;
            }
        }
        
        function processSingleCharacter(charIndex) {
            // Process a single character using the new structure list
            if (charIndex >= charactersToLearn.length) {
                // All characters completed
                console.log(`All ${charactersToLearn.length} characters completed!`);
                alert(`Congratulations! You have completed all ${charactersToLearn.length} characters!`);
                return;
            }
            
            character = charactersToLearn[charIndex];
            currentCharacterIndex = charIndex;
            // Save current character index to localStorage
            saveCharacterIndex(charIndex);
            
            console.log(`Processing character ${charIndex + 1}/${charactersToLearn.length}: ${character}`);
            
            // Check if structure list is loaded
            if (charactersStrokeDataList.length === 0) {
                console.error('charactersStrokeDataList is empty. Make sure initializeApp() has loaded the data.');
                alert('Character data not loaded. Please refresh the page.');
                return;
            }
            
            // Load stroke data from the new structure list
            console.log(`Loading stroke data for character: ${character}`);
            console.log(`charactersStrokeDataList has ${charactersStrokeDataList.length} characters`);
            
            if (!loadCharacterDataFromStructure(character)) {
                console.error(`Failed to load stroke data for: ${character} from structure list`);
                console.error('Available characters in structure:', charactersStrokeDataList.map(c => c.character));
                alert(`Stroke data not found for character: ${character}\n\nAvailable: ${charactersStrokeDataList.map(c => c.character).join(', ')}`);
                return;
            }
            
            console.log(`✓ Character data loaded. strokeData.rawCharData:`, hanziWriter.strokeData.rawCharData ? 'exists' : 'null');
            if (hanziWriter.strokeData.rawCharData) {
                console.log(`✓ rawCharData has ${hanziWriter.strokeData.rawCharData.strokes ? hanziWriter.strokeData.rawCharData.strokes.length : 0} strokes`);
            }
            
            console.log(`Loaded stroke data for ${character} from structure (${hanziWriter.totalStrokes} strokes)`);
            
            // Log structure information
            const structuredData = charactersStrokeDataList.find(c => c.character === character);
            if (structuredData) {
                console.log(`Character structure:`, {
                    character: structuredData.character,
                    unicodeHex: structuredData.unicodeHex,
                    totalStrokes: structuredData.totalStrokes,
                    version: structuredData.version,
                    source: structuredData.source
                });
            }
            
            // Reset stroke tracking (start at 0, no strokes drawn yet)
            hanziWriter.currentStrokeIndex = 0;
            hanziWriter.drawnStrokes = [];
            hanziWriter.isAnimating = false;
            hanziWriter.guideDrawn = false; // Reset guide flag for new character
            // DON'T reset totalStrokes - it should already be set from loadCharacterDataFromStructure
            console.log(`processSingleCharacter: totalStrokes = ${hanziWriter.totalStrokes}, character = ${character}`);
            
            // If totalStrokes is still 0, try to get it from structure
            if (hanziWriter.totalStrokes === 0) {
                const charData = charactersStrokeDataList.find(c => c.character === character);
                if (charData && charData.rawCharData && charData.rawCharData.medians) {
                    hanziWriter.totalStrokes = charData.rawCharData.medians.length;
                    console.log(`Set totalStrokes to ${hanziWriter.totalStrokes} from medians in processSingleCharacter`);
                } else if (charData) {
                    hanziWriter.totalStrokes = charData.totalStrokes || (charData.strokes ? charData.strokes.length : 0);
                    console.log(`Set totalStrokes to ${hanziWriter.totalStrokes} from structure in processSingleCharacter`);
                }
            }
            
            // Initialize canvas (character is shown, ready for drag/touch)
            setTimeout(() => {
                hanziWriter.initCanvas();
                // Wait a bit to ensure canvas is fully initialized and guide is drawn
                setTimeout(() => {
                    updateProgressDisplay();
                    console.log(`Character ${character} displayed. Drag or touch anywhere to draw strokes...`);
                }, 50);
            }, 100);
        }
        
        function onCharacterCompleted() {
            // Prevent duplicate calls
            if (isCompletingCharacter) {
                console.log('Character completion already in progress, skipping duplicate call');
                return;
            }
            isCompletingCharacter = true;
            
            // Called when all strokes of current character are completed
            console.log(`Character ${character} completed! Moving to next character...`);
            
            // Capture the completed character and add it to the top right corner
            if (hanziWriter.canvas && hanziWriter.ctx) {
                const characterWrapper = document.querySelector('.character-wrapper');
                const container = document.getElementById('completed-characters-container');
                
                if (!characterWrapper || !container) return;
                
                // Step 1: Add explosive shining animation to the canvas
                characterWrapper.classList.add('shining');
                
                // Step 2: Capture the canvas after shine animation
                setTimeout(() => {
                    // Create a temporary canvas to capture the current state
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = hanziWriter.canvas.width;
                    tempCanvas.height = hanziWriter.canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    
                    // Draw the current canvas content to the temp canvas
                    tempCtx.drawImage(hanziWriter.canvas, 0, 0);
                    
                    // Create a new canvas for the 36x36 thumbnail
                    const thumbnailCanvas = document.createElement('canvas');
                    thumbnailCanvas.width = 36;
                    thumbnailCanvas.height = 36;
                    const thumbnailCtx = thumbnailCanvas.getContext('2d');
                    
                    // Draw the temp canvas scaled down to 36x36
                    thumbnailCtx.drawImage(tempCanvas, 0, 0, 36, 36);
                    
                    // Convert to image data URL
                    const imageDataUrl = thumbnailCanvas.toDataURL('image/png');
                    
                    // Get positions for animation
                    const wrapperRect = characterWrapper.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    // Calculate target position (top-right of container, accounting for new item)
                    const targetX = containerRect.right - 46; // 36px + 10px padding
                    const targetY = containerRect.top + 10 + (container.children.length % 20) * 36;
                    
                    // Step 3: Create flying thumbnail
                    const flyingImg = document.createElement('img');
                    flyingImg.src = imageDataUrl;
                    flyingImg.className = 'flying-thumbnail';
                    flyingImg.style.width = `${wrapperRect.width}px`;
                    flyingImg.style.height = `${wrapperRect.height}px`;
                    flyingImg.style.left = `${wrapperRect.left + wrapperRect.width / 2}px`;
                    flyingImg.style.top = `${wrapperRect.top + wrapperRect.height / 2}px`;
                    flyingImg.style.transform = 'translate(-50%, -50%)';
                    document.body.appendChild(flyingImg);
                    
                    // Remove shine class
                    characterWrapper.classList.remove('shining');
                    
                    // Start loading next character immediately (before flying animation starts)
                    const nextIndex = currentCharacterIndex + 1;
                    if (nextIndex < charactersToLearn.length) {
                        // Start loading next character right away so guide animation begins before flying
                        isCompletingCharacter = false; // Reset flag before processing next character
                        processSingleCharacter(nextIndex);
                    }
                    
                    // Step 4: Animate flying thumbnail to container (starts after next character begins loading)
                    setTimeout(() => {
                        flyingImg.style.left = `${targetX}px`;
                        flyingImg.style.top = `${targetY}px`;
                        flyingImg.style.width = '36px';
                        flyingImg.style.height = '36px';
                        flyingImg.style.transform = 'translate(-50%, -50%) scale(0.8)';
                        flyingImg.style.opacity = '0.9';
                    }, 10);
                    
                    // Step 5: After animation completes, add final thumbnail and remove flying one
                    setTimeout(() => {
                        // Play simple completion sound effect
                        playCompletionSound();
                        
                        // Create final thumbnail element
                        const img = document.createElement('img');
                        img.src = imageDataUrl;
                        img.alt = character;
                        
                        const completedDiv = document.createElement('div');
                        completedDiv.className = 'completed-character';
                        completedDiv.appendChild(img);
                        
                        container.appendChild(completedDiv);
                        
                        // Container height is automatically managed by top/bottom positioning
                        container.style.overflow = 'hidden';
                        
                        // Remove flying thumbnail
                        flyingImg.remove();
                        
                        // Update main canvas position based on container width
                        updateMainCanvasPosition();
                    }, 700); // Wait for animation to complete
                    
                    // Handle case when all characters are completed
                    if (nextIndex >= charactersToLearn.length) {
                        setTimeout(() => {
                            console.log('All characters completed!');
                            isCompletingCharacter = false; // Reset flag
                            
                            // Check if we're in level mode
                            if (currentLevel) {
                                onLevelComplete();
                            } else {
                                // Reset to first character when all are completed
                                saveCharacterIndex(0);
                            }
                        }, 700); // After flying animation completes
                    }
                }, 800); // Wait for shine animation to complete
            } else {
                // If canvas not available, just move to next character immediately
                const nextIndex = currentCharacterIndex + 1;
                if (nextIndex < charactersToLearn.length) {
                    isCompletingCharacter = false;
                    processSingleCharacter(nextIndex);
                } else {
                    isCompletingCharacter = false;
                    
                    // Check if we're in level mode
                    if (currentLevel) {
                        onLevelComplete();
                    } else {
                        saveCharacterIndex(0);
                    }
                }
            }
        }
        
        function moveToNextCharacter() {
            // Legacy function - now uses processSingleCharacter
            onCharacterCompleted();
        }
        
        function updateProgressDisplay() {
            const infoDisplay = document.getElementById('next-stroke-btn');
            if (infoDisplay) {
                const currentChar = charactersToLearn[currentCharacterIndex] || '';
                const levelName = currentLevel ? currentLevel.name : 'Practice';
                infoDisplay.textContent = `${levelName} ${currentCharacterIndex + 1}/${charactersToLearn.length} (${currentChar})`;
            }
        }
        
        // Update main canvas position based on container width
        function updateMainCanvasPosition() {
            const wrapper = document.getElementById('canvas-container-wrapper');
            const container = document.getElementById('completed-characters-container');
            const characterWrapper = document.querySelector('.character-wrapper');
            const mainContent = document.querySelector('.main-content');
            
            if (wrapper && container && characterWrapper && mainContent) {
                // Update container width first to ensure it's based on content
                updateContainerWidth();
                
                // Get container width (including padding) after updating
                const containerWidth = container.offsetWidth;
                // Get canvas width
                const canvasWidth = characterWrapper.offsetWidth || 800;
                // Get available viewport width
                const viewportWidth = window.innerWidth;
                // Calculate minimum space needed (canvas + container + gaps + margins)
                const minSpaceNeeded = canvasWidth + containerWidth + 60; // 60px for gaps and margins
                
                // Check if we need vertical layout
                if (viewportWidth < minSpaceNeeded) {
                    // Not enough horizontal space - use vertical layout
                    wrapper.classList.remove('horizontal-layout');
                    wrapper.classList.add('vertical-layout');
                    mainContent.style.marginRight = '0';
                    
                    // Update grid layout for vertical mode
                    if (currentLevel && currentLevel.numCharacters) {
                        setCompletedCharactersLayout(currentLevel.numCharacters);
                    }
                } else {
                    // Enough space - use horizontal layout
                    wrapper.classList.remove('vertical-layout');
                    wrapper.classList.add('horizontal-layout');
                    // Ensure container width is recalculated for horizontal layout
                    updateContainerWidth();
                    // Add right margin to reserve space for container, keeping canvas centered in remaining space
                    const totalOffset = containerWidth + 20;
                    mainContent.style.marginRight = `${totalOffset}px`;
                    
                    // Update grid layout for horizontal mode
                    if (currentLevel && currentLevel.numCharacters) {
                        setCompletedCharactersLayout(currentLevel.numCharacters);
                    }
                }
            }
        }
        
        async function drawNextStroke() {
            if (!hanziWriter.canvas || !hanziWriter.ctx) {
                console.error('Canvas not initialized');
                alert('Canvas not initialized. Please refresh the page.');
                return;
            }
            
            // Get total strokes from our loaded structure
            if (hanziWriter.totalStrokes === 0) {
                console.log('totalStrokes is 0, trying to get from structure...');
                console.log('current character:', character);
                
                // First, try to reload from structure if not initialized
                if (!hanziWriter.strokeData.initialized || !hanziWriter.strokeData.rawCharData) {
                    console.log('strokeData not initialized, reloading from structure...');
                    if (!loadCharacterDataFromStructure(character)) {
                        console.error(`Failed to reload character data for: ${character}`);
                        alert(`Failed to load stroke data for ${character}`);
                        return;
                    }
                }
                
                // Try to get from medians
                if (hanziWriter.strokeData.rawCharData && hanziWriter.strokeData.rawCharData.medians) {
                    hanziWriter.totalStrokes = hanziWriter.strokeData.rawCharData.medians.length;
                    console.log(`✓ Found ${hanziWriter.totalStrokes} strokes from medians`);
                } else {
                    // Try to get from structure
                    const charData = charactersStrokeDataList.find(c => c.character === character);
                    if (charData && charData.rawCharData && charData.rawCharData.medians) {
                        hanziWriter.totalStrokes = charData.rawCharData.medians.length;
                        console.log(`✓ Found ${hanziWriter.totalStrokes} strokes from structure medians`);
                    } else if (charData) {
                        hanziWriter.totalStrokes = charData.totalStrokes || 0;
                        console.log(`✓ Found ${hanziWriter.totalStrokes} strokes from structure totalStrokes`);
                    }
                }
                
                // Final check
                if (hanziWriter.totalStrokes === 0) {
                    console.error('No stroke data available');
                    alert(`No stroke data available for ${character}`);
                    return;
                }
            }
            
            // Check if all strokes are done (but only if not already completing)
            if (hanziWriter.currentStrokeIndex >= hanziWriter.totalStrokes && !isCompletingCharacter) {
                console.log('All strokes done, moving to next character');
                onCharacterCompleted();
                return;
            }
            
            if (hanziWriter.isAnimating) {
                console.log('Already animating, ignoring click');
                return;
            }
            
            const infoDisplay = document.getElementById('next-stroke-btn');
            const strokeNum = hanziWriter.currentStrokeIndex;
            
            console.log(`=== About to draw stroke ${strokeNum + 1}/${hanziWriter.totalStrokes} ===`);
            
            // Set isAnimating flag early to prevent race conditions
            // It will be set again in drawStroke, but this ensures immediate protection
            hanziWriter.isAnimating = true;
            
            if (infoDisplay) {
                const currentChar = charactersToLearn[currentCharacterIndex] || '';
                const levelName = currentLevel ? currentLevel.name : 'Practice';
                infoDisplay.textContent = `${levelName} ${currentCharacterIndex + 1}/${charactersToLearn.length} (${currentChar})`;
            }
            
            try {
                // If this is the first stroke, ensure guide character is drawn first
                if (strokeNum === 0 && hanziWriter.drawnStrokes.length === 0) {
                    // Ensure guide character is drawn on guide canvas before first stroke
                    if (hanziWriter.guideCtx && hanziWriter.strokeData.rawCharData && hanziWriter.strokeData.rawCharData.medians) {
                        hanziWriter.drawGuideCharacter();
                        // Reset stroke style
                        hanziWriter.ctx.strokeStyle = '#1C1C1C'; // Drawing color
                        // Use thinner strokes for characters with more than 10 strokes
                        hanziWriter.ctx.lineWidth = hanziWriter.totalStrokes > 10 ? 18 : 25;
                        // Small delay to ensure guide is rendered
                        await new Promise(resolve => setTimeout(resolve, 30));
                        // Set currentStrokeIndex to zero after guide is prepared
                        hanziWriter.currentStrokeIndex = 0;
                    }
                }
                
                // Draw the stroke
                hanziWriter.drawStroke(strokeNum, true); // true = animate
                
                // Mark stroke as drawn
                if (!hanziWriter.drawnStrokes.includes(strokeNum)) {
                    hanziWriter.drawnStrokes.push(strokeNum);
                }
                
                // Wait for animation to complete (check every 50ms)
                let checkCount = 0;
                const maxChecks = 200; // Maximum 10 seconds (200 * 50ms)
                function checkAnimationComplete() {
                    checkCount++;
                    if (checkCount > maxChecks) {
                        console.error('Animation check timeout - forcing completion');
                        hanziWriter.isAnimating = false;
                        // Mark stroke as drawn now that animation is complete
                        if (!hanziWriter.drawnStrokes.includes(strokeNum)) {
                            hanziWriter.drawnStrokes.push(strokeNum);
                        }
                        hanziWriter.currentStrokeIndex++;
                        updateProgressDisplay();
                        if (hanziWriter.currentStrokeIndex >= hanziWriter.totalStrokes) {
                            setTimeout(() => {
                                onCharacterCompleted();
                            }, 500);
                        }
                        return;
                    }
                    
                    if (!hanziWriter.isAnimating) {
                        // Animation completed - NOW increment the index
                        hanziWriter.currentStrokeIndex++;
                        
                        updateProgressDisplay();
                        
                        if (hanziWriter.currentStrokeIndex >= hanziWriter.totalStrokes) {
                            console.log('All strokes completed for this character');
                            setTimeout(() => {
                                onCharacterCompleted();
                            }, 500);
                        }
                    } else {
                        // Still animating, check again
                        setTimeout(checkAnimationComplete, 50);
                    }
                }
                
                // Start checking after a short delay
                setTimeout(checkAnimationComplete, 100);
                
            } catch (e) {
                console.error('Error drawing stroke:', e);
                hanziWriter.isAnimating = false;
                updateProgressDisplay();
                alert('Error drawing stroke: ' + e.message);
            }
        }

        // Function to calculate how many strokes to draw based on drag distance
        function calculateStrokesFromDragDistance(dragDistance) {
            // Default to 1 stroke if stroke data not available
            if (!hanziWriter.strokeData.initialized || !hanziWriter.strokeData.strokes) {
                return 1;
            }
            
            const currentIndex = hanziWriter.currentStrokeIndex;
            const remainingStrokes = hanziWriter.totalStrokes - currentIndex;
            
            if (remainingStrokes <= 0) {
                return 0;
            }
            
            // Calculate canvas scale to convert stroke lengths from data coordinates to screen pixels
            const canvas = hanziWriter.canvas;
            if (!canvas) {
                return 1;
            }
            
            const canvasSize = canvas.width;
            const dataWidth = 900;
            const dataHeight = 900;
            // Use thinner strokes for characters with more than 10 strokes
            const lineWidth = hanziWriter.totalStrokes > 10 ? 18 : 25;
            const strokeHalfWidth = lineWidth / 2;
            const padding = Math.max(strokeHalfWidth + 10, canvasSize * 0.1);
            const availableSize = canvasSize - (padding * 2);
            const scale = availableSize / Math.max(dataWidth, dataHeight);
            
            // Calculate cumulative lengths including distances between strokes (in screen pixels)
            // Formula: d > stroke1.length + stroke1.distanceToNext + stroke2.length + ... to draw multiple strokes
            let cumulativeLength = 0;
            let strokeCount = 0;
            
            for (let i = currentIndex; i < Math.min(currentIndex + remainingStrokes, hanziWriter.strokeData.strokes.length); i++) {
                const stroke = hanziWriter.strokeData.strokes[i];
                if (stroke && stroke.length !== null && stroke.length !== undefined) {
                    // Convert stroke length from data coordinates to screen pixels
                    const strokeLengthScreen = stroke.length * scale;
                    
                    // Calculate cumulative length including distance to this stroke
                    // Formula: d > stroke1.length + stroke1.distanceToNext + stroke2.length + ...
                    // For the first stroke: cumulative = stroke1.length
                    // For subsequent strokes: cumulative = previous + previousStroke.distanceToNext + current stroke length
                    let newCumulativeLength;
                    if (strokeCount === 0) {
                        // First stroke: just add its length
                        newCumulativeLength = strokeLengthScreen;
                    } else {
                        // Subsequent stroke: add distance from previous stroke to this one, then add current stroke length
                        const previousStroke = hanziWriter.strokeData.strokes[i - 1];
                        let distanceToNextScreen = 0;
                        if (previousStroke && previousStroke.distanceToNext !== null && previousStroke.distanceToNext !== undefined) {
                            distanceToNextScreen = previousStroke.distanceToNext * scale;
                        }
                        newCumulativeLength = cumulativeLength + distanceToNextScreen + strokeLengthScreen;
                    }
                    
                    // If drag distance is >= cumulative length including this stroke and distance to it, include it
                    if (dragDistance >= newCumulativeLength) {
                        cumulativeLength = newCumulativeLength;
                        strokeCount++;
                        // Continue to check if we can include more strokes
                    } else {
                        // Drag distance is less than cumulative length including this stroke
                        // Stop here - we've found the maximum number of strokes
                        break;
                    }
                } else {
                    // If stroke length is not available, break (default to existing strokeCount)
                    break;
                }
            }
            
            // Ensure at least 1 stroke is drawn if drag distance meets minimum
            const strokesToDraw = Math.max(1, strokeCount);
            
            // Don't draw more strokes than remaining
            return Math.min(strokesToDraw, remainingStrokes);
        }
        
        // Function to calculate angle of user movement
        function checkStrokeSimilarity(userPath, strokeIndex) {
            let result = {
                userAngle: null,
                strokeAngle: null,
                similarity: 0.5
            };
            
            if (!userPath || userPath.length < 2) {
                console.log('User path too short:', userPath ? userPath.length : 'null');
                return result;
            }
            
            // Get user movement start and end points from screen coordinates
            // Screen coordinates: (0,0) at top-left, y increases downward
            const userStart = userPath[0];
            const userEnd = userPath[userPath.length - 1];
            
            console.log('User path start:', userStart, 'User path end:', userEnd);
            console.log('User path length:', userPath.length);
            
            // Calculate direction vector (angle) - using screen coordinates
            const userDx = userEnd.x - userStart.x;
            const userDy = userEnd.y - userStart.y;
            
            console.log('User dx:', userDx, 'User dy:', userDy);
            
            // Calculate angle in radians using atan2
            // User coordinates: (0,0) at top-left, y increases downward
            result.userAngle = Math.atan2(userDy, userDx);
            
            console.log('User angle (radians):', result.userAngle);
            console.log('User angle (degrees):', result.userAngle * 180 / Math.PI);
            
            // Get stroke angle from stored stroke data
            if (hanziWriter.strokeData.initialized && hanziWriter.strokeData.strokes[strokeIndex]) {
                const storedStroke = hanziWriter.strokeData.strokes[strokeIndex];
                result.strokeAngle = storedStroke.angle;
                console.log('Stroke angle from stored data:', storedStroke.angle);
                console.log('Stroke angle (degrees):', storedStroke.angleDegrees);
            } else {
                console.log('Stroke data not initialized or stroke not found:', {
                    initialized: hanziWriter.strokeData.initialized,
                    strokeIndex: strokeIndex,
                    strokesLength: hanziWriter.strokeData.strokes ? hanziWriter.strokeData.strokes.length : 0
                });
            }
            
            return result;
        }


        // Function to check if user's drag direction matches stroke direction
        function checkDragDirection(dragStartX, dragStartY, dragEndX, dragEndY, strokeIndex) {
            // Calculate user's drag angle in degrees
            const dx = dragEndX - dragStartX;
            const dy = dragEndY - dragStartY;
            const userDragAngle = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Get the stroke's angle from strokeData
            if (!hanziWriter.strokeData.strokes || !hanziWriter.strokeData.strokes[strokeIndex]) {
                return null;
            }
            
            const stroke = hanziWriter.strokeData.strokes[strokeIndex];
            const strokeAngle = stroke.angleDegrees;
            
            if (strokeAngle === null || strokeAngle === undefined) {
                return null;
            }
            
            // Calculate the absolute difference between angles (without wrapping first)
            let rawAngleDifference = Math.abs(userDragAngle - strokeAngle);
            
            // Handle angle wrapping (e.g., -179 and 179 are actually 2 degrees apart)
            let angleDifference = rawAngleDifference;
            if (angleDifference > 180) {
                angleDifference = 360 - angleDifference;
            }
            
            // Display the angles
            console.log(`User drag degree: ${userDragAngle.toFixed(2)}°`);
            console.log(`Stroke degree: ${strokeAngle.toFixed(2)}°`);
            console.log(`Angle difference: ${angleDifference.toFixed(2)}°, Raw difference: ${rawAngleDifference.toFixed(2)}°`);
            
            // Check if perfect:
            // 1. Within 30 degrees (same direction)
            // 2. Between 170-190 degrees (opposite direction is also acceptable)
            const isOppositeDirection = (rawAngleDifference >= 170 && rawAngleDifference <= 190);
            
            if (angleDifference <= 30 || isOppositeDirection) {
                if (isOppositeDirection) {
                    console.log('perfect (opposite direction accepted)');
                } else {
                    console.log('perfect');
                }
                // Increase HP by 1 when perfect
                updateHPBar(currentHP + 1);
                // Increment perfect strokes counter
                perfectStrokesCount++;
                // Return 0 for opposite direction to avoid punishment
                return isOppositeDirection ? 0 : angleDifference;
            } else {
                console.log('not good');
                // Increment not good strokes counter
                notGoodStrokesCount++;
            }
            
            // Return the angle difference for punishment calculation
            return angleDifference;
        }

        // Function to calculate punishment based on degree difference and strokes drawn
        function calculatePunishment(angleDifference, strokeIndex, numberOfStrokesDrawn, dragDistance) {
            // Adjust angle difference for opposite direction strokes
            // If angle difference > 150°, it's close to opposite direction (180°)
            // Calculate the deviation from opposite direction instead
            let adjustedAngleDiff = angleDifference;
            if (angleDifference > 150) {
                adjustedAngleDiff = Math.abs(angleDifference - 180);
                console.log(`Opposite stroke detected: original angle diff = ${angleDifference.toFixed(2)}°, adjusted to ${adjustedAngleDiff.toFixed(2)}° (deviation from 180°)`);
            }
            
            // No punishment if within 30 degrees (using adjusted angle)
            if (adjustedAngleDiff <= 30) {
                return 0;
            }
            
            // Use adjusted angle difference for all subsequent calculations
            angleDifference = adjustedAngleDiff;
            
            // Special case: if drawing more than 5 strokes and drag is too long
            if (numberOfStrokesDrawn > 5) {
                // Calculate sum of remaining strokes
                const remainingStrokes = hanziWriter.totalStrokes - strokeIndex;
                if (hanziWriter.strokeData.strokes && remainingStrokes > 0) {
                    // Get canvas scale
                    const canvas = hanziWriter.canvas;
                    if (canvas) {
                        const canvasSize = canvas.width;
                        const dataWidth = 900;
                        const dataHeight = 900;
                        // Use thinner strokes for characters with more than 10 strokes
                        const lineWidth = hanziWriter.totalStrokes > 10 ? 18 : 25;
                        const strokeHalfWidth = lineWidth / 2;
                        const padding = Math.max(strokeHalfWidth + 10, canvasSize * 0.1);
                        const availableSize = canvasSize - (padding * 2);
                        const scale = availableSize / Math.max(dataWidth, dataHeight);
                        
                        // Calculate sum of remaining stroke lengths (in screen pixels)
                        let sumRemainingStrokes = 0;
                        for (let i = strokeIndex; i < Math.min(strokeIndex + remainingStrokes, hanziWriter.strokeData.strokes.length); i++) {
                            const stroke = hanziWriter.strokeData.strokes[i];
                            if (stroke && stroke.length) {
                                sumRemainingStrokes += stroke.length * scale;
                            }
                        }
                        
                        // Check if drag distance > 130% of sum of remaining strokes
                        if (dragDistance > sumRemainingStrokes * 1.3) {
                            const bigPunishment = numberOfStrokesDrawn * 60;
                            console.log(`BIG PUNISHMENT: ${bigPunishment} = ${numberOfStrokesDrawn} strokes × 60 (drag too long: ${dragDistance.toFixed(2)}px > 130% of ${sumRemainingStrokes.toFixed(2)}px)`);
                            return bigPunishment;
                        }
                    }
                }
            }
            
            // Check exception: if exactly 2 strokes drawn AND second stroke is less than 50% of first stroke length
            if (numberOfStrokesDrawn === 2) {
                // Get first stroke and second stroke
                if (hanziWriter.strokeData.strokes && 
                    hanziWriter.strokeData.strokes[strokeIndex] && 
                    hanziWriter.strokeData.strokes[strokeIndex + 1]) {
                    
                    const firstStroke = hanziWriter.strokeData.strokes[strokeIndex];
                    const secondStroke = hanziWriter.strokeData.strokes[strokeIndex + 1];
                    
                    if (firstStroke.length && secondStroke.length) {
                        // If second stroke is less than 50% of first stroke length, no punishment
                        if (secondStroke.length < firstStroke.length * 0.5) {
                            console.log('No punishment: second stroke is short (< 50% of first stroke)');
                            return 0;
                        }
                    }
                }
            }
            
            // Calculate punishment: (degree difference - 30) * number of strokes drawn
            const punishment = Math.abs(angleDifference - 30) * numberOfStrokesDrawn;
            console.log(`Punishment: ${punishment.toFixed(2)} = (${angleDifference.toFixed(2)}° - 30°) × ${numberOfStrokesDrawn} strokes`);
            
            return punishment;
        }

        // Add drag/touch detection anywhere on the page - any drag/touch draws next stroke
        function initDragDetection() {
            let isDragging = false;
            let hasTriggered = false; // Prevent multiple triggers from same drag
            let startX = 0;
            let startY = 0;
            let dragPath = []; // Track all points during drag to calculate total distance

            function getEventCoordinates(e) {
                // Handle both mouse and touch events
                if (e.touches && e.touches.length > 0) {
                    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
                } else if (e.changedTouches && e.changedTouches.length > 0) {
                    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
                } else {
                    return { x: e.clientX, y: e.clientY };
                }
            }
            
            // Calculate total distance along the drag path (including all turns)
            function calculateTotalDragDistance(path) {
                if (!path || path.length < 2) {
                    return 0;
                }
                
                let totalDistance = 0;
                for (let i = 1; i < path.length; i++) {
                    const prevPoint = path[i - 1];
                    const currPoint = path[i];
                    const dx = currPoint.x - prevPoint.x;
                    const dy = currPoint.y - prevPoint.y;
                    const segmentDistance = Math.sqrt(dx * dx + dy * dy);
                    totalDistance += segmentDistance;
                }
                
                return totalDistance;
            }

            function handleStart(e) {
                // Check if level selection overlay is visible
                const levelSelectionOverlay = document.getElementById('level-selection-overlay');
                if (levelSelectionOverlay && !levelSelectionOverlay.classList.contains('hidden')) {
                    return; // Don't handle drag if level selection is visible
                }
                
                // Check if game over overlay is visible
                const gameOverOverlay = document.getElementById('game-over-overlay');
                if (gameOverOverlay && !gameOverOverlay.classList.contains('hidden')) {
                    return; // Don't handle drag if game over is visible
                }
                
                // Check if level complete overlay is visible
                const levelCompleteOverlay = document.getElementById('level-complete-overlay');
                if (levelCompleteOverlay && !levelCompleteOverlay.classList.contains('hidden')) {
                    return; // Don't handle drag if level complete is visible
                }
                
                // Don't trigger on button clicks, UI elements, or overlay screens
                if (e.target && (
                    e.target.id === 'next-stroke-btn' || 
                    (e.target.closest && e.target.closest('#next-stroke-btn')) ||
                    e.target.id === 'music-toggle' ||
                    (e.target.closest && e.target.closest('#music-toggle')) ||
                    (e.target.closest && e.target.closest('.music-control')) ||
                    e.target.id === 'voice-btn' ||
                    (e.target.closest && e.target.closest('#voice-btn'))
                )) {
                    return;
                }
                // Prevent text selection during drag
                e.preventDefault();
                const coords = getEventCoordinates(e);
                startX = coords.x;
                startY = coords.y;
                // Initialize drag path with start point
                dragPath = [{ x: startX, y: startY }];
                isDragging = true;
                hasTriggered = false;
            }

            function handleMove(e) {
                if (!isDragging) return;
                e.preventDefault();
                // Track intermediate points during drag
                const coords = getEventCoordinates(e);
                dragPath.push({ x: coords.x, y: coords.y });
            }

            async function handleEnd(e) {
                // Check if level selection overlay is visible
                const levelSelectionOverlay = document.getElementById('level-selection-overlay');
                if (levelSelectionOverlay && !levelSelectionOverlay.classList.contains('hidden')) {
                    isDragging = false;
                    return; // Don't handle drag if level selection is visible
                }
                
                // Check if game over overlay is visible
                const gameOverOverlay = document.getElementById('game-over-overlay');
                if (gameOverOverlay && !gameOverOverlay.classList.contains('hidden')) {
                    isDragging = false;
                    return; // Don't handle drag if game over is visible
                }
                
                // Check if level complete overlay is visible
                const levelCompleteOverlay = document.getElementById('level-complete-overlay');
                if (levelCompleteOverlay && !levelCompleteOverlay.classList.contains('hidden')) {
                    isDragging = false;
                    return; // Don't handle drag if level complete is visible
                }
                
                // Don't trigger on button clicks or UI elements
                if (e.target && (
                    e.target.id === 'next-stroke-btn' || 
                    (e.target.closest && e.target.closest('#next-stroke-btn')) ||
                    e.target.id === 'music-toggle' ||
                    (e.target.closest && e.target.closest('#music-toggle')) ||
                    (e.target.closest && e.target.closest('.music-control')) ||
                    e.target.id === 'voice-btn' ||
                    (e.target.closest && e.target.closest('#voice-btn'))
                )) {
                    isDragging = false;
                    return;
                }
                
                if (!isDragging || hasTriggered) {
                    isDragging = false;
                    hasTriggered = false;
                    return;
                }
                
                // Get end coordinates and add to path
                const coords = getEventCoordinates(e);
                const endX = coords.x;
                const endY = coords.y;
                
                // Add end point to drag path
                if (dragPath.length === 0 || 
                    dragPath[dragPath.length - 1].x !== endX || 
                    dragPath[dragPath.length - 1].y !== endY) {
                    dragPath.push({ x: endX, y: endY });
                }
                
                // Check if game is over
                if (isGameOver) {
                    isDragging = false;
                    hasTriggered = false;
                    dragPath = [];
                    return;
                }
                
                // Calculate total drag distance along the path (including all turns)
                const dragDistance = calculateTotalDragDistance(dragPath);
                
                // Calculate minimum drag distance as 80% of first stroke length
                let minDragDistance = 30; // Default fallback
                if (hanziWriter && hanziWriter.strokeData && hanziWriter.strokeData.initialized && hanziWriter.strokeData.strokes) {
                    const currentStroke = hanziWriter.strokeData.strokes[hanziWriter.currentStrokeIndex];
                    if (currentStroke && currentStroke.length !== null && currentStroke.length !== undefined) {
                        // Calculate canvas scale to convert stroke length to screen pixels
                        const canvas = hanziWriter.canvas;
                        if (canvas) {
                            const canvasSize = canvas.width;
                            const dataWidth = 900;
                            const dataHeight = 900;
                            const lineWidth = hanziWriter.totalStrokes > 10 ? 18 : 25;
                            const strokeHalfWidth = lineWidth / 2;
                            const padding = Math.max(strokeHalfWidth + 10, canvasSize * 0.1);
                            const availableSize = canvasSize - (padding * 2);
                            const scale = availableSize / Math.max(dataWidth, dataHeight);
                            
                            // Convert first stroke length to screen pixels and take 80%
                            const firstStrokeLengthScreen = currentStroke.length * scale;
                            minDragDistance = firstStrokeLengthScreen * 0.8;
                        }
                    }
                }
                
                // Only proceed if drag distance is greater than minimum threshold (80% of first stroke length)
                if (dragDistance < minDragDistance) {
                    isDragging = false;
                    hasTriggered = false;
                    dragPath = []; // Reset drag path
                    return;
                }
                
                // Check if we can draw
                if (hanziWriter.isAnimating) {
                    isDragging = false;
                    hasTriggered = false;
                    dragPath = []; // Reset drag path
                    return;
                }
                
                if (!hanziWriter.canvas || !hanziWriter.ctx) {
                    isDragging = false;
                    hasTriggered = false;
                    dragPath = []; // Reset drag path
                    return;
                }
                
                // Check drag direction against current stroke direction
                const angleDifference = checkDragDirection(startX, startY, endX, endY, hanziWriter.currentStrokeIndex);
                
                // Calculate how many strokes to draw based on drag distance vs stroke lengths
                const strokesToDraw = calculateStrokesFromDragDistance(dragDistance);
                
                // Calculate punishment if we have a valid angle difference
                if (angleDifference !== null) {
                    const punishment = calculatePunishment(angleDifference, hanziWriter.currentStrokeIndex, strokesToDraw, dragDistance);
                    const hpDeduction = punishmentToHPDeduction(punishment);
                    if (hpDeduction > 0) {
                        applyDamage(hpDeduction);
                    }
                }
                
                hasTriggered = true;
                
                // Draw the calculated number of strokes
                const startStrokeIndex = hanziWriter.currentStrokeIndex;
                const targetStrokeIndex = Math.min(startStrokeIndex + strokesToDraw, hanziWriter.totalStrokes);
                
                for (let targetIndex = startStrokeIndex; targetIndex < targetStrokeIndex; targetIndex++) {
                    // Wait for animation to complete and index to catch up
                    while (hanziWriter.isAnimating || hanziWriter.currentStrokeIndex < targetIndex) {
                        await new Promise(resolve => setTimeout(resolve, 50));
                    }
                    
                    // Double check we haven't completed all strokes
                    if (hanziWriter.currentStrokeIndex >= hanziWriter.totalStrokes) {
                        break;
                    }
                    
                    // Ensure we're drawing the correct stroke index
                    if (hanziWriter.currentStrokeIndex !== targetIndex) {
                        hanziWriter.currentStrokeIndex = targetIndex;
                    }
                    
                    await drawNextStroke();
                    
                    // If we've completed all strokes for this character, break
                    if (hanziWriter.currentStrokeIndex >= hanziWriter.totalStrokes) {
                        break;
                    }
                }
                
                isDragging = false;
                dragPath = []; // Reset drag path for next drag
                e.preventDefault();
            }

            // Mouse events
            document.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('mouseleave', handleEnd);

            // Touch events
            document.addEventListener('touchstart', handleStart, { passive: false });
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd, { passive: false });
            document.addEventListener('touchcancel', handleEnd, { passive: false });
        }

        // Start when page loads - only initialize drag detection
        // initializeApp() already handles canvas initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                initDragDetection();
            });
        } else {
            initDragDetection();
        }

