import AliUploadDisk from '../aliapi/uploaddisk'
import AliUploadHash from '../aliapi/uploadhash'
import DBUpload, { IStateUploadTask, IStateUploadInfo, IUploadingUI } from '../utils/dbupload'
import { humanSizeSpeed, Sleep } from '../utils/format'
import { ArrayKeyList } from '../utils/utils'
import { randomInt } from 'crypto'
import { StartUpload } from './uploader'


export const RuningList: Map<string, IUploadingUI> = new Map()


export async function UploadCmd(Command: string, IsAll: boolean, IDList: string[]) {
  let map = new Set(IDList)
  if (Command == 'stop' || Command == 'delete') {
    let keys = RuningList.values()
    for (let i = 0, maxi = RuningList.size; i < maxi; i++) {
      let item = keys.next().value as IUploadingUI
      
      if (IsAll || map.has(item.UploadID)) item.IsRunning = false
    }
  }
}


export function UploadAdd(UploadList: IUploadingUI[]) {
  for (let i = 0, maxi = UploadList.length; i < maxi; i++) {
    let item = UploadList[i]
    
    item.IsRunning = true
    item.Info.UploadState = 'running'
    item.Info.AutoTryCount = 0
    item.Info.AutoTryTime = 0
    item.Info.FailedCode = 0
    item.Info.FailedMessage = ''
    item.Info.Speed = 0
    item.Info.SpeedStr = ''
    //item.Info.Loaded = 0
    //item.Info.UploadSize = 0
    if (RuningList.has(item.UploadID)) {
      
    } else {
      
      RuningList.set(item.UploadID, item)
      StartUpload(item)
    }
  }
}

let saveTime = 0


export async function UploadReport() {
  
  let reportlist: IStateUploadInfo[] = []
  let successlist: IStateUploadTask[] = []
  let errorlist: IStateUploadInfo[] = []
  let runinglist: IStateUploadInfo[] = []
  let stoplist: IStateUploadInfo[] = []

  let keys = RuningList.values()
  for (let i = 0, maxi = RuningList.size; i < maxi; i++) {
    let item = keys.next().value as IUploadingUI
    let UploadState = item.Info.UploadState
    // "hashing" | "running" | "已暂停" | "success" | "error" (排队中 状态不可能出现)
    if (UploadState == 'hashing') {
      
      const posnow = AliUploadHash.GetFileHashProofSpeed(item.UploadID)
      let speed = posnow - item.Info.UploadSize
      item.Info.UploadSize = posnow
      item.Info.Progress = Math.floor((posnow * 100) / (item.Task.size + 1)) % 100
      if (speed < 0) speed = 0
      item.Info.Speed = speed
      item.Info.SpeedStr = humanSizeSpeed(speed)
      reportlist.push(item.Info)
      runinglist.push(item.Info)
    } else if (UploadState == 'running') {
      
      const posnow = AliUploadDisk.GetFileUploadSpeed(item.UploadID)
      let speed = posnow - item.Info.UploadSize
      item.Info.UploadSize = posnow
      item.Info.Progress = Math.floor((posnow * 100) / (item.Task.size + 1)) % 100
      if (speed < 0) speed = 0
      item.Info.Speed = speed
      item.Info.SpeedStr = humanSizeSpeed(speed)
      reportlist.push(item.Info)
      runinglist.push(item.Info)
    } else if (UploadState == '已暂停') {
      
      stoplist.push(item.Info)
      AliUploadDisk.DelFileUploadSpeed(item.UploadID)
    } else if (UploadState == 'success') {
      
      item.Task.UploadTime = Date.now()
      successlist.push(item.Task)
    } else if (UploadState == 'error') {
      
      errorlist.push(item.Info)
    }
  }

  let statelist: IStateUploadInfo[] = []
  if (stoplist.length > 0) {
    statelist = statelist.concat(stoplist)
    stoplist.map((t) => RuningList.delete(t.UploadID))
  }
  if (successlist.length > 0) {
    await DBUpload.saveUploadedBatch(successlist)
    successlist.map((t) => RuningList.delete(t.UploadID))
  }
  if (errorlist.length > 0) {
    statelist = statelist.concat(errorlist)
    errorlist.map((t) => RuningList.delete(t.UploadID))
  }
  
  saveTime++
  if (saveTime > 10) {
    
    saveTime = 0
    statelist = statelist.concat(runinglist)
  }
  if (statelist.length > 0) await DBUpload.saveUploadInfoBatch(statelist)
  let UploadSpeedTotal = AliUploadDisk.GetFileUploadSpeedTotal() + runinglist.length + successlist.length
  
  window.WinMsgToMain({
    cmd: 'MainUploadEvent',
    ReportList: reportlist,
    ErrorList: errorlist,
    SuccessList: successlist,
    RunningKeys: ArrayKeyList('UploadID', runinglist),
    SpeedTotal: UploadSpeedTotal > 0 ? humanSizeSpeed(UploadSpeedTotal) : ''
  })
}

async function TestUpload(item: IUploadingUI) {
  let max = 5

  for (let i = 0; i < max; i++) {
    //await Sleep(1000)
  }

  max = 1000
  for (let i = 0; i < max; i++) {
    if (item.IsRunning == false) {
      item.Info.UploadState = '已暂停'
      break 
    }
    let downsize = randomInt(1, Math.floor(item.Task.size / max))
    item.Info.Loaded += downsize
    item.Info.UploadSize += downsize
    item.Info.Speed = downsize
    item.Info.SpeedStr = humanSizeSpeed(downsize)
    item.Info.Progress = Math.min(100, Math.floor((item.Info.UploadSize * 100) / (item.Task.size + 1)))
    item.Info.UsedTime++

    await Sleep(500)

    if (item.Task.LocalFilePath.endsWith('10.txt') && item.Info.UploadSize > item.Task.size) {
      item.Info.UploadState = 'error'
      item.Info.FailedCode = 403
      item.Info.FailedMessage = '禁止访问'
      break
    } else if (item.Info.UploadSize > item.Task.size) {
      item.Info.UploadState = 'success'
      break
    }
  }

  if (item.Info.UploadState == 'running') item.Info.UploadState = 'success'
}
