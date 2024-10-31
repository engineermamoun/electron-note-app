const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
let mainWindow;
let addWindow;

app.on("ready", function () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.on("closed", function () {
    app.quit();
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

const mainMenuTemplate = [
  {
    label: "القائمة",
    submenu: [
      {
        label: "اضافة مهمة",
        click() {
          initAddWindow();
        },
      },
      {
        label: "خروج",
        accelerator: process.platform == "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "أدوات المطور",
    submenu: [
      {
        label: "فتح وإغلاق أدوات المطور",
        accelerator: process.platform === "darwin" ? "Cmd+D" : "Ctrl+D",
        click() {
          mainWindow.toggleDevTools();
        },
      },
      {
        label: "إعادة تحميل التطبيق",
        role: "reload",
      },
    ],
  },
];

function initAddWindow() {
  addWindow = new BrowserWindow({
    width: 400,
    height: 250,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  addWindow.loadFile("./views/normalTask.html");
  addWindow.on("closed", (e) => {
    e.preventDefault();
    addWindow = null;
  });
  addWindow.removeMenu();
}

ipcMain.on("add-normal-task", function (e, item) {
  mainWindow.webContents.send("add-normal-task", item);
  addWindow.close();
});

ipcMain.on("create-txt", function (e, note) {
  let dest = Date.now() + "-task.txt";
  dialog
    .showSaveDialog({
      title: "اختر مكان الحفظ",
      defaultPath: path.join(__dirname, "./" + dest),
      buttonLabel: "Save",
      filters: [{ name: "Text Files", extentions: ["txt"] }],
    })
    .then((file) => {
      if (!file.canceled) {
        fs.writeFile(file.filePath.toString(), note, function (err) {
          if (err) throw err;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on("new-nromal", function (e) {
  initAddWindow();
});
