# 🎮 CrazyGames Build Instructions

## Quick Start

### Option 1: PowerShell Script (Recommended)

```powershell
.\build-crazygames.ps1
```

This will:
1. ✅ Create a clean build folder
2. ✅ Copy only necessary files
3. ✅ Generate a timestamped ZIP file
4. ✅ Show file size and location
5. ✅ Clean up temporary files

### Option 2: Manual Build

If the script doesn't work, manually:

1. Create folder `crazygames-build/`
2. Copy these files:
   ```
   index.html
   level_config.json
   css/styles.css
   js/*.js (7 files)
   data/all_strokes.json
   data/graphics.txt
   res/*.jpg
   res/*.mp3
   ```
3. Compress `crazygames-build/` to ZIP
4. Upload to CrazyGames

## Files Included in Build

### HTML & Config
- `index.html` - Main game page
- `level_config.json` - 224 level configurations

### CSS
- `css/styles.css` - All game styles

### JavaScript (7 files)
- `js/auth.js` - CrazyGames user system
- `js/game.js` - Core game logic
- `js/game-state.js` - Global state management
- `js/hanzi-writer.js` - Character writing library
- `js/hp-system.js` - HP & damage system
- `js/ui-manager.js` - UI & settings
- `js/crazygames-integration.js` - CrazyGames SDK

### Data
- `data/all_strokes.json` - Stroke data for 224 characters
- `data/graphics.txt` - Graphics configuration

### Resources
- `res/guanyin.jpg` - Background image
- `res/heart-sutra-wiki.mp3` - Background music
- `res/XJ0106.mp3` - Audio track

## Files EXCLUDED (Not needed for production)

```
❌ .git/
❌ .gitignore
❌ node_modules/
❌ package.json
❌ package-lock.json
❌ scripts/ (Python scripts)
❌ docs/ (Documentation)
❌ *.md (Markdown files)
❌ *.txt (Debug/temp files)
❌ test.html
```

## Expected ZIP Size

**~2-5 MB** (mostly MP3 files and JSON data)

CrazyGames limit: 500 MB, so you have plenty of room! 🎉

## Troubleshooting

### PowerShell Script Blocked

If you get "execution policy" error:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the script again.

### Manual ZIP Creation

If script fails:
1. Copy files to `crazygames-build/` manually
2. Right-click → "Send to" → "Compressed (zipped) folder"

## Upload to CrazyGames

1. Go to https://developer.crazygames.com/
2. Create new game / update existing
3. Upload the generated ZIP file
4. Fill in game metadata (title, description, screenshots)
5. Submit for review

## Next Steps After Upload

1. ✅ Test on CrazyGames QA environment
2. ✅ Check SDK integration (ads, user system)
3. ✅ Verify mobile responsiveness
4. ✅ Test all 224 levels
5. ✅ Ensure audio works
6. ✅ Check save/load functionality

---

**Ready to publish!** 🚀
