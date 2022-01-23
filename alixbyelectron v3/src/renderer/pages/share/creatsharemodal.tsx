import AliShare from '@/aliapi/share'
import { FolderIcon } from '@/components/folder'

import UserDAL from '@/store/userdal'
import { Button, Checkbox, DatePicker, Input, message, Modal, Popover, Space } from 'antd'
import moment from 'moment'
import React, { Key } from 'react'
import locale from 'antd/es/date-picker/locale/zh_CN'
import { randomSharePassword } from '@/store/format'
import { ShowEditShareModal } from './editsharemodal'
import { IAliGetDirModel } from '@/aliapi/models'
import SettingUI from '@/setting/settingui'
import SettingPan from '@/setting/settingpan'
import SettingLog from '@/setting/settinglog'
import PanDAL from '@/store/pandal'

export async function ShowCreatShareModal(files: IAliGetDirModel[]) {
  if (files.length <= 0) return

  const UserID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(UserID)
  if (!token || !token.access_token) {
    message.error('账号失效，操作取消')
    return
  }

  const model = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal creatsharemodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '540px', paddingBottom: '0' }
  })

  model.update({
    title: (
      <>
        创建分享链接<span className="sharetime"> (已选择{files.length}个文件) </span>
      </>
    ),
    content: (
      <div className="editshare">
        <CreatShare files={files} model={model} />
      </div>
    )
  })
}

class CreatShare extends React.Component<
  { files: IAliGetDirModel[]; model: { destroy: () => void; update: (configUpdate: any) => void } },
  {
    expiration: string
    share_pwd: string
    share_name: string
    open: boolean
    mutil: boolean
    btnloading: boolean
  }
