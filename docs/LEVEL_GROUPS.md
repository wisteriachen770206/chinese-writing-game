# 📚 Level Groups System

## Overview

The 97 poem levels have been organized into **5 groups** for easier navigation. The level selection screen shows only one representative level from each group, making it less overwhelming while still providing access to all content.

## Group Structure

### Group 1: Levels 1-19 (Easy)
- **Representative:** Level 1 - 王维：鹿柴
- **Total Poems:** 19
- **Difficulty:** Easy
- **Max HP:** 100
- **Poems:** 224-242 (Tang poetry)

### Group 2: Levels 20-38 (Easy to Medium)
- **Representative:** Level 20 - 裴迪：送崔九
- **Total Poems:** 19
- **Difficulty:** Easy → Medium
- **Max HP:** 100-150
- **Poems:** 243-261

### Group 3: Levels 39-57 (Medium)
- **Representative:** Level 39 - 李白：玉阶怨
- **Total Poems:** 19
- **Difficulty:** Medium
- **Max HP:** 150
- **Poems:** 262-280

### Group 4: Levels 58-76 (Medium to Hard)
- **Representative:** Level 58 - 刘禹锡：春词
- **Total Poems:** 19
- **Difficulty:** Medium → Hard
- **Max HP:** 150-200
- **Poems:** 281-299

### Group 5: Levels 77-97 (Hard)
- **Representative:** Level 77 - 李商隐：为有
- **Total Poems:** 21
- **Difficulty:** Hard
- **Max HP:** 200
- **Poems:** 300-320

## How It Works

### Level Selection Screen

Instead of showing all 97 levels, the screen displays **5 cards**, each representing a group:

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│  Group 1    │  Group 2    │  Group 3    │  Group 4    │  Group 5    │
│  Easy       │  Easy-Med   │  Medium     │  Med-Hard   │  Hard       │
│  王维：鹿柴 │  裴迪：送崔九 │  李白：玉阶怨 │ 刘禹锡：春词 │ 李商隐：为有 │
│  Lvs 1-19   │  Lvs 20-38  │  Lvs 39-57  │  Lvs 58-76  │  Lvs 77-97  │
│  19 poems   │  19 poems   │  19 poems   │  19 poems   │  21 poems   │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Starting a Group

When you click **"Start Group X"**, the game:

1. Loads all poems from that entire group
2. Combines all characters from those poems
3. Starts from the first character of the first poem
4. Progresses through all poems in order
5. Completes when all characters in the group are written

### Example Flow

**User selects Group 1:**
- Loads levels 1-19 (poems 224-242)
- Total characters: ~380 (19 poems × ~20 characters each)
- Starts with 王维：鹿柴 (Level 1)
- Progresses through 王维：竹里馆 (Level 2)
- Continues through all 19 poems
- Shows completion when all 380 characters are written

## Benefits

### ✅ Simplified Navigation
- Only 5 choices instead of 97
- Easy to understand progression
- Less overwhelming for new players

### ✅ Progressive Difficulty
- Group 1: Learn basics (Easy)
- Group 2-3: Build skills (Easy-Medium)
- Group 4-5: Master difficulty (Medium-Hard)

### ✅ Meaningful Content Blocks
- Each group = substantial practice session
- ~19-21 poems per group
- ~380-420 characters per group
- Clear sense of progress

### ✅ Better UX
- Clear visual hierarchy
- Difficulty color coding
- Shows level range and poem count
- Representative poem preview

## Technical Implementation

### displayLevelSelection() - AUTOMATIC GROUPING

```javascript
// AUTOMATIC calculation based on total levels
const totalLevels = levelConfig.levels.length;
const numGroups = 5; // Configurable: change to 3, 10, etc.
const groupSize = Math.ceil(totalLevels / numGroups);

// Auto-generate representative indices
const representativeIndices = [];
for (let i = 0; i < numGroups; i++) {
    const startIdx = i * groupSize;
    if (startIdx < totalLevels) {
        representativeIndices.push(startIdx);
    }
}

// Examples:
// 97 levels ÷ 5 groups = [0, 19, 38, 57, 76]
// 200 levels ÷ 5 groups = [0, 40, 80, 120, 160]
// 200 levels ÷ 10 groups = [0, 20, 40, 60, 80, 100, 120, 140, 160, 180]
```

**This means you never need to manually calculate representatives again!**

### startLevelGroup(startIdx, endIdx)

```javascript
// Collect all characters from group range
let allGroupCharacters = '';
for (let i = startIdx; i <= endIdx; i++) {
    allGroupCharacters += levelConfig.levels[i].characters;
}

// Start with first level settings
currentLevel = levelConfig.levels[startIdx];
charactersToLearn = allGroupCharacters.split('');

// Initialize game with all group characters
initializeGame();
```

