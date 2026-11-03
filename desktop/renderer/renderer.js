const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

let tabs = [];
let activeTabId = null;
let tabCounter = 0;
let totalBlocked = 0;

// SVG Icons
const SVG_GLOBE = `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>`;
const SVG_BOLT = `<svg viewBox="0 0 24 24" width="13" height="13" fill="#00f2fe"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"/></svg>`;
const SVG_YOUTUBE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#ff0033"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>`;
const SVG_GITHUB = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#cbd5e1"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>`;
const SVG_REDDIT = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#ff4500"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>`;
const SVG_WIKIPEDIA = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#e2e8f0"><path d="M12.09 13.12L9.49 5.3H6.84L2 18.7h2.43l1.24-3.52h5.5l1.19 3.52H15L12.09 13.12zm-4.7-1.74l1.9-5.41 1.83 5.41H7.39zm12.38 7.32l-3.32-8.9-2.03 5.57.88 2.45h-2.14l3.18-8.52-2.31-6.1h2.51l1.45 4.3 1.54-4.3h2.39l-4.14 11.02 2.21 4.48h-2.22z"/></svg>`;
const SVG_DUCK = `<svg viewBox="0 0 24 24" width="14" height="14" fill="#fb923c"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>`;

// Cosmetic CSS for YouTube & web
const YOUTUBE_AD_CSS = `
  ytd-ad-slot-renderer,
  ytd-rich-item-renderer:has(ytd-ad-slot-renderer),
  ytd-banner-promo-renderer,
  #player-ads,
  .ytp-ad-module,
  .ytp-ad-overlay-container,
  .ytp-ad-message-container,
  ytd-in-feed-ad-layout-renderer,
  ytd-action-companion-ad-renderer,
  #masthead-ad,
  ytd-promoted-video-renderer,
  ytd-statement-banner-renderer,
  ytd-compact-promoted-video-renderer,
  ytd-promoted-sparkles-web-renderer,
  #companion,
  .video-ads,
  .ytp-ad-preview-container {
    display: none !important;
  }
`;

const GENERAL_AD_CSS = `
  ins.adsbygoogle,
  div[id^="google_ads_iframe"],
  div[id^="dfp-ad-"],
  .ad-container,
  .ad-wrapper,
  .ad-banner,
  .advertisement,
  .sponsor-post {
    display: none !important;
  }
`;

const YOUTUBE_AD_SKIP_SCRIPT = `
  (() => {
    if (window.__zedoxAdSkipperRunning) return;
    window.__zedoxAdSkipperRunning = true;

    setInterval(() => {
      const player = document.querySelector('#movie_player, .html5-video-player');
      const isAd = player && (player.classList.contains('ad-showing') || player.classList.contains('ad-interrupting'));
      const video = document.querySelector('video');

      if (isAd && video) {
        video.muted = true;
        if (isFinite(video.duration) && video.duration > 0) {
          video.currentTime = video.duration;
        }
      }

      const skipButtons = document.querySelectorAll(
        '.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button, .ytp-ad-skip-button-slot, button.ytp-ad-skip-button-slot'
      );
      skipButtons.forEach(btn => btn.click());

      const overlayClose = document.querySelector('.ytp-ad-overlay-close-button');
      if (overlayClose) overlayClose.click();
    }, 50);
  })();
`;

// DOM Elements
const logoMark = document.querySelector('.logo-mark');
const tabsBar = document.getElementById('tabs-bar');
const addTabBtn = document.getElementById('add-tab-btn');
const btnBack = document.getElementById('btn-back');
const btnForward = document.getElementById('btn-forward');
const btnReload = document.getElementById('btn-reload');
const btnHome = document.getElementById('btn-home');
const btnNuke = document.getElementById('btn-nuke');
const btnCopyUrl = document.getElementById('btn-copy-url');
const urlInput = document.getElementById('url-input');
const webviewsContainer = document.getElementById('webviews-container');
const shieldBadgeBtn = document.getElementById('shield-badge-btn');
const shieldCountSpan = document.getElementById('shield-count');
const shieldPopover = document.getElementById('shield-popover');
const popoverShieldCount = document.getElementById('popover-shield-count');
const popoverDataSaved = document.getElementById('popover-data-saved');
const popoverWipeBtn = document.getElementById('popover-wipe-btn');
const pageProgressBar = document.getElementById('page-progress-bar');

