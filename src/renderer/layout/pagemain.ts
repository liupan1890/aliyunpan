import ServerHttp from '../aliapi/server'
import { useAppStore, useFootStore, useSettingStore } from '../store'
import AppCache from '../utils/appcache'
import DownDAL from '../down/downdal'
import UploadDAL from '../transfer/uploaddal'
import ShareDAL from '../share/share/ShareDAL'

import UserDAL from '../user/userdal'
import DebugLog from '../utils/debuglog'
import PanDAL from '../pan/pandal'
import UploadingDAL from '../transfer/uploadingdal'
import { Sleep } from '../utils/format'

export function PageMain() {
  if (window.WinMsg) return
  window.WinMsg = WinMsg
  useSettingStore().WebSetProxy()
  Promise.resolve()
    .then(async () => {
      DebugLog.mSaveSuccess('小白羊启动')
      await ShareDAL.aLoadFromDB().catch((err: any) => {
        DebugLog.mSaveDanger('ShareDALLDB', err)
      })
      await UserDAL.aLoadFromDB().catch((err: any) => {
        DebugLog.mSaveDanger('UserDALLDB', err)
      })
    })
    .then(async () => {
      await Sleep(500)
      await DownDAL.aReloadDowning().catch((err: any) => {
        DebugLog.mSaveDanger('aReloadDowning', err)
      })
      await UploadingDAL.aReloadUploading().catch((err: any) => {
        DebugLog.mSaveDanger('aReloadUploading', err)
      })

      await DownDAL.aReloadDowned().catch((err: any) => {
        DebugLog.mSaveDanger('aReloadDowned', err)
      })
      await UploadDAL.aReloadUploaded().catch((err: any) => {
        DebugLog.mSaveDanger('aReloadUploaded', err)
      })
      await Sleep(500)
      
      await AppCache.aLoadCacheSize().catch((err: any) => {
        DebugLog.mSaveDanger('AppCacheDALDB', err)
      })

      setTimeout(timeEvent, 1000) 
    })
    .catch((err: any) => {
      DebugLog.mSaveDanger('LoadSettingFromDB', err)
    })
}

export const WinMsg = function (arg: any) {
  if (arg.cmd == 'MainUploadEvent') {
    if (arg.ReportList.length > 0 && arg.ReportList.length != arg.RunningKeys.length) console.log('RunningKeys', arg)
    if (arg.StopKeys.length > 0) console.log('StopKeys', arg)
    UploadingDAL.aUploadingEvent(arg.ReportList, arg.ErrorList, arg.SuccessList, arg.RunningKeys, arg.StopKeys, arg.LoadingKeys, arg.SpeedTotal)
  } else if (arg.cmd == 'MainUploadAppendFiles') {
    UploadingDAL.aUploadingAppendFiles(arg.TaskID, arg.UploadID, arg.CreatedDirID, arg.AppendList)
  } else if (arg.cmd == 'MainSaveAllDir') {
    PanDAL.aReLoadDriveSave(arg.OneDriver, arg.ErrorMessage)
  } else if (arg.cmd == 'MainShowAllDirProgress') {
    useFootStore().mSaveLoading('加载全部文件夹(' + Math.floor((arg.index * 100) / (arg.total + 1)) + '%)')
  }
}

let runTime = Math.floor(Date.now() / 1000)
let chkUpgradeTime1 = Math.floor(Date.now() / 1000)
let chkUpgradeTime2 = Math.floor(Date.now() / 1000)
let chkDirSizeTime = 0
let lockDirSizeTime = false
let chkClearDownLogTime = 0
let chkTokenTime = 0
let chkTaskTime = 0

function timeEvent() {
  const settingStore = useSettingStore()

  const nowTime = Math.floor(Date.now() / 1000)

  
  if (nowTime - runTime > 60 * 60 * 24) {
    runTime = nowTime
    chkDirSizeTime = 0
  }
  
  if (chkUpgradeTime1 > 0 && nowTime - chkUpgradeTime1 > 360) {
    chkUpgradeTime1 = -1
    ServerHttp.CheckUpgrade(false).catch((err: any) => {
      DebugLog.mSaveDanger('CheckUpgrade', err)
    })
  }
  if (nowTime - chkUpgradeTime2 > 14300) {
    chkUpgradeTime2 = nowTime
    ServerHttp.CheckUpgrade(false).catch((err: any) => {
      DebugLog.mSaveDanger('CheckUpgrade', err)
    })
  }

  
  if (settingStore.uiFolderSize == true && lockDirSizeTime == false && nowTime - runTime > 50 && chkDirSizeTime >= 10) {
    lockDirSizeTime = true
    PanDAL.aUpdateDirFileSize()
      .catch((err: any) => {
        DebugLog.mSaveDanger('aUpdateDirFileSize', err)
      })
      .then(() => {
        chkDirSizeTime = 0
        lockDirSizeTime = false
      })
  } else chkDirSizeTime++

  
  chkClearDownLogTime++
  if (nowTime - runTime > 60 && chkClearDownLogTime >= 540) {
    chkClearDownLogTime = 0
    UploadDAL.aClearUploaded().catch((err: any) => {
      DebugLog.mSaveDanger('aClearUploaded ', err)
    })
    DownDAL.aClearDowned().catch((err: any) => {
      DebugLog.mSaveDanger('aClearDowned ', err)
    })
  }

  
  chkTokenTime++
  if (nowTime - runTime > 10 && chkTokenTime >= 600) {
    chkTokenTime = 0
    UserDAL.aRefreshAllUserToken().catch((err: any) => {
      DebugLog.mSaveDanger('aRefreshAllUserToken', err)
    })
  }

  
  chkTaskTime++
  if (nowTime - runTime > 6 && chkTaskTime >= 2) {
    chkTaskTime = 0
    useFootStore().aUpdateTask()
  }

  
  DownDAL.aSpeedEvent().catch((err: any) => {
    DebugLog.mSaveDanger('aSpeedEvent', err)
  })
  
  if (settingStore.downAutoShutDown == 2) {
    if (DownDAL.QueryIsDowning() == false && UploadingDAL.QueryIsUploading() == false) {
      settingStore.downAutoShutDown = 0 
      useAppStore().appShutDown = true 
    }
  }

  setTimeout(timeEvent, 1000) 
}
