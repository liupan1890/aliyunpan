import AliFile from '@/aliapi/file'
import AliFileCmd from '@/aliapi/filecmd'
import { IAliGetDirModel } from '@/aliapi/models'
import SettingLog from '@/setting/settinglog'
import PanDAL from '@/store/pandal'
import PanStore from '@/store/panstore'

import UserDAL from '@/store/userdal'
import { Button, Form, FormInstance, Input, message, Modal } from 'antd'
import React from 'react'

let _ShowRenameSingleModal = false
export function ShowRenameSingleModal(istree: boolean) {
  if (_ShowRenameSingleModal) return
  _ShowRenameSingleModal = true
  setTimeout(() => {
    _ShowRenameSingleModal = false
  }, 500)
  const userID = UserDAL.QueryUserID()
  if (!userID) {
    message.info('请先登录一个阿里云盘账号')
    return
  }

  if (istree == false && PanDAL.QuerySelectedFileKeys().length > 1) {
    message.info('此版本暂不支持')
    return
  }

  let file = PanDAL.QuerySelectDir()
  let isdir = istree
  if (!istree) {
    file = PanDAL.QuerySelectedFileList()[0]
    isdir = PanDAL.QuerySelectedFileList()[0].isdir
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
    title: '重命名文件/文件夹',
    content: <RenameSingle istree={istree} isdir={isdir} file={file} modal={modal} />
  })
}

class RenameSingle extends React.Component<{ istree: boolean; isdir: boolean; file: IAliGetDirModel; modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean }> {
  constructor(props: any) {
    super(props)

    this.state = { loading: false }
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

  handleRename = () => {
    let newname = this.formRef.current?.getFieldValue('filename') as string
    newname = newname.replace(/[<>\:"\\\|\?\*]+/g, '')
    newname = newname.replace(/[\f\n\r\t\v]/g, '')
    while (newname.endsWith(' ') || newname.endsWith('.')) newname = newname.substring(0, newname.length - 1)
    newname = newname.trim()
    const token = UserDAL.GetUserToken(UserDAL.QueryUserID())
    if (!token || !token.access_token) {
      message.error('账号失效，操作取消')
      return
    }
    const file = this.props.file
    if (file.name == newname) return //不需要重命名

    AliFileCmd.ApiRenameBatch(token.user_id, file.drive_id, [file.file_id], [newname])
      .then((data) => {
        if (data == 1) {
          PanStore.DeleteDirFileList(file.drive_id, ['favorite', 'search', file.parent_file_id]) //删除所有父文件夹的缓存

          //刷新树，顶部路径，网盘、收藏、搜索 右侧文件列表，里面的文件夹名
          if (this.props.istree) {
            PanDAL.GetDirFileList(token.user_id, file.drive_id, file.parent_file_id, true).then(() => {
              window.getDvaApp()._store.dispatch({ type: 'treedir/aRefreshDirPath' }) //刷新路径
            })
          } else if (PanDAL.QuerySelectDir().file_id.startsWith('search') || PanDAL.QuerySelectDir().file_id.startsWith('favorite')) {
            if (this.props.isdir) PanDAL.GetDirFileList(token.user_id, file.drive_id, file.parent_file_id, true)
            window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true }) //强制刷新
          } else {
            window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true }) //强制刷新
          }

          message.success('重命名 成功')
        } else {
          message.error('重命名 失败')
        }
      })
      .catch((e: any) => {
        message.error('重命名 失败 ' + (e.message || ''))
      })
      .then(() => {
        this.props.modal.destroy()
      })
  }

  formRef = React.createRef<FormInstance>()
  render() {
    return (
      <>
        <Form ref={this.formRef} layout="vertical" preserve={false} name="form_in_modal">
          <Form.Item name="filename" initialValue={this.props.file.name}>
            <Input autoFocus allowClear onKeyDown={(e) => e.stopPropagation()} />
          </Form.Item>
        </Form>
        <div>
          <div className="settingrow">
            <span className="oporg">注：</span>文件名不要有特殊字符：<span className="opblue">{' < > : * ? \\ / \' " '}</span>
            <br />
            <br />
          </div>
        </div>
        <div className="flex flexnoauto">
          <div className="flexauto"></div>
          <Button key="back" onClick={(e) => this.props.modal.destroy()}>
            取消
          </Button>
          <div style={{ margin: '0 6px' }}></div>
          <Button type="primary" loading={this.state.loading} onClick={this.handleRename}>
            改名
          </Button>
        </div>
      </>
    )
  }
}
