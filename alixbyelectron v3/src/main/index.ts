import { getCrxPath, getResourcesPath, getUserDataPath, mkAriaConf } from './mainfile'

const { app, BrowserWindow, dialog, Menu, MenuItem, Tray, ipcMain, shell, nativeTheme, session, net } = require('electron')
const { exec, spawn } = require('child_process')
const { existsSync, readFileSync, writeFileSync } = require('fs')
const path = require('path')

app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendArgument('--disable-web-security')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure')
app.commandLine.appendSwitch('ignore-connections-limit', 'bj29.cn-beijing.data.alicloudccp.com,alicloudccp.com,api.aliyundrive.com,aliyundrive.com')
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('proxy-bypass-list', '<local>')
app.commandLine.appendSwitch('wm-window-animations-disabled');
app.disableHardwareAcceleration()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

let userData = getResourcesPath('userdir.config')
try {
  if (existsSync(userData)) {
    let configdata = readFileSync(userData, 'utf-8')
    if (configdata) app.setPath('userData', configdata)
  }
} catch {}
let proxyData = getResourcesPath('proxy.config')
try {
  if (existsSync(proxyData)) {
    let configdata = readFileSync(proxyData, 'utf-8')
    if (configdata) app.commandLine.appendSwitch('proxy-server', configdata)
  }
} catch {}
app.commandLine.appendSwitch('proxy-server', '192.168.31.74:8888')

let ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 2.1.8 Chrome/89.0.4389.128 Electron/12.0.9 Safari/537.36'
let Referer = 'https://www.aliyundrive.com/'
app.setAppUserModelId('com.github.liupan1890')
app.name = 'alixby'
const gotTheLock = app.requestSingleInstanceLock()
const isDbu = false
const DEBUGGING = process.env.NODE_ENV === 'development'
let mainWindow: Electron.BrowserWindow | null = null
let workerWindow: Electron.BrowserWindow | null = null

if (DEBUGGING == false) {
  if (!gotTheLock) {
    app.exit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (commandLine && commandLine.join(' ').indexOf('exit') >= 0) {
        app.exit()
      } else if (mainWindow && mainWindow.isDestroyed() == false) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      }
    })
  }
}
if (process.argv && process.argv.join(' ').indexOf('exit') >= 0) {
  app.exit()
}
process.on('uncaughtException', (err) => {
  const stack = err.stack || ''
  if (app.isReady()) ShowErrorAndExit('发生未定义的异常', err.message + '\n' + stack)
})

