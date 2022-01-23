import { Refresh, RefreshSetting } from './setting'
export function setTheme(color: string) {
  if (color == 'system') color = window.dark ? 'dark' : 'light'
  try {
    document.body.className = color
  } catch {}
}

export class SettingUIC {
  public uiTheme: string = 'light'
  public uiImageMode: string = 'fill'
  public uiVideoMode: string = 'mpv'
  public uiVideoPlayer: string = 'mpv'
  public uiVideoPlayerPath: string = ''
  public uiAutoColorVideo: boolean = true
  public uiShowPanPath: boolean = false
  public uiExitOnClose: boolean = false
  public uiLeftTreeCollapsed: boolean = false

  mSaveUiTheme(val: string) {
    this.uiTheme = val
    setTheme(this.uiTheme)
    RefreshSetting()
  }

  mSaveUiImageMode(val: string) {
    this.uiImageMode = val
    RefreshSetting()
  }

  mSaveUiVideoMode(val: string) {
    this.uiVideoMode = val
    RefreshSetting()
  }

  mSaveUiVideoPlayer(val: string) {
    this.uiVideoPlayer = val
    RefreshSetting()
  }

  mSaveUiVideoPlayerPath(val: string) {
    this.uiVideoPlayerPath = val
    RefreshSetting()
  }

  mSaveUiAutoColorVideo(val: boolean) {
    this.uiAutoColorVideo = val
    RefreshSetting()
  }

  mSaveUiShowPanPath(val: boolean) {
    this.uiShowPanPath = val
    RefreshSetting()
  }

  mSaveUiExitOnClose(val: boolean) {
    this.uiExitOnClose = val
    RefreshSetting()
  }

  mSaveUiLeftTreeCollapsed(val: boolean) {
    this.uiLeftTreeCollapsed = val
    Refresh()
  }

  aLoadFromJson(setting: SettingUIC) {
    if (!setting.uiTheme) this.uiTheme = 'light'
    else this.uiTheme = setting.uiTheme || 'light'
    setTheme(this.uiTheme)

    this.uiImageMode = setting.uiImageMode === 'width' ? 'width' : 'fill'
    this.uiVideoMode = setting.uiVideoMode === 'online' ? 'online' : 'mpv'
    this.uiVideoPlayer = setting.uiVideoPlayer === 'other' ? 'other' : 'mpv'
    this.uiVideoPlayerPath = setting.uiVideoPlayerPath || ''
    this.uiAutoColorVideo = true && setting.uiAutoColorVideo
    this.uiShowPanPath = setting.uiShowPanPath || false
    this.uiExitOnClose = setting.uiExitOnClose || false
  }
}

const SettingUI = new SettingUIC()
export default SettingUI
