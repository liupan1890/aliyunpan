import { IAliGetFileModel } from '../aliapi/alimodels'
import { useSettingStore } from '../store'


export interface IStateDownFile {
  DownID: string
  __v_skip: true
  user_id: string
  
  file_id: string
  drive_id: string
  
  DownSavePath: string
  
  name: string
  
  size: number
  sizestr: string
  icon: string
  isDir: boolean
  
  crc64: string
  
  download_url: string
  DownState: DownloadState
}

export interface IStateDownProgress {
  DownTime: number
  DownSize: number
  DownSpeed: number
  DownSpeedStr: string
  DownProcess: number
  FailedCode: number
  FailedMessage: string
  
  AutoTry: number
}


export interface IAriaDownProgress {
  gid: string
  status: string
  totalLength: string
  completedLength: string
  downloadSpeed: string
  errorCode: string
  errorMessage: string
}

export let DowningList = new Map<string, IStateDownFile>()
export let DownedList: IStateDownFile[] = []
export default class DownDAL {
  static aAddDownload(filelist: IAliGetFileModel[], savepath: string, needPanPath: boolean, tip: boolean) {}
  static async aSpeedEvent() {}
  static mSpeedEvent(list: IAriaDownProgress[]) {}
  static QueryIsDowning() {
    return false
  }
  static QuerySelectedIsDowning() {
    return false
  }

  
  static async aReloadDowning() {}

  
  static async aReloadDowned() {}

  
  static async aClearDowned() {
    let max = useSettingStore().debugDownedListMax
    //return DBDown.deleteDownedOutCount(max)
  }

  static DowningState(all: boolean, start: boolean) {
    if (all) {
    } else {
    }
  }
  static DowningOrder() {}
  static DowningDelete(all: boolean) {}
  static DownedDelete(all: boolean) {}
}
