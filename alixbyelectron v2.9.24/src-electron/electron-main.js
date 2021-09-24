
const { app, BrowserWindow, dialog, screen, Menu, MenuItem, Tray, ipcMain, shell, nativeTheme, session } = require('electron');
const { spawn, execFile } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'));
  }
} catch (_) {}
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-site-isolation-trials');
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('disable-features', 'SameSiteByDefaultCookies');
app.commandLine.appendSwitch('disable-features', 'CookiesWithoutSameSiteMustBeSecure');
app.commandLine.appendSwitch('ignore-connections-limit', 'bj29.cn-beijing.data.alicloudccp.com,alicloudccp.com,aliyundrive.com');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');

let mainWindow;
let workUIWindow;
let config = require('path').join(app.getPath('userData'), 'config.json');
let ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 2.1.8 Chrome/89.0.4389.128 Electron/12.0.9 Safari/537.36';
let Referer = 'https://www.aliyundrive.com/';
let wwo_token = '';
app.setAppUserModelId('com.github.liupan1890');
app.name = 'alixby';
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function geticonpath(iconname) {
  if (process.env.DEBUGGING) {
    return path.join(app.getAppPath(), iconname);
  } else {
    let basePath = path.resolve(app.getAppPath(), '..'); 
    return path.join(basePath, iconname);
  }
}
const isDbu = false;
function createWindow() {
  Menu.setApplicationMenu(null); 
  let winWidth = 0;
  let winHeight = 0;

  if (existsSync(config)) {
    let configdata = JSON.parse(readFileSync(config, 'utf-8'));
    winWidth = configdata.width;
    winHeight = configdata.height;
  }
  if (winWidth <= 0) {
    winWidth = 640;
    winHeight = 500;
    try {
      let size = screen.getPrimaryDisplay().workAreaSize;
      let width = parseInt(size.width * 0.677);
      let height = parseInt(size.height * 0.866);
      if (width > winWidth) winWidth = width;
      if (winWidth > 980) winWidth = 980;
      if (height > winHeight) winHeight = height;
      if (winHeight > 720) winHeight = 720;
    } catch {
      winWidth = 900;
      winHeight = 600;
    }
  }
  mainWindow = new BrowserWindow({
    show: false,
    width: winWidth,
    height: winHeight,
    center: true,
    minWidth: 640,
    minHeight: 500,
    icon: geticonpath('app.png'),
    useContentSize: true,
    frame: false,
    hasShadow: true,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: isDbu || process.env.DEBUGGING,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: true,
      contextIsolation: false,
      backgroundThrottling: false,
      enableWebSQL: true,
      disableBlinkFeatures: 'OutOfBlinkCors,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD),
    },
  });

  mainWindow.loadURL(process.env.APP_URL, {
    userAgent: ua,
    httpReferrer: Referer,
  });
  if (isDbu || process.env.DEBUGGING) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }
  mainWindow.on('resize', () => {
    debounce(function () {
      try {
        if (mainWindow.isMaximized() == false && mainWindow.isMinimized() == false) {
          let s = mainWindow.getSize(); 
          writeFileSync(config, `{"width":${s[0].toString()},"height": ${s[1].toString()}}`, 'utf-8');
        }
      } catch {}
    }, 3000);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  mainWindow.on('ready-to-show', function () {
    mainWindow.show();
  });

  workUIWindow = new BrowserWindow({
    show: false,
    width: 10,
    height: 10,
    center: false,
    useContentSize: true,
    frame: false,
    hasShadow: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: isDbu || process.env.DEBUGGING,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: true,
      contextIsolation: false,
      backgroundThrottling: false,
      enableWebSQL: true,
      disableBlinkFeatures: 'OutOfBlinkCors,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOADUI),
    },
  });
  workUIWindow.loadURL(process.env.APP_URL, {
    userAgent: ua,
    httpReferrer: Referer,
  });
  mainWindow.webContents.send('winid', {
    main: mainWindow.id,
    workui: workUIWindow.id,
  });
  workUIWindow.webContents.send('winid', {
    main: mainWindow.id,
    workui: workUIWindow.id,
  });

  if (isDbu || process.env.DEBUGGING) {
  
    workUIWindow.webContents.openDevTools();
  }
  
}
let timer = null;
const debounce = (fn, wait) => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    fn();
  }, wait);
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});
app.on('will-quit', () => {
  try {
    if (appTray) appTray.destroy();
  } catch {
    //catch
  }
});

var appTray = null;

