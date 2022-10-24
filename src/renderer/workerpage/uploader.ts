import { Dirent, Stats } from 'fs'
import AliFileCmd from '../aliapi/filecmd'
import { IUploadInfo } from '../aliapi/models'
import AliUpload from '../aliapi/upload'
import AliUploadDisk from '../aliapi/uploaddisk'
import AliUploadHashPool from '../aliapi/uploadhashpool'
import { useSettingStore } from '../store'
import UserDAL from '../user/userdal'
import { IStateUploadInfo, IStateUploadTaskFile, IUploadingUI } from '../utils/dbupload'
import DebugLog from '../utils/debuglog'
import { CheckWindowsBreakPath, FileSystemErrorMessage } from '../utils/filehelper'
import { humanSize, Sleep } from '../utils/format'
import { RuningList } from './uiupload'
const path = window.require('path')
const fspromises = window.require('fs/promises')

export async function StartUpload(fileui: IUploadingUI): Promise<void> {
  
  const token = await UserDAL.GetUserTokenFromDB(fileui.user_id)
  if (!token || token.user_id !== fileui.user_id) {
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 402
    fileui.Info.failedMessage = '找不到账号,无法继续'
    return
  }
  const expire_time = new Date(token.expire_time).getTime()
  
  if (expire_time - new Date().getTime() < 60000) {
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 402
    fileui.Info.failedMessage = 'token过期失效,无法继续'
    return
  }

  
  if (fileui.File.isDir) return creatDirAndReadChildren(fileui)

  
  await checkFileSize(fileui)

  const uploadInfo: IUploadInfo = {
    token_type: token.token_type,
    access_token: token.access_token,
    sha1: '',
    isexist: false,
    israpid: false,
    part_info_list: []
  }

  if (fileui.Info.up_upload_id != '' && fileui.Info.up_file_id != '') {
    
    let isok = await reloadUploadUrl(uploadInfo, fileui)
    if (isok == 'neterror') {
      Sleep(8000)
      isok = await reloadUploadUrl(uploadInfo, fileui)
    }
    if (isok == 'neterror') {
      Sleep(8000)
      isok = await reloadUploadUrl(uploadInfo, fileui)
    }
    if (isok == 'neterror') {
      fileui.Info.uploadState = 'error'
      fileui.Info.failedCode = 705
      fileui.Info.failedMessage = '网络连接失败'
      return
    }
    if (isok == 'codeerror') {
      fileui.Info.uploadState = 'error'
      fileui.Info.failedCode = 706
      fileui.Info.failedMessage = '程序运行出错'
      return
    }

    if (isok == 'error') {
      
      fileui.Info.up_file_id = ''
      fileui.Info.up_upload_id = ''
      uploadInfo.part_info_list = []
    }
  }

  if (!fileui.Info.up_upload_id) {
    
    const needupload = await checkPreHashAndGetPartlist(uploadInfo, fileui)
    if (!needupload) return
  }

  if (useSettingStore().downUploadBreakFile) {
    
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 505
    fileui.Info.failedMessage = '跳过不能秒传的文件'
    return
  }

  
  if (fileui.Info.uploadState == 'error') return

  if (uploadInfo.part_info_list.length == 0) {
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 505
    fileui.Info.failedMessage = '获取上传地址失败1'
    return
  }

  
  const uploadResult = await AliUploadDisk.UploadOneFile(uploadInfo, fileui)

  
  if (uploadResult == 'success') {
    fileui.Info.uploadState = 'success'
  } else if (!fileui.IsRunning) {
    console.log('已暂停', fileui.Info.uploadState, fileui.Info)
    fileui.Info.uploadState = '已暂停'
  } else if (fileui.Info.uploadState == 'running') {
    console.log(fileui.Info.uploadState, fileui.Info)
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 505
    fileui.Info.failedMessage = uploadResult
  } else {
    console.log(fileui.Info.uploadState, fileui.Info)
    
  }
}

