import { useLogStore } from '../store'
import DBCache from './dbcache'

export interface IStateDebugLog {
  logid: number
  logtime: string
  logtype: string
  logmessage: string
}

class DebugLogC {
  public logList: IStateDebugLog[] = []
  public logTime: number = 0
  mSaveLogClear() {
    this.logList = []
    this.logTime = Date.now()

    try {
      DBCache.deleteLogAll().catch(() => {})
      useLogStore().logRefresh(this.logTime)
    } catch {}
  }

  mSaveDanger(logmessage: string, err: any = undefined) {
    this.mSaveLog('danger', logmessage, err)
  }

  mSaveWarning(logmessage: string, err: any = undefined) {
    this.mSaveLog('warning', logmessage, err)
  }

  mSaveSuccess(logmessage: string, err: any = undefined) {
    this.mSaveLog('success', logmessage, err)
  }

  mSaveLog(logtype: string, logmessage: string, err: any) {
    if (!logmessage && !err) return
    if (logmessage && typeof logmessage == 'string' && logmessage.length > 500) logmessage = logmessage.substring(0, 500) + '...'
    const time = new Date()
    if (this.logList.length > 500) {
      this.logList.splice(400)
      DBCache.deleteLogOutCount(400)
    }
    
    const log = {
      logid: time.getTime(),
      logtime: time.getDate().toString().padStart(2, '0') + ' ' + time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0') + ':' + time.getSeconds().toString().padStart(2, '0'),
      logtype: logtype,
      logmessage: logmessage
    }

    if (err) {
      if (typeof err == 'string') {
        log.logmessage = logmessage + ' \n//== Error ==//\n ' + err
      } else if (err.message) {
        let m = err.message + (err.stack ? ' \n//== Stack ===//\n ' + err.stack : '')
        if (m.length > 500) m = m.substring(0, 500) + '...'
        log.logmessage = logmessage + ' \n//== Error ==//\n ' + m
      } else {
        try {
          log.logmessage = logmessage + ' \n//== Error ==//\n ' + JSON.stringify(err)
        } catch {
          log.logmessage = logmessage + ' \n//== Error ==//\n stringify failed'
        }
      }
    }
    this.logList = [log].concat(this.logList)
    this.logTime = time.getTime()
    try {
      DBCache.saveLog(log).catch(() => {})
      useLogStore().logRefresh(this.logTime)
    } catch {}
  }

  async aLoadFromDB() {
    const logList2 = await DBCache.getLogAll()
    if (logList2) this.logList = logList2 as IStateDebugLog[]
    this.logTime = Date.now()
  }
}

const DebugLog = new DebugLogC()
export default DebugLog
