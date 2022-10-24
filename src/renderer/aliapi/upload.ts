import DebugLog from '../utils/debuglog'
import AliHttp from './alihttp'
import { IUploadCreat, IUploadInfo } from './models'

export default class AliUpload {

  static async UploadCreatFileWithPreHash(user_id: string, drive_id: string, parent_file_id: string, name: string, fileSize: number, prehash: string, check_name_mode: string): Promise<IUploadCreat> {
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
    if (!user_id || !drive_id || !parent_file_id || !name) {
      result.errormsg = '创建文件失败(数据错误)'
      return result
    }


    const url = 'adrive/v2/file/createWithFolders'
    const postData: {
      drive_id: string
      parent_file_id: string
      name: string
      type: string
      check_name_mode: string
      size: number
      pre_hash: string
      part_info_list: { part_number: number; part_size: number }[]
      ignore_rapid?: boolean
    } = {
      drive_id,
      parent_file_id: parent_file_id,
      name: name,
      type: 'file',
      check_name_mode: check_name_mode == 'ignore' ? 'refuse' : check_name_mode,
      size: fileSize,
      pre_hash: prehash,
      part_info_list: []
    }

    let partSize = 10485760 
    if (fileSize > 0) {
      let partIndex = 0

      while (fileSize > partSize * 8000) partSize = partSize + 10485760 

      while (partIndex * partSize < fileSize) {
        postData.part_info_list.push({ part_number: partIndex + 1, part_size: partSize })
        partIndex++
      }
      postData.part_info_list[partIndex - 1].part_size = fileSize - (partIndex - 1) * partSize 
    }

    const resp = await AliHttp.Post(url, postData, user_id, '')

    if (typeof resp.body === 'object' && JSON.stringify(resp.body).indexOf('file size is exceed') > 0) {
      result.errormsg = '创建文件失败(单文件最大100GB/2TB)'
      return result
    }

    
    if (resp.body && resp.body.code) {
      if (resp.body?.code == 'PreHashMatched') {
        
        result.errormsg = 'PreHashMatched'
      } else if (resp.body?.code == 'QuotaExhausted.Drive') {
        result.errormsg = '出错暂停，网盘空间已满'
      } else {
        result.errormsg = resp.body?.code || '创建失败，网络错误'
        DebugLog.mSaveDanger('createWithFolders', result.errormsg + ' ' + name)
      }
      
      return result
    }

    
    if (AliHttp.IsSuccess(resp.code)) {
      result.file_id = resp.body.file_id
      if (resp.body.exist) {
        
        if (check_name_mode == 'ignore') {
          
          await AliUpload.UploadFileDelete(user_id, drive_id, result.file_id).catch(() => {}) 
          return await AliUpload.UploadCreatFileWithPreHash(user_id, drive_id, parent_file_id, name, fileSize, prehash, check_name_mode) 
        } else {
          
          result.errormsg = '出错暂停，网盘内有重名文件'
        }
      }
      result.isexist = resp.body.exist || false 
      result.israpid = false
      result.upload_id = resp.body.upload_id || ''
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        const part_info_list = resp.body.part_info_list
        for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
          const item = part_info_list[i]
          result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, part_size: partSize, isupload: false })
        }
      }
      return result
    } else {
      DebugLog.mSaveWarning('UploadCreatFileWithFolders err=' + (resp.code || ''))
      result.errormsg = '创建文件失败' + resp.code.toString()
      return result
    }
  }

  static async UploadCreatFileWithFolders(user_id: string, drive_id: string, parent_file_id: string, name: string, fileSize: number, hash: string, proof_code: string, check_name_mode: string): Promise<IUploadCreat> {
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
    if (!user_id || !drive_id || !parent_file_id || !name) {
      result.errormsg = '创建文件失败(数据错误)'
      return result
    }



    const url = 'adrive/v2/file/createWithFolders'
    const postData: {
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
      part_info_list: { part_number: number; part_size: number }[]
      ignore_rapid?: boolean
    } = {
      drive_id,
      parent_file_id: parent_file_id,
      name: name,
      type: 'file',
      check_name_mode: check_name_mode == 'ignore' ? 'refuse' : check_name_mode,
      size: fileSize,
      part_info_list: []
    }

    
    if (hash) {
      postData.content_hash = hash.toUpperCase()
      postData.content_hash_name = 'sha1'
      postData.proof_version = 'v1'
      postData.proof_code = proof_code 
      
    }

    let partSize = 10485760 
    if (fileSize > 0) {
      let partIndex = 0

      while (fileSize > partSize * 8000) partSize = partSize + 10485760 

      while (partIndex * partSize < fileSize) {
        postData.part_info_list.push({ part_number: partIndex + 1, part_size: partSize })
        partIndex++
      }
      postData.part_info_list[partIndex - 1].part_size = fileSize - (partIndex - 1) * partSize 
    }

    const resp = await AliHttp.Post(url, postData, user_id, '')

    if (typeof resp.body === 'object' && JSON.stringify(resp.body).indexOf('file size is exceed') > 0) {
      result.errormsg = '创建文件失败(单文件最大100GB/2TB)'
      return result
    }

    
    if (resp.body && resp.body.code) {
      if (resp.body?.code == 'QuotaExhausted.Drive') {
        result.errormsg = '出错暂停，网盘空间已满'
      } else if (resp.body?.code == 'InvalidRapidProof') {
        
        result.errormsg = resp.body.code
        DebugLog.mSaveDanger('InvalidRapidProof', name)
      } else {
        result.errormsg = resp.body?.code || '创建失败，网络错误'
        DebugLog.mSaveDanger('createWithFolders', result.errormsg + ' ' + name)
      }
      
      return result
    }

    
    if (AliHttp.IsSuccess(resp.code)) {
      result.file_id = resp.body.file_id
      if (resp.body.exist) {
        const issame = await AliUpload.UploadFileCheckHash(user_id, drive_id, result.file_id, hash)
        if (issame) {
          result.errormsg = ''
        } else {
          if (check_name_mode == 'ignore') {
            
            await AliUpload.UploadFileDelete(user_id, drive_id, result.file_id).catch(() => {}) 
            return await AliUpload.UploadCreatFileWithFolders(user_id, drive_id, parent_file_id, name, fileSize, hash, proof_code, check_name_mode) 
          } else {
            
            result.errormsg = '出错暂停，网盘内有重名文件'
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
          result.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, part_size: partSize, isupload: false })
        }
      }
      return result
    } else {
      DebugLog.mSaveWarning('UploadCreatFileWithFolders err=' + (resp.code || ''))
      result.errormsg = '创建文件失败' + resp.code.toString()
      return result
    }
  }

  
  static async UploadFileCheckHash(user_id: string, drive_id: string, file_id: string, hash: string): Promise<boolean> {
    if (!user_id || !drive_id || !file_id) return false
    const url = 'v2/file/get?jsonmask=content_hash'
    const postData = { drive_id: drive_id, file_id: file_id }
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code) && resp.body.content_hash) {
      const content_hash = resp.body.content_hash.toUpperCase()
      hash = hash.toUpperCase()
      return hash === content_hash
    } else {
      DebugLog.mSaveWarning('UploadFileCheckHash err=' + (resp.code || ''))
      return false
    }
  }

  
  static async UploadFileDelete(user_id: string, drive_id: string, file_id: string, permanently: boolean = false): Promise<boolean> {
    if (!user_id || !drive_id || !file_id) return false
    const url = 'v2/recyclebin/trash'
    const postData = { drive_id: drive_id, file_id: file_id, permanently }
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (AliHttp.IsSuccess(resp.code)) {
      return true
    } else {
      DebugLog.mSaveWarning('UploadFileDelete err=' + (resp.code || ''))
      return false
    }
  }

  
  static async UploadFileComplete(user_id: string, drive_id: string, file_id: string, upload_id: string, fileSize: number, fileSha1: string): Promise<boolean> {
    if (!user_id || !drive_id || !file_id || !upload_id) return false
    const url = 'v2/file/complete'
    const postData = { drive_id: drive_id, upload_id: upload_id, file_id: file_id }
    let resp = await AliHttp.Post(url, postData, user_id, '')
    if (resp.code == 400 || resp.code == 429) {
      resp = await AliHttp.Post(url, postData, user_id, '')
      
      
    }

    if (AliHttp.IsSuccess(resp.code)) {
      if (resp.body.size == fileSize) {
        if (fileSha1) {
          
          if (resp.body.content_hash && resp.body.content_hash == fileSha1) {
            return true
          } else {
            
            await AliUpload.UploadFileDelete(user_id, drive_id, file_id, true).catch(() => {})
            DebugLog.mSaveDanger('UploadFileComplete', '合并文件后发现SHA1不一致，删除已上传的文件，重新上传')
            return false
          }
        } else if (fileSize < 10485760) {
          return true 
        } else {
          return true 
        }
      } else {
        
        await AliUpload.UploadFileDelete(user_id, drive_id, file_id, true).catch(() => {})
        DebugLog.mSaveDanger('UploadFileComplete', '合并文件后发现大小不一致，删除已上传的文件，重新上传')
        return false
      }
    } else {
      DebugLog.mSaveDanger('UploadFileComplete', '合并文件时出错' + resp.code + ' ' + JSON.stringify(resp.header || {}) + ' ' + JSON.stringify(resp.body || {}))
      return false
    }
  }

  
  static async UploadFilePartUrl(user_id: string, drive_id: string, file_id: string, upload_id: string, fileSize: number, uploadInfo: IUploadInfo): Promise<'neterror' | 'success' | 'error'> {
    const url = 'v2/file/get_upload_url'
    const postData: {
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
    let partIndex = 0

    let partSize = 10485760 
    while (fileSize > partSize * 8000) partSize = partSize + 10485760

    while (partIndex * partSize < fileSize) {
      postData.part_info_list.push({ part_number: partIndex + 1, part_size: partSize })
      partIndex++
    }
    postData.part_info_list[partIndex - 1].part_size = fileSize - (partIndex - 1) * partSize 

    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (resp.code >= 600 && resp.code <= 610) {
      return 'neterror' 
    }

    if (AliHttp.IsSuccess(resp.code)) {
      if (resp.body.part_info_list && resp.body.part_info_list.length > 0) {
        
        const part_info_list = resp.body.part_info_list
        if (uploadInfo.part_info_list.length == 0) {
          
          for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
            const item = part_info_list[i]
            uploadInfo.part_info_list.push({ upload_url: item.upload_url, part_number: item.part_number, part_size: partSize, isupload: false })
          }
        } else {
          
          for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
            const item = part_info_list[i]
            uploadInfo.part_info_list[item.part_number - 1].upload_url = item.upload_url
          }
        }
      }
      return 'success'
    } else {
      uploadInfo.part_info_list = []
      DebugLog.mSaveWarning('UploadFilePartUrl err=' + upload_id + ' ' + (resp.code || ''))
      return 'error'
    }
  }

  
  static async UploadFileListUploadedParts(user_id: string, drive_id: string, file_id: string, upload_id: string, part_number_marker: number, uploadInfo: IUploadInfo): Promise<'neterror' | 'success' | 'error'> {
    if (!user_id || !drive_id || !file_id || !upload_id) return 'error'

    const url = 'v2/file/list_uploaded_parts'
    const postData = { drive_id: drive_id, upload_id: upload_id, file_id: file_id, part_number_marker /* 1开始 */ }
    const resp = await AliHttp.Post(url, postData, user_id, '')
    if (resp.code >= 600 && resp.code <= 610) {
      return 'neterror' 
    }
    if (AliHttp.IsSuccess(resp.code)) {
      if (resp.body.uploaded_parts && resp.body.uploaded_parts.length > 0) {
        const uploaded_parts = resp.body.uploaded_parts
        for (let i = 0, maxi = uploaded_parts.length; i < maxi; i++) {
          const item = uploaded_parts[i]
          const part_number = item.part_number
          const uploadpart = uploadInfo.part_info_list[part_number - 1]
          if (uploadpart.part_size != item.part_size) {
            
            DebugLog.mSaveDanger('list_uploaded_parts', '分片数据错误 uploadpart=' + uploadpart.part_size + ' item=' + item.part_size)
            return 'error'
          }
          uploadInfo.part_info_list[part_number - 1].isupload = true
        }
      }
      if (resp.body.next_part_number_marker && parseInt(resp.body.next_part_number_marker) > 0) {
        const next = parseInt(resp.body.next_part_number_marker)
        await AliUpload.UploadFileListUploadedParts(user_id, drive_id, file_id, upload_id, next, uploadInfo).catch(() => {})
      }
      return 'success'
    } else {
      DebugLog.mSaveWarning('UploadFileListUploadedParts err=' + upload_id + ' ' + (resp.code || ''))
      return 'error'
    }
  }

  static isNetworkError(e: Error): boolean {
    return e.message == 'Network Error' || e.message.includes('socket hang up') || e.message.includes('getaddrinfo ENOTFOUND') || e.message.includes('timeout of') || e.message.includes('connect ECONNRESET') || e.message.includes('connect ETIMEDOUT') || e.message.includes('EPIPE')
  }
}
