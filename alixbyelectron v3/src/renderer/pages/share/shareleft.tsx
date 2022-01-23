import SettingLog from '@/setting/settinglog'
import { Menu } from 'antd'
import React from 'react'
import { connect, GlobalModelState } from 'umi'
import './share.css'

class ShareLeft extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareLeft' + (error.message || ''))
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
        <div className="headdesc">阿里云盘分享</div>
        <Menu className="leftmenu" mode="inline" selectedKeys={[global.currentPage]} onSelect={this.handleSelectPage}>
          <Menu.Item key="MyShareRight" title={'我创建的分享'} icon={<i className="iconfont iconfenxiang" />}>
            我创建的分享
          </Menu.Item>
          <Menu.Item key="MyDingYueRight" title={'我的订阅'} icon={<i className="iconfont icondingyue" />}>
            我的订阅
          </Menu.Item>
          <Menu.Item key="OtherShareRight" title={'其他人的分享'} icon={<i className="iconfont iconfenxiang1" />}>
            导入过的分享
          </Menu.Item>
          <Menu.Item key="RssSearch" title={'分享链接搜索'} icon={<i className="iconfont iconrvip" />}>
            分享链接搜索
          </Menu.Item>
        </Menu>
      </div>
    )
  }
}

export default connect(({ global }: { global: GlobalModelState }) => ({
  global
}))(ShareLeft)
