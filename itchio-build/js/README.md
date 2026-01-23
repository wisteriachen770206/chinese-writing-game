# JavaScript Modules Documentation

## Overview

The game's JavaScript code is organized into focused modules for better maintainability.

## Module Loading Order

```html
1. game-state.js      → Global state variables
2. timer.js           → Timer functionality
3. hp-system.js       → HP management
4. auth.js            → Authentication & save/load
5. ui-manager.js      → UI interactions
6. game.js            → Core game logic & HanziWriter
```

**Important**: Modules must be loaded in this order due to dependencies.

## Module Details

### 1. game-state.js (Foundation)
**Purpose**: Centralized state management

**Exports**:
```javascript
// Character state
let charactersToLearn = [];
let currentCharacterIndex = 0;
let character = '';

// Game state
let maxHP = 100;
let currentHP = 100;
let isGameOver = false;

// Level state
let levelConfig = null;
let currentLevel = null;

// Score state
let perfectStrokesCount = 0;
let notGoodStrokesCount = 0;

// Auth state
let currentUser = null;

// HanziWriter instance
let hanziWriter = null;
```

### 2. timer.js
**Purpose**: Game timer management

**Functions**:
- `startTimer()` - Start the level timer
- `stopTimer()` - Stop the timer
- `resetTimer()` - Reset timer to 00:00
- `updateTimerDisplay()` - Update DOM with current time
- `formatTime(seconds)` - Format seconds as MM:SS

**Usage**:
```javascript
startTimer();  // Begins counting
stopTimer();   // Stops counting
const time = formatTime(125);  // "2:05"
```

### 3. hp-system.js
**Purpose**: HP bar and damage system

**Functions**:
- `updateHPBar(newHP)` - Update HP bar (auto game-over check)
- `showGameOver()` - Display game over screen
- `restartGame()` - Restart from level selection
- `applyDamage(damage)` - Apply damage and update HP
- `resetHP()` - Reset HP to maximum
- `punishmentToHPDeduction(punishment)` - Convert punishment score to HP loss

**Usage**:
```javascript
applyDamage(10);  // Reduce HP by 10
resetHP();        // Restore to full HP
```

### 4. auth.js
**Purpose**: User authentication and progress saving

**Functions**:

**Auth**:
- `showAuthModal()` - Show login modal
- `hideAuthModal()` - Hide login modal
- `simulateGoogleLogin()` - Demo login (development)
- `onUserLogin(user)` - Handle successful login
- `handleLogout()` - Logout user
- `updateUserInfoDisplay(user)` - Update UI with user info

**Save/Load**:
- `saveGameProgress()` - Save current progress to localStorage
- `loadGameProgress()` - Load saved progress
- `saveCharacterIndex(index)` - Save character progress
- `loadSavedCharacterIndex()` - Load character progress

**Utilities**:
- `parseJwt(token)` - Parse JWT tokens (for Google auth)

**Usage**:
```javascript
// Demo login
simulateGoogleLogin();

// Save progress
saveGameProgress();

// Load progress  
const progress = loadGameProgress();
```

### 5. ui-manager.js
**Purpose**: UI interactions and visual feedback

**Functions**:

**Notifications**:
- `showToast(title, message, icon, duration)` - Show toast notification

**Audio**:
- `playCompletionSound()` - Play success sound effect
- `initMusicControl()` - Initialize background music toggle
- `initVoiceButton()` - Initialize text-to-speech button

**Mobile**:
- `initTopBarAutoHide()` - Auto-hide top bar on mobile

**Thumbnails**:
- `generateCharacterThumbnail(char, data)` - Create character thumbnail
- `addThumbnailToContainer(char, imageUrl)` - Add thumbnail to grid
- `updateContainerWidth()` - Update grid width
- `loadPreviousCharactersThumbnails(startIndex)` - Load thumbnail history

**Usage**:
```javascript
// Show success message
showToast('Success!', 'Level complete', '🎉', 3000);

// Generate thumbnail
const thumb = generateCharacterThumbnail('中', charData);
addThumbnailToContainer('中', thumb);

// Initialize on app load
initMusicControl();
initVoiceButton();
initTopBarAutoHide();
```

### 6. game.js (Core)
**Purpose**: Main game logic, level management, HanziWriter class

**Major Components**:
- `newHanziWriter` class - Character drawing and validation
- Level loading and selection
- Character data management
- App initialization
- Canvas rendering
- Stroke validation

**Key Functions**:
- `loadLevelConfig()` - Load level configuration
- `displayLevelSelection(searchQuery)` - Show level grid
- `startLevel(levelId)` - Start a specific level
- `onLevelComplete()` - Handle level completion
- `calculateLevelScore()` - Calculate performance score
- `initializeApp()` - Initialize application
- `initPage()` - Page initialization

## Dependency Graph

```
game-state.js (no dependencies)
    ↓
timer.js (uses: timerElapsedSeconds, timerStartTime, timerInterval)
    ↓
hp-system.js (uses: currentHP, maxHP, isGameOver, stopTimer)
    ↓
auth.js (uses: currentUser, currentLevel, timerElapsedSeconds, showToast)
    ↓
ui-manager.js (uses: character, charactersToLearn, loadCharacterDataFromStructure)
    ↓
game.js (uses: ALL above + adds HanziWriter, levels, initialization)
```

## Development Guidelines

### Adding New Functionality

1. **Identify the right module**:
   - Timer-related → `timer.js`
   - HP/damage → `hp-system.js`
   - UI feedback → `ui-manager.js`
   - Save/load → `auth.js`
   - Game logic → `game.js`

2. **Follow naming conventions**:
   - Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`
   - Global state: `camelCase` with `let`

3. **Keep modules focused**:
   - Each module should have a single responsibility
   - Avoid circular dependencies

### Testing Individual Modules

```javascript
// Test timer
startTimer();
console.log('Timer started');
setTimeout(() => {
    stopTimer();
    console.log('Elapsed:', timerElapsedSeconds);
}, 5000);

// Test HP
resetHP();
applyDamage(25);
console.log('Current HP:', currentHP);

// Test toast
showToast('Test', 'This is a test notification', '🧪');
```

## Future Improvements

1. **ES6 Modules**: Convert to `import`/`export` syntax
2. **TypeScript**: Add type safety
3. **Build System**: Use Vite or Webpack for bundling
4. **Further Splitting**: Break down `game.js` into smaller modules
5. **Unit Tests**: Add Jest/Vitest for testing individual functions

## Troubleshooting

**Issue**: Functions undefined
- **Solution**: Check script load order in `index.html`

**Issue**: Variables not updating
- **Solution**: Verify you're modifying global state, not local copies

**Issue**: Duplicate declarations
- **Solution**: Remove old declarations from `game.js` if they exist in modules

## Backup

Original monolithic file: `game-original.js.bak` (3,221 lines)

To restore original:
```bash
cp js/game-original.js.bak js/game.js
# Remove module script tags from index.html
```
