# Mobile Save Progress Troubleshooting

## How Save Works on Mobile

The game now **automatically saves** your progress when you complete a level. No manual login or save button needed!

### What Happens Automatically:

1. ✅ You complete a level
2. ✅ Demo user is auto-created (first time only)
3. ✅ Progress is saved to your browser's storage
4. ✅ "Progress auto-saved!" message appears
5. ✅ Continue button appears for next level

## If Save is Not Working

### Check 1: Browser Storage Settings

Some mobile browsers have restrictions on localStorage. Check:

**iOS Safari:**
- Settings → Safari → Advanced → Website Data
- Make sure "Block All Cookies" is OFF
- Enable "Prevent Cross-Site Tracking" but allow storage for your site

**Android Chrome:**
- Settings → Site Settings → Cookies
- Allow cookies for the site
- Make sure "Block third-party cookies" doesn't block your site

**iOS Chrome/Firefox:**
- May have stricter privacy settings
- Try using Safari instead for better compatibility

### Check 2: Private/Incognito Mode

⚠️ **Private browsing mode does NOT save progress**
- Data is cleared when you close the tab
- Use normal browsing mode to save progress

### Check 3: Storage Full

If you see "Storage full" error:
1. Clear browser cache: Settings → Safari/Chrome → Clear History
2. Delete unused data: Settings → General → iPhone Storage
3. Try again

### Check 4: Browser Version

Make sure your browser is up to date:
- iOS Safari: Update iOS to latest version
- Android Chrome: Update from Play Store

## Testing Save Manually

To verify save is working:

1. Complete a level
2. Look for "✅ Progress auto-saved!" message
3. Close the browser tab completely
4. Reopen the game
5. Check if "Continue" level appears in level selection

## Browser Compatibility

✅ **Fully Supported:**
- iOS Safari 13+
- Android Chrome 90+
- Desktop Chrome/Firefox/Edge

⚠️ **Limited Support:**
- iOS Chrome (uses Safari engine, may have issues)
- Private browsing modes (no persistence)
- Very old browsers (< 2020)

## What Gets Saved

Your saved progress includes:
- Current level you're on
- Time played
- HP remaining
- Timestamp of save

**Note:** Saved data is stored locally on your device only. If you clear browser data, progress will be lost.

## Alternative: Take Screenshots

If save is not working, you can:
1. Take screenshots of completed levels
2. Remember which level you were on
3. Manually select that level when you return

## Technical Details

### Storage Method

The game uses `localStorage` to save progress:
```javascript
// Saved as:
localStorage.setItem('gameProgress_Demo User', JSON.stringify({
  userName: 'Demo User',
  currentLevel: 'level_1',
  hp: 100,
  elapsedTime: 123,
  timestamp: 1234567890
}))
```

### Storage Key

Progress is saved using your username:
- Key: `gameProgress_Demo User`
- Default user: "Demo User" (auto-created)
- If you login with Google: Uses your Google name

### Browser Console Check

To check if save worked (advanced users):

1. Open browser console (Desktop)
2. Run: `localStorage.getItem('gameProgress')`
3. Should see your saved data

On mobile, use desktop browser DevTools connected to mobile device.

## Still Having Issues?

If save is still not working after trying above steps:

1. **Check browser console** for error messages
2. **Try different browser** (Safari vs Chrome)
3. **Update your OS** to latest version
4. **Check storage space** on your device
5. **Report the issue** with:
   - Device model
   - Browser name and version
   - Error message (if any)
   - Steps to reproduce

## Workaround: Cloud Save (Future)

Currently, progress is saved locally only. For cloud save across devices:
- Configure Google Sign-In (see GOOGLE_AUTH_SETUP.md)
- Sign in with your Google account
- Progress will sync (requires backend implementation)

---

**Quick Fix:** Most issues are solved by:
1. Disable Private Browsing
2. Allow cookies for the site
3. Use Safari on iOS
4. Refresh the page after completing a level
