import AliFileCmd from '../aliapi/filecmd'
import { IUploadInfo } from '../aliapi/models'
import AliUpload from '../aliapi/upload'
import AliUploadDisk from '../aliapi/uploaddisk'
import AliUploadHash from '../aliapi/uploadhash'
import { useSettingStore } from '../store'
import DB from '../utils/db'
import DBUpload, { IUploadingUI } from '../utils/dbupload'
import DebugLog from '../utils/debuglog'
const fspromises = window.require('fs/promises')

export async function StartUpload(item: IUploadingUI) {
  
  const token = await DB.getUser(item.Task.user_id)
  if (token == undefined || token.user_id !== item.Task.user_id) {
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 402
    item.Info.FailedMessage = '找不到账号,无法继续'
    return
  }
  let expire_time = new Date(token.expire_time).getTime()
  
  if (expire_time - new Date().getTime() < 60000) {
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 402
    item.Info.FailedMessage = 'token过期失效,无法继续'
    return
  }

  
  if (item.Task.IsDir) return creatDir(item)

  
  await checkFileSize(item)

  const uploadinfo: IUploadInfo = {
    token_type: token.token_type,
    access_token: token.access_token,
    isexist: false,
    israpid: false,
    part_info_list: [],
    errormsg: ''
  }

  if (item.Info.up_upload_id != '' && item.Info.up_file_id != '') {
    
    await reloadUploadUrl(uploadinfo, item).catch(() => {})
  }

  if (item.Info.up_upload_id == '') {
    
    const needupload = await checkPreHashAndGetPartlist(uploadinfo, item)
    if (!needupload) return
  }

  if (useSettingStore().downUploadBreakFile) {
    
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 505
    item.Info.FailedMessage = '跳过不能秒传的文件'
    return
  }

  
  if (item.Info.UploadState == 'error') return

  if (uploadinfo.part_info_list.length == 0) {
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 505
    item.Info.FailedMessage = '获取上传地址失败1'
    return
  }

  
  DBUpload.saveUploadInfo(item.Info)

  
  const UpResult = await AliUploadDisk.UploadOneFile(uploadinfo, item)

  
  if (UpResult == 'success') {
    item.Info.UploadState = 'success'
  } else if (!item.IsRunning) {
    console.log('已暂停', item.Info.UploadState, item.Info)
    item.Info.UploadState = '已暂停'
  } else if (item.Info.UploadState == 'running') {
    console.log(item.Info.UploadState, item.Info)
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 505
    item.Info.FailedMessage = UpResult
  } else {
    console.log(item.Info.UploadState, item.Info)
    
  }
}

async function creatDir(item: IUploadingUI) {
  
  let data = await AliFileCmd.ApiCreatNewForder(item.Task.user_id, item.Task.drive_id, item.Task.parent_id, item.Task.name)
  
  if (data.error) {
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 503
    item.Info.FailedMessage = data.error
  } else {
    item.Info.UploadState = 'success'
    item.Task.uploaded_file_id = data.file_id 
    item.Task.uploaded_is_rapid = false 
  }
}

async function checkFileSize(item: IUploadingUI) {
  const stat = await fspromises.lstat(item.Task.LocalFilePath).catch((err: any) => {
    if (err.code && err.code === 'EPERM') err = '文件没有读取权限'
    if (err.code && err.code === 'EBUSY') err = '文件被占用或锁定中'
    DebugLog.mSaveDanger('StartUpload失败：' + item.Task.LocalFilePath, err)
    if (err.message) err = err.message
    if (typeof err == 'string' && err.indexOf('EACCES') >= 0) err = '文件没有读取权限'
    return undefined
  })
  if (!stat) {
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 102
    item.Info.FailedMessage = '读取文件失败(已删除/没权限/锁定中)'
    return
  }

  if (item.Task.size != stat.size) {
    
    item.Task.size = stat.size
    item.Info.up_upload_id = ''
  }
  if (item.Task.mtime != stat.mtime.getTime()) {
    
    item.Task.mtime = stat.mtime.getTime()
    item.Info.up_upload_id = ''
  }
}

