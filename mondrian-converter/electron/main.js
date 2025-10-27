// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess = null;

// Function to start the Python backend executable
function startBackend() {
  const isDev = process.env.NODE_ENV !== 'production';
  let backendPath;

  if (isDev) {
    // In development, we run the .py script directly
    // This assumes your Python executable is in your PATH
    backendPath = "python";
    const scriptPath = path.join(__dirname, '..', 'backend', 'app.py');
    backendProcess = spawn(backendPath, [scriptPath]);
  } else {
    // In production, we run the packaged .exe
    // 'extraResources' in package.json ensures the backend folder is available
    backendPath = path.join(process.resourcesPath, 'backend', 'mondrian_backend.exe');
    backendProcess = spawn(backendPath);
  }

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend stdout: ${data}`);
  });
  
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
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

  // Load the built React app
  const startUrl = path.join(__dirname, '../frontend/build/index.html');
  mainWindow.loadFile(startUrl);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Gracefully kill the backend process when the app is closed
app.on('window-all-closed', () => {
  if (backendProcess) {
    console.log('Killing backend process...');
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});