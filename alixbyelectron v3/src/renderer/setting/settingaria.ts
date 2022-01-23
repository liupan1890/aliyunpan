import { Refresh, RefreshSetting } from './setting'

export class SettingAriaC {
  public ariaSavePath = ''
  public ariaUrl = ''
  public ariaPwd = ''
  public ariaHttps = false
  public ariaState = 'local'
  public ariaLoading = false

  AriaIsLocal() {
    return this.ariaState == 'local'
  }

  mSaveAriaSavePath(val: string) {
    this.ariaSavePath = val
    RefreshSetting()
  }

  mSaveAriaUrl(val: string) {
    this.ariaUrl = val
    RefreshSetting()
  }

  mSaveAriaPwd(val: string) {
    this.ariaPwd = val
    RefreshSetting()
  }

  mSaveAriaHttps(val: boolean) {
    this.ariaHttps = val
    RefreshSetting()
  }

  mSaveAriaState(val: string) {
    this.ariaState = val
    RefreshSetting()
  }

  mSaveAriaLoading(val: boolean) {
    this.ariaLoading = val
    Refresh()
  }

  aLoadFromJson(setting: SettingAriaC) {
    this.ariaSavePath = setting.ariaSavePath || ''
    this.ariaUrl = setting.ariaUrl || ''
    this.ariaPwd = setting.ariaPwd || ''
    this.ariaHttps = setting.ariaHttps || false
    this.ariaState = (setting.ariaState || 'local') == 'local' ? 'local' : 'remote'
    this.ariaLoading = false
  }
}

const SettingAria = new SettingAriaC()
export default SettingAria