> {
  constructor(props: any) {
    super(props)

    let share_pwd = ''
    if (SettingPan.uiSharePassword == 'random') share_pwd = randomSharePassword()
    else if (SettingPan.uiSharePassword == 'last') share_pwd = localStorage.getItem('share_pwd') || ''

    let expiration = Date.now()

    if (SettingPan.uiShareDays == 'always') expiration = 0
    else if (SettingPan.uiShareDays == 'week') expiration += 7 * 24 * 60 * 60 * 1000
    else expiration += 30 * 24 * 60 * 60 * 1000

    this.state = {
      expiration: expiration > 0 ? new Date(expiration).toString() : '',
      share_pwd: share_pwd,
      share_name: this.props.files[0].name,
      open: false,
      mutil: false,
      btnloading: false
    }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'CreatShare' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {}
  componentWillUnmount() {}
  handleOk = async () => {
    const UserID = UserDAL.QueryUserID()
    const token = UserDAL.GetUserToken(UserID)
    if (!token || !token.access_token) {
      message.error('账号失效，操作取消')
      return
    }
    let expiration = this.state.expiration
    let mindate = new Date()
    mindate.setMinutes(mindate.getMinutes() + 2)
    if (expiration) expiration = new Date(expiration) < mindate ? mindate.toISOString() : new Date(expiration).toISOString()
    else expiration = ''

    let share_pwd = this.state.share_pwd.trim().replaceAll(' ', '')
    if (share_pwd.length != 4 && share_pwd.length != 0) {
      message.error('提取码必须为 空 或者 4位 数字字母汉字特殊字符的组合')
      return
    }
    let share_name = this.state.share_name.trim().replaceAll('"', '')
    share_name = share_name.replace(/[<>\:"\\\|\?\*]+/g, '')
    share_name = share_name.replace(/[\f\n\r\t\v]/g, '')
    while (share_name.endsWith(' ') || share_name.endsWith('.')) share_name = share_name.substring(0, share_name.length - 1)
    if (share_name.length < 1) {
      message.error('必须填写名称')
      return
    }

    let file = PanDAL.QuerySelectDir()
    const drive_id = file.drive_id
    const file_id_list: string[] = []
    for (let i = 0, maxi = this.props.files.length; i < maxi; i++) {
      file_id_list.push(this.props.files[i].file_id)
    }
    this.setState({ btnloading: true })
    //1.创建
    localStorage.setItem('share_pwd', share_pwd)
    if (this.state.mutil == false) {
      const result = await AliShare.ApiCreatShare(UserID, drive_id, expiration, share_pwd, '', file_id_list)
      this.setState({ btnloading: false })
      if (typeof result == 'string') {
        message.error(result)
        return
      }
      setTimeout(() => {
        window.getDvaApp()._store.dispatch({ type: 'share/aRefresh' }) //创建需要等待5秒以上才能显示
      }, 5000)
      this.props.model.destroy()
      message.success('创建分享链接成功，请稍后刷新我的分享列表')
      ShowEditShareModal(true, [result])
    } else {
      const result = await AliShare.ApiCreatShareBatch(UserID, drive_id, expiration, share_pwd, file_id_list)
      this.setState({ btnloading: false })
      setTimeout(() => {
        window.getDvaApp()._store.dispatch({ type: 'share/aRefresh' }) //创建需要等待5秒以上才能显示
      }, 5000)
      this.props.model.destroy()
      message.success('创建 ' + result.toString() + '条 分享链接成功，请稍后刷新我的分享列表')
    }
  }

  handleTime = (hours: number) => {
    if (hours == 0) this.setState({ expiration: '', open: false })
    else {
      let mindate = new Date()
      mindate.setHours(mindate.getHours() + hours, mindate.getMinutes() + 2)
      this.setState({ expiration: mindate.toISOString(), open: false })
    }
  }

  render() {
    return (
      <>
        <div className="flex flexnoauto" style={{ margin: '0 0 8px 0' }}>
          <Space direction="vertical" size={0} style={{ width: '100%' }}>
            <span style={{ paddingLeft: '2px', paddingRight: '8px' }}>名称</span>
            <Input minLength={1} style={{ width: '100%' }} value={this.state.share_name} placeholder="不能为空" onChange={(e) => this.setState({ share_name: e.target.value })} disabled />
          </Space>
        </div>
        <div className="flex flexnoauto" style={{ margin: '0 0 16px 0' }}>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}>有效期</span>
            <DatePicker
              className="ShareDatePicker"
              allowClear={false}
              showTime
              showNow={false}
              value={this.state.expiration ? moment(new Date(this.state.expiration), 'YYYY/MM/DD HH:mm:ss') : undefined}
              placeholder="永久有效"
              format={'YYYY/MM/DD HH:mm:ss'}
              locale={locale}
              open={this.state.open}
              onChange={(e) => {
                this.setState({ expiration: e?.toISOString(true) || '', open: false })
              }}
              onOpenChange={(val) => {
                this.setState({ open: val })
              }}
              renderExtraFooter={() => (
                <Space>
                  <Button key="td0" type="primary" size="small" onClick={(e) => this.handleTime(0)}>
                    永久有效
                  </Button>
                  <Button key="td1" type="primary" size="small" onClick={(e) => this.handleTime(3)}>
                    3小时
                  </Button>
                  <Button key="td2" type="primary" size="small" onClick={(e) => this.handleTime(24)}>
                    一天
                  </Button>
                  <Button key="td3" type="primary" size="small" onClick={(e) => this.handleTime(72)}>
                    三天
                  </Button>
                  <Button key="td4" type="primary" size="small" onClick={(e) => this.handleTime(168)}>
                    一周
                  </Button>
                  <Button key="td5" type="primary" size="small" onClick={(e) => this.handleTime(336)}>
                    两周
                  </Button>
                  <Button key="td6" type="primary" size="small" onClick={(e) => this.handleTime(720)}>
                    一月
                  </Button>
                </Space>
              )}
            />
          </Space>
          <div style={{ margin: '0 16px' }}></div>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}>提取码</span>
            <Input minLength={4} maxLength={4} style={{ maxWidth: '100px' }} value={this.state.share_pwd} placeholder="没有不填" onChange={(e) => this.setState({ share_pwd: e.target.value })} />
          </Space>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}></span>
            <Popover
              content={
                <div>
                  <span className="opred">有效期</span> <span className="oporg">1分钟--永远有效</span>：<br />
                  分享链接的有效期，过期后此链接无法被访问，
                  <br />
                  但可以重新修改此链接的有效期，使链接恢复可用
                  <hr />
                  <span className="opred">提取码</span> <span className="oporg">空 / 4位数字字母汉字特殊字符</span>：<br />
                  提取码可以重复修改，只有使用最新的正确的提取码才可以访问该分享链接
                  <hr />
                  <span className="oporg">提示</span>：可以在设置里修改默认的分享有效期和默认的提取码
                </div>
              }>
              <i className="iconfont iconbulb" />
            </Popover>
          </Space>
          <div className="flexauto"></div>
          <div style={{ margin: '0 16px' }}></div>
          <Space direction="vertical" size={0}>
            <span style={{ paddingLeft: '2px' }}></span>
            <Button type="primary" onClick={this.handleOk} loading={this.state.btnloading}>
              创建分享
            </Button>
          </Space>
        </div>
        <div className="flex flexnoauto" style={{ margin: '0 0 16px 0' }}>
          <Space direction="vertical" size={0}>
            <Checkbox checked={this.state.mutil} onChange={(e) => this.setState({ mutil: e.target.checked })}>
              为每个文件都创建一条分享链接
            </Checkbox>
          </Space>
          <Space direction="vertical" size={0}>
            <Popover
              content={
                <div>
                  <span className="opred">默认</span> <span className="oporg">不勾选</span>： 只创建一条分享链接，包含全部选中的文件
                  <br />
                  勾选后：会创建多条链接，每个链接只包含一个文件(夹)
                  <br />
                  例如：选择了5个文件，会创建5条分享链接
                </div>
              }>
              <i className="iconfont iconbulb" />
            </Popover>
          </Space>
        </div>
      </>
    )
  }
}
