# ✅ GitHub Pages Release Checklist

Use this checklist before deploying to ensure everything is ready.

## Pre-Deployment Checks

### Required Files
- [ ] `index.html` exists and works locally
- [ ] `level_config.json` contains all 5 levels
- [ ] `all_strokes.json` is present (should be ~1-2 MB)
- [ ] `graphics.txt` is present
- [ ] `res/` folder contains:
  - [ ] `guanyin.jpg`
  - [ ] `XJ0106.mp3` or `heart-sutra-wiki.mp3`
- [ ] `README.md` is complete and informative
- [ ] `.gitignore` is present

### File Path Verification
- [ ] All resource paths are relative (no `/absolute/paths`)
- [ ] Audio files use relative paths (`res/file.mp3` not `/res/file.mp3`)
- [ ] JSON files load with relative paths

### Local Testing
- [ ] Game loads in browser without errors
- [ ] Level selection screen appears
- [ ] Can start Level 1
- [ ] Stroke drawing works (mouse/touch)
- [ ] Direction checking provides feedback
- [ ] HP bar updates correctly
- [ ] Level complete screen appears
- [ ] Can progress to Level 2
- [ ] Background music plays (after user interaction)
- [ ] Game over screen works when HP = 0
- [ ] Restart returns to level selection

### Browser Console Check (F12)
- [ ] No critical errors in console
- [ ] `level_config.json` loads successfully
- [ ] `all_strokes.json` loads successfully
- [ ] All characters for Level 1 are found
- [ ] No 404 errors for resources

### Git Repository
- [ ] All changes are committed
- [ ] `.gitignore` excludes unnecessary files
- [ ] Remote repository is set up
- [ ] Ready to push to GitHub

### Content Review
- [ ] README has accurate description
- [ ] No sensitive information in code
- [ ] Comments are appropriate for public viewing
- [ ] License information is clear

## Quick Test Commands

### Start Local Server
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

### Check Git Status
```bash
git status
git log --oneline -5
```

### Verify File Sizes
```bash
# PowerShell
Get-ChildItem -File | Select-Object Name, Length | Sort-Object Length -Descending

# Bash/Mac
ls -lhS
```

## Common Issues to Check

### Audio Issues
- [ ] Audio files are in web-compatible formats (MP3, not WAV)
- [ ] Audio file sizes are reasonable (< 5 MB each)
- [ ] Paths in HTML match actual file names (case-sensitive on Linux)

### Data Issues
- [ ] `all_strokes.json` includes all characters from all levels
- [ ] Character codes are properly UTF-8 encoded
- [ ] No duplicate characters in `ToWriteText.txt`

### Performance
- [ ] Total repository size < 100 MB
- [ ] Images are reasonably compressed
- [ ] No unnecessary large files committed

## Post-Deployment Verification

After pushing to GitHub:

- [ ] Repository is visible on GitHub
- [ ] All files are present in the repository
- [ ] GitHub Pages is enabled in Settings
- [ ] Deployment succeeded (check Actions tab)
- [ ] Site loads at GitHub Pages URL
- [ ] Test game functionality on deployed site
- [ ] Test on mobile device (if available)
- [ ] Share link with a friend to verify

## Optimization Checklist (Optional)

For better performance:

- [ ] Compress background image (guanyin.jpg)
- [ ] Minify JSON files (remove whitespace)
- [ ] Consider lazy-loading audio files
- [ ] Add loading spinner for better UX
- [ ] Add meta tags for social sharing

## Final Steps

1. Update README with actual GitHub Pages URL
2. Add project description on GitHub
3. Add topics/tags on GitHub (chinese, education, game, hanzi)
4. Consider adding a screenshot to README
5. Share your project!

---

## Emergency Rollback

If something goes wrong after deployment:

```bash
# Revert to previous commit
git log --oneline  # Find the commit hash to revert to
git reset --hard COMMIT_HASH
git push --force
```

**Note**: Force push should only be used in emergencies!

---

**Ready to deploy? Follow the steps in DEPLOYMENT.md!**
