import { IUploadingModel } from '../down/uploadingstore'
import PanDAL from '../pan/pandal'
import { useSettingStore } from '../store'
import UploadDAL from './uploaddal'
import DBUpload, { IStateUploadInfo, IStateUploadTask, IStateUploadTaskFile, IUploadingUI } from '../utils/dbupload'
import { humanSize, humanSizeSpeed, humanTime, humanTimeFM } from '../utils/format'
import { MapValueToArray } from '../utils/utils'
import { throttle } from '../utils/debounce'
import { SetProgressBar } from '../utils/electronhelper'
const path = window.require('path')

const UploadingTaskList = new Map<number, IStateUploadTask>()


const UploadingInfoList = new Map<number, IStateUploadInfo>()

let UploadingTaskStop = new Set<number>()
let UploadingInfoStop = new Set<number>()
let _UploadingSendTime = 0

function SaveStopToDB() {
  return DBUpload.saveUploadObj('UploadingStop', { TaskIDList: Array.from(UploadingTaskStop), UploadIDList: Array.from(UploadingInfoStop) })
}

const SaveTaskList = new Map<number, IStateUploadTask>()
const SaveTaskToDB = throttle(() => {
  if (SaveTaskList.size > 0) {
    const list = MapValueToArray(SaveTaskList)
    DBUpload.saveUploadTaskBatch(list)
  }
}, 10000)

export default class UploadingData {
  
