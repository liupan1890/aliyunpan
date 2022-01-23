import SettingDebug from '@/setting/settingdebug'
import SettingLog from '@/setting/settinglog'
import DownDAL, { DowningList } from '@/store/downdal'

import { Button, List, Tooltip } from 'antd'
import React from 'react'
import { AutoSizer, List as VList } from 'react-virtualized'
import { connect, DownModelState } from 'umi'
import './down.css'
import { topDeleteDown, topDeleteDownAll, topOrderDown, topStartDown, topStartDownAll, topStopDown, topStopDownAll } from './downmenu'
function focusList() {
  let find = document.getElementsByClassName('ReactVirtualized__Grid')
  if (find && find.length > 0) {
    let doc = find[0] as HTMLElement
    doc.focus()
  }
}
class Downing extends React.Component<{ down: DownModelState; dispatch: any }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'Downing' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp)
    window.addEventListener('keydown', this.onKeyDown)

    focusList()
  }
  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = (event: any) => {
    if (event.code == 'Space') {
      event.preventDefault()
    }
  }
  onKeyUp = (event: any) => {
    if (document.getElementsByClassName('ant-modal-root').length > 0) return
    if (window.getDvaApp()._store.getState().global.currentPage !== 'DowningRight') return

    if (event.target && event.target.nodeName == 'INPUT') return

    if (event.code == 'Enter') {
      event.stopPropagation()
      event.preventDefault()
      const IsDowning = DownDAL.QuerySelectedIsDowning()
      if (IsDowning) topStopDown(true)
      else topStartDown(true)
      return
    }

    if (event.code == 'Escape') {
      event.stopPropagation()
      event.preventDefault()
      this.props.dispatch({ type: 'down/mChangSelectedFile', file_id: '', ctrl: false, shift: false })
      return
    }

    if (event.code == 'KeyA' && event.ctrlKey) {
      this.props.dispatch({ type: 'down/mChangSelectedFile', file_id: 'all', ctrl: false, shift: false })
      return
    }
  }

  onSelectAll = () => {
    this.props.dispatch({ type: 'down/mChangSelectedFile', file_id: 'all', ctrl: false, shift: false })
  }
  onSelectFile = (event: any, DownID: string, ctrl: boolean) => {
    event.stopPropagation()
    this.props.dispatch({ type: 'down/mChangSelectedFile', file_id: DownID, ctrl: ctrl || event.ctrlKey, shift: event.shiftKey })
  }

  onDoubleClick = (event: any, DownID: string, IsDowning: boolean) => {
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({ type: 'down/mChangSelectedFile', file_id: '', ctrl: false, shift: false })
    this.props.dispatch({ type: 'down/mChangSelectedFile', file_id: DownID, ctrl: false, shift: false })
    if (IsDowning) topStopDown(true)
    else topStartDown(true)
  }

  renderItem = ({ index, key, style }: { index: number; key: string; style: any }) => {
    try {
      const down = this.props.down
      const DownID = down.DowningKeys[index]
      const item = DowningList.get(DownID) || {
        DownID: '',
        Info: {
          GID: '',
          userid: '',
          DownSavePath: '',
          ariaRemote: false,
          file_id: '',
          drive_id: '',
          name: '',
          size: 0,
          sizestr: '',
          icon: '',
          isDir: false,
          sha1: '',
          crc64: ''
        },
        Down: {
          DownState: '',
          DownTime: 0,
          DownSize: 0,
          DownSpeed: 0,
          DownSpeedStr: '',
          DownProcess: 0,
          IsStop: true,
          IsDowning: false,
          IsCompleted: false,
          IsFailed: false,
          FailedCode: 0,
          FailedMessage: '',
          AutoTry: 0,
          DownUrl: ''
        }
      }

      return (
        <div
          key={'dingl' + index}
          style={style}
          className={'downitem ' + (down.selectedFiles.has(item.DownID) ? ' selected ' : '') + (item.Down.IsDowning ? ' runing ' : '')}
          onClick={(e) => this.onSelectFile(e, item.DownID, false)}
          onDoubleClick={(e) => this.onDoubleClick(e, item.DownID, item.Down.IsDowning)}>
          <div style={{ margin: '2px' }}>
            <Button
              tabIndex={-1}
              title={index.toString()}
              shape="circle"
              className="select"
              onClick={(e) => this.onSelectFile(e, item.DownID, true)}
              icon={<i className={down.selectedFiles.has(item.DownID) ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}></Button>
          </div>
          <div className="fileicon">
            <i className={'iconfont ' + item.Info.icon} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <div title={item.Info.DownSavePath}>{item.Info.name}</div>
          </div>
          <div className="filesize">{item.Info.sizestr}</div>
          <div className="downprogress">
            <div className="transfering-state">
              <p className="text-state">{item.Down.DownState}</p>
              <div className="progress-total">
                <div
                  className={item.Down.IsDowning ? 'progress-current active' : item.Down.IsCompleted ? 'progress-current succeed' : item.Down.IsFailed ? 'progress-current error' : 'progress-current'}
                  style={{ width: item.Down.DownProcess.toString() + '%' }}></div>
              </div>
              <p className="text-error">{item.Down.FailedMessage}</p>
            </div>
          </div>
          <div className="downspeed">{item.Down.DownSpeedStr}</div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'DowningRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'dingl' + index} style={style} className={'downitem'}></div>
    }
  }
  render() {
    const down = this.props.down
    return (
      <>
        <div className="toppanbtns" style={{ marginTop: '24px' }}>
          <div className="toppanbtn" style={{ display: down.selectedFiles.size > 0 && down.selectedFiles.size < DowningList.size ? 'none' : '' }}>
            <Button icon={<i className="iconfont iconstart" />} onClick={() => topStartDownAll(true)}>
              开始全部
            </Button>
            <Button icon={<i className="iconfont iconpause" />} onClick={() => topStopDownAll(true)}>
              暂停全部
            </Button>
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDownAll(true)}>
              清除全部
            </Button>
          </div>
          <div className="toppanbtn" style={{ display: down.selectedFiles.size > 0 && down.selectedFiles.size < DowningList.size ? '' : 'none' }}>
            <Button icon={<i className="iconfont iconstart" />} onClick={() => topStartDown(true)}>
              开始
            </Button>
            <Button icon={<i className="iconfont iconpause" />} onClick={() => topStopDown(true)}>
              暂停
            </Button>
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDown(true)}>
              清除
            </Button>
            <Button icon={<i className="iconfont iconyouxian" />} onClick={() => topOrderDown(true)}>
              优先传输
            </Button>
            <Button icon={<i className="iconfont icondian" />}></Button>

            <Button icon={<i className="iconfont iconstart" />} onClick={() => topStartDownAll(true)}>
              开始全部
            </Button>
            <Button icon={<i className="iconfont iconpause" />} onClick={() => topStopDownAll(true)}>
              暂停全部
            </Button>
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDownAll(true)}>
              清除全部
            </Button>
          </div>
        </div>
        <div id="DownRightSelected" className="RightSelected" tabIndex={1}>
          <div style={{ margin: '0 2px' }}>
            <Tooltip placement="left" title="点击全选">
              <Button
                shape="circle"
                className="select all"
                icon={<i className={down.selectedFiles.size > 0 && down.selectedFiles.size == DowningList.size ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}
                onClick={this.onSelectAll}></Button>
            </Tooltip>
          </div>
          <div className="selectInfo">
            已选中 {down.selectedFiles.size} / {DowningList.size} 个
          </div>

          <div style={{ flexGrow: 1 }}></div>
        </div>
        <div id="DownRightList" className="DownRightFileList">
          <List className="VList" style={{ display: down.DowningCount <= 0 ? 'none' : '' }}>
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return <VList height={height} width={width} data1={down.ChangDowningTime} overscanRowCount={2} rowCount={down.DowningCount} rowHeight={50} rowRenderer={this.renderItem} />
              }}
            </AutoSizer>
          </List>
          <div className="downHideTip" style={{ display: down.DowningCount <= 0 ? '' : 'none' }}>
            <div style={{ marginTop: '20%' }}></div>
            <i className="iconfont iconempty" />
            <br />
            没有 需要下载 的任务
          </div>
          <div className="downHideTip limite" style={{ display: DowningList.size >= SettingDebug.debugDowningListMax ? '' : 'none' }}>
            只显示前 {SettingDebug.debugDowningListMax} 条记录，之后的先被省略...
          </div>
        </div>
      </>
    )
  }
}

export default connect(({ down }: { down: DownModelState }) => ({
  down
}))(Downing)
