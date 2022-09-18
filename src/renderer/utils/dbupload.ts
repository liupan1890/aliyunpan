import Dexie from 'dexie'

export interface IUploadingUI {
  UploadID: string
  IsRunning: boolean
  Task: IStateUploadTask
  Info: IStateUploadInfo
}

export interface IStateUploadTask {
  
  UploadID: string
  
  UploadTime: number
  
  UploadState: TaskState

  
  user_id: string
  parent_id: string
  drive_id: string
  
  check_name_mode: string

  
  LocalFilePath: string
  
  name: string
  
  size: number
  sizestr: string
  
  mtime: number

  
  IsDir: boolean

  
  uploaded_is_rapid: boolean
  
  uploaded_file_id: string

  
  Children: IStateUploadChildFile[]
  
  ChildTotalCount: number
  
  ChildFinishCount: number
}


export interface IStateUploadChildFile {
  
  UploadState: TaskState
  
  index: number
  
  PartName: string
  
  name: string
  
  size: number
  sizestr: string
  
  mtime: number

  
  uploaded_is_rapid: boolean
  
  uploaded_file_id: string
}

export interface IStateUploadInfo {
  
  UploadID: string
  
  UploadState: UploadState
  
  up_upload_id: string
  
  up_file_id: string
  
  Loaded: number
  
  UploadSize: number
  
  Speed: number
  
  SpeedStr: string
  
  Progress: number

  
  StartTime: number
  EndTime: number
  
  SpeedAvg: number
  
  UsedTime: number

  
  FailedCode: number
  
  FailedMessage: string
  
  AutoTryTime: number
  
  AutoTryCount: number
}

class XBYDB3Upload extends Dexie {
  iuploadtask: Dexie.Table<IStateUploadTask>
  iuploadinfo: Dexie.Table<IStateUploadInfo>
  iuploaded: Dexie.Table<IStateUploadTask>
  iobject: Dexie.Table<object, string>

  constructor() {
    super('XBYDB3Upload')

    this.version(1)
      .stores({
        iuploadtask: '&UploadID,UploadTime',
        iuploadinfo: '&UploadID',
        iuploaded: '&UploadID,UploadTime',
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

  

  
  async getUploadTask(key: string): Promise<IStateUploadTask | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.get(key)
    })
  }
  
  async getUploadTaskByTop(limit: number): Promise<IStateUploadTask[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.orderBy('UploadTime').reverse().limit(limit).toArray()
    })
  }
  
  async getUploadTaskAllKeys(): Promise<string[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.toCollection().primaryKeys()
    })
  }
  
  async saveUploadTaskOrder(keys: string[], filetime: number, dirtime: number): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})

    return this.iuploadtask
      .where('UploadID')
      .anyOf(keys)
      .modify((item) => {
        if (item.IsDir) item.UploadTime = dirtime++
        else item.UploadTime = filetime++
      })
  }
  
  async getUploadTaskCount(): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadtask, () => {
      return this.iuploadtask.count()
    })
  }
  
  async deleteUploadTask(key: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.transaction('rw', [this.iuploadtask, this.iuploadinfo], async () => {
      await this.iuploadtask.delete(key)
      await this.iuploadinfo.delete(key)
    })
  }
  
  async deleteUploadTaskBatch(keys: string[]) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.transaction('rw', [this.iuploadtask, this.iuploadinfo], async () => {
      await this.iuploadtask.bulkDelete(keys)
      await this.iuploadinfo.bulkDelete(keys)
    })
  }

  async saveUploadTask(value: IStateUploadTask) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadtask.put(value).catch(() => {})
  }
  async saveUploadTaskBatch(values: IStateUploadTask[]) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadtask.bulkPut(values).catch(() => {})
  }
  
  async clearUploadTaskAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    this.iuploadinfo.clear()
    return this.iuploadtask.clear()
  }

  

  async saveUploadInfo(value: IStateUploadInfo) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadinfo.put(value).catch(() => {})
  }
  async saveUploadInfoBatch(values: IStateUploadInfo[]) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploadinfo.bulkPut(values).catch(() => {})
  }
  async getUploadInfoAll(): Promise<IStateUploadInfo[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploadinfo, () => {
      return this.iuploadinfo.toArray()
    })
  }

  

  async getUploaded(key: string): Promise<IStateUploadTask | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploaded, () => {
      return this.iuploaded.get(key)
    })
  }
  async getUploadedByTop(limit: number): Promise<IStateUploadTask[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploaded, () => {
      return this.iuploaded.orderBy('UploadTime').reverse().limit(limit).toArray()
    })
  }
  async getUploadedCount(): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iuploaded, () => {
      return this.iuploaded.count()
    })
  }
  async deleteUploaded(key: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.delete(key)
  }
  async deleteUploadedBatch(keys: string[]) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.bulkDelete(keys)
  }
  async saveUploaded(value: IStateUploadTask) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.put(value).catch(() => {})
  }
  async saveUploadedBatch(values: IStateUploadTask[]) {
    if (!this.isOpen()) await this.open().catch(() => {})
    let keys: string[] = []
    values.map((t) => keys.push(t.UploadID))
    return this.transaction('rw', [this.iuploadtask, this.iuploadinfo, this.iuploaded], async () => {
      await this.iuploaded.bulkPut(values).catch(() => {})
      await this.iuploadtask.bulkDelete(keys).catch(() => {})
      await this.iuploadinfo.bulkDelete(keys).catch(() => {})
    })
  }

  
  async deleteUploadedOutCount(max: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    let count = await this.iuploaded.count()
    if (count > max) {
      return this.iuploaded
        .orderBy('UploadTime')
        .limit(max - count)
        .delete()
    }
    return 0
  }
  async clearUploadedAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.clear()
  }

  

  async getUploadObj(key: string): Promise<object | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.iobject, () => {
      return this.iobject.get(key)
    })
  }

  async saveUploadObj(key: string, value: object) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iobject.put(value, key).catch(() => {})
  }
}

const DBUpload = new XBYDB3Upload()
export default DBUpload
