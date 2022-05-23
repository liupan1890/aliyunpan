
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    readonly VITE_DEV_SERVER_HOST: string
    readonly VITE_DEV_SERVER_PORT: string
  }
}

declare interface Window {
  Electron: any
  platform: any
  WebToElectron: any
  WebToElectronCB: any
  WebSpawnSync: any
  WebExecSync: any
  WebShowOpenDialogSync: any
  WebShowSaveDialogSync: any
  WebShowItemInFolder: any
  WebPlatformSync: any
  WebClearCookies: any
  WebClearCache: any
  WebSaveTheme: any
  WebUserToken: any
  WebReload: any
  WebRelaunch: any
  WebRelaunchAria: any
  WebSetProgressBar: any
  WebSetCookies: any
  WebOpenWindow: any
  WebShutDown: any
  openDatabase: any
  loginfn: any
  postdataFunc: any
  Prism: any
  winmain: number
  winworker: number
  WinMsg: any
  WinMsgToMain: any
  WinMsgToUI: any
  getDvaApp: any
  dark: boolean
  test: any
}
