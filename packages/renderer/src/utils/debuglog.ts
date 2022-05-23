import { useLogStore } from '@/store'
import DB from './db'

export interface IStateDebugLog {
  logtime: string
  logtype: LogLeve
  logmessage: string
}

class DebugLogC {
  public logList: IStateDebugLog[] = []
  public logLoaded: boolean = false
  public logTime: number = 0
  mSaveLogClear() {
    this.logList = []
    this.logTime = Date.now()

    try {
      DB.saveValueObject('logList', this.logList).catch(() => {})
      useLogStore().logRefresh(this.logTime)
    } catch {}
  }

  mSaveLog(logtype: LogLeve, logmessage: string) {
    if (!logmessage) return
    if (!this.logLoaded) return
    if (logmessage.length > 300) logmessage = logmessage.substring(0, 300)+'...'
    let time = new Date()
    if (this.logList.length > 500) this.logList.splice(250)
    this.logList.unshift({
      logtime: time.getDate().toString().padStart(2, '0') + ' ' + time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0') + ':' + time.getSeconds().toString().padStart(2, '0'),
      logtype: logtype,
      logmessage
    })
    this.logTime = time.getTime()
    try {
      DB.saveValueObject('logList', this.logList).catch(() => {})
      useLogStore().logRefresh(this.logTime)
    } catch {}
  }

  async aLoadFromDB() {
    const logList2 = await DB.getValueObject('logList')
    if (logList2) this.logList = logList2 as IStateDebugLog[]
    this.logLoaded = true
    this.logTime = Date.now()
    this.mSaveLog('success', '小白羊启动')
  }
}

const DebugLog = new DebugLogC()
export default DebugLog
