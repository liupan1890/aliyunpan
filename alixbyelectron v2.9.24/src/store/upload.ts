import { format } from 'quasar';
import { NotifySuccess } from 'src/aliapi/notify';
import { VuexModule, Module, Action, Mutation } from 'vuex-module-decorators';
import { SQL, StoreSetting, StoreUpload } from '.';
import { IAriaDownProgress, IStateUploadFile } from './models';
interface IStateUpload {
  selectedFiles: Map<string, boolean>; 
  selectedFileLast: string; 
  changUploadingTime: object;
  changUploadedTime: object;
}
let SaveTime = 0; 
let ChangUploadingTime = 0;
let ChangUploadedTime = 0;
export let UploadingList: IStateUploadFile[] = [];
export let UploadedList: IStateUploadFile[] = [];

@Module({ namespaced: true, name: 'Upload', stateFactory: true })
export default class Upload extends VuexModule implements IStateUpload {
  public changUploadingTime = {};
  public changUploadedTime = {};
  public selectedFileLast = '';
  public selectedFiles = new Map<string, boolean>();

  get gSelectedUploadingCount(): number {
    return this.selectedFiles.size;
  }
  get gUploadingCount() {
    return () => UploadingList.length;
  }
  get gUploadedCount() {
    return () => UploadedList.length;
  }
  get gSelectedUploadingKey(): string[] {
    return [...this.selectedFiles.keys()];
  }
  get gUploadingList() {
    return () => UploadingList;
  }
  get gUploadedList() {
    return () => UploadedList;
  }

  @Action
  async aLoadFromDB() {
    UploadingList = await SQL.GetAllUploading(); 
    UploadedList = await SQL.GetAllUploaded();

    for (let i = 0; i < UploadingList.length; i++) {
      const downing = UploadingList[i];
      Object.freeze(downing.Info);
    }
    for (let i = 0; i < UploadedList.length; i++) {
      Object.freeze(UploadedList[i]);
    }
    ChangUploadingTime = 1;
    ChangUploadedTime = 1;
    StoreUpload.mRefreshUploadingList();
    StoreUpload.mRefreshUploadedList();
  }
  @Mutation
  mRefreshUploadingList() {
    if (ChangUploadingTime == 0) return;
    this.changUploadingTime = { ts: Date.now() };
    ChangUploadingTime = 0;
  }

  @Mutation
  mRefreshUploadedList() {
    if (ChangUploadedTime == 0) return;
    this.changUploadedTime = { ts: Date.now() };
    ChangUploadedTime = 0;
  }

  @Mutation 
  mChangSelectedFile({ UploadID, ctrl, shift }: { UploadID: string; ctrl: boolean; shift: boolean }) {
    if (UploadID === 'all') {
      this.selectedFileLast = '';
      const s = new Map<string, boolean>();
      if (this.selectedFiles.size != UploadingList.length) {
        
        const children = UploadingList;
        for (let i = 0; i < children.length; i++) {
          s.set(children[i].UploadID, true);
        }
      }
      this.selectedFiles = s;
    } else {
      if (shift) {
        
        if (this.selectedFileLast == '' || this.selectedFileLast == UploadID) {
          ctrl = true;
        } else {
          
          const s = new Map(this.selectedFiles);
          let a = -1;
          let b = -1;
          for (let i = 0; i < UploadingList.length; i++) {
            if (UploadingList[i].UploadID == UploadID) a = i;
            if (UploadingList[i].UploadID == this.selectedFileLast) b = i;
            if (a > 0 && b > 0) break;
          }
          if (a < 0 || b < 0 || a == b) {
            ctrl = true;
          } else {
            if (a > b) [a, b] = [b, a]; 

            for (let n = a; n <= b; n++) {
              s.set(UploadingList[n].UploadID, true);
            }
            this.selectedFileLast = UploadID;
            this.selectedFiles = s;
            return;
          }
        }
      }

      if (ctrl) {
        
        if (this.selectedFiles.has(UploadID)) this.selectedFiles.delete(UploadID);
        else this.selectedFiles.set(UploadID, true);
        this.selectedFileLast = UploadID;
        return;
      }
      

      if (UploadID == '' || this.selectedFiles.has(UploadID)) this.selectedFiles = new Map<string, boolean>();
      else this.selectedFiles = new Map<string, boolean>([[UploadID, true]]);

      this.selectedFileLast = UploadID;
    }
  }

