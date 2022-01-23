import { IAliGetFileModel } from '@/aliapi/models'
import { IAriaDownProgress, IStateDownFile } from './models'

export let DowningList = new Map<string, IStateDownFile>()
export let DownedList: IStateDownFile[] = []

export default class DownDAL {
  static async aLoadFromDB() {}

  static aAddDownload(filelist: IAliGetFileModel[], savepath: string, needPanPath: boolean, tip: boolean) {}
  static async aSpeedEvent() {}
  static mSpeedEvent(list: IAriaDownProgress[]) {}
  static QueryIsDowning() {
    return false
  }
  static QuerySelectedIsDowning() {
    return false
  }
}
