import SettingAria from '@/setting/settingaria'
import SettingLog from '@/setting/settinglog'
import { AriaChangeToLocal, AriaChangeToRemote, AriaTest } from '@/store/aria2c'
import { Alert, Button, Checkbox, Input, message, Popover } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import React from 'react'
import { connect, SettingModelState } from 'umi'

import './setting.css'

class TabAria2 extends React.Component<{}, { ariaSavePath: string; ariaUrl: string; ariaPwd: string }> {
  constructor(props: any) {
    super(props)
    this.state = {
      ariaSavePath: SettingAria.ariaSavePath,
      ariaUrl: SettingAria.ariaUrl,
      ariaPwd: SettingAria.ariaPwd
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'TabAria2' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  handleAriaSavePathChange = (e: any) => {
    let val2 = e.target.value || ''
    val2 = val2.trim()
    this.setState({ ariaSavePath: val2 })
  }
  handleAriaUrlChange = (e: any) => {
    let val2: string = e.target.value || ''
    val2 = val2.replaceAll('：', ':')
    if (val2.indexOf('://') > 0) val2 = val2.substring(val2.indexOf('://') + 3)
    if (val2.indexOf('/js') > 0) val2 = val2.substring(0, val2.indexOf('/js'))
    val2 = val2.trim()

    this.setState({ ariaUrl: val2 })
  }
  handleAriaPwdChange = (e: any) => {
    let val2 = e.target.value || ''
    val2 = val2.trim()
    this.setState({ ariaPwd: val2 })
  }

  handleAriaHttpsChange = (e: CheckboxChangeEvent) => {
    SettingAria.mSaveAriaHttps(e.target.checked)
  }

  handleAriaConn = () => {
    let { ariaSavePath, ariaUrl, ariaPwd } = this.state
    ariaSavePath = ariaSavePath.trim()
    ariaUrl = ariaUrl.trim()
    ariaPwd = ariaPwd.trim()
    if (!ariaSavePath || (ariaSavePath.indexOf('/') < 0 && ariaSavePath.indexOf('\\') < 0)) {
      message.error('下载保存 必须包含路径分隔符 \\或者/')
      return
    }
    SettingAria.mSaveAriaSavePath(ariaSavePath)

    if (!ariaUrl || ariaUrl.indexOf(':') < 0) {
      message.error('连接地址 必须包含 :')
      return
    }

    SettingAria.mSaveAriaUrl(ariaUrl)

    SettingAria.mSaveAriaPwd(ariaPwd)
    if (!ariaPwd) {
      message.error('连接密码 不能为空，不能包含特殊字符')
      return
    }
    SettingAria.mSaveAriaLoading(true)
    try {
      const host = ariaUrl.split(':')[0]
      const port = parseInt(ariaUrl.split(':')[1])
      const secret = ariaPwd
      AriaTest(SettingAria.ariaHttps, host, port, secret).then((issuccess) => {
        if (issuccess == true) {
          SettingAria.mSaveAriaState('remote')
          AriaChangeToRemote().then((isOnline: boolean | undefined) => {
            SettingAria.mSaveAriaLoading(false)
            if (isOnline == true) {
              message.success('连接到远程Aria服务器：成功！')
            } else if (isOnline == undefined) {
              message.warning('连接到远程Aria服务器：正忙，稍后再试！')
            } else {
              message.error('连接到远程Aria服务器：失败！')
            }
          })
        } else {
          SettingAria.mSaveAriaLoading(false)
        }
      })
    } catch (e: any) {
      SettingAria.mSaveAriaLoading(false)
      message.error('数据格式错误！' + e.message)
    }
  }

  handleAriaOff = (tip: boolean) => {
    SettingAria.mSaveAriaLoading(true)
    SettingAria.mSaveAriaState('local')
    AriaChangeToLocal()
      .then((isOnline: boolean) => {
        SettingAria.mSaveAriaLoading(false)
        if (tip) {
          if (isOnline == true) message.warning('已经从远程断开，并连接到本地Aria')
          else message.error('已经从远程断开，连接到本地Aria失败')
        }
      })
      .catch(() => {
        SettingAria.mSaveAriaLoading(false)
        message.error('已经从远程断开，连接到本地Aria失败')
      })
  }

  render() {
    const isRemote = SettingAria.ariaState != 'local'
    const ariaLoading = SettingAria.ariaLoading
    return (
      <div className="settingbody rightbodysc">
        <Alert
          className="warninginfo"
          message="支持连接到远程的Aria2下载"
          description={
            <div>
              把文件直接下载到远程的NAS/VPS/群晖/Dockor
              <br />
              有正在下载的任务时，请不要切换本地/远程模式
              <br />
              不支持 本地和远程同时下载！
            </div>
          }
          type="warning"
        />
        <div className="settinghead">:Aria远程文件下载保存位置</div>
        <div className="settingrow">
          <Input disabled={isRemote} value={this.state.ariaSavePath} placeholder="粘贴远程电脑上的文件夹路径" style={{ maxWidth: '300px' }} onChange={this.handleAriaSavePathChange} />

          <Popover
            content={
              <div>
                这里是运行着Aria的电脑上的，下载文件的保存路径，手动填写
                <br />
                例如：<span className="opblue">/home/user/Desktop</span>就是把文件下载到远程电脑的桌面
                <div className="hrspace"></div>
                <span className="oporg">注意</span> windows路径分隔符为<span className="opblue">\</span>，macOS&Linux 为<span className="opblue">/</span> 千万别填错
              </div>
            }>
            <i className="iconfont iconbulb" />
          </Popover>
        </div>
        <div className="settinghead">:Aria连接地址RPC IP:Port 或 域名:Port</div>
        <div className="settingrow">
          <Input
            addonBefore="ws://"
            addonAfter="/jsonrpc"
            disabled={isRemote}
            value={this.state.ariaUrl}
            placeholder="Aria2连接地址（IP:Port）"
            style={{ maxWidth: '300px' }}
            onChange={this.handleAriaUrlChange}
          />
          <Popover
            content={
              <div>
                例如：<span className="opblue">43.211.17.85:6800</span> 手动输入，只填IP和端口号，IP:Port <br />
                例如：<span className="opblue">aria2.yuming.com:6800</span> 手动输入，只填域名和端口号，IP:Port
                <br />
                小白羊会使用ws:
                <div className="hrspace"></div>
                <span className="oporg">注意</span> 默认不支持wss和https，如果你的Aria2开启了https代理会连接失败
              </div>
            }>
            <i className="iconfont iconbulb" />
          </Popover>
        </div>
        <div className="settinghead">:Aria连接密码 secret</div>
        <div className="settingrow">
          <Input disabled={isRemote} value={this.state.ariaPwd} placeholder="Aria2连接密码" style={{ maxWidth: '190px' }} onChange={this.handleAriaPwdChange} />
          <Popover
            placement="right"
            content={
              <div>
                例如：<span className="opblue">S4znWTaZYQi3cpRN</span>
                <br /> 必填，不支持空密码，不要有特殊字符
              </div>
            }>
            <i className="iconfont iconbulb" />
          </Popover>
        </div>
        <div className="settinghead">:Aria使用ssl链接</div>
        <div className="settingrow">
          <Checkbox checked={SettingAria.ariaHttps} onChange={this.handleAriaHttpsChange}>
            使用ssl链接(wss 或 https)
          </Checkbox>
          <Popover
            placement="right"
            content={
              <div>
                <span className="opblue">默认不勾选</span> ：默认使用 ws 或 http 链接
                <br />
                勾选后，使用ssl链接( wss 或 https )
                <br />
                需要自己在远程aria电脑上配置好证书， <br />
                仅支持域名证书，不支持自己发布的私有证书
              </div>
            }>
            <i className="iconfont iconbulb" />
          </Popover>
        </div>

        <div className="settinghead">:Aria连接状态</div>
        <div className="settingrow" style={{ display: isRemote ? 'none' : '' }}>
          <Button type="primary" onClick={this.handleAriaConn} loading={ariaLoading}>
            当前是 本地模式，点击切换
          </Button>
        </div>
        <div className="settingrow" style={{ display: ariaLoading ? 'none' : isRemote ? 'none' : '' }}>
          新创建的下载任务都会下载到本地，只能管理本地的下载任务
        </div>

        <div className="settingrow" style={{ display: isRemote ? '' : 'none' }}>
          <Button type="primary" danger onClick={() => this.handleAriaOff(true)} loading={ariaLoading}>
            当前是 远程Aria模式，点击切换
          </Button>
        </div>
        <div className="settingrow" style={{ display: ariaLoading ? 'none' : isRemote ? '' : 'none' }}>
          远程模式，新创建的下载任务都会下载到Aria服务器上，不会下载到本地，只能管理远程的下载任务。注意：远程下载时不能退出小白羊
        </div>
      </div>
    )
  }
}

export default connect(({ setting }: { setting: SettingModelState }) => ({
  setting
}))(TabAria2)
