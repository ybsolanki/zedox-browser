const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const TRACKER_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /googlesyndication\.com/i,
  /doubleclick\.net/i,
  /connect\.facebook\.net/i,
  /adnxs\.com/i,
  /taboola\.com/i,
  /outbrain\.com/i,
  /criteo\.com/i,
  /hotjar\.com/i,
  /clarity\.ms/i,
  /adservice\.google/i,
  /amazon-adsystem\.com/i,
  /scorecardresearch\.com/i,
  /adsystem/i
];

const POPULAR_SHORTCUTS = {
  'youtube': 'https://m.youtube.com',
  'yt': 'https://m.youtube.com',
  'google': 'https://www.google.com',
  'wiki': 'https://en.wikipedia.org',
  'wikipedia': 'https://en.wikipedia.org',
  'reddit': 'https://old.reddit.com',
  'github': 'https://github.com',
  'twitter': 'https://x.com',
  'x': 'https://x.com',
  'facebook': 'https://m.facebook.com',
  'fb': 'https://m.facebook.com',
  'instagram': 'https://www.instagram.com',
  'insta': 'https://www.instagram.com',
  'news': 'https://news.ycombinator.com',
  'archive': 'https://archive.today'
};

// In-Browser Live Privacy Proxy
app.get('/api/proxy', async (req, res) => {
  let rawInput = (req.query.url || '').trim();
  if (!rawInput) {
    return res.status(400).send('Please provide a target URL or search query.');
  }

  let targetUrl = rawInput;
  const lowerInput = rawInput.toLowerCase();

  // 1. Check popular service shortcuts
  if (POPULAR_SHORTCUTS[lowerInput]) {
    targetUrl = POPULAR_SHORTCUTS[lowerInput];
  } else if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    const hasDomainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(targetUrl);
    if (hasDomainPattern && !targetUrl.includes(' ')) {
      targetUrl = 'https://' + targetUrl;
    } else {
      // Clean, fast web search via Google Web Mode (udm=14)
      targetUrl = 'https://www.google.com/search?q=' + encodeURIComponent(targetUrl) + '&udm=14';
    }
  }

  try {
    const parsedTarget = new URL(targetUrl);

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'DNT': '1',
        'Sec-GPC': '1',
        'Upgrade-Insecure-Requests': '1'
      },
      responseType: 'text',
      timeout: 25000,
      maxRedirects: 5
    });

    const contentType = response.headers['content-type'] || '';
    if (!contentType.includes('text/html')) {
      return res.type(contentType).send(response.data);
    }

    const $ = cheerio.load(response.data);
    let blockedCount = 0;

    // 0. Remove restrictive frame-busting CSP and X-Frame meta tags
    $('meta[http-equiv="Content-Security-Policy" i]').remove();
    $('meta[http-equiv="X-Frame-Options" i]').remove();

    // Ensure responsive mobile viewport
    if ($('meta[name="viewport"]').length === 0) {
      $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">');
    }

    // 1. Remove ad/tracker scripts
    $('script').each((i, el) => {
      const src = $(el).attr('src') || '';
      const text = $(el).html() || '';
      const isTracker = TRACKER_PATTERNS.some(pattern => pattern.test(src) || pattern.test(text));
      if (isTracker) {
        $(el).remove();
        blockedCount++;
      }
    });

    // 2. Remove known ad containers and iframes
    $('iframe').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (TRACKER_PATTERNS.some(pattern => pattern.test(src)) || /ad|banner|sponsor/i.test(src)) {
        $(el).remove();
        blockedCount++;
      }
    });

    // 3. Remove tracker beacons & tracking pixels
    $('img').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (TRACKER_PATTERNS.some(pattern => pattern.test(src))) {
        $(el).remove();
        blockedCount++;
      }
    });

    // 4. Rewrite absolute and relative links so navigation stays within the proxy
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
        try {
          const resolved = new URL(href, parsedTarget.origin).href;
          $(el).attr('href', `/api/proxy?url=${encodeURIComponent(resolved)}`);
          $(el).attr('target', '_self');
        } catch (e) {}
      }
    });

    // 5. Invert relative paths for assets
    $('link[rel="stylesheet"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          $(el).attr('href', new URL(href, parsedTarget.origin).href);
        } catch (e) {}
      }
    });

    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          $(el).attr('src', new URL(src, parsedTarget.origin).href);
        } catch (e) {}
      }
    });

    // 6. Inject ZEDOX Frame Sync Script
    const syncScript = `
      <script>
      (function() {
        try {
          window.parent.postMessage({
            type: 'ZEDOX_PAGE_LOADED',
            url: ${JSON.stringify(targetUrl)},
            title: document.title || ${JSON.stringify(parsedTarget.hostname)},
            blockedCount: ${blockedCount}
          }, '*');
        } catch(e) {}

        document.addEventListener('submit', function(e) {
          var form = e.target;
          var method = (form.method || 'GET').toUpperCase();
          if (method === 'GET') {
            e.preventDefault();
            var formData = new FormData(form);
            var params = new URLSearchParams(formData).toString();
            var action = form.getAttribute('action') || window.location.href;
            var target;
            try {
              target = new URL(action, ${JSON.stringify(parsedTarget.origin)}).href;
            } catch(err) {
              target = action;
            }
            var finalUrl = target + (target.indexOf('?') !== -1 ? '&' : '?') + params;
            window.location.href = '/api/proxy?url=' + encodeURIComponent(finalUrl);
          }
        }, true);
      })();
      </script>
    `;
    $('body').append(syncScript);

    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.removeHeader('set-cookie');
    res.send($.html());
  } catch (err) {
    res.status(500).send(`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; text-align: center; background: #070a13; color: #f8fafc; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#f43f5e"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        </div>
        <h2 style="color: #f43f5e; font-size: 20px; margin-bottom: 8px;">Unable to Connect to Site</h2>
        <p style="color: #94a3b8; font-size: 13px; max-width: 360px; line-height: 1.5; margin-bottom: 24px;">The connection timed out (${err.message}). Choose an option below to proceed:</p>
        
        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 340px;">
          <a href="/api/proxy?url=${encodeURIComponent(targetUrl)}" style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #070a13; padding: 10px 18px; border-radius: 20px; text-decoration: none; font-weight: 700; font-size: 13px;">Retry</a>
          <a href="/api/proxy?url=${encodeURIComponent('https://www.google.com/search?q=' + encodeURIComponent(rawInput) + '&udm=14')}" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(0, 242, 254, 0.3); color: #00f2fe; padding: 10px 18px; border-radius: 20px; text-decoration: none; font-size: 13px; font-weight: 600;">Search Web</a>
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #cbd5e1; padding: 10px 18px; border-radius: 20px; text-decoration: none; font-size: 13px;">Open Direct</a>
        </div>
      </div>
    `);
  }
});

// Panic Nuke: Ephemeral Cookie & RAM Session Erasure
app.post('/api/nuke', (req, res) => {
  res.setHeader('Clear-Site-Data', '"cookies"');
  res.json({ success: true, message: 'Session cookies wiped.' });
});

app.get('/download', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 60px;">
      <h1>ZEDOX Browser Desktop Setup</h1>
      <p style="color: #94a3b8;">Run <code>npm run dist</code> in the <code>desktop/</code> folder to produce your <code>ZEDOX Browser Setup 1.0.0.exe</code>!</p>
    </body>
  `);
});

app.listen(PORT, () => {
  console.log(`ZEDOX Browser Web & Live Proxy running at http://localhost:${PORT}`);
});