interface ReadConfig {
  TaskID: number
  user_id: string
  drive_id: string
  parent_file_id: string
  localFilePath: string
  filetime: number
  ingoredList: string[]
}

async function creatDirAndReadChildren(fileui: IUploadingUI): Promise<void> {
  fileui.Info.uploadState = '读取中'

  let uploaded_file_id = ''
  if (fileui.File.IsRoot) {
    
    
    const data = await AliFileCmd.ApiCreatNewForder(fileui.user_id, fileui.drive_id, fileui.parent_file_id, fileui.File.name)
    if (data.error) {
      fileui.Info.uploadState = 'error'
      fileui.Info.failedCode = 503
      fileui.Info.failedMessage = data.error
      return 
    }
    uploaded_file_id = data.file_id
  }
  
  let childList: IStateUploadTaskFile[] = []
  const settingStore = useSettingStore()
  const timeStr = Date.now().toString().substring(5, 13) + '00000'
  const fileTime = parseInt(timeStr) 
  const readConfig: ReadConfig = { TaskID: fileui.TaskID, user_id: fileui.user_id, drive_id: fileui.drive_id, parent_file_id: fileui.parent_file_id, localFilePath: fileui.localFilePath, filetime: fileTime, ingoredList: [...settingStore.downIngoredList] }
  const read = await readChildren(fileui.File.partPath, fileui.File.name, readConfig, fileui.Info)
  if (read.error) {
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 703
    fileui.Info.failedMessage = read.error
    return 
  }

  childList = read.fileList
  if (read.dirList.length > 0) childList.push(...read.dirList)
  
  window.WinMsgToMain({
    cmd: 'MainUploadAppendFiles',
    TaskID: fileui.TaskID,
    UploadID: fileui.UploadID,
    AppendList: childList,
    CreatedDirID: uploaded_file_id
  })

  RuningList.delete(fileui.UploadID) 
}

async function readChildren(parentDirPartPath: string, parentDirName: string, readConfig: ReadConfig, Info: IStateUploadInfo) {
  const localDirPath = path.join(readConfig.localFilePath, parentDirPartPath, path.sep)
  const files = await readDir(localDirPath, readConfig.ingoredList)
  if (files.error) return { error: files.error, fileList: [] as IStateUploadTaskFile[], dirList: [] as IStateUploadTaskFile[] } 

  const addFileList: IStateUploadTaskFile[] = []
  const addDirList: IStateUploadTaskFile[] = []

  
  await AddFiles(addFileList, files.fileList, parentDirPartPath, parentDirName, readConfig)
  Info.failedMessage = '读取中 ' + addFileList.length + '个'
  
  await AddDirs(addFileList, addDirList, files.dirList, parentDirPartPath, parentDirName, readConfig, Info)

  
  return { error: '', fileList: addFileList, dirList: addDirList }
}

async function AddFiles(addFileList: IStateUploadTaskFile[], fileList: string[], parentDirPartPath: string, parentDirName: string, readConfig: ReadConfig): Promise<void> {
  const localDirPath = path.join(readConfig.localFilePath, parentDirPartPath, path.sep)
  let plist: Promise<void>[] = []
  for (let i = 0, maxi = fileList.length; i < maxi; i++) {
    const fileName = fileList[i]
    const filePath = localDirPath + fileName

    plist.push(
      fspromises
        .lstat(filePath)
        .then((stat: Stats) => {
          return stat
        })
        .catch((err: any) => {
          err = FileSystemErrorMessage(err.code, err.message)
          DebugLog.mSaveDanger('上传文件出错 ' + err + ' ' + filePath)
          return undefined
        })
        .then((stat: Stats | undefined) => {
          readConfig.filetime += 1
          const fileItem: IStateUploadTaskFile = {
            TaskID: readConfig.TaskID,
            UploadID: readConfig.filetime,
            partPath: path.join(parentDirPartPath, fileName),
            name: parentDirName + '/' + fileName,
            size: stat ? stat.size : 1,
            sizeStr: humanSize(stat ? stat.size : 1),
            mtime: stat ? stat.mtime.getTime() : 0 ,
            isDir: false,
            IsRoot: false,
            uploaded_is_rapid: false,
            uploaded_file_id: ''
          }
          addFileList.push(fileItem)
        })
    )

    if (plist.length >= 10) {
      await Promise.all(plist).catch(() => {}) 
      plist = []
    }
  }
  if (plist.length > 0) await Promise.all(plist).catch(() => {})
}

