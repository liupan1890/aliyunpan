import { createApp } from 'vue'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue'
import store, { useAppStore, useSettingStore } from './store'
import '@arco-design/web-vue/dist/arco.css'
import message from './utils/message'
import DebugLog from './utils/debuglog'
import { PageMain } from './layout/pagemain'
import { WorkerPage } from './workerpage/workercmd'

window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
  try {
    if (errorMessage && typeof errorMessage === 'string' && errorMessage.indexOf('ResizeObserver loop limit exceeded') >= 0) return true
    DebugLog.mSaveDanger('onerror')
    if (typeof errorMessage === 'string') {
      DebugLog.mSaveDanger(errorMessage)
      message.error('onerror ' + errorMessage, 8)
    }
    if (error) {
      DebugLog.mSaveDanger('onerror', error)
      message.error('onerror ' + error.message, 8)
    }
  } catch {}
  return true
}

window.addEventListener('unhandledrejection', function (event) {
  try {
    if (event.reason && event.reason.message && event.reason.message.indexOf('oauth/authorize?') > 0) {
      event.stopPropagation() 
      event.preventDefault() 
      return 
    }

    DebugLog.mSaveDanger('unhandledrejection')
    const reason = event.reason
    if (reason && reason.message) {
      DebugLog.mSaveDanger('unhandledrejection', reason)
      message.error('rejection ' + reason.message, 8)
    }
    if (!reason) DebugLog.mSaveDanger('unhandledrejection', JSON.stringify(event))
  } catch {}
  event.stopPropagation() 
  event.preventDefault() 
})

const app = createApp(App)
app.config.errorHandler = function (err: any, vm, info) {
  try {
    if (typeof err === 'string') {
      DebugLog.mSaveDanger('errorHandler', err)
      message.error('errorHandler ' + err, 8)
    } else {
      DebugLog.mSaveDanger('errorHandler', err)
      if (err && err.message) message.error('errorHandler ' + err.message, 8)
    }
  } catch {}
  return true
}
app.use(ArcoVue, {})
app.use(store)
app.mount('#app')

window.WinMsgToMain = function (event: any) {
  if (window.MainPort) window.MainPort.postMessage(event)
}
window.WinMsgToUpload = function (event: any) {
  if (window.UploadPort) window.UploadPort.postMessage(event)
}
window.WinMsgToDownload = function (event: any) {
  if (window.DownloadPort) window.DownloadPort.postMessage(event)
}

window.Electron.ipcRenderer.on('setPort', (_event: any, args: any) => {
  const [port] = _event.ports
  window.MainPort = port
  port.onmessage = (event: any) => {
    Promise.resolve().then(() => {
      try {
        if (window.WinMsg) window.WinMsg(event.data)
      } catch {}
    })
  }
})
window.Electron.ipcRenderer.on('setUploadPort', (_event: any, args: any) => {
  const [port] = _event.ports
  window.UploadPort = port
  port.onmessage = (event: any) => {
    Promise.resolve().then(() => {
      try {
        if (window.WinMsg) window.WinMsg(event.data)
      } catch {}
    })
  }
})
window.Electron.ipcRenderer.on('setDownloadPort', (_event: any, args: any) => {
  const [port] = _event.ports
  window.DownloadPort = port
  port.onmessage = (event: any) => {
    Promise.resolve().then(() => {
      try {
        if (window.WinMsg) window.WinMsg(event.data)
      } catch {}
    })
  }
})

window.Electron.ipcRenderer.on('setPage', (_event: any, args: any) => {
  console.log('setPage', args.page, args)
  const appStore = useAppStore()
  const settingStore = useSettingStore() 
  if (args.theme && settingStore) appStore.toggleTheme(args.theme)

  if (args.page == 'PageMain') {
    PageMain()
    window.IsMainPage = true
  } else if (args.page == 'PageWorker') {
    WorkerPage(args.data.type)
  } else if (args.page == 'PageCode') {
    appStore.pageCode = args.data
  } else if (args.page == 'PageOffice') {
    appStore.pageOffice = args.data
  } else if (args.page == 'PageImage') {
    appStore.pageImage = args.data
  } else if (args.page == 'PageVideoXBT') {
    appStore.pageVideoXBT = args.data
  } else if (args.page == 'PageVideo') {
    appStore.pageVideo = args.data
  }
  if (args.page) appStore.togglePage(args.page)
})

window.Electron.ipcRenderer.on('setTheme', (_event: any, args: any) => {
  const appStore = useAppStore()
  appStore.toggleDark(args.dark) 
})
try {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
} catch {}






