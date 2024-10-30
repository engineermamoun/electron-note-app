const { app, BrowserWindow } = require("electron");

let mainWindow;

app.on("ready", function () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile("index.html");
});
