import useUploadingStore from '../down/uploadingstore'
import { useFootStore, useSettingStore } from '../store'
import { IStateUploadInfo, IStateUploadTask, IStateUploadTaskFile } from '../utils/dbupload'
import { clickWait } from '../utils/debounce'
import DebugLog from '../utils/debuglog'
import { CheckWindowsBreakPath, FileSystemErrorMessage } from '../utils/filehelper'
import { humanSize, humanSizeSpeed } from '../utils/format'
import message from '../utils/message'
import UploadingData from './uploadingdata'
const path = window.require('path')
const fspromises = window.require('fs/promises')

export default class UploadingDAL {
  
  static QueryIsUploading() {
    return UploadingData.QueryIsUploading()
  }


  static async aReloadUploading() {
    const uploadingStore = useUploadingStore()
    if (uploadingStore.ListLoading == true) return
    uploadingStore.ListLoading = true
    UploadingData.ReloadUploading()
    uploadingStore.mShowTask(uploadingStore.showTaskID, uploadingStore.ShowTaskName)
    UploadingDAL.mUploadingRefresh()
    uploadingStore.ListLoading = false
  }

  
  static mUploadingRefresh() {
    const uploadingStore = useUploadingStore()
    let dirKey = uploadingStore.showTaskID || 0
    let dirName = uploadingStore.ShowTaskName || ''
    

    if (dirKey) {
      const data = UploadingData.UploadingShowListDir(dirKey)
      if (data.count > 0) {
        uploadingStore.aLoadListData(dirKey, dirName, data.showList, data.count)
        useFootStore().mSaveUploadingInfo(data.count)
        UploadingData.UploadingShowProgress()
        return
      }
    }
    
    dirKey = 0
    dirName = ''
    const data = UploadingData.UploadingShowList()
    uploadingStore.aLoadListData(dirKey, dirName, data.showList, data.count)
    useFootStore().mSaveUploadingInfo(data.count)
    UploadingData.UploadingShowProgress()
  }

  
  static async aUploadingStart(all: boolean, isToStart: boolean) {
    if (clickWait('aUploadingStart', 500)) return
    const uploadingStore = useUploadingStore()

    if (uploadingStore.showTaskID) {
      let UploadIDList: number[] = all ? [] : Array.from(uploadingStore.ListSelected)
      UploadIDList = await UploadingData.UploadingStartTaskFile(uploadingStore.showTaskID, UploadIDList, isToStart)
      
      if (!isToStart) {
        if (all) {
          window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: false, UploadIDList: [], TaskIDList: [uploadingStore.showTaskID] })
        } else {
          window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: false, UploadIDList: UploadIDList, TaskIDList: [] })
        }
      }
    } else {
      let TaskIDList: number[] = all ? [] : Array.from(uploadingStore.ListSelected)
      TaskIDList = await UploadingData.UploadingStartTask(TaskIDList, isToStart)
      
      if (!isToStart) {
        if (all) {
          window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: true, UploadIDList: [], TaskIDList: [] })
        } else {
          window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: false, UploadIDList: [], TaskIDList: TaskIDList })
        }
      }
    }
    UploadingDAL.mUploadingRefresh()
  }

  
  static async aUploadingStartOne(TaskOrUploadID: number) {
    if (clickWait('aUploadingStartOne', 400)) return
    const uploadingStore = useUploadingStore()
    if (uploadingStore.showTaskID) {
      const isToStart = UploadingData.GetTaskFileIsStop(TaskOrUploadID)
      const UploadIDList: number[] = [TaskOrUploadID]
      await UploadingData.UploadingStartTaskFile(uploadingStore.showTaskID, UploadIDList, isToStart)
      
      if (!isToStart) window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: false, UploadIDList: UploadIDList, TaskIDList: [] })
    } else {
      const isToStart = UploadingData.GetTaskIsStop(TaskOrUploadID)
      const TaskIDList: number[] = [TaskOrUploadID]
      await UploadingData.UploadingStartTask(TaskIDList, isToStart)
      
      if (!isToStart) window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'stop', IsAll: false, UploadIDList: [], TaskIDList: TaskIDList })
    }
    UploadingDAL.mUploadingRefresh()
  }

  
  static async aUploadingDelete(all: boolean) {
    if (clickWait('aUploadingDelete', 500)) return
    const uploadingStore = useUploadingStore()
    if (uploadingStore.showTaskID) {
      let UploadIDList: number[] = all ? [] : Array.from(useUploadingStore().ListSelected)
      UploadIDList = await UploadingData.UploadingDeleteTaskFile(uploadingStore.showTaskID, UploadIDList)
      if (all) {
        window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: false, UploadIDList: [], TaskIDList: [uploadingStore.showTaskID] })
      } else {
        window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: false, UploadIDList: UploadIDList, TaskIDList: [] })
      }
    } else {
      let TaskIDList: number[] = all ? [] : Array.from(useUploadingStore().ListSelected)
      TaskIDList = await UploadingData.UploadingDeleteTask(TaskIDList)
      if (all) {
        window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: true, UploadIDList: [], TaskIDList: [] })
      } else {
        window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: false, UploadIDList: [], TaskIDList: TaskIDList })
      }
    }
    UploadingDAL.mUploadingRefresh()
  }

  
  static mUploadingShowTask(TaskID: number = 0) {
    if (!TaskID) {
      const uploadingStore = useUploadingStore()
      const selectitem = uploadingStore.GetSelectedFirst()
      if (selectitem && selectitem.isDir) TaskID = selectitem.TaskID
    }

    if (TaskID) {
      const task = UploadingData.GetTask(TaskID)
      if (task && task.isDir) {
        useUploadingStore().mShowTask(task.TaskID, task.TaskName)
        UploadingDAL.mUploadingRefresh()
      }
    }
  }

  
  static mUploadingShowTaskBack() {
    useUploadingStore().mShowTask(0, '')
    UploadingDAL.mUploadingRefresh()
  }

  
  static async aUploadingEvent(ReportList: IStateUploadInfo[], ErrorList: IStateUploadInfo[], SuccessList: IStateUploadTaskFile[], RunningKeys: number[], StopKeys: number[], LoadingKeys: number[], SpeedTotal: string) {
    UploadingData.UploadingEventSave(ReportList, ErrorList, SuccessList)

    const check = UploadingData.UploadingEventRunningCheck(RunningKeys, StopKeys)
    if (check.delList.length > 0) {
      
      console.log('UploadingEventRunningCheck', check.delList)
      window.WinMsgToUpload({ cmd: 'UploadCmd', Command: 'delete', IsAll: false, UploadIDList: check.delList, TaskIDList: [] })
    }
    
    const sendList = UploadingData.UploadingEventSendList(check.newList, LoadingKeys)
    if (sendList.length > 0) {
      window.WinMsgToUpload({ cmd: 'UploadAdd', UploadList: sendList })
      if (!SpeedTotal) SpeedTotal = humanSizeSpeed(0)
    }

    const doc = document.getElementById('footUploadSpeed')
    if (doc) doc.innerHTML = SpeedTotal ? '<span class="footspeedstr">' + SpeedTotal + '</span>' : ''

    UploadingDAL.mUploadingRefresh()
  }

  
  static async aUploadingAppendFiles(TaskID: number, UploadID: number, CreatedDirID: string, AppendList: IStateUploadTaskFile[]) {
    await UploadingData.UploadingAppendFilesSave(TaskID, UploadID, CreatedDirID, AppendList)
  }

  
  static async aUploadLocalFiles(user_id: string, drive_id: string, parent_file_id: string, files: string[], check_name_mode: string, tip: boolean) {
    

    if (!user_id) return 0
    if (!files || files.length == 0) return 0
    const dateNow = Date.now()
    const loadingKey = 'adduploading_' + dateNow
    if (tip) {
      message.loading('正在保存上传任务', 60, loadingKey)
    }
    const settingStore = useSettingStore()
    const ingoredList = [...settingStore.downIngoredList]
    const UniqueMap = UploadingData.GetTaskUniqueID()

    let addList: IStateUploadTask[] = []
    let plist: Promise<void>[] = []
    
    const timeStr = dateNow.toString().substring(2, 12) + '00000'
    let tasktime = parseInt(timeStr) 

    let addall = 0

    const formax = ingoredList.length
    for (let i = 0, maxi = files.length; i < maxi; i++) {
      const filePath = files[i]
      
      if (CheckWindowsBreakPath(filePath)) continue

      const filePathLower = filePath.toLowerCase()
      plist.push(
        fspromises
          .lstat(filePath)
          .then((stat: any) => {
            if (stat.isSymbolicLink()) return 
            const isDir = stat.isDirectory()
            if (isDir == false) {
              if (stat.isFile() == false) return 
              for (let j = 0; j < formax; j++) {
                if (filePathLower.endsWith(ingoredList[j])) return 
              }
            }
            let baseName: string = path.basename(filePath)
            const basePath: string = path.dirname(filePath)
            const pathName = baseName
            if (!baseName && basePath.endsWith(':\\')) baseName = basePath.substring(0, basePath.length - 2)

            if (!baseName) {
              message.error('跳过上传任务，无法识别路径：' + filePath)
              DebugLog.mSaveDanger('上传文件出错 无法识别路径 ' + filePath)
              return
            }

            if (UniqueMap.has(parent_file_id + '|' + basePath + '|' + baseName)) {
              message.warning('跳过上传任务，已存在相同的任务：' + filePath)
              return 
            }

            const TaskID = tasktime
            tasktime += 2
            const task: IStateUploadTask = {
              TaskID: TaskID,
              TaskName: baseName,
              TaskFileID: '',
              check_name_mode: check_name_mode,
              user_id: user_id,
              localFilePath: basePath,
              parent_file_id: parent_file_id,
              drive_id: drive_id,
              isDir: isDir,
              Children: [],
              ChildFinishCount: 0,
              ChildTotalCount: 0,
              ChildTotalSize: 0,
              ChildFinishSize: 0
            }

            task.ChildTotalCount = isDir ? 0 : 1
            task.ChildTotalSize = isDir ? 0 : stat.size
            task.Children.push({
              TaskID: TaskID,
              UploadID: TaskID + 1,
              partPath: pathName,
              name: baseName,
              size: stat.size,
              sizeStr: isDir ? '' : humanSize(stat.size),
              mtime: stat.mtime.getTime() ,
              isDir: isDir,
              IsRoot: true,
              uploaded_is_rapid: false,
              uploaded_file_id: ''
            } as IStateUploadTaskFile)

            addList.push(task)
          })
          .catch((err: any) => {
            err = FileSystemErrorMessage(err.code, err.message)
            message.error('上传文件出错 ' + err + ' ' + filePath, 3, loadingKey)
            DebugLog.mSaveDanger('上传文件出错 ' + err + ' ' + filePath)
          })
      )

      if (plist.length >= 10) {
        await Promise.all(plist).catch(() => {}) 
        plist = []
        if (addList.length >= 1000) {
          await UploadingData.UploadingAddTask(addList)
          addall += addList.length
          addList = []
        }
      }
    }
    await Promise.all(plist).catch(() => {})
    await UploadingData.UploadingAddTask(addList)
    addall += addList.length
    addList = []
    UploadingDAL.mUploadingRefresh()
    if (tip) {
      message.success('成功创建 ' + addall.toString() + '个上传任务', 3, loadingKey)
    }
    return addall
  }
}
