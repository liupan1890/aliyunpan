import DB from '../utils/db'
import { IUploadingUI } from '../utils/dbupload'
import DebugLog from '../utils/debuglog'
import { OpenFileHandle } from '../utils/filehelper'
import { FileHandle, FileReadResult } from 'fs/promises'
import { IUploadInfo } from './models'
import AliUpload from './upload'
import HttpsProxyAgent from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { useSettingStore } from '../store'
const nodehttps = window.require('https')
const fs = window.require('fs')


const fileposMap = new Map<string, number>()
let UploadSpeedTotal = 0
export default class AliUploadDisk {
  
  static async UploadOneFile(uploadinfo: IUploadInfo, item: IUploadingUI): Promise<string> {
    if (uploadinfo.part_info_list.length > 1) return AliUploadDisk.UploadOneFileBig(uploadinfo, item) 
    const upload_url = uploadinfo.part_info_list[0].upload_url
    const filehandle = await OpenFileHandle(item.Task.LocalFilePath)
    if (filehandle.error) return filehandle.error

    fileposMap.set(item.UploadID, 0)
    let isok = ''
    for (let i = 0; i < 3; i++) {
      isok = await AliUploadDisk.UploadOneFilePartNode(item.Task.user_id, item.UploadID, filehandle.handle, 0, item.Task.size, upload_url)
      if (isok == 'success') {
        break
      }
    }
    if (filehandle.handle) await filehandle.handle.close()
    
    return AliUpload.UploadFileComplete(item.Task.user_id, item.Task.drive_id, item.Info.up_file_id, item.Info.up_upload_id, item.Task.size)
      .then((issuccess) => {
        item.Task.uploaded_file_id = item.Info.up_file_id
        item.Task.uploaded_is_rapid = false
        item.Info.up_file_id = ''
        item.Info.up_upload_id = ''
        if (issuccess) return 'success'
        else return '合并文件时出错，请重试'
      })
      .catch((err: any) => {
        DebugLog.mSaveDanger('合并文件时出错', err)
        return '合并文件时出错，请重试'
      })
  }
  
