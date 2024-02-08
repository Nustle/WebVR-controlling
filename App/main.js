const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const fs = require('fs');

let clientProcess = null;
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 733,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('html/app.html');
}

const logPath = path.join(os.homedir(), 'debug.log');

function getScriptPath() {
    let scriptPath;
    if (process.env.npm_lifecycle_event === 'start') {
        scriptPath = path.join(app.getAppPath(), 'python/build/client');
    } else {
        scriptPath = path.join(app.getAppPath(), '..', 'python/build/client');
    }
    if (process.platform === "win32") {
        scriptPath += '.exe'
    }
    return scriptPath
}

ipcMain.on('start-client', (event, arg) => {
    let scriptPath = getScriptPath();

    fs.appendFileSync(logPath, `Script path is: ${scriptPath}\n`);

    clientProcess = spawn(scriptPath);

    fs.appendFileSync(logPath, 'Python client started\n');

    clientProcess.stdout.on('data', (data) => {
        fs.appendFileSync(logPath,`stdout: ${data}`);
    });

    clientProcess.stderr.on('data', (data) => {
        fs.appendFileSync(logPath,`stderr: ${data}`);
    });

    clientProcess.on('close', (code) => {
        fs.appendFileSync(logPath,`child process exited with code ${code}`);
    });
});

ipcMain.on('stop-client', (event, arg) => {
    if (clientProcess !== null) {
        fs.appendFileSync(logPath,'Python client finished');
        clientProcess.kill('SIGINT');
        clientProcess = null;
    } else {
        fs.appendFileSync(logPath,'No client to stop.');
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});