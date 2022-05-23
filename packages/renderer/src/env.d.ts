/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare type Drive = 'pan' | 'pic' | 'safe'
declare type LogLeve = 'secondary' | 'success' | 'warning' | 'danger'
declare module 'dom-to-image'
declare module 'jschardet'
declare function pinyinlite(text: string, config: any): any
declare function videojs(ref: any, options: any, cb: any): any

declare module 'aria2/index.js'
declare module '@arco-design/web-vue/lib/modal/modal'
declare module 'video.js'
declare module 'dlnacasts2'
