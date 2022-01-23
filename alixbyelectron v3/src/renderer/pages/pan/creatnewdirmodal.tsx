import AliFile from '@/aliapi/file'
import AliFileCmd from '@/aliapi/filecmd'
import SettingLog from '@/setting/settinglog'
import SettingPan from '@/setting/settingpan'
import { ClearFileName } from '@/store/aria2c'
import PanDAL from '@/store/pandal'
import PanStore from '@/store/panstore'

import UserDAL from '@/store/userdal'
import { Input, message, Modal } from 'antd'
import React from 'react'

let _ShowCreatNewDirModal = false
export function ShowCreatNewDirModal(type: string, driveid: string, parentdirid: string, callback: any) {
  if (_ShowCreatNewDirModal) return
  _ShowCreatNewDirModal = true
  setTimeout(() => {
    _ShowCreatNewDirModal = false
  }, 500)
  const userID = UserDAL.QueryUserID()
  if (!userID) {
    message.info('请先登录一个阿里云盘账号')
    return
  }

  const modal = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal creatfoldermodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '440px', paddingBottom: '0' }
  })

  modal.update({
    title: '新建文件夹',
    content: <CreatNewDir type={type} driveid={driveid} parentdirid={parentdirid} callback={callback} modal={modal} />
  })
}

class CreatNewDir extends React.Component<{ type: string; driveid: string; parentdirid: string; callback: any; modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean; isIndex: boolean; dirname: string }> {
  constructor(props: any) {
    super(props)
    let dirname = ''
    let isIndex = false
    if (this.props.type == 'newdatefolder') {
      const date = new Date(Date.now())
      const y = date.getFullYear().toString()
      let m: number | string = date.getMonth() + 1
      m = m < 10 ? '0' + m.toString() : m.toString()
      let d: number | string = date.getDate()
      d = d < 10 ? '0' + d.toString() : d.toString()
      let h: number | string = date.getHours()
      h = h < 10 ? '0' + h.toString() : h.toString()
      let minute: number | string = date.getMinutes()
      minute = minute < 10 ? '0' + minute.toString() : minute.toString()
      let second: number | string = date.getSeconds()
      second = second < 10 ? '0' + second.toString() : second.toString()

      dirname = SettingPan.uiTimeFolderFormate.replace(/yyyy/g, y).replace(/MM/g, m).replace(/dd/g, d).replace(/HH/g, h).replace(/mm/g, minute).replace(/ss/g, second)
      if (SettingPan.uiTimeFolderFormate.indexOf('#') >= 0) {
        isIndex = true
        dirname = dirname.replace(/\#{1,}/g, function (val) {
          return SettingPan.uiTimeFolderIndex.toString().padStart(val.length, '0')
        })
      }
    }
    this.state = { loading: false, dirname, isIndex }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShareLinkInput' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {}
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }

  handleCreatFolder = (newname: any) => {
    if (!newname) return
    if (typeof newname != 'string') return
    newname = newname.replace(/[<>\:"\\\|\?\*]+/g, '')
    newname = newname.replace(/[\f\n\r\t\v]/g, '')
    while (newname.endsWith(' ') || newname.endsWith('.')) newname = newname.substring(0, newname.length - 1)
    newname = newname.trim()
    if (!newname) return
    const token = UserDAL.GetUserToken(UserDAL.QueryUserID())
    if (!token || !token.access_token) {
      message.error('新建文件夹失败 账号失效，操作取消')
      return
    }
    const dir = PanStore.GetDir(this.props.driveid, this.props.parentdirid)
    if (!dir.file_id) {
      message.error('新建文件夹失败 父文件夹错误')
      return
    }

    AliFileCmd.ApiCreatNewForder(token.user_id, dir.drive_id, dir.file_id, newname)
      .then((data) => {
        if (data == undefined) message.error('新建文件夹 失败')
        else if (data == 'QuotaExhausted.Drive') message.error('新建文件夹失败：网盘空间已满')
        else {
          message.success('新建文件夹 成功')
          if (this.state.isIndex) SettingPan.mSaveUiTimeFolderIndex(SettingPan.uiTimeFolderIndex + 1)
          if (PanDAL.QuerySelectDir().file_id == this.props.parentdirid) {
            //刷新父文件夹
            window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
          } else {
            //在复制移动到窗口里创建，进调用强制刷新缓存
            return PanDAL.GetDirFileList(token.user_id, dir.drive_id, dir.file_id, true)
          }
        }
      })
      .catch((e: any) => {
        message.error('新建文件夹 失败 ' + (e.message || ''))
      })
      .then(() => {
        this.props.modal.destroy()
        if (this.props.callback) this.props.callback()
      })
  }

  inputRef = React.createRef<Input>()
  render() {
    return (
      <div>
        <div className="settingrow">
          <Input.Search ref={this.inputRef} defaultValue={this.state.dirname} enterButton="创建" autoFocus onKeyDown={(e) => e.stopPropagation()} onSearch={this.handleCreatFolder} />
        </div>
        <div className="settingrow">
          <span className="oporg">注：</span>文件夹名不要有特殊字符：<span className="opblue">{' < > : * ? \\ / \' " '}</span>
          <br />
          <br />
        </div>
      </div>
    )
  }
}
