import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators';

interface IStateSetting {
  showSetting: boolean;
  showSavePath: boolean;
  downSavePath: string; 
  downSavePathEveryTime: boolean; 
  downFinishCheck: boolean; 
  downFinishCommand: boolean; 
  downGlobalSpeed: number;
  downFileMax: number; 
  downThreadMax: number; 
  uiTheme: string; 
  uiImageMode: string; 
  uiVideoMode: string;
  uiFileOrder: string;
  uiFileOrderDuli: string; 
  uiFileMode: string; 
  uiFolderSize: boolean; 
  uiAutoColorVideo: boolean; 
  uiXBTNumber: number; 
  uiTimeFolderFormate: string;
  uiDefaultUser: string; 
  ariaRemote: boolean; 
  ariaUrl: string; 
  ariaPwd: string; 
  ariaSavePath: string; 
}

import { DB } from './index';
function setTheme(color: string) {
  if (color == 'dark' && window.$q) window.$q.dark.set(true);
  else if (window.$q) window.$q.dark.set(false);
}


@Module({ namespaced: true, name: 'Setting', stateFactory: true })
export default class Setting extends VuexModule implements IStateSetting {
  public showSetting = false;
  public showSavePath = false;
  public downSavePath = '';
  public downSavePathEveryTime = false;
  public downFinishCheck = false;
  public downFinishCommand = false;
  public downGlobalSpeed = 0;
  public downFileMax = 5;
  public downThreadMax = 8;
  public uiTheme = 'red';
  public uiImageMode = 'fill';
  public uiVideoMode = 'mpv';
  public uiFileOrder = 'name asc';
  public uiFileOrderDuli = '';
  public uiFolderOrder = false;
  public uiFileMode = 'list';
  public uiFolderSize = true;
  public uiAutoColorVideo = true;
  public uiDefaultUser = '';
  public uiXBTNumber = 32;
  public uiTimeFolderFormate = 'yyyy-MM-dd HH:mm:ss';

  public ariaRemote = false;
  public ariaUrl = '';
  public ariaPwd = '';
  public ariaSavePath = '';

  @Mutation
  mShowSetting(showSetting: boolean, showSavePath: boolean) {
    this.showSetting = showSetting;
    this.showSavePath = showSavePath;
  }
  @Mutation
  mSaveDownSavePath(val: string) {
    this.downSavePath = val;
    DB.saveValueString('downSavePath', val);
  }
  @Mutation
  mSaveDownFileMax(val: number) {
    if (val > 30) val = 30;
    this.downFileMax = val;
    DB.saveValueNumber('downFileMax', val);
  }
  @Mutation
  mSaveDownThreadMax(val: number) {
    this.downThreadMax = val;
    DB.saveValueNumber('downThreadMax', val);
  }
  @Mutation
  mSaveDownSavePathEveryTime(val: boolean) {
    this.downSavePathEveryTime = val;
    DB.saveValueBool('downSavePathEveryTime', val);
  }
  @Mutation
  mSaveDownFinishCheck(val: boolean) {
    this.downFinishCheck = val;
    DB.saveValueBool('downFinishCheck', val);
  }
  @Mutation
  mSaveDownFinishCommand(val: boolean) {
    this.downFinishCommand = val;
    DB.saveValueBool('downFinishCommand', val);
  }
  @Mutation
  mSaveDownGlobalSpeed(val2: number | string) {
    let val = 0;
    if (typeof val2 == 'string') {
      val = parseInt(val2);
    } else {
      val = val2;
    }
    if (val < 0) val = 0;
    if (val > 999) val = 999;
    this.downGlobalSpeed = val;
    DB.saveValueNumber('downGlobalSpeed', val);
  }
  @Mutation
  mSaveUiTheme(val: string) {
    this.uiTheme = val;
    setTheme(this.uiTheme);
    DB.saveValueString('uiTheme', val);
  }
  @Mutation
  mSaveUiImageMode(val: string) {
    this.uiImageMode = val;
    DB.saveValueString('uiImageMode', val);
  }
  @Mutation
  mSaveUiVideoMode(val: string) {
    this.uiVideoMode = val;
    DB.saveValueString('uiVideoMode', val);
  }
  @Mutation
  mSaveUiFileOrder(val: string) {
    this.uiFileOrder = val;
    DB.saveValueString('uiFileOrder', val);
  }
  @Mutation
  mSaveUiFileOrderDuli(val: string) {
    this.uiFileOrderDuli = val;
    DB.saveValueString('uiFileOrderDuli', val);
  }
  @Mutation
  mSaveUiFileMode(val: string) {
    this.uiFileMode = val;
    DB.saveValueString('uiFileMode', val);
  }
  @Mutation
  mSaveUiFolderSize(val: boolean) {
    this.uiFolderSize = val;
    DB.saveValueBool('uiFolderSize', val);
  }
  @Mutation
  mSaveUiFolderOrder(val: boolean) {
    this.uiFolderOrder = val;
    DB.saveValueBool('uiFolderOrder', val);
  }