// Initialize Shield IPC listener
if (window.shieldAPI) {
  window.shieldAPI.onShieldUpdate((data) => {
    totalBlocked = data.blockedCount;
    shieldCountSpan.textContent = totalBlocked;
    popoverShieldCount.textContent = totalBlocked;

    const dataSavedMB = (totalBlocked * 0.42).toFixed(1);
    popoverDataSaved.textContent = `${dataSavedMB} MB`;

    document.querySelectorAll('.stat-ads-blocked').forEach(el => el.textContent = totalBlocked);
    document.querySelectorAll('.stat-data-saved').forEach(el => el.textContent = `${dataSavedMB} MB`);
  });
}

function resolveAboutUrl() {
  return new URL('about.html', window.location.href).href;
}

function normalizeUrl(input) {
  let query = input.trim();
  if (!query) return 'about:blank';

  if (query === 'zedox://about' || query === 'about:zedox' || query === 'zedox:about') {
    return resolveAboutUrl();
  }

  const hasProtocol = /^https?:\/\//i.test(query);
  const isLikelyDomain = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(query);

  if (hasProtocol) return query;
  if (isLikelyDomain) return `https://${query}`;

  // DuckDuckGo private search
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}

function getDisplayUrl(url) {
  if (url === 'about:blank') return '';
  if (url.includes('about.html')) return 'zedox://about';
  return url;
}

function applyAdShield(webview) {
  try {
    webview.insertCSS(GENERAL_AD_CSS);
    const currentUrl = webview.getURL() || '';
    if (currentUrl.includes('youtube.com')) {
      webview.insertCSS(YOUTUBE_AD_CSS);
      webview.executeJavaScript(YOUTUBE_AD_SKIP_SCRIPT);
    }
  } catch (err) {}
}

function updateProgressBar(progress) {
  if (progress === 0) {
    pageProgressBar.style.width = '0%';
    pageProgressBar.classList.remove('loading');
  } else if (progress === 100) {
    pageProgressBar.style.width = '100%';
    setTimeout(() => {
      pageProgressBar.classList.remove('loading');
      setTimeout(() => pageProgressBar.style.width = '0%', 300);
    }, 200);
  } else {
    pageProgressBar.classList.add('loading');
    pageProgressBar.style.width = `${progress}%`;
  }
}

function updateStartScreenTime(startScreen) {
  const clockEl = startScreen.querySelector('.clock-widget');
  const dateEl = startScreen.querySelector('.date-widget');
  if (!clockEl || !dateEl) return;

  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  clockEl.textContent = `${hours}:${minutes} ${ampm}`;

  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  dateEl.textContent = now.toLocaleDateString('en-US', options);
}

function resetTabToHome(tab) {
  if (!tab) return;
  tab.url = 'about:blank';
  tab.title = 'New Tab';
  tab.tabEl.querySelector('.tab-title').textContent = 'New Tab';
  tab.tabEl.querySelector('.tab-icon').innerHTML = SVG_GLOBE;
  tab.webview.loadURL('about:blank');
  tab.startScreen.classList.remove('hidden');
}

