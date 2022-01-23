import SettingLog from '@/setting/settinglog'
import { Button, Modal, Progress } from 'antd'
import React from 'react'

let _ShowShutDownModal = false
export function ShowShutDownModal() {
  if (_ShowShutDownModal) return
  _ShowShutDownModal = true

  const modal = Modal.info({
    closable: false,
    centered: true,
    className: 'dialogmodal creatfoldermodal',
    icon: undefined,
    autoFocusButton: undefined,
    width: '80vw',
    style: { maxWidth: '340px', paddingBottom: '0' }
  })

  modal.update({
    title: '传输完成后自动关机',
    content: <ShutDown modal={modal} />
  })
}

class ShutDown extends React.Component<{ modal: { destroy: () => void; update: (configUpdate: any) => void } }, { loading: boolean; time: number; percent: number }> {
  constructor(props: any) {
    super(props)

    this.state = { loading: false, time: 60, percent: 0 }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'ShutDown' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }

  componentDidMount() {
    const subtime = () => {
      let time = this.state.time - 1
      let percent = Math.ceil(((60 - time) * 100) / 60)
      this.setState({ time, percent })
      if (time == 1) {
        _ShowShutDownModal = false
        window.WebShutDown({ quitapp: true })
      } else if (time > 1) setTimeout(subtime, 1000)
    }
    setTimeout(subtime, 1000)
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return
    }
  }

  handleClose = () => {
    _ShowShutDownModal = false
    this.setState({ time: -1, percent: -1 })
    this.props.modal.destroy()
  }

  render() {
    return (
      <div>
        <div className="flex flexnoauto" style={{ justifyContent: 'center', alignItems: 'center', marginBottom: '32px' }}>
          <Progress type="circle" percent={this.state.percent} format={(percent) => `${this.state.time} 秒`} />
        </div>
        <div className="flex flexnoauto" style={{ justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
          <Button key="back" onClick={this.handleClose}>
            取消自动关机
          </Button>
        </div>
      </div>
    )
  }
}
