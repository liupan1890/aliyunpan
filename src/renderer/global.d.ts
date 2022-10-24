export {}
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    Go: any
    require: any
    Electron: any
    openDatabase: any
    WebRelaunchAria: any
    platform: string
    WinMsg: any
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
    WebExecSync: any
    WebPlatformSync: any
    UploadPort: any
    DownloadPort: any
    MainPort: any
    WinMsgToUpload: any
    WinMsgToDownload: any
    WinMsgToMain: any
    IsMainPage: boolean
    WebSetProxy: any
    speedLimte: number
  }
}