  @Mutation
  mStartUploading(uploadIDList: string[]) {
    for (let i = 0; i < uploadIDList.length; i++) {
      const UploadID = uploadIDList[i];
      for (let j = 0; j < UploadingList.length; j++) {
        if (UploadingList[j].UploadID == UploadID) {
          const down = UploadingList[j].Upload;
          if (down.IsDowning || down.IsCompleted) continue;

         
          down.IsStop = false;
          down.DownState = '排队中';
          down.DownSpeed = 0;
          down.DownSpeedStr = '';
          down.IsFailed = false;
          down.FailedCode = 0;
          down.FailedMessage = '';
          down.AutoTry = 0;
          ChangUploadingTime++;

          break;
        }
      }
    }
  }
  @Mutation
  mStartAllUploading() {
    for (let j = 0; j < UploadingList.length; j++) {
      const down = UploadingList[j].Upload;
      if (down.IsDowning || down.IsCompleted) continue;

      
      down.IsStop = false;
      down.DownState = '排队中';
      down.DownSpeed = 0;
      down.DownSpeedStr = '';
      down.IsFailed = false;
      down.FailedCode = 0;
      down.FailedMessage = '';
      down.AutoTry = 0;
      ChangUploadingTime++;
    }
  }
  @Mutation
  mStopUploading(uploadIDList: string[]) {
    for (let i = 0; i < uploadIDList.length; i++) {
      const UploadID = uploadIDList[i];
      for (let j = 0; j < UploadingList.length; j++) {
        if (UploadingList[j].UploadID == UploadID) {
          const down = UploadingList[j].Upload;
          if (down.IsCompleted) continue; 

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
          ChangUploadingTime++;
          break;
        }
      }
    }
    if (window.WinMsgToUI) window.WinMsgToUI({ cmd: 'UploadCmd', uploadCmd: 'stop', uploadAll: false, uploadIDList });
    StoreUpload.mRefreshUploadingList();
  }
  @Mutation
  mStopAllUploading() {
    const uploadIDList: string[] = [];
    for (let j = 0; j < UploadingList.length; j++) {
      const down = UploadingList[j].Upload;
      if (down.IsCompleted) continue; 

      
      uploadIDList.push(UploadingList[j].UploadID);
      down.IsDowning = false;
      down.IsStop = true;
      down.DownState = '已暂停';
      down.DownSpeed = 0;
      down.DownSpeedStr = '';
      down.IsFailed = false;
      down.FailedCode = 0;
      down.FailedMessage = '';
      down.AutoTry = 0;
      ChangUploadingTime++;
    }
    if (window.WinMsgToUI) window.WinMsgToUI({ cmd: 'UploadCmd', uploadCmd: 'stop', uploadAll: true, uploadIDList });
    StoreUpload.mRefreshUploadingList();
  }
  @Mutation
  mDeleteUploading(uploadIDList: string[]) {

    const obj = new Map(this.selectedFiles);
    const newlist: IStateUploadFile[] = [];
    for (let j = 0; j < UploadingList.length; j++) {
      const UploadID = UploadingList[j].UploadID;
      if (uploadIDList.includes(UploadID)) {
        if (obj.has(UploadID)) obj.delete(UploadID);
        ChangUploadingTime++;
      } else {
        newlist.push(UploadingList[j]);
      }
    }
    UploadingList = newlist;
    ChangUploadingTime++;
    this.selectedFiles = obj;
    SQL.DeleteUploads(false, uploadIDList).then(() => {
      StoreUpload.mRefreshUploadingList();
    });
    if (window.WinMsgToUI) window.WinMsgToUI({ cmd: 'UploadCmd', uploadCmd: 'delete', uploadAll: false, uploadIDList });
  }
  @Mutation
  mDeleteAllUploading() {
    this.selectedFiles = new Map<string, boolean>();
    const uploadIDList: string[] = [];
    for (let j = 0; j < UploadingList.length; j++) {
      const UploadID = UploadingList[j].UploadID;
      uploadIDList.push(UploadID);
    }
    UploadingList.splice(0, UploadingList.length);
    ChangUploadingTime++;
    SQL.DeleteUploads(false, uploadIDList).then(() => {
      StoreUpload.mRefreshUploadingList();
    });
    if (window.WinMsgToUI) window.WinMsgToUI({ cmd: 'UploadCmd', uploadCmd: 'delete', uploadAll: true, uploadIDList });
  }
  @Mutation
  mOrderUploading(uploadIDList: string[]) {
    const newlist: IStateUploadFile[] = [];
    const lastlist: IStateUploadFile[] = [];

    for (let j = 0; j < UploadingList.length; j++) {
      const UploadID = UploadingList[j].UploadID;
      let find = false;
      for (let i = 0; i < uploadIDList.length; i++) {
        if (uploadIDList[i] == UploadID) {
          newlist.push(UploadingList[j]);
          find = true;
          break;
        }
      }
      if (find == false) {
        lastlist.push(UploadingList[j]);
      }
    }
    UploadingList.splice(0, UploadingList.length, ...newlist, ...lastlist);
    ChangUploadingTime++;
    StoreUpload.mRefreshUploadingList();
  }
  @Mutation
  mSaveToUploaded(UploadID: string) {
    for (let j = 0; j < UploadingList.length; j++) {
      if (UploadingList[j].UploadID == UploadID && UploadingList[j].Upload.DownState === '已完成') {
        const item = UploadingList[j];

        UploadingList.splice(j, 1);
        SQL.DeleteUploads(false, [item.UploadID]);

        item.Upload.DownTime = Date.now();
        item.UploadID = item.UploadID + '_' + item.Upload.DownTime.toString();
        UploadedList.splice(0, 0, item);
        SQL.SaveUploadeds([item]);

        ChangUploadingTime++;
        ChangUploadedTime++;
        break; 
      }
    }
    if (this.selectedFiles.has(UploadID)) this.selectedFiles.delete(UploadID);
  }
  @Mutation
  mSaveToUploading({ UploadID, file_id, upload_id }: { UploadID: string; file_id: string; upload_id: string }) {
    for (let j = 0; j < UploadingList.length; j++) {
      if (UploadingList[j].UploadID == UploadID) {
        UploadingList[j].Upload.file_id = file_id;
        UploadingList[j].Upload.upload_id = upload_id;
        SQL.SaveUploadings([UploadingList[j]]);
        break;
      }
    }
  }
  @Mutation
  mDeleteUploaded(UploadID: string) {
    const uploadIDList = [];
    for (let j = 0; j < UploadedList.length; j++) {
      if (UploadedList[j].UploadID == UploadID) {
        uploadIDList.push(UploadID);
        UploadedList.splice(j, 1);
        ChangUploadedTime++;
        break; 
      }
    }
    SQL.DeleteUploads(true, uploadIDList).then(() => {
      StoreUpload.mRefreshUploadedList();
    });
  }
  @Mutation
  mDeleteAllUploaded() {
    const uploadIDList = [];
    for (let j = 0; j < UploadedList.length; j++) {
      const UploadID = UploadedList[j].UploadID;
      uploadIDList.push(UploadID);
    }
    UploadedList.splice(0, UploadedList.length);
    ChangUploadedTime++;
    SQL.DeleteUploads(true, uploadIDList).then(() => {
      StoreUpload.mRefreshUploadedList();
    });
  }

