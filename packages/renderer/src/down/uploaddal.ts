import { IAriaDownProgress } from "./downdal"


export interface IStateUploadFile {
  UploadID: string
  Info: {
    user_id: string
    
    localFilePath: string
    
    parent_id: string
    drive_id: string

    path: string
    
    name: string
    
    size: number
    sizestr: string
    icon: string
    isDir: boolean
    isMiaoChuan: boolean
    
    sha1: string
    
    crc64: string
  }
  
  Upload: {
    
    DownState: string
    DownTime: number
    DownSize: number
    DownSpeed: number
    DownSpeedStr: string
    DownProcess: number
    IsStop: boolean
    IsDowning: boolean
    IsCompleted: boolean
    IsFailed: boolean
    FailedCode: number
    FailedMessage: string
    
    AutoTry: number
    
    upload_id: string
    
    file_id: string
    
    IsBreakExist: boolean
  }
}

export let UploadingList = new Map<string, IStateUploadFile>()
export let UploadedList: IStateUploadFile[] = []
export default class UploadDAL {
  static async aLoadFromDB() {}
  static aUploadEvent(list: IAriaDownProgress[]) {}
  static UploadLocalDir(user_id: string, drive_id: string, parentid: string, localDirPath: string) {}
  static async UploadLocalFiles(user_id: string, drive_id: string, parentid: string, files: string[], tip: boolean) {}  
  static mSaveToUploading(UploadID: string, file_id: string, upload_id: string) {}
  static QueryIsUploading() {
    return false
  }
  static QuerySelectedIsUploading() {
    return false
  }
  
}
