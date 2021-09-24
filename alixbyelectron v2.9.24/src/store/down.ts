import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';
import { IAriaDownProgress, IStateDownFile, IStatePanFile } from './models';
import { SQL, StoreDown, StoreRoot, StoreSetting, StoreUser } from '.';
import { AriaAddUrl, AriaConnect, AriaDeleteList, AriaGetDowningList, AriaHashFile, AriaStopList, ClearFileName, FormateAriaError } from './aria2c';
import { format } from 'quasar';
import { RootDirMap } from './root';
import path from 'path';
import { NotifySuccess } from 'src/aliapi/notify';
import { ProtoPanFileInfo } from './proto';
interface IStateDown {
  selectedFiles: Map<string, boolean>; 
  selectedFileLast: string; 
  totalDownSpeed: string; 
  changDowningTime: object;
  changDownedTime: object;
}

let SaveTime = 0; 
let ChangDowningTime = 0;
let ChangDownedTime = 0;
export let DowningList: IStateDownFile[] = [];
export let DownedList: IStateDownFile[] = [];
@Module({ namespaced: true, name: 'Down', stateFactory: true })
export default class Down extends VuexModule implements IStateDown {
  public changDowningTime = {};
  public changDownedTime = {};
  public selectedFileLast = '';
  public selectedFiles = new Map<string, boolean>();

  public totalDownSpeed = '';

  get gSelectedDowningCount(): number {
    return this.selectedFiles.size;
  }
  get gDowningCount() {
    return () => DowningList.length;
  }
  get gDownedCount() {
    return () => DownedList.length;
  }
  get gSelectedDowningKey(): string[] {
    return [...this.selectedFiles.keys()];
  }

  get gDowningList() {
    return () => DowningList;
  }
  get gDownedList() {
    return () => DownedList;
  }

  @Action
  async aLoadFromDB() {
    DownedList = await SQL.GetAllDowned();
    DowningList = await SQL.GetAllDowning();
    for (let i = 0; i < DowningList.length; i++) {
      const downing = DowningList[i];
      Object.freeze(downing.Info);
    }
    for (let i = 0; i < DownedList.length; i++) {
      Object.freeze(DownedList[i]);
    }
    ChangDowningTime = 1;
    ChangDownedTime = 1;
    StoreDown.mRefreshDowningList();
    StoreDown.mRefreshDownedList();
  }
  @Mutation
  mRefreshDowningList() {
    if (ChangDowningTime == 0 && DowningList.length > 0) return;
    this.changDowningTime = { ts: Date.now() };
    ChangDowningTime = 0;
  }

  @Mutation
  mRefreshDownedList() {
    if (ChangDownedTime == 0 && DownedList.length > 0) return;
    this.changDownedTime = { ts: Date.now() };
    ChangDownedTime = 0;
  }

  @Mutation 
  mChangSelectedFile({ DownID, ctrl, shift }: { DownID: string; ctrl: boolean; shift: boolean }) {
    if (DownID === 'all') {
      this.selectedFileLast = '';
      const s = new Map<string, boolean>();
      if (this.selectedFiles.size != DowningList.length) {
        const children = DowningList;
        for (let i = 0; i < children.length; i++) {
          s.set(children[i].DownID, true);
        }
      }
      this.selectedFiles = s;
    } else {
      if (shift) {
        if (this.selectedFileLast == '' || this.selectedFileLast == DownID) {
          ctrl = true;
        } else {
          const s = new Map(this.selectedFiles);
          let a = -1;
          let b = -1;
          for (let i = 0; i < DowningList.length; i++) {
            if (DowningList[i].DownID == DownID) a = i;
            if (DowningList[i].DownID == this.selectedFileLast) b = i;
            if (a > 0 && b > 0) break;
          }
          if (a < 0 || b < 0 || a == b) {
            ctrl = true;
          } else {
            if (a > b) [a, b] = [b, a]; 

            for (let n = a; n <= b; n++) {
              s.set(DowningList[n].DownID, true);
            }
            this.selectedFileLast = DownID;
            this.selectedFiles = s;
            return;
          }
        }
      }

      if (ctrl) {
        if (this.selectedFiles.has(DownID)) this.selectedFiles.delete(DownID);
        else this.selectedFiles.set(DownID, true);
        this.selectedFileLast = DownID;
        return;
      }

      if (DownID == '' || this.selectedFiles.has(DownID)) this.selectedFiles = new Map<string, boolean>();
      else this.selectedFiles = new Map<string, boolean>([[DownID, true]]);

      this.selectedFileLast = DownID;
    }
  }