function createTray() {
  var trayMenuTemplate = [
    {
      label: '显示主界面',
      click: function () {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: '彻底退出并停止下载',
      click: function () {
        if (mainWindow) mainWindow.destroy();
        if (workUIWindow) workUIWindow.destroy();
        app.quit();
      },
    },
  ];

  let icon = geticonpath('app.ico');
  if (process.platform !== 'win32') icon = geticonpath('app.png');
  appTray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  appTray.setToolTip('阿里云盘小白羊版');
  appTray.setContextMenu(contextMenu);

  appTray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });
}
var menuEdit = null;
var menuCopy = null;

function createMenu() {
  menuEdit = new Menu();
  menuEdit.append(new MenuItem({ label: '剪切', role: 'cut' }));
  menuEdit.append(new MenuItem({ label: '复制', role: 'copy' }));
  menuEdit.append(new MenuItem({ label: '粘贴', role: 'paste' }));
  menuEdit.append(new MenuItem({ label: '删除', role: 'delete' }));
  menuEdit.append(new MenuItem({ label: '全选', role: 'selectall' }));

  menuCopy = new Menu();
  menuCopy.append(new MenuItem({ label: '复制', role: 'copy' }));
  menuCopy.append(new MenuItem({ label: '全选', role: 'selectall' }));
}
function ShowErrorAndExit(title, errmsg) {
  dialog
    .showMessageBox({
      type: 'error',
      buttons: ['ok'],
      title: title + '，小白羊将自动退出',
      message: '错误信息:' + errmsg,
    })
    .then((_) => {
      setTimeout(() => {
        app.quit();
      }, 100);
    });
}

app.setAboutPanelOptions({
  applicationName: '阿里云盘小白羊版',
  copyright: 'liupan1890',
  website: 'https://github.com/liupan1890/aliyunpan',
  iconPath: geticonpath('app.png'),
  applicationVersion: 'v2.9.24',
});

app
  .whenReady()
  .then(() => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, cb) => {
      const iswwo_token = wwo_token != '' && details.url.indexOf('/office') > 0;
      const should115referer = details.url.indexOf('.115.com') > 0;
      const shouldaliReferer = should115referer == false && (details.referrer == undefined || details.referrer.trim() === '' || /(\/localhost:)|(^file:\/\/)/.exec(details.referrer) !== null);

      cb({
        cancel: false,
        requestHeaders: {
          ...details.requestHeaders,
          ...(should115referer && {
            Referer: 'http://115.com/s/swn4bs33z88',
            Origin: 'http://115.com',
          }),
          ...(shouldaliReferer && {
            Referer: 'https://www.aliyundrive.com/',
          }),
          ...(iswwo_token && { Cookie: 'weboffice_cdn=1; lang=zh-CN; wwo_token=' + wwo_token, 'x-user-token': wwo_token }),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 2.1.8 Chrome/89.0.4389.128 Electron/12.0.9 Safari/537.36',
        },
      });
    });
    process.on('uncaughtException', (err) => {
      const stack = err.stack || '';
      if (app.isReady()) ShowErrorAndExit('发生未定义的异常', err.message + '\n' + stack);
    });
    createMenu();
    createTray();
    createWindow();

    let basePath = path.resolve(app.getAppPath(), '..'); 
    let ariaPath = '';
    if (process.platform === 'win32') {
      ariaPath = path.join(basePath, 'aria2c.exe');
    } else if (process.platform === 'darwin') {
      ariaPath = path.join(basePath, 'aria2c');
    } else if (process.platform === 'linux') {
      ariaPath = path.join(basePath, 'aria2c');
    }

    let confPath = path.join(basePath, 'aria2.conf');
    
    const options = { detached: true, stdio: 'ignore' };
    const subprocess = spawn(
      ariaPath,
      [
        '--stop-with-process=' + process.pid,
        '-D',
        '--enable-rpc=true',
        '--rpc-allow-origin-all=true',
        '--rpc-listen-all=false',
        '--rpc-listen-port=29384',
        '--rpc-secret=S4znWTaZYQ!i3cp^RN_b',
        '--rpc-secure=false',
        '--auto-file-renaming=false',
        '--check-certificate=false',
        '--conf-path=' + confPath,
      ],
      options
    );

    subprocess.unref();
  })
  .catch((e) => {
    console.log(e);
  }); 
