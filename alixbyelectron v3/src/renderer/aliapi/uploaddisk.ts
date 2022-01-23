import SettingLog from '@/setting/settinglog'
import { IStateUploadFile } from '@/store/models'
import UserDAL from '@/store/userdal'
import { FileHandle, FileReadResult } from 'fs/promises'
import { IUploadCreat } from './models'
import AliUpload from './upload'
const fspromises = window.require('fs/promises')
const nodehttps = window.require('https')
const nodeurl = window.require('url')

const fileposMap = new Map<string, number>()

export default class AliUploadDisk {
  static async UploadOneFile(uploadinfo: IUploadCreat, file: IStateUploadFile): Promise<string> {
    if (uploadinfo.part_info_list.length > 1) return AliUploadDisk.UploadOneFileBig(uploadinfo, file)
    const upload_url = uploadinfo.part_info_list[0].upload_url
    const filehandle = await fspromises.open(file.Info.localFilePath, 'r').catch((e: any) => {
      if (e.code && e.code === 'EPERM') e = '文件没有读取权限'
      if (e.code && e.code === 'EBUSY') e = '文件被占用或锁定中'
      if (e.message) e = e.message
      if (typeof e == 'string' && e.indexOf('EACCES') >= 0) e = '文件没有读取权限'
      SettingLog.mSaveLog('danger', 'UpOne上传文件失败：' + file.Info.localFilePath + ' ' + (e || ''))
      return typeof e == 'string' && e.startsWith('文件') ? e : '读取文件失败'
    })
    if (filehandle && typeof filehandle == 'string') return filehandle
    if (!filehandle) return '读取文件失败'

    fileposMap.set(file.UploadID, 0)
    let isok = ''
    for (let i = 0; i < 3; i++) {
      isok = await AliUploadDisk.UploadOneFilePartNode(file.Info.user_id, file.UploadID, filehandle, 0, file.Info.size, upload_url)
      if (isok == 'success') {
        break
      }
    }
    await filehandle?.close()
    return AliUpload.UploadFileComplete(file.Info.user_id, file.Info.drive_id, file.Upload.file_id, file.Upload.upload_id, file.Info.size)
      .then((issuccess) => {
        if (issuccess) return 'success'
        else return '合并文件时出错，请重试'
      })
      .catch((e: any) => {
        SettingLog.mSaveLog('danger', '合并文件时出错，请重试' + e.message)
        return '合并文件时出错，请重试'
      })
  }
  static async UploadOneFileBig(uploadinfo: IUploadCreat, file: IStateUploadFile): Promise<string> {
    fileposMap.set(file.UploadID, 0)
    const filehandle = await fspromises.open(file.Info.localFilePath, 'r').catch((e: any) => {
      if (e.code && e.code === 'EPERM') e = '文件没有读取权限'
      if (e.code && e.code === 'EBUSY') e = '文件被占用或锁定中'
      if (e.message) e = e.message
      if (typeof e == 'string' && e.indexOf('EACCES') >= 0) e = '文件没有读取权限'
      SettingLog.mSaveLog('danger', 'UpOneBig上传文件失败：' + file.Info.localFilePath + ' ' + (e || ''))
      return typeof e == 'string' && e.startsWith('文件') ? e : '读取文件失败'
    })
    if (filehandle && typeof filehandle == 'string') return filehandle
    if (!filehandle) return '读取文件失败'

    const filesize = file.Info.size

    for (let i = 0, maxi = uploadinfo.part_info_list.length; i < maxi; i++) {
      let part = uploadinfo.part_info_list[i]

      const partstart = (part.part_number - 1) * part.part_size
      const partend = partstart + part.part_size
      const part_size = partend > filesize ? filesize - partstart : part.part_size

      if (part.isupload) {
        fileposMap.set(file.UploadID, partstart + part_size)
      } else {

        const url = part.upload_url
        let expires = url.substr(url.indexOf('x-oss-expires=') + 'x-oss-expires='.length)
        expires = expires.substr(0, expires.indexOf('&'))
        const lasttime = parseInt(expires) - Date.now() / 1000

        if (lasttime < 5 * 60) {
          await AliUpload.UploadFilePartUrl(file.Info.user_id, file.Info.drive_id, file.Upload.file_id, file.Upload.upload_id, file.Info.size, uploadinfo).catch(() => {})
          part = uploadinfo.part_info_list[i]
        }
        let isok = ''
        for (let j = 0; j < 3; j++) {
          isok = await AliUploadDisk.UploadOneFilePartNode(file.Info.user_id, file.UploadID, filehandle, partstart, part_size, part.upload_url)
          if (isok == 'success') {
            part.isupload = true
            break
          }
          if (file.Upload.DownState != 'active') break
        }
        if (file.Upload.DownState != 'active') break
        if (part.isupload == false) {
          await filehandle?.close()
          return isok
        }
      }
    }
    await filehandle?.close()
    if (file.Upload.DownState != 'active') return ''

    for (let i = 0, maxi = uploadinfo.part_info_list.length; i < maxi; i++) {
      if (uploadinfo.part_info_list[i].isupload == false) {
        return '有分片上传失败，请重试'
      }
    }

    return AliUpload.UploadFileComplete(file.Info.user_id, file.Info.drive_id, file.Upload.file_id, file.Upload.upload_id, file.Info.size)
      .then((issuccess) => {
        if (issuccess) return 'success'
        else return '合并文件时出错，请重试'
      })
      .catch((e: any) => {
        SettingLog.mSaveLog('danger', '合并文件时出错，请重试' + e.message)
        return '合并文件时出错，请重试'
      })
  }

  static UploadOneFilePartNode(user_id: string, UploadID: string, filehandle: FileHandle, partstart: number, partsize: number, upload_url: string) {
    return new Promise<string>(async (resolve) => {
      var parse_u = nodeurl.parse(upload_url, true)
      let token = UserDAL.GetUserToken(user_id)
      if (!token || !token.access_token) {
        resolve('找不到上传token，请重试')
        return
      }
      const option = {
        host: parse_u.hostname,
        port: parse_u.port || 443,
        path: parse_u.path,
        method: 'PUT',
        headers: {
          'Content-Type': '',
          'Transfer-Encoding': 'chunked',
          Authorization: token.token_type + ' ' + token.access_token,
          Connection: 'keep-alive'
        }
      }
      const winfo = { UploadID, isstop: false, partsize, partstart, buff: Buffer.alloc(40960) }
      const req = nodehttps.request(option, function (res: any) {
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
          } else resolve('分片上传失败，稍后重试' + res.statusCode)
        })
      })
      req.on('error', (error: any) => {
        winfo.isstop = true
        resolve('分片上传失败，稍后重试' + error.toString())
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

  static GetFileUploadProofSpeed(UploadID: string) {
    return fileposMap.get(UploadID) || 0
  }
  static DelFileUploadProofSpeed(UploadID: string) {
    fileposMap.delete(UploadID)
  }
}