  static async UploadOneFileBig(uploadinfo: IUploadInfo, file: IUploadingUI): Promise<string> {
    fileposMap.set(file.UploadID, 0) 
    const filehandle = await OpenFileHandle(file.Task.LocalFilePath)
    if (filehandle.error) return filehandle.error

    const filesize = file.Task.size

    for (let i = 0, maxi = uploadinfo.part_info_list.length; i < maxi; i++) {
      let part = uploadinfo.part_info_list[i]

      const partstart = (part.part_number - 1) * part.part_size
      const partend = partstart + part.part_size
      const part_size = partend > filesize ? filesize - partstart : part.part_size

      if (part.isupload) {
        fileposMap.set(file.UploadID, partstart + part_size) 
      } else {
        

        
        const url = part.upload_url
        let expires = url.substring(url.indexOf('x-oss-expires=') + 'x-oss-expires='.length)
        expires = expires.substring(0, expires.indexOf('&'))
        const lasttime = parseInt(expires) - Date.now() / 1000 

        if (lasttime < 5 * 60) {
          
          await AliUpload.UploadFilePartUrl(file.Task.user_id, file.Task.drive_id, file.Info.up_file_id, file.Info.up_upload_id, file.Task.size, uploadinfo).catch(() => {})
          part = uploadinfo.part_info_list[i]
        }
        let isok = ''
        for (let j = 0; j < 3; j++) {
          isok = await AliUploadDisk.UploadOneFilePartNode(file.Task.user_id, file.UploadID, filehandle.handle, partstart, part_size, part.upload_url)
          //isok = await AliUploadDisk.UploadOneFilePartNodeXHR(file.File.user_id, file.UploadID, filehandle.handle, partstart, part_size, part.upload_url)

          if (isok == 'success') {
            part.isupload = true
            break
          }
          if (!file.IsRunning) break 
        }
        if (!file.IsRunning) break 
        if (part.isupload == false) {
          if (filehandle.handle) await filehandle.handle.close()
          return isok 
        }
      }
    }
    if (filehandle.handle) await filehandle.handle.close()
    if (!file.IsRunning) return '已暂停' 

    for (let i = 0, maxi = uploadinfo.part_info_list.length; i < maxi; i++) {
      if (uploadinfo.part_info_list[i].isupload == false) {
        return '有分片上传失败，请重试' 
      }
    }

    
    return AliUpload.UploadFileComplete(file.Task.user_id, file.Task.drive_id, file.Info.up_file_id, file.Info.up_upload_id, file.Task.size)
      .then((issuccess) => {
        if (issuccess) return 'success'
        else return '合并文件时出错，请重试'
      })
      .catch((err: any) => {
        DebugLog.mSaveDanger('合并文件时出错', err)
        return '合并文件时出错，请重试'
      })
  }

  
  static UploadOneFilePartNode(user_id: string, UploadID: string, filehandle: FileHandle, partstart: number, partsize: number, upload_url: string) {
    return new Promise<string>(async (resolve) => {
      let token = await DB.getUser(user_id)
      if (!token || !token.access_token) {
        resolve('找不到上传token，请重试')
        return
      }

      let option = {
        method: 'PUT',
        strictSSL: false,
        rejectUnauthorized: false,
        timeout: 15000 ,
        headers: {
          'Content-Type': '' ,
          'Content-Length': partsize,
          'Transfer-Encoding': 'chunked' ,
          Authorization: token.token_type + ' ' + token.access_token,
          Connection: 'keep-alive' 
        }
      }

      let settingStore = useSettingStore()
      let proxy = settingStore.proxyUseProxy ? settingStore.getProxy() : undefined
      if (proxy) {
        if (settingStore.proxyType.startsWith('http')) {
          var agenth = HttpsProxyAgent(proxy)
          option = Object.assign(option, { agent: agenth })
        } else {
          var agents = new SocksProxyAgent(proxy)
          option = Object.assign(option, { agent: agents })
        }
      }

      const winfo = { UploadID, isstop: false, partsize, partstart, buff: Buffer.alloc(40960) }
      const req = nodehttps.request(upload_url, option, function (res: any) {
        let _data = ''
        res.on('data', function (chunk: string) {
          _data += chunk
        })
        res.on('end', function () {
          winfo.isstop = true
          if (res.statusCode == 200) {
            resolve('success') 
          } else if (res.statusCode == 409 && _data.indexOf('PartAlreadyExist') > 0) {
            resolve('success') 
          } else {
            DebugLog.mSaveDanger('分片上传失败，稍后重试' + res.statusCode)
            resolve('分片上传失败，稍后重试' + res.statusCode)
          }
        })
      })
      req.on('error', (error: any) => {
        DebugLog.mSaveWarning('分片上传失败，稍后重试', error)
        winfo.isstop = true
        let message = error.message || error.code || '网络错误'
        message = message.replace('A "socket" was not created for HTTP request before 15000ms', '网络连接超时失败')
        resolve('分片上传失败，稍后重试' + message)
      })

      while (winfo.partsize > 0 && winfo.isstop == false) {
        const result = await AliUploadDisk._WriteToRequest(req, filehandle, winfo)
        if (result != 'success') {
          resolve('读取文件数据失败，请重试')
          break
        }
      }
      req.end()
    })
  }

