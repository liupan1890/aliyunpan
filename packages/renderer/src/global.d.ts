export {}

declare global {
  interface Window {
    require:any,
    Electron: any
    openDatabase: any
    WebRelaunchAria: any
    platform: string
    WinMsg: any
    WinMsgToMain: any
    WinMsgToUI: any
    postdataFunc: any
    Prism: any
    WebUserToken: any
    WebToElectron: any
    WebClearCache: any
    WebRelaunch: any
    WebClearCookies: any
    WebShutDown: any
    WebOpenWindow: any
    WebOpenUrl: any
    WebShowOpenDialogSync: any
    WebExecSync:any
  }
}
