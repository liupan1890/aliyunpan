import { IAliGetFileModel } from '../aliapi/alimodels'

declare type DownloadState =
  | '排队中' // 排队中， 等待下载
  | 'running' // 下载中
  | 'hashing' // 计算hash，校验完整性
  | '已暂停' // 已暂停
  | 'success' // 下载成功
  | 'error' // 下载失败


export interface IStateDownFile {
  DownID: string
  __v_skip: true
  user_id: string
  
  file_id: string
  drive_id: string
  
  DownSavePath: string
  
  name: string
  
  size: number
  sizeStr: string
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
  failedCode: number
  failedMessage: string
  
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

export const DowningList = new Map<string, IStateDownFile>()
export const DownedList: IStateDownFile[] = []
export default class DownDAL {
  static aAddDownload(fileList: IAliGetFileModel[], savepath: string, needPanPath: boolean, tip: boolean) {}
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
    // const max = useSettingStore().debugDownedListMax
    // return DBDown.deleteDownedOutCount(max)
  }

  static DowningState(all: boolean, start: boolean) {}

  static DowningOrder() {}
  static DowningDelete(all: boolean) {}
  static DownedDelete(all: boolean) {}
}
