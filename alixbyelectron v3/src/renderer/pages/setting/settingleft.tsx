import SettingLog from '@/setting/settinglog'
import { Menu } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './setting.css'

class SettingLeft extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'SettingLeft' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  handleSelectPage = (e: any) => {
    const { dispatch } = this.props as { dispatch: any }
    dispatch({ type: 'global/save', currentPage: e.key })
  }

  render() {
    const { global } = this.props as { global: GlobalModelState }
    return (
      <div className="pageleft">
        <div className="headdesc">APP 设置项</div>
        <Menu className="leftmenu" mode="inline" selectedKeys={[global.currentPage]} onSelect={this.handleSelectPage}>
          <Menu.Item key="SettingDown" title={'上传下载'} icon={<i className="iconfont icondownload" />}>
            上传下载
          </Menu.Item>
          <Menu.Item key="SettingUI" title={'UI界面'} icon={<i className="iconfont iconui" />}>
            UI界面
          </Menu.Item>
          <Menu.Item key="SettingPan" title={'网盘'} icon={<i className="iconfont iconfile-folder" />}>
            网盘
          </Menu.Item>
          <Menu.Item key="SettingAria" title={'Aria远程下载'} icon={<i className="iconfont iconchuanshu" />}>
            Aria远程下载
          </Menu.Item>
          <Menu.Item key="SettingYinSi" title={'隐私保护'} icon={<i className="iconfont iconinstagram" />}>
            隐私保护
          </Menu.Item>
          <Menu.Item key="SettingDebug" title={'高级选项'} icon={<i className="iconfont iconlogoff" />}>
            高级选项
          </Menu.Item>
          <Menu.Item key="SettingLog" title={'运行日志'} icon={<i className="iconfont icondebug" />}>
            运行日志
          </Menu.Item>
        </Menu>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(SettingLeft)
