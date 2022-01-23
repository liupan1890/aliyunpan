
import SettingLog from '@/setting/settinglog'
import { Menu } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './rss.css'

class RssLeft extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'RssLeft' + (error.message || ''))
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
        <div className="headdesc">好玩的插件</div>
        <Menu className="leftmenu" mode="inline" selectedKeys={[global.currentPage]} onSelect={this.handleSelectPage}>
          <Menu.Item key="RssXiMa" title={'视频文件洗码'} icon={<i className="iconfont iconweixiang" />}>
            视频文件洗码
          </Menu.Item>
          <Menu.Item key="RssFileSync" title={'文件同步盘'} icon={<i className="iconfont iconcloud-sync" />}>
            文件同步盘
          </Menu.Item>
          <Menu.Item key="RssFileScan" title={'扫描重复文件'} icon={<i className="iconfont iconclear" />}>
            扫描重复文件
          </Menu.Item>
          <Menu.Item key="RssFolderEnmpty" title={'扫描空文件夹'} icon={<i className="iconfont iconempty" />}>
            扫描空文件夹
          </Menu.Item>
          <Menu.Item key="RssFileCopy" title={'帐号间文件复制'} icon={<i className="iconfont iconyonghu" />}>
            帐号间文件复制
          </Menu.Item>
          <Menu.Item key="RssOffline" title={'离线任务'} icon={<i className="iconfont iconcloud-download" />}>
            离线任务
          </Menu.Item>
        </Menu>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(RssLeft)
