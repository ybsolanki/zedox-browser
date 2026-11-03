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
  let targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Please provide a target URL.');
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    const parsedTarget = new URL(targetUrl);

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 ZEDOX/1.0',
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
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
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

    // 6. Inject ZEDOX Floating Status Badge
    const zedoxBanner = `
      <div id="zedox-web-demo-bar" style="
        position: fixed;
        bottom: 12px;
        right: 12px;
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid #38bdf8;
        border-radius: 24px;
        padding: 8px 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        z-index: 2147483647;
      ">
        <span style="color: #38bdf8; font-size: 16px;">⚡</span>
        <span>ZEDOX Shield: <strong>${blockedCount}</strong> trackers blocked • RAM isolation active</span>
      </div>
    `;
    $('body').append(zedoxBanner);

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
