/* eslint-disable no-unused-vars */
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
  WinMsg: any
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
  WebUserToken: any
  WebSaveTheme: any
  WebReload: any
  WebRelaunch: any
  WebSetProgressBar: any
  WebSetCookies: any
  WebOpenWindow: any
  WebOpenUrl: any
  WebShutDown: any
  WebSetProxy: any
}
