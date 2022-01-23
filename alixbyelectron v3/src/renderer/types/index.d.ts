declare module '*.less'
declare module '*.css'
declare module '*.less'
declare module '*.png'
declare module '*.svg' {
  export function ReactComponent(props: React.SVGProps<SVGSVGElement>): React.ReactElement
  const url: string
  export default url
}
declare interface Window {
  platform: any
  WebToElectron: any
  WebToElectronCB: any
  WebSpawnSync: any
  WebExecSync:any
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
  WebRelaunchAria:any
  WebSetProgressBar:any
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
  dark:boolean
  test:any
}

declare module 'react-use-modal'
declare module 'prism-react-renderer/prism'
declare module 'aria2'
declare module 'react-virtualized'
declare module 'underscore'
declare module 'jschardet'
declare module 'dom-to-image'
declare module 'sql.js/dist/sql-wasm.js'

declare type Drive = 'pan' | 'pic' | 'safe'
declare type LogLeve = 'secondary' | 'success' | 'warning' | 'danger'