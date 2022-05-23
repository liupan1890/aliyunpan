import { defineStore } from 'pinia'
import DebugLog from '@/utils/debuglog'
import { getResourcesPath } from '@/utils/electronhelper'
import { useAppStore } from '@/store'
const { existsSync, readFileSync, writeFileSync } = window.require('fs')

export interface SettingState {
  
  
  uiTheme: string
  
  uiImageMode: string
  
  uiVideoMode: string
  
  uiVideoPlayer: string
  
  uiVideoPlayerPath: string
  
  uiAutoColorVideo: boolean
  
  uiAutoPlaycursorVideo: boolean
  
  uiShowPanPath: boolean
  
  uiExitOnClose: boolean

  
  
  uiFolderSize: boolean
  
  uiFileOrderDuli: string
  
  uiTimeFolderFormate: string
  
  uiTimeFolderIndex: number
  
  uiShareDays: string
  
  uiSharePassword: string
  
  uiXBTNumber: number
  
  uiXBTWidth: number
  
  uiFileListOrder: string
  
  uiFileListMode: string
  
  uiFileColorArray: { key: string; title: string }[]

  
  
  downSavePath: string
  
  downSavePathDefault: boolean
  
  downSavePathFull: boolean
  
  downSaveBreakWeiGui: boolean
  
  uploadFileMax: number
  
  downFileMax: number
  
  downThreadMax: number
  
  downGlobalSpeed: number
  
  downGlobalSpeedM: string
  
  downAutoShutDown: number
  
  downSaveShowPro: boolean
  
  downSmallFileFirst: boolean
  
  downUploadBreakExist: boolean
  
  downUploadBreakFile: boolean
  
  downIngoredList: string[]

  
  
  ariaSavePath: string
  
  ariaUrl: string
  
  ariaPwd: string
  
  ariaHttps: boolean
  
  ariaState: string
  
  ariaLoading: boolean

  
  
  debugCacheSize: string
  
  debugFileListMax: number
  
  debugFavorListMax: number
  
  debugDowningListMax: number
  
  debugDownedListMax: number
  
  debugFolderSizeCacheHour: number

  
  
  yinsiLinkPassword: boolean
  
