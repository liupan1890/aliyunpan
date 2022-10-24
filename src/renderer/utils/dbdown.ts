import Dexie from 'dexie'

export interface IDowningInfo {
  
  key: string
  
  time: number
  
  fileCount: number
  
  fileSize: number
  
  dirCount: number
}

class XBYDB3Down extends Dexie {
  
  downingProgress: Dexie.Table<object, string>
  
  downingInfo: Dexie.Table<IDowningInfo, string>
  
  downingGzip: Dexie.Table<Buffer, string>
  
  downedGzip: Dexie.Table<Buffer, string>

  constructor() {
    super('XBYDB3Down')

    this.version(1)
      .stores({
        downingProgress: '',
        downingInfo: 'key',
        downingGzip: '',
        downedGzip: ''
      })
      .upgrade((tx: any) => {
        console.log('upgrade', tx)
      })

    this.downingProgress = this.table('downingProgress')
    this.downingInfo = this.table('downingInfo')
    this.downingGzip = this.table('downingGzip')
    this.downedGzip = this.table('downedGzip')
  }

  async getDowningGzip(key: string): Promise<Buffer | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.downingGzip.get(key)
    if (val) return val
    else return undefined
  }

  async deleteDowningGzip(key: string): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingGzip.delete(key)
  }

  async saveDowningGzip(key: string, value: Buffer): Promise<string | void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingGzip.put(value, key).catch(() => {})
  }

  async deleteDowningGzipAll(): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingGzip.clear()
  }

  async getDownedGzip(key: string): Promise<Buffer | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.downedGzip.get(key)
    if (val) return val
    else return undefined
  }

  async deleteDownedGzip(key: string): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downedGzip.delete(key)
  }

  async saveDownedGzip(key: string, value: Buffer): Promise<string | void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downedGzip.put(value, key).catch(() => {})
  }

  async deleteDownedGzipAll(): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downedGzip.clear()
  }

  async getDowningInfo(key: string): Promise<IDowningInfo | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.downingInfo.get(key)
    if (val) return val
    else return undefined
  }

  async deleteDowningInfo(key: string): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingInfo.delete(key)
  }

  async saveDowningInfo(key: string, value: IDowningInfo): Promise<string | void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingInfo.put(value, key).catch(() => {})
  }

  async deleteDowningInfoAll(): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingInfo.clear()
  }

  async getDowningProgress(key: string): Promise<object | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.downingProgress.get(key)
    if (val) return val
    else return undefined
  }

  async deleteDowningProgress(key: string): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingProgress.delete(key)
  }

  async saveDowningProgress(key: string, value: object): Promise<string | void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingProgress.put(value, key).catch(() => {})
  }

  async deleteDowningProgressAll(): Promise<void> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.downingProgress.clear()
  }
}

const DB = new XBYDB3Down()
export default DB
