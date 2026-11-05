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

// In-Browser Live Privacy Proxy
app.get('/api/proxy', async (req, res) => {
  let rawInput = (req.query.url || '').trim();
  if (!rawInput) {
    return res.status(400).send('Please provide a target URL or search query.');
  }

  let targetUrl = rawInput;
  const isExplicitUrl = targetUrl.startsWith('http://') || targetUrl.startsWith('https://');
  const hasDomainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(targetUrl);

  if (!isExplicitUrl) {
    if (hasDomainPattern && !targetUrl.includes(' ')) {
      targetUrl = 'https://' + targetUrl;
    } else {
      targetUrl = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(targetUrl);
    }
  }

  try {
    const parsedTarget = new URL(targetUrl);

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 ZEDOX/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'DNT': '1',
        'Sec-GPC': '1'
      },
      responseType: 'text',
      timeout: 10000,
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
      <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #0f172a; color: #f8fafc; min-height: 100vh;">
        <h2 style="color: #f43f5e;">Unable to load page</h2>
        <p style="color: #94a3b8;">${err.message}</p>
        <p>Try another URL like <code>en.wikipedia.org</code> or <code>example.com</code>.</p>
      </div>
    `);
  }
});

app.get('/download', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; text-align: center; padding: 60px;">
      <h1>⚡ ZEDOX Browser Desktop Setup</h1>
      <p style="color: #94a3b8;">Run <code>npm run dist</code> in the <code>desktop/</code> folder to produce your <code>ZEDOX Browser Setup 1.0.0.exe</code>!</p>
    </body>
  `);
});

app.listen(PORT, () => {
  console.log(`ZEDOX Browser Web & Live Proxy running at http://localhost:${PORT}`);
});
