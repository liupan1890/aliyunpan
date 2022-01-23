import { message } from 'antd'

import { getDvaApp } from 'umi'
import { MainPage } from './pages/maincmd'
import SettingLog from './setting/settinglog'
import SettingUI, { setTheme } from './setting/settingui'
import { WorkerPage } from './workerpage/workercmd'

window.onerror = function (errorMessage, scriptURI, lineNo, columnNo, error) {
  try {
    if (errorMessage && typeof errorMessage === 'string' && errorMessage.indexOf('ResizeObserver loop limit exceeded') >= 0) return true
    SettingLog.mSaveLog('danger', 'onerror')
    if (typeof errorMessage === 'string') {
      SettingLog.mSaveLog('danger', errorMessage)
      message.error(errorMessage, 8)
    }
    if (error) {
      SettingLog.mSaveLog('danger', error.message)
      message.error(error.message, 8)
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
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

    SettingLog.mSaveLog('danger', 'unhandledrejection')
    const reason = event.reason
    if (reason && reason.message) {
      SettingLog.mSaveLog('danger', reason.message)
      message.error(reason.message, 8)
    }
    if (reason && reason.stack) SettingLog.mSaveLog('danger', reason.stack)
    if (!reason) SettingLog.mSaveLog('danger', JSON.stringify(event))
  } catch {}
  event.stopPropagation()
  event.preventDefault()
})

message.config({
  top: 14,
  duration: 3,
  maxCount: 4
})
const ipcRenderer = window.Electron.ipcRenderer
ipcRenderer.on('showPage', function (event, arg) {
  if (arg.showPage == 'pageMain') {
    MainPage()
  } else if (arg.showPage == 'pageWorker') {
    WorkerPage()
  }
  window.getDvaApp = getDvaApp
  getDvaApp()._store.dispatch({ type: 'global/save', ...arg })
})

ipcRenderer.on('setTheme', function (event, arg) {
  window.dark = arg.dark || false
  if (SettingUI.uiTheme == 'system') setTheme('system')
})

export const dva = {
  config: {
    onError(e: Error) {
      try {
        SettingLog.mSaveLog('danger', 'dvaerror' + (e.message || ''))
        if (e.stack) SettingLog.mSaveLog('danger', e.stack)
      } catch {}
      message.error(e.message, 8)
    }
  }
}

