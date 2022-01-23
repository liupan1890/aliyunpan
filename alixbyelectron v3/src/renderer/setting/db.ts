import Dexie from 'dexie'
import { IShareLinkModel, IStateDownFile, IStateUploadFile, ITokenInfo } from '../store/models'
import SQL from '../store/sql'

export interface IString {
  key: string
  value: string
}
export interface INumber {
  key: string
  value: number
}
export interface IBool {
  key: string
  value: boolean
}
export interface IObject {
  key: string
  value: object
}
export interface ICache {
  key: string
  time: number
  value: object
}
export interface IFile {
  key: string
  data: Blob
}

class XBYDatabase extends Dexie {
  istring: Dexie.Table<IString, string>
  inumber: Dexie.Table<INumber, string>
  ibool: Dexie.Table<IBool, string>
  iobject: Dexie.Table<IObject, string>
  itoken: Dexie.Table<ITokenInfo, string>
  ifile: Dexie.Table<Blob, string>
  icache: Dexie.Table<Blob, string>
  idowning: Dexie.Table<object, string>
  idowned: Dexie.Table<object, string>
  iuploading: Dexie.Table<object, string>
  iuploaded: Dexie.Table<object, string>
  iroot: Dexie.Table<ICache, string>

  constructor() {
    super('XBYDatabase')

    this.version(6)
      .stores({
        istring: 'key',
        inumber: 'key',
        ibool: 'key',
        iobject: 'key',
        itoken: 'user_id',
        ifile: '',
        icache: '',
        idowning: 'DownID',
        idowned: 'DownID',
        iuploading: 'UploadID',
        iuploaded: 'UploadID',
        iroot: 'key',
        ishare: 'share_id'
      })
      .upgrade((tx: any) => {
        console.log('upgrade', tx)
      })
    this.istring = this.table('istring')
    this.inumber = this.table('inumber')
    this.ibool = this.table('ibool')
    this.iobject = this.table('iobject')
    this.itoken = this.table('itoken')
    this.ifile = this.table('ifile')
    this.icache = this.table('icache')
    this.idowning = this.table('idowning')
    this.idowned = this.table('idowned')
    this.iuploading = this.table('iuploading')
    this.iuploaded = this.table('iuploaded')
    this.iroot = this.table('iroot')
  }
}

const DB1 = new XBYDatabase()
class XBYDB211 extends Dexie {
  istring: Dexie.Table<IString, string>
  inumber: Dexie.Table<INumber, string>
  ibool: Dexie.Table<IBool, string>
  iobject: Dexie.Table<IObject, string>
  itoken: Dexie.Table<ITokenInfo, string>
  ifile: Dexie.Table<Blob, string>
  ishare: Dexie.Table<IShareLinkModel, string>

  constructor() {
    super('XBYDB211')

    this.version(6)
      .stores({
        istring: 'key',
        inumber: 'key',
        ibool: 'key',
        iobject: 'key',
        itoken: 'user_id',
        ifile: '',
        ishare: 'share_id'
      })
      .upgrade((tx: any) => {
        console.log('upgrade', tx)
      })
    this.istring = this.table('istring')
    this.inumber = this.table('inumber')
    this.ibool = this.table('ibool')
    this.iobject = this.table('iobject')

    this.itoken = this.table('itoken')
    this.ifile = this.table('ifile')
    this.ishare = this.table('ishare')
  }

