# Deployment Guide - GitHub Pages

## Prerequisites

- Git installed
- GitHub account
- Repository created on GitHub

## Quick Deployment Steps

### 1. Commit Your Changes

```bash
# Add all files
git add .

# Commit
git commit -m "Refactor: Split code into modules and improve structure"

# Push to GitHub
git push origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

### 3. Wait for Deployment

- GitHub will automatically build and deploy
- Usually takes 1-2 minutes
- Your site will be available at: `https://YOUR_USERNAME.github.io/mySecond/`

## File Structure for Deployment

```
mySecond/
├── index.html              ← Entry point
├── css/
│   └── styles.css         ← All styling
├── js/
│   └── game-original.js.bak  ← Main game logic
├── res/                   ← Resources (images, audio)
│   ├── guanyin.jpg
│   ├── heart-sutra-wiki.mp3
│   └── XJ0106.mp3
├── all_strokes.json       ← Character data
└── level_config.json      ← Level configuration
```

## Important Notes

### Audio Files
- ✅ `XJ0106.mp3` - Correct case for GitHub Pages
- Make sure all audio paths use correct case (GitHub Pages is case-sensitive)

### File Paths
All paths in `index.html` and `styles.css` are **relative**, which works perfectly for GitHub Pages:
- ✅ `css/styles.css`
- ✅ `js/game-original.js.bak`
- ✅ `res/XJ0106.mp3`
- ✅ `../res/guanyin.jpg` (in CSS)

### Browser Compatibility
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile devices (responsive design)
- ⚠️ Requires JavaScript enabled

## Troubleshooting

### Issue: BGM not playing
**Solution**: GitHub Pages is case-sensitive. Make sure:
- File: `res/XJ0106.mp3`
- HTML: `<source src="res/XJ0106.mp3">`

### Issue: CSS not loading
**Solution**: Check that `<link>` tag uses relative path:
```html
<link rel="stylesheet" href="css/styles.css">
```

### Issue: Characters not loading
**Solution**: Ensure `all_strokes.json` and `level_config.json` are committed

### Issue: 404 Page
**Solution**: 
1. Check GitHub Pages settings
2. Ensure `index.html` is in root directory
3. Wait 1-2 minutes for deployment to complete

## Testing Locally

Before pushing, test locally:

```bash
# Using Python
python -m http.server 8000

# Open browser
http://localhost:8000
```

## Performance Optimization

For production, consider:
1. ✅ CSS is already in separate file (cached by browser)
2. ✅ JavaScript is in separate file (cached by browser)
3. 🔄 Future: Minify CSS/JS for faster loading
4. 🔄 Future: Compress images if needed
5. 🔄 Future: Use CDN for audio files

## Custom Domain (Optional)

To use a custom domain:

1. Add `CNAME` file in root with your domain:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - Add A records pointing to GitHub's IPs
   - Or CNAME pointing to `YOUR_USERNAME.github.io`

3. Enable HTTPS in GitHub Pages settings

## Monitoring

After deployment, check:
- ✅ All pages load correctly
- ✅ Audio plays
- ✅ Level selection works
- ✅ Character drawing works
- ✅ Mobile layout correct
- ✅ No console errors

## Update Process

To update your site:

```bash
# Make changes
# ...

# Commit and push
git add .
git commit -m "Update: Your changes description"
git push origin main

# GitHub Pages auto-deploys in 1-2 minutes
```

## Security

- ✅ No sensitive data in repository
- ✅ Demo mode for authentication
- ℹ️ For production Google Sign-In, add OAuth credentials

## Support

If issues occur:
1. Check browser console for errors
2. Verify all files are committed
3. Check GitHub Pages deployment status
4. Test locally first

---

**Your site will be live at:**  
`https://YOUR_USERNAME.github.io/mySecond/`

Replace `YOUR_USERNAME` with your actual GitHub username!
