import Dexie from 'dexie'
import { IStateDebugLog } from './debuglog'

export interface IStateFileHash {
  size: number
  mtime: number
  
  presha1: string
  sha1: string
  name: string
}
class XBYDB3Cache extends Dexie {
  ilog: Dexie.Table<IStateDebugLog>
  ifilehash: Dexie.Table<IStateFileHash>
  iobject: Dexie.Table<object, string>

  constructor() {
    super('XBYDB3Cache')

    this.version(1)
      .stores({
        ilog: '&logid',
        ifilehash: '++id,[size+mtime]',
        iobject: ''
      })
      .upgrade((tx: any) => {
        console.log('upgrade', tx)
      })
    this.ilog = this.table('ilog')
    this.ifilehash = this.table('ifilehash')
    this.iobject = this.table('iobject')
  }

  async saveLog(value: IStateDebugLog) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ilog.put(value).catch(() => {})
  }

  async getLogAll(): Promise<IStateDebugLog[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.transaction('r', this.ilog, () => {
      return this.ilog.reverse().limit(500).toArray()
    })
  }

  async deleteLogAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ilog.clear()
  }

  async deleteLogOutCount(max: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    let count = await this.ilog.count()
    if (count > max) {
      return this.ilog.limit(max - count).delete()
    }
    return 0
  }

  async getFileHashList(size: number, mtime: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ifilehash.where({ size, mtime }).toArray()
  }
  async saveFileHash(value: IStateFileHash) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ifilehash.put(value).catch(() => {})
  }
}

const DBCache = new XBYDB3Cache()
export default DBCache
