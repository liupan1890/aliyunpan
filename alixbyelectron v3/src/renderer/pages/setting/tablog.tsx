import ServerHttp from '@/aliapi/server'
import SettingConfig from '@/setting/settingconfig'
import SettingLog from '@/setting/settinglog'
import { Button, List, Typography } from 'antd'
import { connect, SettingModelState } from 'umi'
import './setting.css'
const TabLog = ({ dispatch, setting }: { dispatch: any; setting: SettingModelState }) => {
  return (
    <div className="settingbody" style={{ paddingTop: '0' }}>
      <div className="settinghead first" style={{ textAlign: 'center' }}></div>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <Typography.Title level={4}>阿里云盘小白羊版 {SettingConfig.appVersion}</Typography.Title>
      </div>
      <div style={{ textAlign: 'center', width: '100%' }}>
        <Button type="link" className="outline" onClick={() => ServerHttp.CheckUpgrade(true)}>
          检查更新
        </Button>
      </div>
      <div className="settinghead first">:运行日志</div>
      <div style={{ height: 'calc(100vh - 270px)' }}>
        <List
          className="loglist"
          size="small"
          bordered
          dataSource={SettingLog.logList}
          renderItem={(item) => (
            <List.Item draggable="false">
              <Typography.Text type={item.logtype}>[{item.logtime}]</Typography.Text> {item.logmessage}
            </List.Item>
          )}
        />
      </div>
      <div style={{ textAlign: 'right', width: '100%', marginTop: '8px' }}>
        <Button type="link" className="outline" onClick={() => SettingLog.mSaveLogClear()}>
          清空日志
        </Button>
        <span style={{ paddingLeft: '24px' }}></span>
        <Button type="link" className="outline" onClick={() => SettingLog.mSaveLogCopy()}>
          复制日志
        </Button>
      </div>
    </div>
  )
}

export default connect(({ setting }: { setting: SettingModelState }) => ({
  setting
}))(TabLog)