function createWindow() {
  Menu.setApplicationMenu(null)
  let winWidth = 0
  let winHeight = 0
  let bgcolor = '#ffffff'
  try {
    const configjson = getUserDataPath('config.json')
    if (existsSync(configjson)) {
      let configdata = JSON.parse(readFileSync(configjson, 'utf-8'))
      winWidth = configdata.width
      winHeight = configdata.height
    }
  } catch {}
  try {
    const themejson = getUserDataPath('theme.json')
    if (existsSync(themejson)) {
      let themedata = JSON.parse(readFileSync(themejson, 'utf-8'))
      bgcolor = themedata.theme == 'dark' ? '#23232e' : '#ffffff'
    }
  } catch {}
  if (winWidth <= 0) {
    winWidth = 640
    winHeight = 500
    try {
      const { screen } = require('electron')
      let size = screen.getPrimaryDisplay().workAreaSize
      let width = size.width * 0.677
      let height = size.height * 0.866
      if (width > winWidth) winWidth = width
      if (size.width >= 970 && width < 970) width = 970
      if (winWidth > 1080) winWidth = 1080
      if (height > winHeight) winHeight = height
      if (winHeight > 720) winHeight = 720
    } catch {
      winWidth = 970
      winHeight = 600
    }
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: winWidth,
    height: winHeight,
    center: true,
    minWidth: 640,
    minHeight: 500,
    icon: getResourcesPath('app.png'),
    useContentSize: true,
    frame: false,
    hasShadow: true,
    autoHideMenuBar: true,
    backgroundColor: bgcolor,
    webPreferences: {
      spellcheck: false,
      devTools: isDbu || DEBUGGING,
      webviewTag: true,
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
      preload: path.resolve(__dirname, 'preload.js')
    }
  })
  mainWindow.removeMenu()
  if (DEBUGGING) {
    mainWindow.loadURL('http://localhost:1666/', {
      userAgent: ua,
      httpReferrer: Referer
    })
  } else {
    mainWindow.loadURL('file://' + path.join(__dirname, '../renderer/index.html'), {
      userAgent: ua,
      httpReferrer: Referer
    })
  }

  if (isDbu || DEBUGGING) {
    mainWindow.webContents.session.setProxy({
      proxyRules: 'http=192.168.31.74:8888;https=192.168.31.74:8888'
    })
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.webContents.on('devtools-opened', () => {
      if (mainWindow) mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('resize', () => {
    debounce(function () {
      try {
        if (mainWindow && mainWindow.isMaximized() == false && mainWindow.isMinimized() == false && mainWindow.isFullScreen() == false) {
          let s = mainWindow!.getSize()
          const configjson = getUserDataPath('config.json')
          writeFileSync(configjson, `{"width":${s[0].toString()},"height": ${s[1].toString()}}`, 'utf-8')
        }
      } catch {}
    }, 3000)
  })

  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
    } else {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  mainWindow.on('closed', (event: any) => {
    app.quit()
  })

  mainWindow.on('ready-to-show', function () {
    mainWindow!.webContents.send('showPage', { showPage: 'pageMain' })
    mainWindow!.webContents.send('setTheme', { dark: nativeTheme.shouldUseDarkColors })
    mainWindow!.setTitle('阿里云盘小白羊版')
    mainWindow!.show()
  })
  mainWindow.webContents.on('render-process-gone', function (event, details) {
    if (details.reason == 'crashed' || details.reason == 'oom' || details.reason == 'killed') {
      ShowErrorAndRelanch('(⊙o⊙)？小白羊遇到错误崩溃了', details.reason)
    }
  })
  mainWindow.webContents.on('did-create-window', (childWindow) => {
    if (process.platform === 'win32') {
      childWindow.setMenu(null)
    }
  })

  creatWorker()
}

function creatWorker() {
  if (workerWindow != null) return
  workerWindow = new BrowserWindow({
    show: false,
    width: 10,
    height: 10,
    center: false,
    useContentSize: true,
    frame: false,
    hasShadow: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: isDbu || DEBUGGING,
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
      preload: path.resolve(__dirname, 'preload.js')
    }
  })
  if (DEBUGGING) {
    workerWindow.loadURL('http://localhost:1666/', {
      userAgent: ua,
      httpReferrer: Referer
    })
  } else {
    workerWindow.loadURL('file://' + path.join(__dirname, '../renderer/index.html'), {
      userAgent: ua,
      httpReferrer: Referer
    })
  }

  workerWindow.on('ready-to-show', function () {
    workerWindow!.webContents.send('showPage', { showPage: 'pageWorker' })
  })

  if (isDbu || DEBUGGING) {
    workerWindow.webContents.session.setProxy({
    })
  } else {
    workerWindow.webContents.on('devtools-opened', () => {
      if (workerWindow) workerWindow.webContents.closeDevTools()
    })
  }

  workerWindow.webContents.on('render-process-gone', function (event, details) {
    if (details.reason == 'crashed' || details.reason == 'oom' || details.reason == 'killed' || details.reason == 'integrity-failure') {
      try {
        workerWindow?.destroy()
      } catch {}
      workerWindow = null
      creatWorker()
    }
  })
}

function creatAria() {
  try {
    let basePath = path.resolve(app.getAppPath(), '..')
    if (DEBUGGING) basePath = path.resolve(app.getAppPath(), '..', '..', '..')
    let ariaPath = ''
    if (process.platform === 'win32') {
      ariaPath = path.join(basePath, 'aria2c.exe')
    } else if (process.platform === 'darwin') {
      ariaPath = path.join(basePath, 'aria2c')
    } else if (process.platform === 'linux') {
      ariaPath = path.join(basePath, 'aria2c')
    }
    if (existsSync(ariaPath) == false) {
      ShowError('找不到Aria程序文件', ariaPath)
      return
    }

    let confPath = path.join(basePath, 'aria2.conf')
    if (existsSync(confPath) == false) mkAriaConf(confPath)

    const options = { detached: true, stdio: 'ignore' }
    const subprocess = spawn(
      ariaPath,
      [
        '--stop-with-process=' + process.pid,
        '-D',
        '--enable-rpc=true',
        '--rpc-allow-origin-all=true',
        '--rpc-listen-all=false',
        '--rpc-listen-port=29384',
        '--rpc-secret=S4znWTaZYQi3cpRNb',
        '--rpc-secure=false',
        '--auto-file-renaming=false',
        '--check-certificate=false',
        '--async-dns=false',
        "--conf-path='" + confPath + "'"
      ],
      options
    )
    subprocess.unref()
  } catch {}
}

let timer: NodeJS.Timeout | null = null
const debounce = (fn: any, wait: number) => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    fn()
  }, wait)
}

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow == null || mainWindow.isDestroyed()) createWindow()
  else {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
})

