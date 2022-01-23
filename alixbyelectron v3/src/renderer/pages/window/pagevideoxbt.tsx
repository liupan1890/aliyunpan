import AliFile from '@/aliapi/file'
import { IAliFileAudioMeta, IAliFileItem, IAliFileVideoMeta, IAliGetFileModel, IVideoXBTUrl } from '@/aliapi/models'
import { UserModelState } from '@/models/usermodel'
import { Button, Layout, message, Image, Alert, Radio } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import domtoimage from 'dom-to-image'
import '../dark.css'
import '../index.css'
import '../pageleft.css'
import { ITokenInfo } from '@/store/models'
import { humanSize, humanTime } from '@/store/format'
import SettingLog from '@/setting/settinglog'
import SettingPan from '@/setting/settingpan'
import DB from '@/setting/db'
const { Header, Content } = Layout

export const codeBlockRef = React.createRef<HTMLDivElement>()
class PageVideoXBT extends React.Component<
  { global: GlobalModelState; user: UserModelState },
  { name: string; error: string; loading: boolean; imagelist: IVideoXBTUrl[]; rowNum: number; preview: boolean; fileinfo: IAliFileItem | undefined }
> {
  token: ITokenInfo | undefined = undefined
  constructor(props: any) {
    super(props)

    this.state = { name: '', error: '', loading: false, imagelist: [], rowNum: 4, preview: false, fileinfo: undefined }
  }
  loadXBT = async () => {
    const global = this.props.global
    const pageVideoXBT = global.pageVideoXBT!
    const file = pageVideoXBT.data.file as IAliGetFileModel
    this.setState({ loading: true })
    let alifile = await AliFile.ApiFileInfo(this.token!.user_id, file.drive_id, file.file_id)

    if (alifile == undefined) {
      message.error('错误的文件')
      this.setState({ error: '错误的文件', loading: false })
      return
    }
    const duration = Math.ceil(Number.parseFloat(alifile.video_media_metadata?.duration?.toString() || alifile.video_preview_metadata?.duration?.toString() || '0'))
    if (duration <= 0) {
      message.error('错误的文件(视频时长错误)')
      this.setState({ error: '错误的文件(视频时长错误)', loading: false, fileinfo: alifile })
      return
    }

    let x = Math.max(alifile?.video_media_metadata?.width || 0, alifile?.video_preview_metadata?.width || 0)
    let y = Math.max(alifile?.video_media_metadata?.height || 0, alifile?.video_preview_metadata?.height || 0)

    let uiXBTNumber = await DB.getValueNumber('uiXBTNumber')||36
    AliFile.ApiBiXueTuBatch(this.token!.user_id, file.drive_id, file.file_id, duration, uiXBTNumber, 720).then((data) => {
      this.setState({ imagelist: data, loading: false, fileinfo: alifile, rowNum: x > y ? 3 : 4 })
    })
  }

  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PageVideoXBT' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    let name = '在线预览雪碧图' + this.props.global.pageVideoXBT?.name
    document.title = name
    this.setState({ name })
    this.token = Object.assign({}, this.props.global.pageVideoXBT?.token)
    DB.getValueNumber('uiXBTWidth').then((uiXBTWidth: number) => {
      this.handleWinSizeClick(uiXBTWidth || 960)
      this.loadXBT()
    })
  }
  handleMinClick = () => {
    window.Electron.remote.getCurrentWindow().minimize()
  }
  handleMaxClick = () => {
    let win = window.Electron.remote.getCurrentWindow()
    if (win.isMaximized()) win.restore()
    else win.maximize()
  }
  handleHideClick = () => {
    window.Electron.remote.getCurrentWindow().close()
  }

  handleWinSizeClick = (size: number) => {
    let win = window.Electron.remote.getCurrentWindow()
    let wsize = win.getSize()
    win.setSize(size + 32, wsize[1])
    SettingPan.mSaveUiXBTWidth(size)
    this.setState({})
  }

  handleCopyM3U8Click = () => {
    const file = this.props.global.pageVideoXBT!.data.file as IAliGetFileModel
    AliFile.ApiVideoPreviewUrl(this.token!.user_id, file.drive_id, file.file_id).then((data) => {
      if (data && data.url) {
        window.Electron.clipboard.writeText(data.url, 'clipboard')
        message.success('视频的M3U8链接已复制，4小时内有效')
      } else {
        message.error('视频的M3U8链接获取失败，请稍后重试')
      }
    })
  }
  handleCopyDownClick = () => {
    const file = this.props.global.pageVideoXBT!.data.file as IAliGetFileModel
    AliFile.ApiFileDownloadUrl(this.token!.user_id, file.drive_id, file.file_id, 14400).then((data) => {
      if (data && typeof data !== 'string' && data.url) {
        window.Electron.clipboard.writeText(data.url, 'clipboard')
        message.success('视频的下载链接已复制，4小时内有效')
      } else {
        message.error('视频的下载链接获取失败，请稍后重试')
      }
    })
  }

  handleSaveImageClick = () => {
    this.setState({ loading: true })
    var node = document.getElementById('docxbt')
    var width = document.body.clientWidth
    domtoimage
      .toPng(node, { bgcolor: '#23232e' })
      .then((dataUrl: any) => {
        this.setState({ loading: false })
        var link = document.createElement('a')
        link.download = this.state.name.replace('在线预览雪碧图', '') + '_' + (width - 32).toString() + '.png'
        link.href = dataUrl
        link.click()
      })
      .catch((error: any) => {
        this.setState({ loading: false })
        message.error('oops, something went wrong!' + (error.message || ''))
      })
  }

  getFenBianLv() {
    let x = Math.max(this.state.fileinfo?.video_media_metadata?.width || 0, this.state.fileinfo?.video_preview_metadata?.width || 0)
    let y = Math.max(this.state.fileinfo?.video_media_metadata?.height || 0, this.state.fileinfo?.video_preview_metadata?.height || 0)
    return x.toString() + 'x' + y.toString()
  }

  getVideoInfo() {
    let info = ''
    let metas: IAliFileVideoMeta[] = []
    if (this.state.fileinfo?.video_media_metadata?.video_media_video_stream) {
      if (Array.isArray(this.state.fileinfo?.video_media_metadata?.video_media_video_stream)) {
        metas = this.state.fileinfo?.video_media_metadata?.video_media_video_stream
      } else {
        metas = [this.state.fileinfo?.video_media_metadata?.video_media_video_stream]
      }
    }

    for (let i = 0, maxi = metas.length; i < maxi; i++) {
      let meta = metas[i]
      if (meta.code_name == 'mjpeg') continue
      let one = ''

      if (meta.code_name) one += '    编码=' + meta.code_name.toUpperCase()
      if (meta.bitrate) {
        let bit = parseInt(meta.bitrate)
        let bitdw = 'bps'
        if (bit / 1000 > 40) {
          bit = bit / 1000
          bitdw = 'kbps'
        }
        if (bit / 1000 > 40) {
          bit = bit / 1000
          bitdw = 'mbps'
        }
        one += '    码率=' + Math.floor(bit) + bitdw
      }
      if (meta.fps) {
        one += '    帧率=' + meta.fps
        let fps = meta.fps.split('/')
        if (fps.length == 2) {
          let fpsn = parseInt(fps[0]) / parseInt(fps[1])
          one += ' (' + fpsn.toFixed(1) + ')'
        }
      }
      if (i > 0) info += ';'
      info += one
    }
    info = info.trimStart()

    if (!info) return <div></div>
    return (
      <div>
        <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
          视频信息
        </span>
        ：{info}
      </div>
    )
  }
  getAudioInfo() {
    let info = ''
    let metas: IAliFileAudioMeta[] = []
    if (this.state.fileinfo?.video_media_metadata?.video_media_audio_stream) {
      if (Array.isArray(this.state.fileinfo?.video_media_metadata?.video_media_audio_stream)) {
        metas = this.state.fileinfo?.video_media_metadata?.video_media_audio_stream
      } else {
        metas = [this.state.fileinfo?.video_media_metadata?.video_media_audio_stream]
      }
    }

    let audlist: string[] = []
    for (let i = 0, maxi = metas.length; i < maxi; i++) {
      let meta = metas[i]
      let one = ''
      if (meta.code_name) one += '    编码=' + meta.code_name.toUpperCase()

      if (meta.bit_rate) {
        let bit = parseInt(meta.bit_rate)
        let bitdw = 'bps'
        if (bit / 1000 > 8) {
          bit = bit / 1000
          bitdw = 'kbps'
        }
        if (bit / 1000 > 8) {
          bit = bit / 1000
          bitdw = 'mbps'
        }
        one += '    码率=' + Math.floor(bit) + bitdw
      }
      if (meta.sample_rate) one += '    采样率=' + meta.sample_rate + 'Hz'
      if (meta.channels) one += '    声道数=' + meta.channels
      if (meta.channel_layout) one += '    声道=' + meta.channel_layout.replace('stereo', '立体声').replace('mono', '单声道').replace('quad', '四通道')
      if (audlist.includes(one) == false) {
        audlist.push(one)
      }
    }
    if (metas.length > 1) info = '    音轨=' + metas.length.toString()
    info += audlist.join(';')
    info = info.trimStart()
    if (!info) return <div></div>
    return (
      <div>
        <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
          音频信息
        </span>
        ：{info}
      </div>
    )
  }
  getPreviewInfo() {
    let info = ''
    let meta = this.state.fileinfo?.video_preview_metadata
    if (meta) {
      let one = ''
      if (meta.video_format) one += '    视频编码=' + meta.video_format.toUpperCase()
      if (meta.bitrate) {
        let bit = parseInt(meta.bitrate)
        let bitdw = 'bps'
        if (bit / 1000 > 100) {
          bit = bit / 1000
          bitdw = 'kbps'
        }
        if (bit / 1000 > 100) {
          bit = bit / 1000
          bitdw = 'mbps'
        }
        one += '    总码率=' + Math.floor(bit) + bitdw
      }
      if (meta.frame_rate) {
        one += '    帧率=' + meta.frame_rate
        let fps = meta.frame_rate.split('/')
        if (fps.length == 2) {
          let fpsn = parseInt(fps[0]) / parseInt(fps[1])
          one += ' (' + fpsn.toFixed(1) + ')'
        }
      }
      if (meta.audio_format) one += '    音频编码=' + meta.audio_format.toUpperCase()
      info = one
    }
    info = info.trimStart()
    if (!info) return <div></div>
    return (
      <div>
        <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
          预览信息
        </span>
        ：{info}
      </div>
    )
  }

  getTimeInfo() {
    let info = this.state.fileinfo?.video_media_metadata?.time || ''
    if (!info) return <div></div>
    return (
      <div>
        <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
          创建时间
        </span>
        ：{info}
      </div>
    )
  }

  render() {
    return (
      <Layout className="root dark" draggable="false">
        <Header id="header" className="tophead" draggable="false">
          <div className="tophead2 q-electron-drag">
            <Button type="text">
              <i className="iconfont iconfile-file"></i>
            </Button>
            <div className="title">小白羊</div>
            <div className="titlename">{this.props.global.pageVideoXBT?.name}</div>
            <div className="flexauto"></div>

            <Button type="text" onClick={this.handleMinClick} title="最小化" style={{ display: this.state.preview ? 'none' : '' }}>
              <i className="iconfont iconzuixiaohua"></i>
            </Button>
            <Button type="text" onClick={this.handleMaxClick} title="最大化" style={{ display: this.state.preview ? 'none' : '' }}>
              <i className="iconfont iconfullscreen"></i>
            </Button>
            <Button type="text" onClick={this.handleHideClick} title="关闭" style={{ display: this.state.preview ? 'none' : '' }}>
              <i className="iconfont iconclose"></i>
            </Button>
          </div>
        </Header>
        <Layout draggable="false">
          <Content id="content" style={{ padding: '12px 6px 12px 16px' }}>
            {this.state.error == '' ? (
              <div className="doc-preview" id="doc-preview" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                <div className="xbtbtns settingbody">
                  <Radio.Group value={SettingPan.uiXBTWidth.toString()} buttonStyle="solid" onChange={(e) => this.handleWinSizeClick(parseInt(e.target.value))}>
                    <Radio.Button value="720">720P</Radio.Button>
                    <Radio.Button value="960">960P</Radio.Button>
                    <Radio.Button value="1080">1080P</Radio.Button>
                    <Radio.Button value="1280">1280P</Radio.Button>
                  </Radio.Group>

                  <div style={{ marginRight: '12px' }}></div>
                  <Button type="link" className="outline" loading={this.state.loading} onClick={this.handleSaveImageClick} title="下载雪碧图到本地" style={{ display: '' }}>
                    <i className="iconfont iconfile-img"></i>保存雪碧图
                  </Button>
                  <div style={{ flexGrow: 1 }}></div>
                  <Button type="link" className="outline" onClick={this.handleCopyM3U8Click} title="复制M3U8链接" style={{ display: this.state.preview ? 'none' : '' }}>
                    <i className="iconfont iconlink2"></i>M3U8链接
                  </Button>
                  <div style={{ marginRight: '12px' }}></div>
                  <Button type="link" className="outline" onClick={this.handleCopyDownClick} title="复制原文件链接" style={{ display: this.state.preview ? 'none' : '' }}>
                    <i className="iconfont iconlink2"></i>下载链接
                  </Button>
                  <div style={{ marginRight: '12px' }}></div>
                </div>

                <div id="docxbt">
                  <div className="xbtinfo" style={{ color: '#ffffffd9', padding: '24px 8px 16px 16px', background: '#17171f', borderRadius: '4px', whiteSpace: 'pre-wrap', marginBottom: '2px' }}>
                    <h3 style={{ color: '#fffffff2', fontSize: '18px', fontWeight: 500, lineHeight: 1.40625 }}>{this.state.fileinfo?.name}</h3>
                    <div>
                      <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
                        文件大小
                      </span>
                      ：{humanSize(this.state.fileinfo?.size || 0)}
                    </div>
                    <div>
                      <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
                        分辨率
                      </span>
                      ：{this.getFenBianLv()}
                    </div>
                    <div>
                      <span className="xinfo" style={{ display: 'inline-block', width: '60px', textAlign: 'right' }}>
                        播放时长
                      </span>
                      ：{humanTime(this.state.fileinfo?.video_media_metadata?.duration || this.state.fileinfo?.video_preview_metadata?.duration || 0)}
                    </div>
                    {this.getVideoInfo()}
                    {this.getAudioInfo()}
                    {this.getPreviewInfo()}
                    {this.getTimeInfo()}
                  </div>
                  <div className="xbtvideo" style={{ display: 'flex', flexWrap: 'wrap', border: '2px solid #17171f', borderBottom: '24px solid #17171f', padding: '16px', borderRadius: '4px', background: '#17171f' }}>
                    <Image.PreviewGroup
                      preview={{
                        onVisibleChange: (visible) => {
                          this.setState({ preview: visible })
                        }
                      }}>
                      {this.state.imagelist.map((item, index) => (
                        <div
                          className="xbtimage"
                          key={'xbt-' + index.toString()}
                          style={{
                            width: this.state.rowNum == 4 ? '25%' : '33.333%',
                            display: 'flex',
                            flexDirection: 'column',
                            paddingBottom: '8px',
                            border: '2px solid #17171f',
                            minHeight: '100px'
                          }}>
                          <Image width="100%" src={item.url} />
                          <div className="xbttime" style={{ textAlign: 'center', color: '#ffffffa6' }}>
                            {item.time}
                          </div>
                        </div>
                      ))}
                    </Image.PreviewGroup>
                  </div>
                </div>
              </div>
            ) : (
              <Alert message={this.state.error} type="error" />
            )}
          </Content>
        </Layout>
      </Layout>
    )
  }
}

function mapStateToProps({ global, user }: { global: GlobalModelState; user: UserModelState }) {
  return { global, user }
}
export default connect(mapStateToProps)(PageVideoXBT)
