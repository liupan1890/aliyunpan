import AliFile from '@/aliapi/file'
import SettingLog from '@/setting/settinglog'
import { ITokenInfo } from '@/store/models'
import { Button, Layout, message } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import '../dark.css'
import '../index.css'
import '../pageleft.css'
const { Header, Content } = Layout

export const codeBlockRef = React.createRef<HTMLDivElement>()
class PageCode extends React.Component<{ global: GlobalModelState }> {
  constructor(props: any) {
    super(props)
    this.state = { name: '', lang: '', codeString: '', format: false }
  }
  token: ITokenInfo | undefined = undefined
  loadCode = () => {
    const { global } = this.props as { global: GlobalModelState }
    const pageCode = global.pageCode!
    AliFile.ApiFileDownText(this.token!.user_id, pageCode.drive_id, pageCode.file_id, pageCode.data.fileSize, 512 * 1024).then((data: string) => {
      if (pageCode.data.fileSize > 512 * 1024) {
        message.info('文件较大，只显示了前 512KB 的内容')
      }
      let fext = pageCode.data.codeExt
      if (fext == 'plain' && data.indexOf('{') >= 0 && data.indexOf(':') > 0 && data.indexOf('}') > 0 && data.indexOf('"') > 0) {
        fext = 'json'
      }
      const nofromate = pageCode.data.fileSize > 150 * 1024 || fext == 'plain'
      this.setState({ codeString: data, format: !nofromate })
      if (nofromate) return
      setTimeout(() => {
        try {
          if (codeBlockRef.current) window.Prism.highlightAllUnder(codeBlockRef.current)
        } catch {}
      }, 500)
    })
  }

  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PageCode' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    const { global } = this.props as { global: GlobalModelState }
    this.token = Object.assign({}, this.props.global.pageCode?.token)
    let name = global.pageCode?.name || '代码在线预览'
    document.title = name
    let lang = 'language-' + global.pageCode?.data.codeExt
    this.setState({ name, lang })
    this.loadCode()
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
    const { lang, name, codeString, format } = this.state as { lang: string; name: string; codeString: string; format: boolean }

    return (
      <Layout className="root dark" draggable="false">
        <Header id="header" className="tophead" draggable="false">
          <div className="tophead2 q-electron-drag">
            <Button type="text">
              <i className="iconfont iconfile-file"></i>
            </Button>
            <div className="title">小白羊</div>
            <div className="titlename">{name}</div>
            <div className="flexauto"></div>
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
          <Content id="content" style={{ padding: '12px 16px 12px 16px' }}>
            <div className="doc-preview" id="doc-preview" style={{ width: '100%', height: '100%', overflow: 'auto' }}>
              <div ref={codeBlockRef} className="fullwidthcode">
                {format ? (
                  <pre className={'line-numbers ' + lang + ' format'}>
                    <code>{codeString}</code>{' '}
                  </pre>
                ) : (
                  <p className="noformat">{codeString}</p>
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

function mapStateToProps({ global }: { global: GlobalModelState }) {
  return { global }
}
export default connect(mapStateToProps)(PageCode)
