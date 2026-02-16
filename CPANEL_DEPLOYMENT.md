# cPanel Deployment Guide

## Overview

This project uses a **hybrid deployment strategy** combining:
- **Next.js app** hosted on Vercel/Netlify (modern hosting)
- **cPanel hosting** as the main domain (traditional hosting)
- **iframe wrapper** to display the Next.js app on cPanel

## How It Works

### Architecture

```
User visits: www.easygo.ba (cPanel)
       ↓
cpanel-index.html loads
       ↓
Displays iframe with: https://easy-go-store-8y9w.vercel.app
       ↓
User sees full Next.js app
```

### Files Involved

1. **cpanel-index.html** - Main wrapper file
   - Simple HTML with iframe
   - Loading spinner
   - Points to Vercel/Netlify URL

2. **.htaccess** - URL rewriting rules
   - Makes all URLs work with the iframe
   - Handles routing for Next.js app
   - Serves cpanel-index.html for all requests

## Setup Instructions

### Step 1: Deploy Next.js App

Deploy your Next.js app to Vercel or Netlify:

**Vercel:**
```bash
npm run build
vercel --prod
```

**Netlify:**
```bash
npm run build
netlify deploy --prod
```

You'll get a URL like:
- `https://your-app.vercel.app`
- `https://your-app.netlify.app`

### Step 2: Update cpanel-index.html

Open `cpanel-index.html` and update the iframe URL:

```html
<iframe 
  id="app" 
  src="https://YOUR-VERCEL-URL.vercel.app/" 
  allow="clipboard-write; payment; geolocation"
  loading="eager"
></iframe>
```

Replace `YOUR-VERCEL-URL` with your actual deployment URL.

### Step 3: Upload to cPanel

Upload these files to your cPanel public_html folder:
- `cpanel-index.html`
- `.htaccess`

**Via File Manager:**
1. Login to cPanel
2. Open File Manager
3. Navigate to `public_html`
4. Upload both files
5. Make sure `.htaccess` is in the root

**Via FTP:**
```bash
# Using FileZilla or similar
# Upload to: /public_html/
```

### Step 4: Test

Visit your domain: `www.easygo.ba`

You should see:
1. Loading spinner (briefly)
2. Your Next.js app loads in iframe
3. All navigation works
4. URLs update in browser

## How .htaccess Works

```apache
RewriteEngine On
RewriteBase /

# If the request is for cpanel-index.html, serve it
RewriteRule ^cpanel-index\.html$ - [L]

# If the request is for an existing file, serve it
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# For everything else, rewrite to cpanel-index.html
RewriteRule ^(.*)$ cpanel-index.html [L,QSA]
```

**What it does:**
- All URLs (`/products`, `/cart`, etc.) → serve `cpanel-index.html`
- The iframe handles actual routing
- User sees clean URLs in browser
- Next.js app handles all navigation

## Benefits of This Approach

### ✅ Advantages

1. **Use cPanel domain** - Keep your existing domain
2. **Modern Next.js features** - Full SSR, optimization, etc.
3. **Easy updates** - Just redeploy to Vercel/Netlify
4. **No cPanel Node.js setup** - Avoid cPanel limitations
5. **Better performance** - Vercel/Netlify CDN
6. **Free hosting** - Vercel/Netlify free tier

### ⚠️ Limitations

1. **Double hosting** - Need both cPanel and Vercel/Netlify
2. **iframe limitations** - Some browser features restricted
3. **SEO considerations** - Search engines see iframe
4. **URL in iframe** - Technically two domains

## Troubleshooting

### Issue: Blank page

**Solution:**
- Check iframe URL in `cpanel-index.html`
- Verify Vercel/Netlify deployment is live
- Check browser console for errors

### Issue: 404 errors

**Solution:**
- Verify `.htaccess` is uploaded
- Check file permissions (644 for files)
- Enable mod_rewrite in cPanel

### Issue: Styles not loading

**Solution:**
- Check Vercel/Netlify build logs
- Verify all assets deployed correctly
- Clear browser cache

### Issue: URLs not working

**Solution:**
- Check `.htaccess` RewriteBase
- Verify RewriteEngine is On
- Test with different URLs

## Alternative: Direct cPanel Deployment

If you want to deploy directly to cPanel (not recommended):

1. Build static export:
```bash
# Add to next.config.js
output: 'export'

# Build
npm run build
```

2. Upload `out/` folder to cPanel
3. Point domain to `out/` folder

**Note:** This loses SSR and some Next.js features.

## Updating Your Site

### To update content:

1. Make changes locally
2. Test: `npm run dev`
3. Deploy to Vercel/Netlify:
   ```bash
   git push origin main
   # Or: vercel --prod
   ```
4. Changes appear automatically (no cPanel upload needed!)

### To change iframe URL:

1. Edit `cpanel-index.html`
2. Update iframe `src` attribute
3. Upload to cPanel

## Security Considerations

### iframe Security

The iframe includes these permissions:
```html
allow="clipboard-write; payment; geolocation"
```

**Safe to add:**
- `camera` - For camera access
- `microphone` - For audio
- `fullscreen` - For fullscreen mode

**Don't add:**
- `autoplay` - Can be annoying
- `document-domain` - Security risk

### HTTPS

- ✅ Vercel/Netlify: Automatic HTTPS
- ⚠️ cPanel: Enable SSL certificate
  - Use Let's Encrypt (free)
  - Or purchase SSL certificate

## Performance Tips

1. **Preconnect to iframe domain:**
```html
<link rel="preconnect" href="https://your-app.vercel.app">
```

2. **Optimize loading:**
```html
<iframe loading="eager" fetchpriority="high">
```

3. **Cache .htaccess:**
```apache
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 1 hour"
</IfModule>
```

## FAQ

**Q: Why not deploy directly to cPanel?**
A: cPanel Node.js support is limited. Vercel/Netlify offer better performance, automatic deployments, and modern features.

**Q: Does this affect SEO?**
A: Potentially. Search engines may see the iframe. For better SEO, consider direct deployment or use Vercel/Netlify as primary domain.

**Q: Can I use my cPanel email?**
A: Yes! Email hosting is separate from web hosting. Your cPanel email continues to work.

**Q: What if Vercel/Netlify goes down?**
A: Users will see a blank page. Consider adding error handling in cpanel-index.html.

**Q: Can I remove the loading spinner?**
A: Yes, but it improves perceived performance. Users see something while iframe loads.

## Support

For issues:
1. Check Vercel/Netlify deployment logs
2. Check cPanel error logs
3. Test iframe URL directly
4. Verify .htaccess syntax

---

**Current Setup:**
- Next.js App: `https://easy-go-store-8y9w.vercel.app/`
- cPanel Domain: Your domain
- Method: iframe wrapper with .htaccess routing
