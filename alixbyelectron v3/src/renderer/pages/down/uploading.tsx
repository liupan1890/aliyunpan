
import SettingDebug from '@/setting/settingdebug'
import SettingLog from '@/setting/settinglog'
import UploadDAL, { UploadingList } from '@/store/uploaddal'
import { Button, List, Tooltip } from 'antd'
import React from 'react'
import { AutoSizer, List as VList } from 'react-virtualized'
import { connect, UploadModelState } from 'umi'
import './down.css'
import { topDeleteDown, topDeleteDownAll, topOrderDown, topStartDown, topStartDownAll, topStopDown, topStopDownAll } from './downmenu'
function focusList() {
  let find = document.getElementsByClassName('ReactVirtualized__Grid')
  if (find && find.length > 0) {
    let doc = find[0] as HTMLElement
    doc.focus()
  }
}
class Uploading extends React.Component<{ upload: UploadModelState; dispatch: any }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'Uploading' + (error.message || ''))
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
    if (window.getDvaApp()._store.getState().global.currentPage !== 'UploadingRight') return

    if (event.target && event.target.nodeName == 'INPUT') return

    if (event.code == 'Enter') {
      event.stopPropagation()
      event.preventDefault()
      const IsDowning = UploadDAL.QuerySelectedIsUploading()
      if (IsDowning) topStopDown(false)
      else topStartDown(false)
      return
    }

    if (event.code == 'Escape') {
      event.stopPropagation()
      event.preventDefault()
      this.props.dispatch({ type: 'upload/mChangSelectedFile', file_id: '', ctrl: false, shift: false })
      return
    }

    if (event.code == 'KeyA' && event.ctrlKey) {
      this.props.dispatch({ type: 'upload/mChangSelectedFile', file_id: 'all', ctrl: false, shift: false })
      return
    }
  }
  onSelectAll = () => {
    this.props.dispatch({ type: 'upload/mChangSelectedFile', file_id: 'all', ctrl: false, shift: false })
  }
  onSelectFile = (event: any, UploadID: string, ctrl: boolean) => {
    event.stopPropagation()
    this.props.dispatch({ type: 'upload/mChangSelectedFile', file_id: UploadID, ctrl: ctrl || event.ctrlKey, shift: event.shiftKey })
  }

  onDoubleClick = (event: any, UploadID: string, IsDowning: boolean) => {
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({ type: 'upload/mChangSelectedFile', file_id: '', ctrl: false, shift: false })
    this.props.dispatch({ type: 'upload/mChangSelectedFile', file_id: UploadID, ctrl: false, shift: false })
    if (IsDowning) topStopDown(false)
    else topStartDown(false)
  }

  renderItem = ({ index, key, style }: { index: number; key: string; style: any }) => {
    try {
      const upload = this.props.upload
      const UploadID = upload.UploadingKeys[index]
      const item = UploadingList.get(UploadID) || {
        UploadID: '',
        Info: {
          userid: '',
          localFilePath: '',
          path: '',
          parent_id: '',
          drive_id: '',
          name: '',
          size: 0,
          sizestr: '',
          icon: '',
          isDir: false,
          isMiaoChuan: false,
          sha1: '',
          crc64: ''
        },
        Upload: {
          DownState: '',
          DownTime: 0,
          DownSize: 0,
          DownSpeed: 0,
          DownSpeedStr: '',
          DownProcess: 0,
          IsStop: false,
          IsDowning: false,
          IsCompleted: false,
          IsFailed: false,
          FailedCode: 0,
          FailedMessage: '',
          AutoTry: 0,
          upload_id: '',
          file_id: '',
          IsBreakExist: false
        }
      }

      return (
        <div
          key={'uingl' + index}
          style={style}
          className={'downitem ' + (upload.selectedFiles.has(item.UploadID) ? ' selected ' : '') + (item.Upload.IsDowning ? ' runing ' : '')}
          onClick={(e) => this.onSelectFile(e, item.UploadID, false)}
          onDoubleClick={(e) => this.onDoubleClick(e, item.UploadID, item.Upload.IsDowning)}>
          <div style={{ margin: '2px' }}>
            <Button
              tabIndex={-1}
              title={index.toString()}
              shape="circle"
              className="select"
              onClick={(e) => this.onSelectFile(e, item.UploadID, true)}
              icon={<i className={upload.selectedFiles.has(item.UploadID) ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}></Button>
          </div>
          <div className="fileicon">
            <i className={'iconfont ' + item.Info.icon} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <div title={item.Info.localFilePath}>{item.Info.name}</div>
          </div>
          <div className="filesize">{item.Info.sizestr}</div>
          <div className="downprogress">
            <div className="transfering-state">
              <p className="text-state">{item.Upload.DownState}</p>
              <div className="progress-total">
                <div
                  className={
                    item.Upload.IsDowning ? 'progress-current active' : item.Upload.IsCompleted ? 'progress-current succeed' : item.Upload.IsFailed ? 'progress-current error' : 'progress-current'
                  }
                  style={{ width: item.Upload.DownProcess.toString() + '%' }}></div>
              </div>
              <p className="text-error">{item.Upload.FailedMessage}</p>
            </div>
          </div>
          <div className="downspeed">{item.Upload.DownSpeedStr}</div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'UploadingRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'uingl' + index} style={style} className={'downitem'}></div>
    }
  }
  render() {
    const upload = this.props.upload
    return (
      <>
        <div className="toppanbtns" style={{ marginTop: '24px' }}>
          <div className="toppanbtn" style={{ display: upload.selectedFiles.size > 0 && upload.selectedFiles.size < UploadingList.size ? 'none' : '' }}>
            <Button icon={<i className="iconfont iconstart" />} onClick={() => topStartDownAll(false)}>
              开始全部
            </Button>
            <Button icon={<i className="iconfont iconpause" />} onClick={() => topStopDownAll(false)}>
              暂停全部
            </Button>
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDownAll(false)}>
              清除全部
            </Button>
          </div>
          <div className="toppanbtn" style={{ display: upload.selectedFiles.size > 0 && upload.selectedFiles.size < UploadingList.size ? '' : 'none' }}>
            <Button icon={<i className="iconfont iconstart" />} onClick={() => topStartDown(false)}>
              开始
            </Button>
            <Button icon={<i className="iconfont iconpause" />} onClick={() => topStopDown(false)}>
              暂停
            </Button>
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDown(false)}>
              清除
            </Button>
            <Button icon={<i className="iconfont iconyouxian" />} onClick={() => topOrderDown(false)}>
              优先传输
            </Button>
            <Button icon={<i className="iconfont icondian" />}></Button>
            <Button icon={<i className="iconfont iconstart" />} onClick={() => topStartDownAll(false)}>
              开始全部
            </Button>
            <Button icon={<i className="iconfont iconpause" />} onClick={() => topStopDownAll(false)}>
              暂停全部
            </Button>
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDownAll(false)}>
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
                icon={<i className={upload.selectedFiles.size > 0 && upload.selectedFiles.size == UploadingList.size ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}
                onClick={this.onSelectAll}></Button>
            </Tooltip>
          </div>
          <div className="selectInfo">
            已选中 {upload.selectedFiles.size} / {UploadingList.size} 个
          </div>

          <div style={{ flexGrow: 1 }}></div>
        </div>
        <div id="DownRightList" className="DownRightFileList">
          <List className="VList" style={{ display: upload.UploadingCount <= 0 ? 'none' : '' }}>
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return <VList height={height} width={width} data1={upload.ChangUploadingTime} overscanRowCount={2} rowCount={upload.UploadingCount} rowHeight={50} rowRenderer={this.renderItem} />
              }}
            </AutoSizer>
          </List>
          <div className="downHideTip" style={{ display: upload.UploadingCount <= 0 ? '' : 'none' }}>
            <div style={{ marginTop: '20%' }}></div>
            <i className="iconfont iconempty" />
            <br />
            没有 需要上传 的任务
          </div>
          <div className="downHideTip limite" style={{ display: UploadingList.size >= SettingDebug.debugDowningListMax ? '' : 'none' }}>
            只显示前 {SettingDebug.debugDowningListMax} 条记录，之后的先被省略...
          </div>
        </div>
      </>
    )
  }
}

export default connect(({ upload }: { upload: UploadModelState }) => ({
  upload
}))(Uploading)
