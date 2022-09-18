import { useFootStore, useSettingStore } from '../store'
import DBUpload, { IStateUploadTask, IStateUploadInfo, IUploadingUI } from '../utils/dbupload'
import DebugLog from '../utils/debuglog'
import { CheckWindowsBreakPath } from '../utils/filehelper'
import { humanSize, humanTime, humanTimeFM } from '../utils/format'
import message from '../utils/message'
import { ArrayToMap, hashCode } from '../utils/utils'
import useUploadedStore from './uploadedstore'
import useUploadingStore, { IUploadingModel } from './uploadingstore'
const path = window.require('path')
const fspromises = window.require('fs/promises')


let UploadingFileList: IStateUploadTask[] = []

let UploadingInfoList = new Map<string, IStateUploadInfo>()

let UploadingState: { [key: string]: boolean } = {}
let cmdlock = false
let _UploadingState = false
let _UploadingStateOne = false
let _UploadingSendTime = 0

let TOPMAX = 2000

export default class UploadDAL {
  
  static QueryIsUploading() {
    for (let i = 0, maxi = UploadingFileList.length; i < maxi; i++) {
      let item = UploadingFileList[i]
      if (UploadingState[item.UploadID] === true) {
        return true 
      }
    }
    return false
  }

  
  static UploadLocalDir(user_id: string, drive_id: string, parentid: string, localDirPath: string) {
    if (localDirPath.endsWith(path.sep) == false) localDirPath = localDirPath + path.sep
    return fspromises
      .readdir(localDirPath)
      .then((childfiles: any) => {
        for (let i = 0, maxi = childfiles.length; i < maxi; i++) {
          childfiles[i] = localDirPath + childfiles[i]
        }
        return UploadDAL.UploadLocalFiles(user_id, drive_id, parentid, childfiles, false)
      })
      .catch((err: any) => {
        if (err.code && err.code === 'EPERM') {
          err = '没有权限访问文件夹'
          message.error('没有权限,跳过上传文件夹：' + localDirPath)
        }
        DebugLog.mSaveDanger('UploadLocalDir失败：' + localDirPath, err)
        if (err.message) err = err.message
        if (typeof err == 'string' && err.indexOf('EACCES') >= 0) message.error('没有权限,跳过上传文件夹：' + localDirPath)

        return 0
      }) as Promise<number>
  }
  
