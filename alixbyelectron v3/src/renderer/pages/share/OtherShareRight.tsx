import SettingLog from '@/setting/settinglog'
import { IShareLinkModel } from '@/store/models'

import ShareDAL from '@/store/sharedal'
import { Alert, Button, Card, Menu, Dropdown, List, Popover, Tooltip, message, Modal } from 'antd'
import React from 'react'
import { AutoSizer, List as VList } from 'react-virtualized'
import { connect, ShareModelState } from 'umi'
import { ShowEditShareModal } from './editsharemodal'
import './share.css'
import { topCopyOtherShareLink, topDeleteOtherShare } from './sharemenu'
function focusList() {
  let find = document.getElementsByClassName('ReactVirtualized__Grid')
  if (find && find.length > 0) {
    let doc = find[0] as HTMLElement
    doc.focus()
  }
}
class OtherShareRight extends React.Component<{ share: ShareModelState; dispatch: any }> {
  constructor(props: any) {
    super(props)
    this.state = {}
  }
  componentDidCatch(error: Error, info: any) {
    try {
      SettingLog.mSaveLog('danger', 'MyShareRight' + (error.message || ''))
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
    if (window.getDvaApp()._store.getState().global.currentPage !== 'OtherShareRight') return

    if (event.code == 'F5' || (event.code == 'KeyR' && event.ctrlKey)) {
      event.stopPropagation()
      event.preventDefault()
      ShareDAL.aLoadFromDB()
      message.info('已刷新')
      return
    }

    if (event.target && event.target.nodeName == 'INPUT') return

    if (event.code == 'Enter') {
      event.stopPropagation()
      event.preventDefault()
      const filelist = ShareDAL.QuerySelectedOtherShareList()
      if (filelist.length >= 1) {
        ShowEditShareModal(false, [filelist[0]])
      }
      return
    }
    if (event.code == 'Escape') {
      event.stopPropagation()
      event.preventDefault()
      this.props.dispatch({ type: 'share/mChangSelectedOtherShare', file_id: '', ctrl: false, shift: false })
      return
    }
    if (event.code == 'KeyA' && event.ctrlKey) {
      this.props.dispatch({ type: 'share/mChangSelectedOtherShare', file_id: 'all', ctrl: false, shift: false })
      return
    }
  }
  onSelectAll = () => {
    this.props.dispatch({ type: 'share/mChangSelectedOtherShare', file_id: 'all', ctrl: false, shift: false })
  }
  onSelectFile = (event: any, share_id: string, ctrl: boolean) => {
    event.stopPropagation()
    this.props.dispatch({ type: 'share/mChangSelectedOtherShare', file_id: share_id, ctrl: ctrl || event.ctrlKey, shift: event.shiftKey })
  }
  onDelete = (delby: string) => {
    message.info('此版本暂不支持')
  }

  onOpenFile = (event: any, file: IShareLinkModel) => {
    event.stopPropagation()
    event.preventDefault()
    this.props.dispatch({
      type: 'share/mChangSelectedOtherShare',
      file_id: file.share_id,
      ctrl: false,
      shift: false,
      forceselect: true
    })
    ShowEditShareModal(false, [file])
  }

  handleRefresh = () => {
    ShareDAL.aLoadFromDB()
    message.info('已刷新')
  }

  renderItem = ({ index, key, style }: { index: number; key: string; style: any }) => {
    try {
      const share = this.props.share
      const item = share.OtherShareList[index]

      return (
        <div key={'msl' + index} style={style} className={'fileitem ' + (share.selectedOtherShares.has(item.share_id) ? ' selected ' : '')} onClick={(e) => this.onSelectFile(e, item.share_id, false)}>
          <div style={{ margin: '2px' }}>
            <Button
              title={index.toString()}
              shape="circle"
              className="select"
              onClick={(e) => this.onSelectFile(e, item.share_id, true)}
              icon={<i className={share.selectedOtherShares.has(item.share_id) ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}></Button>
          </div>
          <div className="fileicon">
            <i className={'iconfont iconlink2'} aria-hidden="true" role="img"></i>
          </div>
          <div className="filename">
            <div title={item.share_name} onClick={(e) => this.onOpenFile(e, item)}>
              {item.share_name}
            </div>
          </div>
          <div className="cell tiquma">{item.share_pwd}</div>

          {item.expired ? <div className="cell sharestate expired">过期已失效</div> : <div className="cell sharestate active">{item.share_msg}</div>}
          <div className="cell sharetime">{item.updated_at}</div>
        </div>
      )
    } catch (ex: any) {
      SettingLog.mSaveLog('danger', 'OtherShareRenderItem' + (ex.message ? ex.message : ex.toString()))
      return <div key={'msl' + index} style={style} className={'fileitem '}></div>
    }
  }
  render() {
    const share = this.props.share
    return (
      <>
        <div className="toppanbtns" style={{ marginTop: '24px' }}>
          <div className="toppanbtn" style={{ marginRight: '12px' }}>
            <Button icon={<i className="iconfont iconreload-1-icon" />} onClick={this.handleRefresh}>
              刷新
            </Button>
          </div>
          <div className="toppanbtn" style={{ display: share.selectedOtherShares.size > 0 ? '' : 'none' }}>
            <Button icon={<i className="iconfont iconlink2" />} onClick={() => topCopyOtherShareLink()}>
              导入分享
            </Button>
            <Button icon={<i className="iconfont iconfenxiang" />} onClick={() => topCopyOtherShareLink()}>
              复制链接
            </Button>
            <Button icon={<i className="iconfont icondelete" />} danger onClick={() => topDeleteOtherShare()}>
              删除记录
            </Button>
          </div>
        </div>
        <div id="MyShareRightSelected" className="RightSelected" tabIndex={1}>
          <div style={{ margin: '0 2px' }}>
            <Tooltip placement="left" title="点击全选">
              <Button
                shape="circle"
                className="select all"
                icon={<i className={share.selectedOtherShares.size > 0 && share.selectedOtherShares.size == share.OtherShareList.length ? 'iconfont iconrsuccess' : 'iconfont iconrpic'} />}
                onClick={this.onSelectAll}></Button>
            </Tooltip>
          </div>
          <div className="selectInfo">
            已选中 {share.selectedOtherShares.size} / {share.OtherShareList.length} 个
          </div>

          <div style={{ flexGrow: 1 }}></div>
          <div className="cell tiquma">提取码</div>
          <div className="cell sharestate">状态</div>
          <div className="cell sharetime">更新时间</div>
          <div className="cell p10"></div>
        </div>
        <div id="MyShareRightList" className="DownRightFileList">
          <List className="VList" style={{ display: share.OtherShareList.length <= 0 ? 'none' : '' }}>
            <AutoSizer>
              {({ width, height }: { width: number; height: number }) => {
                return <VList height={height} width={width} data1={share.refresh} data2={share.selectedOtherShares} overscanRowCount={2} rowCount={share.OtherShareList.length} rowHeight={50} rowRenderer={this.renderItem} />
              }}
            </AutoSizer>
          </List>
          <div className="downHideTip" style={{ display: share.OtherShareList.length <= 0 ? '' : 'none' }}>
            <div style={{ marginTop: '100px' }}></div>
            <i className="iconfont iconempty down" />
            <br />
            还没有导入过 分享链接
          </div>
        </div>
      </>
    )
  }
}

export default connect(({ share }: { share: ShareModelState }) => ({
  share
}))(OtherShareRight)
