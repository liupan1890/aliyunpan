import AliDirList from '../aliapi/dirlist'
import { useSettingStore } from '../store'
import TreeStore from '../store/treestore'
import UserDAL from '../user/userdal'
import DebugLog from '../utils/debuglog'
import { DownloadTrigger } from './uidownload'
import { UploadAdd, UploadCmd, UploadReport } from './uiupload'

// eslint-disable-next-line no-unused-vars
let workerTimer: any
export function WorkerPage(type: string) {
  if (window.WinMsg) return

  if (type == 'upload') {
    window.WinMsg = WinMsgUpload
    const func = () => {
      try {
        UploadReport().catch()
      } catch {}
      workerTimer = setTimeout(func, 1000)
    }
    workerTimer = setTimeout(func, 6000) 
    const element = document.createElement('div')
    element.innerHTML = '<h3 class="workertitle">上传进程</h3>'
    document.body.append(element)
  }
  if (type == 'download') {
    window.WinMsg = WinMsgDownload
    const func = () => {
      try {
        DownloadTrigger()
      } catch {}
      workerTimer = setTimeout(func, 1000)
    }
    workerTimer = setTimeout(func, 6000) 
    const element = document.createElement('div')
    element.innerHTML = '<h3 class="workertitle">下载进程</h3>'
    document.body.append(element)
  }
}
const AllDirLock = new Map<string, number>()
export const WinMsgUpload = function (arg: any) {
  // console.log(arg)
  try {
    if (arg.cmd == 'SettingRefresh') {
      useSettingStore().$reset()
    } else if (arg.cmd == 'ClearUserToken') {
      UserDAL.ClearUserTokenMap()
    } else if (arg.cmd == 'UploadAdd') {
      UploadAdd(arg.UploadList)
    } else if (arg.cmd == 'UploadCmd') {
      UploadCmd(arg.Command, arg.IsAll, arg.UploadIDList, arg.TaskIDList)
    } else if (arg.cmd == 'AllDirList') {
      LoadAllDirList(arg.user_id, arg.drive_id)
    }
  } catch {}
}

function LoadAllDirList(user_id: string, drive_id: string): void {
  console.time('AllDirList')
  const lock = AllDirLock.get(drive_id) || 0
  const time = Date.now() / 1000 
  console.log('AllDirList', 'lock=', lock, 'time=', time)
  if (lock) {
    if (time - lock < 300) {
      console.log('AllDirList Break')
      window.WinMsgToMain({ cmd: 'MainSaveAllDir', OneDriver: undefined, ErrorMessage: 'time' })
      return 
    }
  }
  AllDirLock.set(drive_id, time)
  AliDirList.ApiFastAllDirListByPID(user_id, drive_id)
    .then((data) => {
      console.timeEnd('AllDirList')
      AllDirLock.delete(drive_id)
      if (!data.next_marker) {
        TreeStore.ConvertToOneDriver(drive_id, data.items, true, false).then((one) => {
          window.WinMsgToMain({ cmd: 'MainSaveAllDir', OneDriver: one, ErrorMessage: '' })
        })
      } else {
        DebugLog.mSaveWarning('列出文件夹失败file_id=all' + ' next_marker=' + data.next_marker)
        window.WinMsgToMain({ cmd: 'MainSaveAllDir', OneDriver: undefined, ErrorMessage: data.next_marker })
      }
    })
    .catch((err: any) => {
      DebugLog.mSaveWarning('列出文件夹失败file_id=all', err)
      window.WinMsgToMain({ cmd: 'MainSaveAllDir', OneDriver: undefined, ErrorMessage: err.message || '未知错误' })
    })
}

export const WinMsgDownload = function (arg: any) {
  // console.log(arg)
  try {
    if (arg.cmd == 'SettingRefresh') {
      useSettingStore().$reset()
    } else if (arg.cmd == 'ClearUserToken') {
      UserDAL.ClearUserTokenMap()
    }
  } catch {}
}