  static async UploadLocalFiles(user_id: string, drive_id: string, parentid: string, files: string[], tip: boolean) {
    let check_name_mode = ''

    if (!user_id) return 0
    if (files == undefined || files.length == 0) return 0
    let datenow = Date.now()
    let loadingkey = 'adduploading_' + datenow
    if (tip) {
      message.loading('正在保存上传任务', 60, loadingkey)
    }
    let settingStore = useSettingStore()
    const ingoredList = [...settingStore.downIngoredList]

    let addlist: IStateUploadTask[] = []

    let plist: Promise<void>[] = []
    
    let timestr = datenow.toString().substring(2, 12) + '00000000'
    let dirtime = parseInt(timestr) 
    let rantime = parseInt(datenow.toString() + '00000') 
    let filetime = dirtime + 50000000 
    let addall = 0

    const formax = ingoredList.length
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      let filepath = files[i]
      
      if (CheckWindowsBreakPath(filepath)) continue
      const filepathlower = filepath.toLowerCase()
      plist.push(
        fspromises
          .lstat(filepath)
          .then((stat: any) => {
            if (stat.isSymbolicLink()) return 
            let isdir = stat.isDirectory()
            if (isdir == false) {
              if (stat.isFile() == false) return 
              for (let j = 0; j < formax; j++) {
                if (filepathlower.endsWith(ingoredList[j])) return 
              }
            }
            let name = path.basename(filepath)
            // const UploadID = md5Code(drive_id + '_' + parentid + '_' + +filepath) + '_' + (isdir ? 'd' : 'f') + '_' + stat.mtime.getTime().toString(16) + '_' + stat.size.toString(16)

            const UploadID = hashCode(drive_id + '_' + parentid + '_' + filepath) + '_' + (isdir ? 'd' : 'f') + '_' + stat.size.toString(16) + '_' + (rantime++).toString(16)

            addlist.push({
              UploadID: UploadID,
              UploadTime: 0,
              UploadState: TaskState.Waiting,
              check_name_mode: check_name_mode,
              user_id: user_id,
              LocalFilePath: filepath,
              parent_id: parentid,
              drive_id: drive_id,
              name: name,
              mtime: stat.mtime.getTime() ,
              size: stat.size,
              sizestr: humanSize(stat.size),
              IsDir: isdir,
              uploaded_is_rapid: false,
              uploaded_file_id: '',
              Children: [],
              ChildFinishCount: 0,
              ChildTotalCount: 0
            })
          })
          .catch((err: any) => {
            message.error('上传文件出错 ' + filepath, 3, loadingkey)
            if (err.code && err.code === 'EPERM') {
              DebugLog.mSaveDanger('上传文件出错 没有权限访问 ' + filepath)
              return
            }
            if (err.code && err.code === 'EBUSY') {
              DebugLog.mSaveDanger('上传文件出错 文件被占用或锁定中 ' + filepath)
              return
            }
            DebugLog.mSaveDanger('上传文件出错 ' + filepath, err)
          })
      )

      if (plist.length >= 10) {
        await Promise.all(plist).catch(() => {}) 
        plist = []

        if (addlist.length >= 1000) {
          const savefilelist = []
          const savedirlist = []
          for (let i = 0, maxi = addlist.length; i < maxi; i++) {
            const item = addlist[i]

            if (item.IsDir) {
              item.UploadTime = dirtime++
              savedirlist.push(item)
            } else {
              item.UploadTime = filetime++
              savefilelist.push(item)
            }
          }

          addall += addlist.length
          addlist = []
          await DBUpload.saveUploadTaskBatch(savefilelist.concat(savedirlist))
        }
      }
    }
    await Promise.all(plist).catch(() => {})

    const savefilelist = []
    const savedirlist = []
    for (let i = 0, maxi = addlist.length; i < maxi; i++) {
      const item = addlist[i]

      if (item.IsDir) {
        item.UploadTime = dirtime++
        savedirlist.push(item)
      } else {
        item.UploadTime = filetime++
        savefilelist.push(item)
      }
    }