  yinsiZipPassword: boolean
}
const setting: SettingState = {
  
  uiTheme: 'system',
  uiImageMode: 'fill',
  uiVideoMode: 'mpv',
  uiVideoPlayer: 'mpv',
  uiVideoPlayerPath: '',
  uiAutoColorVideo: true,
  uiAutoPlaycursorVideo: true,
  uiShowPanPath: true,
  uiExitOnClose: false,
  
  uiFolderSize: true,
  uiFileOrderDuli: 'null',
  uiTimeFolderFormate: 'yyyy-MM-dd HH-mm-ss',
  uiTimeFolderIndex: 1,
  uiShareDays: 'always',
  uiSharePassword: 'random',
  uiXBTNumber: 36,
  uiXBTWidth: 960,
  uiFileListOrder: 'updated_at desc',
  uiFileListMode: 'list',
  uiFileColorArray: [
    { key: '#df5659', title: '鹅冠红' },
    { key: '#9c27b0', title: '兰花紫' },
    { key: '#42a5f5', title: '晴空蓝' },
    { key: '#00bc99', title: '竹叶青' },
    { key: '#4caf50', title: '宝石绿' },
    { key: '#ff9800', title: '金盏黄' }
  ],
  
  downSavePath: '',
  downSavePathDefault: true,
  downSavePathFull: true,
  downSaveBreakWeiGui: true,
  uploadFileMax: 5,
  downFileMax: 5,
  downThreadMax: 4,
  downGlobalSpeed: 0,
  downGlobalSpeedM: 'MB',
  downAutoShutDown: 0,
  downSaveShowPro: true,
  downSmallFileFirst: false,
  downUploadBreakExist: false,
  downUploadBreakFile: false,
  downIngoredList: ['thumbs.db', 'desktop.ini', '.ds_store', '.td', '~', '.downloading'],
  
  ariaSavePath: '',
  ariaUrl: '',
  ariaPwd: '',
  ariaHttps: false,
  ariaState: 'local',
  ariaLoading: false,
  
  debugCacheSize: '',
  debugFileListMax: 1000,
  debugFavorListMax: 1000,
  debugDowningListMax: 1000,
  debugDownedListMax: 5000,
  debugFolderSizeCacheHour: 72,
  
  yinsiLinkPassword: false,
  yinsiZipPassword: false
}
function patchSetting(val: any) {
  
  setting.uiTheme = defaultValue(val.uiTheme, ['system', 'light', 'dark'])
  console.log('patchSetting', val)
  useAppStore().toggleTheme(setting.uiTheme)
  setting.uiImageMode = defaultValue(val.uiImageMode, ['fill', 'width', 'web'])
  setting.uiVideoMode = defaultValue(val.uiVideoMode, ['mpv', 'online'])
  setting.uiVideoPlayer = defaultValue(val.uiVideoPlayer, ['mpv', 'other', 'web'])
  setting.uiVideoPlayerPath = defaultString(val.uiVideoPlayerPath, '')
  setting.uiAutoColorVideo = defaultBool(val.uiAutoColorVideo, true)
  setting.uiAutoPlaycursorVideo = defaultBool(val.uiAutoPlaycursorVideo, true)
  setting.uiShowPanPath = defaultBool(val.uiShowPanPath, true)
  setting.uiExitOnClose = defaultBool(val.uiExitOnClose, false)
  
  setting.uiFolderSize = defaultBool(val.uiFolderSize, true)
  setting.uiFileOrderDuli = defaultString(val.uiFileOrderDuli, 'null')
  setting.uiTimeFolderFormate = defaultString(val.uiTimeFolderFormate, 'yyyy-MM-dd HH-mm-ss').replace('mm-dd', 'MM-dd').replace('HH-MM', 'HH-mm')
  setting.uiTimeFolderIndex = defaultNumber(val.uiTimeFolderIndex, 1)
  setting.uiShareDays = defaultValue(val.uiShareDays, ['always', 'week', 'month'])
  setting.uiSharePassword = defaultValue(val.uiSharePassword, ['random', 'last', 'nopassword'])
  setting.uiXBTNumber = defaultValue(val.uiXBTNumber, [36, 24, 36, 48, 60, 72])
  setting.uiXBTWidth = defaultValue(val.uiXBTWidth, [960, 720, 960, 1080, 1280])
  setting.uiFileListOrder = defaultValue(val.uiFileListOrder, ['updated_at desc', 'name asc', 'name desc', 'updated_at asc', 'updated_at desc', 'size asc', 'size desc'])
  setting.uiFileListMode = defaultValue(val.uiFileListMode, ['list', 'image', 'bigimage'])
  if (val.uiFileColorArray && val.uiFileColorArray.length >= 6) setting.uiFileColorArray = val.uiFileColorArray

  
  setting.downSavePath = defaultString(val.downSavePath, '')
  setting.downSavePathDefault = defaultBool(val.downSavePathDefault, true)
  setting.downSavePathFull = defaultBool(val.downSavePathFull, true)
  setting.downSaveBreakWeiGui = defaultBool(val.downSaveBreakWeiGui, true)
  setting.uploadFileMax = defaultValue(val.uploadFileMax, [5, 1, 3, 5, 10, 20, 30])
  setting.downFileMax = defaultValue(val.downFileMax, [5, 1, 3, 5, 10, 20, 30])
  setting.downThreadMax = defaultValue(val.downThreadMax, [4, 1, 2, 4, 8, 16])
  setting.downGlobalSpeed = defaultNumberSub(val.downGlobalSpeed, 0, 0, 999)
  setting.downGlobalSpeedM = defaultValue(val.downGlobalSpeedM, ['MB', 'KB'])
  setting.downAutoShutDown = 0 
  setting.downSaveShowPro = defaultBool(val.downSaveShowPro, true)
  setting.downSmallFileFirst = defaultBool(val.downSmallFileFirst, false)
  setting.downUploadBreakExist = defaultBool(val.downUploadBreakExist, false)
  setting.downUploadBreakFile = defaultBool(val.downUploadBreakFile, false)
  setting.downIngoredList = val.downIngoredList && val.downIngoredList.length > 0 ? val.downIngoredList : ['thumbs.db', 'desktop.ini', '.ds_store', '.td', '~', '.downloading']
  
  setting.ariaSavePath = defaultString(val.ariaSavePath, '')
  if (setting.ariaSavePath.indexOf('/') < 0 && setting.ariaSavePath.indexOf('\\') < 0) setting.ariaSavePath = ''
  setting.ariaUrl = defaultString(val.ariaUrl, '')
  if (setting.ariaUrl.indexOf(':') < 0) setting.ariaUrl = ''
  setting.ariaPwd = defaultString(val.ariaPwd, '')
  setting.ariaHttps = defaultBool(val.ariaHttps, false)
  setting.ariaState = 'local' 
  setting.ariaLoading = false 
  
  setting.debugCacheSize = defaultString(val.debugCacheSize, '')
  setting.debugFileListMax = defaultNumberSub(val.debugFileListMax, 1000, 1000, 3000)
  setting.debugFavorListMax = defaultNumberSub(val.debugFavorListMax, 1000, 100, 3000)
  setting.debugDowningListMax = 1000 
  setting.debugDownedListMax = defaultNumberSub(val.debugDownedListMax, 5000, 1000, 50000)
  setting.debugFolderSizeCacheHour = defaultValue(val.debugFolderSizeCacheHour, [72, 2, 8, 24, 48, 72])
  
  setting.yinsiLinkPassword = defaultBool(val.yinsiLinkPassword, false)
  setting.yinsiZipPassword = defaultBool(val.yinsiZipPassword, false)
}
let settingstr = ''