  @Action
  async aSpeedEvent() {
    const isonline = await AriaConnect();
    if (isonline) {
      await AriaGetDowningList().catch(() => {
        //
      });

      let downingCount = 0;
      const ariaRemote = StoreSetting.ariaRemote;
      for (let j = 0; j < DowningList.length; j++) {
        if (DowningList[j].Info.ariaRemote != ariaRemote) continue; 
        if (DowningList[j].Down.IsDowning) {
          downingCount++;
        }
        if (DowningList[j].Down.IsCompleted && DowningList[j].Down.DownState === '已完成') {
          StoreDown.mSaveToDowned(DowningList[j].DownID);
          j--;
        }
      }
      const time = Date.now() - 60 * 1000; 
      for (let j = 0; j < DowningList.length; j++) {
        if (downingCount >= StoreSetting.downFileMax) break; 
        if (DowningList[j].Info.ariaRemote != ariaRemote) continue; 
        const DownID = DowningList[j].DownID;
        const down = DowningList[j].Down;
        if (down.IsCompleted == false && down.IsStop == false && down.IsDowning == false) {
          if (down.IsFailed == false || time > down.AutoTry) {
            downingCount += 1;
            ChangDowningTime += 1;
            StoreDown.mUpdateDownState({ DownID, IsDowning: true, DownSpeedStr: '', DownState: '解析中', DownTime: Date.now(), FailedCode: 0, FailedMessage: '' });

            AriaAddUrl(DowningList[j]).then((ret) => {
              if (ret == 'downed') {
                StoreDown.mUpdateDownState({
                  DownID,
                  IsDowning: true,
                  IsCompleted: true,
                  DownProcess: 100,
                  DownSpeedStr: '',
                  DownState: '已完成',
                  AutoTry: 0,
                  IsFailed: false,
                  IsStop: false,
                  FailedCode: 0,
                  FailedMessage: '',
                });
              } else if (ret == 'success') {
                StoreDown.mUpdateDownState({
                  DownID,
                  IsDowning: true,
                  IsCompleted: false,
                  DownSpeedStr: '',
                  DownState: '下载中',
                  AutoTry: 0,
                  IsFailed: false,
                  IsStop: false,
                  FailedCode: 0,
                  FailedMessage: '',
                });
              } else if (ret == '已暂停') {
                StoreDown.mUpdateDownState({
                  DownID,
                  IsDowning: false,
                  IsCompleted: false,
                  DownSpeedStr: '',
                  DownState: '已暂停',
                  AutoTry: 0,
                  IsFailed: false,
                  IsStop: true,
                  FailedCode: 0,
                  FailedMessage: '已暂停',
                });
              } else {
                StoreDown.mUpdateDownState({
                  DownID,
                  IsDowning: false,
                  IsCompleted: false,
                  DownSpeedStr: '',
                  DownState: '出错稍后自动重试',
                  AutoTry: Date.now(),
                  IsFailed: true,
                  IsStop: false,
                  FailedCode: 504,
                  FailedMessage: ret,
                });
              }
            });
          }
        }
      }
    }
    StoreDown.mRefreshDowningList();
    StoreDown.mRefreshDownedList();
  }

  @Mutation
  mUpdateDownState(data: any) {
    const DownID = data.DownID;
    for (let j = 0; j < DowningList.length; j++) {
      if (DowningList[j].DownID == DownID) {
        DowningList[j].Down = { ...DowningList[j].Down, ...data };
        break;
      }
    }
    ChangDowningTime += 1;
  }

