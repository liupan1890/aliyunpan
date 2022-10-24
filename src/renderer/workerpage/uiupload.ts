import AliUploadDisk from '../aliapi/uploaddisk'
import DBUpload, { IStateUploadInfo, IUploadingUI, IStateUploadTaskFile } from '../utils/dbupload'
import { humanSizeSpeed } from '../utils/format'
import { ArrayKeyList } from '../utils/utils'
import { StartUpload } from './uploader'
import { useSettingStore } from '../store'
import AliUploadHashPool from '../aliapi/uploadhashpool'


export const RuningList: Map<number, IUploadingUI> = new Map()


export async function UploadCmd(Command: string, IsAll: boolean, UploadIDList: number[], TaskIDList: number[]): Promise<void> {
  if (UploadIDList.length > 0) {
    const map = new Set(UploadIDList)
    if (Command == 'stop' || Command == 'delete') {
      const keys = RuningList.values()
      for (let i = 0, maxi = RuningList.size; i < maxi; i++) {
        const item = keys.next().value as IUploadingUI
        
        if (map.has(item.UploadID)) item.IsRunning = false
      }
    }
  }

  if (TaskIDList.length > 0) {
    const map = new Set(TaskIDList)
    if (Command == 'stop' || Command == 'delete') {
      const keys = RuningList.values()
      for (let i = 0, maxi = RuningList.size; i < maxi; i++) {
        const item = keys.next().value as IUploadingUI
        
        if (map.has(item.TaskID)) item.IsRunning = false
      }
    }
  }

  if (IsAll) {
    if (Command == 'stop' || Command == 'delete') {
      const keys = RuningList.values()
      for (let i = 0, maxi = RuningList.size; i < maxi; i++) {
        const item = keys.next().value as IUploadingUI
        
        item.IsRunning = false
      }
    }
  }
}


export function UploadAdd(UploadList: IUploadingUI[]) {
  for (let i = 0, maxi = UploadList.length; i < maxi; i++) {
    const item = UploadList[i]
    
    item.IsRunning = true
    item.Info.uploadState = 'running'
    item.Info.autoTryCount = 0
    item.Info.autoTryTime = 0
    item.Info.failedCode = 0
    item.Info.failedMessage = ''
    item.Info.Speed = 0
    item.Info.speedStr = ''
    // item.Info.Loaded = 0
    // item.Info.uploadSize = 0
    if (RuningList.has(item.UploadID)) {
      
    } else {
      
      RuningList.set(item.UploadID, item)
      StartUpload(item)
    }
  }
}

let saveTime = 0


export async function UploadReport(): Promise<void> {
  const settingStore = useSettingStore()
  if (settingStore.uploadGlobalSpeed) {
    let speedLimte = 0
    if (settingStore.uploadGlobalSpeedM == 'MB') speedLimte = settingStore.uploadGlobalSpeed * 1024 * 1024
    else speedLimte = settingStore.uploadGlobalSpeed * 1024
    window.speedLimte = speedLimte
  } else window.speedLimte = Number.MAX_VALUE

  
  const saveList: IStateUploadInfo[] = []
  const reportList: IStateUploadInfo[] = []
  const successList: IStateUploadTaskFile[] = []
  const errorList: IStateUploadInfo[] = []
  const runingList: IStateUploadInfo[] = []
  const stopList: IStateUploadInfo[] = []
  const loadingList: IStateUploadInfo[] = []

  const keys = RuningList.values()
  for (let i = 0, maxi = RuningList.size; i < maxi; i++) {
    const item = keys.next().value as IUploadingUI
    const uploadState = item.Info.uploadState
    // "hashing" | "running" | "已暂停" | "success" | "error" (排队中 状态不可能出现)
    if (item.IsRunning == false || uploadState == '已暂停') {
      
      stopList.push(item.Info)
      AliUploadDisk.DelFileUploadSpeed(item.UploadID)
    } else if (uploadState == 'success') {
      
      successList.push(item.File)
    } else if (uploadState == 'error') {
      
      errorList.push(item.Info)
    } else if (uploadState == 'hashing') {
      
      const posNow = AliUploadHashPool.GetFileHashProofSpeed(item.UploadID)
      let speed = posNow - item.Info.uploadSize
      item.Info.uploadSize = posNow
      item.Info.Progress = Math.floor((posNow * 100) / (item.File.size + 1)) % 100
      if (speed < 0) speed = 0
      item.Info.Speed = speed
      item.Info.speedStr = humanSizeSpeed(speed)
      reportList.push(item.Info)
      runingList.push(item.Info)
    } else if (uploadState == 'running') {
      
      const posNow = AliUploadDisk.GetFileUploadSpeed(item.UploadID)
      let speed = posNow - item.Info.uploadSize
      item.Info.uploadSize = posNow
      item.Info.Progress = Math.floor((posNow * 100) / (item.File.size + 1)) % 100
      if (speed < 0) speed = 0
      item.Info.Speed = speed
      item.Info.speedStr = humanSizeSpeed(speed)
      reportList.push(item.Info)
      runingList.push(item.Info)
      if (item.File.isDir == false && item.File.size > 3 * 1024 * 1024) saveList.push(item.Info)
    } else if (uploadState == '读取中') {
      item.Info.uploadSize = 0
      item.Info.Progress = 0
      item.Info.Speed = 0
      item.Info.speedStr = humanSizeSpeed(0)
      reportList.push(item.Info)
      runingList.push(item.Info)
      loadingList.push(item.Info)
    }
  }

  
  if (stopList.length > 0) stopList.map((t) => RuningList.delete(t.UploadID))
  if (successList.length > 0) successList.map((t) => RuningList.delete(t.UploadID))
  if (errorList.length > 0) errorList.map((t) => RuningList.delete(t.UploadID))

  saveTime++
  if (saveTime > 10) {
    
    saveTime = 0
    if (saveList.length > 0) await DBUpload.saveUploadInfoBatch(saveList)
  }

  const uploadSpeedTotal = AliUploadDisk.GetFileUploadSpeedTotal()
  
  window.WinMsgToMain({
    cmd: 'MainUploadEvent',
    ReportList: reportList,
    ErrorList: errorList,
    SuccessList: successList,
    RunningKeys: ArrayKeyList<number>('UploadID', runingList),
    StopKeys: ArrayKeyList<number>('UploadID', stopList),
    LoadingKeys: ArrayKeyList<number>('UploadID', loadingList),
    SpeedTotal: runingList.length > 0 ? humanSizeSpeed(uploadSpeedTotal) : ''
  })
}
