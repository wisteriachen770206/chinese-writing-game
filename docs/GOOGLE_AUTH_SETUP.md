# Google Authentication Setup Guide

This guide explains how to set up Google Sign-In for your GitHub Pages deployment.

## Current Status

✅ Code is ready for Google authentication  
✅ Uses user's **name** (not email) to save progress  
⚠️ Requires Google OAuth credentials configuration  

## Quick Start

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the consent screen if prompted
6. Select **Web application** as the application type
7. Add **Authorized JavaScript origins**:
   ```
   https://YOUR-USERNAME.github.io
   ```
8. Add **Authorized redirect URIs**:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```
9. Click **Create** and copy your **Client ID**

### Step 2: Update index.html

Replace `YOUR_GOOGLE_CLIENT_ID` in `index.html` (line 7):

```html
<meta name="google-signin-client_id" content="1234567890-abc123def456.apps.googleusercontent.com">
```

And in the `g_id_onload` div (around line 92):

```html
<div id="g_id_onload"
     data-client_id="1234567890-abc123def456.apps.googleusercontent.com"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false"
     style="display: none;">
</div>
```

### Step 3: Deploy to GitHub Pages

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Configure Google Sign-In"
   git push origin main
   ```

2. Enable GitHub Pages in your repository settings
3. Set source to `main` branch

### Step 4: Test

Visit your GitHub Pages URL and click the "Continue (Demo Mode)" button. It should now:
- Show Google Sign-In on production (GitHub Pages)
- Use demo mode on localhost
- Save progress using the user's name

## How It Works

### Authentication Flow

```
┌─────────────────────────────────────────────────────┐
│  User clicks "Continue (Demo Mode)" button          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ Local Dev?    │
         │ (localhost)   │
         └───┬───────┬───┘
             │       │
        YES  │       │  NO
             ▼       ▼
      ┌──────────┐  ┌────────────────────┐
      │Demo Mode │  │ Google Sign-In     │
      │          │  │ (Production)       │
      └──────────┘  └─────┬──────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │ Parse JWT     │
                  │ Extract Name  │
                  └───────┬───────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │ Save Progress Using     │
              │ gameProgress_[NAME]     │
              └─────────────────────────┘
```

### Storage Key Format

Progress is saved using the user's **name** as the key:

```javascript
// Example storage key
localStorage.setItem('gameProgress_John Doe', JSON.stringify(progress));
```

**Benefits:**
- ✅ Simple and readable
- ✅ No email privacy concerns
- ✅ Easy to debug in localStorage
- ⚠️ Users with same name will share progress (rare)

### Fallback Modes

1. **Production (GitHub Pages)**: Uses real Google Sign-In
2. **Local Development**: Uses demo mode (no real authentication)
3. **Google Sign-In Unavailable**: Falls back to demo mode

## Security Considerations

### What We Store

**In localStorage:**
- User's name (e.g., "John Doe")
- Current level ID
- Elapsed time
- HP value
- Timestamp

**We DO NOT store:**
- Passwords
- Email addresses (only used in-memory)
- Google tokens
- Personal information

### Privacy

- All data is stored **locally** in the user's browser
- No data is sent to external servers
- Google Sign-In is only used for authentication
- User can clear localStorage to reset

## Testing Locally

### Demo Mode (Default on localhost)

```javascript
// Demo user is automatically created
{
  name: 'Demo User',
  email: 'demo@example.com',
  picture: '...' // SVG avatar
}
```

### Test Google Sign-In Locally

To test real Google Sign-In on localhost:

1. Add localhost to authorized origins in Google Cloud Console:
   ```
   http://localhost:8000
   ```

2. Temporarily modify the check in `game.js`:
   ```javascript
   const isLocalDev = false; // Force production mode
   ```

3. Start local server and test

## Troubleshooting

### Issue: "Google Sign-In not configured - using demo mode"

**Cause:** Google Sign-In library not loaded or client ID not configured

**Solution:**
1. Check that `index.html` has the correct client ID
2. Verify Google Sign-In script is loaded: `<script src="https://accounts.google.com/gsi/client" async defer></script>`
3. Check browser console for errors

### Issue: "Origin not allowed"

**Cause:** Your GitHub Pages URL is not in authorized origins

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add your exact GitHub Pages URL to authorized origins
4. Wait a few minutes for changes to propagate

### Issue: User sees "Continue (Demo Mode)" instead of "Sign in with Google"

**Expected behavior** - The button text doesn't change. When clicked on production, it triggers Google Sign-In.

To change the button text for production, update `index.html` line 100:
```html
<button id="google-signin-btn">
    <svg>...</svg>
    Sign in with Google <!-- Change this text -->
</button>
```

## FAQ

### Q: Why use name instead of email?

**A:** Using name is simpler, more privacy-friendly, and sufficient for this use case. Since data is stored locally, there's no need for unique identifiers like email.

### Q: What if two users have the same name?

**A:** Very rare, but they would share progress. If this is a concern, you can modify the code to use email instead by changing `currentUser.name` to `currentUser.email` in `auth.js`.

### Q: Can I disable demo mode?

**A:** Yes, remove the `isLocalDev` check and the `simulateGoogleLogin()` fallback. However, this will break local development.

### Q: Is the authentication secure?

**A:** Yes. Google Sign-In uses industry-standard OAuth 2.0. The JWT token is only used to extract the user's name and is not stored.

## Support

For more information:
- [Google Sign-In Documentation](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 Setup](https://support.google.com/cloud/answer/6158849)
