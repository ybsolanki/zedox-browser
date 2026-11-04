const { app, BrowserWindow, session, ipcMain } = require('electron');
const path = require('path');
const fetch = require('cross-fetch');
const { ElectronBlocker } = require('@cliqz/adblocker-electron');

const CHROME_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

let mainWindow;
let blockedCount = 0;
let blocker;

// 1. SSL & Network switches to prevent TLS handshake halts & cert date checks
app.commandLine.appendSwitch('ignore-certificate-errors');
app.commandLine.appendSwitch('allow-insecure-localhost');
app.commandLine.appendSwitch('disable-quic'); // Forces stable HTTP/2 & TLS
app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling');

// Realistic Chrome identity
app.userAgentFallback = CHROME_USER_AGENT;

// Handle SSL certificate errors globally
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true); // Trust certificates even with clock skew
});

async function setupAdBlocker(ses) {
  try {
    blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);

    // CRITICAL: Disable cosmetic DOM scriptlet injection to prevent YouTube's TrustedTypes CSP policy violations
    blocker.config.loadCosmeticFilters = false;
    blocker.enableBlockingInSession(ses);

    blocker.on('request-blocked', (request) => {
      blockedCount++;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('shield-update', {
          blockedCount,
          url: request.url
        });
      }
    });

    console.log('ZEDOX Shield: Network-level Ad & Tracker blocker active.');
  } catch (err) {
    console.error('Failed to initialize ZEDOX ad blocker:', err);
  }
}

function setupSession(ses) {
  // Ensure certificate verification always succeeds
  ses.setCertificateVerifyProc((request, callback) => {
    callback(0); // 0 = CERT_OK
  });

  // Use clean Chrome user agent
  ses.setUserAgent(CHROME_USER_AGENT);

  // Enforce DNT & GPC
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['DNT'] = '1';
    details.requestHeaders['Sec-GPC'] = '1';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
}

async function createWindow() {
  const privateSession = session.fromPartition('zedox-private-session');

  setupSession(privateSession);
  await setupAdBlocker(privateSession);

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 800,
    minHeight: 600,
    title: 'ZEDOX Browser',
    icon: path.join(__dirname, 'build', 'icon.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#94a3b8',
      height: 42
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    backgroundColor: '#0f172a'
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-shield-stats', () => ({ blockedCount }));

ipcMain.handle('clear-browsing-data', async () => {
  const privateSession = session.fromPartition('zedox-private-session');
  await privateSession.clearStorageData();
  await privateSession.clearCache();
  blockedCount = 0;
  return { success: true };
});

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', async () => {
  try {
    const privateSession = session.fromPartition('zedox-private-session');
    await privateSession.clearStorageData();
    await privateSession.clearCache();
    console.log('ZEDOX: Ephemeral session erased.');
  } catch (e) {}
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
