import { createApp } from 'vue'
import App from './App.vue'
import ArcoVue from '@arco-design/web-vue'
import store, { useAppStore, useSettingStore } from '@/store'
import '@arco-design/web-vue/dist/arco.css'
import message from '@/utils/message'
import DebugLog from '@/utils/debuglog'
import { PageMain } from './layout/pagemain'

window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
  try {
    if (errorMessage && typeof errorMessage === 'string' && errorMessage.indexOf('ResizeObserver loop limit exceeded') >= 0) return true
    DebugLog.mSaveLog('danger', 'onerror')
    if (typeof errorMessage === 'string') {
      DebugLog.mSaveLog('danger', errorMessage)
      message.error('onerror ' + errorMessage, 8)
    }
    if (error) {
      DebugLog.mSaveLog('danger', error.message)
      message.error('onerror ' + error.message, 8)
      if (error.stack) DebugLog.mSaveLog('danger', error.stack)
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

    DebugLog.mSaveLog('danger', 'unhandledrejection')
    const reason = event.reason
    if (reason && reason.message) {
      DebugLog.mSaveLog('danger', reason.message)
      message.error('rejection ' + reason.message, 8)
    }
    if (reason && reason.stack) DebugLog.mSaveLog('danger', reason.stack)
    if (!reason) DebugLog.mSaveLog('danger', JSON.stringify(event))
  } catch {}
  event.stopPropagation() 
  event.preventDefault() 
})

const app = createApp(App)
app.config.errorHandler = function (err: any, vm, info) {
  try {
    DebugLog.mSaveLog('danger', 'errorHandler')
    if (typeof err === 'string') {
      DebugLog.mSaveLog('danger', err)
      message.error('errorHandler ' + err, 8)
    }
    if (err && err.message) {
      DebugLog.mSaveLog('danger', err.message)
      message.error('errorHandler ' + err.message, 8)
      if (err.stack) DebugLog.mSaveLog('danger', err.stack)
    }
  } catch {}
  return true
}
app.config.compilerOptions.isCustomElement = (tag: string) => tag == 'webview'
app.config.performance = true
app.use(ArcoVue, {})
app.use(store)
app.mount('#app')

window.Electron.ipcRenderer.on('setPage', (_event: any, args: any) => {
  const appStore = useAppStore()
  const settingStore = useSettingStore() 
  if (args.theme && settingStore) appStore.toggleTheme(args.theme)

  if (args.page == 'PageMain') {
    PageMain()
  } else if (args.page == 'PageWorker') {
    //WorkerPage()
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






/*
setTimeout(() => {
  let list = document.getElementsByTagName('input')
  for (let i = 0; i < list.length; i++) {
    list[i].setAttribute('tabindex', '-1')
  }
  let list2 = document.getElementsByTagName('button')
  for (let i = 0; i < list2.length; i++) {
    list2[i].setAttribute('tabindex', '-1')
  }
}, 2000)
*/

