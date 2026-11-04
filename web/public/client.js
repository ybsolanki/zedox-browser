document.addEventListener('DOMContentLoaded', () => {
  // Service Worker Registration for PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('ZEDOX PWA Service Worker registered:', reg.scope))
        .catch((err) => console.log('SW registration failed:', err));
    });
  }

  // Live Demo Browser Navigation
  const demoUrlInput = document.getElementById('demo-url-input');
  const demoGoBtn = document.getElementById('demo-go-btn');
  const demoFrame = document.getElementById('demo-frame');
  const sampleTags = document.querySelectorAll('.sample-tag');

  function loadDemoUrl(url) {
    let target = url.trim();
    if (!target) return;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }
    demoUrlInput.value = target;
    demoFrame.src = `/api/proxy?url=${encodeURIComponent(target)}`;
  }

  if (demoGoBtn) {
    demoGoBtn.addEventListener('click', () => loadDemoUrl(demoUrlInput.value));
  }

  if (demoUrlInput) {
    demoUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadDemoUrl(demoUrlInput.value);
    });
  }

  sampleTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const url = tag.getAttribute('data-url');
      loadDemoUrl(url);
    });
  });

  // PWA Install Prompt Handlers
  let deferredPrompt = null;
  const pwaBanner = document.getElementById('pwa-install-banner');
  const pwaInstallBtn = document.getElementById('pwa-install-btn');
  const pwaCloseBtn = document.getElementById('pwa-close-btn');
  const heroMobileBtn = document.getElementById('hero-mobile-btn');
  const navInstallBtn = document.getElementById('nav-install-btn');
  const iosTooltip = document.getElementById('ios-install-tooltip');
  const iosCloseBtn = document.getElementById('ios-tooltip-close');

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // If already installed and running as standalone app, hide banners
  if (isStandalone) {
    if (pwaBanner) pwaBanner.classList.add('hidden');
    if (heroMobileBtn) heroMobileBtn.classList.add('hidden');
    if (navInstallBtn) navInstallBtn.classList.add('hidden');
    return;
  }

  // Android & Desktop Chrome/Edge PWA prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // Show install buttons and banner
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
      pwaBanner.classList.add('hidden');
    });
  }

  // iOS Safari specific prompt
  if (isIOS && !isStandalone) {
    // Show iOS tooltip after 2 seconds
    setTimeout(() => {
      if (iosTooltip) iosTooltip.classList.remove('hidden');
    }, 2000);
  }

  if (iosCloseBtn) {
    iosCloseBtn.addEventListener('click', () => {
      if (iosTooltip) iosTooltip.classList.add('hidden');
    });
  }
});
