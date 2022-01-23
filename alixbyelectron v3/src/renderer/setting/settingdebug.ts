import { RefreshSetting } from './setting'

export class SettingDebugC {
  public debugCacheSize = ''
  public debugFileListMax = 3000
  public debugFavorListMax = 1000
  public debugDowningListMax = 1000
  public debugDownedListMax = 5000
  public debugFolderSizeCacheHour = 72

  mSaveDebugCacheSize(val: string) {
    this.debugCacheSize = val
    RefreshSetting()
  }

  mSaveDebugFileListMax(val: number) {
    if (val < 1000) val = 1000
    if (val > 10000) val = 10000
    this.debugFileListMax = val
    RefreshSetting()
  }

  mSaveDebugFavorListMax(val: number) {
    if (val < 100) val = 100
    if (val > 3000) val = 3000
    this.debugFavorListMax = val
    RefreshSetting()
  }

  mSaveDebugDowningListMax(val: number) {
    if (val < 100) val = 100
    if (val > 3000) val = 3000
    this.debugDowningListMax = val
    RefreshSetting()
  }

  mSaveDebugDownedListMax(val: number) {
    if (val < 1000) val = 1000
    if (val > 50000) val = 50000
    this.debugDownedListMax = val
    RefreshSetting()
  }

  mSaveDebugFolderSizeCacheHour(val: number) {
    if (val < 0) val = 0
    if (val > 168) val = 168
    this.debugFolderSizeCacheHour = val
    RefreshSetting()
  }

  aLoadFromJson(setting: SettingDebugC) {
    this.debugCacheSize = setting.debugCacheSize || ''

    if (setting.debugFileListMax == 0) this.debugFileListMax = 3000
    else this.debugFileListMax = setting.debugFileListMax || 3000

    if (this.debugFileListMax < 1000) this.debugFileListMax = 1000
    else if (this.debugFileListMax > 10000) this.debugFileListMax = 10000

    if (setting.debugFavorListMax == 0) this.debugFavorListMax = 1000
    else this.debugFavorListMax = setting.debugFavorListMax || 1000

    if (this.debugFavorListMax < 100) this.debugFavorListMax = 100
    else if (this.debugFavorListMax > 3000) this.debugFavorListMax = 3000

    if (setting.debugDowningListMax == 0) this.debugDowningListMax = 1000
    else this.debugDowningListMax = setting.debugDowningListMax || 1000

    if (this.debugDowningListMax < 100) this.debugDowningListMax = 100
    else if (this.debugDowningListMax > 3000) this.debugDowningListMax = 3000

    if (setting.debugDownedListMax == 0) this.debugDownedListMax = 5000
    else this.debugDownedListMax = setting.debugDownedListMax || 5000

    if (this.debugDownedListMax < 1000) this.debugDownedListMax = 1000
    else if (this.debugDownedListMax > 50000) this.debugDownedListMax = 50000

    if (setting.debugFolderSizeCacheHour == 0) this.debugFolderSizeCacheHour = 72
    else this.debugFolderSizeCacheHour = setting.debugFolderSizeCacheHour || 72

    if (this.debugFolderSizeCacheHour < 2) this.debugFolderSizeCacheHour = 2
    if (this.debugFolderSizeCacheHour > 168) this.debugFolderSizeCacheHour = 168
  }
}

const SettingDebug = new SettingDebugC()
export default SettingDebug
