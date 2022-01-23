import fs from 'fs'
import electron, { ipcRenderer } from 'electron'

window.Electron = electron
process.noAsar = true
window.platform = process.platform

ipcRenderer.on('winmsg', function (event, arg) {
  try {
    if (window.WinMsg) window.WinMsg(JSON.parse(arg))
  } catch {}
})
window.WinMsgToMain = function (data: any) {
  try {
    ipcRenderer.send('winmsgmain', JSON.stringify(data))
  } catch {}
}
window.WinMsgToUI = function (data: any) {
  try {
    ipcRenderer.send('winmsgui', JSON.stringify(data))
  } catch {}
}
window.WebToElectron = function (data: any) {
  try {
    ipcRenderer.send('WebToElectron', data)
  } catch {}
}

window.WebToElectronCB = function (data: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebToElectronCB', data)
    callback(backdata) // 回调给web的结果
  } catch {}
}

ipcRenderer.on('ElectronToWeb', function (event, arg) {
  //console.log('ElectronToWeb', event, arg); // prints "pong"
})
ipcRenderer.on('MainSendToken', function (event, arg) {
  try {
    window.postMessage(arg)
  } catch {}
})

window.WebSpawnSync = function (data: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebSpawnSync', data) // data={command:string,args:[]string,options:{}}
    callback(backdata) // 回调给web的结果
  } catch {}
}
window.WebExecSync = function (data: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebExecSync', data) // data={command:string,args:[]string,options:{}}
    callback(backdata) // 回调给web的结果
  } catch {}
}
window.WebShowOpenDialogSync = function (config: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebShowOpenDialogSync', config)
    callback(backdata) // 回调给web的结果
  } catch {}
}

window.WebShowSaveDialogSync = function (config: any, callback: any) {
  try {
    const backdata = ipcRenderer.sendSync('WebShowSaveDialogSync', config)
    callback(backdata) // 回调给web的结果
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
    callback(backdata) // 回调给web的结果
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
window.WebRelaunchAria = function () {
  try {
    ipcRenderer.send('WebRelaunchAria')
  } catch {}
}
window.WebSetProgressBar = function (data: any) {
  try {
    ipcRenderer.send('WebSetProgressBar', data) //{pro:0.1}
  } catch {}
}
window.WebSetCookies = function (cookies: any) {
  try {
    ipcRenderer.send('WebSetCookies', cookies) //[{url,name,value}]
  } catch {}
}

window.WebOpenWindow = function (data: any) {
  try {
    ipcRenderer.send('WebOpenWindow', data) //
  } catch {}
}

window.WebShutDown = function (data: any) {
  try {
    ipcRenderer.send('WebShutDown', data) //{quitapp}
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
          //判断是有文本选中
          let selectText = window.getSelection()?.toString()
          if (!!selectText) ipcRenderer.send('WebToElectron', { cmd: 'menucopy' })
        }
      } catch {}
    },
    false
  )
}
/**
 * 判断点击区域可编辑
 */
function isEleEditable(e: any): boolean {
  if (!e) {
    return false
  }
  //为input标签或者contenteditable属性为true
  if ((e.tagName === 'INPUT' && e.type !== 'checkbox') || e.tagName === 'TEXTAREA' || e.contentEditable == 'true') {
    return true
  } else {
    //递归查询父节点
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return isEleEditable(e.parentNode)
  }
}

createRightMenu()
