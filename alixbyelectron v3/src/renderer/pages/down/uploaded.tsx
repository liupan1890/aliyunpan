import SettingDebug from '@/setting/settingdebug'
import SettingLog from '@/setting/settinglog'
import { IStateUploadFile } from '@/store/models'

import { UploadedList } from '@/store/uploaddal'
import { Button, List, message } from 'antd'
import React from 'react'
import { AutoSizer, List as VList } from 'react-virtualized'
import { connect, UploadModelState } from 'umi'
import './down.css'
import { topDeleteDownedAll, topDeleteUploaded } from './downmenu'

const fs = window.require('fs')
class Uploaded extends React.Component<{ upload: UploadModelState; dispatch: any }, { selectedKey: string }> {
  constructor(props: any) {
    super(props)
    this.state = { selectedKey: '' }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'Uploaded' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  onSelectFile = (item: IStateUploadFile, cmd: string) => {
    this.setState({ selectedKey: item.UploadID })
    if (cmd == 'file') {
      const full = item.Info.localFilePath
      try {
        if (fs.existsSync(full)) {
          message.loading('Loading...', 2)
          window.Electron.shell.openPath(full)
        } else {
          message.error('文件可能已经被删除')
        }
      } catch {}
    }
    if (cmd == 'dir') {
      const full = item.Info.localFilePath
      try {
        if (fs.existsSync(full)) {
          message.loading('Loading...', 2)
          window.Electron.shell.showItemInFolder(full)
        } else {
          message.error('文件夹可能已经被删除')
        }
      } catch {}
    }
    if (cmd == 'delete') {
      topDeleteUploaded(item.UploadID)
    }
  }
  renderItem = ({ index, key, style }: { index: number; key: string; style: any }) => {
    try {
      const item = UploadedList[index]

      return (
        <div key={'uedl' + index} style={style} className={'downitem ' + (this.state.selectedKey == item.UploadID ? ' selected ' : '')} onClick={(e) => this.onSelectFile(item, 'select')}>
          <div style={{ margin: '2px' }}></div>
          <div className="fileicon">
            <i className={'iconfont ' + item.Info.icon} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <div title={item.Info.localFilePath}>{item.Info.name}</div>
          </div>
          <div className="filesize">{item.Info.sizestr}</div>
          <div className="filebtn2">
            <Button
              style={{ display: item.Info.isMiaoChuan ? 'none' : '' }}
              title="打开文件"
              className="select"
              onClick={() => this.onSelectFile(item, 'file')}
              icon={<i className="iconfont iconwenjian" />}></Button>
            <Button
              style={{ display: item.Info.isMiaoChuan ? 'none' : '' }}
              title="打开所在位置"
              className="select"
              onClick={() => this.onSelectFile(item, 'dir')}
              icon={<i className="iconfont iconfolder" />}></Button>
            <Button title="删除记录(不会删除文件)" className="select" onClick={() => this.onSelectFile(item, 'delete')} icon={<i className="iconfont icondelete" />}></Button>
          </div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'UploadingRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'uedl' + index} style={style} className={'downitem'}></div>
    }
  }
  render() {
    const upload = this.props.upload
    return (
      <>
        <div className="toppanbtns" style={{ marginTop: '24px' }}>
          <div className="toppanbtn">
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDownedAll(false)}>
              清除全部上传记录
            </Button>
          </div>
        </div>
        <div id="DownRightSelected" className="RightSelected" tabIndex={1}>
          <div style={{ margin: '0 2px' }}></div>
          <div className="selectInfo">已成功上传 {UploadedList.length} 个</div>
          <div style={{ flexGrow: 1 }}></div>
        </div>
        <div id="DownRightList" className="DownRightFileList">
          <List className="VList" style={{ display: UploadedList.length <= 0 ? 'none' : '' }}>
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return (
                  <VList
                    height={height}
                    width={width}
                    data1={upload.ChangUploadedTime}
                    data2={this.state.selectedKey}
                    overscanRowCount={2}
                    rowCount={UploadedList.length}
                    rowHeight={50}
                    rowRenderer={this.renderItem}
                  />
                )
              }}
            </AutoSizer>
          </List>
          <div className="downHideTip" style={{ display: UploadedList.length <= 0 ? '' : 'none' }}>
            <div style={{ marginTop: '100px' }}></div>
            <i className="iconfont iconempty down" />
            <br />
            没有 已上传 的任务
          </div>
          <div className="downHideTip limite" style={{ display: UploadedList.length > SettingDebug.debugDownedListMax ? '' : 'none' }}>
            只显示前 {SettingDebug.debugDownedListMax} 条记录，之后的先被省略...
          </div>
        </div>
      </>
    )
  }
}

export default connect(({ upload }: { upload: UploadModelState }) => ({
  upload
}))(Uploaded)