app.on('will-quit', () => {
  try {
    if (appTray) {
      appTray.destroy()
      appTray = null
    }
  } catch {
  }
})

var appTray: Electron.Tray | null = null

function createTray() {
  var trayMenuTemplate = [
    {
      label: '显示主界面',
      click: function () {
        if (mainWindow && mainWindow.isDestroyed() == false) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.show()
          mainWindow.focus()
        } else {
          createWindow()
        }
      }
    },
    {
      label: '彻底退出并停止下载',
      click: function () {
        if (mainWindow) {
          mainWindow.destroy()
          mainWindow = null
        }
        app.quit()
      }
    }
  ]

  let icon = getResourcesPath('app.ico')
  if (process.platform !== 'win32') icon = getResourcesPath('app.png')
  appTray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate)
  appTray.setToolTip('阿里云盘小白羊版')
  appTray.setContextMenu(contextMenu)

  appTray.on('click', () => {
    if (mainWindow && mainWindow.isDestroyed() == false) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    } else {
      createWindow()
    }
  })
}
var menuEdit: Electron.Menu | null = null
var menuCopy: Electron.Menu | null = null

function createMenu() {
  menuEdit = new Menu()
  menuEdit.append(new MenuItem({ label: '剪切', role: 'cut' }))
  menuEdit.append(new MenuItem({ label: '复制', role: 'copy' }))
  menuEdit.append(new MenuItem({ label: '粘贴', role: 'paste' }))
  menuEdit.append(new MenuItem({ label: '删除', role: 'delete' }))
  menuEdit.append(new MenuItem({ label: '全选', role: 'selectAll' }))

  menuCopy = new Menu()
  menuCopy.append(new MenuItem({ label: '复制', role: 'copy' }))
  menuCopy.append(new MenuItem({ label: '全选', role: 'selectAll' }))
}
function ShowErrorAndExit(title: string, errmsg: string) {
  dialog
    .showMessageBox({
      type: 'error',
      buttons: ['ok'],
      title: title + '，小白羊将自动退出',
      message: '错误信息:' + errmsg
    })
    .then((_) => {
      setTimeout(() => {
        try {
          app.exit()
        } catch {}
      }, 100)
    })
}
function ShowErrorAndRelanch(title: string, errmsg: string) {
  dialog
    .showMessageBox({
      type: 'error',
      buttons: ['ok'],
      title: title + '，小白羊将自动退出',
      message: '错误信息:' + errmsg
    })
    .then((_) => {
      setTimeout(() => {
        app.relaunch()
        try {
          app.exit()
        } catch {}
      }, 100)
    })
}
function ShowError(title: string, errmsg: string) {
  dialog
    .showMessageBox({
      type: 'error',
      buttons: ['ok'],
      title: title,
      message: '错误信息:' + errmsg
    })
    .then((_) => {})
}