  @Mutation
  mSpeedEvent(list: IAriaDownProgress[]) {
    if (list == undefined) list = [];
    const dellist: string[] = [];
    let hasSpeed = 0;
    for (let n = 0; n < DowningList.length; n++) {
      if (DowningList[n].Down.DownSpeedStr != '') {
        const gid = DowningList[n].Info.GID;
        let isfind = false;
        for (let m = 0; m < list.length; m++) {
          if (list[m].gid == gid && list[m].status == 'active') {
            isfind = true;
            break;
          }
        }
        if (isfind == false) {
          DowningList[n].Down.DownState = '';
          DowningList[n].Down.DownSpeed = 0;
          DowningList[n].Down.DownSpeedStr = '';
          ChangDowningTime += 1;
        }
      }
    }
    const ariaRemote = StoreSetting.ariaRemote;

    const savelist: IStateDownFile[] = [];
    for (let i = 0; i < list.length; i++) {
      try {
        const gid = list[i].gid;
        const iscomplete = list[i].status === 'complete';
        const isdowning = iscomplete || list[i].status === 'active' || list[i].status === 'waiting';
        const iserror = list[i].status === 'error';
        const isstop = list[i].status === 'paused' || list[i].status === 'removed';

        for (let j = 0; j < DowningList.length; j++) {
          if (DowningList[j].Info.ariaRemote != ariaRemote) continue; 
          if (DowningList[j].Info.GID == gid) {
            ChangDowningTime += 1;
            const downitem = DowningList[j];
            const down = downitem.Down;
            const totalLength = parseInt(list[i].totalLength) || 0;
            down.DownSize = parseInt(list[i].completedLength) || 0;
            down.DownSpeed = parseInt(list[i].downloadSpeed) || 0;
            down.DownSpeedStr = format.humanStorageSize(down.DownSpeed) + '/s';
            down.DownProcess = Math.floor((down.DownSize * 100) / (totalLength + 1)) % 100;

            down.IsCompleted = iscomplete;
            down.IsDowning = isdowning;
            down.IsFailed = iserror;
            down.IsStop = isstop;

            if (list[i].errorCode && list[i].errorCode != '0') {
              down.FailedCode = parseInt(list[i].errorCode) || 0;
              down.FailedMessage = FormateAriaError(list[i].errorCode, list[i].errorMessage);
            }

            if (iscomplete) {
              down.DownSize = downitem.Info.size;
              down.DownSpeed = 0;
              down.DownSpeedStr = '';
              down.DownProcess = 100;
              down.FailedCode = 0;
              down.FailedMessage = '';

              down.DownState = '校验中';
              const check = AriaHashFile(downitem);
              if (check.Check) {
                StoreDown.mUpdateDownState({
                  DownID: check.DownID,
                  DownState: '已完成',
                  IsFailed: false,
                  IsDowning: true,
                  IsStop: false,
                  IsCompleted: true,
                  FailedMessage: '',
                });
              } else {
                StoreDown.mUpdateDownState({
                  DownID: check.DownID,
                  DownState: '校验失败',
                  IsFailed: true,
                  IsDowning: false,
                  IsStop: true,
                  IsCompleted: false,
                  FailedMessage: '移动文件失败，请重新下载',
                });
              }
            } else if (isstop) {
              down.DownState = '已暂停';
              down.DownSpeed = 0;
              down.DownSpeedStr = '';
              down.FailedCode = 0;
              down.FailedMessage = '';
            } else if (isstop || iserror) {
              down.DownState = '出错稍后自动重试';
              down.DownSpeed = 0;
              down.DownSpeedStr = '';
              down.AutoTry = Date.now();
              if (down.FailedMessage == '') down.FailedMessage = '下载失败';
            } else if (isdowning) {
              hasSpeed += down.DownSpeed;
              let lasttime = ((totalLength - down.DownSize) / (down.DownSpeed + 1)) % 356400; 
              if (lasttime < 1) lasttime = 1;
              down.DownState =
                down.DownProcess.toString() +
                '% ' +
                (lasttime / 3600).toFixed(0).padStart(2, '0') +
                ':' +
                ((lasttime % 3600) / 60).toFixed(0).padStart(2, '0') +
                ':' +
                (lasttime % 60).toFixed(0).padStart(2, '0');
              if (SaveTime > 10) savelist.push(downitem);
            } else {
              //console.log('update', DowningList[j]);
            }
            if (isstop || iserror || iscomplete) {
              dellist.push(gid);
            }
            ChangDowningTime += 1;
            break;
          }
        }
      } catch {}
    }

    if (savelist.length > 0) SQL.SaveDownings(savelist); 
    if (dellist.length > 0) AriaDeleteList(dellist);
    if (hasSpeed > 0) this.totalDownSpeed = format.humanStorageSize(hasSpeed) + '/s';
    else this.totalDownSpeed = '';

    if (SaveTime > 10) SaveTime = 0;
    else SaveTime++;
  }

