import { UserModelState } from '@/models/usermodel'
import SettingConfig from '@/setting/settingconfig'
import SettingLog from '@/setting/settinglog'
import SettingUI from '@/setting/settingui'
import { Avatar, Button, Layout, message, Popover, Tabs } from 'antd'
import React from 'react'
import { ModalProvider } from 'react-use-modal'
import { connect, GlobalModelState } from 'umi'
import _ from 'underscore'

import UserDAL from '@/store/userdal'
import DownLeft from '../down/downleft'
import DownRight from '../down/downright'
import PanLeft from '../pan/panleft'
import PanRight from '../pan/panright'
import PicLeft from '../pic/picleft'
import PicRight from '../pic/picright'
import RssLeft from '../rss/rssleft'
import RssRight from '../rss/rssright'
import SettingLeft from '../setting/settingleft'
import SettingRight from '../setting/settingright'
import ShareLeft from '../share/shareleft'
import ShareRight from '../share/shareright'
import UserInfo from '../user/userinfo'
const { Header, Footer, Sider, Content } = Layout

import '../dark.css'
import '../index.css'
import '../pageleft.css'

class PageMain extends React.Component<{ dispatch: any; global: GlobalModelState; user: UserModelState }, { sideWidth: number; sideUserWidth: number; sideResize: boolean; sideCollapsed: boolean }> {
  constructor(props: any) {
    super(props)
    this.state = { sideWidth: 300, sideUserWidth: 300, sideResize: false, sideCollapsed: false }
  }
  componentDidMount() {
    this.initResizeInfo()
    let width = 350
    if (this.containerWidth > 980) {
      width = Math.ceil(this.containerWidth * 0.3623)
      if (width > 680) width = 680
    }
    this.setState({ sideWidth: width, sideUserWidth: width })
    window.addEventListener('resize', this.throttled)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.throttled)
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PageMain' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  handleMinClick = (e: any) => {
    if (window.WebToElectron) window.WebToElectron({ cmd: 'minsize' })
  }
  handleMaxClick = (e: any) => {
    if (window.WebToElectron) window.WebToElectron({ cmd: 'maxsize' })
  }
  handleHideClick = (e: any) => {
    if (window.WebToElectron) window.WebToElectron({ cmd: SettingUI.uiExitOnClose ? 'exit' : 'close' })
  }

  containerWidth = 0
  collapsedWidth = 48
  leftMinWidth = 350
  rightMinWidth = 576
  initResizeInfo = () => {
    this.containerWidth = document.body.offsetWidth || 0
    let { sideWidth, sideUserWidth } = this.state as { sideWidth: number; sideUserWidth: number }
    const minWdith = this.leftMinWidth
    const maxWidth = this.containerWidth - this.rightMinWidth
    if (maxWidth < this.leftMinWidth) {
      SettingUI.mSaveUiLeftTreeCollapsed(true)
      this.setState({ sideCollapsed: true })
      return
    }
    if (sideUserWidth >= minWdith && sideUserWidth <= maxWidth) {
      SettingUI.mSaveUiLeftTreeCollapsed(false)
      this.setState({ sideWidth: sideUserWidth, sideCollapsed: false })
      return
    }
    sideWidth = sideUserWidth
    if (sideWidth > maxWidth) sideWidth = maxWidth
    if (sideWidth < minWdith) sideWidth = minWdith

    if (this.containerWidth > 980) {
      sideWidth = Math.ceil(this.containerWidth * 0.3623)
      if (sideWidth > 680) sideWidth = 680
    }
    SettingUI.mSaveUiLeftTreeCollapsed(false)
    this.setState({ sideWidth: sideWidth, sideCollapsed: false })
  }

  throttled = _.throttle(() => {
    this.initResizeInfo()
    let ddsound = document.getElementById('ddsound') as { play: any } | null
    if (ddsound) ddsound.play()
  }, 200)

  onSideResizeBegin = () => {
    window.addEventListener('mousemove', this.hResizeOver)
    window.addEventListener('mouseup', this.onSideResizeEnd)
    this.setState({ sideResize: true })
  }
  onSideResizeEnd = () => {
    window.removeEventListener('mousemove', this.hResizeOver)
    window.removeEventListener('mouseup', this.onSideResizeEnd)
    this.setState({ sideResize: false })
  }
  hResizeOver = (e: any) => {
    if (e.button + e.buttons == 0) {
      this.onSideResizeEnd()
      return
    }
    const { sideWidth, sideResize } = this.state as { sideWidth: number; sideResize: boolean }
    const minWdith = this.leftMinWidth
    const maxWidth = this.containerWidth - this.rightMinWidth
    if (sideResize && sideWidth >= minWdith && sideWidth <= maxWidth) {
      let newValue = e.clientX as number
      if (newValue < minWdith) newValue = minWdith
      if (newValue > maxWidth) newValue = maxWidth
      this.setState({ sideWidth: newValue, sideUserWidth: newValue })
    }
  }

  handleCollapsClick = (e: any) => {
    const { sideWidth, sideCollapsed } = this.state as { sideWidth: number; sideCollapsed: boolean }
    const minWdith = this.leftMinWidth
    const maxWidth = this.containerWidth - this.rightMinWidth
    if (sideWidth > maxWidth) {
      if (minWdith > maxWidth) {
        const winWidth = this.leftMinWidth + this.rightMinWidth + 10
        let win = window.Electron.remote.getCurrentWindow()
        let wsize = win.getSize()
        win.setSize(winWidth, wsize[1])
      }
      SettingUI.mSaveUiLeftTreeCollapsed(!sideCollapsed)
      this.setState({ sideWidth: minWdith, sideCollapsed: !sideCollapsed })
    } else {
      SettingUI.mSaveUiLeftTreeCollapsed(!sideCollapsed)
      this.setState({ sideCollapsed: !sideCollapsed })
    }
  }

  handleTabsClick = (key: string, e: any) => {
    const { dispatch } = this.props as any
    dispatch({ type: 'global/save', currentMenu: key })
  }

  handleUserInfoChange = (isShow: boolean) => {
    const { dispatch, user } = this.props
    dispatch({ type: 'global/save', showUserInfo: isShow })
    if (isShow && user.userID) UserDAL.UserRefreshByUserFace(user.userID, false)
  }

  handleHelpPage = () => {
    window.WebOpenWindow({ showPage: 'pageHelp' })
  }

  render() {
    const { global, user } = this.props
    const { sideWidth, sideResize, sideCollapsed } = this.state

    let hideSide = sideCollapsed || (global.currentMenu !== 'pan' && global.currentMenu !== 'pic')
    let sideWidthReal = global.currentMenu == 'pan' || global.currentMenu == 'pic' ? sideWidth : 186

    let userfacelist: string[] = UserDAL.GetUserListFace()

    return (
      <Layout className="root" onMouseLeave={this.onSideResizeEnd} draggable="false">
        <Header id="header" className="tophead" draggable="false">
          <div className="tophead2 q-electron-drag">
            <Button type="text" onClick={this.handleCollapsClick} title="展开/收缩左侧菜单">
              <i className={sideCollapsed ? 'iconfont iconmenuon' : 'iconfont iconmenuoff'}></i>
            </Button>
            <div className="title">小白羊</div>

            <Tabs activeKey={global.currentMenu} onTabClick={this.handleTabsClick}>
              <Tabs.TabPane tab="网盘" key="pan"></Tabs.TabPane>
              <Tabs.TabPane tab="相册" key="pic" disabled></Tabs.TabPane>
              <Tabs.TabPane tab="传输" key="down"></Tabs.TabPane>
              <Tabs.TabPane tab="分享" key="share"></Tabs.TabPane>
              <Tabs.TabPane tab="插件" key="rss"></Tabs.TabPane>
            </Tabs>
            <div className="flexauto"></div>

            <Avatar.Group style={{ margin: '0 8px 2px 0' }}>
              <Popover content={<UserInfo />} trigger="hover" visible={global.showUserInfo} placement="bottomRight" onVisibleChange={this.handleUserInfoChange}>
                {userfacelist.map((avatar, index) => (
                  <Avatar key={'fa' + index.toString()} className="userface" size={30} src={<img src={avatar} />} />
                ))}
              </Popover>
            </Avatar.Group>

            <Button type="text" onClick={() => this.handleTabsClick('setting', undefined)} title="设置">
              <i className="iconfont iconsetting"></i>
            </Button>
            <Button type="text" onClick={this.handleMinClick} title="最小化">
              <i className="iconfont iconzuixiaohua"></i>
            </Button>
            <Button type="text" onClick={this.handleMaxClick} title="最大化">
              <i className="iconfont iconfullscreen"></i>
            </Button>
            <Button type="text" onClick={this.handleHideClick} title={SettingUI.uiExitOnClose ? '彻底退出' : '隐藏到托盘'}>
              <i className="iconfont iconclose"></i>
            </Button>
          </div>
        </Header>
        <Layout style={{ cursor: sideResize ? 'col-resize' : 'default' }} draggable="false">
          <Sider id="sider" collapsible collapsed={sideCollapsed} collapsedWidth={this.collapsedWidth} theme="light" width={sideWidthReal} trigger={null}>
            <Tabs activeKey={global.currentMenu} tabPosition="right" className="siderTab">
              <Tabs.TabPane key="pan">
                <PanLeft collapsed={sideCollapsed} sideWidth={sideWidth} />
              </Tabs.TabPane>
              <Tabs.TabPane key="pic">
                <PicLeft />
              </Tabs.TabPane>
              <Tabs.TabPane key="down">
                <DownLeft />
              </Tabs.TabPane>
              <Tabs.TabPane key="share">
                <ShareLeft />
              </Tabs.TabPane>
              <Tabs.TabPane key="rss">
                <RssLeft />
              </Tabs.TabPane>
              <Tabs.TabPane key="setting">
                <SettingLeft />
              </Tabs.TabPane>
            </Tabs>
          </Sider>
          <div id="siderSplit" style={{ display: hideSide ? 'none' : '' }} className={sideResize ? 'resize' : ''} draggable="false" onMouseDown={this.onSideResizeBegin}>
            <div className="line"></div>
          </div>
          <Content id="content">
            <Tabs activeKey={global.currentMenu} tabPosition="right" className="contentTab">
              <Tabs.TabPane key="pan">
                <PanRight />
              </Tabs.TabPane>
              <Tabs.TabPane key="pic">
                <PicRight />
              </Tabs.TabPane>
              <Tabs.TabPane key="down">
                <DownRight />
              </Tabs.TabPane>
              <Tabs.TabPane key="share">
                <ShareRight />
              </Tabs.TabPane>
              <Tabs.TabPane key="rss">
                <RssRight />
              </Tabs.TabPane>
              <Tabs.TabPane key="setting">
                <SettingRight />
              </Tabs.TabPane>
            </Tabs>
          </Content>
        </Layout>
        <Footer id="footer" draggable="false">
          <div id="footer2">
            <div id="footLoading" className="footerBar fix" style={{ padding: '0 8px 0 0' }}></div>
            <div className="flexauto">
              <audio id="ddsound" src="notify.wav" loop={false}></audio>
            </div>
            <div className="footerBar fix">
              <i className="iconfont iconshangchuansudu" />
              <span id="footUploadSpeed"></span>
            </div>
            <div className="footerBar fix">
              <i className="iconfont iconxiazaisudu" />
              <span id="footDownSpeed"></span>
            </div>
            <div id="footAria" className="footerBar fix" style={{ padding: '0 8px' }}></div>
            <div style={{ padding: '0 8px' }}>{SettingConfig.appVersion}</div>
            <Popover
              placement="topRight"
              content={
                <div className="syncmessage">
                  耗时的(复制移动/导入链接/在线解压)会在这里跟踪结果
                  <hr />
                  (开发中，尚未实现)
                </div>
              }>
              <div className="footerBar fix">
                <i className="iconfont icontongzhiblue" />
                <span>异步通知</span>
              </div>
            </Popover>

            <div className="footerBar fix" style={{ margin: '0', cursor: 'pointer' }} onClick={this.handleHelpPage}>
              帮助文档
            </div>
          </div>
        </Footer>
      </Layout>
    )
  }
}

function mapStateToProps({ global, user }: { global: GlobalModelState; user: UserModelState }) {
  return { global, user }
}
export default connect(mapStateToProps)(PageMain)
