# Quick Deploy to GitHub Pages

## Step 1: Get Google OAuth Client ID

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
4. Add authorized origins:
   ```
   https://YOUR-USERNAME.github.io
   ```
5. Copy your Client ID (looks like: `1234567890-abc123.apps.googleusercontent.com`)

## Step 2: Update Configuration

Replace `YOUR_GOOGLE_CLIENT_ID` in **two places** in `index.html`:

**Line 7:**
```html
<meta name="google-signin-client_id" content="PUT-YOUR-CLIENT-ID-HERE.apps.googleusercontent.com">
```

**Line 93:**
```html
<div id="g_id_onload"
     data-client_id="PUT-YOUR-CLIENT-ID-HERE.apps.googleusercontent.com"
     ...
```

## Step 3: Deploy

```bash
git add .
git commit -m "Add Google authentication"
git push origin main
```

Enable GitHub Pages in repository settings → Pages → Source: `main` branch

## Done! 🎉

Your app will:
- ✅ Use real Google Sign-In on GitHub Pages
- ✅ Save progress using user's name
- ✅ Use demo mode on localhost for testing

**Live URL:** `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

---

## Without Google Auth (Demo Mode Only)

If you don't want to set up Google authentication:

1. The app will work in demo mode
2. Progress saves to localStorage
3. Users won't need to sign in
4. No configuration needed

Just deploy as-is to GitHub Pages!

---

For detailed instructions, see [GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md)
