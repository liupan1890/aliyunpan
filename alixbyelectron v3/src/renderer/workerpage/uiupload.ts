import AliFile from '@/aliapi/file'
import AliFileCmd from '@/aliapi/filecmd'
import { IUploadCreat } from '@/aliapi/models'
import AliUpload from '@/aliapi/upload'
import AliUploadDisk from '@/aliapi/uploaddisk'
import AliUploadHash from '@/aliapi/uploadhash'
import DB from '@/setting/db'
import SettingLog from '@/setting/settinglog'
import { humanSize, Sleep, StringsToMap } from '@/store/format'
import { IAriaDownProgress, IStateUploadFile, ITokenInfo } from '@/store/models'

const fspromises = window.require('fs/promises')

const UploadList: IStateUploadFile[] = []
export function UploadEvent() {
  const list: IAriaDownProgress[] = []
  for (let i = 0, maxi = UploadList.length; i < maxi; i++) {
    const item = UploadList[i]
    try {
      if (item.Upload.FailedMessage.startsWith('计算sha1(')) {
        const posnow = AliUploadHash.GetFileHashProofSpeed(item.UploadID)
        let speed = posnow - item.Upload.DownSize
        item.Upload.DownSize = posnow
        if (speed < 0) speed = 0
        list.push({
          gid: item.UploadID,
          status: item.Upload.DownState,
          totalLength: item.Info.size.toString(),
          completedLength: '0',
          downloadSpeed: '0',
          errorCode: item.Upload.FailedCode.toString(),
          errorMessage: item.Upload.FailedMessage + ' ' + humanSize(speed) + '/s'
        })
      } else if (item.Upload.DownState != 'removed') {
        const posnow = AliUploadDisk.GetFileUploadProofSpeed(item.UploadID)
        if (item.Upload.DownState !== 'active') AliUploadDisk.DelFileUploadProofSpeed(item.UploadID)
        let speed = posnow - item.Upload.DownSize
        item.Upload.DownSize = posnow
        if (speed < 0) speed = 0

        list.push({
          gid: item.UploadID,
          status: item.Upload.DownState,
          totalLength: item.Info.size.toString(),
          completedLength: item.Upload.DownSize.toString(),
          downloadSpeed: speed.toString(),
          errorCode: item.Upload.FailedCode.toString(),
          errorMessage: item.Upload.FailedMessage
        })
      }

      if (item.Upload.DownState == 'paused' || item.Upload.DownState == 'removed') {
        UploadList.splice(i, 1)
        i--
        maxi = UploadList.length
        continue
      }
    } catch {}
  }
  window.WinMsgToMain({ cmd: 'MainUploadEvent', list })
}

export function UploadAdd(uploadList: IStateUploadFile[]) {
  for (let i = 0, maxi = uploadList.length; i < maxi; i++) {
    const item = uploadList[i]
    let find = false
    for (let j = 0, maxj = UploadList.length; j < maxj; j++) {
      if (item.UploadID == UploadList[j].UploadID) {
        find = true
        if (item.Upload.DownState != 'active') {
          item.Upload.DownState = 'active'
          StartUpload(item)
        }
        break
      }
    }
    if (find == false) {
      item.Upload.DownState = 'active'
      UploadList.push(item)
      StartUpload(item)
      maxi = uploadList.length
    }
  }
}

export function UploadCmd(uploadAll: boolean, uploadCmd: string, uploadIDList: string[]) {
  const uploadIDListmap = StringsToMap(uploadIDList)
  for (let i = 0, maxi = UploadList.length; i < maxi; i++) {
    const UploadID = UploadList[i].UploadID
    if (uploadAll || uploadIDListmap.has(UploadID)) {
      if (uploadCmd == 'stop') {
        if (UploadList[i].Upload.DownState == 'active') StopUpload(UploadList[i], false)
        else UploadList[i].Upload.DownState = 'paused'
      } else if (uploadCmd == 'delete') {
        if (UploadList[i].Upload.DownState == 'active') StopUpload(UploadList[i], true)
        else UploadList[i].Upload.DownState = 'removed'
      }
    }
  }
}

function StopUpload(item: IStateUploadFile, isdelete: boolean) {
  item.Upload.DownState = 'paused'
  if (isdelete) item.Upload.DownState = 'removed'
}