app.setAboutPanelOptions({
  applicationName: '阿里云盘小白羊版',
  copyright: 'liupan1890',
  website: 'https://github.com/liupan1890/aliyunpan',
  iconPath: getResourcesPath('app.png'),
  applicationVersion: '30'
})

let usertoken: { access_token: string; user_id: string; refresh: boolean } = {
  access_token: '',
  user_id: '',
  refresh: false
}

app
  .whenReady()
  .then(() => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, cb) => {
      const should115referer = details.url.indexOf('.115.com') > 0
      const shouldaliReferer = should115referer == false && (details.referrer == undefined || details.referrer.trim() === '' || /(\/localhost:)|(^file:\/\/)/.exec(details.referrer) !== null)
      const shouldtoken = details.url.indexOf('/file/download?') > 0

      cb({
        cancel: false,
        requestHeaders: {
          ...details.requestHeaders,
          ...(should115referer && {
            Referer: 'http://115.com/s/swn4bs33z88',
            Origin: 'http://115.com'
          }),
          ...(shouldaliReferer && {
            Referer: 'https://www.aliyundrive.com/'
          }),
          ...(shouldtoken && {
            Authorization: usertoken.access_token
          }),

          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) 2.1.8 Chrome/89.0.4389.128 Electron/12.0.9 Safari/537.36'
        }
      })
    })

    session.defaultSession.loadExtension(getCrxPath(), { allowFileAccess: true }).then((le) => {
      console.log('loadExtension success', le)
      creatAria()
      createMenu()
      createTray()
      createWindow()
    })
  })
  .catch((e) => {
    console.log(e)
  })

nativeTheme.on('updated', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('setTheme', { dark: nativeTheme.shouldUseDarkColors })
})

ipcMain.on('winmsgmain', (event, data) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('winmsg', data)
})
ipcMain.on('winmsgui', (event, data) => {
  if (workerWindow && !workerWindow.isDestroyed()) workerWindow.webContents.send('winmsg', data)
})

ipcMain.on('WebToElectron', (event, data) => {
  if (data.cmd && data.cmd === 'close') {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide()
  } else if (data.cmd && data.cmd === 'exit') {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.destroy()
      mainWindow = null
    }
    try {
      app.exit()
    } catch {}
  } else if (data.cmd && data.cmd === 'minsize') {
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize()
  } else if (data.cmd && data.cmd === 'maxsize') {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
      } else {
        mainWindow.maximize()
      }
    }
  } else if (data.cmd && data.cmd === 'menuedit') {
    if (menuEdit) menuEdit.popup()
  } else if (data.cmd && data.cmd === 'menucopy') {
    if (menuCopy) menuCopy.popup()
  } else {
    event.sender.send('ElectronToWeb', 'mainsenddata')
  }
})

ipcMain.on('WebToElectronCB', (event, data) => {
  if (data.cmd && data.cmd === 'maxsize') {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
        event.returnValue = 'unmaximize'
      } else {
        mainWindow.maximize()
        event.returnValue = 'maximize'
      }
    }
  } else {
    event.returnValue = 'backdata'
  }
})

ipcMain.on('WebShowOpenDialogSync', (event, config) => {
  dialog.showOpenDialog(mainWindow!, config).then((result) => {
    event.returnValue = result.filePaths
  })
})

ipcMain.on('WebShowSaveDialogSync', (event, config) => {
  dialog.showSaveDialog(mainWindow!, config).then((result) => {
    event.returnValue = result.filePath || ''
  })
})

