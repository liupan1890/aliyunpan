import SettingUI from '@/setting/settingui'
import { AutoComplete, Checkbox, Input, Popover, Radio, RadioChangeEvent, Select } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { SelectValue } from 'antd/lib/select'
import { Console } from 'console'
import { connect, SettingModelState } from 'umi'
import './setting.css'
const TabUI = ({ dispatch, setting }: { dispatch: any; setting: SettingModelState }) => {
  function handleThemeChange(e: RadioChangeEvent) {
    const theme = e.target.value || 'light'
    localStorage.setItem('uiTheme', theme)
    SettingUI.mSaveUiTheme(theme)
    window.WebSaveTheme({ theme })
  }
  function handleImageModeChange(e: RadioChangeEvent) {
    SettingUI.mSaveUiImageMode(e.target.value || 'fill')
  }
  function handleVideoModeChange(e: RadioChangeEvent) {
    SettingUI.mSaveUiVideoMode(e.target.value || 'mpv')
  }
  function handleVideoPlayerChange(e: RadioChangeEvent) {
    SettingUI.mSaveUiVideoPlayer(e.target.value || 'mpv')
  }
  function handleAutoColorVideoChange(e: CheckboxChangeEvent) {
    SettingUI.mSaveUiAutoColorVideo(e.target.checked)
  }
  function handleShowPanPathChange(e: CheckboxChangeEvent) {
    SettingUI.mSaveUiShowPanPath(e.target.checked)
  }
  function handleExitOnCloseChange(e: CheckboxChangeEvent) {
    SettingUI.mSaveUiExitOnClose(e.target.checked)
  }

  const platform = window.platform
  function handleSelectPlayer() {
    if (window.WebShowOpenDialogSync) {
      window.WebShowOpenDialogSync(
        {
          title: '选择播放器的执行文件',
          buttonLabel: '选择',
          properties: ['openFile'],
          defaultPath: SettingUI.uiVideoPlayerPath
        },
        (result: string[] | undefined) => {
          if (result && result[0]) {
            SettingUI.mSaveUiVideoPlayerPath(result[0])
          }
        }
      )
    }
  }

  function handleVideoPlayerPathMacChange(val: SelectValue) {
    SettingUI.mSaveUiVideoPlayerPath(val?.toString() || '')
  }
  function handleVideoPlayerPathLinuxChange(val: string) {
    SettingUI.mSaveUiVideoPlayerPath(val || '')
  }

  return (
    <div className="settingbody rightbodysc">
      <div className="settinghead first">:主题颜色</div>
      <div className="settingrow">
        <Radio.Group value={SettingUI.uiTheme} buttonStyle="solid" onChange={handleThemeChange}>
          <Radio.Button value="light">浅色模式</Radio.Button>
          <Radio.Button value="dark">深色模式</Radio.Button>
          <Radio.Button value="system">跟随系统</Radio.Button>
        </Radio.Group>
      </div>

      <div className="settinghead">:预览图片</div>
      <div className="settingrow">
        <Radio.Group value={SettingUI.uiImageMode} buttonStyle="solid" onChange={handleImageModeChange}>
          <Radio.Button value="fill">缩放全图</Radio.Button>
          <Radio.Button value="width">全宽长图</Radio.Button>
        </Radio.Group>
        <Popover
          content={
            <div>
              <span className="opred">默认缩放全图</span>：设置在线预览图片的模式
              <hr />
              <span className="opred">缩放全图</span>： <br />
              支持放大、缩小、旋转、翻转、幻灯片播放图集。
              <div className="hrspace"></div>
              <span className="opred">全宽长图</span>： <br />
              只显示单张图片，适用于观看 图书、写真、漫画
              <div className="hrspace"></div>
              2种模式都支持使用键盘上 左右箭头按键 翻页（上一张、下一张）
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:预览视频</div>
      <div className="settingrow">
        <Radio.Group value={SettingUI.uiVideoMode} buttonStyle="solid" onChange={handleVideoModeChange}>
          <Radio.Button value="mpv">强制原始文件</Radio.Button>
          <Radio.Button value="online">优先转码视频</Radio.Button>
        </Radio.Group>
        <Popover
          content={
            <div>
              <span className="opred">默认强制原始文件</span>：设置在线预览视频的模式
              <hr />
              <span className="opred">优先转码视频</span>：<br />
              有转码视频时，会自动选择最高画质(1080P)，播放应该更流畅
              <br />
              没有转码视频时，再播放原始文件。(刚上传的视频可能没有转码)
              <br />
              但转码视频可能会丢失字幕、不能选择音轨
              <div className="hrspace"></div>
              <span className="opred">强制原始文件</span>：<br />
              不管是否有转码视频，直接播放原始文件。提供原画的清晰度(2K，4K)
              <br />
              如果视频里包含多个字幕、音轨(英语/国语),可以手动切换
              <div className="hrspace"></div>
              2种模式都支持快进、倍速播放、置顶、截图等功能(百度 MPV快捷键)
              <div className="hrspace"></div>
              <div className="hrspace"></div>
              注：违规视频会<span className="opblue">自动</span>通过转码视频播放
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:播放软件</div>
      <div className="settingrow">
        <Radio.Group value={SettingUI.uiVideoPlayer} buttonStyle="solid" onChange={handleVideoPlayerChange}>
          <Radio.Button value="mpv">内置MPV播放器</Radio.Button>
          <Radio.Button value="other">自定义播放软件</Radio.Button>
        </Radio.Group>
        <Popover
          content={
            <div>
              <span className="opred">默认内置MPV</span>：调用mpv播放器播放视频
              <hr />
              <span className="opred">内置MPV</span>：<br />
              windows/macOS 小白羊都内置了mpv播放器，无需设置，可以直接播放
              <br />
              linux 系统特殊，需要自己执行命令<span className="opblue">sudo apt install mpv</span>安装一次mpv播放器
              <br />
              mpv播放器支持 快进、倍速播放、置顶、截图等非常多的功能(百度 MPV快捷键)
              <div className="hrspace"></div>
              <span className="opred">自定义软件</span>：<br />
              是实验性的功能，可以<span className="opblue">自己选择</span>电脑上安装的其他播放软件，(部分软件不支持)
              <br />
              详情参阅<span className="opblue">帮助</span>，列出了部分常用的支持的播放软件
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settingrow" style={{ display: SettingUI.uiVideoPlayer == 'other' && platform == 'win32' ? '' : 'none', marginTop: '8px' }}>
        <Input.Search value={SettingUI.uiVideoPlayerPath} readOnly={true} enterButton="选择播放软件" style={{ maxWidth: '350px' }} onSearch={handleSelectPlayer} />
        <Popover
          content={
            <div>
              <span className="opred">win</span>：选择一个播放软件
              <hr />
              <span className="oporg">提示</span>：<br />
              直接手动选择播放软件的exe文件即可（例如：选择c:\xx\xx\Potplayer.exe）
              <br />
              也可以选择桌面上播放软件的快捷方式
              <div className="hrspace"></div>
              详情请参阅github项目里的“自定义播放软件.md”
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settingrow" style={{ display: SettingUI.uiVideoPlayer == 'other' && platform == 'darwin' ? '' : 'none', marginTop: '8px' }}>
        <Input.Search value={SettingUI.uiVideoPlayerPath} readOnly={true} enterButton="选择播放软件" style={{ maxWidth: '350px' }} onSearch={handleSelectPlayer} />
        <Popover
          content={
            <div>
              <span className="opred">macOS</span>：选择一个播放软件
              <hr />
              <span className="oporg">提示</span>：<br />
              点击 选择播放软件，弹出文件选择框，点击 左上 应用程序，点击一个播放软件，确定
              <div className="hrspace"></div>
              已测：IINA，MKPlayer，VLC
              <br />
              详情请参阅github项目里的“自定义播放软件.md”
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settingrow" style={{ display: SettingUI.uiVideoPlayer == 'other' && platform == 'linux' ? '' : 'none', marginTop: '8px' }}>
        <AutoComplete
          style={{ width: 252 }}
          options={[{ value: 'mpv' }, { value: 'vlc' }, { value: 'totem' }, { value: 'mplayer' }, { value: 'smplayer' }, { value: 'xine' }, { value: 'parole' }, { value: 'kodi' }]}
          defaultValue={SettingUI.uiVideoPlayerPath}
          onSelect={(val) => handleVideoPlayerPathLinuxChange(val.toString())}>
          <Input.Search enterButton="保存" style={{ maxWidth: '350px' }} onSearch={handleVideoPlayerPathLinuxChange} />
        </AutoComplete>
        <Popover
          content={
            <div>
              <span className="opred">linux</span>：填写一个播放软件
              <hr />
              <span className="oporg">提示</span>：<br />
              你必须先自己在电脑上安装（sudo apt install xxx），然后才能使用这个播放软件
              <br />
              <br />
              直接手动输入播放软件的名子即可（最终通过命令行调用此播放器）
              <div className="hrspace"></div>
              详情请参阅github项目里的“自定义播放软件.md”
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:自动标记</div>
      <div className="settingrow">
        <Checkbox checked={SettingUI.uiAutoColorVideo} onChange={handleAutoColorVideoChange}>
          启用自动标记已看过的视频文件名颜色
        </Checkbox>
        <Popover
          content={
            <div>
              <span className="opred">默认勾选</span>：开启自动标记
              <hr />
              当你点击了一个视频在线播放时，
              <br /> <span className='cvideo'>会自动把该文件标记为浅灰色</span>，和没看过的视频区分开
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>

      <div className="settinghead">:显示网盘路径</div>
      <div className="settingrow">
        <Checkbox checked={SettingUI.uiShowPanPath} onChange={handleShowPanPathChange}>
          启用一直显示网盘顶部路径(默认收缩左侧树后才显示)
        </Checkbox>
        <Popover
          content={
            <div>
              <span className="opred">默认不勾选</span>：收缩左侧的文件夹树后会显示网盘顶部路径
              <hr />
              网盘顶部路径可以用来 快捷跳转 父层级的文件夹
              <br /> 但为了美观，默认会隐藏顶部路径
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
      <div className="settinghead">:彻底退出</div>
      <div className="settingrow">
        <Checkbox checked={SettingUI.uiExitOnClose} onChange={handleExitOnCloseChange}>
          启用关闭窗口时立即彻底退出小白羊
        </Checkbox>
        <Popover
          content={
            <div>
              <span className="opred">默认关闭</span>：关闭窗口时最小化到托盘
              <hr />
              点击窗口上的关闭按钮时
              <br /> 默认是最小化到托盘，在后台继续下载/上传
              <br /> 勾选后，点击关闭，会立即彻底退出小白羊
            </div>
          }>
          <i className="iconfont iconbulb" />
        </Popover>
      </div>
    </div>
  )
}
export default connect(({ setting }: { setting: SettingModelState }) => ({
  setting
}))(TabUI)