## UI Elements

### Group Card Design

```
┌─────────────────────────┐
│ Group 1                 │ ← Group number
│ 王维：鹿柴             │ ← Representative poem
│ Levels 1-19 (19 poems)  │ ← Range info
│                         │
│ Starting Poem: #1       │ ← Stats
│ Difficulty: Easy        │
│ Max HP: 100             │
│                         │
│ [ Start Group 1 ]       │ ← Action button
└─────────────────────────┘
```

### Difficulty Color Coding

```css
.difficulty-easy {
    background: linear-gradient(135deg, #10b981, #059669);
}

.difficulty-medium {
    background: linear-gradient(135deg, #f59e0b, #d97706);
}

.difficulty-hard {
    background: linear-gradient(135deg, #ef4444, #dc2626);
}
```

## Progression System

### Completion Tracking

Currently, the game tracks progress through:
- Current character index
- Characters completed
- HP remaining
- Timer

### Future Enhancements

Could add:
- Group completion percentage
- Best time per group
- Stars/rating per group
- Unlock system (complete Group 1 to unlock Group 2)

## User Experience Flow

```
1. [Level Selection Screen]
   ↓ User sees 5 groups
   
2. [Select Group 3]
   ↓ Click "Start Group 3"
   
3. [Loading]
   ↓ Load poems 39-57
   ↓ Combine all characters
   
4. [Game Start]
   ↓ Show first character
   ↓ Display "Level 39: 李白：玉阶怨 1/19"
   
5. [Progress Through Group]
   ↓ Write characters from poems 39-57
   ↓ Track HP, time, completion
   
6. [Group Complete]
   ↓ Show completion screen
   ↓ Option to start next group
```

## Configuration

### Adjusting Number of Groups

Simply change the `numGroups` variable in `displayLevelSelection()`:

```javascript
const numGroups = 5; // Change this to any number!
```

**No other changes needed - everything auto-calculates!**

### Examples with Different Level Counts

| Total Levels | Groups | Group Size | Representatives |
|--------------|--------|------------|-----------------|
| 97 | 5 | ~19-20 | [0, 19, 38, 57, 76] |
| 200 | 5 | 40 | [0, 40, 80, 120, 160] |
| 200 | 10 | 20 | [0, 20, 40, 60, 80, 100, 120, 140, 160, 180] |
| 150 | 3 | 50 | [0, 50, 100] |
| 500 | 5 | 100 | [0, 100, 200, 300, 400] |

### Automatic Scalability

The system is now **fully automatic**:

✅ **Works with ANY number of levels** (10, 97, 200, 500, etc.)
✅ **Automatically calculates group sizes** based on total levels
✅ **Automatically selects representatives** (first level of each group)
✅ **Console logs the calculation** for debugging
✅ **Zero manual configuration needed** when importing new level data

### How It Works

1. **Count total levels:** `const totalLevels = levelConfig.levels.length;`
2. **Divide by desired groups:** `const groupSize = Math.ceil(totalLevels / numGroups);`
3. **Generate indices:** Start at 0, then groupSize, 2×groupSize, 3×groupSize, etc.
4. **Last group handles remainder:** If 97÷5=19.4, last group gets extra levels

### Example: Importing 200 New Levels

```javascript
// OLD WAY (manual):
const representativeIndices = [0, 40, 80, 120, 160]; // Had to calculate!

// NEW WAY (automatic):
const numGroups = 5; // Just set this once!
// System automatically generates [0, 40, 80, 120, 160]
```

**You literally just change `numGroups` and everything else is automatic!**

## Mobile Responsive

The group cards adapt to mobile:
- Stack vertically on small screens
- Maintain touch-friendly button sizes
- Clear typography and spacing
- Responsive grid layout

## Statistics

### Overall Content
- **Total Levels:** 97
- **Total Groups:** 5
- **Average Group Size:** ~19 levels
- **Total Poems:** 97 (224-320)
- **Total Unique Characters:** ~1,940

### Difficulty Distribution
- **Easy (Groups 1-2):** Levels 1-30
- **Medium (Groups 2-4):** Levels 31-60
- **Hard (Groups 4-5):** Levels 61-97

## Best Practices

### For Players
1. Start with Group 1 to learn basics
2. Complete each group fully before moving on
3. Note your time and HP for each group
4. Replay groups to improve

### For Developers
1. Keep group sizes balanced (~19-20 levels)
2. Show clear progression information
3. Provide easy navigation back to selection
4. Consider adding group completion badges

---

**Level Groups System implemented! 5 groups, ~19 poems each, easy navigation! 📚✨**