  async getValueString(key: string): Promise<string> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.istring.get(key)
    if (val) return val.value
    else return ''
  }
  async getValueNumber(key: string): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.inumber.get(key)
    if (val) return val.value
    if (key === 'uiXBTNumber') return 32
    if (key === 'uiTrashAutoCleanDay') return 9999
    return 0
  }
  async getValueBool(key: string): Promise<boolean> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.ibool.get(key)
    if (val) return val.value
    if (key === 'uiAutoColorVideo') return true
    if (key === 'uiFolderSize') return true
    if (key === 'downSavePathDefault') return true
    if (key === 'downSavePathFull') return true
    if (key === 'downSaveBreakWeiGui') return true
    if (key === 'downSaveShowPro') return true
    if (key === 'ariaRetry') return true

    return false
  }
  async getValueObject(key: string): Promise<object | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.iobject.get(key)
    if (val) return val.value
    else return undefined
  }
  async saveValueString(key: string, value: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.istring.put({ key, value: value || '' }, key)
  }
  async saveValueNumber(key: string, value: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.inumber.put({ key, value }, key)
  }
  async saveValueBool(key: string, value: boolean) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ibool.put({ key, value: value || false }, key)
  }
  async saveValueObject(key: string, value: object) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iobject.put({ key, value }, key).catch(() => {})
  }
  async getUser(userid: string): Promise<ITokenInfo | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.itoken.get(userid)
  }
  async getUserAll(): Promise<ITokenInfo[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const list = await this.itoken.toArray()
    return list.sort((a: ITokenInfo, b: ITokenInfo) => b.used_size - a.used_size)
  }
  async deleteUser(userid: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.itoken.delete(userid)
  }
  async saveUser(token: ITokenInfo) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.itoken.put(token, token.user_id).catch(() => {})
  }
  async getFile(key: string): Promise<Blob | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.ifile.get(key)
    return val
  }
  async saveFile(key: string, data: Blob) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ifile.put(data, key)
  }
  async getShare(share_id: string): Promise<IShareLinkModel | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.ishare.get(share_id)
  }
  async getShareAll(): Promise<IShareLinkModel[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const list = await this.ishare.toArray()
    return list.sort((a: IShareLinkModel, b: IShareLinkModel) => b.logtime! - a.logtime!)
  }
  async deleteShare(share_id: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ishare.delete(share_id)
  }
  async saveShare(share: IShareLinkModel) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ishare.put(share, share.share_id).catch(() => {})
  }

  async updateTov211() {
    if (!this.isOpen()) await this.open().catch(() => {})

    if (await this.getValueBool('upgrade')) return

    if (!DB1.isOpen()) await DB1.open().catch(() => {})
    await DB1.iroot.clear().catch(() => {})
    await DB1.iobject
      .where('key')
      .noneOf(['fileColor', 'fileTop', 'logList', 'downIngoredList', 'shareSiteList'])
      .delete()
      .catch(() => {})

    const listb = (await DB1.ibool.toArray()) as IBool[]
    await this.ibool.bulkPut(listb)
    DB1.ibool.clear().catch(() => {})
    const lists = (await DB1.istring.toArray()) as IString[]
    await this.istring.bulkPut(lists)
    DB1.istring.clear().catch(() => {})
    const listn = (await DB1.inumber.toArray()) as INumber[]
    await this.inumber.bulkPut(listn)
    DB1.inumber.clear().catch(() => {})
    const listo = (await DB1.iobject.toArray()) as IObject[]
    await this.iobject.bulkPut(listo)
    DB1.iobject.clear().catch(() => {})
    await DB1.ifile.each((val, cursor) => {
      this.ifile.put(val, cursor.key)
    })
    DB1.ifile.clear().catch(() => {})
    await DB1.itoken.each((val, cursor) => {
      if (val.tokenfrom == 'account') this.itoken.put(val, cursor.key)
    })
    DB1.itoken.clear().catch(() => {})

    const list = (await DB1.idowning.toArray()) as IStateDownFile[]
    await SQL.OldSaveDownings(list).catch(() => {})
    const idlist: string[] = []
    for (let i = 0, maxi = list.length; i < maxi; i++) {
      idlist.push(list[i].DownID)
    }
    if (idlist.length > 0) await DB1.idowning.bulkDelete(idlist).catch(() => {})

    const list2 = (await DB1.idowned.toArray()) as IStateDownFile[]
    await SQL.OldSaveDowneds(list2).catch(() => {})
    const idlist2: string[] = []
    for (let i = 0, maxi = list2.length; i < maxi; i++) {
      idlist2.push(list2[i].DownID)
    }
    if (idlist2.length > 0) await DB1.idowned.bulkDelete(idlist2).catch(() => {})

    const ulist = (await DB1.iuploading.toArray()) as IStateUploadFile[]
    await SQL.OldSaveUploadings(ulist).catch(() => {})
    const uidlist: string[] = []
    for (let i = 0, maxi = ulist.length; i < maxi; i++) {
      uidlist.push(ulist[i].UploadID)
    }
    if (uidlist.length > 0) await DB1.iuploading.bulkDelete(uidlist).catch(() => {})

    const ulist2 = (await DB1.iuploaded.toArray()) as IStateUploadFile[]
    await SQL.OldSaveUploadeds(ulist2).catch(() => {})
    const uidlist2: string[] = []

    for (let i = 0, maxi = ulist2.length; i < maxi; i++) {
      uidlist2.push(ulist2[i].UploadID)
    }
    if (uidlist2.length > 0) await DB1.iuploaded.bulkDelete(uidlist2).catch(() => {})

    await this.saveValueBool('upgrade', true)
  }
}

const DB = new XBYDB211()
export default DB