async function reloadUploadUrl(uploadinfo: IUploadCreat, item: IStateUploadFile, token: ITokenInfo) {
  uploadinfo.file_id = item.Upload.file_id
  uploadinfo.upload_id = item.Upload.upload_id
  uploadinfo.part_info_list = []
  await AliUpload.UploadFilePartUrl(item.Info.user_id, item.Info.drive_id, item.Upload.file_id, item.Upload.upload_id, item.Info.size, uploadinfo).catch(() => {})
  if (uploadinfo.part_info_list.length > 0) {
    await AliUpload.UploadFileListUploadedParts(item.Info.user_id, item.Info.drive_id, item.Upload.file_id, item.Upload.upload_id, 0, uploadinfo).catch(() => {})
    let isupload = true
    const part_info_list = uploadinfo.part_info_list
    for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
      if (isupload && part_info_list[i].isupload == false) {
        isupload = false
      }
      if (isupload === false && part_info_list[i].isupload == true) part_info_list[i].isupload = false
    }
  } else {
    uploadinfo.upload_id = ''
    uploadinfo.file_id = ''
  }
}

async function checkPreHashAndGetPartlist(uploadinfo: IUploadCreat, item: IStateUploadFile, token: ITokenInfo) {
  let PreHashMatched = true
  if (item.Info.size >= 1024000) {
    const prehash = await AliUploadHash.GetFilePreHash(item.Info.localFilePath)
    if (prehash.startsWith('error')) {
      PreHashMatched = false
      item.Upload.DownState = 'error'
      item.Upload.FailedCode = 504
      item.Upload.FailedMessage = prehash.substring('error'.length)
    } else {
      const Matched = await AliUpload.UploadCreatFileWithFolders(item.Info.user_id, item.Info.drive_id, item.Info.parent_id, item.Info.name, item.Info.size, '', '', prehash, false)
      PreHashMatched = Matched.errormsg == 'PreHashMatched'
      if (!Matched.errormsg) {
        item.Upload.upload_id = Matched.upload_id
        item.Upload.file_id = Matched.file_id
        uploadinfo.file_id = Matched.file_id
        uploadinfo.upload_id = Matched.upload_id
        uploadinfo.part_info_list = Matched.part_info_list
        uploadinfo.errormsg = ''
        uploadinfo.israpid = false
        return false
      } else if (Matched.errormsg != 'PreHashMatched') {
        item.Upload.DownState = 'error'
        item.Upload.FailedCode = 504
        item.Upload.FailedMessage = Matched.errormsg
      }
    }
  }
  if (PreHashMatched) {
    if (item.Upload.IsBreakExist) {
      const upinfo = await AliUpload.UploadCreatFileWithFolders(item.Info.user_id, item.Info.drive_id, item.Info.parent_id, item.Info.name, 1, 'DA39A3EE5E6B4B0D3255BFEF95601890AFD80709', '', '', true)
      if (upinfo.isexist) {
        item.Upload.DownState = 'complete'
        return true
      }
    }

    const proof = await AliUploadHash.GetFileHashProof(token.access_token, item)
    if (item.Upload.DownState !== 'active') {
      item.Upload.FailedCode = 0
      item.Upload.FailedMessage = ''
      return true
    }
    if (proof.sha1 == 'error') {
      item.Upload.DownState = 'error'
      item.Upload.FailedCode = 503
      item.Upload.FailedMessage = '计算sha1出错' + proof.proof_code
      return true
    } else {
      const MiaoChuan = await AliUpload.UploadCreatFileWithFolders(item.Info.user_id, item.Info.drive_id, item.Info.parent_id, item.Info.name, item.Info.size, proof.sha1, proof.proof_code, '', false)
      if (MiaoChuan.israpid) {
        item.Upload.DownState = 'complete'
        return true
      } else if (MiaoChuan.errormsg != '') {
        item.Upload.DownState = 'error'
        item.Upload.FailedCode = 504
        item.Upload.FailedMessage = MiaoChuan.errormsg
        return true
      } else {
        item.Upload.upload_id = MiaoChuan.upload_id
        item.Upload.file_id = MiaoChuan.file_id
        uploadinfo.file_id = MiaoChuan.file_id
        uploadinfo.upload_id = MiaoChuan.upload_id
        uploadinfo.part_info_list = MiaoChuan.part_info_list
        uploadinfo.errormsg = ''
        uploadinfo.israpid = false
        return false
      }
    }
  }
  return false
}

