import SettingLog from '@/setting/settinglog'
import { Button, Layout } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import '../dark.css'
import '../index.css'
import '../pageleft.css'
const { Header, Content } = Layout

declare namespace aliyun {
  class Config {
    setToken(token: { token: string }): any
  }
  function config({ mount, url }: { mount: Element; url: string }): Config
}
let name = '文档在线预览'
class PageOffice extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { isfull: false }
  }

  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PageOffice' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    const { global } = this.props as { global: GlobalModelState }
    const docOptions = aliyun.config({
      mount: document.querySelector('#doc-preview')!,
      url: global.pageOffice?.data.preview_url
    })
    docOptions.setToken({ token: global.pageOffice?.data.access_token })
    let doc = document.getElementById('iframe-preview')
    if (doc) doc.setAttribute('src', global.pageOffice?.data.preview_url)
    name = global.pageOffice?.name || '文档在线预览'
    setTimeout(() => {
      document.title = name
    }, 1000)
    setTimeout(() => {
      document.title = name
    }, 5000)
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

  render() {
    const { global } = this.props as { global: GlobalModelState }

    return (
      <Layout className="root" draggable="false" style={{ background: '#f2f4f7' }}>
        <Header id="header" className="tophead" draggable="false">
          <div className="tophead2 q-electron-drag">
            <Button type="text">
              <i className="iconfont iconfile-file"></i>
            </Button>
            <div className="title">小白羊</div>
            <div className="flexauto">
              <div className="titlename">{global.pageOffice?.name}</div>
            </div>

            <Button type="text" onClick={this.handleMinClick} title="最小化">
              <i className="iconfont iconzuixiaohua"></i>
            </Button>
            <Button type="text" onClick={this.handleMaxClick} title="最大化">
              <i className="iconfont iconfullscreen"></i>
            </Button>
            <Button type="text" onClick={this.handleHideClick} title="关闭">
              <i className="iconfont iconclose"></i>
            </Button>
          </div>
        </Header>
        <Layout draggable="false">
          <Content id="content" style={{ paddingTop: '8px', background: '#f2f4f7' }}>
            <div className="doc-preview" id="doc-preview" style={{ width: '100%', height: '100%' }}></div>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

function mapStateToProps({ global }: { global: GlobalModelState }) {
  return { global }
}
export default connect(mapStateToProps)(PageOffice)