  @Mutation
  mStartDowning(downIDList: string[]) {
    const ariaRemote = StoreSetting.ariaRemote;
    for (let i = 0; i < downIDList.length; i++) {
      const DownID = downIDList[i];
      for (let j = 0; j < DowningList.length; j++) {
        if (DowningList[j].Info.ariaRemote != ariaRemote) continue; 
        if (DowningList[j].DownID == DownID) {
          const down = DowningList[j].Down;
          if (down.IsDowning || down.IsCompleted) continue;

          //down.IsDowning = false;
          //down.IsCompleted = false;
          down.IsStop = false;
          down.DownState = '排队中';
          down.DownSpeed = 0;
          down.DownSpeedStr = '';
          down.IsFailed = false;
          down.FailedCode = 0;
          down.FailedMessage = '';
          down.AutoTry = 0;
          ChangDowningTime += 1;

          break;
        }
      }
    }
  }
  @Mutation
  mStartAllDowning() {
    const ariaRemote = StoreSetting.ariaRemote;
    for (let j = 0; j < DowningList.length; j++) {
      if (DowningList[j].Info.ariaRemote != ariaRemote) continue; 
      const down = DowningList[j].Down;
      if (down.IsDowning || down.IsCompleted) continue;

      //down.IsDowning = false;
      //down.IsCompleted = false;
      down.IsStop = false;
      down.DownState = '排队中';
      down.DownSpeed = 0;
      down.DownSpeedStr = '';
      down.IsFailed = false;
      down.FailedCode = 0;
      down.FailedMessage = '';
      down.AutoTry = 0;
      ChangDowningTime += 1;
    }
  }
  @Mutation
  mStopDowning(downIDList: string[]) {
    const gidlist: string[] = [];
    for (let i = 0; i < downIDList.length; i++) {
      const DownID = downIDList[i];
      for (let j = 0; j < DowningList.length; j++) {
        if (DowningList[j].DownID == DownID) {
          const down = DowningList[j].Down;
          if (down.IsCompleted) continue; 

          gidlist.push(DowningList[j].Info.GID);
          down.IsDowning = false;
          down.IsCompleted = false;
          down.IsStop = true;
          down.DownState = '已暂停';
          down.DownSpeed = 0;
          down.DownSpeedStr = '';
          down.IsFailed = false;
          down.FailedCode = 0;
          down.FailedMessage = '';
          down.AutoTry = 0;
          ChangDowningTime += 1;

          break;
        }
      }
    }
    AriaStopList(gidlist);
    StoreDown.mRefreshDowningList();
  }
  @Mutation
  mStopAllDowning() {
    const gidlist: string[] = [];
    for (let j = 0; j < DowningList.length; j++) {
      const down = DowningList[j].Down;
      if (down.IsCompleted) continue; 

      gidlist.push(DowningList[j].Info.GID);
      down.IsDowning = false;
      down.IsStop = true;
      down.DownState = '已暂停';
      down.DownSpeed = 0;
      down.DownSpeedStr = '';
      down.IsFailed = false;
      down.FailedCode = 0;
      down.FailedMessage = '';
      down.AutoTry = 0;
      ChangDowningTime += 1;
    }
    AriaStopList(gidlist);
    StoreDown.mRefreshDowningList();
  }
  @Mutation
  mDeleteDowning(downIDList: string[]) {
    const gidlist: string[] = [];

    const obj = new Map(this.selectedFiles);
    const newlist: IStateDownFile[] = [];
    for (let j = 0; j < DowningList.length; j++) {
      const DownID = DowningList[j].DownID;
      if (downIDList.includes(DownID)) {
        gidlist.push(DowningList[j].Info.GID);
        if (obj.has(DownID)) obj.delete(DownID);
        ChangDowningTime += 1;
      } else {
        newlist.push(DowningList[j]);
      }
    }
    DowningList = newlist;
    ChangDowningTime += 1;
    this.selectedFiles = obj;

    SQL.DeleteDowns(false, downIDList).then(() => {
      StoreDown.mRefreshDowningList();
    });
    AriaStopList(gidlist);
    AriaDeleteList(gidlist);
  }
  @Mutation
  mDeleteAllDowning() {
    this.selectedFiles = new Map<string, boolean>();
    const gidlist: string[] = [];
    const downIDList: string[] = [];
    for (let j = 0; j < DowningList.length; j++) {
      gidlist.push(DowningList[j].Info.GID);
      const DownID = DowningList[j].DownID;
      downIDList.push(DownID);
    }
    DowningList.splice(0, DowningList.length);
    ChangDowningTime += 1;
    SQL.DeleteDowns(false, downIDList).then(() => {
      StoreDown.mRefreshDowningList();
    });
    AriaStopList(gidlist);
    AriaDeleteList(gidlist);
  }
  @Mutation
  mOrderDowning(downIDList: string[]) {
    const newlist: IStateDownFile[] = [];
    const lastlist: IStateDownFile[] = [];

    for (let j = 0; j < DowningList.length; j++) {
      const DownID = DowningList[j].DownID;
      let find = false;
      for (let i = 0; i < downIDList.length; i++) {
        if (downIDList[i] == DownID) {
          newlist.push(DowningList[j]);
          find = true;
          break;
        }
      }
      if (find == false) {
        lastlist.push(DowningList[j]);
      }
    }
    DowningList.splice(0, DowningList.length, ...newlist, ...lastlist);
    ChangDowningTime += 1;
    StoreDown.mRefreshDowningList();
  }
  @Mutation
  mSaveToDowned(DownID: string) {
    for (let j = 0; j < DowningList.length; j++) {
      if (DowningList[j].DownID == DownID && DowningList[j].Down.DownState === '已完成') {
        const item = DowningList[j];
        DowningList.splice(j, 1);
        SQL.DeleteDowns(false, [item.DownID]);

        item.Down.DownTime = Date.now();
        item.DownID = item.DownID + '_' + item.Down.DownTime.toString();

        DownedList.splice(0, 0, item);
        SQL.SaveDowneds([item]);

        ChangDowningTime += 1;
        ChangDownedTime += 1;
        break;
      }
    }
    if (this.selectedFiles.has(DownID)) this.selectedFiles.delete(DownID);
  }
  @Mutation
  mDeleteDowned(DownID: string) {
    const downIDList = [];
    for (let j = 0; j < DownedList.length; j++) {
      if (DownedList[j].DownID == DownID) {
        downIDList.push(DownID);
        DownedList.splice(j, 1);
        ChangDownedTime += 1;
        break; 
      }
    }
    SQL.DeleteDowns(true, downIDList).then(() => {
      StoreDown.mRefreshDownedList();
    });
  }
  @Mutation
  mDeleteAllDowned() {
    const downIDList = [];
    for (let j = 0; j < DownedList.length; j++) {
      const DownID = DownedList[j].DownID;
      downIDList.push(DownID);
    }
    DownedList.splice(0, DownedList.length);
    ChangDownedTime += 1;
    SQL.DeleteDowns(true, downIDList).then(() => {
      StoreDown.mRefreshDownedList();
    });
  }
  @Action
  aAddDownloadDir({ drive_id, file_id, savepath, issavepath }: { drive_id: string; file_id: string; savepath: string; issavepath: boolean }) {
    const userid = StoreUser.userid;
    const dir = RootDirMap.get(userid + drive_id + file_id);
    const file = Object.assign({}, dir, {
      thumbnail: '',
      width: 0,
      height: 0,
      duration: 0,
      ext: '',
      starred: false,
      sha1: '',
      icon: 'iconfolder',
      info: '',
      isWeiFa: false,
    });
    if (file) StoreDown.aAddDownload({ filelist: [file], savepath, issavepath, tip: true });
  }
  @Action
  aAddDownload({ filelist, savepath, issavepath, tip }: { filelist: IStatePanFile[]; savepath: string; issavepath: boolean; tip: boolean }) {
    const userid = StoreUser.userid;

    if (savepath.endsWith('/')) savepath = savepath.substr(0, savepath.length - 1);
    if (savepath.endsWith('\\')) savepath = savepath.substr(0, savepath.length - 1);

    const downlist: IStateDownFile[] = [];
    const dtime = Date.now();

    let cpid = ''; 
    let cpath = ''; 
    const ariaRemote = StoreSetting.ariaRemote;
    const sep = StoreSetting.ariaSavePath.indexOf('/') >= 0 ? '/' : '\\';
    for (let f = 0; f < filelist.length; f++) {
      const file = filelist[f];
      const name = ClearFileName(file.name);
      let fullpath = savepath; 
      if (issavepath) {
        if (cpath != '' && cpid == file.parent_file_id) fullpath = cpath;
        else {
          let cpath2 = savepath;
          const plist = StoreRoot.gFileDownPath(file.parent_file_id); 
          for (let p = 0; p < plist.length; p++) {
            const pname = ClearFileName(plist[p]); 
            if (path.join(cpath2, pname, name).length > 250) break; 
            cpath2 = path.join(cpath2, pname);
          }
          cpid = file.parent_file_id;
          cpath = cpath2;
          fullpath = cpath2;
        }
      }

      if (ariaRemote) {
        if (sep == '/') fullpath = fullpath.replace(/\\/g, '/');
        else fullpath = fullpath.replace(/\//g, '\\');
      }

      let sizehex = file.size.toString(16).toLowerCase();
      if (sizehex.length > 4) sizehex = sizehex.substr(0, 4);

      let downloadurl = '';
      let crc64 = '';
      if (file.info) {
        try {
          const buff = Buffer.from(file.info, 'base64');
          const info = (ProtoPanFileInfo.decode(buff) as any) || { downloadurl: '' };
          downloadurl = info.downloadurl || '';
          crc64 = info.crc64 || '';
        } catch {}
      }

      const downitem: IStateDownFile = {
        DownID: userid + '|' + file.file_id,
        Info: {
          GID: file.file_id.toLowerCase().substring(file.file_id.length - 16 + sizehex.length) + sizehex,
          userid: userid,
          DownSavePath: fullpath,
          ariaRemote: ariaRemote,
          file_id: file.file_id,
          drive_id: file.drive_id,
          name: name,
          size: file.size,
          sizestr: file.sizestr,
          isDir: file.isDir,
          icon: file.icon,
          sha1: file.sha1,
          crc64: crc64,
        },
        Down: {
          DownState: '排队中',
          DownTime: dtime + f,
          DownSize: 0,
          DownSpeed: 0,
          DownSpeedStr: '',
          DownProcess: 0,
          IsStop: false,
          IsDowning: false,
          IsCompleted: false,
          IsFailed: false,
          FailedCode: 0,
          FailedMessage: '',
          AutoTry: 0,
          DownUrl: downloadurl,
        },
      };
      if (downitem.Info.ariaRemote && downitem.Info.isDir == false) downitem.Info.icon = 'iconfont iconcloud-download';
      downlist.push(downitem);
    }

    StoreDown.mAddDownload({ downlist, tip });
  }

  @Mutation
  mAddDownload({ downlist, tip }: { downlist: IStateDownFile[]; tip: boolean }) {
    const savelist = [];
    const haslist = new Map<string, boolean>();
    for (let i = 0; i < DowningList.length; i++) {
      haslist.set(DowningList[i].DownID, true);
    }
    for (let d = 0; d < downlist.length; d++) {
      const downitem = downlist[d];
      if (haslist.has(downitem.DownID) == false) {
        Object.freeze(downitem.Info);
        savelist.push(downitem);
      }
    }
    SQL.SaveDownings(savelist);
    DowningList.push(...savelist);
    ChangDowningTime += 1;
    StoreDown.mRefreshDowningList();
    if (tip) {
      NotifySuccess('成功创建 ' + savelist.length.toString() + '个下载任务');
    }
  }
}