let lastDriveID = ''
let lastParentID = ''
let lastParentPath = ''
async function checkPreTimeMatched(item: IStateUploadFile, lastModified: number, token: ITokenInfo) {
  let fullpath = ''
  if (lastDriveID == item.Info.drive_id && lastParentID == item.Info.parent_id) fullpath = lastParentPath
  else {
    if (item.Info.parent_id !== 'root') {
      fullpath = (await AliFile.ApiFileFullPath(item.Info.user_id, item.Info.drive_id, item.Info.parent_id)) || ''
      if (!fullpath) return false
    }
    lastDriveID = item.Info.drive_id
    lastParentID = item.Info.parent_id
    lastParentPath = fullpath
  }

  fullpath = fullpath + '/' + item.Info.name
  let fileinfo = await AliFile.ApiFileInfoByPath(item.Info.user_id, item.Info.drive_id, fullpath)
  if (!fileinfo) return false
  let ctime = new Date(fileinfo.created_at).getTime()
  if (ctime > 0 && ctime > lastModified) {
    item.Upload.DownState = 'complete'
    return true
  }
  return false
}

async function StartUpload(item: IStateUploadFile) {
  const token = await DB.getUser(item.Info.user_id)
  if (!token || token.user_id !== item.Info.user_id) {
    item.Upload.DownState = 'error'
    item.Upload.FailedCode = 401
    item.Upload.FailedMessage = '找不到账号,无法继续'
    return
  }
  const name = item.Info.path ? item.Info.path + '/' + item.Info.name : item.Info.name
  if (item.Info.isDir) {
    const result = await AliFileCmd.ApiCreatNewForder(item.Info.user_id, item.Info.drive_id, item.Info.parent_id, name)
    if (result != undefined && result != 'QuotaExhausted.Drive') {
      if (item.Info.isMiaoChuan == false) window.WinMsgToMain({ cmd: 'MainUploadDir', Info: item.Info, parentid: result })
      await Sleep(300)
      item.Upload.DownState = 'complete'
    } else {
      item.Upload.DownState = 'error'
      item.Upload.FailedCode = 402
      item.Upload.FailedMessage = '创建文件夹失败:' + name
      if (result == 'QuotaExhausted.Drive') item.Upload.FailedMessage = '创建文件夹失败：网盘空间已满'
    }
    return
  }

  if (item.Info.isMiaoChuan) {
    item.Upload.DownState = 'error'
    item.Upload.FailedCode = 402
    item.Upload.FailedMessage = '秒传失败'
    return
  }

  const stat = await fspromises.lstat(item.Info.localFilePath).catch((e: any) => {
    if (e.code && e.code === 'EPERM') e = '文件没有读取权限'
    if (e.code && e.code === 'EBUSY') e = '文件被占用或锁定中'
    if (e.message) e = e.message
    if (typeof e == 'string' && e.indexOf('EACCES') >= 0) e = '文件没有读取权限'
    SettingLog.mSaveLog('danger', 'StartUpload失败：' + item.Info.localFilePath + ' ' + (e || ''))
    return undefined
  })
  if (!stat) {
    item.Upload.DownState = 'error'
    item.Upload.FailedCode = 402
    item.Upload.FailedMessage = '读取文件失败(已删除/没权限/锁定中)'
    return
  }

  if (item.Info.size != stat.size) {
    item.Info.size = stat.size
    item.Info.sizestr = humanSize(stat.size)
    item.Info.sha1 = ''
    item.Upload.upload_id = ''
  }

  const uploadinfo: IUploadCreat = {
    user_id: item.Info.user_id,
    drive_id: item.Info.drive_id,
    isexist: false,
    israpid: false,
    upload_id: '',
    file_id: '',
    part_info_list: [],
    errormsg: ''
  }
  if (item.Upload.upload_id != '' && item.Upload.file_id != '') {
    await reloadUploadUrl(uploadinfo, item, token).catch(() => {})
  }

  if (!uploadinfo.upload_id) {
    const PreHashMatched = await checkPreHashAndGetPartlist(uploadinfo, item, token)
    if (PreHashMatched) return
  }
  if (item.Upload.DownState == 'error') return
  if (uploadinfo.part_info_list.length == 0) {
    item.Upload.DownState = 'error'
    item.Upload.FailedCode = 505
    item.Upload.FailedMessage = '获取上传地址失败1'
    return
  }
  if (uploadinfo.part_info_list.length > 1 && window.WinMsgToMain) window.WinMsgToMain({ cmd: 'MainUploadID', UploadID: item.UploadID, file_id: uploadinfo.file_id, upload_id: uploadinfo.upload_id })

  const UpResult = await AliUploadDisk.UploadOneFile(uploadinfo, item)

  if (UpResult == 'success') item.Upload.DownState = 'complete'
  else if (item.Upload.DownState == 'active') {
    item.Upload.DownState = 'error'
    item.Upload.FailedCode = 505
    item.Upload.FailedMessage = UpResult
  }
}