function createTab(initialUrl = 'about:blank') {
  tabCounter++;
  const tabId = `tab-${tabCounter}`;

  let targetUrl = initialUrl;
  if (targetUrl === 'zedox://about') {
    targetUrl = resolveAboutUrl();
  }

  // Create Webview
  const webview = document.createElement('webview');
  webview.id = `wv-${tabId}`;
  webview.setAttribute('partition', 'zedox-private-session');
  webview.setAttribute('allowpopups', 'true');
  webview.setAttribute('useragent', CHROME_USER_AGENT);
  webview.src = targetUrl;

  const isAboutPage = targetUrl.includes('about.html');
  const initialTitle = isAboutPage ? 'About ZEDOX' : 'New Tab';
  const initialIcon = isAboutPage ? SVG_BOLT : SVG_GLOBE;

  // Create Tab DOM Element
  const tabEl = document.createElement('div');
  tabEl.className = 'tab';
  tabEl.id = `tab-el-${tabId}`;
  tabEl.innerHTML = `
    <span class="tab-icon">${initialIcon}</span>
    <span class="tab-title">${initialTitle}</span>
    <span class="tab-close" title="Close Tab">×</span>
  `;

  // Start Screen overlay
  const startScreen = document.createElement('div');
  startScreen.className = 'new-tab-screen';
  if (isAboutPage) startScreen.classList.add('hidden');
  startScreen.id = `start-${tabId}`;
  startScreen.innerHTML = `
    <div class="clock-widget">12:00 PM</div>
    <div class="date-widget">Today</div>

    <div class="start-search-box">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#64748b"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
      <input type="text" placeholder="Search the web privately or enter URL..." class="start-search-input">
    </div>

    <div class="shortcuts-grid">
      <div class="shortcut-card" data-url="https://www.youtube.com">
        ${SVG_YOUTUBE} <span>YouTube</span>
      </div>
      <div class="shortcut-card" data-url="https://duckduckgo.com">
        ${SVG_DUCK} <span>DuckDuckGo</span>
      </div>
      <div class="shortcut-card" data-url="https://reddit.com">
        ${SVG_REDDIT} <span>Reddit</span>
      </div>
      <div class="shortcut-card" data-url="https://en.wikipedia.org">
        ${SVG_WIKIPEDIA} <span>Wikipedia</span>
      </div>
      <div class="shortcut-card" data-url="https://github.com">
        ${SVG_GITHUB} <span>GitHub</span>
      </div>
      <div class="shortcut-card" data-url="zedox://about">
        ${SVG_BOLT} <span>About ZEDOX</span>
      </div>
    </div>

    <div class="privacy-status-bar">
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="#00f2fe"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
        <span>Blocked: <strong class="stat-value stat-ads-blocked">0</strong></span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="#00f2fe"><path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95z"/></svg>
        <span>Saved: <strong class="stat-value stat-data-saved">0 MB</strong></span>
      </div>
      <div class="stat-item">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="#10b981"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z"/></svg>
        <span class="stat-value">RAM-Only Isolation</span>
      </div>
    </div>
  `;

  updateStartScreenTime(startScreen);

  webviewsContainer.appendChild(startScreen);
  webviewsContainer.appendChild(webview);
  tabsBar.appendChild(tabEl);

  const tabObj = {
    id: tabId,
    tabEl,
    webview,
    startScreen,
    url: targetUrl,
    title: initialTitle,
    isLoading: false
  };

  tabs.push(tabObj);

  // Bind Webview Events
  webview.addEventListener('dom-ready', () => {
    applyAdShield(webview);
  });

  webview.addEventListener('page-title-updated', (e) => {
    if (tabObj.url === 'about:blank') {
      tabObj.title = 'New Tab';
      tabEl.querySelector('.tab-title').textContent = 'New Tab';
      tabEl.querySelector('.tab-icon').innerHTML = SVG_GLOBE;
      return;
    }

    tabObj.title = e.title;
    tabEl.querySelector('.tab-title').textContent = e.title;

    const iconEl = tabEl.querySelector('.tab-icon');
    if (tabObj.url.includes('about.html')) iconEl.innerHTML = SVG_BOLT;
    else if (tabObj.url.includes('youtube.com')) iconEl.innerHTML = SVG_YOUTUBE;
    else if (tabObj.url.includes('github.com')) iconEl.innerHTML = SVG_GITHUB;
    else if (tabObj.url.includes('wikipedia.org')) iconEl.innerHTML = SVG_WIKIPEDIA;
    else if (tabObj.url.includes('reddit.com')) iconEl.innerHTML = SVG_REDDIT;
    else iconEl.innerHTML = SVG_GLOBE;
  });

  webview.addEventListener('did-start-loading', () => {
    tabObj.isLoading = true;
    if (activeTabId === tabId) {
      updateProgressBar(65);
      updateNavButtons();
    }
  });

  webview.addEventListener('did-stop-loading', () => {
    tabObj.isLoading = false;
    applyAdShield(webview);
    if (activeTabId === tabId) {
      updateProgressBar(100);
      updateNavButtons();
    }
  });

  webview.addEventListener('did-navigate', (e) => {
    tabObj.url = e.url;
    if (e.url !== 'about:blank') {
      startScreen.classList.add('hidden');
    } else {
      // Cleanly reset tab title and icon when navigating back to blank/home
      tabObj.title = 'New Tab';
      tabEl.querySelector('.tab-title').textContent = 'New Tab';
      tabEl.querySelector('.tab-icon').innerHTML = SVG_GLOBE;
      startScreen.classList.remove('hidden');
    }
    if (activeTabId === tabId) {
      urlInput.value = getDisplayUrl(e.url);
      updateNavButtons();
    }
    applyAdShield(webview);
  });

  webview.addEventListener('did-navigate-in-page', (e) => {
    tabObj.url = e.url;
    applyAdShield(webview);
    if (activeTabId === tabId) {
      urlInput.value = getDisplayUrl(e.url);
      updateNavButtons();
    }
  });

  webview.addEventListener('new-window', (e) => {
    createTab(e.url);
  });

  // Tab click & close
  tabEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-close')) {
      closeTab(tabId);
    } else {
      switchTab(tabId);
    }
  });

  // Start Screen interactions
  const startInput = startScreen.querySelector('.start-search-input');
  startInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const url = normalizeUrl(startInput.value);
      navigateTo(tabId, url);
    }
  });

  startScreen.querySelectorAll('.shortcut-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      if (url === 'zedox://about') {
        createTab('zedox://about');
      } else {
        navigateTo(tabId, normalizeUrl(url));
      }
    });
  });

  switchTab(tabId);
  return tabObj;
}

