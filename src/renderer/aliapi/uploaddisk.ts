import { IUploadingUI } from '../utils/dbupload'
import DebugLog from '../utils/debuglog'
import { OpenFileHandle } from '../utils/filehelper'
import { FileHandle, FileReadResult } from 'fs/promises'
import { IUploadInfo } from './models'
import AliUpload from './upload'
import HttpsProxyAgent from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'
import { useSettingStore } from '../store'
import DBCache from '../utils/dbcache'
import UserDAL from '../user/userdal'
import { Sleep } from '../utils/format'
import AliUploadHashPool from './uploadhashpool'
const nodehttps = window.require('https')
const path = window.require('path')


const filePosMap = new Map<number, number>()
let UploadSpeedTotal = 0
export default class AliUploadDisk {
  
  static async UploadOneFile(uploadInfo: IUploadInfo, fileui: IUploadingUI): Promise<string> {
    if (uploadInfo.part_info_list.length > 1) return AliUploadDisk.UploadOneFileBig(uploadInfo, fileui) 
    const upload_url = uploadInfo.part_info_list[0].upload_url
    const fileHandle = await OpenFileHandle(path.join(fileui.localFilePath, fileui.File.partPath))
    if (fileHandle.error) return fileHandle.error

    filePosMap.set(fileui.UploadID, 0)
    let isok = ''
    for (let i = 0; i < 3; i++) {
      isok = await AliUploadDisk.UploadOneFilePartNode(fileui.user_id, fileui.UploadID, fileHandle.handle, 0, fileui.File.size, upload_url)
      if (isok == 'success') {
        break
      }
    }
    if (fileHandle.handle) await fileHandle.handle.close()

    
    return AliUpload.UploadFileComplete(fileui.user_id, fileui.drive_id, fileui.Info.up_file_id, fileui.Info.up_upload_id, fileui.File.size, uploadInfo.sha1)
      .then((isSuccess) => {
        fileui.File.uploaded_file_id = fileui.Info.up_file_id
        fileui.File.uploaded_is_rapid = false
        fileui.Info.up_file_id = ''
        fileui.Info.up_upload_id = ''
        if (isSuccess) return 'success'
        else return '合并文件时出错，请重试'
      })
      .catch((err: any) => {
        DebugLog.mSaveDanger('合并文件时出错', err)
        return '合并文件时出错，请重试'
      })
  }

  
  static async UploadOneFileBig(uploadInfo: IUploadInfo, fileui: IUploadingUI): Promise<string> {
    filePosMap.set(fileui.UploadID, 0) 
    const fileHandle = await OpenFileHandle(path.join(fileui.localFilePath, fileui.File.partPath))
    if (fileHandle.error) return fileHandle.error

    const fileSize = fileui.File.size

    for (let i = 0, maxi = uploadInfo.part_info_list.length; i < maxi; i++) {
      let part = uploadInfo.part_info_list[i]

      const partStart = (part.part_number - 1) * part.part_size
      const partEnd = partStart + part.part_size
      const part_size = partEnd > fileSize ? fileSize - partStart : part.part_size

      if (part.isupload) {
        filePosMap.set(fileui.UploadID, partStart + part_size) 
      } else {
        

        
        const url = part.upload_url
        let expires = url.substring(url.indexOf('x-oss-expires=') + 'x-oss-expires='.length)
        expires = expires.substring(0, expires.indexOf('&'))
        const lastTime = parseInt(expires) - Date.now() / 1000 

        if (lastTime < 5 * 60) {
          
          await AliUpload.UploadFilePartUrl(fileui.user_id, fileui.drive_id, fileui.Info.up_file_id, fileui.Info.up_upload_id, fileui.File.size, uploadInfo).catch(() => {})
          if (uploadInfo.part_info_list.length == 0) return '获取分片信息失败，请重试' 
          part = uploadInfo.part_info_list[i]
        }
        let isok = ''
        for (let j = 0; j < 3; j++) {
          isok = await AliUploadDisk.UploadOneFilePartNode(fileui.user_id, fileui.UploadID, fileHandle.handle, partStart, part_size, part.upload_url)
          // isok = await AliUploadDisk.UploadOneFilePartNodeXHR(file.File.user_id, file.UploadID, fileHandle.handle, partStart, part_size, part.upload_url)

          if (isok == 'success') {
            part.isupload = true
            break
          }
          if (!fileui.IsRunning) break 
        }
        if (!fileui.IsRunning) break 
        if (part.isupload == false) {
          if (fileHandle.handle) await fileHandle.handle.close()
          return isok 
        }
      }
    }
    if (fileHandle.handle) await fileHandle.handle.close()
    if (!fileui.IsRunning) return '已暂停' 

    for (let i = 0, maxi = uploadInfo.part_info_list.length; i < maxi; i++) {
      if (uploadInfo.part_info_list[i].isupload == false) {
        return '有分片上传失败，请重试' 
      }
    }

    if (!uploadInfo.sha1) {
      if (fileui.File.size >= 1024000) {
        
        const prehash = await AliUploadHashPool.GetFilePreHash(path.join(fileui.localFilePath, fileui.File.partPath))
        if (fileui.File.size >= 10240000 && !prehash.startsWith('error')) {
          uploadInfo.sha1 = await DBCache.getFileHash(fileui.File.size, fileui.File.mtime, prehash, path.basename(fileui.File.name))
        }
      }
    }

    
    return AliUpload.UploadFileComplete(fileui.user_id, fileui.drive_id, fileui.Info.up_file_id, fileui.Info.up_upload_id, fileui.File.size, uploadInfo.sha1)
      .then((isSuccess) => {
        if (isSuccess) return 'success'
        else return '合并文件时出错，请重试'
      })
      .catch((err: any) => {
        DebugLog.mSaveDanger('合并文件时出错', err)
        return '合并文件时出错，请重试'
      })
  }

  
  static UploadOneFilePartNode(user_id: string, UploadID: number, fileHandle: FileHandle, partStart: number, partSize: number, upload_url: string): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const token = await UserDAL.GetUserTokenFromDB(user_id)
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
          'Content-Length': partSize,
          'Transfer-Encoding': 'chunked' ,
          Authorization: token.token_type + ' ' + token.access_token,
          Connection: 'keep-alive' 
        }
      }

      const settingStore = useSettingStore()
      const proxy = settingStore.proxyUseProxy ? settingStore.getProxy() : undefined
      if (proxy) {
        if (settingStore.proxyType.startsWith('http')) {
          const agenth = HttpsProxyAgent(proxy)
          option = Object.assign(option, { agent: agenth })
        } else {
          const agents = new SocksProxyAgent(proxy)
          option = Object.assign(option, { agent: agents })
        }
      }

      const winfo = { UploadID, isstop: false, partSize, partStart, buff: Buffer.alloc(40960) }
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

      while (winfo.partSize > 0 && winfo.isstop == false) {
        const result = await AliUploadDisk._WriteToRequest(req, fileHandle, winfo)
        if (result != 'success') {
          resolve('读取文件数据失败，请重试')
          break
        }
      }
      req.end()
    })
  }

  static async _WriteToRequest(req: any, fileHandle: FileHandle, winfo: { UploadID: number; isstop: boolean; partSize: number; partStart: number; buff: Buffer }): Promise<string> {
    return new Promise<string>((resolve) => {
      try {
        const redLen = Math.min(40960, winfo.partSize)
        if (redLen != winfo.buff.length) winfo.buff = Buffer.alloc(redLen)
        fileHandle
          .read(winfo.buff, 0, redLen, winfo.partStart)
          .then((rbuff: FileReadResult<Buffer>) => {
            if (redLen == rbuff.bytesRead) {
              winfo.partStart += redLen
              winfo.partSize -= redLen
              const uploadpos = winfo.partStart
              req.write(rbuff.buffer, async function () {
                filePosMap.set(winfo.UploadID, uploadpos)
                UploadSpeedTotal += redLen
                window.speedLimte -= redLen
                for (let i = 0; i < 10; i++) {
                  if (window.speedLimte <= 0) await Sleep(100)
                  else break
                }
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

  static UploadOneFilePartNodeXHR(user_id: string, UploadID: number, fileHandle: FileHandle, partStart: number, partSize: number, upload_url: string): Promise<string> {
    return new Promise<string>(async (resolve) => {
      const token = await UserDAL.GetUserTokenFromDB(user_id)
      if (!token || !token.access_token) {
        resolve('找不到上传token，请重试')
        return
      }
      const winfo = { UploadID, isstop: false, partSize: partSize, partStart: partStart, buff: Buffer.alloc(40960) }
      const client = new XMLHttpRequest()
      client.open('PUT', upload_url)
      client.timeout = 15000
      client.setRequestHeader('ContenpartSize', partSize.toString())
      client.setRequestHeader('Content-Type', '')
      client.onreadystatechange = function () {
        switch (client.readyState) {
          case 1: // OPENED
            // do something
            break
          case 2: // HEADERS_RECEIVED
            // do something
            break
          case 3: // LOADING
            // do something
            break
          case 4: // DONE
            // do something
            break
        }
      }
      client.upload.onprogress = function updateProgress(event) {
        if (event.lengthComputable) {
          const completedPercent = event.loaded / event.total
          console.log('onprogress', event, completedPercent)
          filePosMap.set(winfo.UploadID, partStart + event.loaded)
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

      const data = await this._ReadPartBuffer(fileHandle, winfo)
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

  static async _ReadPartBuffer(fileHandle: FileHandle, winfo: { UploadID: number; isstop: boolean; partSize: number; partStart: number; buff: Buffer }): Promise<string> {
    return new Promise<string>((resolve) => {
      try {
        const redLen = winfo.partSize
        if (redLen != winfo.buff.length) winfo.buff = Buffer.alloc(redLen)
        fileHandle
          .read(winfo.buff, 0, redLen, winfo.partStart)
          .then((rbuff: FileReadResult<Buffer>) => {
            if (redLen == rbuff.bytesRead) {
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

  
  static GetFileUploadSpeed(UploadID: number): number {
    return filePosMap.get(UploadID) || 0
  }

  
  static DelFileUploadSpeed(UploadID: number): void {
    filePosMap.delete(UploadID)
  }

  
  static GetFileUploadSpeedTotal(): number {
    const speed = UploadSpeedTotal + 0
    UploadSpeedTotal = 0
    return speed
  }
}
