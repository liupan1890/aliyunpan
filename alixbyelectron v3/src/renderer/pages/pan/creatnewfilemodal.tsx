import AliFile from '@/aliapi/file'
import AliUploadMem from '@/aliapi/uploadmem'
import SettingLog from '@/setting/settinglog'
import PanDAL from '@/store/pandal'
import PanStore from '@/store/panstore'

import UserDAL from '@/store/userdal'
import { Button, Form, FormInstance, Input, message, Modal } from 'antd'
import React from 'react'

let _ShowCreatNewFileModal = false
export function ShowCreatNewFileModal(driveid: string, parentdirid: string) {
  if (_ShowCreatNewFileModal) return
  _ShowCreatNewFileModal = true
  setTimeout(() => {
    _ShowCreatNewFileModal = false
  }, 500)
  const userID = UserDAL.QueryUserID()
  if (!userID) {
    message.info('请先登录一个阿里云盘账号')
    return
  }
  const modal = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal creatfilemodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '740px', paddingBottom: '0', height: '80vh' }
  })

  modal.update({
    title: '新建文件',
    content: <CreatNewFile userID={userID} driveid={driveid} parentdirid={parentdirid} modal={modal} />
  })
}

class CreatNewFile extends React.Component<{ userID: string; driveid: string; parentdirid: string; modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean }> {
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

  handleOk = () => {
    let filename = (this.formRef.current?.getFieldValue('filename') as string) || ''
    filename = filename.trim()
    let filecontent = (this.formRef.current?.getFieldValue('filecontent') as string) || ''
    filecontent = filecontent.trim()

    const token = UserDAL.GetUserToken(this.props.userID)
    if (!token || !token.access_token) {
      message.error('新建文件失败 账号失效，操作取消')
      return
    }

    const dir = PanStore.GetDir(this.props.driveid, this.props.parentdirid)
    if (!dir.file_id) {
      message.error('新建文件失败 父文件夹错误')
      return
    }
    AliUploadMem.UploadMem(this.props.userID, dir.drive_id, dir.file_id, filename, filecontent)
      .then((data) => {
        if (data && data == 'success') {
          window.getDvaApp()._store.dispatch({ type: 'treedir/aSelectDir', drive_id: '', file_id: 'refresh', force: true })
          message.success('新建文件 成功')
          this.props.modal.destroy()
        } else {
          message.error('新建文件 失败 ' + data)
        }
      })
      .catch((e: any) => {
        message.error('新建文件 失败 ' + (e.message || ''))
      })
  }

  formRef = React.createRef<FormInstance>()
  render() {
    return (
      <>
        <Form ref={this.formRef} layout="vertical" preserve={false} name="form_in_modal">
          <Form.Item
            name="filename"
            label={
              <>
                文件名
                <span className="opblue" style={{ marginLeft: '16px', fontSize: '12px' }}>
                  {'不要有特殊字符 < > : * ? \\ / \' " '}
                </span>
              </>
            }>
            <Input autoFocus allowClear onKeyDown={(e) => e.stopPropagation()} placeholder="例如：19日干饭计划.txt" />
          </Form.Item>
          <Form.Item name="filecontent" label="文件内容">
            <Input.TextArea id="form_in_modal_filecontent" onKeyDown={(e) => e.stopPropagation()} showCount />
          </Form.Item>
        </Form>
        <div className="flex flexnoauto">
          <div className="flexauto"></div>
          <Button key="back" onClick={(e) => this.props.modal.destroy()}>
            取消
          </Button>
          <div style={{ margin: '0 6px' }}></div>
          <Button type="primary" loading={this.state.loading} onClick={this.handleOk}>
            创建
          </Button>
        </div>
      </>
    )
  }
}
