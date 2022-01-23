import { Refresh, RefreshSetting } from './setting'

export class SettingPanC {
  public uiFolderSize: boolean = true
  public uiFileOpenDouble: boolean = false
  public uiFileOrderDuli: string = ''
  public uiTimeFolderFormate: string = 'yyyy-MM-dd HH-mm-ss'
  public uiTimeFolderIndex: number = 1
  public uiShareDays: string = 'always'
  public uiSharePassword: string = 'random'
  public uiXBTNumber: number = 36
  public uiXBTWidth: number = 960
  public uiTrashAutoCleanDay: number = 9999


  public uiFileListOrder: string = 'updated_at desc'
  public uiFileListMode: string = 'list'
  public uiFileSearchMode: string = 'all'

  mSaveUiFolderSize(val: boolean) {
    this.uiFolderSize = val
    RefreshSetting()
  }

  mSaveUiFileOpenDouble(val: boolean) {
    this.uiFileOpenDouble = val
    RefreshSetting()
  }

  mSaveUiFileOrderDuli(val: string) {
    this.uiFileOrderDuli = val
    RefreshSetting()
  }

  mSaveUiTimeFolderFormate(val: string) {
    this.uiTimeFolderFormate = val
    RefreshSetting()
  }

  mSaveUiTimeFolderIndex(val: number) {
    if (val < 1) val = 1
    this.uiTimeFolderIndex = val
    RefreshSetting()
  }

  mSaveUiShareDays(val: string) {
    this.uiShareDays = val
    RefreshSetting()
  }

  mSaveUiSharePassword(val: string) {
    this.uiSharePassword = val
    RefreshSetting()
  }

  mSaveUiXBTNumber(val: number) {
    if (val < 16) val = 16
    if (val > 96) val = 96
    this.uiXBTNumber = val
    RefreshSetting()
  }

  mSaveUiXBTWidth(val: number) {
    if (val < 720) val = 720
    if (val > 1280) val = 1280
    this.uiXBTWidth = val
    RefreshSetting()
  }

  mSaveUiTrashAutoCleanDay(val: number) {
    if (val < 2) val = 2
    if (val > 9999) val = 9999
    this.uiTrashAutoCleanDay = val
    RefreshSetting()
  }

  mSaveUiFileListOrder(val: string) {
    this.uiFileListOrder = val
    RefreshSetting()
  }

  mSaveUiFileListMode(val: string) {
    this.uiFileListMode = val
    RefreshSetting()
  }

  mSaveUiFileSearchMode(val: string) {
    this.uiFileSearchMode = val
    Refresh()
  }

  aLoadFromJson(setting: SettingPanC) {
    this.uiFolderSize = true && setting.uiFolderSize
    this.uiFileOpenDouble = setting.uiFileOpenDouble || false
    this.uiFileOrderDuli = setting.uiFileOrderDuli || ''
    this.uiTimeFolderFormate = setting.uiTimeFolderFormate || 'yyyy-MM-dd HH-mm-ss'
    this.uiTimeFolderIndex = setting.uiTimeFolderIndex || 1
    this.uiShareDays = setting.uiShareDays || 'always'
    this.uiSharePassword = setting.uiSharePassword || 'random'
    if ([24, 36, 48, 60, 72].includes(setting.uiXBTNumber) == false) this.uiXBTNumber = 36
    else this.uiXBTNumber = setting.uiXBTNumber || 36

    this.uiXBTWidth = setting.uiXBTWidth || 960

    this.uiTrashAutoCleanDay = setting.uiTrashAutoCleanDay || 2
    if (this.uiTrashAutoCleanDay < 2) this.uiTrashAutoCleanDay = 2

    this.uiFileListOrder = setting.uiFileListOrder || 'updated_at desc'

    if (['list', 'image', 'big'].includes(setting.uiFileListMode) == false) this.uiFileListMode = 'list'
    else this.uiFileListMode = setting.uiFileListMode
  }
}

const SettingPan = new SettingPanC()
export default SettingPan