ipcMain.on('WebShowItemInFolder', (event, fullpath) => {
  for (let i = 0; i < 5; i++) {
    if (existsSync(fullpath)) break
    if (fullpath.lastIndexOf(path.sep) > 0) {
      fullpath = fullpath.substring(0, fullpath.lastIndexOf(path.sep))
    } else return
  }
  if (fullpath.length > 2) shell.showItemInFolder(fullpath)
})
ipcMain.on('WebPlatformSync', (event) => {
  let basePath = path.resolve(app.getAppPath(), '..')
  let findMPV = process.platform !== 'win32' || existsSync(path.join(basePath, 'MPV', 'mpv.exe'))
  let appPath = app.getPath('userData')
  event.returnValue = {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    execPath: process.execPath,
    appPath: appPath,
    argv0: process.argv0,
    findMPV
  }
})

ipcMain.on('WebSpawnSync', (event, data) => {
  try {
    const options = { ...data.options }
    options.detached = true
    options.stdio = 'ignore'
    if (data.command === 'potplayer') {
      if (process.platform === 'win32') {
        let basePath = path.resolve(app.getAppPath(), '..')
        data.command = path.join(basePath, 'PotPlayer', 'PotPlayer.exe')
      }
    }
    if (data.command === 'mpv') {
      let basePath = path.resolve(app.getAppPath(), '..')
      if (process.platform === 'win32') {
        data.command = path.join(basePath, 'MPV', 'mpv.exe')
      } else if (process.platform === 'darwin') {
        data.command = path.join(basePath, 'mpv')
      } else if (process.platform === 'linux') {
        data.command = 'mpv'
      }
    }
    if (process.platform === 'win32' && existsSync(data.command) == false) {
      event.returnValue = { error: '找不到文件' + data.command }
      ShowError('找不到文件', data.command)
    } else {
      const subprocess = spawn(data.command, data.args, options)
      const ret = {
        data: data,
        exitCode: subprocess.exitCode,
        pid: subprocess.pid,
        spawnfile: subprocess.spawnfile,
        command: data.command
      }
      subprocess.unref()
      event.returnValue = ret
    }
  } catch (e: any) {
    event.returnValue = { error: e }
  }
})
ipcMain.on('WebExecSync', (event, data) => {
  try {
    let cmdarguments = []
    if (data.command === 'mpv') {
      let basePath = path.resolve(app.getAppPath(), '..')
      if (process.platform === 'win32') {
        const exe = path.join(basePath, 'MPV', 'mpv.exe')
        if (existsSync(exe) == false) {
          event.returnValue = { error: '找不到文件' + data.command }
          ShowError('找不到文件', data.command)
          return
        }
        cmdarguments.push('"' + exe + '"')
      } else if (process.platform === 'darwin') {
        const exe = path.join(basePath, 'mpv')
        if (existsSync(exe) == false) {
          event.returnValue = { error: '找不到文件' + data.command }
          ShowError('找不到文件', data.command)
          return
        }
        cmdarguments.push("'" + exe + "'")
      } else if (process.platform === 'linux') {
        cmdarguments.push('mpv')
      }
    } else {
      cmdarguments.push(data.command)
    }

    if (data.args) cmdarguments.push(...data.args)

    const finalcmd = cmdarguments.join(' ')
    exec(finalcmd, (err: any) => {
      event.returnValue = err
    })
    event.returnValue = ''
  } catch (e: any) {
    event.returnValue = { error: e }
  }
})

ipcMain.on('WebClearCookies', (event, data) => {
  session.defaultSession.clearStorageData(data)
})
ipcMain.on('WebSaveTheme', (event, data) => {
  try {
    const themejson = getUserDataPath('theme.json')
    writeFileSync(themejson, `{"theme":"${data.theme || ''}"}`, 'utf-8')
  } catch {}
})

ipcMain.on('WebClearCache', (event, data) => {
  if (data.cache) {
    session.defaultSession.clearCache()
    session.defaultSession.clearAuthCache()
  } else {
    session.defaultSession.clearStorageData(data)
  }
})