async function AddDirs(addFileList: IStateUploadTaskFile[], addDirList: IStateUploadTaskFile[], dirList: string[], parentDirPartPath: string, parentDirName: string, readConfig: ReadConfig, Info: IStateUploadInfo): Promise<void> {
  const plist: Promise<{ file_id: string; error: string }>[] = []
  for (let i = 0, maxi = dirList.length; i < maxi; i++) {
    const dirName = dirList[i]
    readConfig.filetime += 1
    const dirItem: IStateUploadTaskFile = {
      TaskID: readConfig.TaskID,
      UploadID: readConfig.filetime,
      partPath: path.join(parentDirPartPath, dirName),
      name: parentDirName + '/' + dirName,
      size: 0,
      sizeStr: humanSize(0),
      mtime: 0 ,
      isDir: true,
      IsRoot: false,
      uploaded_is_rapid: false,
      uploaded_file_id: ''
    }
    await readChildrenDiGui(addFileList, addDirList, dirItem, readConfig, Info, plist)
    Info.failedMessage = '读取中 ' + addFileList.length + '个'
    if (plist.length >= 10) {
      await Promise.all(plist).catch(() => {}) 
      plist.splice(0, plist.length)
    }
  }
  if (plist.length > 0) await Promise.all(plist).catch(() => {})
}

const MAXFILE = 20
const MAXDIR = 20
async function readChildrenDiGui(addFileList: IStateUploadTaskFile[], addDirList: IStateUploadTaskFile[], diritem: IStateUploadTaskFile, readConfig: ReadConfig, Info: IStateUploadInfo, plist: Promise<{ file_id: string; error: string }>[]): Promise<void> {


  const localDirPath = path.join(readConfig.localFilePath, diritem.partPath, path.sep)
  const dirFiles = await readDir(localDirPath, readConfig.ingoredList)
  if (dirFiles.error) {
    plist.push(AliFileCmd.ApiCreatNewForder(readConfig.user_id, readConfig.drive_id, readConfig.parent_file_id, diritem.name))
    addDirList.push(diritem)
    return
  }

  if (dirFiles.fileList.length == 0) {
    if (dirFiles.dirList.length == 0) {
      plist.push(AliFileCmd.ApiCreatNewForder(readConfig.user_id, readConfig.drive_id, readConfig.parent_file_id, diritem.name))
      return
    } else if (dirFiles.dirList.length <= MAXDIR) {
      await AddDirs(addFileList, addDirList, dirFiles.dirList, diritem.partPath, diritem.name, readConfig, Info)
      return
    } else {
      addDirList.push(diritem)
      return
    }
  }

  if (dirFiles.fileList.length == 1) {
    if (dirFiles.dirList.length == 0) {
      await AddFiles(addFileList, dirFiles.fileList, diritem.partPath, diritem.name, readConfig)
      return
    } else if (dirFiles.dirList.length <= MAXDIR) {
      await AddFiles(addFileList, dirFiles.fileList, diritem.partPath, diritem.name, readConfig)
      await AddDirs(addFileList, addDirList, dirFiles.dirList, diritem.partPath, diritem.name, readConfig, Info)
      return
    } else {
      addDirList.push(diritem)
      return
    }
  }

  if (dirFiles.fileList.length <= MAXFILE) {
    if (dirFiles.dirList.length == 0) {
      plist.push(AliFileCmd.ApiCreatNewForder(readConfig.user_id, readConfig.drive_id, readConfig.parent_file_id, diritem.name))
      await AddFiles(addFileList, dirFiles.fileList, diritem.partPath, diritem.name, readConfig)
    } else if (dirFiles.dirList.length <= MAXDIR) {
      plist.push(AliFileCmd.ApiCreatNewForder(readConfig.user_id, readConfig.drive_id, readConfig.parent_file_id, diritem.name))
      await AddFiles(addFileList, dirFiles.fileList, diritem.partPath, diritem.name, readConfig)
      await AddDirs(addFileList, addDirList, dirFiles.dirList, diritem.partPath, diritem.name, readConfig, Info)
    } else {
      plist.push(AliFileCmd.ApiCreatNewForder(readConfig.user_id, readConfig.drive_id, readConfig.parent_file_id, diritem.name))
      addDirList.push(diritem)
    }
  } else {
    if (dirFiles.dirList.length == 0) {
      plist.push(AliFileCmd.ApiCreatNewForder(readConfig.user_id, readConfig.drive_id, readConfig.parent_file_id, diritem.name))
      addDirList.push(diritem)
    } else if (dirFiles.dirList.length <= MAXDIR) {
      addDirList.push(diritem)
    } else {
      addDirList.push(diritem)
    }
  }
}

