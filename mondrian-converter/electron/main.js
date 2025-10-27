// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let backendProcess = null;
const logFilePath = path.join(app.getPath('userData'), 'app-log.txt');
fs.writeFileSync(logFilePath, `App started at ${new Date().toISOString()}\n`);

function startBackend() {
  // --- THIS IS THE FIX: Use app.isPackaged for 100% reliability ---
  const isPackaged = app.isPackaged;
  
  let backendPath;
  if (!isPackaged) {
    // --- DEVELOPMENT PATH ---
    // Running in development mode (e.g., with `npm start`)
    fs.appendFileSync(logFilePath, 'Running in Development mode.\n');
    backendPath = "python";
    const scriptPath = path.join(__dirname, '..', 'backend', 'app.py');
    backendProcess = spawn(backendPath, [scriptPath]);
  } else {
    // --- PRODUCTION PATH ---
    // Running from the packaged, installed application
    backendPath = path.join(process.resourcesPath, 'backend', 'mondrian_backend.exe');
    fs.appendFileSync(logFilePath, `Running in Production mode. Attempting to start backend from: ${backendPath}\n`);
    backendProcess = spawn(backendPath);
  }

  backendProcess.stdout.on('data', (data) => {
    const message = `Backend stdout: ${data}\n`;
    console.log(message);
    fs.appendFileSync(logFilePath, message);
  });
  
  backendProcess.stderr.on('data', (data) => {
    const message = `Backend stderr: ${data}\n`;
    console.error(message);
    fs.appendFileSync(logFilePath, message);
  });

  backendProcess.on('close', (code) => {
    const message = `Backend process exited with code ${code}\n`;
    console.log(message);
    fs.appendFileSync(logFilePath, message);
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // This path logic is now also more robust.
  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, '../frontend/build/index.html')}`
    : `http://localhost:3000`; // In dev, we can point to the React dev server

  mainWindow.loadURL(startUrl);
  mainWindow.setMenu(null);
  
  // Keep DevTools open for now
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  app.quit();
});