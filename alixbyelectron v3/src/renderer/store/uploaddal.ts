import { IAriaDownProgress, IStateUploadFile } from './models'
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
