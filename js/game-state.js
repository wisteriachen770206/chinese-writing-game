// ============================================
// GLOBAL GAME STATE
// ============================================
console.log('✅ game-state.js loaded');

// Character learning mode - all characters from ToWriteText.txt
let charactersToLearn = []; // Will be populated from all_strokes.json
let currentCharacterIndex = 0;
let character = '';
let appInitialized = false; // Track if app has been initialized
let isCompletingCharacter = false; // Prevent duplicate calls to onCharacterCompleted

// LocalStorage key for saving progress
const STORAGE_KEY = 'hanziWriter_currentCharacterIndex';

// HP Bar system
let maxHP = 100;
let currentHP = 100;
let isGameOver = false;

// Score tracking system
let perfectStrokesCount = 0;
let notGoodStrokesCount = 0;

// Level system
let levelConfig = null;
let currentLevel = null;

// Authentication system
let currentUser = null;

// All characters stroke data loaded from all_strokes.json
let allCharactersData = {};

// List to store first 5 characters in new structure
let first5CharactersInNewStructure = [];

// Global HanziWriter instance
let hanziWriter = null;
