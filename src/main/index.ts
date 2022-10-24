import { getCrxPath, getResourcesPath, getUserDataPath } from './mainfile'
import { release } from 'os'
import { AppWindow, creatElectronWindow, createMainWindow, createTray, Referer, ShowError, ShowErrorAndExit, ua } from './window'
const Electron = require('electron')
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


// app.commandLine.appendSwitch('proxy-server', '192.168.31.74:8888')
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

const userData = getResourcesPath('userdir.config')
try {
  if (existsSync(userData)) {
    const configData = readFileSync(userData, 'utf-8')
    if (configData) app.setPath('userData', configData)
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
  if (process.platform == 'darwin') {
    AppWindow.appTray?.destroy()
  } else {
    app.quit() // 未测试应该使用哪一个
  }
})

app.on('activate', () => {
  if (!AppWindow.mainWindow || AppWindow.mainWindow.isDestroyed()) createMainWindow()
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
      AppWindow.appTray = undefined
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

let userToken: { access_token: string; user_id: string; refresh: boolean } = {
  access_token: '',
  user_id: '',
  refresh: false
}
ipcMain.on('WebUserToken', (event, data) => {
  if (data.login) {
    userToken = data
  } else if (userToken.user_id == data.user_id) {
    userToken = data
    // ShowError('WebUserToken', 'update' + data.name)
  } else {
    // ShowError('WebUserToken', 'nothing' + data.name)
  }
})

app
  .whenReady()
  .then(() => {
    session.defaultSession.webRequest.onBeforeSendHeaders((details, cb) => {
      
      const should115Referer = details.url.indexOf('.115.com') > 0
      const shouldGieeReferer = details.url.indexOf('gitee.com') > 0
      const shouldAliOrigin = details.url.indexOf('.aliyundrive.com') > 0

      const shouldAliReferer = !should115Referer && !shouldGieeReferer && (!details.referrer || details.referrer.trim() === '' || /(\/localhost:)|(^file:\/\/)|(\/127.0.0.1:)/.exec(details.referrer) !== null)
      const shouldToken = details.url.includes('aliyundrive') && details.url.includes('download')

      cb({
        cancel: false,
        requestHeaders: {
          ...details.requestHeaders,
          ...(should115Referer && {
            Referer: 'http://115.com/s/swn4bs33z88',
            Origin: 'http://115.com'
          }),
          ...(shouldGieeReferer && {
            Referer: 'https://gitee.com/'
          }),
          ...(shouldAliOrigin && {
            Origin: 'https://www.aliyundrive.com'
          }),
          ...(shouldAliReferer && {
            Referer: 'https://www.aliyundrive.com/'
          }),
          ...(shouldToken && {
            Authorization: userToken.access_token
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



let menuEdit: Electron.Menu | undefined
let menuCopy: Electron.Menu | undefined

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
      mainWindow = undefined
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
  const mainWindow = AppWindow.mainWindow
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

ipcMain.on('WebShowItemInFolder', (event, fullPath) => {
  for (let i = 0; i < 5; i++) {
    if (existsSync(fullPath)) break
    if (fullPath.lastIndexOf(path.sep) > 0) {
      fullPath = fullPath.substring(0, fullPath.lastIndexOf(path.sep))
    } else return
  }
  if (fullPath.length > 2) shell.showItemInFolder(fullPath)
})

ipcMain.on('WebPlatformSync', (event) => {
  const asarPath = app.getAppPath()
  const basePath = path.resolve(asarPath, '..') 
  const findMPV = process.platform !== 'win32' || existsSync(path.join(basePath, 'MPV', 'mpv.exe'))
  const appPath = app.getPath('userData')
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
      const basePath = path.resolve(app.getAppPath(), '..') 
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
    const cmdArguments = []
    if (data.command === 'mpv') {
      const basePath = path.resolve(app.getAppPath(), '..') 
      if (process.platform === 'win32') {
        const exe = path.join(basePath, 'MPV', 'mpv.exe')
        if (existsSync(exe) == false) {
          event.returnValue = { error: '找不到文件' + data.command + ' ' + exe }
          ShowError('找不到文件', data.command + ' ' + exe)
          return
        }
        cmdArguments.push('"' + exe + '"')
      } else if (process.platform === 'darwin') {
        const exe = path.join(basePath, 'mpv')
        if (existsSync(exe) == false) {
          event.returnValue = { error: '找不到文件' + data.command + ' ' + exe }
          ShowError('找不到文件', data.command + ' ' + exe)
          return
        }
        cmdArguments.push("'" + exe + "'")
      } else {
        cmdArguments.push('mpv')
      }
    } else {
      cmdArguments.push(data.command)
    }

    if (data.args) cmdArguments.push(...data.args)

    const finalCmd = cmdArguments.join(' ')
    
    exec(finalCmd, (err: any) => {
      event.returnValue = err
    })
    event.returnValue = ''
  } catch (err: any) {
    event.returnValue = { error: err }
  }
})

ipcMain.on('WebSaveTheme', (event, data) => {
  try {
    const themeJson = getUserDataPath('theme.json')
    writeFileSync(themeJson, `{"theme":"${data.theme || ''}"}`, 'utf-8')
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
    if (data.pro) {
      
      AppWindow.mainWindow.setProgressBar(data.pro, { mode: data.mode || 'normal' })
    } else AppWindow.mainWindow.setProgressBar(-1)
  }
})

ipcMain.on('WebShutDown', (event, data) => {
  if (process.platform === 'darwin') {
    const shutdownCmd = 'osascript -e \'tell application "System Events" to shut down\''
    exec(shutdownCmd, (err: any) => {
      if (data.quitApp) {
        try {
          app.exit()
        } catch {}
      }
      if (err) {
        // donothing
      }
    })
  } else {
    const cmdArguments = ['shutdown']
    if (process.platform === 'linux') {
      if (data.sudo) {
        cmdArguments.unshift('sudo')
      }
      cmdArguments.push('-h') 
      cmdArguments.push('now')
    }
    if (process.platform === 'win32') {
      cmdArguments.push('-s') 
      cmdArguments.push('-f')
      cmdArguments.push('-t 0') 
    }

    const finalcmd = cmdArguments.join(' ')
    
    exec(finalcmd, (err: any) => {
      if (data.quitApp) {
        try {
          app.exit()
        } catch {}
      }
      if (err) {
        // donothing
      }
    })
  }
})

ipcMain.on('WebSetProxy', (event, data) => {
  // if (data.proxyUrl) app.commandLine.appendSwitch('proxy-server', data.proxyUrl)
  // else app.commandLine.removeSwitch('proxy-server')
  console.log(JSON.stringify(data))
  if (data.proxyUrl) {
    session.defaultSession.setProxy({ proxyRules: data.proxyUrl })
  } else {
    session.defaultSession.setProxy({})
  }
})

ipcMain.on('WebOpenWindow', (event, data) => {
  const win = creatElectronWindow(AppWindow.winWidth, AppWindow.winHeight, true, 'main2', data.theme)

  win.on('ready-to-show', function () {
    win.webContents.send('setPage', data)
    win.setTitle('预览窗口')
    win.show()
  })
})
ipcMain.on('WebOpenUrl', (event, data) => {
  const win = new BrowserWindow({
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
