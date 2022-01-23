import DB from './db'
import SettingAria, { SettingAriaC } from './settingaria'
import SettingDebug, { SettingDebugC } from './settingdebug'
import SettingDown, { SettingDownC } from './settingdown'
import SettingLog from './settinglog'
import SettingPan, { SettingPanC } from './settingpan'
import SettingUI, { SettingUIC } from './settingui'
import SettingYinSi, { SettingYinSiC } from './settingyinsi'

const { existsSync, readFileSync, writeFileSync } = window.require('fs')
const path = window.require('path')

export interface ISetting {
  pan: SettingPanC
  ui: SettingUIC
  down: SettingDownC
  aria: SettingAriaC
  debug: SettingDebugC
  yinsi: SettingYinSiC
}

export async function LoadSetting() {
  await DB.updateTov211().catch((e: any) => {
    SettingLog.mSaveLog('danger', 'updateTov211' + e.message)
  })
  LoadSettingFromJson()
  await SettingLog.aLoadFromDB()
}

function getResourcesPath(filename: string) {
  try {
    let basePath: string = path.resolve(window.Electron.remote.app.getAppPath(), '..')
    if (basePath.endsWith('dist')) basePath = path.resolve(basePath, '..', '..')
    return path.join(basePath, filename)
  } catch {
    return ''
  }
}

export function LoadSettingFromJson() {
  try {
    let settingConfig = getResourcesPath('setting.config')
    if (settingConfig && existsSync(settingConfig)) {
      let setting: ISetting = JSON.parse(readFileSync(settingConfig, 'utf-8'))
      SettingUI.aLoadFromJson(setting.ui)
      SettingDown.aLoadFromJson(setting.down)
      SettingPan.aLoadFromJson(setting.pan)
      SettingAria.aLoadFromJson(setting.aria)
      SettingDebug.aLoadFromJson(setting.debug)
      SettingYinSi.aLoadFromJson(setting.yinsi)
    } else {
      SaveSettingToJson()
    }
  } catch {
    SaveSettingToJson()
  }
}
export async function SaveSettingToJson() {
  try {
    let settingConfig = getResourcesPath('setting.config')
    let setting: ISetting = {
      ui: SettingUI,
      down: SettingDown,
      pan: SettingPan,
      aria: SettingAria,
      debug: SettingDebug,
      yinsi: SettingYinSi
    }
    writeFileSync(settingConfig, JSON.stringify(setting), 'utf-8')
  } catch (e: any) {
    SettingLog.mSaveLog('danger', 'SaveSettingToJsonError' + (e.message || ''))
  }
}

export function RefreshSetting() {
  try {
    window.getDvaApp()._store.dispatch({ type: 'setting/save', current: Date.now().toString() })
  } catch {}
  try {
    SaveSettingToJson()
  } catch {}
}
export function Refresh() {
  try {
    window.getDvaApp()._store.dispatch({ type: 'setting/save', current: Date.now().toString() })
  } catch {}
}