async function reloadUploadUrl(uploadinfo: IUploadInfo, item: IUploadingUI) {
  
  uploadinfo.part_info_list = []
  
  await AliUpload.UploadFilePartUrl(item.Task.user_id, item.Task.drive_id, item.Info.up_file_id, item.Info.up_upload_id, item.Task.size, uploadinfo).catch(() => {})
  if (uploadinfo.part_info_list.length > 0) {
    await AliUpload.UploadFileListUploadedParts(item.Task.user_id, item.Task.drive_id, item.Info.up_file_id, item.Info.up_upload_id, 0, uploadinfo).catch(() => {})
    if (uploadinfo.errormsg) {
      
      item.Info.up_file_id = ''
      item.Info.up_upload_id = ''
      uploadinfo.part_info_list = []
    } else {
      const part_info_list = uploadinfo.part_info_list
      let isupload = true
      for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
        if (isupload && part_info_list[i].isupload == false) {
          isupload = false 
        }
        if (isupload === false && part_info_list[i].isupload == true) part_info_list[i].isupload = false 
      }
    }
  } else {
    
    item.Info.up_file_id = ''
    item.Info.up_upload_id = ''
    uploadinfo.part_info_list = []
  }
}


async function checkPreHashAndGetPartlist(uploadinfo: IUploadInfo, item: IUploadingUI) {
  let prehash = ''
  let check_name_mode = useSettingStore().downUploadWhatExist
  if (item.Task.size >= 1024000) {
    
    prehash = await AliUploadHash.GetFilePreHash(item.Task.LocalFilePath)
    if (prehash.startsWith('error')) {
      item.Info.UploadState = 'error'
      item.Info.FailedCode = 504
      item.Info.FailedMessage = prehash.substring('error'.length)
      return false 
    } else {
      const Matched = await AliUpload.UploadCreatFileWithPreHash(item.Task.user_id, item.Task.drive_id, item.Task.parent_id, item.Task.name, item.Task.size, prehash, check_name_mode)
      if (!Matched.errormsg) {
        
        item.Info.up_upload_id = Matched.upload_id
        item.Info.up_file_id = Matched.file_id
        uploadinfo.part_info_list = Matched.part_info_list
        uploadinfo.errormsg = ''
        uploadinfo.israpid = false
        return true 
      } else if (Matched.errormsg != 'PreHashMatched') {
        item.Info.UploadState = 'error'
        item.Info.FailedCode = 504
        item.Info.FailedMessage = Matched.errormsg
        return false 
      }
    }
  }

  
  item.Info.UploadState = 'hashing'
  const proof = await AliUploadHash.GetFileHashProof(prehash, uploadinfo.access_token, item)
  item.Info.UploadState = 'running' 
  if (!item.IsRunning) {
    item.Info.UploadState = '已暂停'
    item.Info.FailedCode = 0
    item.Info.FailedMessage = ''
    return false 
  }
  if (proof.sha1 == 'error') {
    
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 503
    item.Info.FailedMessage = '计算sha1出错' + proof.error
    return false 
  }

  const MiaoChuan = await AliUpload.UploadCreatFileWithFolders(item.Task.user_id, item.Task.drive_id, item.Task.parent_id, item.Task.name, item.Task.size, proof.sha1, proof.proof_code, check_name_mode)
  if (MiaoChuan.errormsg != '') {
    item.Info.UploadState = 'error'
    item.Info.FailedCode = 504
    item.Info.FailedMessage = MiaoChuan.errormsg
    return false 
  } else if (MiaoChuan.israpid || MiaoChuan.isexist) {
    item.Info.UploadState = 'success'
    item.Task.uploaded_file_id = MiaoChuan.file_id
    item.Task.uploaded_is_rapid = true
    item.Info.up_file_id = ''
    item.Info.up_upload_id = ''
    return false 
  } else {
    
    item.Info.up_upload_id = MiaoChuan.upload_id
    item.Info.up_file_id = MiaoChuan.file_id
    uploadinfo.part_info_list = MiaoChuan.part_info_list
    uploadinfo.errormsg = ''
    uploadinfo.israpid = false
    return true 
  }
}