function LoadSetting() {
  try {
    let settingConfig = getResourcesPath('setting.config')
    if (settingConfig && existsSync(settingConfig)) {
      settingstr = readFileSync(settingConfig, 'utf-8')
      let val = JSON.parse(settingstr)
      patchSetting(val)
    } else {
      SaveSetting()
    }
  } catch {
    SaveSetting() 
  }
  return setting
}

function defaultValue(val: any, check: any[]) {
  if (val && check.includes(val)) return val
  return check[0]
}
function defaultString(val: any, check: string) {
  if (val && typeof val == 'string') return val
  return check
}
function defaultBool(val: any, check: boolean) {
  if (typeof val == 'boolean') return val
  return check
}
function defaultNumber(val: any, check: number) {
  if (typeof val == 'number') return val
  return check
}
function defaultNumberSub(val: any, check: number, min: number, max: number) {
  if (typeof val == 'number') {
    if (val < min) return min
    if (val > max) return max
    return val
  }
  return check
}


function SaveSetting() {
  try {
    let savestr = JSON.stringify(setting)
    if (savestr != settingstr) {
      let settingConfig = getResourcesPath('setting.config')
      writeFileSync(settingConfig, savestr, 'utf-8')
      settingstr = savestr
    }
  } catch (e: any) {
    DebugLog.mSaveLog('danger', 'SaveSettingToJsonError' + (e.message || ''))
  }
}

const useSettingStore = defineStore('setting', {
  state: (): SettingState => LoadSetting(),
  getters: {
    AriaIsLocal(state: SettingState): boolean {
      return state.ariaState == 'local'
    }
  },
  actions: {
    updateStore(partial: Partial<SettingState>) {
      if (partial.uiTimeFolderFormate) partial.uiTimeFolderFormate = partial.uiTimeFolderFormate.replace('mm-dd', 'MM-dd').replace('HH-MM', 'HH-mm')
      this.$patch(partial)
      SaveSetting() 
      useAppStore().toggleTheme(setting.uiTheme)
    },
    
    updateFileColor(key: string, title: string) {
      if (!key) return
      let arr = setting.uiFileColorArray.concat()
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key == key) arr[i].title = title
      }
      this.$patch({ uiFileColorArray: arr })
      SaveSetting() 
    }
  }
})

export default useSettingStore
