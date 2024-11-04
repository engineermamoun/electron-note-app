const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  Notification,
  Tray,
} = require("electron");
const fs = require("fs");
const path = require("path");
const appPath = app.getPath("userData");

let mainWindow;
let addWindow;
let addTimedWindow;
let addImagedWindow;
let tray = null;
// process.env.NODE_ENV = "development";
process.env.NODE_ENV = "production";

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
  mainWindow.on("minimize", function (event) {
    event.preventDefault();
    mainWindow.hide();
    tray = createTray();
  });

  mainWindow.on("restore", function (event) {
    // event.preventDefault();
    mainWindow.show();
    tray.destroy();
  });
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
        label: "اضافة مهمة مؤقتة",
        click() {
          createTimedWindow();
        },
      },
      {
        label: "اضافة مهمة مع صورة",
        click() {
          createImagedWindow();
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
];
if (process.platform === "darwin") {
  mainMenuTemplate.unshift({});
}
if (process.env.NODE_ENV != "production") {
  mainMenuTemplate.push({
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
  });
}

function createTray() {
  let iconPath = path.join(__dirname, "./assets/images/icon.png");
  let appIcon = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate(iconMenuTemplate);
  appIcon.on("double-click", function () {
    mainWindow.show();
  });
  appIcon.setToolTip("تطبيق المهام");
  appIcon.setContextMenu(contextMenu);
  return appIcon;
}
const iconMenuTemplate = [
  {
    label: "فتح",
    click() {
      mainWindow.show();
    },
  },
  {
    label: "خروج",
    click() {
      app.quit();
    },
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

function createTimedWindow() {
  addTimedWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
  
    },
  });
  addTimedWindow.loadFile("./views/timedTask.html");
  addTimedWindow.on("closed", (e) => {
    e.preventDefault();
    addTimedWindow = null;
  });
  addTimedWindow.removeMenu();
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

ipcMain.on("add-timed-note", function (e, note, notificationDate) {
  mainWindow.webContents.send("add-timed-note", note, notificationDate);
  addTimedWindow.close();
});

ipcMain.on("notify", function (e, note) {
  new Notification({
    title: "لديك تنبيه جديد",
    body: note,
    icon: path.join(__dirname, "./assets/images/icon.png"),
  }).show();
});

ipcMain.on("new-timed", function (e) {
  createTimedWindow();
});

function createImagedWindow() {
  addImagedWindow = new BrowserWindow({
    width: 400,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
    },
  });
  addImagedWindow.loadFile("./views/imagedTask.html");
  addImagedWindow.on("closed", (e) => {
    e.preventDefault();
    addImagedWindow = null;
  });
  addImagedWindow.removeMenu();
}

ipcMain.on("upload-image", function (event) {
  dialog
    .showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "images", extentions: ["jpg", "png", "gif"] }],
    })
    .then((result) => {
      event.sender.send("open-file", result.filePaths, appPath);
    });
});

ipcMain.on("add-imaged-task", function (event, note, imgURL) {
  mainWindow.webContents.send("add-imaged-task", note, imgURL);
  addImagedWindow.close();
});

ipcMain.on("new-imaged", function (event) {
  createImagedWindow();
});
