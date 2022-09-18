import { getCrxPath, getResourcesPath, getUserDataPath } from './mainfile'
import { release } from 'os'
import { AppWindow, creatElectronWindow, createMainWindow, createTray, Referer, ShowError, ShowErrorAndExit, ua } from './window'
const { app, BrowserWindow, dialog, Menu, MenuItem, ipcMain, shell, session } = require('electron')
const { exec, spawn } = require('child_process')
const { existsSync, readFileSync, writeFileSync } = require('fs')
const path = require('path')


if (release().startsWith('6.1')) app.disableHardwareAcceleration()

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
})
process.on('uncaughtException', (err) => {
  const stack = err.stack || ''
  if (app.isReady()) ShowErrorAndExit('发生未定义的异常', err.message + '\n' + stack)
})


//app.commandLine.appendSwitch('proxy-server', '192.168.31.74:8888')
app.commandLine.appendSwitch('no-sandbox')
app.commandLine.appendSwitch('disable-web-security')
app.commandLine.appendSwitch('disable-renderer-backgrounding')
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure')
app.commandLine.appendSwitch('ignore-connections-limit', 'bj29.cn-beijing.data.alicloudccp.com,alicloudccp.com,api.aliyundrive.com,aliyundrive.com')
app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('proxy-bypass-list', '<local>')
app.commandLine.appendSwitch('wm-window-animations-disabled')

app.setAppUserModelId('com.github.liupan1890')
app.name = 'alixby3'
const DEBUGGING = !app.isPackaged

let userData = getResourcesPath('userdir.config')
try {
  if (existsSync(userData)) {
    let configdata = readFileSync(userData, 'utf-8')
    if (configdata) app.setPath('userData', configdata)
  }
} catch {}

const gotTheLock = app.requestSingleInstanceLock()
if (DEBUGGING == false) {
  if (!gotTheLock) {
    app.exit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (commandLine && commandLine.join(' ').indexOf('exit') >= 0) {
        app.exit()
      } else if (AppWindow.mainWindow && AppWindow.mainWindow.isDestroyed() == false) {
        if (AppWindow.mainWindow.isMinimized()) AppWindow.mainWindow.restore()
        AppWindow.mainWindow.show()
        AppWindow.mainWindow.focus()
      }
    })
  }
}

if (process.argv && process.argv.join(' ').indexOf('exit') >= 0) {
  app.exit()
}
app.on('window-all-closed', () => {
  app.quit()
  if (process.platform !== 'darwin') app.quit() //未测试应该使用哪一个
})

app.on('activate', () => {
  if (AppWindow.mainWindow == null || AppWindow.mainWindow.isDestroyed()) createMainWindow()
  else {
    if (AppWindow.mainWindow.isMinimized()) AppWindow.mainWindow.restore()
    AppWindow.mainWindow.show()
    AppWindow.mainWindow.focus()
  }
})

app.on('will-quit', () => {
  try {
    if (AppWindow.appTray) {
      AppWindow.appTray.destroy()
      AppWindow.appTray = null
    }
  } catch {
    
  }
})

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
ipcMain.on('WebUserToken', (event, data) => {
  if (data.login) {
    usertoken = data
  } else if (usertoken.user_id == data.user_id) {
    usertoken = data
    //ShowError('WebUserToken', 'update' + data.name)
  } else {
    //ShowError('WebUserToken', 'nothing' + data.name)
  }
})

app
  .whenReady()
  .then(() => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, cb) => {
      
      const should115referer = details.url.indexOf('.115.com') > 0
      const shouldgieereferer = details.url.indexOf('gitee.com') > 0
      const shouldaliOrigin = details.url.indexOf('.aliyundrive.com') > 0

      const shouldaliReferer = !should115referer && !shouldgieereferer && (details.referrer == undefined || details.referrer.trim() === '' || /(\/localhost:)|(^file:\/\/)|(\/127.0.0.1:)/.exec(details.referrer) !== null)
      const shouldtoken = details.url.includes('aliyundrive') && details.url.includes('download')

      cb({
        cancel: false,
        requestHeaders: {
          ...details.requestHeaders,
          ...(should115referer && {
            Referer: 'http://115.com/s/swn4bs33z88',
            Origin: 'http://115.com'
          }),
          ...(shouldgieereferer && {
            Referer: 'https://gitee.com/'
          }),
          ...(shouldaliOrigin && {
            Origin: 'https://www.aliyundrive.com'
          }),
          ...(shouldaliReferer && {
            Referer: 'https://www.aliyundrive.com/'
          }),
          ...(shouldtoken && {
            Authorization: usertoken.access_token
          }),
          'X-Canary': 'client=web,app=adrive,version=v3.0.0',
          'Accept-Language': 'zh-CN,zh;q=0.9'
        }
      })
    })

    session.defaultSession.loadExtension(getCrxPath(), { allowFileAccess: true }).then((le) => {
      createMenu()
      createTray()
      createMainWindow()
    })
  })
  .catch((err: any) => {
    console.log(err)
  })


var menuEdit: Electron.Menu | null = null
var menuCopy: Electron.Menu | null = null

