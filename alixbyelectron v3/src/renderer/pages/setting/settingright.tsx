import SettingLog from '@/setting/settinglog'
import { Tabs } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './setting.css'
import TabYinSi from './tabyinsi'
import TabAria2 from './tabaria2'
import TabDebug from './tabdebug'
import TabDown from './tabdown'
import TabLog from './tablog'
import TabPan from './tabpan'
import TabUI from './tabui'

class SettingRight extends React.Component<{ global: GlobalModelState }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'SettingRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  render() {
    return (
      <div className="pageright">
        <Tabs activeKey={this.props.global.currentPage} tabPosition="right" className="contentTab">
          <Tabs.TabPane key="SettingDown">
            <TabDown />
          </Tabs.TabPane>
          <Tabs.TabPane key="SettingUI">
            <TabUI />
          </Tabs.TabPane>
          <Tabs.TabPane key="SettingPan">
            <TabPan />
          </Tabs.TabPane>
          <Tabs.TabPane key="SettingAria">
            <TabAria2 />
          </Tabs.TabPane>
          <Tabs.TabPane key="SettingYinSi">
            <TabYinSi />
          </Tabs.TabPane>
          <Tabs.TabPane key="SettingDebug">
            <TabDebug />
          </Tabs.TabPane>
          <Tabs.TabPane key="SettingLog">
            <TabLog />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(SettingRight)
