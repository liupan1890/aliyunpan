// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import { ComponentOptions } from 'vue';
  const component: ComponentOptions;
  export default component;
}

declare interface Window {
  platform: string;
  electron: any;
  WebToElectron: any;
  WebToElectronCB: any;
  WebShowOpenDialogSync: any;
  WebShowSaveDialogSync: any;
  WebShowItemInFolder: any;
  WebSpawnSync: any;
  WebPlatformSync: any;
  electronworker: boolean;
  WebClearCookies: any;
  WebSetCookies: any;
  WinMsg: any;
  WinMsgToMain: any;
  WinMsgToUI: any;
  WinMsgToDown: any;
  WinMsgToUpload: any;
  WebFileHash: any;
  postdataFunc: any;
  $Store: any;
  $Sqlite: any;
  $q: any;
  openDatabase: any;
}

declare module 'aria2';
declare module 'encoding';
declare module 'sag-ztree-vue';

declare module 'websql';
declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}

declare module 'vue-virtual-scroller';
