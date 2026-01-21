# 📤 CrazyGames Upload Instructions

## 🔨 Step 1: Build the Game

Run the build script:

```powershell
.\build-crazygames.ps1
```

This creates a `crazygames-build\` folder with all necessary files.

## 📁 Build Folder Structure

After running the script, your `crazygames-build\` folder contains:

```
crazygames-build/
├── index.html                  (Main entry point)
├── level_config.json          (224 levels)
├── css/
│   └── styles.css
├── js/
│   ├── auth.js
│   ├── game.js
│   ├── game-state.js
│   ├── hanzi-writer.js
│   ├── hp-system.js
│   ├── ui-manager.js
│   └── crazygames-integration.js
├── data/
│   ├── all_strokes.json
│   └── graphics.txt
└── res/
    ├── guanyin.jpg
    ├── heart-sutra-wiki.mp3
    └── XJ0106.mp3
```

## 🚀 Step 2: Upload to CrazyGames

### Method 1: Via Developer Portal (Web Upload)

1. **Go to**: https://developer.crazygames.com/
2. **Login** with your CrazyGames developer account
3. **Click** "Upload Game" or "Update Game"
4. **Select Upload Method**: "Upload Folder" or "Upload Files"
5. **Upload** the entire `crazygames-build\` folder
6. **Verify** that `index.html` is at the root level

### Method 2: Via Git/Repository (if available)

1. Push the `crazygames-build\` folder to your repository
2. Connect your repository to CrazyGames
3. Select the build folder path

## ✅ Verification Checklist

Before submitting, verify:

- [ ] `index.html` is at the root of upload
- [ ] All 7 JavaScript files are present in `js/` folder
- [ ] CSS file exists in `css/` folder
- [ ] JSON files exist in `data/` folder
- [ ] Audio/image files exist in `res/` folder
- [ ] Total size is under 500 MB (~3-5 MB expected)
- [ ] No unnecessary files (no .md, .py, docs/, etc.)

## 📝 Game Metadata (Fill in CrazyGames Portal)

### Basic Information
- **Title**: Chinese Character Learning Game
- **Short Description**: Learn to write 224 Chinese characters stroke by stroke
- **Category**: Educational / Puzzle
- **Language**: Chinese (Simplified) + English UI

### Detailed Description

```
Master Chinese character writing with this educational game featuring 224 characters from the Heart Sutra!

FEATURES:
✅ 224 levels - Progressive difficulty
✅ Stroke-by-stroke guidance
✅ HP system with instant feedback
✅ Mobile & Desktop responsive
✅ Beautiful background music
✅ CrazyGames account integration
✅ Progress saving
✅ Revival system with rewarded ads

LEARN BY DOING:
Write each character following the correct stroke order. Perfect strokes earn bonus HP, mistakes cost HP. Can you master all 224 characters?
```

### Tags (Choose relevant)
- chinese
- educational
- learning
- writing
- hanzi
- characters
- puzzle
- brain
- skill
- practice

### Screenshots Needed

Take screenshots of:
1. **Level Selection Screen** (main menu with 224 levels)
2. **Gameplay** (showing character being written)
3. **Level Complete** (with stats and time)
4. **Mobile View** (showing responsive design)

Recommended sizes: 1280x720 or 1920x1080

### Thumbnail

Create a 512x512 thumbnail showing:
- A Chinese character (e.g., 心)
- Game title
- "224 Levels" text
- Colorful, eye-catching design

## 🧪 Testing on CrazyGames QA

After upload, CrazyGames will provide a QA link. Test:

1. **SDK Integration**
   - Check browser console for "CrazyGames SDK initialized"
   - Verify user system works (sign in / guest mode)
   - Test rewarded ad for revival

2. **Gameplay**
   - Play through 5-10 levels
   - Test on mobile and desktop
   - Verify stroke detection works
   - Check HP system
   - Test game over and revival

3. **Performance**
   - Check loading time (should be < 5 seconds)
   - Verify no lag during gameplay
   - Test audio playback

4. **Save System**
   - Complete a level and save
   - Refresh page
   - Verify progress loads correctly

## 🐛 Common Issues & Solutions

### Issue: "index.html not found"
**Solution**: Make sure `index.html` is at the root of the upload, not in a subfolder.

### Issue: "SDK initialization failed"
**Solution**: CrazyGames will inject the SDK. Test on their QA environment, not locally.

### Issue: "Audio not playing"
**Solution**: User interaction required. Audio plays after user clicks/taps (browser policy).

### Issue: "Stroke detection not working on mobile"
**Solution**: Already fixed with touch-action CSS and event handling.

## 📧 Support

If you encounter issues during upload:
- Contact CrazyGames support via developer portal
- Check CrazyGames documentation: https://docs.crazygames.com/
- Verify all SDK integration is correct

---

**Good luck with your game submission!** 🎮🚀