async function readDir(fullDirPath: string, ingoredList: string[]): Promise<{ error: string; fileList: string[]; dirList: string[] }> {
  let errorMessage = ''
  const fileList: string[] = []
  const dirList: string[] = []

  await fspromises
    .readdir(fullDirPath, { withFileTypes: true })
    .then((files: Dirent[]) => {
      for (let i = 0, maxi = files.length; i < maxi; i++) {
        const stat = files[i]
        if (stat.isSymbolicLink()) continue 
        if (CheckWindowsBreakPath(stat.name)) continue
        if (stat.isDirectory()) dirList.push(stat.name)
        else if (stat.isFile()) {
          const filePathLower = stat.name.toLowerCase()
          let ingored = false
          for (let j = 0, maxj = ingoredList.length; j < maxj; j++) {
            if (filePathLower.endsWith(ingoredList[j])) {
              ingored = true
              break
            } 
          }
          if (!ingored) fileList.push(stat.name)
        }
      }
    })
    .catch((err: any) => {
      err = FileSystemErrorMessage(err.code, err.message)
      DebugLog.mSaveDanger('UploadLocalDir失败：' + fullDirPath, err)
      errorMessage = err
    })

  return { error: errorMessage, fileList, dirList }
}

async function checkFileSize(fileui: IUploadingUI): Promise<void> {
  let errorMessage = ''
  const stat = await fspromises.lstat(path.join(fileui.localFilePath, fileui.File.partPath)).catch((err: any) => {
    err = FileSystemErrorMessage(err.code, err.message)
    DebugLog.mSaveDanger('StartUpload失败：' + path.join(fileui.localFilePath, fileui.File.partPath), err)
    errorMessage = err
    return undefined
  })
  if (!stat) {
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 102
    fileui.Info.failedMessage = errorMessage
    return
  }

  if (fileui.File.size != stat.size) {
    
    fileui.File.size = stat.size
    fileui.Info.up_upload_id = ''
    fileui.Info.up_file_id = ''
  }
  if (fileui.File.mtime != stat.mtime.getTime()) {
    
    fileui.File.mtime = stat.mtime.getTime()
    fileui.Info.up_upload_id = ''
    fileui.Info.up_file_id = ''
  }
}