  static QueryIsUploading(): boolean {
    const keys = UploadingTaskList.keys()
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      const TaskID = keys.next().value as number
      if (UploadingTaskStop.has(TaskID) == false) return true
    }
    return false
  }

  
  static GetTaskUniqueID(): Set<string> {
    const map = new Set<string>()
    const values = UploadingTaskList.values()
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      const task = values.next().value as IStateUploadTask
      map.add(task.parent_file_id + '|' + task.localFilePath + '|' + task.TaskName)
    }
    return map
  }

  static GetTaskIsStop(TaskID: number): boolean {
    return UploadingTaskStop.has(TaskID)
  }

  static GetTaskFileIsStop(UploadID: number): boolean {
    return UploadingInfoStop.has(UploadID)
  }

  static GetTask(TaskID: number): IStateUploadTask | undefined {
    return UploadingTaskList.get(TaskID)
  }

  static GetTaskFile(TaskID: number, UploadID: number): IStateUploadTaskFile | undefined {
    const task = UploadingTaskList.get(TaskID)
    if (task) {
      const childrenList = task.Children
      for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
        if (childrenList[i].UploadID == UploadID) return childrenList[i]
      }
    }
    return undefined
  }

  static GetTaskFileInfo(UploadID: number): IStateUploadInfo | undefined {
    return UploadingInfoList.get(UploadID)
  }

  
  static StartTask(TaskID: number, isToStart: boolean): boolean {
    const task = UploadingTaskList.get(TaskID)
    if (!task) return false

    
    if (isToStart) UploadingTaskStop.delete(TaskID)
    else UploadingTaskStop.add(TaskID)

    
    const childrenList = task.Children
    for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
      const UploadID = childrenList[i].UploadID
      if (isToStart) {
        UploadingInfoStop.delete(UploadID)
      } else {
        UploadingInfoStop.add(UploadID)
      }
      
      const info = UploadingInfoList.get(UploadID)
      if (info) {
        info.uploadState = isToStart ? '排队中' : '已暂停'
        info.failedCode = 0
        info.failedMessage = ''
        info.autoTryCount = 0
        info.autoTryTime = 0
        info.Speed = 0
        info.speedStr = ''
      }
    }
    return true
  }

  
  static StartTaskFile(TaskID: number, UploadID: number, isToStart: boolean): boolean {
    const task = UploadingTaskList.get(TaskID)
    if (!task) return false

    
    if (isToStart) UploadingInfoStop.delete(UploadID)
    else UploadingInfoStop.add(UploadID)

    
    if (isToStart) UploadingTaskStop.delete(TaskID)
    else {
      
      const childrenList = task.Children
      for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
        if (UploadingInfoStop.has(childrenList[i].UploadID) == false) {
          
          UploadingTaskStop.delete(TaskID)
          return true
        }
      }
      
      UploadingTaskStop.add(TaskID)
    }

    
    const info = UploadingInfoList.get(UploadID)
    if (info) {
      info.uploadState = isToStart ? '排队中' : '已暂停'
      info.failedCode = 0
      info.failedMessage = ''
      info.autoTryCount = 0
      info.autoTryTime = 0
      info.Speed = 0
      info.speedStr = ''
    }
    return true
  }


  static async ReloadUploading(): Promise<void> {
    const stop = (await DBUpload.getUploadObj('UploadingStop')) as { TaskIDList: number[]; UploadIDList: number[] } | undefined
    UploadingTaskStop = new Set<number>(stop?.TaskIDList || [])
    UploadingInfoStop = new Set<number>(stop?.UploadIDList || [])

    UploadingTaskList.clear()
    let delTaskList: number[] = []
    const fileList = await DBUpload.getUploadTaskAll()
    const fileMap = new Set<number>()
    for (let i = 0, maxi = fileList.length; i < maxi; i++) {
      const item = fileList[i]
      if (item.Children.length == 0) {
        delTaskList.push(item.TaskID)
      } else {
        UploadingTaskList.set(item.TaskID, item)
        item.Children.map((t) => fileMap.add(t.UploadID))
      }
    }
    
    if (delTaskList.length > 0) await DBUpload.deleteUploadTaskBatch(delTaskList)

    const downAutoStart = useSettingStore().downAutoStart
    const infoList = await DBUpload.getUploadInfoAll()

    UploadingInfoList.clear()

    if (UploadingTaskList.size == 0) {
      DBUpload.clearUploadTaskAll()
      UploadingTaskStop.clear()
      UploadingInfoStop.clear()
    } else {
      const delInfoList: number[] = []
      for (let i = 0, maxi = infoList.length; i < maxi; i++) {
        const item = infoList[i] 

        if (fileMap.has(item.UploadID)) {
          
          if (downAutoStart && UploadingInfoStop.has(item.UploadID) == false) {
            item.uploadState = '排队中' 
          } else {
            item.uploadState = '已暂停' 
          }
          item.failedCode = 0
          item.failedMessage = ''
          item.autoTryCount = 0
          item.autoTryTime = 0
          item.Speed = 0
          item.speedStr = ''
          UploadingInfoList.set(item.UploadID, item)
        } else {
          delInfoList.push(item.UploadID)
          UploadingInfoStop.delete(item.UploadID)
        }
      }
      
      if (delInfoList.length > 0) DBUpload.deleteUploadInfoBatch(delInfoList)
    }
  }

  
  static UploadingShowList(): { showList: IUploadingModel[]; count: number } {
    const showList: IUploadingModel[] = []
    const now = Date.now() / 1000
    const values = UploadingTaskList.values()
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      const task = values.next().value as IStateUploadTask
      if (!task.isDir) {
        
        if (task.Children.length == 1) {
          const item = UploadingData.UploadingShowOneItem(task.Children[0], now, task.localFilePath, task.TaskID, true)
          showList.push(item)
        }
      } else {
        
        let isRunning = 0
        let isError = 0
        let speed = 0
        let childFinishSize = task.ChildFinishSize
        const isStop = UploadingTaskStop.has(task.TaskID)
        if (!isStop) {
          const childrenList = task.Children
          for (let j = 0, maxj = childrenList.length; j < maxj; j++) {
            const item = childrenList[j]
            const info = UploadingInfoList.get(item.UploadID)
            if (info) {
              if (info.uploadState == 'error') isError++
              // else if (info.uploadState == '排队中') iswaiting++
              else if (info.uploadState == 'running') {
                isRunning++
                speed += info.Speed
              } else if (info.uploadState == '读取中') isRunning++
              else if (info.uploadState == 'hashing') isRunning++

              childFinishSize += info.uploadSize
            }
          }
        }

        showList.push({
          UploadID: task.TaskID,
          TaskID: task.TaskID,
          localFilePath: path.join(task.localFilePath, task.localFilePath.endsWith(':\\') ? '' : task.TaskName) ,
          name: task.TaskName,
          sizeStr: humanSize(task.ChildTotalSize),
          icon: 'iconfont iconfile-folder',
          isDir: task.isDir,
          uploadState: isStop ? '暂停中' : isRunning ? '上传中' : '排队中',
          speedStr: isRunning ? humanSizeSpeed(speed) : '' ,
          Progress: Math.floor((childFinishSize * 100) / (task.ChildTotalSize + 1)) % 100,
          ProgressStr: task.ChildFinishCount + ' / ' + task.ChildTotalCount,
          errorMessage: isError > 0 ? '有错误点击查看' : '' 
        } as IUploadingModel)
      }

      if (showList.length > 999) break
    }
    return { showList: showList, count: UploadingTaskList.size }
  }

  static UploadingShowOneItem(item: IStateUploadTaskFile, now: number, localFilePath: string, TaskID: number, isShowTask: boolean): IUploadingModel {
    const info = UploadingInfoList.get(item.UploadID)
    if (info && !UploadingInfoStop.has(item.UploadID)) {
      
      const isError = info.uploadState == 'error'
      const isSuccess = info.uploadState == 'success'
      const isRunning = info.uploadState == 'running'
      const isLoading = info.uploadState == '读取中'
      const isHashing = info.uploadState == 'hashing'

      const lastTime = Math.max(1, Math.min((item.size - info.uploadSize) / (info.Speed + 1), 356400)) 

      let uploadState: string = info.uploadState
      if (isRunning) uploadState = info.failedMessage ? info.failedMessage : info.Progress + '% ' + humanTime(lastTime)
      if (isLoading) uploadState = info.failedMessage ? info.failedMessage : '读取中'
      if (isHashing) uploadState = info.failedMessage ? info.failedMessage : '计算sha1 ' + info.Progress + '% ' + humanTime(lastTime)
      if (isError && info.autoTryTime > 0) uploadState = '稍后自动重试 ' + humanTimeFM(info.autoTryTime / 1000 - now)

      return {
        UploadID: isShowTask ? TaskID : item.UploadID,
        TaskID: TaskID,
        localFilePath: path.join(localFilePath, item.partPath) ,
        name: item.partPath || item.name,
        sizeStr: item.sizeStr,
        icon: item.isDir ? 'iconfont iconfile-folder' : 'iconfont iconwenjian',
        isDir: item.isDir,
        uploadState: uploadState,
        speedStr: isRunning || isHashing ? info.speedStr : '' ,
        Progress: isSuccess ? 100 : info.Progress,
        ProgressStr: '',
        errorMessage: isError ? info.failedCode + ' ' + info.failedMessage : '' 
      }
    } else {
      
      const isError = info && info.uploadState == 'error'
      return {
        UploadID: isShowTask ? TaskID : item.UploadID,
        TaskID: TaskID,
        localFilePath: path.join(localFilePath, item.partPath),
        name: item.partPath || item.name,
        sizeStr: item.sizeStr,
        icon: item.isDir ? 'iconfont iconfile-folder' : 'iconfont iconwenjian',
        isDir: item.isDir,
        uploadState: UploadingTaskStop.has(item.TaskID) || UploadingInfoStop.has(item.UploadID) ? '已暂停' : '排队中',
        speedStr: '',
        Progress: info ? info.Progress : 0,
        ProgressStr: '',
        errorMessage: isError ? info!.failedCode + ' ' + info!.failedMessage : ''
      }
    }
  }

  
  static UploadingShowListDir(showTaskID: number): { showList: IUploadingModel[]; count: number } {
    const showList: IUploadingModel[] = []
    const now = Date.now() / 1000

    const task = UploadingTaskList.get(showTaskID) 
    if (!task) return { showList: [], count: 0 } 

    const childrenList = task.Children
    for (let j = 0, maxj = childrenList.length; j < maxj; j++) {
      const item = childrenList[j]
      
      showList.push(UploadingData.UploadingShowOneItem(item, now, task.localFilePath, task.TaskID, false))
      if (showList.length > 999) break
    }
    return { showList: showList, count: task.Children.length }
  }

  
  static UploadingShowProgress(): void {
    let progress = -1
    let isRunning = false
    let finishSize = 0
    let totalSize = 0

    const values2 = UploadingInfoList.values()
    for (let i = 0, maxi = UploadingInfoList.size; i < maxi; i++) {
      const info = values2.next().value as IStateUploadInfo
      finishSize += info.uploadSize
      if (!isRunning && !UploadingInfoStop.has(info.UploadID)) isRunning = true
    }

    const values = UploadingTaskList.values()
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      const task = values.next().value as IStateUploadTask
      if (task.isDir) finishSize += task.ChildFinishSize
      totalSize += task.ChildTotalSize
      if (!isRunning && !UploadingTaskStop.has(task.TaskID)) isRunning = true
    }

    if (isRunning) {
      
      progress = Math.floor((finishSize / (totalSize + 1)) * 100) / 100
    }
    SetProgressBar(progress, 'upload')
  }

  static async UploadingAddTask(taskList: IStateUploadTask[]): Promise<void> {
    taskList.map((t) => UploadingTaskList.set(t.TaskID, t))
    await DBUpload.saveUploadTaskBatch(taskList)
  }

  
  static async UploadingStartTask(TaskIDList: number[], isToStart: boolean): Promise<number[]> {
    const IDList: number[] = []
    const map = new Set(TaskIDList)
    const values = UploadingTaskList.values()
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      const task = values.next().value as IStateUploadTask
      if (map.size == 0 || map.has(task.TaskID)) {
        IDList.push(task.TaskID)
        UploadingData.StartTask(task.TaskID, isToStart)
      }
    }
    SaveStopToDB()
    return IDList
  }

  
  static async UploadingStartTaskFile(TaskID: number, UploadIDList: number[], isToStart: boolean): Promise<number[]> {
    const IDList: number[] = []
    const map = new Set(UploadIDList)
    const task = UploadingTaskList.get(TaskID)
    if (task) {
      const childrenList = task.Children
      for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
        const fileItem = childrenList[i]
        if (map.size == 0 || map.has(fileItem.UploadID)) {
          IDList.push(fileItem.UploadID)
          
          if (isToStart) UploadingInfoStop.delete(fileItem.UploadID)
          else UploadingInfoStop.add(fileItem.UploadID)
          
          const info = UploadingInfoList.get(fileItem.UploadID)
          if (info) {
            info.uploadState = isToStart ? '排队中' : '已暂停'
            info.failedCode = 0
            info.failedMessage = ''
            info.autoTryCount = 0
            info.autoTryTime = 0
            info.Speed = 0
            info.speedStr = ''
          }
        }
      }

      
      if (isToStart) {
        UploadingTaskStop.delete(TaskID)
      } else {
        
        for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
          if (UploadingInfoStop.has(childrenList[i].UploadID) == false) {
            
            UploadingTaskStop.delete(TaskID)
            await DBUpload.saveUploadObj('UploadingStop', { TaskIDList: Array.from(UploadingTaskStop), UploadIDList: Array.from(UploadingInfoStop) })
            return IDList
          }
        }
        
        UploadingTaskStop.add(TaskID)
      }
    }

    SaveStopToDB()
    return IDList
  }

  
  static async UploadingDeleteTask(TaskIDList: number[]): Promise<number[]> {
    const IDList: number[] = []
    const map = new Set(TaskIDList)
    const values = UploadingTaskList.values()
    
    const delInfoList: number[] = []
    const delTaskList: number[] = []
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      const task = values.next().value as IStateUploadTask
      const TaskID = task.TaskID
      if (map.size == 0 || map.has(TaskID)) {
        IDList.push(TaskID)
        const childrenList = task.Children
        for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
          
          const UploadID = childrenList[i].UploadID
          UploadingInfoList.delete(UploadID)
          if (childrenList[i].isDir == false && childrenList[i].size > 3 * 1024 * 1024) delInfoList.push(UploadID)
          UploadingInfoStop.delete(UploadID)
        }

        UploadingTaskList.delete(TaskID)
        SaveTaskList.delete(TaskID) 
        delTaskList.push(TaskID)
        UploadingTaskStop.delete(TaskID)
      }
    }

    await DBUpload.deleteUploadInfoBatch(delInfoList)
    await DBUpload.deleteUploadTaskBatch(delTaskList)
    return IDList
  }

  
  static async UploadingDeleteTaskFile(TaskID: number, UploadIDList: number[]): Promise<number[]> {
    const IDList: number[] = []
    const map = new Set(UploadIDList)
    const task = UploadingTaskList.get(TaskID)
    if (task) {
      const newChildren: IStateUploadTaskFile[] = []
      const delInfoList: number[] = []
      const childrenList = task.Children
      for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
        const fileItem = childrenList[i]
        if (map.size == 0 || map.has(fileItem.UploadID)) {
          IDList.push(fileItem.UploadID)
          delInfoList.push(fileItem.UploadID)
          UploadingInfoList.delete(fileItem.UploadID)
          if (fileItem.isDir == false && fileItem.size > 3 * 1024 * 1024) delInfoList.push(fileItem.UploadID)
          UploadingInfoStop.delete(fileItem.UploadID)
        } else {
          newChildren.push(fileItem) 
        }
      }

      if (newChildren.length == 0) {
        
        UploadingTaskList.delete(TaskID)
        SaveTaskList.delete(TaskID) 
        UploadingTaskStop.delete(TaskID)
        await DBUpload.deleteUploadTask(TaskID)
      } else if (delInfoList.length > 0) {
        
        task.Children = newChildren
        await DBUpload.saveUploadTask(task)
      }
      if (delInfoList.length > 0) await DBUpload.deleteUploadInfoBatch(delInfoList)
    }
    return IDList
  }

  
  static async UploadingEventSave(ReportList: IStateUploadInfo[], ErrorList: IStateUploadInfo[], SuccessList: IStateUploadTaskFile[]): Promise<void> {
    
    for (let i = 0, maxi = ReportList.length; i < maxi; i++) {
      const item = ReportList[i]
      item.autoTryCount = UploadingInfoList.get(item.UploadID)?.autoTryCount || 0 
      UploadingInfoList.set(item.UploadID, item)
    }
    
    const time = Date.now() 
    for (let i = 0, maxi = ErrorList.length; i < maxi; i++) {
      const item = ErrorList[i]
      item.Speed = 0
      item.speedStr = ''

      if (item.failedMessage.indexOf('出错暂停') >= 0 || item.failedMessage.indexOf('读取文件失败') >= 0 || item.failedMessage.indexOf('没有权限') >= 0 || item.failedMessage.indexOf('不存在') >= 0 || item.failedMessage.indexOf('跳过') >= 0) {
        
        item.autoTryCount = 0
        item.autoTryTime = 0
        item.uploadState = 'error'
        UploadingInfoStop.add(item.UploadID)
      } else {
        
        if (UploadingInfoList.has(item.UploadID)) {
          item.autoTryCount = UploadingInfoList.get(item.UploadID)!.autoTryCount + 1
        } else {
          item.autoTryCount = 1
        }

        if (item.autoTryCount > 20) {
          
          item.autoTryCount = 0
          item.autoTryTime = 0
          item.uploadState = '已暂停'
          UploadingInfoStop.add(item.UploadID)
        } else {
          
          
          item.autoTryTime = time + 60 * 1000 * Math.min(item.autoTryCount, 10)
        }
      }

      UploadingInfoList.set(item.UploadID, item)
    }

    
    if (SuccessList.length > 0) {
      
      const delInfoList: number[] = []
      
      let saveTaskList: number[] = []

      
      const delTaskList: number[] = []
      const saveUploadedList: IStateUploadTask[] = []
      
      for (let i = 0, maxi = SuccessList.length; i < maxi; i++) {
        const fileItem = SuccessList[i]
        const TaskID = fileItem.TaskID
        const task = UploadingTaskList.get(TaskID)
        if (task) {
          if (!task.isDir && fileItem.uploaded_file_id) {
            
            task.TaskFileID = fileItem.uploaded_file_id
            if (!saveTaskList.includes(TaskID)) saveTaskList.push(TaskID)
          }
          
          let index = -1
          for (let j = 0, maxj = task.Children.length; j < maxj; j++) {
            const itemFile = task.Children[j]
            if (itemFile.UploadID == fileItem.UploadID) {
              index = j
              break
            }
          }
          if (index >= 0) {
            
            task.Children.splice(index, 1)
            if (!fileItem.isDir) {
              task.ChildFinishCount += 1
              task.ChildFinishSize += fileItem.size
            }
            if (!saveTaskList.includes(TaskID)) saveTaskList.push(TaskID)
            if (task.Children.length == 0) {
              UploadingTaskList.delete(TaskID)
              SaveTaskList.delete(TaskID) 
              delTaskList.push(TaskID)
              UploadingTaskStop.delete(TaskID)
              saveUploadedList.push(task)
              
              PanDAL.aReLoadOneDirToRefreshTree(task.user_id, task.drive_id, task.parent_file_id)
            }
            
            UploadingInfoList.delete(fileItem.UploadID)
            if (fileItem.isDir == false && fileItem.size > 3 * 1024 * 1024) delInfoList.push(fileItem.UploadID)
            UploadingInfoStop.delete(fileItem.UploadID)
          }
        }
      }
      if (delInfoList.length > 0) await DBUpload.deleteUploadInfoBatch(delInfoList)
      saveTaskList = saveTaskList.filter((t) => !delTaskList.concat(t)) 

      for (let k = 0, maxk = saveTaskList.length; k < maxk; k++) {
        const kitem = UploadingTaskList.get(saveTaskList[k])
        if (kitem) SaveTaskList.set(kitem.TaskID, kitem)
      }
      if (SaveTaskList.size > 0) SaveTaskToDB()

      if (delTaskList.length > 0) await DBUpload.deleteUploadTaskBatch(delTaskList)
      if (saveUploadedList.length > 0) {
        await DBUpload.saveUploadedBatch(saveUploadedList)
        UploadDAL.aReloadUploaded()
      }
      if (useSettingStore().downAutoShutDown == 1) useSettingStore().downAutoShutDown = 2
    }
  }

  
  static UploadingEventRunningCheck(RunningKeys: number[], StopKeys: number[]): { delList: number[]; newList: number[] } {
    
    let fixStop = 0
    for (let i = 0, maxi = StopKeys.length; i < maxi; i++) {
      if (UploadingInfoStop.has(StopKeys[i]) == false) {
        UploadingInfoStop.add(StopKeys[i])
        fixStop++
      }
      const item = UploadingInfoList.get(StopKeys[i])
      if (item && item.uploadState != '已暂停') {
        item.uploadState = '已暂停'
      }
    }
    if (fixStop > 0) SaveStopToDB()

    const delList: number[] = []
    const newList: number[] = []
    for (let i = 0, maxi = RunningKeys.length; i < maxi; i++) {
      if (UploadingInfoStop.has(RunningKeys[i])) delList.push(RunningKeys[i]) 
      else newList.push(RunningKeys[i])
    }
    return { delList: delList, newList: newList }
  }

  
  static UploadingEventSendList(RunningKeys: number[], LoadingKeys: number[]): IUploadingUI[] {
    let sendList: IUploadingUI[] = []
    const time = Date.now() 
    
    if (time - _UploadingSendTime > 800) {
      _UploadingSendTime = time
      const settingStore = useSettingStore()
      const uploadFileMax = settingStore.uploadFileMax
      if (settingStore.downSmallFileFirst) sendList = UploadingData._GetSendList(RunningKeys, LoadingKeys, time, uploadFileMax, true)
      sendList = sendList.length > 0 ? sendList.concat(UploadingData._GetSendList(RunningKeys, LoadingKeys, time, uploadFileMax, false)) : UploadingData._GetSendList(RunningKeys, LoadingKeys, time, uploadFileMax, false)
    }
    return sendList
  }

  private static _GetSendList(RunningKeys: number[], LoadingKeys: number[], time: number, uploadFileMax: number, downSmallFileFirst: boolean): IUploadingUI[] {
    const sendList: IUploadingUI[] = []
    const values = UploadingTaskList.values()
    for (let i = 0, maxi = UploadingTaskList.size; i < maxi; i++) {
      if (RunningKeys.length >= uploadFileMax) break 

      const task = values.next().value as IStateUploadTask
      if (UploadingTaskStop.has(task.TaskID)) continue 
      const childrenList = task.Children
      let dirCount = 0
      let fileCount = 0
      for (let j = 0, maxj = childrenList.length; j < maxj; j++) {
        const fileItem = childrenList[j]
        if (UploadingInfoStop.has(fileItem.UploadID)) continue 
        if (fileItem.isDir) {
          dirCount++ 
        } else if (RunningKeys.length >= uploadFileMax) {
          fileCount++ 
        } else {
          let info = UploadingInfoList.get(fileItem.UploadID)
          if (!info) {
            info = {
              UploadID: fileItem.UploadID,
              uploadState: '排队中',
              uploadSize: 0,
              fileSize: fileItem.isDir ? 0 : fileItem.size,
              Speed: 0,
              speedStr: '',
              Progress: 0,
              failedCode: 0,
              failedMessage: '',
              autoTryTime: 0,
              autoTryCount: 0,
              up_upload_id: '',
              up_file_id: ''
            }
            UploadingInfoList.set(fileItem.UploadID, info)
          }

          
          if (info.uploadState == 'error' && info.autoTryTime > 0 && info.autoTryTime < time) {
            info.uploadState = '排队中'
            info.failedCode = 0
            info.failedMessage = ''
            info.Speed = 0
            info.speedStr = ''
          }

          if (info.uploadState == '排队中' && (downSmallFileFirst == false || fileItem.size < 100 * 1024 * 1024)) {
            RunningKeys.push(fileItem.UploadID)
            info.uploadState = 'running'
            sendList.push({ IsRunning: true, TaskID: task.TaskID, UploadID: fileItem.UploadID, user_id: task.user_id, parent_file_id: task.parent_file_id, drive_id: task.drive_id, check_name_mode: task.check_name_mode, localFilePath: task.localFilePath, File: fileItem, Info: info } as IUploadingUI)
          }
        }
      }

      if (LoadingKeys.length < 2 && dirCount > 0 && fileCount < 2000 && downSmallFileFirst == false) {
        
        for (let j = 0, maxj = childrenList.length; j < maxj; j++) {
          const fileItem = childrenList[j]
          if (UploadingInfoStop.has(fileItem.UploadID)) continue
          if (fileItem.isDir) {
            let info = UploadingInfoList.get(fileItem.UploadID)
            if (!info) {
              info = {
                UploadID: fileItem.UploadID,
                uploadState: '排队中',
                uploadSize: 0,
                fileSize: fileItem.isDir ? 0 : fileItem.size,
                Speed: 0,
                speedStr: '',
                Progress: 0,
                failedCode: 0,
                failedMessage: '',
                autoTryTime: 0,
                autoTryCount: 0,
                up_upload_id: '',
                up_file_id: ''
              }
              UploadingInfoList.set(fileItem.UploadID, info)
            }

            
            if (info.uploadState == 'error' && info.autoTryTime > 0 && info.autoTryTime < time) {
              info.uploadState = '排队中'
              info.failedCode = 0
              info.failedMessage = ''
              info.Speed = 0
              info.speedStr = ''
            }

            if (info.uploadState == '排队中') {
              RunningKeys.push(fileItem.UploadID)
              info.uploadState = 'running'
              sendList.push({
                IsRunning: true,
                TaskID: task.TaskID,
                UploadID: fileItem.UploadID,
                user_id: task.user_id,
                parent_file_id: task.parent_file_id,
                drive_id: task.drive_id,
                check_name_mode: task.check_name_mode,
                localFilePath: task.localFilePath,
                File: fileItem,
                Info: info
              } as IUploadingUI)
              break 
            }
          }
        }
      }
    }
    return sendList
  }

  
  static async UploadingAppendFilesSave(TaskID: number, UploadID: number, CreatedDirID: string, AppendList: IStateUploadTaskFile[]): Promise<void> {
    const task = UploadingTaskList.get(TaskID)
    if (task) {
      if (CreatedDirID) task.TaskFileID = CreatedDirID
      
      const childrenList = task.Children
      const fileList: IStateUploadTaskFile[] = []
      const dirList: IStateUploadTaskFile[] = []
      for (let i = 0, maxi = childrenList.length; i < maxi; i++) {
        const itemFile = childrenList[i]
        if (itemFile.UploadID == UploadID) continue 
        if (itemFile.isDir) dirList.push(itemFile)
        else fileList.push(itemFile)
      }

      UploadingInfoList.delete(UploadID)
      UploadingInfoStop.delete(UploadID)

      let fileCount = 0
      let fileSize = 0
      for (let i = 0, maxi = AppendList.length; i < maxi; i++) {
        const item = AppendList[i]
        if (!item.isDir) {
          fileCount++
          fileSize += item.size
        }
        fileList.push(item)
      }
      fileList.push(...dirList) 

      task.ChildTotalCount += fileCount
      task.ChildTotalSize += fileSize
      task.Children = fileList

      if (task.Children.length == 0) {
        UploadingTaskList.delete(TaskID)
        SaveTaskList.delete(TaskID) 
        await DBUpload.deleteUploadTask(TaskID)
        UploadingTaskStop.delete(TaskID)
        await DBUpload.saveUploadedBatch([task])
        UploadDAL.aReloadUploaded()
        
        PanDAL.aReLoadOneDirToRefreshTree(task.user_id, task.drive_id, task.parent_file_id)
      } else {
        
        SaveTaskList.set(task.TaskID, task)
        SaveTaskToDB()
      }
    }
  }
}