ipcMain.on('WebToElectron', (event, data) => {
  if (data.cmd && data.cmd === 'close') {
    if (mainWindow) mainWindow.hide();
  } else if (data.cmd && data.cmd === 'minsize') {
    if (mainWindow) mainWindow.minimize();
  } else if (data.cmd && data.cmd === 'maxsize') {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  } else if (data.cmd && data.cmd === 'menuedit') {
    if (menuEdit) menuEdit.popup();
  } else if (data.cmd && data.cmd === 'menucopy') {
    if (menuCopy) menuCopy.popup();
  } else {
    event.sender.send('ElectronToWeb', 'mainsenddata');
  }
});

ipcMain.on('WebToElectronCB', (event, data) => {
  if (data.cmd && data.cmd === 'maxsize') {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
        event.returnValue = 'unmaximize';
      } else {
        mainWindow.maximize();
        event.returnValue = 'maximize';
      }
    }
  } else {
    event.returnValue = 'backdata';
  }
});

ipcMain.on('WebShowOpenDialogSync', (event, config) => {
  event.returnValue = dialog.showOpenDialogSync(mainWindow, config);
});

ipcMain.on('WebShowSaveDialogSync', (event, config) => {
  event.returnValue = dialog.showSaveDialogSync(mainWindow, config);
});
ipcMain.on('WebShowItemInFolder', (event, fullpath) => {
  for (let i = 0; i < 5; i++) {
    if (existsSync(fullpath)) break;
    if (fullpath.lastIndexOf(path.sep) > 0) {
      fullpath = fullpath.substring(0, fullpath.lastIndexOf(path.sep));
    } else return;
  }
  if (fullpath.length > 2) shell.showItemInFolder(fullpath);
});
ipcMain.on('WebPlatformSync', (event) => {
  let basePath = path.resolve(app.getAppPath(), '..'); 
  let findMPV = process.platform !== 'win32' || existsSync(path.join(basePath, 'MPV', 'mpv.exe'));
  let findPotplayer = process.platform === 'win32' && existsSync(path.join(basePath, 'PotPlayer', 'PotPlayer.exe'));
  event.returnValue = {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    execPath: process.execPath,
    argv0: process.argv0,
    findMPV,
    findPotplayer,
  };
});

ipcMain.on('WebSpawnSync', (event, data) => {
  const options = { ...data.options };
  options.detached = true;
  options.stdio = 'ignore';
  if (data.command === 'potplayer') {
    if (process.platform === 'win32') {
      let basePath = path.resolve(app.getAppPath(), '..'); 
      data.command = path.join(basePath, 'PotPlayer', 'PotPlayer.exe');
    }
  }
  if (data.command === 'mpv') {
    let basePath = path.resolve(app.getAppPath(), '..'); 
    if (process.platform === 'win32') {
      data.command = path.join(basePath, 'MPV', 'mpv.exe');
    } else if (process.platform === 'darwin') {
      data.command = path.join(basePath, 'mpv');
    } else if (process.platform === 'linux') {
      data.command = 'mpv';
    }
  }
  const subprocess = spawn(data.command, data.args, options);
  const ret = {
    exitCode: subprocess.exitCode,
    pid: subprocess.pid,
    spawnfile: subprocess.spawnfile,
    command: data.command,
  };
  subprocess.unref();
  event.returnValue = ret;
});
ipcMain.on('WebClearCookies', (event, data) => {
  session.defaultSession.clearStorageData({ storages: ['cookies', 'localstorage', 'cachestorage'] });

});

ipcMain.on('WebSetCookies', (event, data) => {
  for (let i = 0; i < data.length; i++) {
    const cookie = {
      url: data[i].url,
      name: data[i].name,
      value: data[i].value,
      domain: '.' + data[i].url.substring(data[i].url.lastIndexOf('/') + 1),
      secure: data[i].url.indexOf('https://') == 0,
      expirationDate: data[i].expirationDate,
    };
    if (data[i].name == 'wwo_token') wwo_token = data[i].value;
    session.defaultSession.cookies.set(cookie, (error) => {
      if (error) console.error(error);
    });
  }
});

ipcMain.handle('WebFileHash', async (event, data) => {
  let basePath = path.resolve(app.getAppPath(), '..'); 
  let exepath = '';
  if (process.platform === 'win32') {
    exepath = path.join(basePath, 'filehash32.exe');
  } else if (process.platform === 'darwin') {
    exepath = path.join(basePath, 'filehashm');
  } else if (process.platform === 'linux') {
    exepath = path.join(basePath, 'filehashl');
  }
  let args = ['--hash=' + data.hash, '--inputfile=' + data.inputfile];
  let result = await new Promise((resolve) => {
    execFile(exepath, args, function (_err, stdout, _stderr) {
      if (stdout == undefined) stdout = '';
      resolve(stdout);
    });
  });
  return result;
});
