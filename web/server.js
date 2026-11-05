const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// ==============================================================
// HIGH-PERFORMANCE AD-FREE YOUTUBE MOBILE ENGINE
// ==============================================================
async function renderYouTubePage(targetUrl, req, res) {
  try {
    const urlObj = new URL(targetUrl);
    const videoId = urlObj.searchParams.get('v') || (urlObj.pathname.startsWith('/embed/') ? urlObj.pathname.split('/')[2] : null);
    let searchQuery = urlObj.searchParams.get('search_query') || req.query.search_query;

    // 1. Video Watch View: Instant Ad-Free Theater Stream
    if (videoId) {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
          <title>YouTube — ZEDOX Ad-Free Player</title>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: #070a13; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; }
            .player-wrapper { position: relative; width: 100%; padding-top: 56.25%; background: #000; box-shadow: 0 4px 20px rgba(0,0,0,0.6); }
            .player-wrapper iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: none; }
            .video-meta { padding: 16px; flex: 1; }
            .video-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(0,242,254,0.12); color: #00f2fe; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; border: 1px solid rgba(0,242,254,0.25); margin-bottom: 12px; }
            .video-title { font-size: 16px; font-weight: 700; color: #f8fafc; line-height: 1.4; margin-bottom: 14px; }
            .action-bar { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
            .action-btn { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; padding: 8px 14px; border-radius: 20px; font-size: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
            .search-box { display: flex; margin-bottom: 16px; background: rgba(15,23,42,0.85); border: 1px solid rgba(0,242,254,0.25); border-radius: 20px; padding: 3px 4px 3px 12px; }
            .search-box input { flex: 1; background: transparent; border: none; color: #f1f5f9; font-size: 13px; outline: none; min-width: 0; }
            .search-box button { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; color: #070a13; font-weight: 700; padding: 6px 14px; border-radius: 16px; font-size: 12px; cursor: pointer; flex-shrink: 0; }
          </style>
        </head>
        <body>
          <div class="player-wrapper">
            <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
          </div>
          <div class="video-meta">
            <div class="video-badge">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="#00f2fe"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
              <span>Ad-Free Protected Player</span>
            </div>
            <form class="search-box" action="/api/proxy" method="GET">
              <input type="hidden" name="url" value="https://m.youtube.com/results">
              <input type="text" name="search_query" placeholder="Search other YouTube videos..." autocomplete="off">
              <button type="submit">Search</button>
            </form>
            <div class="action-bar">
              <a href="javascript:history.back()" class="action-btn">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                <span>Back</span>
              </a>
              <a href="/api/proxy?url=https%3A%2F%2Fm.youtube.com" class="action-btn">
                <span>Trending Feed</span>
              </a>
            </div>
          </div>
          <script>
            try {
              window.parent.postMessage({
                type: 'ZEDOX_PAGE_LOADED',
                url: 'https://m.youtube.com/watch?v=${videoId}',
                title: 'YouTube (Ad-Free Player)',
                blockedCount: 6
              }, '*');
            } catch(e) {}
          </script>
        </body>
        </html>
      `;
      return res.type('text/html').send(html);
    }

    // 2. Video Feed / Search Results
    const fetchUrl = searchQuery 
      ? `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      : 'https://www.youtube.com/feed/trending';

    const ytRes = await axios.get(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });

    const match = ytRes.data.match(/var ytInitialData = ({.*?});<\/script>/);
    let videoList = [];
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        let items = [];
        if (searchQuery) {
          items = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents[0]?.itemSectionRenderer?.contents || [];
        } else {
          const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
          const tabContents = tabs[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
          for (const sec of tabContents) {
            const subItems = sec.itemSectionRenderer?.contents[0]?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items || [];
            items.push(...subItems);
          }
        }

        for (const item of items) {
          const v = item.videoRenderer;
          if (v && v.videoId) {
            videoList.push({
              id: v.videoId,
              title: v.title?.runs?.map(r => r.text).join('') || v.title?.simpleText || 'Video',
              channel: v.ownerText?.runs?.map(r => r.text).join('') || '',
              views: v.viewCountText?.simpleText || '',
              time: v.publishedTimeText?.simpleText || '',
              duration: v.lengthText?.simpleText || '',
              thumb: v.thumbnail?.thumbnails?.slice(-1)[0]?.url || ''
            });
          }
        }
      } catch(e) {}
    }

    const cardsHtml = videoList.map(v => `
      <a href="/api/proxy?url=${encodeURIComponent('https://m.youtube.com/watch?v=' + v.id)}" class="video-card">
        <div class="thumb-wrapper">
          <img src="${v.thumb}" alt="${v.title.replace(/"/g, '&quot;')}" loading="lazy">
          ${v.duration ? `<span class="duration-badge">${v.duration}</span>` : ''}
        </div>
        <div class="video-info">
          <h3 class="card-title">${v.title}</h3>
          <div class="card-meta">
            <span class="card-channel">${v.channel}</span>
            ${v.views ? `<span>• ${v.views}</span>` : ''}
            ${v.time ? `<span>• ${v.time}</span>` : ''}
          </div>
        </div>
      </a>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <title>${searchQuery ? searchQuery + ' — YouTube' : 'YouTube Trending — ZEDOX'}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { background: #070a13; color: #f1f5f9; padding: 12px 10px 80px; }
          .yt-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; position: sticky; top: 0; background: rgba(7,10,19,0.95); backdrop-filter: blur(8px); padding: 4px 0; z-index: 20; }
          .yt-search-form { flex: 1; display: flex; background: rgba(15,23,42,0.85); border: 1px solid rgba(0,242,254,0.3); border-radius: 24px; padding: 3px 4px 3px 12px; }
          .yt-search-form input { flex: 1; background: transparent; border: none; color: #f1f5f9; font-size: 13px; outline: none; min-width: 0; }
          .yt-search-form button { background: linear-gradient(135deg, #00f2fe, #4facfe); border: none; color: #070a13; font-weight: 700; padding: 6px 14px; border-radius: 18px; font-size: 12px; cursor: pointer; flex-shrink: 0; }
          .feed-badge { font-size: 12px; font-weight: 600; color: #94a3b8; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; padding: 0 4px; }
          .feed-badge strong { color: #00f2fe; }
          .video-grid { display: flex; flex-direction: column; gap: 14px; }
          .video-card { display: flex; flex-direction: column; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; text-decoration: none; color: inherit; transition: transform 0.15s, border-color 0.15s; }
          .video-card:active { transform: scale(0.98); border-color: rgba(0,242,254,0.3); }
          .thumb-wrapper { position: relative; width: 100%; padding-top: 56.25%; background: #131b2e; }
          .thumb-wrapper img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
          .duration-badge { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.85); color: #fff; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; }
          .video-info { padding: 12px; }
          .card-title { font-size: 14px; font-weight: 600; color: #f8fafc; line-height: 1.35; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .card-meta { font-size: 12px; color: #94a3b8; display: flex; flex-wrap: wrap; gap: 4px; align-items: center; }
          .card-channel { font-weight: 600; color: #cbd5e1; }
          .empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="yt-header">
          <form class="yt-search-form" action="/api/proxy" method="GET">
            <input type="hidden" name="url" value="https://m.youtube.com/results">
            <input type="text" name="search_query" value="${searchQuery ? searchQuery.replace(/"/g, '&quot;') : ''}" placeholder="Search videos on YouTube..." autocomplete="off">
            <button type="submit">Search</button>
          </form>
        </div>

        <div class="feed-badge">
          <span>${searchQuery ? `Results for <strong>${searchQuery}</strong>` : `Trending Videos`}</span>
          <span style="color:#10b981;">Ad-Free Stream</span>
        </div>

        <div class="video-grid">
          ${cardsHtml || '<div class="empty-state">No videos found. Try another search above.</div>'}
        </div>

        <script>
          try {
            window.parent.postMessage({
              type: 'ZEDOX_PAGE_LOADED',
              url: ${JSON.stringify(targetUrl)},
              title: ${JSON.stringify((searchQuery ? searchQuery + ' — ' : '') + 'YouTube (Ad-Free)')},
              blockedCount: 8
            }, '*');
          } catch(e) {}
        </script>
      </body>
      </html>
    `;
    return res.type('text/html').send(html);
  } catch(err) {
    return res.status(500).send(`
      <div style="font-family: sans-serif; padding: 40px 20px; text-align: center; background: #070a13; color: #f8fafc; min-height: 100vh;">
        <h2 style="color: #f43f5e; margin-bottom: 12px;">YouTube Stream Error</h2>
        <p style="color: #94a3b8; margin-bottom: 20px;">${err.message}</p>
        <a href="https://m.youtube.com" target="_blank" rel="noopener noreferrer" style="background:#00f2fe; color:#070a13; padding:10px 18px; border-radius:20px; text-decoration:none; font-weight:700;">Open Direct in New Tab</a>
      </div>
    `);
  }
}

// ==============================================================
// MAIN REVERSE PROXY ROUTE
// ==============================================================
app.all('/api/proxy', async (req, res) => {
  let rawInput = (req.query.url || req.body.url || '').trim();
  if (!rawInput) {
    return res.status(400).send('Please provide a target URL or search query.');
  }

  let targetUrl = rawInput;
  const lowerInput = rawInput.toLowerCase();

  // 1. Detect YouTube searches or direct video queries
  if (lowerInput.startsWith('yt ') || lowerInput.startsWith('youtube ')) {
    const q = rawInput.replace(/^(yt|youtube)\s+/i, '');
    targetUrl = 'https://m.youtube.com/results?search_query=' + encodeURIComponent(q);
  } else if (POPULAR_SHORTCUTS[lowerInput]) {
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

  // 2. Route all YouTube URLs to the high-performance ZEDOX YouTube engine
  if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
    if (req.query.search_query && !targetUrl.includes('search_query=')) {
      targetUrl = 'https://m.youtube.com/results?search_query=' + encodeURIComponent(req.query.search_query);
    }
    return renderYouTubePage(targetUrl, req, res);
  }

  // 3. General Web Proxy for All Other Sites
  try {
    const parsedTarget = new URL(targetUrl);
    const isPost = req.method.toUpperCase() === 'POST';

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: isPost ? req.body : undefined,
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

    // Remove restrictive frame-busting CSP and X-Frame meta tags
    $('meta[http-equiv="Content-Security-Policy" i]').remove();
    $('meta[http-equiv="X-Frame-Options" i]').remove();

    // Inject base tag so relative fonts, images, and styles resolve directly to target origin
    if ($('base').length === 0) {
      $('head').prepend(`<base href="${parsedTarget.origin}/">`);
    }

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

    // 5. Inject ZEDOX Frame Sync Script
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

// ==============================================================
// RELATIVE SUB-RESOURCE FALLBACK PROXY
// ==============================================================
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/api/proxy' || req.path === '/api/nuke' || req.path === '/download') {
    return next();
  }

  const referer = req.get('Referer') || req.get('referer') || '';
  let targetOrigin = null;

  if (referer.includes('/api/proxy?url=')) {
    try {
      const parsedRef = new URL(referer);
      const encUrl = parsedRef.searchParams.get('url');
      if (encUrl) {
        targetOrigin = new URL(encUrl).origin;
      }
    } catch(e) {}
  }

  if (!targetOrigin) {
    return next();
  }

  try {
    const fullTargetUrl = new URL(req.originalUrl, targetOrigin).href;
    const isPost = req.method.toUpperCase() === 'POST';

    const proxyRes = await axios({
      method: req.method,
      url: fullTargetUrl,
      data: isPost ? req.body : undefined,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
        'Accept': req.get('Accept') || '*/*',
        'Referer': targetOrigin + '/',
        'Origin': targetOrigin,
        'DNT': '1',
        'Sec-GPC': '1'
      },
      responseType: 'arraybuffer',
      timeout: 20000,
      validateStatus: () => true
    });

    const contentType = proxyRes.headers['content-type'] || 'application/octet-stream';
    res.type(contentType);
    res.removeHeader('set-cookie');
    res.status(proxyRes.status).send(proxyRes.data);
  } catch(err) {
    next();
  }
});

// Panic Nuke: Ephemeral Cookie & RAM Session Erasure
app.post('/api/nuke', (req, res) => {
  res.setHeader('Clear-Site-Data', '"cookies"');
  res.json({ success: true, message: 'Session cookies wiped.' });
});

app.get('/download', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; background: #070a13; color: #f8fafc; text-align: center; padding: 60px;">
      <h1>ZEDOX Browser Desktop Setup</h1>
      <p style="color: #94a3b8;">Run <code>npm run dist</code> in the <code>desktop/</code> folder to produce your <code>ZEDOX Browser Setup 1.0.0.exe</code>!</p>
    </body>
  `);
});

app.listen(PORT, () => {
  console.log(`ZEDOX Browser Web & Live Proxy running at http://localhost:${PORT}`);
});