  @Mutation
  mSaveUiAutoColorVideo(val: boolean) {
    this.uiAutoColorVideo = val;
    DB.saveValueBool('uiAutoColorVideo', val);
  }
  @Mutation
  mSaveUiXBTNumber(val: number) {
    if (val < 16) val = 16;
    if (val > 96) val = 96;
    this.uiXBTNumber = val;
    DB.saveValueNumber('uiXBTNumber', val);
  }
  @Mutation
  mSaveUiTimeFolderFormate(val: string) {
    this.uiTimeFolderFormate = val;
    DB.saveValueString('uiTimeFolderFormate', val);
  }
  @Mutation
  mSaveUiDefaultUser(val: string) {
    this.uiDefaultUser = val;
    DB.saveValueString('uiDefaultUser', val);
  }
  @Mutation
  mSaveAriaRemote(val: boolean) {
    this.ariaRemote = val;
    DB.saveValueBool('ariaRemote', val);
  }
  @Mutation
  mSaveAriaUrl(val: string) {
    this.ariaUrl = val;
    DB.saveValueString('ariaUrl', val);
  }
  @Mutation
  mSaveAriaPwd(val: string) {
    this.ariaPwd = val;
    DB.saveValueString('ariaPwd', val);
  }
  @Mutation
  mSaveAriaSavePath(val: string) {
    this.ariaSavePath = val;
    DB.saveValueString('ariaSavePath', val);
  }

  @Action({ commit: 'mLoadFromDB' })
  async aLoadFromDB() {
    return {
      downSavePath: await DB.getValueString('downSavePath'),
      downSavePathEveryTime: await DB.getValueBool('downSavePathEveryTime'),
      downFinishCheck: await DB.getValueBool('downFinishCheck'),
      downFinishCommand: await DB.getValueBool('downFinishCommand'),
      downGlobalSpeed: await DB.getValueNumber('downGlobalSpeed'),
      downFileMax: await DB.getValueNumber('downFileMax'),
      downThreadMax: await DB.getValueNumber('downThreadMax'),
      uiTheme: await DB.getValueString('uiTheme'),
      uiImageMode: await DB.getValueString('uiImageMode'),
      uiVideoMode: await DB.getValueString('uiVideoMode'),
      uiFileOrder: await DB.getValueString('uiFileOrder'),
      uiFileOrderDuli: await DB.getValueString('uiFileOrderDuli'),
      uiFolderOrder: await DB.getValueString('uiFolderOrder'),
      uiFileMode: await DB.getValueString('uiFileMode'),
      uiFolderSize: await DB.getValueBool('uiFolderSize'),
      uiAutoColorVideo: await DB.getValueBool('uiAutoColorVideo'),
      uiXBTNumber: await DB.getValueNumber('uiXBTNumber'),
      uiTimeFolderFormate: await DB.getValueString('uiTimeFolderFormate'),
      uiDefaultUser: await DB.getValueString('uiDefaultUser'),
      ariaRemote: await DB.getValueBool('ariaRemote'),
      ariaUrl: await DB.getValueString('ariaUrl'),
      ariaPwd: await DB.getValueString('ariaPwd'),
      ariaSavePath: await DB.getValueString('ariaSavePath'),
    };
  }
  @Mutation
  mLoadFromDB(setting: any) {
    this.downSavePath = setting.downSavePath || '';
    this.downSavePathEveryTime = setting.downSavePathEveryTime || false;
    this.downFinishCheck = setting.downFinishCheck || false;
    this.downFinishCommand = setting.downFinishCommand || false;
    this.downGlobalSpeed = setting.downGlobalSpeed || 0;

    if (setting.downFileMax == 0) this.downFileMax = 5;
    else this.downFileMax = setting.downFileMax;
    if (this.downFileMax > 30) this.downFileMax = 30;

    if (setting.downThreadMax == 0) this.downThreadMax = 4;
    else this.downThreadMax = setting.downThreadMax;

    if (setting.uiTheme == '') this.uiTheme = 'red';
    else this.uiTheme = setting.uiTheme;
    setTheme(this.uiTheme);
    this.uiImageMode = setting.uiImageMode === 'width' ? 'width' : 'fill'; 
    this.uiVideoMode = setting.uiVideoMode === 'online' ? 'online' : 'mpv'; 
    this.uiFileOrder = setting.uiFileOrder === '' ? 'name asc' : setting.uiFileOrder;
    this.uiFileOrderDuli = setting.uiFileOrderDuli; 
    this.uiFolderSize = setting.uiFolderSize || true;
    this.uiFolderOrder = setting.uiFolderOrder || false;
    this.uiFileMode = setting.uiFileMode === '' ? 'list' : setting.uiFileMode; 
    this.uiAutoColorVideo = setting.uiAutoColorVideo;
    this.uiXBTNumber = setting.uiXBTNumber;
    this.uiTimeFolderFormate = setting.uiTimeFolderFormate || 'yyyy-MM-dd HH:mm:ss';
    this.uiDefaultUser = setting.uiDefaultUser || '';

    this.ariaRemote = setting.ariaRemote || false;
    this.ariaUrl = setting.ariaUrl || '';
    this.ariaPwd = setting.ariaPwd || '';
    this.ariaSavePath = setting.ariaSavePath || '';
  }
}