export function createMenu() {
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

ipcMain.on('WebToElectron', (event, data) => {
  let mainWindow = AppWindow.mainWindow
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
  let mainWindow = AppWindow.mainWindow
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
  dialog.showOpenDialog(AppWindow.mainWindow!, config).then((result) => {
    event.returnValue = result.filePaths
  })
})

ipcMain.on('WebShowSaveDialogSync', (event, config) => {
  dialog.showSaveDialog(AppWindow.mainWindow!, config).then((result) => {
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
  let asarPath = app.getAppPath()
  let basePath = path.resolve(asarPath, '..') 
  let findMPV = process.platform !== 'win32' || existsSync(path.join(basePath, 'MPV', 'mpv.exe'))
  let appPath = app.getPath('userData')
  event.returnValue = {
    platform: process.platform,
    arch: process.arch,
    version: process.version,
    execPath: process.execPath,
    appPath: appPath,
    asarPath: asarPath,
    argv0: process.argv0,
    findMPV
  }
})

ipcMain.on('WebSpawnSync', (event, data) => {
  try {
    const options = { ...data.options }
    options.detached = true
    options.stdio = 'ignore'

    if (data.command === 'mpv') {
      let basePath = path.resolve(app.getAppPath(), '..') 
      if (process.platform === 'win32') {
        data.command = path.join(basePath, 'MPV', 'mpv.exe')
      } else if (process.platform === 'darwin') {
        data.command = path.join(basePath, 'mpv')
      } else {
        data.command = 'mpv'
      }
    }

    if ((process.platform === 'win32' || process.platform === 'darwin') && existsSync(data.command) == false) {
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
  } catch (err: any) {
    event.returnValue = { error: err }
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
          event.returnValue = { error: '找不到文件' + data.command + ' ' + exe }
          ShowError('找不到文件', data.command + ' ' + exe)
          return
        }
        cmdarguments.push('"' + exe + '"')
      } else if (process.platform === 'darwin') {
        const exe = path.join(basePath, 'mpv')
        if (existsSync(exe) == false) {
          event.returnValue = { error: '找不到文件' + data.command + ' ' + exe }
          ShowError('找不到文件', data.command + ' ' + exe)
          return
        }
        cmdarguments.push("'" + exe + "'")
      } else {
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
  } catch (err: any) {
    event.returnValue = { error: err }
  }
})

ipcMain.on('WebSaveTheme', (event, data) => {
  try {
    const themejson = getUserDataPath('theme.json')
    writeFileSync(themejson, `{"theme":"${data.theme || ''}"}`, 'utf-8')
  } catch {}
})

ipcMain.on('WebClearCookies', (event, data) => {
  session.defaultSession.clearStorageData(data)
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
    session.defaultSession.cookies.set(cookie).catch((err: any) => console.error(err))
  }
})
ipcMain.on('WebClearCache', (event, data) => {
  if (data.cache) {
    session.defaultSession.clearCache()
    session.defaultSession.clearAuthCache()
  } else {
    session.defaultSession.clearStorageData(data)
  }
})

ipcMain.on('WebReload', (event, data) => {
  if (AppWindow.mainWindow && !AppWindow.mainWindow.isDestroyed()) AppWindow.mainWindow.reload()
})
ipcMain.on('WebRelaunch', (event, data) => {
  app.relaunch()
  try {
    app.exit()
  } catch {}
})

ipcMain.on('WebSetProgressBar', (event, data) => {
  if (AppWindow.mainWindow && !AppWindow.mainWindow.isDestroyed()) {
    if (data.pro) AppWindow.mainWindow.setProgressBar(data.pro)
    else AppWindow.mainWindow.setProgressBar(-1)
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

ipcMain.on('WebSetProxy', (event, data) => {
  //if (data.proxyurl) app.commandLine.appendSwitch('proxy-server', data.proxyurl)
  //else app.commandLine.removeSwitch('proxy-server')
  console.log(JSON.stringify(data))
  if (data.proxyurl) {
    session.defaultSession.setProxy({ proxyRules: data.proxyurl })
  } else {
    session.defaultSession.setProxy({})
  }
})

ipcMain.on('WebOpenWindow', (event, data) => {
  let win = creatElectronWindow(AppWindow.winWidth, AppWindow.winHeight, true, 'main2', data.theme)

  win.on('ready-to-show', function () {
    win.webContents.send('setPage', data)
    win.setTitle('预览窗口')
    win.show()
  })
})
ipcMain.on('WebOpenUrl', (event, data) => {
  let win = new BrowserWindow({
    show: false,
    width: AppWindow.winWidth,
    height: AppWindow.winHeight,
    center: true,
    minWidth: 680,
    minHeight: 500,
    icon: getResourcesPath('app.ico'),
    useContentSize: true,
    frame: true,
    hasShadow: true,
    autoHideMenuBar: true,
    backgroundColor: data.theme && data.theme == 'dark' ? '#23232e' : '#ffffff',
    webPreferences: {
      spellcheck: false,
      devTools: DEBUGGING,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false,
      enableWebSQL: false,
      disableBlinkFeatures: 'OutOfBlinkCors,SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure'
    }
  })

  win.on('ready-to-show', function () {
    win.setTitle('预览窗口')
    win.show()
  })

  win.loadURL(data.PageUrl, {
    userAgent: ua,
    httpReferrer: Referer
  })
})