function switchTab(tabId) {
  activeTabId = tabId;

  tabs.forEach((t) => {
    const isActive = t.id === tabId;
    t.tabEl.classList.toggle('active', isActive);
    t.webview.classList.toggle('active', isActive);

    if (isActive) {
      if (t.url === 'about:blank') {
        t.startScreen.classList.remove('hidden');
      } else {
        t.startScreen.classList.add('hidden');
      }
    } else {
      t.startScreen.classList.add('hidden');
    }
  });

  const currentTab = getActiveTab();
  if (currentTab) {
    urlInput.value = getDisplayUrl(currentTab.url);
    updateNavButtons();
  }
}

function closeTab(tabId) {
  const index = tabs.findIndex((t) => t.id === tabId);
  if (index === -1) return;

  const [removed] = tabs.splice(index, 1);
  removed.tabEl.remove();
  removed.webview.remove();
  removed.startScreen.remove();

  if (tabs.length === 0) {
    createTab('about:blank');
  } else if (activeTabId === tabId) {
    const nextTab = tabs[Math.max(0, index - 1)];
    switchTab(nextTab.id);
  }
}

function getActiveTab() {
  return tabs.find((t) => t.id === activeTabId);
}

function navigateTo(tabId, url) {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return;
  tab.startScreen.classList.add('hidden');
  tab.webview.loadURL(url);
}

