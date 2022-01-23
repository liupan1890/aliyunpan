import SettingLog from '@/setting/settinglog'

import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './pic.css'


class PicLeft extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'PicLeft' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
    
  }
  render() {
    return <div className="pageleft"></div>
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(PicLeft)
