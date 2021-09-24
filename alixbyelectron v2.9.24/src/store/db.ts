import Dexie from 'dexie';
import { SQL, StoreDown, StoreUpload } from '.';
import { IStateDownFile, IStateUploadFile, ITokenInfo } from './models';

export interface IString {
  key: string;
  value: string;
}
export interface INumber {
  key: string;
  value: number;
}
export interface IBool {
  key: string;
  value: boolean;
}
export interface IObject {
  key: string;
  value: object;
}
export interface ICache {
  key: string;
  time: number;
  value: object;
}
export interface IFile {
  key: string;
  data: Blob;
}

class XBYDatabase extends Dexie {
  istring: Dexie.Table<IString, string>;
  inumber: Dexie.Table<INumber, string>;
  ibool: Dexie.Table<IBool, string>;
  iobject: Dexie.Table<IObject, string>;
  itoken: Dexie.Table<ITokenInfo, string>;
  ifile: Dexie.Table<Blob, string>;
  icache: Dexie.Table<Blob, string>;
  idowning: Dexie.Table<object, string>;
  idowned: Dexie.Table<object, string>;
  iuploading: Dexie.Table<object, string>;
  iuploaded: Dexie.Table<object, string>;
  iroot: Dexie.Table<ICache, string>;

  constructor() {
    super('XBYDatabase');

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
      })
      .upgrade((tx) => {
        console.log('upgrade', tx);
      });
    this.istring = this.table('istring');
    this.inumber = this.table('inumber');
    this.ibool = this.table('ibool');
    this.iobject = this.table('iobject');
    this.itoken = this.table('itoken');
    this.ifile = this.table('ifile');
    this.icache = this.table('icache');
    this.idowning = this.table('idowning');
    this.idowned = this.table('idowned');
    this.iuploading = this.table('iuploading');
    this.iuploaded = this.table('iuploaded');
    this.iroot = this.table('iroot');
  }

  async getValueString(key: string): Promise<string> {
    if (!this.isOpen()) await this.open();
    const val = await this.istring.get(key);
    if (val) return val.value;
    else return '';
  }
  async getValueNumber(key: string): Promise<number> {
    if (!this.isOpen()) await this.open();
    const val = await this.inumber.get(key);
    if (val) return val.value;
    if (key === 'uiXBTNumber') return 32; 
    return 0;
  }
  async getValueBool(key: string): Promise<boolean> {
    if (!this.isOpen()) await this.open();
    const val = await this.ibool.get(key);
    if (val) return val.value;
    if (key === 'uiAutoColorVideo') return true; 
    if (key === 'uiFolderSize') return true; 
    return false;
  }
  async getValueObject(key: string): Promise<object | undefined> {
    if (!this.isOpen()) await this.open();
    const val = await this.iobject.get(key);
    if (val) return val.value;
    else return undefined;
  }

  async saveValueString(key: string, value: string) {
    if (!this.isOpen()) await this.open();
    return this.istring.put({ key, value }, key);
  }
  async saveValueNumber(key: string, value: number) {
    if (!this.isOpen()) await this.open();
    return this.inumber.put({ key, value }, key);
  }
  async saveValueBool(key: string, value: boolean) {
    if (!this.isOpen()) await this.open();
    return this.ibool.put({ key, value }, key);
  }
  async saveValueObject(key: string, value: object) {
    if (!this.isOpen()) await this.open();
    return this.iobject.put({ key, value }, key);
  }

  async getUser(userid: string): Promise<ITokenInfo | undefined> {
    if (!this.isOpen()) await this.open();
    return await this.itoken.get(userid);
  }
  async getUserAll(): Promise<ITokenInfo[]> {
    if (!this.isOpen()) await this.open();
    const list = await this.itoken.toArray();
    return list.sort((a, b) => b.used_size - a.used_size);
  }
  async deleteUser(userid: string) {
    if (!this.isOpen()) await this.open();
    return this.itoken.delete(userid);
  }
  async saveUser(token: ITokenInfo) {
    if (!this.isOpen()) await this.open();
    return this.itoken.put(token, token.user_id);
  }

  async getFile(key: string): Promise<Blob | undefined> {
    if (!this.isOpen()) await this.open();
    const val = await this.ifile.get(key);
    return val;
  }
  async saveFile(key: string, data: Blob) {
    if (!this.isOpen()) await this.open();
    return this.ifile.put(data, key);
  }

  async updateToSql() {
    if (!this.isOpen()) await this.open();
    await this.iroot.clear();
    await this.iobject.where('key').notEqual('fileColor').delete();

    const list = (await this.idowning.toArray()) as IStateDownFile[];
    await SQL.SaveDownings(list);
    const idlist: string[] = [];
    for (let i = 0; i < list.length; i++) {
      idlist.push(list[i].DownID);
    }
    if (idlist.length > 0) await this.idowning.bulkDelete(idlist);

    const list2 = (await this.idowned.toArray()) as IStateDownFile[];
    await SQL.SaveDowneds(list2);
    const idlist2: string[] = [];
    for (let i = 0; i < list2.length; i++) {
      idlist2.push(list2[i].DownID);
    }
    if (idlist2.length > 0) await this.idowned.bulkDelete(idlist2);

    if (idlist.length > 0 || idlist2.length > 0) await StoreDown.aLoadFromDB();

    const ulist = (await this.iuploading.toArray()) as IStateUploadFile[];
    await SQL.SaveUploadings(ulist);
    const uidlist: string[] = [];
    for (let i = 0; i < ulist.length; i++) {
      uidlist.push(ulist[i].UploadID);
    }
    if (uidlist.length > 0) await this.iuploading.bulkDelete(uidlist);

    const ulist2 = (await this.iuploaded.toArray()) as IStateUploadFile[];
    await SQL.SaveUploadeds(ulist2);
    const uidlist2: string[] = [];
    for (let i = 0; i < ulist2.length; i++) {
      uidlist2.push(ulist2[i].UploadID);
    }
    if (uidlist2.length > 0) await this.iuploaded.bulkDelete(uidlist2);

    if (uidlist.length > 0 || uidlist2.length > 0) await StoreUpload.aLoadFromDB();
  }
}

const db = new XBYDatabase();
export default db;