function updateNavButtons() {
  const tab = getActiveTab();
  if (!tab) return;
  btnBack.disabled = !tab.webview.canGoBack();
  btnForward.disabled = !tab.webview.canGoForward();
}

// Nav actions
btnBack.addEventListener('click', () => {
  const tab = getActiveTab();
  if (tab && tab.webview.canGoBack()) tab.webview.goBack();
});

btnForward.addEventListener('click', () => {
  const tab = getActiveTab();
  if (tab && tab.webview.canGoForward()) tab.webview.goForward();
});

btnReload.addEventListener('click', () => {
  const tab = getActiveTab();
  if (tab) {
    if (tab.isLoading) tab.webview.stop();
    else tab.webview.reload();
  }
});

btnHome.addEventListener('click', () => {
  const tab = getActiveTab();
  if (tab) {
    resetTabToHome(tab);
    urlInput.value = '';
  }
});

urlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const tab = getActiveTab();
    if (tab) {
      const url = normalizeUrl(urlInput.value);
      navigateTo(tab.id, url);
    }
  }
});

// Copy URL button
btnCopyUrl.addEventListener('click', () => {
  if (urlInput.value) {
    navigator.clipboard.writeText(urlInput.value);
    const originalContent = btnCopyUrl.innerHTML;
    btnCopyUrl.innerHTML = `<span style="color: #10b981; font-size: 11px;">✓</span>`;
    setTimeout(() => btnCopyUrl.innerHTML = originalContent, 1500);
  }
});

addTabBtn.addEventListener('click', () => {
  createTab('about:blank');
});

// Click ZEDOX logo to open About tab
if (logoMark) {
  logoMark.addEventListener('click', () => {
    createTab('zedox://about');
  });
}

// F12 Inspector
window.addEventListener('keydown', (e) => {
  if (e.key === 'F12') {
    const tab = getActiveTab();
    if (tab && tab.webview) {
      if (tab.webview.isDevToolsOpened()) tab.webview.closeDevTools();
      else tab.webview.openDevTools();
    }
  }
  if (e.ctrlKey && e.key.toLowerCase() === 't') {
    e.preventDefault();
    createTab('about:blank');
  }
});

// Shield Popover Toggle
shieldBadgeBtn.addEventListener('click', () => {
  shieldPopover.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  if (!shieldBadgeBtn.contains(e.target) && !shieldPopover.contains(e.target)) {
    shieldPopover.classList.add('hidden');
  }
});

// Panic Button: Complete wipe of sessions and resets all tabs
async function nukeSession() {
  if (confirm('ZEDOX Panic Wipe: Destroy all session memory, cookies, and cache now?')) {
    if (window.shieldAPI) {
      await window.shieldAPI.clearData();
    }

    // Close all open tabs except the first one
    while (tabs.length > 1) {
      closeTab(tabs[tabs.length - 1].id);
    }

    // Reset remaining tab cleanly to New Tab
    const remainingTab = tabs[0];
    if (remainingTab) {
      resetTabToHome(remainingTab);
    }

    totalBlocked = 0;
    shieldCountSpan.textContent = '0';
    popoverShieldCount.textContent = '0';
    popoverDataSaved.textContent = '0 MB';
    shieldPopover.classList.add('hidden');
    urlInput.value = '';

    document.querySelectorAll('.stat-ads-blocked').forEach(el => el.textContent = '0');
    document.querySelectorAll('.stat-data-saved').forEach(el => el.textContent = '0 MB');

    alert('ZEDOX: Ephemeral session erased. Zero trace remaining.');
  }
}

btnNuke.addEventListener('click', nukeSession);
popoverWipeBtn.addEventListener('click', nukeSession);

// Periodic Clock Refresh
setInterval(() => {
  document.querySelectorAll('.new-tab-screen').forEach(screen => updateStartScreenTime(screen));
}, 10000);

// Initialize with first tab
createTab('about:blank');
