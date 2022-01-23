import SettingAria from '@/setting/settingaria'
import SettingDown from '@/setting/settingdown'
import SettingLog from '@/setting/settinglog'
import DownDAL from '@/store/downdal'
import PanDAL from '@/store/pandal'

import { Button, Form, FormInstance, Input, message, Modal } from 'antd'
import React from 'react'

let _DownloadPan = false
export function DownloadPan(istree: boolean, dialogBack: boolean) {
  if (_DownloadPan) return
  _DownloadPan = true
  setTimeout(() => {
    _DownloadPan = false
  }, 500)
  let savepath = ''
  if (SettingAria.ariaState !== 'local') {
    savepath = SettingAria.ariaSavePath
    if (!savepath) {
      message.error('需要先设置Aria远程文件下载保存位置')
      return
    }
  } else {
    if (dialogBack == false && (SettingDown.downSavePathDefault == false || SettingDown.downSavePath == '')) {
      ShowSavePathModal(istree)
      return
    }
    savepath = SettingDown.downSavePath
    if (!savepath) {
      message.error('需要先设置文件下载保存的位置')
      return
    }
  }
  if (istree) {
    const selectDir = window.getDvaApp()._store.getState().pan.selectDir
    DownDAL.aAddDownloadDir(selectDir.drive_id, selectDir.file_id, savepath)
  } else {
    const filelist = PanDAL.QuerySelectedFileList()
    DownDAL.aAddDownload(filelist, savepath, true, true)
  }
}

export function ShowSavePathModal(istree: boolean) {
  const modal = Modal.info({
    closable: true,
    centered: true,
    className: 'dialogmodal savepathmodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '440px', paddingBottom: '0' }
  })

  modal.update({
    title: '选择下载保存位置',
    content: <SavePath istree={istree} modal={modal} />
  })
}

class SavePath extends React.Component<{ istree: boolean; modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean }> {
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

  handleSelectDownFolder = () => {
    if (window.WebShowOpenDialogSync) {
      window.WebShowOpenDialogSync(
        {
          title: '选择一个文件夹，把所有文件下载到此文件夹内',
          buttonLabel: '选择',
          properties: ['openDirectory', 'createDirectory'],
          defaultPath: SettingDown.downSavePath
        },
        (result: string[] | undefined) => {
          if (result && result[0]) {
            SettingDown.mSaveDownSavePath(result[0])
            this.formRef.current?.setFieldsValue({ downSavePath: result[0] })
          }
        }
      )
    }
  }

  handleOk = () => {
    DownloadPan(this.props.istree, true)
    this.props.modal.destroy()
  }

  formRef = React.createRef<FormInstance>()
  render() {
    return (
      <>
        <Form ref={this.formRef} layout="vertical" name="form_in_modal" initialValues={{ downSavePath: SettingDown.downSavePath }}>
          <Form.Item name="downSavePath" rules={[{ required: true, message: '下载保存位置不能是空的' }]}>
            <Input.Search readOnly={true} enterButton="更改" onSearch={this.handleSelectDownFolder} />
          </Form.Item>
        </Form>
        <div>
          <div className="settingrow">
            <span className="oporg">注：</span>是否自动附加网盘路径，可以在设置里修改
          </div>
        </div>
        <div className="flex flexnoauto">
          <div className="flexauto"></div>
          <Button key="back" onClick={(e) => this.props.modal.destroy()}>
            取消下载
          </Button>
          <div style={{ margin: '0 6px' }}></div>
          <Button type="primary" loading={this.state.loading} onClick={this.handleOk}>
            立即下载
          </Button>
        </div>
      </>
    )
  }
}
