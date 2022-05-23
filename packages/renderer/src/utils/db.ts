import Dexie from 'dexie'
import { ITokenInfo } from '@/user/userstore'
import { IOtherShareLinkModel } from '@/share/share/OtherShareStore'

export interface ICache {
  key: string
  time: number
  value: object
}

class XBYDB3 extends Dexie {
  iobject: Dexie.Table<object, string>
  istring: Dexie.Table<string, string>
  inumber: Dexie.Table<number, string>
  ibool: Dexie.Table<boolean, string>

  itoken: Dexie.Table<ITokenInfo, string>
  iothershare: Dexie.Table<IOtherShareLinkModel, string>
  idowning: Dexie.Table<Buffer, number>
  idowned: Dexie.Table<Buffer, number>
  iuploading: Dexie.Table<Buffer, number>
  iuploaded: Dexie.Table<Buffer, number>
  ifilehash: Dexie.Table<object, string>

  constructor() {
    super('XBYDB3')

    this.version(1)
      .stores({
        iobject: '',
        istring: '',
        inumber: '',
        ibool: '',

        itoken: '',
        iothershare: '',
        idowning: '',
        idowned: '',
        iuploading: '',
        iuploaded: '',
        ifilehash: ''
      })
      .upgrade((tx: any) => {
        console.log('upgrade', tx)
      })
    this.iobject = this.table('iobject')
    this.istring = this.table('istring')
    this.inumber = this.table('inumber')
    this.ibool = this.table('ibool')

    this.itoken = this.table('itoken')
    this.iothershare = this.table('iothershare')
    this.idowning = this.table('idowning')
    this.idowned = this.table('idowned')
    this.iuploading = this.table('iuploading')
    this.iuploaded = this.table('iuploaded')
    this.ifilehash = this.table('ifilehash')
  }

  async getValueString(key: string): Promise<string> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.istring.get(key)
    if (val) return val
    else return ''
  }
  async saveValueString(key: string, value: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.istring.put(value || '', key)
  }
  async getValueNumber(key: string): Promise<number> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.inumber.get(key)
    if (val) return val
    return 0
  }
  async saveValueNumber(key: string, value: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.inumber.put(value, key)
  }
  async getValueBool(key: string): Promise<boolean> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.ibool.get(key)
    if (val) return true
    return false
  }
  async saveValueBool(key: string, value: boolean) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.ibool.put(value || false, key)
  }
  async getValueObject(key: string): Promise<object | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.iobject.get(key)
    if (val) return val
    else return undefined
  }
  async saveValueObject(key: string, value: object) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iobject.put(value, key).catch(() => {})
  }
  async deleteValueObject(key: string) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iobject.delete(key)
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

  async getOtherShare(share_id: string): Promise<IOtherShareLinkModel | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    return await this.iothershare.get(share_id)
  }
  async getOtherShareAll(): Promise<IOtherShareLinkModel[]> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const list = await this.iothershare.toArray()
    return list.sort((a: IOtherShareLinkModel, b: IOtherShareLinkModel) => b.saved_time - a.saved_time)
  }
  async deleteOtherShareBatch(share_id_list: string[]) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iothershare.bulkDelete(share_id_list)
  }
  async saveOtherShare(share: IOtherShareLinkModel) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iothershare.put(share, share.share_id).catch(() => {})
  }

  async getDowning(key: number): Promise<Buffer | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.idowning.get(key)
    if (val) return val
    else return undefined
  }
  async deleteDowning(key: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.idowning.delete(key)
  }
  async saveDowning(key: number, value: Buffer) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.idowning.put(value, key).catch(() => {})
  }
  async deleteDowningAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.idowning.clear()
  }

  async getDowned(key: number): Promise<Buffer | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.idowned.get(key)
    if (val) return val
    else return undefined
  }
  async deleteDowned(key: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.idowned.delete(key)
  }
  async saveDowned(key: number, value: Buffer) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.idowned.put(value, key).catch(() => {})
  }
  async deleteDownedAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.idowned.clear()
  }

  async getUploading(key: number): Promise<Buffer | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.iuploading.get(key)
    if (val) return val
    else return undefined
  }
  async deleteUploading(key: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploading.delete(key)
  }
  async saveUploading(key: number, value: Buffer) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploading.put(value, key).catch(() => {})
  }
  async deleteUploadingAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploading.clear()
  }

  async getUploaded(key: number): Promise<Buffer | undefined> {
    if (!this.isOpen()) await this.open().catch(() => {})
    const val = await this.iuploaded.get(key)
    if (val) return val
    else return undefined
  }
  async deleteUploaded(key: number) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.delete(key)
  }
  async saveUploaded(key: number, value: Buffer) {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.put(value, key).catch(() => {})
  }
  async deleteUploadedAll() {
    if (!this.isOpen()) await this.open().catch(() => {})
    return this.iuploaded.clear()
  }
}

const DB = new XBYDB3()
export default DB
