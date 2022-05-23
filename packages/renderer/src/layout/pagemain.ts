import ServerHttp from '@/aliapi/server'
import { useAppStore, useFootStore, useSettingStore } from '@/store'
import AppCache from '@/utils/appcache'
import DownDAL from '@/down/downdal'
import UploadDAL from '@/down/uploaddal'
import ShareDAL from '@/share/share/ShareDAL'

import UserDAL from '@/user/userdal'
import DebugLog from '@/utils/debuglog'

export function PageMain() {
  if (window.WinMsg !== undefined) return
  window.WinMsg = WinMsg
  useSettingStore()
  Promise.resolve()
    .then(async () => {
      DebugLog.mSaveLog('success', '小白羊启动')
      await ShareDAL.aLoadFromDB().catch((e: any) => {
        DebugLog.mSaveLog('danger', 'ShareDALLDB' + e.message)
      })
      await UserDAL.aLoadFromDB().catch((e: any) => {
        DebugLog.mSaveLog('danger', 'UserDALLDB' + e.message)
      })
    })
    .then(async () => {
      //await SQL.ClearOldLogs(useSettingStore().debugDownedListMax).catch(() => {}) 
      await DownDAL.aLoadFromDB().catch((e: any) => {
        DebugLog.mSaveLog('danger', 'DownDALLDB' + e.message)
      })
      await UploadDAL.aLoadFromDB().catch((e: any) => {
        DebugLog.mSaveLog('danger', 'UploadDALLDB' + e.message)
      })

      
      await AppCache.aLoadCacheSize().catch((e: any) => {
        DebugLog.mSaveLog('danger', 'AppCacheDALLDB' + e.message)
      })

      setTimeout(timeEvent, 1000) 
    })
    .catch((e: any) => {
      DebugLog.mSaveLog('danger', 'LoadSettingFromDB' + e.message)
    })
}

export const WinMsg = function (arg: any) {
  if (arg.cmd == 'MainUploadEvent') {
    UploadDAL.aUploadEvent(arg.list || [])
  } else if (arg.cmd == 'MainUploadDir') {
    const parentid = arg.parentid as string
    const Info = arg.Info
    UploadDAL.UploadLocalDir(Info.userid, Info.drive_id, parentid, Info.localFilePath)
  } else if (arg.cmd == 'MainUploadID') {
    UploadDAL.mSaveToUploading(arg.UploadID, arg.file_id, arg.upload_id)
  }
}

let runTime = 0

function timeEvent() {
  const settingStore = useSettingStore()

  runTime++
  
  if (runTime > 60 * 60 * 24) runTime = 0
  
  if (runTime == 300 || runTime % 14400 == 14300) {
    ServerHttp.CheckUpgrade(false)
  }
  if (runTime > 6 && runTime % 2 == 0) {
    
    /*
    PanDAL.UpdateDirSize().catch((e: any) => {
      DebugLog.mSaveLog('danger', 'UpdateDirSize' + e.message)
    })
    */
  }
  if (runTime > 6 && runTime % 20 == 0) {
    
    //SQL.ClearOldLogs(settingStore.debugDownedListMax)
  }
  
  if (runTime > 6 && runTime % 600 == 0) {
    UserDAL.aRefreshAllUserToken()
  }

  if(runTime>6 && runTime%2==1){
    useFootStore().aUpdateTask()
  }

  
  DownDAL.aSpeedEvent().catch((e: any) => {
    DebugLog.mSaveLog('danger', 'aSpeedEvent' + e.message)
  })
  
  if (settingStore.downAutoShutDown == 2) {
    if (DownDAL.QueryIsDowning() == false && UploadDAL.QueryIsUploading() == false) {
      settingStore.downAutoShutDown = 0 
      useAppStore().appShutDown = true 
    }
  }

  setTimeout(timeEvent, 1000) 
}
