
import SettingLog from '@/setting/settinglog'
import { Menu } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './down.css'


class DownLeft extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'DownLeft' + (error.message || ''))
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
        <div className="headdesc">本地下载/上传的文件</div>
        <Menu className="leftmenu" mode="inline" selectedKeys={[global.currentPage]} onSelect={this.handleSelectPage}>
          <Menu.Item key="DowningRight" title={'下载中'} icon={<i className="iconfont icondownload" />}>
            下载中
          </Menu.Item>
          <Menu.Item key="DownedRight" title={'已下载完'} icon={<i className="iconfont icondesktop" />}>
            已下载完
          </Menu.Item>
          <Menu.Item key="UploadingRight" title={'上传中'} icon={<i className="iconfont iconcloud-upload" />}>
            上传中
          </Menu.Item>
          <Menu.Item key="UploadedRight" title={'已上传完'} icon={<i className="iconfont iconcloud_success" />}>
            已上传完
          </Menu.Item>
        </Menu>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(DownLeft)
