import SettingLog from '@/setting/settinglog'
import { Tabs } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './rss.css'
import RssXiMa from './RssXiMa'

class RssRight extends React.Component<{ global: GlobalModelState }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'RssRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  render() {
    return (
      <div className="pageright">
        <Tabs activeKey={this.props.global.currentPage} tabPosition="right" className="contentTab">
          <Tabs.TabPane key="RssFileSync">文件同步盘，只自动上传，只自动下载，双向自动同步</Tabs.TabPane>
          <Tabs.TabPane key="RssFileScan">扫描重复文件，然后勾选删除</Tabs.TabPane>
          <Tabs.TabPane key="RssFolderEnmpty">扫描空文件夹，然后勾选删除</Tabs.TabPane>
          <Tabs.TabPane key="RssFileCopy">多个帐号间的文件复制</Tabs.TabPane>
          <Tabs.TabPane key="RssOffline">离线任务，等待阿里云盘链接任务功能开放</Tabs.TabPane>
          <Tabs.TabPane key="RssXiMa">
            <RssXiMa />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(RssRight)
