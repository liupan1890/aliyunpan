import SettingLog from '@/setting/settinglog'
import { DownedList } from '@/store/downdal'
import { IStateDownFile } from '@/store/models'

import { Button, List, message } from 'antd'
import React from 'react'
import { AutoSizer, List as VList } from 'react-virtualized'
import { connect, DownModelState } from 'umi'
import './down.css'
import { topDeleteDowned, topDeleteDownedAll } from './downmenu'

const path = window.require('path')
const fs = window.require('fs')

class Downed extends React.Component<{ down: DownModelState; dispatch: any }, { selectedKey: string }> {
  constructor(props: any) {
    super(props)
    this.state = { selectedKey: '' }
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'Downed' + (error.message || ''))
      if (error.stack) SettingLog.mSaveLog('danger', error.stack)
    } catch {}
  }
  onSelectFile = (item: IStateDownFile, cmd: string) => {
    this.setState({ selectedKey: item.DownID })
    if (cmd == 'file') {
      if (item.Info.ariaRemote) {
        message.error('文件在远程Aria服务器上，不能在本地打开')
        return
      }
      const full = path.join(item.Info.DownSavePath, item.Info.name)
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
      if (item.Info.ariaRemote) {
        message.error('文件在远程Aria服务器上，不能在本地打开')
        return
      }
      const full = item.Info.DownSavePath
      try {
        if (fs.existsSync(full)) {
          message.loading('Loading...', 2)
          window.Electron.shell.showItemInFolder(path.join(item.Info.DownSavePath, item.Info.name))
        } else {
          message.error('文件夹可能已经被删除')
        }
      } catch {}
    }
    if (cmd == 'delete') {
      topDeleteDowned(item.DownID)
    }
  }
  renderItem = ({ index, key, style }: { index: number; key: string; style: any }) => {
    try {
      const item = DownedList[index]

      return (
        <div key={'dedl' + index} style={style} className={'downitem ' + (this.state.selectedKey == item.DownID ? ' selected ' : '')} onClick={(e) => this.onSelectFile(item, 'select')}>
          <div style={{ margin: '2px' }}></div>
          <div className="fileicon">
            <i className={'iconfont ' + item.Info.icon} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <div title={item.Info.DownSavePath}>{item.Info.name}</div>
          </div>
          <div className="filesize">{item.Info.sizestr}</div>
          <div className="filebtn2">
            <Button
              style={{ display: item.Info.ariaRemote ? 'none' : '' }}
              title="打开文件"
              className="select"
              onClick={() => this.onSelectFile(item, 'file')}
              icon={<i className="iconfont iconwenjian" />}></Button>
            <Button
              style={{ display: item.Info.ariaRemote ? 'none' : '' }}
              title="打开所在位置"
              className="select"
              onClick={() => this.onSelectFile(item, 'dir')}
              icon={<i className="iconfont iconfolder" />}></Button>
            <Button title="删除记录(不会删除文件)" className="select" onClick={() => this.onSelectFile(item, 'delete')} icon={<i className="iconfont icondelete" />}></Button>
          </div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'DownedRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'dedl' + index} style={style} className={'downitem'}></div>
    }
  }
  render() {
    const down = this.props.down
    return (
      <>
        <div className="toppanbtns" style={{ marginTop: '24px' }}>
          <div className="toppanbtn">
            <Button icon={<i className="iconfont icondelete" />} onClick={() => topDeleteDownedAll(true)}>
              清除全部下载记录
            </Button>
          </div>
        </div>
        <div id="DownRightSelected" className="RightSelected" tabIndex={1}>
          <div style={{ margin: '0 2px' }}></div>
          <div className="selectInfo">已成功下载 {DownedList.length} 个</div>
          <div style={{ flexGrow: 1 }}></div>
        </div>
        <div id="DownRightList" className="DownRightFileList">
          <List className="VList" style={{ display: DownedList.length <= 0 ? 'none' : '' }}>
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return (
                  <VList
                 
                    height={height}
                    width={width}
                    data1={down.ChangDownedTime}
                    data2={this.state.selectedKey}
                    overscanRowCount={2}
                    rowCount={DownedList.length}
                    rowHeight={50}
                    rowRenderer={this.renderItem}
                  />
                )
              }}
            </AutoSizer>
          </List>
          <div className="downHideTip" style={{ display: DownedList.length <= 0 ? '' : 'none' }}>
            <div style={{ marginTop: '100px' }}></div>
            <i className="iconfont iconempty down" />
            <br />
            没有 已下载 的任务
          </div>
        </div>
      </>
    )
  }
}

export default connect(({ down }: { down: DownModelState }) => ({
  down
}))(Downed)
