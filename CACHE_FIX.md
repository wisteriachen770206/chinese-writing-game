# 🔧 Browser Cache Fix

If you see "characters not found" errors after updating the game, your browser is using cached (old) versions of the data files.

## Quick Fix Methods

### Method 1: Hard Refresh (Fastest)
**Windows/Linux:**
- Chrome/Edge/Firefox: `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Chrome/Edge: `Cmd + Shift + R`
- Safari: `Cmd + Option + R`
- Firefox: `Cmd + Shift + R`

### Method 2: Clear Cache in Browser

**Chrome/Edge:**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Firefox:**
1. Press `Ctrl + Shift + Delete` (Windows) or `Cmd + Shift + Delete` (Mac)
2. Select "Cached Web Content"
3. Click "Clear Now"

**Safari:**
1. Press `Cmd + Option + E`
2. Reload the page

### Method 3: Incognito/Private Mode
1. Open browser in incognito/private mode
2. Visit your game URL
3. This always loads fresh data

### Method 4: DevTools Disable Cache
1. Press `F12` to open DevTools
2. Go to "Network" tab
3. Check "Disable cache" option
4. Keep DevTools open while testing

## For Developers

The game now includes automatic cache-busting:
- Files load with timestamp parameter: `all_strokes.json?v=1234567890`
- This forces browsers to fetch the latest version
- No manual cache clearing needed in future updates

## If Problem Persists

1. **Check the actual file was updated:**
   ```bash
   # Windows PowerShell
   Get-Content all_strokes.json -First 10
   
   # Mac/Linux
   head -n 10 all_strokes.json
   ```

2. **Verify file size is correct:**
   ```bash
   # PowerShell
   (Get-Item all_strokes.json).Length / 1MB
   
   # Mac/Linux
   ls -lh all_strokes.json
   ```
   Should be around 1-2 MB

3. **Check browser console (F12):**
   - Look for 404 errors
   - Verify JSON loaded successfully
   - Check character list in console

4. **Restart your local server:**
   ```bash
   # Stop current server (Ctrl+C)
   # Start again
   python -m http.server 8000
   ```

## Prevention for GitHub Pages

When deploying to GitHub Pages, browser caching is automatically managed. However:

1. **After pushing updates:**
   - Wait 1-3 minutes for deployment
   - Clear your browser cache
   - The cache-busting code will handle future updates

2. **Share with users:**
   - Tell them to do a hard refresh on first visit after updates
   - The timestamp parameter ensures they get latest data

## Technical Details

The game now uses:
```javascript
fetch(`all_strokes.json?v=${Date.now()}`)
```

This appends a unique timestamp to each request, forcing browsers to bypass cache and fetch the latest version.

---

**Quick Tip:** When testing locally, always keep DevTools open with "Disable cache" checked!
