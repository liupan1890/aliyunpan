import SettingLog from '@/setting/settinglog'
import React from 'react'
import { connect, SettingModelState } from 'umi'
import './pic.css'


class PicRight extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PicRight' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
    
  }
  render() {
    return <div className="pageright"></div>
  }
}

export default connect(({ setting }: { setting: SettingModelState }) => ({
  setting
}))(PicRight)