    await DBUpload.saveUploadTaskBatch(savefilelist.concat(savedirlist))
    addall += addlist.length
    UploadDAL.aReloadUploading()
    if (tip) {
      message.success('成功创建 ' + addall.toString() + '个上传任务', 3, loadingkey)
    }
    return addall
  }
  /** 读取上传中（加载全部上传任务，加载前TOPMAX条，最后调用刷新显示）
   * 1.程序启动时调用一次
   * 2.上传中页面刷新按钮点击时调用
   * 3.aReloadUploading 当遇到UploadingFileList.length==0时 会定时调用一下
   * 4.UploadLocalFiles 新增上传任务时（上传新文件时调用）
   * 5.aUploadingDelete 删除上传任务时
   */
  static async aReloadUploading() {
    const uploadingStore = useUploadingStore()
    if (uploadingStore.ListLoading == true) return
    uploadingStore.ListLoading = true
    
    const state = (await DBUpload.getUploadObj('UploadingState')) || {}
    Object.assign(UploadingState, state)
    
    const infolist = await DBUpload.getUploadInfoAll()
    for (let i = 0, maxi = infolist.length; i < maxi; i++) {
      let item = infolist[i] 
      if (UploadingState[item.UploadID] === false) {
        item.UploadState = '已暂停'
      } else {
        item.UploadState = '排队中'
      }
      item.FailedCode = 0
      item.FailedMessage = ''
      item.AutoTryCount = 0
      item.AutoTryTime = 0
      item.Speed = 0
      item.SpeedStr = ''
      if (!UploadingInfoList.has(item.UploadID)) UploadingInfoList.set(item.UploadID, item) 
    }

    
    const filelist = await DBUpload.getUploadTaskByTop(TOPMAX)
    UploadingFileList = filelist

    UploadDAL.UploadingRefresh()
    uploadingStore.ListLoading = false
  }
  /** 刷新显示 （会频繁调用）
   * 1.aReloadUploading
   * 2.UploadingState 开始暂停任务时调用
   * 3.UploadingStateOne
   * 4.aUploadEvent 1秒1次
   */
  static async UploadingRefresh() {
    let uploadingStore = useUploadingStore()
    let dirkey = uploadingStore.ShowDirKey || ''
    let dirname = uploadingStore.ShowDirName || ''

    let showlist: IUploadingModel[] = []
    let footlist: IUploadingModel[] = []
    let now = Date.now() / 1000
    if (dirkey) {
      let isFind = false
      for (let i = 0, maxi = UploadingFileList.length; i < maxi; i++) {
        let item = UploadingFileList[i]
        if (item.UploadID == dirkey) {
          
          isFind = true
          let childlist = item.Children || []
          for (let j = 0, maxj = childlist.length; j < maxj; j++) {
            let itemfile = childlist[j]
            if (itemfile.UploadState == TaskState.Success) continue 
            if (showlist.length > 999) break
            let UploadID = item.UploadID + '_index_' + itemfile.index
            

            let Info = UploadingInfoList.get(UploadID)
            if (!Info) {
              
              Info = {
                UploadID: UploadID,
                UploadState: UploadingState[UploadID] === false ? '已暂停' : '排队中',
                Loaded: 0,
                UploadSize: 0,
                Speed: 0,
                SpeedStr: '',
                Progress: 0,
                StartTime: 0,
                EndTime: 0,
                SpeedAvg: 0,
                UsedTime: 0,
                FailedCode: 0,
                FailedMessage: '',
                AutoTryTime: 0,
                AutoTryCount: 0,
                up_upload_id: '',
                up_file_id: ''
              }
              UploadingInfoList.set(UploadID, Info)
            }

            if (UploadingState[UploadID] === true) {
              
              let iserror = Info.UploadState == 'error'
              let issuccess = Info.UploadState == 'success'
              let isrunning = Info.UploadState == 'running'
              let ishashing = Info.UploadState == 'hashing'

              let lasttime = ((itemfile.size - Info.UploadSize) / (Info.Speed + 1)) % 356400 
              if (lasttime < 1) lasttime = 1

              let UploadState: string = Info.UploadState
              if (isrunning) UploadState = Info.FailedMessage ? Info.FailedMessage : Info.Progress + '% ' + humanTime(lasttime)
              if (ishashing) UploadState = Info.FailedMessage ? Info.FailedMessage : '计算sha1 ' + Info.Progress + '% ' + humanTime(lasttime)
              if (iserror && Info.AutoTryTime > 0) UploadState = '稍后自动重试 ' + humanTimeFM(Info.AutoTryTime / 1000 - now)

              let add = {
                UploadID: UploadID,
                LocalFilePath: path.join(item.LocalFilePath, itemfile.PartName),
                name: itemfile.name,
                sizestr: itemfile.sizestr,
                icon: 'iconwenjian',
                isDir: false,

                UploadState: UploadState,
                SpeedStr: isrunning || ishashing ? Info.SpeedStr : '',
                Progress: issuccess ? 100 : Info.Progress,
                ProgressStr: '',
                ErrorMessage: iserror ? Info.FailedCode + ' ' + Info.FailedMessage : ''
              }
              showlist.push(add)
              if (isrunning && footlist.length < 5) footlist.push(add)
            } else {
              
              let iserror = Info.UploadState == 'error'
              let add: IUploadingModel = {
                UploadID: UploadID,
                LocalFilePath: path.join(item.LocalFilePath, itemfile.PartName),
                name: itemfile.name,
                sizestr: itemfile.sizestr,
                icon: 'iconwenjian',
                isDir: false,

                UploadState: UploadingState[UploadID] === false ? '已暂停' : '排队中',
                SpeedStr: '',
                Progress: Info.Progress,
                ProgressStr: '',
                ErrorMessage: iserror ? Info.FailedCode + ' ' + Info.FailedMessage : ''
              }
              showlist.push(add)
            }
          }
        }
      }
      if (!isFind) {
        
        dirkey = ''
        dirname = ''
      }
    }
    if (!dirkey) {
      
      for (let i = 0, maxi = UploadingFileList.length; i < maxi; i++) {
        let item = UploadingFileList[i]

        let Info = UploadingInfoList.get(item.UploadID)
        if (!Info) {
          
          Info = {
            UploadID: item.UploadID,
            UploadState: UploadingState[item.UploadID] === false ? '已暂停' : '排队中',
            Loaded: 0,
            UploadSize: 0,
            Speed: 0,
            SpeedStr: '',
            Progress: 0,
            StartTime: 0,
            EndTime: 0,
            SpeedAvg: 0,
            UsedTime: 0,
            FailedCode: 0,
            FailedMessage: '',
            AutoTryTime: 0,
            AutoTryCount: 0,
            up_upload_id: '',
            up_file_id: ''
          }
          UploadingInfoList.set(item.UploadID, Info)
        }
        if (showlist.length < 999) {
          
          if (UploadingState[item.UploadID] === true) {
            
            let iserror = Info.UploadState == 'error'
            let issuccess = Info.UploadState == 'success'
            let isrunning = Info.UploadState == 'running'
            let ishashing = Info.UploadState == 'hashing'

            let lasttime = ((item.size - Info.UploadSize) / (Info.Speed + 1)) % 356400 
            if (lasttime < 1) lasttime = 1

            let UploadState: string = Info.UploadState
            if (isrunning) UploadState = Info.FailedMessage ? Info.FailedMessage : Info.Progress + '% ' + humanTime(lasttime)
            if (ishashing) UploadState = Info.FailedMessage ? Info.FailedMessage : '计算sha1 ' + Info.Progress + '% ' + humanTime(lasttime)
            if (iserror && Info.AutoTryTime > 0) UploadState = '稍后自动重试 ' + humanTimeFM(Info.AutoTryTime / 1000 - now)

            let add: IUploadingModel = {
              UploadID: item.UploadID,
              LocalFilePath: item.LocalFilePath,
              name: item.name,
              sizestr: item.sizestr,
              icon: item.IsDir ? 'iconfont iconfile-folder' : 'iconfont iconwenjian',
              isDir: item.IsDir,

              UploadState: UploadState,
              SpeedStr: isrunning || ishashing ? Info.SpeedStr : '',
              Progress: issuccess ? 100 : Info.Progress,
              ProgressStr: item.IsDir ? item.ChildFinishCount + ' / ' + item.ChildTotalCount : '',
              ErrorMessage: iserror ? Info.FailedCode + ' ' + Info.FailedMessage : ''
            }
            showlist.push(add)
            if (isrunning && footlist.length < 5) footlist.push(add)
          } else {
            
            let iserror = Info.UploadState == 'error'
            showlist.push({
              UploadID: item.UploadID,
              LocalFilePath: item.LocalFilePath,
              name: item.name,
              sizestr: item.sizestr,
              icon: item.IsDir ? 'iconfont iconfile-folder' : 'iconfont iconwenjian',
              isDir: item.IsDir,

              UploadState: UploadingState[item.UploadID] === false ? '已暂停' : '排队中',
              SpeedStr: '',
              Progress: Info.Progress,
              ProgressStr: item.IsDir ? item.ChildFinishCount + ' / ' + item.ChildTotalCount : '',
              ErrorMessage: iserror ? Info.FailedCode + ' ' + Info.FailedMessage : ''
            })
          }
        }
      }
    }

    let count = UploadingFileList.length
    if (count == TOPMAX || count == 0) count = await DBUpload.getUploadTaskCount()
    if (showlist.length == 0 && count > 0) {
      setTimeout(() => {
        UploadDAL.aReloadUploading()
      }, 1000)
    }
    uploadingStore.aLoadListData(dirkey, dirname, showlist, count)
    useFootStore().mSaveUploadingList(footlist)
  }

  

  
  static async UploadingState(all: boolean, start: boolean) {
    if (_UploadingState) {
      message.info('上一个操作还在执行中，稍等2秒再点')
      return
    }
    _UploadingState = true
    setTimeout(() => {
      _UploadingState = false
    }, 500)

    console.time('state')

    let IDList: string[] = []
    if (all) {
      IDList = await DBUpload.getUploadTaskAllKeys()
    } else {
      const uploadingStore = useUploadingStore()
      IDList = Array.from(uploadingStore.ListSelected)
    }
    this._UploadingStateByKeys(IDList, start)
    UploadDAL.UploadingRefresh()

    
    if (!start) window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: all, IDList: all ? [] : IDList })

    console.timeEnd('state')
  }
  
  static UploadingStateOne(key: string) {
    if (_UploadingStateOne) {
      message.info('上一个操作还在执行中，稍等2秒再点')
      return
    }
    _UploadingStateOne = true
    setTimeout(() => {
      _UploadingStateOne = false
    }, 500)

    console.time('stateone')

    let tostart = UploadingState[key] === false 
    let IDList: string[] = [key]
    this._UploadingStateByKeys(IDList, tostart)
    
    if (!tostart) window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: false, IDList: IDList })

    UploadDAL.UploadingRefresh()
    console.timeEnd('stateone')
  }

  static _UploadingStateByKeys(IDList: string[], start: boolean) {
    if (start) {
      for (let i = 0, maxi = IDList.length; i < maxi; i++) {
        delete UploadingState[IDList[i]] 
        let Info = UploadingInfoList.get(IDList[i])
        if (Info) {
          Info.UploadState = '排队中'
          Info.FailedCode = 0
          Info.FailedMessage = ''
          Info.AutoTryCount = 0
          Info.AutoTryTime = 0
          Info.Speed = 0
          Info.SpeedStr = ''
        }
      }
    } else {
      for (let i = 0, maxi = IDList.length; i < maxi; i++) {
        UploadingState[IDList[i]] = false 
        let Info = UploadingInfoList.get(IDList[i])
        if (Info) {
          Info.UploadState = '已暂停'
          Info.FailedCode = 0
          Info.FailedMessage = ''
          Info.AutoTryCount = 0
          Info.AutoTryTime = 0
          Info.Speed = 0
          Info.SpeedStr = ''
        }
      }
    }

    DBUpload.saveUploadObj('UploadingState', UploadingState)
  }
  
  static async aUploadingDelete(all: boolean) {
    if (cmdlock) {
      message.info('上一个操作还在执行中，稍等5秒再点')
      return
    }
    cmdlock = true
    console.time('del' + all ? 'all' : 'select')
    if (all) {
      window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: true, IDList: [] })
      await DBUpload.clearUploadTaskAll()
      UploadingState = {}
    } else {
      const uploadingStore = useUploadingStore()
      let keys = Array.from(uploadingStore.ListSelected)
      window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: false, IDList: keys })
      await DBUpload.deleteUploadTaskBatch(keys)
      keys.map((t) => delete UploadingState[t]) 
    }
    await this.aReloadUploading()
    cmdlock = false
    console.timeEnd('del' + all ? 'all' : 'select')
  }
  
  static async aUploadEvent(ReportList: IStateUploadInfo[], ErrorList: IStateUploadInfo[], SuccessList: IStateUploadTask[], RunningKeys: string[], SpeedTotal: string) {
    
    for (let i = 0, maxi = ReportList.length; i < maxi; i++) {
      let item = ReportList[i]
      if (UploadingInfoList.has(item.UploadID)) {
        item.AutoTryCount = UploadingInfoList.get(item.UploadID)!.AutoTryCount
      }
      UploadingInfoList.set(item.UploadID, item)
    }
    
    const time = Date.now() 
    let needsavestate = false
    for (let i = 0, maxi = ErrorList.length; i < maxi; i++) {
      let item = ErrorList[i]
      item.Speed = 0
      item.SpeedStr = ''

      if (item.FailedMessage.indexOf('出错暂停') >= 0) {
        
        item.AutoTryCount = 0
        item.AutoTryTime = 0
        UploadingState[item.UploadID] = false
      } else {
        
        if (UploadingInfoList.has(item.UploadID)) {
          item.AutoTryCount = UploadingInfoList.get(item.UploadID)!.AutoTryCount + 1
        } else item.AutoTryCount = 1

        if (item.AutoTryCount > 20) {
          
          item.AutoTryCount = 0
          item.AutoTryTime = 0
          item.UploadState = '已暂停'
          UploadingState[item.UploadID] = false
          needsavestate = true
        } else {
          
          
          item.AutoTryTime = time + 60 * 1000 * Math.min(item.AutoTryCount, 10)
        }
      }

      UploadingInfoList.set(item.UploadID, item)
    }

    
    if (SuccessList.length > 0) {
      
      let successmap = ArrayToMap('UploadID', SuccessList)
      let newlist: IStateUploadTask[] = []
      for (let i = 0, maxi = UploadingFileList.length; i < maxi; i++) {
        let item = UploadingFileList[i]
        let success = successmap.get(item.UploadID)
        if (success) {
          if (item.IsDir) UploadDAL.UploadLocalDir(item.user_id, item.drive_id, success.uploaded_file_id, item.LocalFilePath)
          UploadingInfoList.delete(item.UploadID)
          delete UploadingState[item.UploadID] 
          needsavestate = true
        } else {
          newlist.push(item)
        }
      }
      UploadingFileList = newlist
      if (useSettingStore().downAutoShutDown == 1) useSettingStore().downAutoShutDown = 2
      this.aReloadUploaded()
    }
    if (needsavestate) DBUpload.saveUploadObj('UploadingState', UploadingState)

    let doc = document.getElementById('footUploadSpeed')
    if (doc) doc.innerHTML = SpeedTotal ? '<span class="footspeedstr">' + SpeedTotal + '</span>' : ''

    
    if (time - _UploadingSendTime > 800) {
      let SendList: IUploadingUI[] = []
      let uploadFileMax = useSettingStore().uploadFileMax
      for (let i = 0, maxi = UploadingFileList.length; i < maxi; i++) {
        if (uploadFileMax <= RunningKeys.length) break 
        let item = UploadingFileList[i]
        if (UploadingState[item.UploadID]) {
          let Info = UploadingInfoList.get(item.UploadID)
          if (!Info) {
            Info = {
              UploadID: item.UploadID,
              UploadState: '排队中',
              Loaded: 0,
              UploadSize: 0,
              Speed: 0,
              SpeedStr: '',
              Progress: 0,
              StartTime: 0,
              EndTime: 0,
              SpeedAvg: 0,
              UsedTime: 0,
              FailedCode: 0,
              FailedMessage: '',
              AutoTryTime: 0,
              AutoTryCount: 0,
              up_upload_id: '',
              up_file_id: ''
            }
            UploadingInfoList.set(item.UploadID, Info)
          }

          if (Info.UploadState == 'error' && Info.AutoTryTime > 0 && Info.AutoTryTime < time) {
            Info.UploadState = '排队中'
            Info.FailedCode = 0
            Info.FailedMessage = ''
            //Info.AutoTryCount = 0
            //Info.AutoTryTime = 0
            Info.Speed = 0
            Info.SpeedStr = ''
          }

          if (Info.UploadState == '排队中') {
            RunningKeys.push(item.UploadID)
            SendList.push({ UploadID: item.UploadID, IsRunning: true, Task: item, Info: Info })
          }
        }
      }
      _UploadingSendTime = time
      if (SendList.length > 0) window.WinMsgToUpload({ cmd: 'UploadAdd', UploadList: SendList })
      UploadDAL.UploadingRefresh()
    }
  }

  

  
  static async aReloadUploaded() {
    const uploadedStore = useUploadedStore()
    if (uploadedStore.ListLoading == true) return
    uploadedStore.ListLoading = true

    const showlist = await DBUpload.getUploadedByTop(5000)
    const count = await DBUpload.getUploadTaskCount()
    uploadedStore.aLoadListData(showlist, count)

    uploadedStore.ListLoading = false
  }

  
  static async aClearUploaded() {
    let max = useSettingStore().debugDownedListMax
    return await DBUpload.deleteUploadedOutCount(max)
  }

  
  static async UploadedDelete(all: boolean) {
    if (cmdlock) {
      message.info('上一个操作还在执行中，稍等5秒再点')
      return
    }
    cmdlock = true
    if (all) {
      await DBUpload.clearUploadedAll()
    } else {
      const uploadedStore = useUploadedStore()
      let keys = Array.from(uploadedStore.ListSelected)
      await DBUpload.deleteUploadedBatch(keys)
    }
    await this.aReloadUploaded()
    cmdlock = false
  }
}
