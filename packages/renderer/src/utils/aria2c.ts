import AliFile from '@/aliapi/file'
import AliDirFileList, { IAliFileResp } from '@/aliapi/dirfilelist'

import axios from 'axios'
import DownDAL, { IAriaDownProgress, IStateDownFile } from '@/down/downdal'
import message from './message'
import UserDAL from '@/user/userdal'
import { useSettingStore } from '@/store'
import DebugLog from './debuglog'
import Config from './config'
import AliTrash from '@/aliapi/trash'

const path = window.require('path')
const fspromises = window.require('fs/promises')
const fs = window.require('fs')

const localpwd = 'S4znWTaZYQi3cpRNb'


let Aria2cChangeing: boolean = false
let Aria2EngineLocal: any | undefined = undefined
let Aria2EngineRemote: any | undefined = undefined

let IsAria2cOnlineLocal: boolean = false

let Aria2cLocalRelanchTime = 0

let IsAria2cOnlineRemote: boolean = false

let Aria2cRemoteRetryTime = 0

function GetAria() {
  return undefined
}

function SetAriaOnline(isOnline: boolean, ariaState: string = '') {}

function CloseRemote() {}


export async function AriaTest(https: boolean, host: string, port: number, secret: string) {
  return false
}
function Sleep(msTime: number) {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          success: true,
          time: msTime
        }),
      msTime
    )
  )
}


export async function AriaChangeToRemote() {
  return undefined
}


export async function AriaChangeToLocal() {
  return true
}


export async function AriaGlobalSpeed() {}

export async function AriaConnect() {}


export async function AriaGetDowningList() {}


export async function AriaDeleteList(list: string[]) {}


export async function AriaStopList(list: string[]) {}


export function AriaShoutDown() {}


export async function AriaAddUrl(file: IStateDownFile): Promise<string> {
  return Promise.resolve('创建Aria任务失败1')
}


export function AriaHashFile(downitem: IStateDownFile): { DownID: string; Check: boolean } {
  return { DownID: '', Check: false }
}


export function FormateAriaError(code: string, message: string): string {
  switch (code) {
    case '0':
      return ''
    case '1':
      return 'aria2c未知错误'
    case '2':
      return 'aria2c网络超时'
    case '3':
      return 'aria2c网络文件404'
    case '4':
      return 'aria2c网络文件404'
    case '5':
      return 'aria2c下载缓慢自动退出'
    case '6':
      return 'aria2c发生网络中断'
    case '7':
      return 'aria2c被强制退出错误'
    case '8':
      return 'aria2c服务器不支持断点续传'
    case '9':
      return 'aria2c本地硬盘空间不足'
    case '10':
      return 'aria2c分片大小更改'
    case '11':
      return 'aria2c重复任务'
    case '12':
      return 'aria2c重复BT任务'
    case '13':
      return 'aria2c文件已存在且不能覆盖'
    case '14':
      return 'aria2c文件重命名失败'
    case '15':
      return 'aria2c打开文件失败'
    case '16':
      return 'aria2c创建文件时失败'
    case '17':
      return 'aria2c文件写入失败'
    case '18':
      return 'aria2c创建文件夹失败'
    case '19':
      return 'aria2cDNS解析失败'
    case '20':
      return 'aria2c解析磁力失败'
    case '21':
      return 'aria2cFTP不支持的命令'
    case '22':
      if (message.includes('403')) return '服务器拒绝访问403'
      if (message.includes('503')) return '服务器返回错误503'
      return message
    case '23':
      return 'aria2cHTTP重定向失败'
    case '24':
      return 'aria2cHTTP认证失败'
    case '25':
      return 'aria2c格式化种子失败'
    case '26':
      return 'aria2c读取种子信息失败'
    case '27':
      return 'aria2c磁力链接错误'
    case '28':
      return 'aria2c提供了错误的参数'
    case '29':
      return 'aria2c服务器超载暂时无法处理请求'
    case '30':
      return 'aria2cRPC传输参数错误'
    case '31':
      return 'aria2c多余的响应数据'
    case '32':
      return 'aria2c文件sha1校验失败'
    default:
      return message
  }
}


export function ClearFileName(filename: string): string {
  if (!filename) return ''
  /**
   * window 文件名不能含有 < > : " / \ | ? *  不能空格开头结尾 不能以点结尾
   * mac 文件名不能以.开头
   * linux 不能有 /
   *
   * js 可无脑转义元字符: ^ $ . * + ? | \ / ( ) [ ] { } = ! : - ,
   * */
  filename = filename.replace(/[<>\:"\/\\\|\?\*]+/g, '')
  filename = filename.replace(/[\f\n\r\t\v]/g, '')
  while (filename.endsWith(' ') || filename.endsWith('.')) filename = filename.substring(0, filename.length - 1)
  while (filename.startsWith(' ')) filename = filename.substr(1)
  if (window.platform == 'win32') {
  } else if (window.platform == 'darwin') {
    while (filename.startsWith('.')) filename = filename.substr(1)
  } else if (window.platform == 'linux') {
  }
  return filename
}
