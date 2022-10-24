/* eslint-disable no-unused-vars */
/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{ tabindex: string; id: string }, {}, any>
  export default component
}

declare enum TaskState {
  Success, // 已成功
  Error, // 出错停止
  Running, // 上传中
  Stoped, // 已暂停
  Waiting, // 排队中
  Autotry // 稍后自动重试
}

declare type CheckNameMode =
  | 'overwrite' // overwrite (直接覆盖，以后多版本有用)
  | 'auto_rename' // auto_rename (自动换一个随机名称)
  | 'refuse' // refuse (不会创建，告诉你已经存在)
  | 'ignore' // ignore (会创建重名的)

declare type FileType =
  | 'file' // 文件
  | 'folder' // 文件夹(目录)

declare type UploadStates =
  | 'waiting' // 排队中， 等待上传
  | 'start' // 开始
  | 'computing_hash' // 计算hash，预秒传，秒传
  | 'created' // 创建成功
  | 'running' // 上传中
  | 'stopped' // 暂停
  | 'complete' // 上传完成
  | 'checking' // 校验中, 检查 crc64 是否一致
  | 'success' // 上传成功
  | 'rapid_success' // 秒传成功
  | 'error' // 上传失败
  | 'cancelled' // 已取消

// DownloadState 没有 computing_hash & rapid_success
declare type DownloadStates =
  | 'waiting' // 排队中， 等待下载
  | 'start' // 开始
  | 'created' // 创建成功
  | 'running' // 下载中
  | 'stopped' // 暂停
  | 'complete' // 下载完成
  | 'checking' // 校验中, 检查 crc64 是否一致
  | 'success' // 下载成功
  | 'error' // 下载失败
  | 'cancelled' // 已取消

declare module 'Go'
declare module 'dom-to-image'
declare module 'jschardet'
declare function pinyinlite(text: string, config: any): any
declare function videojs(ref: any, options: any, cb: any): any
