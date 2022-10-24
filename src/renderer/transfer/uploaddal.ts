import { useSettingStore } from '../store'
import DBUpload from '../utils/dbupload'
import { clickWait, clickWaitDelete } from '../utils/debounce'
import useUploadedStore from '../down/uploadedstore'

export default class UploadDAL {
  
  static async aReloadUploaded() {
    const uploadedStore = useUploadedStore()
    if (uploadedStore.ListLoading == true) return
    uploadedStore.ListLoading = true
    const showlist = await DBUpload.getUploadedByTop(5000)
    const count = await DBUpload.getUploadTaskCount()
    uploadedStore.aLoadListData(showlist, count)
    uploadedStore.ListLoading = false
  }

  
  static async aClearUploaded() {
    const max = useSettingStore().debugDownedListMax
    return await DBUpload.deleteUploadedOutCount(max)
  }

  
  static async UploadedDelete(all: boolean) {
    if (clickWait('UploadedDelete', -1)) return
    if (all) {
      await DBUpload.clearUploadedAll()
    } else {
      const uploadedStore = useUploadedStore()
      const keys = Array.from(uploadedStore.ListSelected)
      await DBUpload.deleteUploadedBatch(keys)
    }
    await this.aReloadUploaded()
    clickWaitDelete('UploadedDelete')
  }
}
