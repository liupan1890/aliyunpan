import AliFileList from '@/aliapi/filelist'
import { UploadAdd, UploadCmd, UploadEvent } from './uiupload'

let uploadTimer: NodeJS.Timer | undefined = undefined
export function WorkerPage() {
  if (window.WinMsg !== undefined) return
  window.WinMsg = WinMsg
  const func = () => {
    try {
      UploadEvent()
    } catch {}
    uploadTimer = setTimeout(func, 1000)
  }
  uploadTimer = setTimeout(func, 3000)
}

export const WinMsg = function (arg: any) {
  if (arg.cmd == 'LimitMax') {
    AliFileList.LimitMax = arg.LimitMax
  } else if (arg.cmd == 'UploadCmd') {
    UploadCmd(arg.uploadAll, arg.uploadCmd, arg.uploadIDList)
  } else if (arg.cmd == 'UploadAdd') {
    UploadAdd(arg.addlist)
  }
}
