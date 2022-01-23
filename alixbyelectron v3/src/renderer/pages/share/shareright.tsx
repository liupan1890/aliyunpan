import SettingLog from '@/setting/settinglog'
import { Tabs } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import MyDingYueRight from './MyDingYueRight'
import MyShareRight from './MyShareRight'
import OtherShareRight from './OtherShareRight'
import RssSearch from './RssSearch'
import './share.css'

class ShareRight extends React.Component<{ global: GlobalModelState }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  render() {
    return (
      <div className="pageright" style={{ position: 'relative', height: '100%' }}>
        <Tabs activeKey={this.props.global.currentPage} tabPosition="right" className="contentTab">
          <Tabs.TabPane key="MyShareRight">
            <MyShareRight />
          </Tabs.TabPane>
          <Tabs.TabPane key="MyDingYueRight">
            <MyDingYueRight />
          </Tabs.TabPane>
          <Tabs.TabPane key="OtherShareRight">
            <OtherShareRight />
          </Tabs.TabPane>
          <Tabs.TabPane key="RssSearch">
            <RssSearch />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(ShareRight)
