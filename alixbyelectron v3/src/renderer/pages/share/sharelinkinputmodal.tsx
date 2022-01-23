import AliShare from '@/aliapi/share'
import SettingLog from '@/setting/settinglog'

import UserDAL from '@/store/userdal'
import { Button, Form, FormInstance, Input, message, Modal } from 'antd'
import React from 'react'
import { ShowMultiShareModal } from './sharelinkmultimodal'
import { ShowShareTreeModal } from './sharelinktreemodal'

let _ShowInputShareModal = false
export function ShowInputShareModal() {
  if (_ShowInputShareModal) return
  _ShowInputShareModal = true
  setTimeout(() => {
    _ShowInputShareModal = false
  }, 500)
  const userID = UserDAL.QueryUserID()
  const token = UserDAL.GetUserToken(userID)
  if (!token || !token.access_token) {
    message.error('账号失效，操作取消')
    return
  }

  const modal = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal sharelinkmodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '540px', paddingBottom: '0' }
  })

  modal.update({
    title: '导入阿里云盘分享链接',
    content: <ShareLinkInput userID={userID} modal={modal} />
  })
}

class ShareLinkInput extends React.Component<{ userID: string; modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean }> {
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

  componentDidMount() {
    let text = window.Electron.clipboard.readText() as string
    let link = this.FixFormate(text, true)
    this.formRef.current?.setFieldsValue({ link: link.linktxt, password: link.linkpwd })
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }
  FixFormate(text: string, enmpty: boolean) {
    let linktxt = ''
    let linkpwd = ''
    if (text && text.indexOf('密码') >= 0) text = text.replaceAll('密码', '提取码')
    if (text && text.indexOf('提取码') >= 0) {
      text = text.replace('提取码:', '提取码').replace('提取码：', '提取码').replace('提取码 ', '提取码').trim()
      linkpwd = text.substr(text.indexOf('提取码') + '提取码'.length, 4)
    }

    if (text && text.length == 11) {
      linktxt = 'aliyundrive.com/s/' + text
    }

    if (text && text.indexOf('aliyundrive.com/s/') >= 0) {
      linktxt = 'aliyundrive.com/s/' + text.substr(text.indexOf('aliyundrive.com/s/') + 'aliyundrive.com/s/'.length, 11)
    }

    if (linktxt == '' && enmpty == false) linktxt = text
    return { linktxt, linkpwd }
  }

  onPaste = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    let text = window.Electron.clipboard.readText() as string
    let link = this.FixFormate(text, false)
    this.formRef.current?.setFieldsValue({ link: link.linktxt, password: link.linkpwd })
  }

  handleOk = async () => {
    let link = this.formRef.current?.getFieldValue('link') as string
    link = link.trim()

    let password = this.formRef.current?.getFieldValue('password') as string
    password = password.trim()

    if (link.indexOf('aliyundrive.com/s/') < 0) {
      message.error('解析链接出错，必须为 aliyundrive.com/s/xxxxxxxxxxx 格式的链接')
      return
    }
    this.setState({ loading: true })
    const sid = link.split(/\.com\/s\/([\w]+)/)[1]
    AliShare.ApiGetShareToken(sid, password)
      .then((sharetoken) => {
        this.setState({ loading: false })
        if (sharetoken == '' || sharetoken.startsWith('，')) {
          message.error('解析链接出错' + sharetoken)
        } else {
          this.props.modal.destroy()
          ShowShareTreeModal(this.props.userID, sid, password, sharetoken)
        }
      })
      .catch((e: any) => {
        this.setState({ loading: false })
        message.error(e.message)
      })
  }
  formRef = React.createRef<FormInstance>()
  render() {
    return (
      <>
        <div>
          <div className="settingrow">
            <span className="oporg">注：</span>当分享链接内文件较多时，需要<span className="opblue">等数小时</span>慢慢的导入！
            <br />
            不是小白羊导入时丢失文件！是阿里云盘执行慢！多等等文件就出来了！
            <br />
            <br />
          </div>
        </div>
        <Form ref={this.formRef} labelCol={{ span: 5 }} wrapperCol={{ span: 16 }} layout="horizontal" name="form_in_modal">
          <Form.Item label="分享链接" name="link">
            <Input autoFocus allowClear onPaste={this.onPaste} placeholder="例如：aliyundrive.com/s/umaDDMR7w4F" />
          </Form.Item>
          <Form.Item label="提取码" name="password">
            <Input allowClear style={{ maxWidth: '100px' }} placeholder="没有不填" />
          </Form.Item>
        </Form>

        <div className="flex">
          <div className="flexauto"></div>
          <a style={{ margin: '6px 24px 0 0' }} onClick={ShowMultiShareModal}>
            批量导入?
          </a>
          <Button key="back" onClick={(e) => this.props.modal.destroy()}>
            取消
          </Button>
          <div style={{ margin: '0 6px' }}></div>
          <Button type="primary" loading={this.state.loading} onClick={this.handleOk}>
            导入
          </Button>
        </div>
      </>
    )
  }
}
