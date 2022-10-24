import Dexie from 'dexie'


export interface IStateUploadTaskFile {
  
  TaskID: number
  
  UploadID: number
  
  partPath: string
  
  name: string
  
  size: number
  sizeStr: string
  
  mtime: number
  
  isDir: boolean
  IsRoot: boolean
  
  uploaded_is_rapid: boolean
  
  uploaded_file_id: string
}

export interface IStateUploadTask {
  
  TaskID: number
  
  TaskName: string
  
  TaskFileID: string
  
  user_id: string
  parent_file_id: string
  drive_id: string
  
  check_name_mode: string

  isDir: boolean
  
  localFilePath: string

  
  Children: IStateUploadTaskFile[]
  
  ChildTotalCount: number
  
  ChildFinishCount: number
  
  ChildTotalSize: number
  
  ChildFinishSize: number
}

export declare type UploadState =
  | '排队中' // 排队中， 等待上传
  | '读取中' // 读取文件夹包含的文件列表
  | 'hashing' // 计算hash，预秒传，秒传
  | 'running' // 上传中
  | '已暂停' // 已暂停
  | 'success' // 上传成功
  | 'error' // 上传失败

export interface IStateUploadInfo {
  
  UploadID: number
  
  uploadState: UploadState
  
  up_upload_id: string
  
  up_file_id: string

  
  uploadSize: number
  
  fileSize: number
  
  Speed: number
  
  speedStr: string
  
  Progress: number

  
  failedCode: number
  
  failedMessage: string
  
  autoTryTime: number
  
  autoTryCount: number
}
export interface IUploadingUI {
  IsRunning: boolean
  TaskID: number
  UploadID: number
  user_id: string
  parent_file_id: string
  drive_id: string
  check_name_mode: string
  localFilePath: string

  File: IStateUploadTaskFile
  Info: IStateUploadInfo
}

class XBYDB3Upload extends Dexie {
  iuploadtask: Dexie.Table<IStateUploadTask>
  iuploadinfo: Dexie.Table<IStateUploadInfo>
  iuploaded: Dexie.Table<IStateUploadTask>
  iobject: Dexie.Table<object, string>

  constructor() {
    super('XBYDB3Upload1024')

    this.version(1)
      .stores({
        iuploadtask: '&TaskID',
        iuploadinfo: '&UploadID',
        iuploaded: '++,&TaskID',
        iobject: ''
      })
      .upgrade((tx: any) => {
        console.log('upgrade', tx)
      })

    this.iuploadtask = this.table('iuploadtask')
    this.iuploadinfo = this.table('iuploadinfo')
    this.iuploaded = this.table('iuploaded')
    this.iobject = this.table('iobject')
  }

  

  
  async getUploadTask(key: number): Promise<IStateUploadTask | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.get(key)
    })
  }

  
  async getUploadTaskAll(): Promise<IStateUploadTask[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.toArray()
    })
  }

  
  async getUploadTaskAllKeys(): Promise<number[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.toCollection().primaryKeys()
    })
  }

  
  async getUploadTaskCount(): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.count()
    })
  }

  
  async deleteUploadTask(key: number): Promise<void> {
    console.log('deleteUploadTask', key)
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadtask.delete(key)
  }

  
  async deleteUploadTaskBatch(keys: number[]): Promise<void> {
    console.log('deleteUploadTaskBatch', keys)
    if (keys.length == 0) return
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadtask.bulkDelete(keys)
  }

  
  async deleteUploadInfo(key: number): Promise<void> {
    console.log('deleteUploadInfo', key)
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadinfo.delete(key)
  }

  
  async deleteUploadInfoBatch(keys: number[]): Promise<void> {
    console.log('deleteUploadInfoBatch', keys)
    if (keys.length == 0) return
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadinfo.bulkDelete(keys)
  }

  async saveUploadTask(value: IStateUploadTask) {
    console.log('saveUploadTask', value.TaskID)
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadtask.put(value).catch(() => {})
  }

  async saveUploadTaskBatch(values: IStateUploadTask[]) {
    console.log('saveUploadTaskBatch', values.length)
    if (values.length == 0) return
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadtask.bulkPut(values).catch(() => {})
  }

  
  async clearUploadTaskAll(): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    await this.iuploadinfo.clear()
    await this.iuploadtask.clear()
    await this.iobject.delete('UploadingStop')
  }

  
  async saveUploadInfo(value: IStateUploadInfo) {
    console.log('saveUploadInfo', value.UploadID)
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadinfo.put(value).catch(() => {})
  }

  async saveUploadInfoBatch(values: IStateUploadInfo[]) {
    console.log('saveUploadInfoBatch', values.length)
    if (values.length == 0) return
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadinfo.bulkPut(values).catch(() => {})
  }

  async getUploadInfoAll(): Promise<IStateUploadInfo[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadinfo, () => {
      return this.iuploadinfo.toArray()
    })
  }

  

  async getUploaded(key: number): Promise<IStateUploadTask | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploaded, () => {
      return this.iuploaded.where('TaskID').equals(key).first()
    })
  }

  async getUploadedByTop(limit: number): Promise<IStateUploadTask[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploaded, () => {
      return this.iuploaded.reverse().limit(limit).toArray()
    })
  }

  async getUploadedCount(): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploaded, () => {
      return this.iuploaded.count()
    })
  }

  async deleteUploaded(key: number): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.where('TaskID').equals(key).delete()
  }

  async deleteUploadedBatch(keys: number[]): Promise<number> {
    if (keys.length == 0) return 0
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.where('TaskID').anyOf(keys).delete()
  }

  async saveUploaded(value: IStateUploadTask) {
    console.log('saveUploaded', value.TaskID)
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.put(value).catch(() => {})
  }

  async saveUploadedBatch(values: IStateUploadTask[]) {
    console.log('saveUploadedBatch', values.length)
    if (values.length == 0) return
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.bulkPut(values).catch(() => {})
  }

  
  async deleteUploadedOutCount(max: number): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const count = await this.iuploaded.count()
    if (count > max) {
      return this.iuploaded.limit(max - count).delete()
    }
    return 0
  }

  async clearUploadedAll(): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.clear()
  }

  
  async getUploadObj(key: string): Promise<object | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iobject, () => {
      return this.iobject.get(key)
    })
  }

  async saveUploadObj(key: string, value: object): Promise<string | void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iobject.put(value, key).catch(() => {})
  }
}

const DBUpload = new XBYDB3Upload()
export default DBUpload
