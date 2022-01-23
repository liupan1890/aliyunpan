import { RefreshSetting } from './setting'

export class SettingYinSiC {
  public yinsiLinkPassword: boolean = false
  public yinsiZipPassword: boolean = false

  mSaveYinsiLinkPassword(val: boolean) {
    this.yinsiLinkPassword = val
    RefreshSetting()
  }

  mSaveYinsiZipPassword(val: boolean) {
    this.yinsiZipPassword = val
    RefreshSetting()
  }

  aLoadFromJson(setting: SettingYinSiC) {
    this.yinsiLinkPassword = setting.yinsiLinkPassword || false
    this.yinsiZipPassword = setting.yinsiZipPassword || false
  }
}

const SettingYinSi = new SettingYinSiC()
export default SettingYinSi