ipcMain.on('WebUserToken', (event, data) => {
  if (data.login) {
    usertoken = data
  } else if (usertoken.user_id == data.user_id) {
    usertoken = data
  } else {
  }
})
ipcMain.on('WebReload', (event, data) => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.reload()
})
ipcMain.on('WebRelaunch', (event, data) => {
  app.relaunch()
  try {
    app.exit()
  } catch {}
})

ipcMain.on('WebRelaunchAria', (event, data) => {
  debounce(function () {
    try {
      creatAria()
    } catch {}
  }, 2000)
})

ipcMain.on('WebSetProgressBar', (event, data) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (data.pro) mainWindow.setProgressBar(data.pro)
    else mainWindow.setProgressBar(-1)
  }
})

ipcMain.on('WebSetCookies', (event, data) => {
  for (let i = 0, maxi = data.length; i < maxi; i++) {
    const cookie = {
      url: data[i].url,
      name: data[i].name,
      value: data[i].value,
      domain: '.' + data[i].url.substring(data[i].url.lastIndexOf('/') + 1),
      secure: data[i].url.indexOf('https://') == 0,
      expirationDate: data[i].expirationDate
    }
    session.defaultSession.cookies.set(cookie).catch((e) => console.error(e))
  }
})

ipcMain.on('WebShutDown', (event, data) => {
  if (process.platform === 'darwin') {
    const shutdownCmd = 'osascript -e \'tell application "System Events" to shut down\''
    exec(shutdownCmd, (err: any) => {
      if (data.quitapp) {
        try {
          app.exit()
        } catch {}
      }
    })
  } else {
    const cmdarguments = ['shutdown']
    if (process.platform === 'linux') {
      if (data.sudo) {
        cmdarguments.unshift('sudo')
      }
      cmdarguments.push('-h')
      cmdarguments.push('now')
    }
    if (process.platform === 'win32') {
      cmdarguments.push('-s')
      cmdarguments.push('-f')
      cmdarguments.push('-t 0')
    }

    const finalcmd = cmdarguments.join(' ')
    exec(finalcmd, (err: any) => {
      if (data.quitapp) {
        try {
          app.exit()
        } catch {}
      }
    })
  }
})

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
})
ipcMain.on('WebOpenWindow', (event, data) => {
  let width = mainWindow && !mainWindow.isDestroyed() ? mainWindow.getSize() : [900, 700]
  let win = new BrowserWindow({
    show: false,
    width: width[0],
    height: width[1],
    center: true,
    minWidth: 640,
    minHeight: 500,
    icon: getResourcesPath('app.png'),
    useContentSize: true,
    frame: false,
    hasShadow: true,
    autoHideMenuBar: true,
    backgroundColor: data.theme && data.theme == 'dark' ? '#23232e' : '#ffffff',
    webPreferences: {
      spellcheck: false,
      devTools: isDbu || DEBUGGING,
      webviewTag: true,
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      enableRemoteModule: true,
      contextIsolation: false,
      backgroundThrottling: false,
      enableWebSQL: false,
      disableBlinkFeatures: 'OutOfBlinkCors,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
      preload: path.resolve(__dirname, 'preload.js')
    }
  })
  win.removeMenu()
  if (DEBUGGING) {
    win.loadURL('http://localhost:1666/', {
      userAgent: ua,
      httpReferrer: Referer
    })
  } else {
    win.loadURL('file://' + path.join(__dirname, '../renderer/index.html'), {
      userAgent: ua,
      httpReferrer: Referer
    })
  }

  win.webContents.session.setProxy({
  })

  if (isDbu || DEBUGGING) {
    win.webContents.openDevTools()
  } else {
    win.webContents.on('devtools-opened', () => {
      if (win) win.webContents.closeDevTools()
    })
  }

  win.on('ready-to-show', function () {
    win.webContents.send('showPage', data)
    win.setTitle('预览窗口')
    win.show()
  })
})
