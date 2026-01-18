# 🚀 GitHub Pages Deployment Guide

This guide will help you deploy your Chinese Character Writing Practice Game to GitHub Pages.

## Prerequisites

- A GitHub account
- Git installed on your computer
- This project cloned/downloaded

## Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com) and log in
2. Click the "+" icon in the top right → "New repository"
3. Repository settings:
   - **Name**: `chinese-writing-game` (or any name you prefer)
   - **Description**: "Interactive Chinese character writing practice game"
   - **Public** (required for free GitHub Pages)
   - **Do NOT** initialize with README (we already have one)
4. Click "Create repository"

### 2. Push Your Code to GitHub

Open terminal/command prompt in your project folder and run:

```bash
# Initialize git (if not already done)
git init

# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/chinese-writing-game.git

# Add all files
git add .

# Commit the files
git commit -m "Initial release: Chinese character writing game"

# Push to GitHub
git push -u origin main
```

**Note**: Replace `YOUR_USERNAME` with your actual GitHub username.

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" (top right)
3. In the left sidebar, click "Pages"
4. Under "Source":
   - Select branch: **main**
   - Select folder: **/ (root)**
5. Click "Save"

### 4. Wait for Deployment

- GitHub will build and deploy your site (takes 1-3 minutes)
- Refresh the Pages settings page
- You'll see: "Your site is live at https://YOUR_USERNAME.github.io/chinese-writing-game/"

### 5. Update README with Live URL

Edit `README.md` and replace the demo link:

```markdown
## 🎮 Live Demo

Play the game: https://YOUR_USERNAME.github.io/chinese-writing-game/
```

Commit and push:
```bash
git add README.md
git commit -m "Add live demo link"
git push
```

## Updating the Game

After making changes:

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Description of your changes"

# Push to GitHub
git push

# GitHub Pages will automatically update in 1-3 minutes
```

## Troubleshooting

### Site Not Loading

**Problem**: Blank page or 404 error

**Solution**:
1. Check that GitHub Pages is enabled (Settings → Pages)
2. Ensure branch is set to "main" and folder to "/ (root)"
3. Wait a few minutes for deployment to complete
4. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Audio Files Not Playing

**Problem**: Background music or voice not working

**Solution**:
- Check that `res/` folder is committed to GitHub
- Verify file paths in `index.html` are relative (not absolute)
- Most browsers require user interaction before playing audio

### Characters Not Loading

**Problem**: "Character not found" errors

**Solution**:
- Ensure `all_strokes.json` is committed and pushed
- Check browser console (F12) for specific error messages
- Verify `level_config.json` is present

### Mobile Issues

**Problem**: Touch input not working properly

**Solution**:
- Clear mobile browser cache
- Try in different browsers
- Check that you're using HTTPS (not HTTP)

## File Checklist

Essential files for GitHub Pages (must be committed):

- ✅ `index.html` - Main game file
- ✅ `level_config.json` - Level definitions
- ✅ `all_strokes.json` - Character stroke data
- ✅ `graphics.txt` - Raw character data
- ✅ `res/` folder - Images and audio files
- ✅ `README.md` - Project documentation
- ✅ `.gitignore` - Exclude unnecessary files

Files to exclude (already in .gitignore):

- ❌ `node_modules/` - Development dependencies
- ❌ `__pycache__/` - Python cache
- ❌ `*.py` - Python scripts (not needed for web)
- ❌ Development/test files

## Custom Domain (Optional)

Want to use your own domain like `writing.yourdomain.com`?

1. Add a file named `CNAME` (no extension) in your repository root
2. Content should be just your domain: `writing.yourdomain.com`
3. Configure your DNS:
   - Type: `CNAME`
   - Name: `writing` (or `@` for root domain)
   - Value: `YOUR_USERNAME.github.io`
4. Wait for DNS propagation (up to 48 hours, usually much faster)

## Performance Tips

1. **Reduce file sizes**:
   - Compress images in `res/` folder
   - Consider using MP3 instead of WAV for audio

2. **Enable caching**:
   - GitHub Pages automatically handles this

3. **Test before pushing**:
   - Test locally with `python -m http.server 8000`
   - Check in multiple browsers

## Support

If you encounter issues:

1. Check browser console (F12) for error messages
2. Verify all files are committed: `git status`
3. Check GitHub Actions tab for deployment status
4. Review this guide carefully

## Security Notes

- GitHub Pages serves content over HTTPS automatically
- Don't commit sensitive data (API keys, passwords)
- `.gitignore` helps prevent accidental commits

---

**Congratulations! Your game is now live! 🎉**

Share your link and help others learn Chinese characters!
