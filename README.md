# ⚡ ZEDOX Browser

A privacy-first desktop web browser and cloud web demo inspired by Brave.

* **Ephemeral RAM-Only Sessions:** Zero cookies, search history, or cache stored on disk.
* **Built-in Ad & Tracker Shield:** Integrated EasyList & EasyPrivacy engine blocking banners, video ads, and analytics beacons.
* **Realistic Chrome Identity:** Uses a clean Chrome 130 user agent to guarantee full compatibility with YouTube, Google, and modern SPAs.
* **Strict Anti-Fingerprinting:** Enforces Global Privacy Control (`Sec-GPC`), `DNT: 1`, and prevents referrer leaks.
* **Instant Nuke Feature:** One-click panic button to obliterate all in-memory cookies and storage instantly.

---

## 📁 Project Structure

```
shield-browser/
├── desktop/         # The ZEDOX Desktop Browser App (Electron + EasyList Adblocker)
│   ├── main.js      # Main process, ephemeral RAM session, and network blocker
│   ├── preload.js   # Secure IPC bridge
│   ├── renderer/    # Brave-style dark UI (tabs, nav bar, shields popup)
│   └── package.json # Electron dependencies & packaging config
│
└── web/             # ZEDOX Landing Page + Live Web Proxy Demo
    ├── server.js    # Express server with privacy proxy & ad-stripping
    ├── public/      # Product landing page + interactive web demo
    └── package.json # Web dependencies
```

---

## 🚀 How to Run the Projects

### 1. ZEDOX Desktop Browser (App)
To launch the browser locally:
```bash
cd desktop
npm start
```

To package it into a Windows installer (`.exe`):
```bash
cd desktop
npm run dist
```
The installer will be placed in `desktop/dist/ZEDOX Browser Setup 1.0.0.exe`.

---

### 2. ZEDOX Web Landing Page & Live Demo (For Your Domain)
To test the website and the in-browser demo locally:
```bash
cd web
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.