  static async _WriteToRequest(req: any, filehandle: FileHandle, winfo: { UploadID: string; isstop: boolean; partsize: number; partstart: number; buff: Buffer }) {
    return new Promise<string>((resolve) => {
      try {
        let redlen = Math.min(40960, winfo.partsize)
        if (redlen != winfo.buff.length) winfo.buff = Buffer.alloc(redlen)
        filehandle
          .read(winfo.buff, 0, redlen, winfo.partstart)
          .then((rbuff: FileReadResult<Buffer>) => {
            if (redlen == rbuff.bytesRead) {
              winfo.partstart += redlen
              winfo.partsize -= redlen
              const uploadpos = winfo.partstart
              req.write(rbuff.buffer, function () {
                fileposMap.set(winfo.UploadID, uploadpos)
                UploadSpeedTotal += redlen
                resolve('success')
              }) 
            } else {
              winfo.isstop = true
              resolve('读取文件数据失败，请重试')
            }
          })
          .catch(() => {
            winfo.isstop = true
            resolve('读取文件数据失败，请重试')
          })
      } catch {
        winfo.isstop = true
        resolve('读取文件数据失败，请重试')
      }
    })
  }

  static UploadOneFilePartNodeXHR(user_id: string, UploadID: string, filehandle: FileHandle, partstart: number, partsize: number, upload_url: string) {
    return new Promise<string>(async (resolve) => {
      let token = await DB.getUser(user_id)
      if (!token || !token.access_token) {
        resolve('找不到上传token，请重试')
        return
      }
      const winfo = { UploadID, isstop: false, partsize, partstart, buff: Buffer.alloc(40960) }
      var client = new XMLHttpRequest()
      client.open('PUT', upload_url)
      client.timeout = 15000
      client.setRequestHeader('Content-Length', partsize.toString())
      client.setRequestHeader('Content-Type', '')
      client.onreadystatechange = function () {
        switch (client.readyState) {
          case 1: //OPENED
            //do something
            break
          case 2: //HEADERS_RECEIVED
            //do something
            break
          case 3: //LOADING
            //do something
            break
          case 4: //DONE
            //do something
            break
        }
      }
      client.upload.onprogress = function updateProgress(event) {
        if (event.lengthComputable) {
          var completedPercent = event.loaded / event.total
          console.log('onprogress', event)
          fileposMap.set(winfo.UploadID, partstart + event.loaded)
        }
      }

      client.onabort = function () {
        resolve('用户暂停')
      }
      client.ontimeout = function () {
        resolve('网络超时')
      }
      client.onerror = function () {
        resolve('网络出错')
      }

      client.onloadend = function () {
        
        if ((client.status >= 200 && client.status < 300) || client.status == 409) {
          resolve('success') 
        } else {
          resolve('分片上传失败，稍后重试' + client.status)
          DebugLog.mSaveDanger('分片上传失败，稍后重试' + client.status)
        }
      }

      let data = await this._ReadPartBuffer(filehandle, winfo)
      if (data != 'success') resolve(data) 
      else {
        try {
          client.send(winfo.buff)
        } catch (err: any) {
          console.log('send', err)
          resolve('联网发送失败，请重试')
        }
      }
    })
  }

  static async _ReadPartBuffer(filehandle: FileHandle, winfo: { UploadID: string; isstop: boolean; partsize: number; partstart: number; buff: Buffer }) {
    return new Promise<string>((resolve) => {
      try {
        let redlen = winfo.partsize
        if (redlen != winfo.buff.length) winfo.buff = Buffer.alloc(redlen)
        filehandle
          .read(winfo.buff, 0, redlen, winfo.partstart)
          .then((rbuff: FileReadResult<Buffer>) => {
            if (redlen == rbuff.bytesRead) {
              resolve('success')
            } else {
              winfo.isstop = true
              resolve('读取文件数据失败，请重试')
            }
          })
          .catch(() => {
            winfo.isstop = true
            resolve('读取文件数据失败，请重试')
          })
      } catch {
        winfo.isstop = true
        resolve('读取文件数据失败，请重试')
      }
    })
  }

  
  static GetFileUploadSpeed(UploadID: string) {
    return fileposMap.get(UploadID) || 0
  }
  
  static DelFileUploadSpeed(UploadID: string) {
    fileposMap.delete(UploadID)
  }
  
  static GetFileUploadSpeedTotal() {
    let speed = UploadSpeedTotal + 0
    UploadSpeedTotal = 0
    return speed
  }
}
var STREAM_HIGH_WATER_MARK = 512 * 1024 
