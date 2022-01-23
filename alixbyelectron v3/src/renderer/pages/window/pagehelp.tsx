import SettingLog from '@/setting/settinglog'
import { Button, Layout } from 'antd'
import React from 'react'
import '../dark.css'
import '../index.css'
import '../pageleft.css'
const { Header, Content } = Layout

class PageHelp extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = { isfull: false }
  }

  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PageHelp' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    setTimeout(() => {
      document.title = '小白羊帮助文档'
    }, 1000)
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
    return (
      <Layout className="root" draggable="false" style={{ background: '#f2f4f7' }}>
        <Header id="header" className="tophead" draggable="false">
          <div className="tophead2 q-electron-drag">
            <Button type="text">
              <i className="iconfont iconfile-file"></i>
            </Button>
            <div className="title">小白羊</div>
            <div className="flexauto">
              <div className="titlename">帮助文档</div>
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
            <div className="doc-preview" id="doc-preview" style={{ width: '100%', height: '100%' }}>
              <webview style={{ width: '100%', height: '100%' }} src="https://www.yuque.com/liupan1890/xiaobaiyang"></webview>
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

export default PageHelp
