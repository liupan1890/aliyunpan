import { AriaGlobalSpeed } from '@/store/aria2c'
import { Refresh, RefreshSetting } from './setting'

export class SettingDownC {
  public downSavePath: string = ''
  public downSavePathDefault: boolean = false
  public downSavePathFull: boolean = true
  public downSaveBreakWeiGui: boolean = true
  public downFileMax: number = 5
  public downThreadMax: number = 16
  public downGlobalSpeed: number = 0
  public downAutoShutDown: number = 0
  public downSaveShowPro: boolean = true
  public downSmallFileFirst: boolean = false
  public downUploadBreakExist: boolean = false
  public downIngoredList: string[] = ['thumbs.db', 'desktop.ini', '.ds_store', '.td', '~', '.downloading']

  mSaveDownSavePath(val: string) {
    this.downSavePath = val
    RefreshSetting()
  }

  mSaveDownSavePathDefault(val: boolean) {
    this.downSavePathDefault = val
    RefreshSetting()
  }

  mSaveDownSavePathFull(val: boolean) {
    this.downSavePathFull = val
    RefreshSetting()
  }

  mSaveDownSaveBreakWeiGui(val: boolean) {
    this.downSaveBreakWeiGui = val
    RefreshSetting()
  }

  mSaveDownFileMax(val: number) {
    if (val > 60) val = 60
    this.downFileMax = val
    RefreshSetting()
  }

  mSaveDownThreadMax(val: number) {
    this.downThreadMax = val
    RefreshSetting()
  }

  mSaveDownGlobalSpeed(val: number) {
    if (val < 0) val = 0
    if (val > 999) val = 999
    this.downGlobalSpeed = val
    AriaGlobalSpeed()
    RefreshSetting()
  }

  mSaveDownAutoShutDown(val: boolean) {
    this.downAutoShutDown = val ? 1 : 0
    Refresh()
  }

  mSaveDownSaveShowPro(val: boolean) {
    this.downSaveShowPro = val
    RefreshSetting()
  }

  mSaveDownSmallFileFirst(val: boolean) {
    this.downSmallFileFirst = val
    RefreshSetting()
  }

  mSaveDownUploadBreakExist(val: boolean) {
    this.downUploadBreakExist = val
    RefreshSetting()
  }

  mSaveDownIngoredList(val: string, isadd: boolean) {
    if (!val) return
    val = val.toLowerCase()
    if (isadd) {
      if (this.downIngoredList.includes(val) == false) this.downIngoredList.push(val)
    } else {
      const list: string[] = []
      for (let i = 0, maxi = this.downIngoredList.length; i < maxi; i++) {
        if (this.downIngoredList[i] !== val) list.push(this.downIngoredList[i])
      }
      this.downIngoredList = list
    }
    RefreshSetting()
  }

  aLoadFromJson(setting: SettingDownC) {
    this.downSavePath = setting.downSavePath || ''
    this.downSavePathDefault = setting.downSavePathDefault || false
    this.downSavePathFull = true && setting.downSavePathFull
    this.downSaveBreakWeiGui = true && setting.downSaveBreakWeiGui
    this.downSaveShowPro = true && setting.downSaveShowPro
    this.downUploadBreakExist = setting.downUploadBreakExist || false
    this.downSmallFileFirst = setting.downSmallFileFirst || false
    this.downGlobalSpeed = setting.downGlobalSpeed || 0

    if (setting.downFileMax == 0) this.downFileMax = 5
    else this.downFileMax = setting.downFileMax || 5
    if (this.downFileMax == 20) this.downFileMax = 30
    if (this.downFileMax > 60) this.downFileMax = 60

    if (setting.downThreadMax == 0) this.downThreadMax = 16
    else this.downThreadMax = setting.downThreadMax || 16

    if (setting.downIngoredList) this.downIngoredList = setting.downIngoredList as string[]
  }
}

const SettingDown = new SettingDownC()
export default SettingDown
