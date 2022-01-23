
import SettingLog from '@/setting/settinglog'
import { Tabs } from 'antd'
import React from 'react'
import { connect, GlobalModelState, PanModelState } from 'umi'
import './down.css'
import Downed from './downed'
import Downing from './downing'
import Uploaded from './uploaded'
import Uploading from './uploading'


class DownRight extends React.Component<{ global: GlobalModelState; pan: PanModelState }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'DownRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
    
  }
  render() {
    return (
      <div className="pageright" style={{ position: 'relative', height: '100%' }}>
        <Tabs activeKey={this.props.global.currentPage} tabPosition="right" className="contentTab">
          <Tabs.TabPane key="DowningRight">
            <Downing />
          </Tabs.TabPane>
          <Tabs.TabPane key="DownedRight">
            <Downed />
          </Tabs.TabPane>
          <Tabs.TabPane key="UploadingRight">
            <Uploading />
          </Tabs.TabPane>
          <Tabs.TabPane key="UploadedRight">
            <Uploaded />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}

export default connect(({ global, pan }: { global: GlobalModelState; pan: PanModelState }) => ({
  global,
  pan
}))(DownRight)