  @Mutation
  mAddUploading({ uploadinglist, tip }: { uploadinglist: IStateUploadFile[]; tip: boolean }) {
    const savelist = [];
    const haslist = new Map<string, boolean>();
    for (let i = 0; i < UploadingList.length; i++) {
      haslist.set(UploadingList[i].UploadID, true);
    }
    for (let d = 0; d < uploadinglist.length; d++) {
      const downitem = uploadinglist[d];
      if (haslist.has(downitem.UploadID) == false) {
        Object.freeze(downitem.Info);
        savelist.push(downitem);
      }
    }
    SQL.SaveUploadings(savelist);
    UploadingList.push(...savelist);
    ChangUploadingTime++;
    StoreUpload.mRefreshUploadingList();
    if (tip) {
      NotifySuccess('成功创建 ' + savelist.length.toString() + '个上传任务');
    }
  }

  @Action
  aUploadEvent(list: IAriaDownProgress[]) {
    if (list == undefined) list = [];
    StoreUpload.mUploadEvent(list); 

    let downingCount = 0;
    let downingCountMC = 0;

    for (let j = 0; j < UploadingList.length; j++) {
      if (UploadingList[j].Upload.IsDowning) {
        if (UploadingList[j].Info.isMiaoChuan) downingCountMC++;
        else downingCount++;
      }
      if (UploadingList[j].Upload.IsCompleted && UploadingList[j].Upload.DownState === '已完成') {

        StoreUpload.mSaveToUploaded(UploadingList[j].UploadID);
        j--;
      }
    }
    const time = Date.now() - 60 * 1000; 
    const addlist: IStateUploadFile[] = [];
    const downFileMax = StoreSetting.downFileMax;
    for (let j = 0; j < UploadingList.length; j++) {
      if (downingCount >= downFileMax) break; 
      const down = UploadingList[j].Upload;
      if (down.IsCompleted == false && down.IsDowning == false && down.IsStop == false) {
        if ((down.IsFailed == false || time > down.AutoTry) && UploadingList[j].Info.isMiaoChuan == false) {

          downingCount++;
          ChangUploadingTime++;
          StoreUpload.mUpdateUploadingState({ UploadID: UploadingList[j].UploadID, IsDowning: true, DownSpeedStr: '', DownState: '解析中', DownTime: Date.now(), FailedCode: 0, FailedMessage: '' });
          addlist.push(UploadingList[j]);
        }
      }
    }
    const downFileMaxMC = 40 - downingCount;
    for (let j = 0; j < UploadingList.length; j++) {
      if (downingCountMC >= downFileMaxMC) break; 
      const down = UploadingList[j].Upload;
      if (down.IsCompleted == false && down.IsDowning == false && down.IsStop == false) {
        if ((down.IsFailed == false || time > down.AutoTry) && UploadingList[j].Info.isMiaoChuan) {
          downingCountMC++;
          ChangUploadingTime++;
          StoreUpload.mUpdateUploadingState({ UploadID: UploadingList[j].UploadID, IsDowning: true, DownSpeedStr: '', DownState: '解析中', DownTime: Date.now(), FailedCode: 0, FailedMessage: '' });
          addlist.push(UploadingList[j]);
        }
      }
    }
    if (addlist.length > 0 && window.WinMsgToUI) window.WinMsgToUI({ cmd: 'UploadAdd', addlist });
    StoreUpload.mRefreshUploadingList();
    StoreUpload.mRefreshUploadedList();
  }
  @Mutation
  mUpdateUploadingState(data: any) {
    const UploadID = data.UploadID;
    for (let j = 0; j < UploadingList.length; j++) {
      if (UploadingList[j].UploadID == UploadID) {
        UploadingList[j].Upload = { ...UploadingList[j].Upload, ...data };
        break;
      }
    }
    ChangUploadingTime++;
  }
  @Mutation
  mUploadEvent(list: IAriaDownProgress[]) {
    if (list == undefined) list = [];
    const dellist: string[] = [];

    for (let n = 0; n < UploadingList.length; n++) {
      if (UploadingList[n].Upload.DownSpeedStr != '') {
        const UploadID = UploadingList[n].UploadID;
        let isfind = false;
        for (let m = 0; m < list.length; m++) {
          if (list[m].gid == UploadID && list[m].status == 'active') {
            isfind = true;
            break;
          }
        }
        if (isfind == false) {

          UploadingList[n].Upload.DownState = '';
          UploadingList[n].Upload.DownSpeed = 0;
          UploadingList[n].Upload.DownSpeedStr = '';
          ChangUploadingTime++;
        }
      }
    }

    const savelist: IStateUploadFile[] = [];
    for (let i = 0; i < list.length; i++) {
      try {
        const UploadID = list[i].gid;

        const iscomplete = list[i].status === 'complete';
        const isdowning = iscomplete || list[i].status === 'active';
        const isstop = list[i].status === 'paused' || list[i].status === 'removed';
        const iserror = iscomplete == false && list[i].status === 'error';

        for (let j = 0; j < UploadingList.length; j++) {
          if (UploadingList[j].UploadID == UploadID) {

            ChangUploadingTime++;
            const downitem = UploadingList[j];
            const down = downitem.Upload;
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
              down.FailedMessage = list[i].errorMessage;
            }

            if (iscomplete) {
              down.DownSize = downitem.Info.size;
              down.DownSpeed = 0;
              down.DownSpeedStr = '';
              down.DownProcess = 100;
              down.FailedCode = 0;
              down.FailedMessage = '';
              down.DownState = '已完成';
              down.AutoTry = 0;


            } else if (isstop) {
              down.DownState = '已暂停';
              down.DownSpeed = 0;
              down.DownSpeedStr = '';
              down.FailedCode = 0;
              down.FailedMessage = '';
            } else if (iserror) {
              down.DownState = '出错稍后自动重试';
              down.DownSpeed = 0;
              down.DownSpeedStr = '';
              down.AutoTry = Date.now();
              if (down.FailedMessage == '') down.FailedMessage = '上传失败';
            } else if (isdowning) {
              down.FailedMessage = list[i].errorMessage;

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
              //console.log('update', UploadingList[j]);
            }
            if (isstop || iserror || iscomplete) {

              dellist.push(UploadID);
            }
            ChangUploadingTime++;
            break;
          }
        }
      } catch {}
    }
    if (savelist.length > 0) SQL.SaveUploadings(savelist); 
    if (dellist.length > 0) {
      if (window.WinMsgToUI) window.WinMsgToUI({ cmd: 'UploadCmd', uploadCmd: 'delete', uploadAll: false, uploadIDList: dellist });
    }

    if (SaveTime > 10) SaveTime = 0;
    else SaveTime++;
  }
}
