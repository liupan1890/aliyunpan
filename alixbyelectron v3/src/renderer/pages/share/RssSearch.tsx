import { B64decode } from '@/store/format'

import ServerHttp from '@/aliapi/server'
import { Alert, Card, Checkbox, Popover } from 'antd'
import React from 'react'
import { connect, ShareModelState } from 'umi'
import './share.css'
import SettingLog from '@/setting/settinglog'
class RssSearch extends React.Component<{ share: ShareModelState; dispatch: any }> {
  constructor(props: any) {
    super(props)
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'RssSearch' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    if (this.props.share.ShareSiteList.length == 0) {
      ServerHttp.CheckUpgrade(false)
    }
  }
  handleSite = (url: string) => {
    if (url.startsWith('http')) {
      window.Electron.shell.openExternal(url)
    } else {
      const ourl = B64decode(url)
      if (ourl) window.Electron.shell.openExternal(ourl)
    }
  }
  render() {
    return (
      <Card title="搜索到的一些阿里云盘分享网站,欢迎投稿" style={{ margin: '24px 4px', overflow: 'visible' }}>
        {this.props.share.ShareSiteList.map((item, index) => (
          <Card.Grid
            style={{
              width: '33.33%',
              textAlign: 'center'
            }}
            key={'site' + index}>
            <a onClick={() => this.handleSite(item.url)}>{item.title}</a>
          </Card.Grid>
        ))}
      </Card>
    )
  }
}
export default connect(({ share }: { share: ShareModelState }) => ({
  share
}))(RssSearch)
