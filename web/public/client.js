document.addEventListener('DOMContentLoaded', () => {
  // 1. Service Worker Registration for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('ZEDOX PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('SW registration failed:', err));
    });
  }

  // 2. View Mode Detection (Mobile Browser vs Desktop Landing)
  const urlParams = new URLSearchParams(window.location.search);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 800;
  const forceBrowser = urlParams.get('mode') === 'browser' || urlParams.get('app') === '1' || urlParams.get('pwa') === 'true';
  const forceLanding = urlParams.get('mode') === 'landing';

  function setViewMode(mode) {
    if (mode === 'browser') {
      document.body.className = 'view-browser';
      if (floatingBrowserBtn) floatingBrowserBtn.classList.add('hidden');
    } else {
      document.body.className = 'view-landing';
      if (isMobileDevice && floatingBrowserBtn) {
        floatingBrowserBtn.classList.remove('hidden');
      }
    }
  }

  // Default: mobile devices, standalone PWA, or explicit browser mode load the Mobile Browser directly!
  if ((isMobileDevice || isStandalone || forceBrowser) && !forceLanding) {
    setViewMode('browser');
  } else {
    setViewMode('landing');
  }

  // Landing view triggers to launch browser
  const navLaunchBrowserBtn = document.getElementById('nav-launch-browser-btn');
  const heroLaunchBrowserBtn = document.getElementById('hero-launch-browser-btn');
  const floatingBrowserBtn = document.getElementById('floating-browser-btn');

  if (navLaunchBrowserBtn) navLaunchBrowserBtn.addEventListener('click', () => setViewMode('browser'));
  if (heroLaunchBrowserBtn) heroLaunchBrowserBtn.addEventListener('click', () => setViewMode('browser'));
  if (floatingBrowserBtn) floatingBrowserBtn.addEventListener('click', () => setViewMode('browser'));

  // ==============================================================
  // 3. FULLSCREEN MOBILE BROWSER ENGINE
  // ==============================================================
  const mbUrlInput = document.getElementById('mb-url-input');
  const mbBtnClear = document.getElementById('mb-btn-clear');
  const mbBtnGo = document.getElementById('mb-btn-go');
  const mbStartSearchInput = document.getElementById('mb-start-search-input');
  const mbStartSearchBtn = document.getElementById('mb-start-search-btn');
  const mbLoadingBar = document.getElementById('mb-loading-bar');
  const mbStartPage = document.getElementById('mb-start-page');
  const mbWebviewWrapper = document.getElementById('mb-webview-wrapper');
  const mbWebview = document.getElementById('mb-webview');
  const mbNavBack = document.getElementById('mb-nav-back');
  const mbNavForward = document.getElementById('mb-nav-forward');
  const mbNavHome = document.getElementById('mb-nav-home');
  const mbNavNuke = document.getElementById('mb-nav-nuke');
  const mbNavMenu = document.getElementById('mb-nav-menu');
  const mbBtnBrand = document.getElementById('mb-btn-brand');
  const mbBtnShield = document.getElementById('mb-btn-shield');
  const mbShieldCount = document.getElementById('mb-shield-count');
  const mbStatTrackers = document.getElementById('mb-stat-trackers');
  const mbShieldSheet = document.getElementById('mb-shield-sheet');
  const mbShieldBackdrop = document.getElementById('mb-shield-backdrop');
  const mbShieldClose = document.getElementById('mb-shield-close');
  const mbMenuSheet = document.getElementById('mb-menu-sheet');
  const mbMenuBackdrop = document.getElementById('mb-menu-backdrop');
  const mbMenuClose = document.getElementById('mb-menu-close');
  const mbMenuReload = document.getElementById('mb-menu-reload');
  const mbMenuCopy = document.getElementById('mb-menu-copy');
  const mbMenuLanding = document.getElementById('mb-menu-landing');
  const mbMenuAbout = document.getElementById('mb-menu-about');
  const mbToast = document.getElementById('mb-toast');

  let totalBlocked = 0;
  let toastTimer = null;

  function showToast(text) {
    if (!mbToast) return;
    mbToast.querySelector('span').textContent = text;
    mbToast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      mbToast.classList.add('hidden');
    }, 3200);
  }

  // Navigation logic
  function navigate(input) {
    let query = (input || '').trim();
    if (!query) return;

    // Show loading bar
    if (mbLoadingBar) {
      mbLoadingBar.className = 'mb-loading-bar active';
    }

    // Switch view to active webview
    if (mbStartPage) mbStartPage.classList.add('hidden');
    if (mbWebviewWrapper) mbWebviewWrapper.classList.remove('hidden');

    // Update input display
    if (mbUrlInput) {
      mbUrlInput.value = query;
      if (mbBtnClear) mbBtnClear.classList.remove('hidden');
    }

    // Trigger proxy
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(query)}`;
    if (mbWebview) {
      mbWebview.src = proxyUrl;
    }

    if (mbNavBack) mbNavBack.disabled = false;
  }

  // Go to Home / Start Page
  function goHome() {
    if (mbWebview) mbWebview.src = 'about:blank';
    if (mbWebviewWrapper) mbWebviewWrapper.classList.add('hidden');
    if (mbStartPage) mbStartPage.classList.remove('hidden');
    if (mbUrlInput) {
      mbUrlInput.value = '';
      if (mbBtnClear) mbBtnClear.classList.add('hidden');
    }
    if (mbLoadingBar) mbLoadingBar.className = 'mb-loading-bar';
    if (mbNavBack) mbNavBack.disabled = true;
    if (mbNavForward) mbNavForward.disabled = true;
  }

  // Panic Nuke Session (RAM wipe)
  function panicNuke() {
    goHome();
    totalBlocked = 0;
    if (mbShieldCount) mbShieldCount.textContent = '0';
    if (mbStatTrackers) mbStatTrackers.textContent = '0';
    try {
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) {}
    showToast('🔥 Session Purged! Pure RAM reset. Zero traces remaining.');
  }

  // Event Listeners for Top Omnibar
  if (mbBtnGo) {
    mbBtnGo.addEventListener('click', () => navigate(mbUrlInput.value));
  }

  if (mbUrlInput) {
    mbUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigate(mbUrlInput.value);
    });
    mbUrlInput.addEventListener('input', () => {
      if (mbBtnClear) {
        if (mbUrlInput.value.length > 0) {
          mbBtnClear.classList.remove('hidden');
        } else {
          mbBtnClear.classList.add('hidden');
        }
      }
    });
  }

  if (mbBtnClear) {
    mbBtnClear.addEventListener('click', () => {
      mbUrlInput.value = '';
      mbBtnClear.classList.add('hidden');
      mbUrlInput.focus();
    });
  }

  // Start Page Search
  if (mbStartSearchBtn) {
    mbStartSearchBtn.addEventListener('click', () => navigate(mbStartSearchInput.value));
  }

  if (mbStartSearchInput) {
    mbStartSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') navigate(mbStartSearchInput.value);
    });
  }

  // Quick Dial Bookmarks
  const qdItems = document.querySelectorAll('.mb-qd-item');
  qdItems.forEach(item => {
    item.addEventListener('click', () => {
      const url = item.getAttribute('data-url');
      navigate(url);
    });
  });

  // Bottom Navigation Bar Buttons
  if (mbBtnBrand) mbBtnBrand.addEventListener('click', goHome);
  if (mbNavHome) mbNavHome.addEventListener('click', goHome);
  if (mbNavNuke) mbNavNuke.addEventListener('click', panicNuke);

  if (mbNavBack) {
    mbNavBack.addEventListener('click', () => {
      try {
        if (mbWebview && mbWebview.contentWindow) {
          mbWebview.contentWindow.history.back();
        }
      } catch (e) {
        goHome();
      }
    });
  }

  if (mbNavForward) {
    mbNavForward.addEventListener('click', () => {
      try {
        if (mbWebview && mbWebview.contentWindow) {
          mbWebview.contentWindow.history.forward();
        }
      } catch (e) {}
    });
  }

  // Shield Sheet
  if (mbBtnShield) {
    mbBtnShield.addEventListener('click', () => {
      if (mbShieldSheet) mbShieldSheet.classList.remove('hidden');
    });
  }

  if (mbShieldBackdrop) {
    mbShieldBackdrop.addEventListener('click', () => {
      if (mbShieldSheet) mbShieldSheet.classList.add('hidden');
    });
  }

  if (mbShieldClose) {
    mbShieldClose.addEventListener('click', () => {
      if (mbShieldSheet) mbShieldSheet.classList.add('hidden');
    });
  }

  // Menu Sheet
  if (mbNavMenu) {
    mbNavMenu.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.remove('hidden');
    });
  }

  if (mbMenuBackdrop) {
    mbMenuBackdrop.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.add('hidden');
    });
  }

  if (mbMenuClose) {
    mbMenuClose.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.add('hidden');
    });
  }

  if (mbMenuReload) {
    mbMenuReload.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.add('hidden');
      if (mbWebview && mbWebview.src && mbWebview.src !== 'about:blank') {
        if (mbLoadingBar) mbLoadingBar.className = 'mb-loading-bar active';
        mbWebview.src = mbWebview.src;
      }
    });
  }

  if (mbMenuCopy) {
    mbMenuCopy.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.add('hidden');
      const current = mbUrlInput ? mbUrlInput.value : '';
      if (current) {
        navigator.clipboard.writeText(current)
          .then(() => showToast('📋 URL copied to clipboard'))
          .catch(() => showToast('URL: ' + current));
      }
    });
  }

  if (mbMenuLanding) {
    mbMenuLanding.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.add('hidden');
      setViewMode('landing');
    });
  }

  if (mbMenuAbout) {
    mbMenuAbout.addEventListener('click', () => {
      if (mbMenuSheet) mbMenuSheet.classList.add('hidden');
      showToast('🛡️ ZEDOX Browser: Privacy-first architecture created by Yug Solanki.');
    });
  }

  // Cross-frame messaging from proxy to sync loaded URL and tracker count
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'ZEDOX_PAGE_LOADED') {
      if (e.data.url && mbUrlInput) {
        mbUrlInput.value = e.data.url;
        if (mbBtnClear) mbBtnClear.classList.remove('hidden');
      }
      if (e.data.blockedCount !== undefined) {
        totalBlocked += Number(e.data.blockedCount) || 0;
        if (mbShieldCount) mbShieldCount.textContent = totalBlocked;
        if (mbStatTrackers) mbStatTrackers.textContent = totalBlocked;
      }
      if (mbLoadingBar) {
        mbLoadingBar.className = 'mb-loading-bar done';
        setTimeout(() => {
          if (mbLoadingBar) mbLoadingBar.className = 'mb-loading-bar';
        }, 500);
      }
      if (mbNavBack) mbNavBack.disabled = false;
    }
  });

  // Handle iframe load completion
  if (mbWebview) {
    mbWebview.addEventListener('load', () => {
      if (mbLoadingBar && mbLoadingBar.classList.contains('active')) {
        mbLoadingBar.className = 'mb-loading-bar done';
        setTimeout(() => {
          if (mbLoadingBar) mbLoadingBar.className = 'mb-loading-bar';
        }, 500);
      }
    });
  }

  // ==============================================================
  // 4. PWA INSTALL PROMPT & SERVICE WORKER
  // ==============================================================
  let deferredPrompt = null;
  const pwaBanner = document.getElementById('pwa-install-banner');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const pwaCloseBtn = document.getElementById('pwa-close-btn');
  const heroMobileBtn = document.getElementById('hero-mobile-btn');
  const navInstallBtn = document.getElementById('nav-install-btn');
  const iosTooltip = document.getElementById('ios-install-tooltip');
  const iosCloseBtn = document.getElementById('ios-tooltip-close');

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // If running as installed standalone app, hide install prompts
  if (isStandalone) {
    if (pwaBanner) pwaBanner.classList.add('hidden');
    if (heroMobileBtn) heroMobileBtn.classList.add('hidden');
    if (navInstallBtn) navInstallBtn.classList.add('hidden');
  } else {
    // Android & Chrome/Edge beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      if (pwaBanner) pwaBanner.classList.remove('hidden');
      if (heroMobileBtn) heroMobileBtn.classList.remove('hidden');
      if (navInstallBtn) navInstallBtn.classList.remove('hidden');
    });

    function triggerPWAInstall() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User installed ZEDOX PWA');
          }
          deferredPrompt = null;
          if (pwaBanner) pwaBanner.classList.add('hidden');
          if (heroMobileBtn) heroMobileBtn.classList.add('hidden');
          if (navInstallBtn) navInstallBtn.classList.add('hidden');
        });
      }
    }

    if (pwaInstallBtn) pwaInstallBtn.addEventListener('click', triggerPWAInstall);
    if (heroMobileBtn) heroMobileBtn.addEventListener('click', triggerPWAInstall);
    if (navInstallBtn) navInstallBtn.addEventListener('click', triggerPWAInstall);

    if (pwaCloseBtn) {
      pwaCloseBtn.addEventListener('click', () => {
        if (pwaBanner) pwaBanner.classList.add('hidden');
      });
    }

    if (isIOS) {
      setTimeout(() => {
        if (iosTooltip) iosTooltip.classList.remove('hidden');
      }, 2500);
    }

    if (iosCloseBtn) {
      iosCloseBtn.addEventListener('click', () => {
        if (iosTooltip) iosTooltip.classList.add('hidden');
      });
    }
  }
});
