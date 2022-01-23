import ServerHttp from '@/aliapi/server'
import { LoadSetting } from '@/setting/setting'
import SettingDebug from '@/setting/settingdebug'
import SettingDown from '@/setting/settingdown'
import SettingLog from '@/setting/settinglog'
import AppCache from '@/store/appcache'
import DownDAL from '@/store/downdal'
import PanDAL from '@/store/pandal'
import ShareDAL from '@/store/sharedal'
import SQL from '@/store/sql'
import UploadDAL from '@/store/uploaddal'
import UserDAL from '@/store/userdal'
import { ShowShutDownModal } from './setting/shutdownmodal'

export function MainPage() {
  if (window.WinMsg !== undefined) return
  window.WinMsg = WinMsg
  setTimeout(() => {
    LoadSetting()
      .then(async () => {
        SettingLog.mSaveLog('success', '小白羊启动')
        await UserDAL.aLoadFromDB().catch((e: any) => {
          SettingLog.mSaveLog('danger', 'UserDALLDB' + e.message)
        })
        await PanDAL.aLoadFromDB().catch((e: any) => {
          SettingLog.mSaveLog('danger', 'PanDALLDB' + e.message)
        })
        await ShareDAL.aLoadFromDB().catch((e: any) => {
          SettingLog.mSaveLog('danger', 'ShareDALLDB' + e.message)
        })
      })
      .catch((e: any) => {
        SettingLog.mSaveLog('danger', 'LoadSettingFromDB' + e.message)
      })
  }, 200)

  setTimeout(async () => {
    await SQL.ClearOldLogs(SettingDebug.debugDownedListMax).catch(() => {})
    await DownDAL.aLoadFromDB().catch((e: any) => {
      SettingLog.mSaveLog('danger', 'DownDALLDB' + e.message)
    })
    await UploadDAL.aLoadFromDB().catch((e: any) => {
      SettingLog.mSaveLog('danger', 'UploadDALLDB' + e.message)
    })
    await AppCache.aLoadCacheSize().catch((e: any) => {
      SettingLog.mSaveLog('danger', 'AppCacheDALLDB' + e.message)
    })

    setTimeout(timeEvent, 1000)
  }, 2000)
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
  runTime++
  if (runTime > 60 * 60 * 24) runTime = 0
  if (runTime == 300 || runTime % 14400 == 14300) {
    ServerHttp.CheckUpgrade(false)
  }
  if (runTime > 6 && runTime % 2 == 0) {
  }
  if (runTime > 6 && runTime % 20 == 0) {
    SQL.ClearOldLogs(SettingDebug.debugDownedListMax)
  }

  if (runTime == 300 || runTime % 3600 == 3500) {
    PanDAL.TrashAutoClean().catch((e: any) => {
      SettingLog.mSaveLog('danger', 'TrashAutoClean' + e.message)
    })
  }
  DownDAL.aSpeedEvent().catch((e: any) => {
    SettingLog.mSaveLog('danger', 'aSpeedEvent' + e.message)
  })
  if (SettingDown.downAutoShutDown == 2) {
    if (DownDAL.QueryIsDowning() == false && UploadDAL.QueryIsUploading() == false) {
      SettingDown.mSaveDownAutoShutDown(false)
      ShowShutDownModal()
    }
  }

  setTimeout(timeEvent, 1000)
}