async function reloadUploadUrl(uploadInfo: IUploadInfo, fileui: IUploadingUI): Promise<'success' | 'error' | 'neterror' | 'codeerror'> {
  
  uploadInfo.part_info_list = []
  
  let isOk = await AliUpload.UploadFilePartUrl(fileui.user_id, fileui.drive_id, fileui.Info.up_file_id, fileui.Info.up_upload_id, fileui.File.size, uploadInfo).catch(() => {})
  if (isOk != 'success') return isOk || 'codeerror'
  if (uploadInfo.part_info_list.length > 0) {
    isOk = await AliUpload.UploadFileListUploadedParts(fileui.user_id, fileui.drive_id, fileui.Info.up_file_id, fileui.Info.up_upload_id, 0, uploadInfo).catch(() => {})
    if (isOk == 'success') {
      const part_info_list = uploadInfo.part_info_list
      let isUpload = true
      for (let i = 0, maxi = part_info_list.length; i < maxi; i++) {
        if (isUpload && part_info_list[i].isupload == false) {
          isUpload = false 
        }
        if (isUpload === false && part_info_list[i].isupload == true) part_info_list[i].isupload = false 
      }
      return 'success'
    } else if (isOk == 'error') {
      
      fileui.Info.up_file_id = ''
      fileui.Info.up_upload_id = ''
      uploadInfo.part_info_list = []
      return 'success'
    } else return isOk || 'codeerror' 
  } else {
    return 'error'
  }
}


async function checkPreHashAndGetPartlist(uploadInfo: IUploadInfo, fileui: IUploadingUI): Promise<boolean> {
  let prehash = ''
  if (fileui.File.size >= 1024000) {
    
    prehash = await AliUploadHashPool.GetFilePreHash(path.join(fileui.localFilePath, fileui.File.partPath))
    if (prehash.startsWith('error')) {
      fileui.Info.uploadState = 'error'
      fileui.Info.failedCode = 504
      fileui.Info.failedMessage = prehash.substring('error'.length)
      return false 
    } else {
      const matched = await AliUpload.UploadCreatFileWithPreHash(fileui.user_id, fileui.drive_id, fileui.parent_file_id, fileui.File.name, fileui.File.size, prehash, fileui.check_name_mode)
      if (!matched.errormsg) {
        
        fileui.Info.up_upload_id = matched.upload_id
        fileui.Info.up_file_id = matched.file_id
        uploadInfo.part_info_list = matched.part_info_list
        uploadInfo.israpid = false
        return true 
      } else if (matched.errormsg != 'PreHashMatched') {
        fileui.Info.uploadState = 'error'
        fileui.Info.failedCode = 504
        fileui.Info.failedMessage = matched.errormsg
        return false 
      }
    }
  }

  
  fileui.Info.uploadState = 'hashing'
  const proof = await AliUploadHashPool.GetFileHashProofWorker(prehash, uploadInfo.access_token, fileui)
  fileui.Info.uploadState = 'running' 
  if (!fileui.IsRunning) {
    fileui.Info.uploadState = '已暂停'
    fileui.Info.failedCode = 0
    fileui.Info.failedMessage = ''
    return false 
  }
  if (proof.sha1 == 'error') {
    
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 503
    fileui.Info.failedMessage = '计算sha1出错' + proof.error
    return false 
  }

  uploadInfo.sha1 = proof.sha1

  const miaoChuan = await AliUpload.UploadCreatFileWithFolders(fileui.user_id, fileui.drive_id, fileui.parent_file_id, fileui.File.name, fileui.File.size, proof.sha1, proof.proof_code, fileui.check_name_mode)
  if (miaoChuan.errormsg != '') {
    fileui.Info.uploadState = 'error'
    fileui.Info.failedCode = 504
    fileui.Info.failedMessage = miaoChuan.errormsg
    return false 
  } else if (miaoChuan.israpid || miaoChuan.isexist) {
    fileui.Info.uploadState = 'success'
    fileui.File.uploaded_file_id = miaoChuan.file_id
    fileui.File.uploaded_is_rapid = true
    fileui.Info.up_file_id = ''
    fileui.Info.up_upload_id = ''
    return false 
  } else {
    
    fileui.Info.up_upload_id = miaoChuan.upload_id
    fileui.Info.up_file_id = miaoChuan.file_id
    uploadInfo.part_info_list = miaoChuan.part_info_list
    uploadInfo.israpid = false
    return true 
  }
}
