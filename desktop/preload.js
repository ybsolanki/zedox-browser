const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('shieldAPI', {
  getStats: () => ipcRenderer.invoke('get-shield-stats'),
  clearData: () => ipcRenderer.invoke('clear-browsing-data'),
  onShieldUpdate: (callback) => {
    ipcRenderer.on('shield-update', (event, data) => callback(data));
  }
});
