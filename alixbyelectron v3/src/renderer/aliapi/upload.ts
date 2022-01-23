import SettingLog from '@/setting/settinglog'
import UserDAL from '@/store/userdal'
import AliHttp from './alihttp'
import { IUploadCreat } from './models'
import AliUser from './user'
import { IsSuccess } from './utils'

export default class AliUpload {
  static async UploadCreatFileWithFolders(
    user_id: string,
    drive_id: string,
    parentid: string,
    name: string,
    filesize: number,
    hash: string,
    proof_code: string,
    prehash: string,
    IsBreakExist: boolean
  ): Promise<IUploadCreat> {
    const url = 'https://api.aliyundrive.com/adrive/v2/file/createWithFolders'
    const postdata: {
      drive_id: string
      parent_file_id: string
      name: string
      type: string
      check_name_mode: string
      size: number
      content_hash?: string
      content_hash_name?: string
      proof_code?: string
      proof_version?: string
      pre_hash?: string
      part_info_list: { part_number: number; part_size: number }[]
    } = {
      drive_id,
      parent_file_id: parentid,
      name: name.replaceAll('？', '?'),
      type: 'file',
      check_name_mode: 'refuse',
      size: filesize,
      part_info_list: []
    }

    if (hash) {
      postdata.content_hash = hash.toUpperCase()
      postdata.content_hash_name = 'sha1'
      postdata.proof_version = 'v1'
      postdata.proof_code = proof_code
    } else {
      hash = ''
      postdata.pre_hash = prehash
    }

    let partsize = 10485760
    if (filesize > 0) {
      let partindex = 0

      while (filesize > partsize * 8000) partsize = partsize + 10485760

      while (partindex * partsize < filesize) {
        postdata.part_info_list.push({ part_number: partindex + 1, part_size: partsize })
        partindex++
      }
      postdata.part_info_list[partindex - 1].part_size = filesize - (partindex - 1) * partsize
    }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    const result: IUploadCreat = {
      user_id,
      drive_id,
      israpid: false,
      isexist: false,
      upload_id: '',
      file_id: '',
      part_info_list: [],
      errormsg: ''
    }

    if (typeof resp.body === 'object' && JSON.stringify(resp.body).indexOf('file size is exceed') > 0) {
      result.errormsg = '创建文件失败(单文件最大2TB)'
      return result
    }

    if (resp.body.code) {
      if (resp.body.code == 'PreHashMatched') result.errormsg = 'PreHashMatched'
      else if (resp.body.code == 'QuotaExhausted.Drive') result.errormsg = '创建文件失败，网盘空间已满'
      else if (resp.body.code == 'InvalidRapidProof') {
        let token = UserDAL.GetUserToken(user_id)
        if (token) await AliUser.ApiTokenRefreshAccount(token, true).catch(() => {})
        result.errormsg = resp.body.code
      } else result.errormsg = resp.body.code
      return result
    }
    if (IsSuccess(resp.code)) {
      result.file_id = resp.body.file_id
      if (resp.body.exist) {
        if (IsBreakExist == false) {
          const issame = await AliUpload.UploadFileCheckHash(user_id, drive_id, result.file_id, hash)
          if (issame == false) {
            await AliUpload.UploadFileDelete(user_id, drive_id, result.file_id).catch(() => {})
            return await AliUpload.UploadCreatFileWithFolders(user_id, drive_id, parentid, name, filesize, hash, proof_code, prehash, IsBreakExist)
          } else {
            result.israpid = true
          }
        }
      }
      result.isexist = resp.body.exist || false
      result.israpid = result.israpid || resp.body.rapid_upload || false
      result.upload_id = resp.body.upload_id || ''
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        const part_info_list = resp.body.part_info_list
        for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
          const item = part_info_list[i]
          result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, part_size: partsize, isupload: false })
        }
      }
      return result
    } else {
      result.errormsg = '创建文件失败' + resp.code.toString()
      return result
    }
  }

  static async UploadFileCheckHash(user_id: string, drive_id: string, file_id: string, hash: string): Promise<boolean> {
    const url = 'v2/file/get'
    const postdata = { drive_id: drive_id, file_id: file_id }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (IsSuccess(resp.code) && resp.body.content_hash) {
      const content_hash = resp.body.content_hash.toUpperCase()
      hash = hash.toUpperCase()
      return hash === content_hash
    } else return false
  }

  static async UploadFileDelete(user_id: string, drive_id: string, file_id: string, permanently: boolean = false): Promise<boolean> {
    const url = 'v2/recyclebin/trash'
    const postdata = { drive_id: drive_id, file_id: file_id, permanently }
    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (IsSuccess(resp.code)) {
      return true
    } else return false
  }

  static async UploadFileComplete(user_id: string, drive_id: string, file_id: string, upload_id: string, filesize: number): Promise<boolean> {
    const url = 'v2/file/complete'
    const postdata = { drive_id: drive_id, upload_id: upload_id, file_id: file_id }
    let resp = await AliHttp.Post(url, postdata, user_id, '')
    if (resp.code == 400) {
      resp = await AliHttp.Post(url, postdata, user_id, '')
    }

    if (IsSuccess(resp.code)) {
      if (resp.body.size == filesize) return true
      else {
        await AliUpload.UploadFileDelete(user_id, drive_id, file_id, true).catch(() => {})
        SettingLog.mSaveLog('danger', '合并文件后发现大小不一致，删除已上传的文件，重新上传')
        return false
      }
    } else {
      SettingLog.mSaveLog('danger', '合并文件时出错' + resp.code + ' ' + JSON.stringify(resp.header || {}) + ' ' + JSON.stringify(resp.body || {}))
      return false
    }
  }

  static async UploadFilePartUrl(user_id: string, drive_id: string, file_id: string, upload_id: string, filesize: number, result: IUploadCreat) {
    const url = 'v2/file/get_upload_url'
    const postdata: {
      drive_id: string
      upload_id: string
      file_id: string
      part_info_list: { part_number: number; part_size: number }[]
    } = {
      drive_id: drive_id,
      upload_id: upload_id,
      file_id: file_id,
      part_info_list: []
    }
    let partindex = 0

    let partsize = 10485760
    while (filesize > partsize * 8000) partsize = partsize + 10485760

    while (partindex * partsize < filesize) {
      postdata.part_info_list.push({ part_number: partindex + 1, part_size: partsize })
      partindex++
    }
    postdata.part_info_list[partindex - 1].part_size = filesize - (partindex - 1) * partsize

    const resp = await AliHttp.Post(url, postdata, user_id, '')
    if (IsSuccess(resp.code)) {
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        const part_info_list = resp.body.part_info_list
        if (result.part_info_list.length == 0) {
          for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
            const item = part_info_list[i]
            result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, part_size: partsize, isupload: false })
          }
        } else {
          for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
            const item = part_info_list[i]
            result.part_info_list[item.part_number - 1].upload_url = item.upload_url
          }
        }
      }
    }
  }

  static async UploadFileListUploadedParts(user_id: string, drive_id: string, file_id: string, upload_id: string, part_number_marker: number, result: IUploadCreat) {
    const url = 'v2/file/list_uploaded_parts'
    const postdata = { drive_id: drive_id, upload_id: upload_id, file_id: file_id, part_number_marker }
    const resp = await AliHttp.Post(url, postdata, user_id, '')

    if (IsSuccess(resp.code)) {
      if (resp.body.uploaded_parts && resp.body.uploaded_parts.length > 0) {
        const uploaded_parts = resp.body.uploaded_parts
        for (let i = 0, maxi = uploaded_parts.length; i < maxi; i++) {
          const item = uploaded_parts[i]
          const part_number = item.part_number
          result.part_info_list[part_number - 1].isupload = true
        }
      }
      if (resp.body.next_part_number_marker && parseInt(resp.body.next_part_number_marker) > 0) {
        const next = parseInt(resp.body.next_part_number_marker)
        await AliUpload.UploadFileListUploadedParts(user_id, drive_id, file_id, upload_id, next, result).catch(() => {})
      }
    }
  }
}
