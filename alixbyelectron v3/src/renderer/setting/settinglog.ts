import { message } from 'antd'
import DB from './db'
import { Refresh } from './setting'

export interface IStateSettingLog {
  logtime: string
  logtype: LogLeve
  logmessage: string
}
class SettingLogC {
  public logList: IStateSettingLog[] = []

  mSaveLogClear() {
    this.logList = []
    try {
      DB.saveValueObject('logList', this.logList).catch(() => {})
    } catch {}
    Refresh()
  }

  mSaveLogCopy() {
    let logstr = ''
    for (let i = 0, maxi = this.logList.length; i < maxi; i++) {
      const item = this.logList[i]
      logstr += item.logtime + ' : ' + item.logtype + ' : ' + item.logmessage + '\n'
    }
    window.Electron.clipboard.writeText(logstr, 'clipboard')
    message.success('运行日志已复制到剪切板')
  }

  mSaveLog(logtype: LogLeve, logmessage: string) {
    if (!logmessage) return
    if (logmessage.length > 300) logmessage = logmessage.substring(0, 300)
    let time = new Date()
    if (this.logList.length > 500) this.logList.splice(250)
    this.logList.unshift({
      logtime:
        time.getDate().toString().padStart(2, '0') +
        ' ' +
        time.getHours().toString().padStart(2, '0') +
        ':' +
        time.getMinutes().toString().padStart(2, '0') +
        ':' +
        time.getSeconds().toString().padStart(2, '0'),
      logtype: logtype,
      logmessage
    })
    try {
      DB.saveValueObject('logList', this.logList).catch(() => {})
    } catch {}
    Refresh()
  }

  async aLoadFromDB() {
    const setting = {
      logList: (await DB.getValueObject('logList')) || []
    }
    this.logList = setting.logList as IStateSettingLog[]
  }
}

const SettingLog = new SettingLogC()
export default SettingLog
