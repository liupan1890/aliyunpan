import electron, { ipcRenderer } from 'electron'

window.Electron = electron
process.noAsar = true
window.platform = process.platform

ipcRenderer.on('winmsg', function (event, arg) {
  try {
    if (window.WinMsg) window.WinMsg(JSON.parse(arg))
  } catch {}
})
window.WebToElectron = function (data: any) {
  try {
    ipcRenderer.send('WebToElectron', data)
  } catch {}
}

window.WebToElectronCB = function (data: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebToElectronCB', data)
    callback(backdata) 
  } catch {}
}

ipcRenderer.on('ElectronToWeb', function (event, arg) {
  
})
ipcRenderer.on('MainSendToken', function (event, arg) {
  try {
    window.postMessage(arg)
  } catch {}
})

window.WebSpawnSync = function (data: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebSpawnSync', data) 
    callback(backdata) 
  } catch {}
}
window.WebExecSync = function (data: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebExecSync', data) 
    callback(backdata) 
  } catch {}
}
window.WebShowOpenDialogSync = function (config: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebShowOpenDialogSync', config)
    callback(backdata) 
  } catch {}
}

window.WebShowSaveDialogSync = function (config: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebShowSaveDialogSync', config)
    callback(backdata) 
  } catch {}
}
window.WebShowItemInFolder = function (fullpath: string) {
  try {
    ipcRenderer.send('WebShowItemInFolder', fullpath)
  } catch {}
}

window.WebPlatformSync = function (callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebPlatformSync')
    callback(backdata) 
  } catch {}
}

window.WebClearCookies = function (data: any) {
  try {
    ipcRenderer.send('WebClearCookies', data)
  } catch {}
}
window.WebClearCache = function (data: any) {
  try {
    ipcRenderer.send('WebClearCache', data)
  } catch {}
}
window.WebUserToken = function (data: any) {
  try {
    ipcRenderer.send('WebUserToken', data)
  } catch {}
}
window.WebSaveTheme = function (data: any) {
  try {
    ipcRenderer.send('WebSaveTheme', data)
  } catch {}
}

window.WebReload = function (data: any) {
  try {
    ipcRenderer.send('WebReload', data)
  } catch {}
}
window.WebRelaunch = function (data: any) {
  try {
    ipcRenderer.send('WebRelaunch', data)
  } catch {}
}
window.WebSetProgressBar = function (data: any) {
  try {
    ipcRenderer.send('WebSetProgressBar', data) 
  } catch {}
}
window.WebSetCookies = function (cookies: any) {
  try {
    ipcRenderer.send('WebSetCookies', cookies) 
  } catch {}
}

window.WebOpenWindow = function (data: any) {
  try {
    ipcRenderer.send('WebOpenWindow', data)
  } catch {}
}
window.WebOpenUrl = function (data: any) {
  try {
    ipcRenderer.send('WebOpenUrl', data)
  } catch {}
}
window.WebShutDown = function (data: any) {
  try {
    ipcRenderer.send('WebShutDown', data) 
  } catch {}
}
window.WebSetProxy = function (data: { proxyurl: string }) {
  try {
    ipcRenderer.send('WebSetProxy', data)
  } catch {}
}

function createRightMenu() {
  window.addEventListener(
    'contextmenu',
    (e) => {
      try {
        if (e) e.preventDefault()
        if (isEleEditable(e.target)) {
          ipcRenderer.send('WebToElectron', { cmd: 'menuedit' })
        } else {
          
          let selectText = window.getSelection()?.toString()
          if (!!selectText) ipcRenderer.send('WebToElectron', { cmd: 'menucopy' })
        }
      } catch {}
    },
    false
  )
}

function isEleEditable(e: any): boolean {
  if (!e) {
    return false
  }
  
  if ((e.tagName === 'INPUT' && e.type !== 'checkbox') || e.tagName === 'TEXTAREA' || e.contentEditable == 'true') {
    return true
  } else {
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return isEleEditable(e.parentNode)
  }
}

createRightMenu()
